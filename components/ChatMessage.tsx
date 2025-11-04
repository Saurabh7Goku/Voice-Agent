import React from 'react';
import { User, Bot, Mic } from 'lucide-react';

// Types
interface Message {
  role: 'user' | 'agent';
  text: string;
}

// ChatMessage Component
const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isAgent = message.role === 'agent';

  return (
    <div className={`flex items-start gap-4 ${isAgent ? 'justify-start' : 'justify-end'} animate-fade-in`}>
      {isAgent && (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-blue-200">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'} max-w-[75%]`}>
        <div
          className={`px-5 py-3.5 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg ${isAgent
            ? 'bg-white/95 backdrop-blur-sm border border-blue-100 text-gray-800 rounded-tl-md'
            : 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-md'
            }`}
        >
          <p className="text-[15px] leading-relaxed break-words">{message.text}</p>
        </div>
        <span className={`text-xs mt-1.5 px-2 ${isAgent ? 'text-gray-500' : 'text-blue-700'}`}>
          {isAgent ? 'Agent' : 'You'}
        </span>
      </div>

      {!isAgent && (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-blue-300">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

// MicButton Component
const MicButton: React.FC<{
  onClick: () => void;
  isListening: boolean;
  isConnecting: boolean;
  isConnected: boolean;
}> = ({ onClick, isListening, isConnecting, isConnected }) => {
  return (
    <button
      onClick={onClick}
      disabled={isConnecting || !isConnected}
      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${isListening
        ? 'bg-gradient-to-br from-red-500 to-red-600 scale-110 animate-pulse'
        : 'bg-gradient-to-br from-blue-600 to-blue-500 hover:scale-105'
        }`}
    >
      <Mic className={`w-8 h-8 text-white ${isListening ? 'animate-pulse' : ''}`} />
    </button>
  );
};

// VoiceVisualizer Component
const VoiceVisualizer: React.FC<{
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}> = ({ analyserNode, isActive }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!canvasRef.current || !analyserNode || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#60a5fa');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [analyserNode, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={80}
      className="w-full h-full"
    />
  );
};

export default ChatMessage;