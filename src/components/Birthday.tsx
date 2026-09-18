import React, { useState } from 'react';
import { User, loadData, saveData, generateId, getBirthdayAge, getCakePercentage, Wish } from '../store';
import { CameraAnimation } from './CameraAnimation';

interface BirthdayProps {
  user: User;
  onDataUpdate: () => void;
}

export const Birthday: React.FC<BirthdayProps> = ({ user, onDataUpdate }) => {
  const [wishText, setWishText] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [blowingCandles, setBlowingCandles] = useState(false);
  const [candlesLit, setCandlesLit] = useState(true);
  const [birthdayPhotos, setBirthdayPhotos] = useState<string[]>([]);

  const data = loadData();
  const userWishes = data.wishes.filter(w => w.username === user.username);
  const age = getBirthdayAge(user.birthday);
  const cakePercentage = getCakePercentage(user.birthday);
  const candleCount = Math.min(age, 20); // Max 20 candles

  const handleMakeWish = () => {
    if (!wishText.trim()) return;
    const wish: Wish = {
      id: generateId(),
      text: wishText,
      date: new Date().toISOString(),
      username: user.username
    };
    data.wishes.push(wish);
    // Unlock birthday achievement
    const ach = data.achievements.find(a => a.id === 'ach-5' && a.username === user.username);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
    }
    saveData(data);
    setWishText('');
    onDataUpdate();
  };

  const handleBlowCandles = () => {
    setBlowingCandles(true);
    setTimeout(() => {
      setCandlesLit(false);
      setBlowingCandles(false);
    }, 2000);
  };

  const handleRelightCandles = () => {
    setCandlesLit(true);
  };

  const handleCameraComplete = (imageData: string) => {
    setBirthdayPhotos(prev => [...prev, imageData]);
    setShowCamera(false);
    // Unlock achievement
    const data = loadData();
    const ach = data.achievements.find(a => a.id === 'ach-6' && a.username === user.username);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      saveData(data);
      onDataUpdate();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setBirthdayPhotos(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 md:p-8">
      {showCamera && (
        <CameraAnimation
          onComplete={handleCameraComplete}
          onCancel={() => setShowCamera(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎂 生日快乐</h1>
          <p className="text-gray-400">今天是你的 {age} 岁生日！</p>
        </div>

        {/* Cake Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8 text-center">
          <div className="relative inline-block">
            {/* Candles */}
            <div className="flex justify-center gap-1 mb-2 flex-wrap">
              {Array.from({ length: candleCount }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  {candlesLit && !blowingCandles && (
                    <div className="w-2 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50 mb-0.5"></div>
                  )}
                  {blowingCandles && (
                    <div className="w-2 h-4 bg-orange-300 rounded-full animate-bounce mb-0.5 opacity-50"></div>
                  )}
                  <div className="w-1.5 h-6 bg-pink-300 rounded-sm"></div>
                </div>
              ))}
            </div>

            {/* Cake */}
            <div className="relative">
              <div className="w-48 h-32 mx-auto relative">
                {/* Cake layers */}
                <div className="absolute bottom-0 w-full h-full rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-pink-400 to-pink-600 rounded-lg"></div>
                  {/* Cake consumption indicator */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-800 to-gray-700 transition-all duration-1000"
                    style={{ height: `${100 - cakePercentage}%` }}
                  ></div>
                  {/* Frosting */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-white/30 rounded-t-lg"></div>
                  {/* Decorations */}
                  <div className="absolute top-6 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="absolute top-8 right-6 w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="absolute top-12 left-8 w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-300 mb-2">蛋糕新鲜度: {Math.round(cakePercentage)}%</p>
            <div className="w-64 mx-auto h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-500"
                style={{ width: `${cakePercentage}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              {cakePercentage > 80 ? '🎉 刚出炉的蛋糕！' :
               cakePercentage > 50 ? '🍰 蛋糕还很新鲜' :
               cakePercentage > 20 ? '🕐 蛋糕快吃完了' :
               '😢 蛋糕快要没了，等下次生日吧...'}
            </p>
          </div>

          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            {candlesLit ? (
              <button
                onClick={handleBlowCandles}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all"
              >
                💨 吹蜡烛
              </button>
            ) : (
              <button
                onClick={handleRelightCandles}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold transition-all"
              >
                🔥 重新点燃
              </button>
            )}
            <button
              onClick={() => setShowCamera(true)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all"
            >
              📷 拍摄
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              📁 上传照片
            </button>
          </div>

          {showUpload && (
            <div className="mt-4">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="birthday-upload" />
              <label htmlFor="birthday-upload" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer inline-block">
                选择照片
              </label>
            </div>
          )}
        </div>

        {/* Birthday Photos */}
        {birthdayPhotos.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
            <h3 className="text-white text-lg font-bold mb-4">📸 生日照片</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {birthdayPhotos.map((photo, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-600">
                  <img src={photo} alt={`Birthday ${i + 1}`} className="w-full h-32 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wish Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
          <h3 className="text-white text-lg font-bold mb-4">🌟 许愿池</h3>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={wishText}
              onChange={e => setWishText(e.target.value)}
              placeholder="写下你的愿望..."
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handleMakeWish()}
            />
            <button
              onClick={handleMakeWish}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all"
            >
              许愿 ✨
            </button>
          </div>

          {/* Wishes as sticky notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userWishes.map((wish, i) => (
              <div
                key={wish.id}
                className="p-4 rounded-lg shadow-lg transform hover:scale-105 transition-all"
                style={{
                  backgroundColor: ['#fef3c7', '#fce7f3', '#dbeafe', '#d1fae5', '#ede9fe', '#fee2e2'][i % 6],
                  transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (1 + Math.random() * 2)}deg)`
                }}
              >
                <p className="text-gray-800 text-sm font-medium mb-2">{wish.text}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(wish.date).toLocaleDateString('zh-CN')}
                </p>
              </div>
            ))}
          </div>

          {userWishes.length === 0 && (
            <p className="text-gray-500 text-center py-8">还没有许过愿望，快来许下第一个愿望吧！</p>
          )}
        </div>
      </div>
    </div>
  );
};
