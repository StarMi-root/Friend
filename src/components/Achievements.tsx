import React, { useState } from 'react';
import { User, loadData, saveData, generateId, Achievement } from '../store';

interface AchievementsProps {
  user: User;
  onDataUpdate: () => void;
}

export const Achievements: React.FC<AchievementsProps> = ({ user, onDataUpdate }) => {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🏅');
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
      icon: newIcon,
      unlocked: false,
      username: user.username,
      isCustom: true
    };
    data.achievements.push(ach);
    saveData(data);
    setNewTitle('');
    setNewDesc('');
    setNewIcon('🏅');
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

  const achievementTiers = [
    { title: '🌱 起步', achievements: defaultAchievements.filter(a => ['ach-1', 'ach-5', 'ach-6'].includes(a.id)), color: 'from-green-600 to-green-800' },
    { title: '🤝 友谊', achievements: defaultAchievements.filter(a => ['ach-2', 'ach-7'].includes(a.id)), color: 'from-blue-600 to-blue-800' },
    { title: '📸 摄影', achievements: defaultAchievements.filter(a => ['ach-3', 'ach-4', 'ach-8'].includes(a.id)), color: 'from-purple-600 to-purple-800' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900/10 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 我的成就</h1>
          <p className="text-gray-400">记录人生中的每一个重要时刻</p>
        </div>

        {/* Progress */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-bold">成就进度</span>
            <span className="text-yellow-400 font-bold">{unlockedCount}/{totalCount}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Achievement Tiers */}
        {achievementTiers.map((tier, ti) => (
          <div key={ti} className="mb-8">
            <h3 className="text-white text-lg font-bold mb-4">{tier.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tier.achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`rounded-xl p-5 border transition-all ${
                    ach.unlocked
                      ? 'bg-gray-800/50 border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                      : 'bg-gray-900/50 border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${ach.unlocked ? '' : 'grayscale'}`}>
                      {ach.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>
                        {ach.title}
                      </h4>
                      <p className={`text-sm ${ach.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {ach.description}
                      </p>
                      {ach.unlocked && ach.photo && (
                        <img src={ach.photo} alt="" className="mt-2 w-full h-20 object-cover rounded-lg" />
                      )}
                    </div>
                    {ach.unlocked ? (
                      <span className="text-yellow-400 text-xl">✓</span>
                    ) : (
                      <button
                        onClick={() => handleUnlock(ach.id)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg"
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
            <h3 className="text-white text-lg font-bold">✨ 自定义成就</h3>
            <button
              onClick={() => setShowAddCustom(true)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-bold"
            >
              + 创建成就
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customAchievements.map(ach => (
              <div
                key={ach.id}
                className={`rounded-xl p-5 border transition-all ${
                  ach.unlocked
                    ? 'bg-gray-800/50 border-yellow-500/50'
                    : 'bg-gray-900/50 border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{ach.icon}</div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>
                      {ach.title}
                    </h4>
                    <p className={`text-sm ${ach.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {ach.description}
                    </p>
                    {ach.unlocked && ach.photo && (
                      <img src={ach.photo} alt="" className="mt-2 w-full h-20 object-cover rounded-lg" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {ach.unlocked ? (
                      <span className="text-yellow-400 text-xl">✓</span>
                    ) : (
                      <button
                        onClick={() => handleUnlock(ach.id)}
                        className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
                      >
                        点亮
                      </button>
                    )}
                    {user.isAdmin && (
                      <button
                        onClick={() => handleDeleteCustom(ach.id)}
                        className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white text-xs rounded"
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
            <p className="text-gray-500 text-center py-6">还没有自定义成就，创建你的第一个吧！</p>
          )}
        </div>

        {/* Add Custom Achievement Modal */}
        {showAddCustom && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 w-full max-w-sm">
              <h3 className="text-white text-lg font-bold mb-4">创建自定义成就</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">图标</label>
                  <div className="flex gap-2 flex-wrap">
                    {['🏅', '🎯', '💪', '🌟', '🔥', '💎', '🎮', '🏀', '📸', '🎵', '📚', '✈️'].map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className={`text-2xl p-2 rounded-lg ${newIcon === icon ? 'bg-yellow-600' : 'bg-gray-800'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="成就名称"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="成就描述"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddCustom}
                  className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold"
                >
                  创建
                </button>
                <button
                  onClick={() => setShowAddCustom(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unlock with Photo Modal */}
        {unlockingId && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 w-full max-w-sm text-center">
              <h3 className="text-white text-lg font-bold mb-4">上传照片点亮成就</h3>
              <p className="text-gray-400 text-sm mb-4">上传一张照片来证明你获得了这个成就</p>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="achievement-upload" />
              <label htmlFor="achievement-upload" className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg cursor-pointer inline-block font-bold">
                📷 选择照片
              </label>
              <button
                onClick={() => setUnlockingId(null)}
                className="block mx-auto mt-3 text-gray-400 hover:text-white text-sm"
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
