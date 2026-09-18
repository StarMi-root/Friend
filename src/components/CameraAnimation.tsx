import React, { useState, useEffect, useRef } from 'react';

interface CameraAnimationProps {
  onComplete: (imageData: string) => void;
  onCancel: () => void;
}

type Phase = 'rising' | 'ready' | 'flashing' | 'descending' | 'result';

export const CameraAnimation: React.FC<CameraAnimationProps> = ({ onComplete, onCancel }) => {
  const [phase, setPhase] = useState<Phase>('rising');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [cancelRequested, setCancelRequested] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Phase: rising -> ready (camera rises from bottom)
  useEffect(() => {
    if (phase === 'rising') {
      timerRef.current = setTimeout(() => {
        if (!cancelRequested) setPhase('ready');
      }, 1200);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, cancelRequested]);

  // Phase: flashing -> descending (shutter flash then camera descends)
  useEffect(() => {
    if (phase === 'flashing') {
      // Flash sequence
      setFlashOpacity(1);
      timerRef.current = setTimeout(() => {
        setFlashOpacity(0);
        setPhase('descending');
      }, 300);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase]);

  // Phase: descending -> result (camera descends, show result)
  useEffect(() => {
    if (phase === 'descending') {
      timerRef.current = setTimeout(() => {
        if (!cancelRequested) setPhase('result');
      }, 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, cancelRequested]);

  const generateImage = () => {
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

      return canvas.toDataURL('image/png');
    }
    return null;
  };

  const handleShutter = () => {
    const img = generateImage();
    if (img) {
      setCapturedImage(img);
      setPhase('flashing');
    }
  };

  const handleWebcamCapture = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, 640, 480);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '14px serif';
            ctx.fillText('Canon EOS R50', 20, 460);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
            setPhase('flashing');
          }
          stream.getTracks().forEach(t => t.stop());
        }, 500);
      })
      .catch(() => {
        handleShutter();
      });
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onComplete(capturedImage);
    }
  };

  const handleCancel = () => {
    setCancelRequested(true);
    onCancel();
  };

  // Camera body SVG component
  const CameraBody = () => (
    <svg viewBox="0 0 200 140" className="w-48 h-auto drop-shadow-lg">
      {/* Camera body */}
      <rect x="20" y="35" width="160" height="90" rx="10" fill="#1a1a1a" stroke="#333" strokeWidth="1.5"/>
      {/* Top prism/viewfinder hump */}
      <rect x="65" y="20" width="70" height="25" rx="5" fill="#222" stroke="#333" strokeWidth="1"/>
      {/* Hot shoe */}
      <rect x="85" y="15" width="30" height="8" rx="2" fill="#444"/>
      {/* Canon logo area */}
      <text x="100" y="55" textAnchor="middle" fill="#cc0000" fontSize="11" fontWeight="bold" fontFamily="serif">Canon</text>
      <text x="100" y="67" textAnchor="middle" fill="#888" fontSize="7" fontFamily="sans-serif">EOS R50</text>
      {/* Lens mount */}
      <circle cx="100" cy="90" r="30" fill="#111" stroke="#444" strokeWidth="2"/>
      <circle cx="100" cy="90" r="24" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
      <circle cx="100" cy="90" r="18" fill="#0a0a0a" stroke="#222" strokeWidth="1"/>
      {/* Lens glass reflection */}
      <circle cx="100" cy="90" r="12" fill="#0f1a2e"/>
      <ellipse cx="95" cy="85" rx="4" ry="3" fill="rgba(255,255,255,0.08)"/>
      {/* Shutter button */}
      <circle cx="155" cy="32" r="6" fill="#333" stroke="#555" strokeWidth="1"/>
      <circle cx="155" cy="32" r="3" fill="#444"/>
      {/* Mode dial */}
      <circle cx="45" cy="32" r="8" fill="#2a2a2a" stroke="#444" strokeWidth="1"/>
      <line x1="45" y1="25" x2="45" y2="28" stroke="#888" strokeWidth="1"/>
      {/* Grip */}
      <rect x="155" y="50" width="20" height="60" rx="5" fill="#1a1a1a" stroke="#333" strokeWidth="0.5"/>
      <line x1="160" y1="55" x2="160" y2="105" stroke="#2a2a2a" strokeWidth="1"/>
      <line x1="164" y1="55" x2="164" y2="105" stroke="#2a2a2a" strokeWidth="1"/>
      <line x1="168" y1="55" x2="168" y2="105" stroke="#2a2a2a" strokeWidth="1"/>
      {/* Red recording dot */}
      <circle cx="140" cy="50" r="2" fill="#cc0000"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-hidden">
      {/* Flash overlay */}
      <div
        className="fixed inset-0 bg-white z-50 pointer-events-none transition-opacity"
        style={{
          opacity: flashOpacity,
          transitionDuration: flashOpacity === 1 ? '0ms' : '300ms'
        }}
      />

      <div className="relative w-full max-w-md mx-4 flex flex-col items-center">
        {/* Camera with rise/descend animation */}
        <div
          className="transition-transform duration-1000 ease-out"
          style={{
            transform:
              phase === 'rising' ? 'translateY(0)' :
              phase === 'ready' ? 'translateY(0)' :
              phase === 'flashing' ? 'translateY(0)' :
              phase === 'descending' ? 'translateY(0)' :
              'translateY(0)',
          }}
        >
          <div
            className="flex flex-col items-center"
            style={{
              animation:
                phase === 'rising' ? 'cameraRise 1.2s ease-out forwards' :
                phase === 'flashing' ? 'cameraShake 0.3s ease-in-out' :
                phase === 'descending' ? 'cameraDescend 1s ease-in forwards' :
                'none'
            }}
          >
            <CameraBody />
          </div>
        </div>

        {/* Status text below camera */}
        <div className="mt-6 text-center">
          {phase === 'rising' && (
            <div className="animate-fade-in">
              <p className="text-gray-600 text-sm">Canon EOS R50</p>
              <p className="text-gray-400 text-xs mt-1">送达中...</p>
            </div>
          )}
          {phase === 'ready' && (
            <div className="animate-fade-in">
              <p className="text-gray-900 text-sm font-medium">Canon EOS R50</p>
              <p className="text-gray-400 text-xs mt-1">准备就绪</p>
              <div className="flex gap-2 mt-4 justify-center">
                <button
                  onClick={handleWebcamCapture}
                  className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  拍摄
                </button>
                <button
                  onClick={handleShutter}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  模拟拍摄
                </button>
              </div>
              <button
                onClick={handleCancel}
                className="mt-3 text-gray-400 hover:text-gray-600 text-xs transition-colors"
              >
                取消
              </button>
            </div>
          )}
          {phase === 'flashing' && (
            <p className="text-gray-400 text-xs">拍摄中...</p>
          )}
          {phase === 'descending' && (
            <p className="text-gray-400 text-xs">保存中...</p>
          )}
          {phase === 'result' && capturedImage && (
            <div className="animate-fade-in w-full">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <img src={capturedImage} alt="Captured" className="w-full rounded-lg mb-3" />
                <div className="text-gray-400 text-xs mb-3 text-center">
                  Canon EOS R50 · {new Date().toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    确认使用
                  </button>
                  <button
                    onClick={() => setPhase('ready')}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    重拍
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes cameraRise {
          0% {
            transform: translateY(120vh) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateY(-20px) scale(1.02);
            opacity: 1;
          }
          80% {
            transform: translateY(8px) scale(0.99);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes cameraDescend {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          20% {
            transform: translateY(-10px) scale(1.01);
          }
          100% {
            transform: translateY(120vh) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes cameraShake {
          0%, 100% { transform: translateY(0) scale(1); }
          20% { transform: translateY(-3px) scale(1.01); }
          40% { transform: translateY(2px) scale(0.99); }
          60% { transform: translateY(-2px) scale(1.005); }
          80% { transform: translateY(1px) scale(0.998); }
        }
      `}</style>
    </div>
  );
};
