import React from 'react';

interface AgentOrbProps {
  isConnecting: boolean;
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

const AgentOrb: React.FC<AgentOrbProps> = ({ isConnecting, isConnected, isListening, isSpeaking }) => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer glow rings */}
      {isConnected && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 animate-pulse blur-xl" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 animate-pulse blur-lg" style={{ animationDelay: '0.5s' }} />
        </>
      )}

      {/* Main Orb */}
      <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br transition-all duration-500 shadow-2xl ${isConnected
          ? 'from-blue-500 to-cyan-500 shadow-blue-500/50'
          : 'from-gray-700 to-gray-800 shadow-gray-700/50'
        }`}>
        {/* Inner gradient overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-white/20 to-transparent" />

        {/* Animated border for states */}
        {isListening && (
          <div className="absolute -inset-1 rounded-full border-2 border-cyan-400 animate-ping" />
        )}
        {isSpeaking && (
          <div className="absolute -inset-1 rounded-full border-2 border-blue-400 animate-pulse" />
        )}
        {isConnecting && (
          <div className="absolute -inset-1 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-cyan-400 animate-spin" />
        )}

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-10 h-10 transition-all duration-500 ${isConnected ? 'text-white' : 'text-gray-500'
              }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>
      </div>

      {/* Connecting spinner overlay */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 h-28 border-4 border-t-cyan-400 border-r-blue-400 border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default AgentOrb;