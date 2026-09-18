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
      // Extract MM-DD from input birthday (now YYYY-MM-DD format)
      const inputParts = birthday.split('-');
      const inputMonth = inputParts.length === 3 ? inputParts[1] : inputParts[0];
      const inputDay = inputParts.length === 3 ? inputParts[2] : inputParts[1];
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
    const newUser: User = { username, password, birthday };
    data.users.push(newUser);
    data.achievements.push(
      { id: 'ach-1', title: '初次相遇', description: '第一次来到这里', icon: 'start', unlocked: true, username },
      { id: 'ach-2', title: '获得挚友', description: '在友谊墙添加第一个朋友', icon: 'friend', unlocked: false, username },
      { id: 'ach-3', title: '摄影新手', description: '上传第一张摄影作品', icon: 'camera', unlocked: false, username },
      { id: 'ach-4', title: '摄影达人', description: '上传10张摄影作品', icon: 'pro', unlocked: false, username },
      { id: 'ach-5', title: '生日快乐', description: '在生日页面许下第一个愿望', icon: 'wish', unlocked: false, username },
      { id: 'ach-6', title: '记录生活', description: '上传第一张照片', icon: 'life', unlocked: false, username },
      { id: 'ach-7', title: '友谊大师', description: '添加5个以上朋友', icon: 'master', unlocked: false, username },
      { id: 'ach-8', title: '满分摄影师', description: '获得一张满分作品', icon: 'perfect', unlocked: false, username },
    );
    saveData(data);
    setCurrentUser(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-medium text-gray-900 tracking-wide">我们的故事</h1>
          <div className="w-8 h-px bg-gray-300 mx-auto mt-3"></div>
        </div>

        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-base font-medium text-gray-900 mb-6 text-center">
            {isRegister ? '注册' : '登录'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-gray-500 text-xs mb-1.5 block font-medium">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none focus:bg-white transition-all"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1.5 block font-medium">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none focus:bg-white transition-all"
                placeholder="请输入密码"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1.5 block font-medium">生日</label>
              <div className="flex gap-2">
                <select
                  value={birthday ? birthday.split('-')[0] : ''}
                  onChange={e => {
                    const year = e.target.value;
                    const parts = birthday ? birthday.split('-') : ['', '01', '01'];
                    setBirthday(year ? `${year}-${parts[1]}-${parts[2]}` : '');
                    setError('');
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none focus:bg-white transition-all"
                >
                  <option value="">年份</option>
                  {Array.from({ length: 50 }, (_, i) => {
                    const y = String(2025 - i);
                    return <option key={y} value={y}>{y} 年</option>;
                  })}
                </select>
                <select
                  value={birthday ? birthday.split('-')[1] : ''}
                  onChange={e => {
                    const month = e.target.value;
                    const parts = birthday ? birthday.split('-') : ['2000', '', '01'];
                    setBirthday(month ? `${parts[0]}-${month}-${parts[2]}` : '');
                    setError('');
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none focus:bg-white transition-all"
                >
                  <option value="">月份</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = String(i + 1).padStart(2, '0');
                    return <option key={m} value={m}>{i + 1} 月</option>;
                  })}
                </select>
                <select
                  value={birthday ? birthday.split('-')[2] : ''}
                  onChange={e => {
                    const day = e.target.value;
                    const parts = birthday ? birthday.split('-') : ['2000', '01', ''];
                    setBirthday(day ? `${parts[0]}-${parts[1]}-${day}` : '');
                    setError('');
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none focus:bg-white transition-all"
                >
                  <option value="">日期</option>
                  {Array.from({ length: 31 }, (_, i) => {
                    const d = String(i + 1).padStart(2, '0');
                    return <option key={d} value={d}>{i + 1} 日</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={isRegister ? handleRegister : handleLogin}
            className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-all text-sm"
          >
            {isRegister ? '注册' : '登录'}
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-gray-400 hover:text-gray-600 text-xs transition-colors"
            >
              {isRegister ? '已有账户，去登录' : '没有账户，去注册'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
