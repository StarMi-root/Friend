import React, { useState, useEffect } from 'react';
import { User, loadData, setCurrentUser, getCurrentUser, saveData, clearAllData } from './store';
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

  const handleResetAll = () => {
    if (confirm('确定要删除所有用户数据吗？此操作不可恢复。')) {
      clearAllData();
      setUser(null);
      setCurrentPage('home');
      window.location.reload();
    }
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
      <div className="min-h-screen bg-white p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-light text-gray-900">管理员面板</h1>
            <div className="flex gap-2">
              <button
                onClick={handleResetAll}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 border border-red-200"
              >
                重置所有数据
              </button>
              <button
                onClick={() => setShowAdmin(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                返回
              </button>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className="flex gap-1 mb-6 flex-wrap border-b border-gray-100 pb-3">
            {[
              { id: 'users', label: '用户' },
              { id: 'photos', label: '照片' },
              { id: 'friends', label: '好友' },
              { id: 'wishes', label: '愿望' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  adminTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Users Tab */}
          {adminTab === 'users' && (
            <div className="space-y-2">
              {allUsers.map(u => (
                <div key={u.username} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-gray-900 text-sm font-medium">{u.username}</span>
                    <span className="text-gray-400 text-xs ml-3">生日: {u.birthday}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditUser(u.username)}
                      className="px-3 py-1 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.username)}
                      className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg hover:bg-red-50 hover:text-red-500"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              {allUsers.length === 0 && <p className="text-gray-400 text-sm text-center py-8">暂无普通用户</p>}
            </div>
          )}

          {/* Photos Tab */}
          {adminTab === 'photos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPhotos.map(p => (
                <div key={p.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <img src={p.src} alt="" className="w-full h-28 object-cover" />
                  <div className="p-3">
                    <p className="text-gray-700 text-sm">{p.caption}</p>
                    <p className="text-gray-400 text-xs">用户: {p.username}</p>
                    <button
                      onClick={() => handleDeletePhoto(p.id)}
                      className="mt-2 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg hover:bg-red-50 hover:text-red-500"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              {allPhotos.length === 0 && <p className="text-gray-400 text-sm text-center py-8 col-span-full">暂无照片</p>}
            </div>
          )}

          {/* Friends Tab */}
          {adminTab === 'friends' && (
            <div className="space-y-2">
              {allFriends.map(f => (
                <div key={f.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-gray-900 text-sm font-medium">{f.name}</span>
                    <span className="text-gray-400 text-xs ml-3">分组: {f.group} · 用户: {f.username} · 照片: {f.photos.length}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFriend(f.id)}
                    className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg hover:bg-red-50 hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
              ))}
              {allFriends.length === 0 && <p className="text-gray-400 text-sm text-center py-8">暂无好友数据</p>}
            </div>
          )}

          {/* Wishes Tab */}
          {adminTab === 'wishes' && (
            <div className="space-y-2">
              {allWishes.map(w => (
                <div key={w.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-gray-900 text-sm">{w.text}</span>
                    <span className="text-gray-400 text-xs ml-3">用户: {w.username} · {new Date(w.date).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteWish(w.id)}
                    className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg hover:bg-red-50 hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
              ))}
              {allWishes.length === 0 && <p className="text-gray-400 text-sm text-center py-8">暂无愿望</p>}
            </div>
          )}

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 border border-gray-100 w-full max-w-sm shadow-lg">
                <h3 className="text-gray-900 text-sm font-medium mb-4">编辑用户</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    placeholder="用户名"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editBirthday}
                    onChange={e => setEditBirthday(e.target.value)}
                    placeholder="生日 (MM-DD)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveUser}
                    className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
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

  if (showAdmin) {
    return <AdminPanel />;
  }

  const navItems = [
    { id: 'home', label: '首页' },
    { id: 'birthday', label: '生日' },
    { id: 'footprints', label: '足迹' },
    { id: 'friendwall', label: '友谊墙' },
    { id: 'achievements', label: '成就' },
  ];

  return (
    <div className="min-h-screen bg-white" key={refreshKey}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-gray-900 text-sm font-medium tracking-wide">我们的故事</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    currentPage === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {user.isAdmin && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg font-medium hover:bg-gray-800"
                >
                  管理
                </button>
              )}
              <span className="text-gray-400 text-xs hidden sm:inline">{user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-gray-400 hover:text-gray-600 text-xs"
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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 md:hidden">
        <div className="flex items-center justify-around h-14">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                currentPage === item.id ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <span className="text-xs font-medium">{item.label}</span>
              {currentPage === item.id && <div className="w-1 h-1 bg-gray-900 rounded-full"></div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
