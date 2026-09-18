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
    { label: '摄影作品', value: userPhotos.length, page: 'footprints' },
    { label: '好友', value: userFriends.length, page: 'friendwall' },
    { label: '许愿', value: userWishes.length, page: 'birthday' },
    { label: '成就', value: data.achievements.filter(a => a.username === user.username && a.unlocked).length, page: 'achievements' },
  ];

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-12">
          <p className="text-gray-400 text-sm mb-2">欢迎回来，{user.username}</p>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
            记录每一个<span className="font-medium">精彩瞬间</span>
          </h1>
          <p className="text-gray-400 text-sm mt-3 max-w-xl">
            用 Canon EOS R50 捕捉生活的美好，记录友谊的点滴
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              onClick={() => onNavigate(stat.page)}
              className="bg-gray-50 rounded-xl p-5 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100"
            >
              <div className="text-2xl font-light text-gray-900">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Birthday Info */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900 text-sm font-medium">生日信息</h3>
              <p className="text-gray-400 text-xs mt-1">
                {monthsSinceBday === 0 ? '今天是你的生日' : `距离下次生日还有 ${12 - monthsSinceBday} 个月`}
              </p>
            </div>
            <button
              onClick={() => onNavigate('birthday')}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              前往 →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-gray-900 text-lg font-light">{age}</div>
              <div className="text-gray-400 text-xs">岁</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-gray-900 text-lg font-light">{user.birthday}</div>
              <div className="text-gray-400 text-xs">生日</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-gray-900 text-lg font-light">{userPhotos.length}</div>
              <div className="text-gray-400 text-xs">作品</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: '生日', desc: '许愿、吹蜡烛、记录生日瞬间', page: 'birthday' },
            { title: '足迹', desc: '上传摄影作品，记录成长足迹', page: 'footprints' },
            { title: '友谊墙', desc: '管理好友分组，记录友谊时光', page: 'friendwall' },
            { title: '成就', desc: '解锁成就，见证人生重要时刻', page: 'achievements' },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => onNavigate(item.page)}
              className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
            >
              <h3 className="text-gray-900 text-sm font-medium">{item.title}</h3>
              <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
