import React, { useState } from 'react';
import { User, loadData, saveData, generateId, Achievement } from '../store';
import { getRarityLabel, getRarityColor, generateShareCard, getStreakData, Rarity } from '../utils';

interface AchievementsProps {
  user: User;
  onDataUpdate: () => void;
}

export const Achievements: React.FC<AchievementsProps> = ({ user, onDataUpdate }) => {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const data = loadData();
  const userAchievements = data.achievements.filter(a => a.username === user.username);
  const unlockedCount = userAchievements.filter(a => a.unlocked).length;
  const totalCount = userAchievements.length;

  const handleAddCustom = () => {
    if (!newTitle.trim()) return;
    const ach: Achievement = {
      id: generateId(),
      title: newTitle,
      description: newDesc,
      icon: 'custom',
      unlocked: false,
      username: user.username,
      isCustom: true
    };
    data.achievements.push(ach);
    saveData(data);
    setNewTitle('');
    setNewDesc('');
    setShowAddCustom(false);
    onDataUpdate();
  };

  const handleUnlock = (achId: string) => {
    setUnlockingId(achId);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && unlockingId) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const idx = data.achievements.findIndex(a => a.id === unlockingId);
        if (idx !== -1) {
          data.achievements[idx].unlocked = true;
          data.achievements[idx].photo = result;
          saveData(data);
          setUnlockingId(null);
          onDataUpdate();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteCustom = (achId: string) => {
    data.achievements = data.achievements.filter(a => a.id !== achId);
    saveData(data);
    onDataUpdate();
  };

  const defaultAchievements = userAchievements.filter(a => !a.isCustom);
  const customAchievements = userAchievements.filter(a => a.isCustom);
  const streak = getStreakData();

  // Assign rarity to achievements
  const getRarity = (ach: Achievement): Rarity => {
    if (['ach-4', 'ach-7', 'ach-8'].includes(ach.id)) return 'epic';
    if (['ach-2', 'ach-3'].includes(ach.id)) return 'rare';
    if (ach.isCustom) return 'rare';
    return 'common';
  };

  const handleShare = (ach: Achievement) => {
    const card = generateShareCard(ach.title, ach.description);
    const link = document.createElement('a');
    link.download = `achievement-${ach.title}.png`;
    link.href = card;
    link.click();
  };

  const achievementTiers = [
    { title: '起步', achievements: defaultAchievements.filter(a => ['ach-1', 'ach-5', 'ach-6'].includes(a.id)) },
    { title: '友谊', achievements: defaultAchievements.filter(a => ['ach-2', 'ach-7'].includes(a.id)) },
    { title: '摄影', achievements: defaultAchievements.filter(a => ['ach-3', 'ach-4', 'ach-8'].includes(a.id)) },
  ];

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-light text-gray-900">我的成就</h1>
          <p className="text-gray-400 text-sm mt-1">记录人生中的每一个重要时刻</p>
        </div>

        {/* Progress */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-900 text-sm font-medium">成就进度</span>
            <span className="text-gray-900 text-sm font-light">{unlockedCount}/{totalCount}</span>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Achievement Tiers */}
        {achievementTiers.map((tier, ti) => (
          <div key={ti} className="mb-8">
            <h3 className="text-gray-900 text-sm font-medium mb-4">{tier.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tier.achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`rounded-xl p-5 border transition-all ${
                    ach.unlocked
                      ? 'bg-white border-gray-200 shadow-sm'
                      : 'bg-gray-50 border-gray-100 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                      ach.unlocked ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {ach.unlocked ? '✓' : '—'}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${ach.unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                        {ach.title}
                      </h4>
                      <p className={`text-xs mt-0.5 ${ach.unlocked ? 'text-gray-500' : 'text-gray-300'}`}>
                        {ach.description}
                      </p>
                      {ach.unlocked && ach.photo && (
                        <img src={ach.photo} alt="" className="mt-2 w-full h-16 object-cover rounded-lg" />
                      )}
                    </div>
                    {!ach.unlocked && (
                      <button
                        onClick={() => handleUnlock(ach.id)}
                        className="px-2.5 py-1 bg-gray-900 text-white text-xs rounded-lg font-medium hover:bg-gray-800"
                      >
                        点亮
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Custom Achievements */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 text-sm font-medium">自定义成就</h3>
            <button
              onClick={() => setShowAddCustom(true)}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800"
            >
              创建成就
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customAchievements.map(ach => (
              <div
                key={ach.id}
                className={`rounded-xl p-5 border transition-all ${
                  ach.unlocked
                    ? 'bg-white border-gray-200 shadow-sm'
                    : 'bg-gray-50 border-gray-100 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    ach.unlocked ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {ach.unlocked ? '✓' : '—'}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${ach.unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                      {ach.title}
                    </h4>
                    <p className={`text-xs mt-0.5 ${ach.unlocked ? 'text-gray-500' : 'text-gray-300'}`}>
                      {ach.description}
                    </p>
                    {ach.unlocked && ach.photo && (
                      <img src={ach.photo} alt="" className="mt-2 w-full h-16 object-cover rounded-lg" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {ach.unlocked ? (
                      <span className="text-gray-400 text-xs">已解锁</span>
                    ) : (
                      <button
                        onClick={() => handleUnlock(ach.id)}
                        className="px-2 py-1 bg-gray-900 text-white text-xs rounded font-medium hover:bg-gray-800"
                      >
                        点亮
                      </button>
                    )}
                    {user.isAdmin && (
                      <button
                        onClick={() => handleDeleteCustom(ach.id)}
                        className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded hover:bg-red-50 hover:text-red-500"
                      >
                        删除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {customAchievements.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6">还没有自定义成就</p>
          )}
        </div>

        {/* Add Custom Achievement Modal */}
        {showAddCustom && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100 w-full max-w-sm shadow-lg">
              <h3 className="text-gray-900 text-sm font-medium mb-4">创建自定义成就</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="成就名称"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="成就描述"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddCustom}
                  className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  创建
                </button>
                <button
                  onClick={() => setShowAddCustom(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unlock with Photo Modal */}
        {unlockingId && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100 w-full max-w-sm shadow-lg text-center">
              <h3 className="text-gray-900 text-sm font-medium mb-2">上传照片点亮成就</h3>
              <p className="text-gray-400 text-xs mb-4">上传一张照片来证明你获得了这个成就</p>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="achievement-upload" />
              <label htmlFor="achievement-upload" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg cursor-pointer inline-block text-sm font-medium hover:bg-gray-800">
                选择照片
              </label>
              <button
                onClick={() => setUnlockingId(null)}
                className="block mx-auto mt-3 text-gray-400 hover:text-gray-600 text-xs"
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
