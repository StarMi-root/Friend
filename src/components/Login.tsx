import React, { useState } from 'react';
import { User, loadData, saveData, setCurrentUser } from '../store';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const data = loadData();
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      // Extract MM-DD from stored birthday (could be YYYY-MM-DD or MM-DD)
      const storedParts = user.birthday.split('-');
      const bMonth = storedParts.length === 3 ? storedParts[1] : storedParts[0];
      const bDay = storedParts.length === 3 ? storedParts[2] : storedParts[1];
      const [inputMonth, inputDay] = birthday.split('-');
      if (bMonth === inputMonth && bDay === inputDay) {
        setCurrentUser(user);
        onLogin(user);
      } else {
        setError('生日验证失败，请检查输入的生日');
      }
    } else {
      setError('用户名或密码错误');
    }
  };

  const handleRegister = () => {
    if (!username || !password || !birthday) {
      setError('请填写所有字段');
      return;
    }
    if (username === 'admin') {
      setError('该用户名已被注册');
      return;
    }
    const data = loadData();
    if (data.users.find(u => u.username === username)) {
      setError('用户名已存在');
      return;
    }
    // Store full birthday date for age calculation
    const fullBirthday = birthday; // Already in MM-DD from the date input
    const newUser: User = { username, password, birthday: fullBirthday };
    data.users.push(newUser);
    // Initialize default achievements for new user
    data.achievements.push(
      { id: 'ach-1', title: '初次相遇', description: '第一次来到这里', icon: '👋', unlocked: true, username },
      { id: 'ach-2', title: '获得挚友', description: '在友谊墙添加第一个朋友', icon: '🤝', unlocked: false, username },
      { id: 'ach-3', title: '摄影新手', description: '上传第一张摄影作品', icon: '📷', unlocked: false, username },
      { id: 'ach-4', title: '摄影达人', description: '上传10张摄影作品', icon: '🏆', unlocked: false, username },
      { id: 'ach-5', title: '生日快乐', description: '在生日页面许下第一个愿望', icon: '🎂', unlocked: false, username },
      { id: 'ach-6', title: '记录生活', description: '上传第一张照片', icon: '🌟', unlocked: false, username },
      { id: 'ach-7', title: '友谊大师', description: '添加5个以上朋友', icon: '💎', unlocked: false, username },
      { id: 'ach-8', title: '满分摄影师', description: '获得一张满分作品', icon: '⭐', unlocked: false, username },
    );
    saveData(data);
    setCurrentUser(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📸</div>
          <h1 className="text-3xl font-bold text-white mb-2">我们的故事</h1>
          <p className="text-gray-400">友谊 · 摄影 · 回忆</p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {isRegister ? '注册新账户' : '登录'}
          </h2>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                placeholder="输入用户名"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                placeholder="输入密码"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">生日</label>
              <input
                type="date"
                value={birthday ? `2000-${birthday}` : ''}
                onChange={e => {
                  const d = e.target.value;
                  if (d) {
                    const parts = d.split('-');
                    setBirthday(`${parts[1]}-${parts[2]}`);
                  }
                  setError('');
                }}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            onClick={isRegister ? handleRegister : handleLogin}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
          >
            {isRegister ? '注册' : '登录'}
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-gray-400 hover:text-red-400 text-sm transition-colors"
            >
              {isRegister ? '已有账户？去登录' : '没有账户？去注册'}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-xs">🏀 为热爱摄影和篮球的你而设计</p>
          </div>
        </div>
      </div>
    </div>
  );
};
