import React from 'react';
import { useLiveAgent } from './hooks/useLiveAgent';
import ChatMessage from './components/ChatMessage';
import MicButton from './components/MicButton';
import VoiceVisualizer from './components/VoiceVisualizer';
import { Radio, Power, PowerOff } from 'lucide-react';

const App: React.FC = () => {
  const {
    messages,
    isListening,
    isSpeaking,
    isConnecting,
    isConnected,
    startConversation,
    stopConversation,
    inputAnalyser,
    outputAnalyser,
  } = useLiveAgent();

  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleConversation = () => {
    if (isConnected || isConnecting) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  const activeAnalyser = isListening ? inputAnalyser : (isSpeaking ? outputAnalyser : null);
  const showWelcome = messages.length === 0 && !isConnected;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b-2 border-blue-200 bg-white/80 backdrop-blur-md shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              Voice Agent
            </h1>
            <p className="text-sm text-blue-600/70">Powered by Goku's AI Model</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-semibold text-white">Live</span>
            </div>
          )}

          {/* Wake Up / Shutdown Button */}
          <button
            onClick={toggleConversation}
            disabled={isConnecting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${isConnected
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {isConnected ? (
              <>
                <PowerOff className="w-4 h-4" />
                Shutdown
              </>
            ) : (
              <>
                <Power className="w-4 h-4" />
                Wake Up
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 py-6">
          {/* Messages Container - Full Screen */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-200">
            {showWelcome ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mb-8 shadow-2xl">
                  <Radio className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent mb-4">
                  Welcome to Voice Agent
                </h2>
                <p className="text-blue-700/80 text-lg max-w-2xl mb-12 leading-relaxed">
                  Click the <span className="font-semibold text-blue-600">Wake Up</span> button to start a natural, real-time conversation with AI.
                  The agent will listen and respond to you instantly.
                </p>
                <div className="flex items-center gap-8 text-sm text-blue-600/70">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    </div>
                    <span className="font-medium">Real-time Voice</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    </div>
                    <span className="font-medium">Natural Conversation</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    </div>
                    <span className="font-medium">AI-Powered</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
                {messages.map((msg, index) => (
                  <ChatMessage key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Controls Section */}
          {isConnected && (
            <div className="flex flex-col items-center gap-4 pt-6">
              {/* Voice Visualizer */}
              <div className="w-full max-w-3xl h-24 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-blue-200 overflow-hidden p-4 shadow-lg">
                <VoiceVisualizer
                  analyserNode={activeAnalyser}
                  isActive={isListening || isSpeaking}
                />
              </div>

              {/* Status Text and Mic Button */}
              <div className="flex items-center gap-6">
                <div className="text-center min-w-[120px]">
                  <p className="text-sm font-semibold text-blue-700">
                    {isListening && !isSpeaking && "🎤 Listening..."}
                    {isSpeaking && "🔊 Speaking..."}
                    {!isListening && !isSpeaking && "⏸️ Ready"}
                  </p>
                </div>

                <MicButton
                  onClick={() => { }} // Mic button for visual feedback only
                  isListening={isListening || isSpeaking}
                  isConnecting={isConnecting}
                  isConnected={isConnected}
                />

                <div className="min-w-[120px]" /> {/* Spacer for symmetry */}
              </div>

              <p className="text-xs text-blue-600/60 text-center max-w-md">
                Use the <span className="font-semibold">Shutdown</span> button in the header to end the conversation
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;