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
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 640, 480);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 640, 480);
      
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
      
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '14px serif';
      ctx.fillText('Canon EOS R50', 20, 460);
      
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px monospace';
      ctx.fillText(new Date().toLocaleString(), 440, 460);
      
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {phase === 'arriving' && (
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-lg text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            <div className="text-gray-900 text-sm font-medium mb-1">Canon EOS R50</div>
            <div className="text-gray-400 text-xs">正在送达...</div>
            <div className="mt-4 w-32 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        )}

        {phase === 'ready' && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
            <div className="text-center mb-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gray-400"></div>
                </div>
              </div>
              <div className="text-gray-900 text-sm font-medium">Canon EOS R50</div>
              <div className="text-gray-400 text-xs mt-0.5">准备就绪</div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleWebcamCapture}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                拍摄
              </button>
              <button
                onClick={handleCapture}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                模拟拍摄
              </button>
            </div>
            
            <button
              onClick={onCancel}
              className="mt-3 w-full text-gray-400 hover:text-gray-600 text-xs py-2"
            >
              取消
            </button>
          </div>
        )}

        {phase === 'captured' && capturedImage && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-lg">
            <img src={capturedImage} alt="Captured" className="w-full rounded-lg mb-3" />
            <div className="text-gray-400 text-xs mb-3 text-center">Canon EOS R50 · {new Date().toLocaleString()}</div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                确认使用
              </button>
              <button
                onClick={() => setPhase('ready')}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                重拍
              </button>
              <button
                onClick={onCancel}
                className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
