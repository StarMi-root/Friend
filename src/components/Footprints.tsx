import React, { useState } from 'react';
import { User, loadData, saveData, generateId, Photo, calculateLevel, getLevelLabel } from '../store';
import { CameraAnimation } from './CameraAnimation';

interface FootprintsProps {
  user: User;
  onDataUpdate: () => void;
}

export const Footprints: React.FC<FootprintsProps> = ({ user, onDataUpdate }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [scoreValue, setScoreValue] = useState(5);

  const data = loadData();
  const userPhotos = data.photos.filter(p => p.username === user.username);
  const avgScore = userPhotos.length > 0
    ? userPhotos.reduce((sum, p) => sum + p.score, 0) / userPhotos.length
    : 0;
  const level = calculateLevel(userPhotos.length, avgScore);

  const handleCameraComplete = (imageData: string) => {
    const photo: Photo = {
      id: generateId(),
      src: imageData,
      caption: 'Canon EOS R50 拍摄',
      score: 0,
      date: new Date().toISOString(),
      username: user.username
    };
    data.photos.push(photo);
    // Unlock photography achievement
    const ach = data.achievements.find(a => a.id === 'ach-3' && a.username === user.username);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
    }
    // Check for 10 photos achievement
    if (userPhotos.length + 1 >= 10) {
      const ach2 = data.achievements.find(a => a.id === 'ach-4' && a.username === user.username);
      if (ach2 && !ach2.unlocked) {
        ach2.unlocked = true;
      }
    }
    saveData(data);
    setShowCamera(false);
    onDataUpdate();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const photo: Photo = {
          id: generateId(),
          src: result,
          caption: '摄影作品',
          score: 0,
          date: new Date().toISOString(),
          username: user.username
        };
        data.photos.push(photo);
        const ach = data.achievements.find(a => a.id === 'ach-3' && a.username === user.username);
        if (ach && !ach.unlocked) {
          ach.unlocked = true;
        }
        saveData(data);
        onDataUpdate();
      };
      reader.readAsDataURL(file);
    }
    setShowUpload(false);
  };

  const handleScore = (photo: Photo, score: number) => {
    const idx = data.photos.findIndex(p => p.id === photo.id);
    if (idx !== -1) {
      data.photos[idx].score = score;
      // Check for perfect score achievement
      if (score === 10) {
        const ach = data.achievements.find(a => a.id === 'ach-8' && a.username === user.username);
        if (ach && !ach.unlocked) {
          ach.unlocked = true;
        }
      }
      saveData(data);
      setSelectedPhoto(null);
      onDataUpdate();
    }
  };

  const handleDelete = (photoId: string) => {
    data.photos = data.photos.filter(p => p.id !== photoId);
    saveData(data);
    onDataUpdate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      {showCamera && (
        <CameraAnimation
          onComplete={handleCameraComplete}
          onCancel={() => setShowCamera(false)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📸 我的足迹</h1>
          <p className="text-gray-400">用 Canon EOS R50 记录每一个精彩瞬间</p>
        </div>

        {/* Level Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-red-500">Lv.{level}</span>
                <span className="text-gray-300 text-lg">{getLevelLabel(level)}</span>
              </div>
              <p className="text-gray-500 text-sm">
                已上传 {userPhotos.length} 张作品 | 平均评分 {avgScore.toFixed(1)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCamera(true)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all"
              >
                📷 拍摄
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                📁 上传
              </button>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Lv.1</span>
              <span>Lv.2</span>
              <span>Lv.3</span>
              <span>Lv.4</span>
              <span>Lv.5</span>
              <span>Lv.6</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-500 rounded-full"
                style={{ width: `${(level / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {showUpload && (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-6 text-center">
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="footprint-upload" />
            <label htmlFor="footprint-upload" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer inline-block">
              📁 选择照片上传
            </label>
          </div>
        )}

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userPhotos.map(photo => (
            <div key={photo.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-red-500/50 transition-all group">
              <div className="relative">
                <img src={photo.src} alt={photo.caption} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Canon EOS R50
                </div>
                {photo.score > 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded">
                    ⭐ {photo.score}/10
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-gray-300 text-sm mb-2">{photo.caption}</p>
                <p className="text-gray-500 text-xs mb-3">
                  {new Date(photo.date).toLocaleDateString('zh-CN')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedPhoto(photo); setScoreValue(photo.score || 5); }}
                    className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-all"
                  >
                    评分
                  </button>
                  {user.isAdmin && (
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-sm rounded transition-all"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {userPhotos.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-400 text-lg">还没有摄影作品</p>
            <p className="text-gray-500 text-sm mt-2">拿起你的 Canon EOS R50 开始创作吧！</p>
          </div>
        )}

        {/* Score Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 w-full max-w-sm">
              <h3 className="text-white text-lg font-bold mb-4">为作品评分</h3>
              <img src={selectedPhoto.src} alt="" className="w-full h-32 object-cover rounded-lg mb-4" />
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">评分: {scoreValue}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreValue}
                  onChange={e => setScoreValue(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleScore(selectedPhoto, scoreValue)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                >
                  确认评分
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
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
