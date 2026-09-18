import React, { useState, useEffect } from 'react';
import { User, loadData, setCurrentUser, getCurrentUser, saveData } from './store';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { Birthday } from './components/Birthday';
import { Footprints } from './components/Footprints';
import { FriendWall } from './components/FriendWall';
import { Achievements } from './components/Achievements';

function App() {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [currentPage, setCurrentPage] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('users');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const saved = getCurrentUser();
    if (saved) setUser(saved);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleDataUpdate = () => {
    setRefreshKey(k => k + 1);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const data = loadData();

  // Admin Panel
  const AdminPanel = () => {
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editUsername, setEditUsername] = useState('');
    const [editBirthday, setEditBirthday] = useState('');

    const allUsers = data.users.filter(u => !u.isAdmin);
    const allPhotos = data.photos;
    const allFriends = data.friends;
    const allWishes = data.wishes;

    const handleDeleteUser = (username: string) => {
      data.users = data.users.filter(u => u.username !== username);
      data.photos = data.photos.filter(p => p.username !== username);
      data.friends = data.friends.filter(f => f.username !== username);
      data.wishes = data.wishes.filter(w => w.username !== username);
      data.achievements = data.achievements.filter(a => a.username !== username);
      saveData(data);
      handleDataUpdate();
    };

    const handleDeletePhoto = (photoId: string) => {
      data.photos = data.photos.filter(p => p.id !== photoId);
      saveData(data);
      handleDataUpdate();
    };

    const handleDeleteFriend = (friendId: string) => {
      data.friends = data.friends.filter(f => f.id !== friendId);
      saveData(data);
      handleDataUpdate();
    };

    const handleDeleteWish = (wishId: string) => {
      data.wishes = data.wishes.filter(w => w.id !== wishId);
      saveData(data);
      handleDataUpdate();
    };

    const handleEditUser = (username: string) => {
      const u = data.users.find(u => u.username === username);
      if (u) {
        setEditUsername(u.username);
        setEditBirthday(u.birthday);
        setEditingUser(username);
      }
    };

    const handleSaveUser = () => {
      if (!editingUser) return;
      const idx = data.users.findIndex(u => u.username === editingUser);
      if (idx !== -1) {
        data.users[idx].username = editUsername;
        data.users[idx].birthday = editBirthday;
        // Update related data
        data.photos.forEach(p => { if (p.username === editingUser) p.username = editUsername; });
        data.friends.forEach(f => { if (f.username === editingUser) f.username = editUsername; });
        data.wishes.forEach(w => { if (w.username === editingUser) w.username = editUsername; });
        data.achievements.forEach(a => { if (a.username === editingUser) a.username = editUsername; });
        saveData(data);
        setEditingUser(null);
        handleDataUpdate();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">⚙️ 管理员面板</h1>
            <button
              onClick={() => setShowAdmin(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              返回
            </button>
          </div>

          {/* Admin Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['users', 'photos', 'friends', 'wishes'].map(tab => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  adminTab === tab ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab === 'users' ? '👥 用户' : tab === 'photos' ? '📷 照片' : tab === 'friends' ? '🤝 好友' : '🌟 愿望'}
              </button>
            ))}
          </div>

          {/* Users Tab */}
          {adminTab === 'users' && (
            <div className="space-y-3">
              {allUsers.map(u => (
                <div key={u.username} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold">{u.username}</span>
                    <span className="text-gray-500 text-sm ml-3">生日: {u.birthday}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditUser(u.username)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.username)}
                      className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-sm rounded"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              {allUsers.length === 0 && <p className="text-gray-500 text-center py-8">暂无普通用户</p>}
            </div>
          )}

          {/* Photos Tab */}
          {adminTab === 'photos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPhotos.map(p => (
                <div key={p.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
                  <img src={p.src} alt="" className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <p className="text-gray-300 text-sm">{p.caption}</p>
                    <p className="text-gray-500 text-xs">用户: {p.username}</p>
                    <button
                      onClick={() => handleDeletePhoto(p.id)}
                      className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-xs rounded"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              {allPhotos.length === 0 && <p className="text-gray-500 text-center py-8 col-span-full">暂无照片</p>}
            </div>
          )}

          {/* Friends Tab */}
          {adminTab === 'friends' && (
            <div className="space-y-3">
              {allFriends.map(f => (
                <div key={f.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold">{f.name}</span>
                    <span className="text-gray-500 text-sm ml-3">分组: {f.group} | 用户: {f.username} | 照片: {f.photos.length}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFriend(f.id)}
                    className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-sm rounded"
                  >
                    删除
                  </button>
                </div>
              ))}
              {allFriends.length === 0 && <p className="text-gray-500 text-center py-8">暂无好友数据</p>}
            </div>
          )}

          {/* Wishes Tab */}
          {adminTab === 'wishes' && (
            <div className="space-y-3">
              {allWishes.map(w => (
                <div key={w.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                  <div>
                    <span className="text-white">{w.text}</span>
                    <span className="text-gray-500 text-sm ml-3">用户: {w.username} | {new Date(w.date).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteWish(w.id)}
                    className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-sm rounded"
                  >
                    删除
                  </button>
                </div>
              ))}
              {allWishes.length === 0 && <p className="text-gray-500 text-center py-8">暂无愿望</p>}
            </div>
          )}

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 w-full max-w-sm">
                <h3 className="text-white text-lg font-bold mb-4">编辑用户</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    placeholder="用户名"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editBirthday}
                    onChange={e => setEditBirthday(e.target.value)}
                    placeholder="生日 (MM-DD)"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveUser}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
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

  if (showAdmin) {
    return (
      <>
        <AdminPanel />
      </>
    );
  }

  const navItems = [
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'birthday', label: '生日', icon: '🎂' },
    { id: 'footprints', label: '足迹', icon: '📸' },
    { id: 'friendwall', label: '友谊墙', icon: '🤝' },
    { id: 'achievements', label: '成就', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-gray-900" key={refreshKey}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">📸</span>
              <span className="text-white font-bold hidden sm:inline">我们的故事</span>
            </div>
            <div className="flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    currentPage === item.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {user.isAdmin && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg font-bold"
                >
                  管理
                </button>
              )}
              <span className="text-gray-400 text-sm hidden sm:inline">{user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="pt-14 pb-16 md:pb-0">
        {currentPage === 'home' && <Home user={user} onNavigate={handleNavigate} />}
        {currentPage === 'birthday' && <Birthday user={user} onDataUpdate={handleDataUpdate} />}
        {currentPage === 'footprints' && <Footprints user={user} onDataUpdate={handleDataUpdate} />}
        {currentPage === 'friendwall' && <FriendWall user={user} onDataUpdate={handleDataUpdate} />}
        {currentPage === 'achievements' && <Achievements user={user} onDataUpdate={handleDataUpdate} />}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 md:hidden">
        <div className="flex items-center justify-around h-14">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                currentPage === item.id ? 'text-red-400' : 'text-gray-500'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
