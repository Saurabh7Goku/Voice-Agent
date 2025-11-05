import { useState, useRef, useCallback, useEffect } from 'react';
// FIX: LiveSession is not exported from @google/genai, so we import Blob and define a local interface.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Message } from '../types';
import { decode, decodeAudioData, createAudioBlob } from '../utils/audioUtils';

// FIX: Define the LiveSession interface locally as it's not exported from @google/genai.
interface LiveSession {
  sendRealtimeInput(input: { media: Blob }): void;
  close(): void;
}

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const BUFFER_SIZE = 4096;

export const useLiveAgent = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', text: 'Hello! Press the microphone button to start our conversation.' }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [inputAnalyser, setInputAnalyser] = useState<AnalyserNode | null>(null);
  const [outputAnalyser, setOutputAnalyser] = useState<AnalyserNode | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const turnStateRef = useRef<'idle' | 'user' | 'agent'>('idle');
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  let nextStartTime = 0;

  const playAudio = useCallback(async (base64Audio: string) => {
    const audioCtx = outputAudioContextRef.current;
    const analyser = outputAnalyser;
    if (!audioCtx || !analyser) return;

    // Ensure the audio context is running, as browsers may suspend it.
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    setIsSpeaking(true);

    nextStartTime = Math.max(nextStartTime, audioCtx.currentTime);

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioCtx,
      OUTPUT_SAMPLE_RATE,
      1,
    );

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    source.addEventListener('ended', () => {
      audioSourcesRef.current.delete(source);
      if (audioSourcesRef.current.size === 0) {
        setIsSpeaking(false);
      }
    });

    source.start(nextStartTime);
    nextStartTime += audioBuffer.duration;
    audioSourcesRef.current.add(source);
  }, [outputAnalyser]);

  const stopAudioPlayback = useCallback(() => {
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { /* Already stopped */ }
    });
    audioSourcesRef.current.clear();
    nextStartTime = 0;
    setIsSpeaking(false);
  }, []);

  const handleServerMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.serverContent) {
      if (message.serverContent.inputTranscription) {
        const text = message.serverContent.inputTranscription.text;
        if (turnStateRef.current !== 'user') {
          turnStateRef.current = 'user';
          setMessages(prev => [...prev, { role: 'user', text }]);
        } else {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + text }];
          });
        }
      }

      if (message.serverContent.outputTranscription) {
        const text = message.serverContent.outputTranscription.text;
        if (turnStateRef.current !== 'agent') {
          turnStateRef.current = 'agent';
          setMessages(prev => [...prev, { role: 'agent', text }]);
        } else {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + text }];
          });
        }
      }

      const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
      if (audioData) {
        await playAudio(audioData);
      }

      if (message.serverContent.interrupted) {
        stopAudioPlayback();
      }

      if (message.serverContent.turnComplete) {
        turnStateRef.current = 'idle';
      }
    }
  }, [playAudio, stopAudioPlayback]);

  // Ref to hold the latest message handler, preventing stale closures.
  const handleServerMessageRef = useRef(handleServerMessage);
  useEffect(() => {
    handleServerMessageRef.current = handleServerMessage;
  }, [handleServerMessage]);


  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    turnStateRef.current = 'idle';

    if (messages.length === 1 && messages[0].text.includes('Press the microphone')) {
      setMessages([{ role: 'agent', text: 'Initializing connection...' }]);
    }

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });

      const inAnalyser = inputAudioContextRef.current.createAnalyser();
      inAnalyser.fftSize = 2048;
      setInputAnalyser(inAnalyser);

      const outAnalyser = outputAudioContextRef.current.createAnalyser();
      outAnalyser.fftSize = 2048;
      setOutputAnalyser(outAnalyser);

      microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsConnected(true);
            setIsListening(true);

            setMessages([{ role: 'agent', text: 'I\'m listening!' }]);

            const source = inputAudioContextRef.current!.createMediaStreamSource(microphoneStreamRef.current!);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(BUFFER_SIZE, 1, 1);

            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createAudioBlob(inputData);
              // FIX: Per coding guidelines, solely rely on the session promise to resolve, avoiding extra checks.
              sessionPromiseRef.current!.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(inAnalyser);
            inAnalyser.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: (message) => handleServerMessageRef.current(message),
          onerror: (e: ErrorEvent) => {
            console.error("Session error:", e);
            setMessages(prev => [...prev, { role: 'agent', text: 'Sorry, a connection error occurred.' }]);
            stopConversation();
          },
          onclose: () => {
            stopConversation();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aditi' } },
          },
          systemInstruction: 'You are a friendly and empathetic voice agent. Your responses should be conversational, natural, and concise.',
        },
      });

    } catch (error) {
      console.error("Failed to start conversation:", error);
      setMessages(prev => [...prev, { role: 'agent', text: 'I couldn\'t access the microphone. Please check permissions and try again.' }]);
      setIsConnecting(false);
    }
  }, [messages]);

  const stopConversation = useCallback(() => {
    setIsListening(false);
    setIsConnected(false);
    setIsConnecting(false);
    stopAudioPlayback();

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close()).catch(console.error);
      sessionPromiseRef.current = null;
    }

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close().catch(console.error);
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close().catch(console.error);
      outputAudioContextRef.current = null;
    }
    setInputAnalyser(null);
    setOutputAnalyser(null);

  }, [stopAudioPlayback]);

  useEffect(() => {
    return () => {
      stopConversation();
    }
  }, [stopConversation]);

  return { messages, isListening, isSpeaking, isConnecting, isConnected, startConversation, stopConversation, inputAnalyser, outputAnalyser };
};
