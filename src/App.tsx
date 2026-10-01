import React, { useState, useEffect } from 'react';
import { User, loadData, setCurrentUser, getCurrentUser, saveData, clearAllData, exportData, importData, syncFromGitHub, syncToGitHub } from './store';
import { getGitHubConfig, saveGitHubConfig, clearGitHubConfig, isGitHubConfigured, testGitHubConnection, GitHubConfig } from './github-storage';
import { initDarkMode, toggleDarkMode, isDarkMode, updateStreak, recordActivity, getNotifications, saveNotifications, getLang, setLang, t, Lang, searchAll } from './utils';
import { getAIConfig, saveAIConfig, resetAIConfig, testAIConnection, AIConfig } from './ai-service';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { Birthday } from './components/Birthday';
import { Footprints } from './components/Footprints';
import { FriendWall } from './components/FriendWall';
import { Achievements } from './components/Achievements';
import { ChallengesPage } from './components/ChallengesPage';
import { TimeCapsulePage } from './components/TimeCapsulePage';
import { AnnualReportPage } from './components/AnnualReportPage';

function App() {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [currentPage, setCurrentPage] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('users');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(isDarkMode());
  const [lang, setLangState] = useState<Lang>(getLang());

  useEffect(() => {
    const saved = getCurrentUser();
    if (saved) setUser(saved);

    // Initialize dark mode
    initDarkMode();

    // Update streak and record activity
    if (saved) {
      updateStreak();
      recordActivity();
    }

    // Auto sync from GitHub on load
    const trySyncFromGitHub = async () => {
      const { isGitHubConfigured } = await import('./github-storage');
      if (isGitHubConfigured()) {
        try {
          const { readFromGitHub } = await import('./github-storage');
          const githubData = await readFromGitHub();
          if (githubData) {
            const localData = loadData();
            // Compare update times - use the one with more data as heuristic
            const githubTotal = githubData.photos.length + githubData.wishes.length + githubData.friends.length;
            const localTotal = localData.photos.length + localData.wishes.length + localData.friends.length;
            if (githubTotal > localTotal) {
              localStorage.setItem('friendship-app-data', JSON.stringify(githubData));
              setRefreshKey(k => k + 1);
            }
          }
        } catch (e) {
          console.log('Auto sync skipped:', e);
        }
      }
    };
    trySyncFromGitHub();
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

  const handleToggleDarkMode = () => {
    const isDark = toggleDarkMode();
    setDarkMode(isDark);
  };

  const handleToggleLang = () => {
    const newLang: Lang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
    setLangState(newLang);
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

    // GitHub Sync Panel Component
    const GitHubSyncPanel = () => {
      const [config, setConfig] = useState<GitHubConfig>(getGitHubConfig() || { token: '', owner: '', repo: '', path: 'data/app-data.json' });
      const [testing, setTesting] = useState(false);
      const [syncing, setSyncing] = useState(false);
      const [message, setMessage] = useState('');

      const handleSaveConfig = () => {
        saveGitHubConfig(config);
        setMessage('配置已保存');
        setTimeout(() => setMessage(''), 3000);
      };

      const handleTestConnection = async () => {
        setTesting(true);
        saveGitHubConfig(config);
        const result = await testGitHubConnection();
        setMessage(result.message);
        setTesting(false);
        setTimeout(() => setMessage(''), 5000);
      };

      const handleSyncFromGitHub = async () => {
        setSyncing(true);
        const result = await syncFromGitHub();
        setMessage(result.message);
        setSyncing(false);
        if (result.success) {
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setTimeout(() => setMessage(''), 3000);
        }
      };

      const handleSyncToGitHub = async () => {
        setSyncing(true);
        const result = await syncToGitHub();
        setMessage(result.message);
        setSyncing(false);
        setTimeout(() => setMessage(''), 3000);
      };

      const handleClearConfig = () => {
        if (confirm('确定要清除 GitHub 配置吗？')) {
          clearGitHubConfig();
          setConfig({ token: '', owner: '', repo: '', path: 'data/app-data.json' });
          setMessage('配置已清除');
          setTimeout(() => setMessage(''), 3000);
        }
      };

      return (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-gray-900 text-sm font-medium mb-4">GitHub 配置</h3>
            
            {message && (
              <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
                message.includes('成功') ? 'bg-green-50 text-green-600 border border-green-200' :
                message.includes('失败') || message.includes('错误') || message.includes('无效') ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">GitHub Token</label>
                <input
                  type="password"
                  value={config.token}
                  onChange={e => setConfig({ ...config, token: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
                <p className="text-gray-400 text-xs mt-1">
                  在 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic) 创建
                </p>
              </div>

              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">仓库所有者 (用户名)</label>
                <input
                  type="text"
                  value={config.owner}
                  onChange={e => setConfig({ ...config, owner: e.target.value })}
                  placeholder="your-username"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">仓库名称</label>
                <input
                  type="text"
                  value={config.repo}
                  onChange={e => setConfig({ ...config, repo: e.target.value })}
                  placeholder="your-repo-name"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">数据文件路径</label>
                <input
                  type="text"
                  value={config.path}
                  onChange={e => setConfig({ ...config, path: e.target.value })}
                  placeholder="data/app-data.json"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
                <p className="text-gray-400 text-xs mt-1">
                  数据将存储在仓库的这个路径下，建议放在单独的文件夹中
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6 flex-wrap">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                保存配置
              </button>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 border border-blue-200 disabled:opacity-50"
              >
                {testing ? '测试中...' : '测试连接'}
              </button>
              <button
                onClick={handleClearConfig}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 border border-red-200"
              >
                清除配置
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-gray-900 text-sm font-medium mb-4">数据同步</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={handleSyncFromGitHub}
                  disabled={syncing || !isGitHubConfigured()}
                  className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 border border-green-200 disabled:opacity-50"
                >
                  {syncing ? '同步中...' : '从 GitHub 下载'}
                </button>
                <div>
                  <p className="text-gray-700 text-sm">下载云端数据</p>
                  <p className="text-gray-400 text-xs">将 GitHub 上的数据下载到本地，覆盖当前数据</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <button
                  onClick={handleSyncToGitHub}
                  disabled={syncing || !isGitHubConfigured()}
                  className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100 border border-purple-200 disabled:opacity-50"
                >
                  {syncing ? '上传中...' : '上传到 GitHub'}
                </button>
                <div>
                  <p className="text-gray-700 text-sm">上传本地数据</p>
                  <p className="text-gray-400 text-xs">将本地数据上传到 GitHub，覆盖云端数据</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-xs font-medium mb-2">使用说明：</p>
              <ul className="text-yellow-700 text-xs space-y-1">
                <li>• 每次保存数据时会自动同步到 GitHub（如果已配置）</li>
                <li>• 在新设备上，先配置 GitHub，然后点击"从 GitHub 下载"</li>
                <li>• Token 需要 repo 权限（用于读写仓库内容）</li>
                <li>• 建议定期手动同步以确保数据安全</li>
              </ul>
            </div>
          </div>
        </div>
      );
    };

    const AIConfigPanel = () => {
      const [config, setConfig] = useState<AIConfig>(getAIConfig());
      const [testing, setTesting] = useState(false);
      const [message, setMessage] = useState('');

      const handleSaveConfig = () => {
        saveAIConfig(config);
        setMessage('配置已保存');
        setTimeout(() => setMessage(''), 3000);
      };

      const handleTestConnection = async () => {
        setTesting(true);
        saveAIConfig(config);
        const result = await testAIConnection();
        setMessage(result.message);
        setTesting(false);
        setTimeout(() => setMessage(''), 5000);
      };

      const handleResetConfig = () => {
        if (confirm('确定要恢复默认配置吗？')) {
          resetAIConfig();
          setConfig(getAIConfig());
          setMessage('已恢复默认配置');
          setTimeout(() => setMessage(''), 3000);
        }
      };

      return (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-gray-900 text-sm font-medium mb-4">AI 摄影评审配置</h3>
            
            {message && (
              <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
                message.includes('成功') ? 'bg-green-50 text-green-600 border border-green-200' :
                message.includes('失败') || message.includes('错误') || message.includes('无效') ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
                <p className="text-gray-400 text-xs mt-1">
                  已内置免费 API 密钥，可直接使用或替换为自己的密钥
                </p>
              </div>

              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">API Base URL</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="https://api.agnes-ai.cn/v1"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">模型名称</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={e => setConfig({ ...config, model: e.target.value })}
                  placeholder="agnes-2.5-flash"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6 flex-wrap">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                保存配置
              </button>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100 border border-purple-200 disabled:opacity-50"
              >
                {testing ? '测试中...' : '测试连接'}
              </button>
              <button
                onClick={handleResetConfig}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 border border-red-200"
              >
                恢复默认
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-gray-900 text-sm font-medium mb-4">使用说明</h3>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-800 text-xs font-medium mb-2">AI 摄影评审功能：</p>
              <ul className="text-purple-700 text-xs space-y-1">
                <li>• 在足迹页面点击照片的"详情"按钮</li>
                <li>• 点击"AI 智能评分"按钮进行智能分析</li>
                <li>• AI 会从构图、光影、色彩、主题、技术五个维度评分</li>
                <li>• 提供详细的优点和改进建议</li>
                <li>• 已内置免费 API 密钥，可直接使用</li>
                <li>• 支持自定义接入其他兼容 OpenAI 格式的 API</li>
              </ul>
            </div>
          </div>
        </div>
      );
    };

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
              { id: 'wishes', label: '愿望' },
              { id: 'github', label: '云同步' },
              { id: 'ai', label: 'AI配置' }
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

          {/* GitHub Sync Tab */}
          {adminTab === 'github' && <GitHubSyncPanel />}

          {/* AI Config Tab */}
          {adminTab === 'ai' && <AIConfigPanel />}

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

  const notifications = getNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'birthday', label: t('birthday') },
    { id: 'footprints', label: t('footprints') },
    { id: 'friendwall', label: t('friendwall') },
    { id: 'achievements', label: t('achievements') },
    { id: 'challenges', label: '挑战' },
    { id: 'timecapsule', label: '时间胶囊' },
    { id: 'annual', label: '年度报告' },
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50"
                title="搜索"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 relative"
                title="通知"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleToggleDarkMode}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50"
                title="深色模式"
              >
                {darkMode ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleToggleLang}
                className="px-2 py-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium"
                title="切换语言"
              >
                {lang === 'zh' ? 'EN' : '中'}
              </button>
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

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 w-full max-w-lg shadow-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索照片、愿望、好友..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-sm focus:border-gray-400 focus:outline-none mb-3"
              autoFocus
            />
            {searchQuery && (() => {
              const results = searchAll(data, searchQuery);
              return (
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {results.photos.length > 0 && (
                    <div>
                      <h4 className="text-xs text-gray-500 font-medium mb-1">照片 ({results.photos.length})</h4>
                      {results.photos.slice(0, 5).map(p => (
                        <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => { setCurrentPage('footprints'); setShowSearch(false); }}>
                          <img src={p.src} alt="" className="w-8 h-8 rounded object-cover" />
                          <span className="text-sm text-gray-700 truncate">{p.caption}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.wishes.length > 0 && (
                    <div>
                      <h4 className="text-xs text-gray-500 font-medium mb-1">愿望 ({results.wishes.length})</h4>
                      {results.wishes.slice(0, 5).map(w => (
                        <div key={w.id} className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => { setCurrentPage('birthday'); setShowSearch(false); }}>
                          <span className="text-sm text-gray-700">{w.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.friends.length > 0 && (
                    <div>
                      <h4 className="text-xs text-gray-500 font-medium mb-1">好友 ({results.friends.length})</h4>
                      {results.friends.slice(0, 5).map(f => (
                        <div key={f.id} className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => { setCurrentPage('friendwall'); setShowSearch(false); }}>
                          <span className="text-sm text-gray-700">{f.name} - {f.group}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.photos.length + results.wishes.length + results.friends.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">没有找到相关内容</p>
                  )}
                </div>
              );
            })()}
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="mt-3 w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-end p-4 pt-16">
          <div className="bg-white rounded-xl p-4 border border-gray-100 w-full max-w-sm shadow-lg max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">通知</h3>
              <button
                onClick={() => {
                  const all = getNotifications();
                  all.forEach(n => n.read = true);
                  saveNotifications(all);
                  setRefreshKey(k => k + 1);
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                全部已读
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">暂无通知</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 20).map(n => (
                  <div key={n.id} className={`p-3 rounded-lg border ${n.read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowNotifications(false)}
              className="mt-3 w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="pt-14 pb-16 md:pb-0">
        {currentPage === 'home' && <Home user={user} onNavigate={handleNavigate} />}
        {currentPage === 'birthday' && <Birthday user={user} onDataUpdate={handleDataUpdate} />}
        {currentPage === 'footprints' && <Footprints user={user} onDataUpdate={handleDataUpdate} />}
        {currentPage === 'friendwall' && <FriendWall user={user} onDataUpdate={handleDataUpdate} />}
        {currentPage === 'achievements' && <Achievements user={user} onDataUpdate={handleDataUpdate} />}
        {currentPage === 'challenges' && <ChallengesPage user={user} onDataUpdate={handleDataUpdate} />}
        {currentPage === 'timecapsule' && <TimeCapsulePage user={user} />}
        {currentPage === 'annual' && <AnnualReportPage user={user} />}
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
