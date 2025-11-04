import React, { useRef, useEffect } from 'react';

interface VoiceVisualizerProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ analyserNode, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      const { width, height } = canvas;
      canvasCtx.clearRect(0, 0, width, height);

      if (!analyserNode || !isActive) {
        // Draw subtle idle bars
        const barCount = 50;
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
          const barHeight = 6 + Math.sin(Date.now() / 800 + i * 0.3) * 3;

          const gradient = canvasCtx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');

          canvasCtx.fillStyle = gradient;

          const x = i * barWidth;
          const y = (height - barHeight) / 2;

          canvasCtx.fillRect(x + 1, y, barWidth - 2, barHeight);
        }
        return;
      }

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      const barCount = 50;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount);
        const barHeight = Math.max(6, (dataArray[dataIndex] / 255) * height * 0.85);

        const gradient = canvasCtx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.7)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.9)');
        gradient.addColorStop(1, 'rgba(96, 165, 250, 1)');

        canvasCtx.fillStyle = gradient;

        const x = i * barWidth;
        const y = (height - barHeight) / 2;

        canvasCtx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvasCtx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode, isActive]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default VoiceVisualizer;