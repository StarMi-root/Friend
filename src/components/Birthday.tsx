import React, { useState, useEffect } from 'react';
import { User, loadData, saveData, generateId, getBirthdayAge, getCakePercentage, Wish } from '../store';
import { CameraAnimation } from './CameraAnimation';
import { getGifts, saveGift, deleteGift, Gift } from '../utils';

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
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [gifts, setGifts] = useState<Gift[]>(getGifts(user.username));
  const [showAddGift, setShowAddGift] = useState(false);
  const [giftName, setGiftName] = useState('');
  const [giftType, setGiftType] = useState<'received' | 'wanted'>('wanted');
  const [giftFrom, setGiftFrom] = useState('');

  const data = loadData();
  const userWishes = data.wishes.filter(w => w.username === user.username);
  const age = getBirthdayAge(user.birthday);
  const cakePercentage = getCakePercentage(user.birthday);
  const candleCount = Math.min(age ?? 0, 20);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const parts = user.birthday.split('-');
      const month = parseInt(parts.length === 3 ? parts[1] : parts[0]);
      const day = parseInt(parts.length === 3 ? parts[2] : parts[1]);
      const now = new Date();
      let nextBirthday = new Date(now.getFullYear(), month - 1, day);
      if (now >= nextBirthday) {
        nextBirthday = new Date(now.getFullYear() + 1, month - 1, day);
      }
      const diff = nextBirthday.getTime() - now.getTime();
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [user.birthday]);

  const handleAddGift = () => {
    if (!giftName.trim()) return;
    const gift: Gift = {
      id: generateId(),
      name: giftName,
      type: giftType,
      from: giftFrom || undefined,
      date: new Date().toISOString(),
      username: user.username
    };
    saveGift(gift);
    setGifts(getGifts(user.username));
    setGiftName('');
    setGiftFrom('');
    setShowAddGift(false);
  };

  const handleDeleteGift = (id: string) => {
    deleteGift(id);
    setGifts(getGifts(user.username));
  };

  const handleMakeWish = () => {
    if (!wishText.trim()) return;
    const wish: Wish = {
      id: generateId(),
      text: wishText,
      date: new Date().toISOString(),
      username: user.username
    };
    data.wishes.push(wish);
    const ach = data.achievements.find(a => a.id === 'ach-5' && a.username === user.username);
    if (ach && !ach.unlocked) ach.unlocked = true;
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
    <div className="min-h-screen bg-white p-6 md:p-10">
      {showCamera && (
        <CameraAnimation
          onComplete={handleCameraComplete}
          onCancel={() => setShowCamera(false)}
        />
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-light text-gray-900">生日快乐</h1>
          <p className="text-gray-400 text-sm mt-1">{age !== null ? `今天是你的 ${age} 岁生日` : '生日快乐'}</p>
        </div>

        {/* Countdown */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
          <h3 className="text-gray-900 text-sm font-medium mb-4">距离下次生日</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-xl font-light text-gray-900">{countdown.days}</div>
              <div className="text-gray-400 text-xs">天</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-xl font-light text-gray-900">{countdown.hours}</div>
              <div className="text-gray-400 text-xs">时</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-xl font-light text-gray-900">{countdown.minutes}</div>
              <div className="text-gray-400 text-xs">分</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-xl font-light text-gray-900">{countdown.seconds}</div>
              <div className="text-gray-400 text-xs">秒</div>
            </div>
          </div>
        </div>

        {/* Cake Section */}
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 mb-8">
          <div className="text-center">
            {/* Candles */}
            <div className="flex justify-center gap-1.5 mb-3 flex-wrap">
              {Array.from({ length: candleCount }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  {candlesLit && !blowingCandles && (
                    <div className="w-1.5 h-3 bg-amber-400 rounded-full animate-pulse mb-0.5"></div>
                  )}
                  {blowingCandles && (
                    <div className="w-1.5 h-3 bg-amber-200 rounded-full animate-bounce mb-0.5 opacity-50"></div>
                  )}
                  <div className="w-1 h-5 bg-gray-300 rounded-sm"></div>
                </div>
              ))}
            </div>

            {/* Cake */}
            <div className="w-40 h-24 mx-auto relative rounded-lg overflow-hidden border border-gray-200">
              <div className="absolute inset-0 bg-gradient-to-b from-rose-100 to-rose-200"></div>
              <div
                className="absolute bottom-0 left-0 right-0 bg-gray-200 transition-all duration-1000"
                style={{ height: `${100 - cakePercentage}%` }}
              ></div>
              <div className="absolute top-0 left-0 right-0 h-3 bg-white/50"></div>
            </div>

            <div className="mt-6">
              <p className="text-gray-500 text-sm mb-2">蛋糕新鲜度 {Math.round(cakePercentage)}%</p>
              <div className="w-48 mx-auto h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 transition-all duration-500"
                  style={{ width: `${cakePercentage}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                {cakePercentage > 80 ? '刚出炉的蛋糕' :
                 cakePercentage > 50 ? '蛋糕还很新鲜' :
                 cakePercentage > 20 ? '蛋糕快吃完了' :
                 '蛋糕快要没了，等下次生日吧'}
              </p>
            </div>

            <div className="mt-6 flex gap-2 justify-center flex-wrap">
              {candlesLit ? (
                <button
                  onClick={handleBlowCandles}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  吹蜡烛
                </button>
              ) : (
                <button
                  onClick={handleRelightCandles}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  重新点燃
                </button>
              )}
              <button
                onClick={() => setShowCamera(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                拍摄
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                上传照片
              </button>
            </div>

            {showUpload && (
              <div className="mt-4">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="birthday-upload" />
                <label htmlFor="birthday-upload" className="px-4 py-2 bg-gray-900 text-white rounded-lg cursor-pointer inline-block text-sm hover:bg-gray-800">
                  选择照片
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Birthday Photos */}
        {birthdayPhotos.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
            <h3 className="text-gray-900 text-sm font-medium mb-4">生日照片</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {birthdayPhotos.map((photo, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
                  <img src={photo} alt={`Birthday ${i + 1}`} className="w-full h-28 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wish Section */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 className="text-gray-900 text-sm font-medium mb-4">许愿池</h3>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={wishText}
              onChange={e => setWishText(e.target.value)}
              placeholder="写下你的愿望..."
              className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handleMakeWish()}
            />
            <button
              onClick={handleMakeWish}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              许愿
            </button>
          </div>

          {/* Wishes as sticky notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {userWishes.map((wish, i) => (
              <div
                key={wish.id}
                className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm"
                style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 0.5}deg)` }}
              >
                <p className="text-gray-700 text-sm mb-2">{wish.text}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(wish.date).toLocaleDateString('zh-CN')}
                </p>
              </div>
            ))}
          </div>

          {userWishes.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">还没有许过愿望</p>
          )}
        </div>

        {/* Gift List */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 text-sm font-medium">礼物清单</h3>
            <button
              onClick={() => setShowAddGift(true)}
              className="px-3 py-1 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800"
            >
              添加
            </button>
          </div>
          
          <div className="space-y-2">
            {gifts.filter(g => g.type === 'wanted').length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">想要的礼物</p>
                {gifts.filter(g => g.type === 'wanted').map(gift => (
                  <div key={gift.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 mb-1">
                    <span className="text-sm text-gray-700">{gift.name}</span>
                    <button onClick={() => handleDeleteGift(gift.id)} className="text-xs text-gray-400 hover:text-red-500">删除</button>
                  </div>
                ))}
              </div>
            )}
            {gifts.filter(g => g.type === 'received').length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">收到的礼物</p>
                {gifts.filter(g => g.type === 'received').map(gift => (
                  <div key={gift.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 mb-1">
                    <div>
                      <span className="text-sm text-gray-700">{gift.name}</span>
                      {gift.from && <span className="text-xs text-gray-400 ml-2">来自 {gift.from}</span>}
                    </div>
                    <button onClick={() => handleDeleteGift(gift.id)} className="text-xs text-gray-400 hover:text-red-500">删除</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {gifts.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">还没有礼物记录</p>
          )}
        </div>

        {/* Add Gift Modal */}
        {showAddGift && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100 w-full max-w-sm shadow-lg">
              <h3 className="text-gray-900 text-sm font-medium mb-4">添加礼物</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={giftName}
                  onChange={e => setGiftName(e.target.value)}
                  placeholder="礼物名称"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setGiftType('wanted')}
                    className={`flex-1 py-2 rounded-lg text-sm ${giftType === 'wanted' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    想要
                  </button>
                  <button
                    onClick={() => setGiftType('received')}
                    className={`flex-1 py-2 rounded-lg text-sm ${giftType === 'received' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    收到
                  </button>
                </div>
                {giftType === 'received' && (
                  <input
                    type="text"
                    value={giftFrom}
                    onChange={e => setGiftFrom(e.target.value)}
                    placeholder="送礼人（可选）"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                  />
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleAddGift} className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">添加</button>
                <button onClick={() => setShowAddGift(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">取消</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
