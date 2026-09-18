import React, { useState, useEffect } from 'react';
import { User, loadData, setCurrentUser, getCurrentUser, saveData, clearAllData, exportData, importData } from './store';
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
    const [viewingUser, setViewingUser] = useState<string | null>(null);

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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  const data = exportData();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `friendship-app-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 border border-green-200"
              >
                导出数据
              </button>
              <label className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 border border-blue-200 cursor-pointer">
                导入数据
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const result = ev.target?.result as string;
                        if (importData(result)) {
                          alert('数据导入成功！');
                          window.location.reload();
                        } else {
                          alert('数据导入失败，文件格式不正确。');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
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
                      onClick={() => setViewingUser(u.username)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100 border border-blue-200"
                    >
                      查看详情
                    </button>
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

          {/* User Detail View */}
          {viewingUser && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-xl p-6 border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg my-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-900 text-lg font-medium">用户详情 - {viewingUser}</h3>
                  <button
                    onClick={() => setViewingUser(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                  >
                    关闭
                  </button>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">用户名：</span>
                      <span className="text-gray-900 font-medium">{viewingUser}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">生日：</span>
                      <span className="text-gray-900 font-medium">
                        {data.users.find(u => u.username === viewingUser)?.birthday}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div className="mb-6">
                  <h4 className="text-gray-900 text-sm font-medium mb-3">摄影作品 ({data.photos.filter(p => p.username === viewingUser).length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.photos.filter(p => p.username === viewingUser).map(photo => (
                      <div key={photo.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                        <img src={photo.src} alt={photo.caption} className="w-full h-28 object-cover" />
                        <div className="p-2">
                          <p className="text-gray-700 text-xs truncate">{photo.caption}</p>
                          <p className="text-gray-400 text-xs">评分: {photo.score}/10</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {data.photos.filter(p => p.username === viewingUser).length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-4">暂无摄影作品</p>
                  )}
                </div>

                {/* Wishes */}
                <div className="mb-6">
                  <h4 className="text-gray-900 text-sm font-medium mb-3">许愿 ({data.wishes.filter(w => w.username === viewingUser).length})</h4>
                  <div className="space-y-2">
                    {data.wishes.filter(w => w.username === viewingUser).map(wish => (
                      <div key={wish.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-gray-700 text-sm">{wish.text}</p>
                        <p className="text-gray-400 text-xs mt-1">{new Date(wish.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                  {data.wishes.filter(w => w.username === viewingUser).length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-4">暂无愿望</p>
                  )}
                </div>

                {/* Friends */}
                <div className="mb-6">
                  <h4 className="text-gray-900 text-sm font-medium mb-3">好友 ({data.friends.filter(f => f.username === viewingUser).length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.friends.filter(f => f.username === viewingUser).map(friend => (
                      <div key={friend.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-gray-900 text-sm font-medium">{friend.name}</p>
                        <p className="text-gray-400 text-xs">分组: {friend.group}</p>
                        <p className="text-gray-400 text-xs">合照: {friend.photos.length} 张</p>
                      </div>
                    ))}
                  </div>
                  {data.friends.filter(f => f.username === viewingUser).length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-4">暂无好友</p>
                  )}
                </div>

                {/* Achievements */}
                <div>
                  <h4 className="text-gray-900 text-sm font-medium mb-3">成就 ({data.achievements.filter(a => a.username === viewingUser && a.unlocked).length}/{data.achievements.filter(a => a.username === viewingUser).length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.achievements.filter(a => a.username === viewingUser).map(ach => (
                      <div key={ach.id} className={`rounded-lg p-3 border ${ach.unlocked ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                        <p className={`text-sm font-medium ${ach.unlocked ? 'text-gray-900' : 'text-gray-400'}`}>{ach.title}</p>
                        <p className={`text-xs mt-0.5 ${ach.unlocked ? 'text-gray-500' : 'text-gray-300'}`}>{ach.description}</p>
                        <p className={`text-xs mt-1 ${ach.unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                          {ach.unlocked ? '已解锁' : '未解锁'}
                        </p>
                      </div>
                    ))}
                  </div>
                  {data.achievements.filter(a => a.username === viewingUser).length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-4">暂无成就</p>
                  )}
                </div>
              </div>
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
