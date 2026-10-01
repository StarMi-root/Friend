import React, { useState, useRef } from 'react';
import { User, loadData, saveData, generateId, Photo, calculateLevel, getLevelLabel } from '../store';
import { CameraAnimation } from './CameraAnimation';
import { DEFAULT_TAGS, generateExif, compressImage } from '../utils';
import { scorePhotoWithAI, AIScoreResult } from '../ai-service';

interface FootprintsProps {
  user: User;
  onDataUpdate: () => void;
}

export const Footprints: React.FC<FootprintsProps> = ({ user, onDataUpdate }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [scoreValue, setScoreValue] = useState(5);
  const [aiScoring, setAiScoring] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const data = loadData();
  const userPhotos = data.photos.filter(p => p.username === user.username);
  const avgScore = userPhotos.length > 0
    ? userPhotos.reduce((sum, p) => sum + p.score, 0) / userPhotos.length
    : 0;
  const level = calculateLevel(userPhotos.length, avgScore);

  const handleCameraComplete = (imageData: string) => {
    const exif = generateExif(new Date().toISOString());
    const photo: Photo = {
      id: generateId(),
      src: imageData,
      caption: 'Canon EOS R50 拍摄',
      score: 0,
      date: new Date().toISOString(),
      username: user.username,
      tags: [],
      diary: '',
      exif
    };
    data.photos.push(photo);
    const ach = data.achievements.find(a => a.id === 'ach-3' && a.username === user.username);
    if (ach && !ach.unlocked) ach.unlocked = true;
    if (userPhotos.length + 1 >= 10) {
      const ach2 = data.achievements.find(a => a.id === 'ach-4' && a.username === user.username);
      if (ach2 && !ach2.unlocked) ach2.unlocked = true;
    }
    saveData(data);
    setShowCamera(false);
    onDataUpdate();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      const exif = generateExif(new Date().toISOString());
      const photo: Photo = {
        id: generateId(),
        src: compressed,
        caption: '摄影作品',
        score: 0,
        date: new Date().toISOString(),
        username: user.username,
        tags: [],
        diary: '',
        exif
      };
      data.photos.push(photo);
      const ach = data.achievements.find(a => a.id === 'ach-3' && a.username === user.username);
      if (ach && !ach.unlocked) ach.unlocked = true;
      saveData(data);
      onDataUpdate();
    }
    setShowUpload(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const compressed = await compressImage(file);
      const exif = generateExif(new Date().toISOString());
      const photo: Photo = {
        id: generateId(),
        src: compressed,
        caption: '摄影作品',
        score: 0,
        date: new Date().toISOString(),
        username: user.username,
        tags: [],
        diary: '',
        exif
      };
      data.photos.push(photo);
      saveData(data);
      onDataUpdate();
    }
  };

  const handleScore = (photo: Photo, score: number) => {
    const idx = data.photos.findIndex(p => p.id === photo.id);
    if (idx !== -1) {
      data.photos[idx].score = score;
      if (score === 10) {
        const ach = data.achievements.find(a => a.id === 'ach-8' && a.username === user.username);
        if (ach && !ach.unlocked) ach.unlocked = true;
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

  const handleAIScore = async (photo: Photo) => {
    setAiScoring(photo.id);
    setAiError(null);
    
    try {
      const result = await scorePhotoWithAI(photo.src);
      const idx = data.photos.findIndex(p => p.id === photo.id);
      if (idx !== -1) {
        data.photos[idx].aiScore = {
          ...result,
          date: new Date().toISOString()
        };
        saveData(data);
        setSelectedPhoto(data.photos[idx]);
        onDataUpdate();
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI评分失败');
    } finally {
      setAiScoring(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      {showCamera && (
        <CameraAnimation
          onComplete={handleCameraComplete}
          onCancel={() => setShowCamera(false)}
        />
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-light text-gray-900">我的足迹</h1>
          <p className="text-gray-400 text-sm mt-1">用 Canon EOS R50 记录每一个精彩瞬间</p>
        </div>

        {/* Level Card */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl font-light text-gray-900">Lv.{level}</span>
                <span className="text-gray-400 text-sm">{getLevelLabel(level)}</span>
              </div>
              <p className="text-gray-400 text-xs">
                已上传 {userPhotos.length} 张作品 · 平均评分 {avgScore.toFixed(1)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCamera(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                拍摄
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                上传
              </button>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Lv.1</span>
              <span>Lv.2</span>
              <span>Lv.3</span>
              <span>Lv.4</span>
              <span>Lv.5</span>
              <span>Lv.6</span>
            </div>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-500 rounded-full"
                style={{ width: `${(level / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {showUpload && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 text-center">
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="footprint-upload" />
            <label htmlFor="footprint-upload" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg cursor-pointer inline-block text-sm hover:bg-gray-800">
              选择照片上传
            </label>
          </div>
        )}

        {/* Drop Zone */}
        <div 
          className="mb-6 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => setShowUpload(true)}
        >
          <p className="text-gray-400 text-sm">拖拽照片到此处上传，或点击选择文件</p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {userPhotos.map(photo => (
            <div key={photo.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="relative">
                <img src={photo.src} alt={photo.caption} className="w-full h-44 object-cover" />
                <div className="absolute top-2 right-2 bg-white/90 text-gray-600 text-xs px-2 py-0.5 rounded">
                  EOS R50
                </div>
                {photo.score > 0 && (
                  <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-medium px-2 py-0.5 rounded">
                    {photo.score}/10
                  </div>
                )}
                {photo.aiScore && (
                  <div className="absolute bottom-2 right-2 bg-purple-600/90 text-white text-xs font-medium px-2 py-0.5 rounded">
                    AI {photo.aiScore.score}/10
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-gray-700 text-sm mb-1">{photo.caption}</p>
                <p className="text-gray-400 text-xs mb-2">
                  {new Date(photo.date).toLocaleDateString('zh-CN')}
                </p>
                {photo.tags && photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {photo.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {photo.diary && (
                  <p className="text-gray-500 text-xs mb-2 line-clamp-2">{photo.diary}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedPhoto(photo); setScoreValue(photo.score || 5); }}
                    className="flex-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    评分
                  </button>
                  <button
                    onClick={() => { setSelectedPhoto(photo); setScoreValue(photo.score || 5); }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    详情
                  </button>
                  {user.isAdmin && (
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
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
            <p className="text-gray-400 text-sm">还没有摄影作品</p>
            <p className="text-gray-300 text-xs mt-1">拿起你的 Canon EOS R50 开始创作吧</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 border border-gray-100 w-full max-w-lg shadow-lg my-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-gray-900 text-sm font-medium mb-4">作品详情</h3>
              <img src={selectedPhoto.src} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
              
              {/* EXIF Info */}
              {selectedPhoto.exif && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-2">拍摄参数</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-400">机身</span><br/><span className="text-gray-700">{selectedPhoto.exif.camera}</span></div>
                    <div><span className="text-gray-400">镜头</span><br/><span className="text-gray-700">{selectedPhoto.exif.lens}</span></div>
                    <div><span className="text-gray-400">焦距</span><br/><span className="text-gray-700">{selectedPhoto.exif.focalLength}</span></div>
                    <div><span className="text-gray-400">光圈</span><br/><span className="text-gray-700">{selectedPhoto.exif.aperture}</span></div>
                    <div><span className="text-gray-400">快门</span><br/><span className="text-gray-700">{selectedPhoto.exif.shutterSpeed}</span></div>
                    <div><span className="text-gray-400">ISO</span><br/><span className="text-gray-700">{selectedPhoto.exif.iso}</span></div>
                  </div>
                </div>
              )}

              {/* AI Score */}
              <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-purple-700 font-medium">AI 摄影评审</p>
                  {selectedPhoto.aiScore && (
                    <span className="text-xs text-purple-600">
                      {new Date(selectedPhoto.aiScore.date).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                </div>
                
                {aiScoring === selectedPhoto.id ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <p className="text-xs text-purple-600 mt-2">AI 正在分析照片...</p>
                  </div>
                ) : selectedPhoto.aiScore ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-purple-900">{selectedPhoto.aiScore.score}</span>
                      <span className="text-sm text-purple-600">/10</span>
                    </div>
                    <p className="text-xs text-purple-800 mb-2">{selectedPhoto.aiScore.feedback}</p>
                    
                    {selectedPhoto.aiScore.strengths.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-purple-700 font-medium mb-1">优点：</p>
                        <ul className="text-xs text-purple-600 space-y-0.5">
                          {selectedPhoto.aiScore.strengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedPhoto.aiScore.improvements.length > 0 && (
                      <div>
                        <p className="text-xs text-purple-700 font-medium mb-1">改进建议：</p>
                        <ul className="text-xs text-purple-600 space-y-0.5">
                          {selectedPhoto.aiScore.improvements.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleAIScore(selectedPhoto)}
                      className="mt-3 w-full py-1.5 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                    >
                      重新评分
                    </button>
                  </div>
                ) : (
                  <div>
                    {aiError && (
                      <p className="text-xs text-red-600 mb-2">{aiError}</p>
                    )}
                    <button
                      onClick={() => handleAIScore(selectedPhoto)}
                      className="w-full py-2 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors"
                    >
                      AI 智能评分
                    </button>
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="mb-4">
                <label className="text-gray-500 text-xs mb-2 block">评分: {scoreValue}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreValue}
                  onChange={e => setScoreValue(Number(e.target.value))}
                  className="w-full accent-gray-900"
                />
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="text-gray-500 text-xs mb-2 block">标签</label>
                <div className="flex flex-wrap gap-1">
                  {DEFAULT_TAGS.map(tag => {
                    const isSelected = selectedPhoto.tags?.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          const data = loadData();
                          const idx = data.photos.findIndex(p => p.id === selectedPhoto.id);
                          if (idx !== -1) {
                            const tags = data.photos[idx].tags || [];
                            if (isSelected) {
                              data.photos[idx].tags = tags.filter(t => t !== tag);
                            } else {
                              data.photos[idx].tags = [...tags, tag];
                            }
                            saveData(data);
                            setSelectedPhoto(data.photos[idx]);
                            onDataUpdate();
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diary */}
              <div className="mb-4">
                <label className="text-gray-500 text-xs mb-2 block">摄影日记</label>
                <textarea
                  value={selectedPhoto.diary || ''}
                  onChange={e => {
                    const data = loadData();
                    const idx = data.photos.findIndex(p => p.id === selectedPhoto.id);
                    if (idx !== -1) {
                      data.photos[idx].diary = e.target.value;
                      saveData(data);
                      setSelectedPhoto({ ...selectedPhoto, diary: e.target.value });
                    }
                  }}
                  placeholder="记录拍摄时的故事和感受..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleScore(selectedPhoto, scoreValue)}
                  className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  确认
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
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
