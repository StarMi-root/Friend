import React, { useState, useEffect } from 'react';

interface CameraAnimationProps {
  onComplete: (imageData: string) => void;
  onCancel: () => void;
}

export const CameraAnimation: React.FC<CameraAnimationProps> = ({ onComplete, onCancel }) => {
  const [phase, setPhase] = useState<'arriving' | 'ready' | 'captured'>('arriving');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('ready');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCapture = () => {
    // Use webcam if available, otherwise generate placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a stylish placeholder image
      const gradient = ctx.createLinearGradient(0, 0, 640, 480);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 640, 480);
      
      // Add camera grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(640 * i / 3, 0);
        ctx.lineTo(640 * i / 3, 480);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 480 * i / 3);
        ctx.lineTo(640, 480 * i / 3);
        ctx.stroke();
      }
      
      // Add Canon watermark
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '14px serif';
      ctx.fillText('Canon EOS R50', 20, 460);
      
      // Add timestamp
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px monospace';
      ctx.fillText(new Date().toLocaleString(), 440, 460);
      
      // Center circle (focus point)
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(320, 240, 40, 0, Math.PI * 2);
      ctx.stroke();
      
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      setPhase('captured');
    }
  };

  const handleWebcamCapture = () => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.play();
        setTimeout(() => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, 640, 480);
            // Add Canon watermark
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '14px serif';
            ctx.fillText('Canon EOS R50', 20, 460);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
            setPhase('captured');
          }
          stream.getTracks().forEach(t => t.stop());
        }, 500);
      })
      .catch(() => {
        handleCapture();
      });
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onComplete(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-lg mx-4">
        {/* Canon R50 Camera Animation */}
        {phase === 'arriving' && (
          <div className="animate-bounce text-center">
            <div className="text-6xl mb-4">📸</div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="text-white text-lg font-bold mb-2">Canon EOS R50</div>
              <div className="text-gray-400 text-sm">正在送达...</div>
              <div className="mt-4 flex justify-center">
                <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'ready' && (
          <div className="text-center animate-fade-in">
            {/* Camera body */}
            <div className="relative bg-gray-900 rounded-2xl p-8 border-2 border-gray-700 shadow-2xl">
              <div className="absolute top-2 right-3 text-xs text-red-500 font-bold">Canon</div>
              <div className="text-white text-xl font-bold mb-2">EOS R50</div>
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-800 border-4 border-gray-600 flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-gray-500">
                  <div className="w-8 h-8 mx-auto mt-6 rounded-full bg-gray-900 border border-gray-400"></div>
                </div>
              </div>
              <div className="text-gray-400 text-sm mb-4">准备就绪</div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleWebcamCapture}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all transform hover:scale-105"
                >
                  📷 拍摄
                </button>
                <button
                  onClick={handleCapture}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-bold transition-all"
                >
                  🎨 模拟拍摄
                </button>
              </div>
              
              <button
                onClick={onCancel}
                className="mt-4 text-gray-500 hover:text-gray-300 text-sm"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {phase === 'captured' && capturedImage && (
          <div className="text-center">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <img src={capturedImage} alt="Captured" className="w-full rounded-lg mb-4" />
              <div className="text-gray-400 text-xs mb-3">Canon EOS R50 | {new Date().toLocaleString()}</div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                >
                  ✓ 确认使用
                </button>
                <button
                  onClick={() => setPhase('ready')}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  重拍
                </button>
                <button
                  onClick={onCancel}
                  className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
