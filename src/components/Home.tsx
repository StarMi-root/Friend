import React from 'react';
import { User, loadData, getBirthdayAge, getMonthsSinceBirthday } from '../store';

interface HomeProps {
  user: User;
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ user, onNavigate }) => {
  const data = loadData();
  const userPhotos = data.photos.filter(p => p.username === user.username);
  const userFriends = data.friends.filter(f => f.username === user.username);
  const userWishes = data.wishes.filter(w => w.username === user.username);
  const age = getBirthdayAge(user.birthday);
  const monthsSinceBday = getMonthsSinceBirthday(user.birthday);

  const stats = [
    { icon: '📷', label: '摄影作品', value: userPhotos.length, color: 'from-red-600 to-red-800' },
    { icon: '🤝', label: '好友', value: userFriends.length, color: 'from-blue-600 to-blue-800' },
    { icon: '🕯️', label: '许愿', value: userWishes.length, color: 'from-purple-600 to-purple-800' },
    { icon: '🏆', label: '成就', value: data.achievements.filter(a => a.username === user.username && a.unlocked).length, color: 'from-yellow-600 to-yellow-800' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-2 border border-gray-700 mb-6">
            <span className="text-2xl">🏀</span>
            <span className="text-gray-300 text-sm">欢迎回来，{user.username}</span>
            <span className="text-2xl">📸</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            记录每一个<span className="text-red-500">精彩瞬间</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            用 Canon EOS R50 捕捉生活的美好，记录友谊的点滴，见证成长的足迹
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-5 text-center shadow-lg transform hover:scale-105 transition-all cursor-pointer`}
              onClick={() => onNavigate(['birthday', 'friendwall', 'footprints', 'achievements'][i])}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Birthday Info Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">🎂</div>
            <div>
              <h3 className="text-white text-xl font-bold">生日倒计时</h3>
              <p className="text-gray-400">
                {monthsSinceBday === 0 ? '今天是你的生日！🎉' : `距离下次生日还有 ${12 - monthsSinceBday} 个月`}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-red-400 text-2xl font-bold">{age}</div>
              <div className="text-gray-500 text-xs">岁</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-red-400 text-2xl font-bold">{user.birthday}</div>
              <div className="text-gray-500 text-xs">生日</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-red-400 text-2xl font-bold">{userPhotos.length}</div>
              <div className="text-gray-500 text-xs">作品数</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all cursor-pointer"
            onClick={() => onNavigate('birthday')}>
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎂</div>
              <div>
                <h3 className="text-white text-lg font-bold">生日页面</h3>
                <p className="text-gray-400 text-sm">许愿、吹蜡烛、记录生日瞬间</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all cursor-pointer"
            onClick={() => onNavigate('footprints')}>
            <div className="flex items-center gap-4">
              <div className="text-4xl">📸</div>
              <div>
                <h3 className="text-white text-lg font-bold">足迹</h3>
                <p className="text-gray-400 text-sm">上传摄影作品，记录成长足迹</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all cursor-pointer"
            onClick={() => onNavigate('friendwall')}>
            <div className="flex items-center gap-4">
              <div className="text-4xl">🤝</div>
              <div>
                <h3 className="text-white text-lg font-bold">友谊墙</h3>
                <p className="text-gray-400 text-sm">管理好友分组，记录友谊时光</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all cursor-pointer"
            onClick={() => onNavigate('achievements')}>
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏆</div>
              <div>
                <h3 className="text-white text-lg font-bold">成就</h3>
                <p className="text-gray-400 text-sm">解锁成就，见证人生重要时刻</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>🏀 为热爱摄影和篮球的你设计 | Canon EOS R50</p>
        </div>
      </div>
    </div>
  );
};
