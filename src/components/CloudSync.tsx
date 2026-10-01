import React, { useState } from 'react';
import { User, loadData, saveData, syncFromGitHub, syncToGitHub, exportData, importData } from '../store';
import { getGitHubConfig, saveGitHubConfig, isGitHubConfigured, testGitHubConnection, GitHubConfig } from '../github-storage';

interface CloudSyncProps {
  user: User;
  onDataUpdate: () => void;
}

export const CloudSync: React.FC<CloudSyncProps> = ({ user, onDataUpdate }) => {
  const [config, setConfig] = useState<GitHubConfig>(getGitHubConfig() || {
    token: '',
    owner: '',
    repo: '',
    path: 'data/app-data.json'
  });
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

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `friendship-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('数据已导出');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (importData(result)) {
          setMessage('数据导入成功');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setMessage('数据导入失败，文件格式不正确');
          setTimeout(() => setMessage(''), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-900">云同步</h1>
          <p className="text-gray-400 text-sm mt-1">管理你的数据备份和同步</p>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.includes('成功') ? 'bg-green-50 text-green-600 border border-green-200' :
            message.includes('失败') || message.includes('错误') || message.includes('无效') ? 'bg-red-50 text-red-600 border border-red-200' :
            'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* 数据同步 */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
          <h3 className="text-gray-900 text-sm font-medium mb-4">数据同步</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <button
                onClick={handleSyncFromGitHub}
                disabled={syncing || !isGitHubConfigured()}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 border border-green-200 disabled:opacity-50"
              >
                {syncing ? '同步中...' : '从云端下载'}
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
                {syncing ? '上传中...' : '上传到云端'}
              </button>
              <div>
                <p className="text-gray-700 text-sm">上传本地数据</p>
                <p className="text-gray-400 text-xs">将本地数据上传到 GitHub，覆盖云端数据</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-xs font-medium mb-2">自动同步说明：</p>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• 每次保存数据时会自动同步到 GitHub</li>
              <li>• 打开网站时会自动检查并下载最新数据</li>
              <li>• 建议定期手动同步以确保数据安全</li>
            </ul>
          </div>
        </div>

        {/* 本地备份 */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
          <h3 className="text-gray-900 text-sm font-medium mb-4">本地备份</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 border border-blue-200"
              >
                导出数据
              </button>
              <div>
                <p className="text-gray-700 text-sm">导出到本地</p>
                <p className="text-gray-400 text-xs">将所有数据导出为 JSON 文件保存到本地</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <label className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm hover:bg-orange-100 border border-orange-200 cursor-pointer">
                导入数据
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <div>
                <p className="text-gray-700 text-sm">从本地导入</p>
                <p className="text-gray-400 text-xs">从之前导出的 JSON 文件恢复数据</p>
              </div>
            </div>
          </div>
        </div>

        {/* 云同步配置 */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 className="text-gray-900 text-sm font-medium mb-4">云同步配置</h3>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-xs font-medium mb-2">配置说明</p>
            <p className="text-blue-700 text-xs">请在下方填写 GitHub Token 和仓库信息，然后点击"保存配置"启用云同步。</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-500 text-xs mb-1.5 block font-medium">GitHub Token</label>
              <input
                type="password"
                value={config.token}
                onChange={e => setConfig({ ...config, token: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxx 或 github_pat_xxxxxxxxxxxx"
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
              />
              <p className="text-gray-400 text-xs mt-1">
                在 GitHub Settings → Developer settings → Personal access tokens 创建，需要 repo 权限
              </p>
            </div>

            <div>
              <label className="text-gray-500 text-xs mb-1.5 block font-medium">仓库所有者</label>
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
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-xs font-medium mb-2">首次配置步骤：</p>
            <ol className="text-yellow-700 text-xs space-y-1 list-decimal list-inside">
              <li>在 GitHub 创建 Personal Access Token（需要 repo 权限）</li>
              <li>将 Token 填入上方"GitHub Token"输入框</li>
              <li>填写仓库所有者和仓库名称</li>
              <li>点击"保存配置"</li>
              <li>点击"测试连接"验证配置是否成功</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
