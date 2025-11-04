import React from 'react';
import { Mic, Loader2 } from 'lucide-react';

interface MicButtonProps {
  onClick: () => void;
  isListening: boolean;
  isConnecting: boolean;
  isConnected: boolean;
}

const MicButton: React.FC<MicButtonProps> = ({ onClick, isListening, isConnecting, isConnected }) => {
  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      className={`relative w-20 h-20 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl ${isListening
          ? 'bg-gradient-to-br from-blue-600 to-blue-500 animate-pulse'
          : 'bg-gradient-to-br from-blue-600 to-blue-400'
        }`}
      aria-label="Microphone status"
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {isConnecting ? (
          <Loader2 className="w-9 h-9 text-white animate-spin" />
        ) : (
          <Mic className="w-9 h-9 text-white" />
        )}
      </div>

      {/* Pulse ring when active */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-blue-400/40 animate-ping" />
          <div className="absolute -inset-2 rounded-full border-4 border-blue-400/50 animate-pulse" />
        </>
      )}

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent" />
    </button>
  );
};

export default MicButton;