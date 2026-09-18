import React, { useState } from 'react';
import { User, generateId } from '../store';
import { getTimeCapsules, saveTimeCapsules, TimeCapsule } from '../utils';

interface TimeCapsulePageProps {
  user: User;
}

export const TimeCapsulePage: React.FC<TimeCapsulePageProps> = ({ user }) => {
  const [capsules, setCapsules] = useState<TimeCapsule[]>(getTimeCapsules());
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [openDate, setOpenDate] = useState('');

  const handleCreate = () => {
    if (!title || !content || !openDate) return;
    const newCapsule: TimeCapsule = {
      id: generateId(),
      title,
      content,
      openDate,
      createDate: new Date().toISOString(),
      opened: false,
      username: user.username
    };
    const updated = [...capsules, newCapsule];
    saveTimeCapsules(updated);
    setCapsules(updated);
    setShowCreate(false);
    setTitle('');
    setContent('');
    setOpenDate('');
  };

  const handleOpen = (id: string) => {
    const updated = capsules.map(c => 
      c.id === id ? { ...c, opened: true } : c
    );
    saveTimeCapsules(updated);
    setCapsules(updated);
  };

  const canOpen = (date: string) => new Date(date) <= new Date();

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-gray-900">时间胶囊</h1>
            <p className="text-gray-400 text-sm mt-1">写给未来的自己，在特定的日子开启</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            创建胶囊
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capsules.map(capsule => (
            <div 
              key={capsule.id}
              className={`bg-gray-50 rounded-xl p-5 border transition-all ${
                capsule.opened ? 'border-green-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-gray-900 text-sm font-medium">{capsule.title}</h3>
                {capsule.opened && (
                  <span className="text-xs text-green-600 font-medium">已开启</span>
                )}
              </div>
              {capsule.opened ? (
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{capsule.content}</p>
              ) : (
                <p className="text-gray-400 text-xs">内容将在开启日期后可见</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-400">
                  创建: {new Date(capsule.createDate).toLocaleDateString('zh-CN')}
                </span>
                <span className="text-xs text-gray-400">
                  开启: {new Date(capsule.openDate).toLocaleDateString('zh-CN')}
                </span>
              </div>
              {!capsule.opened && canOpen(capsule.openDate) && (
                <button
                  onClick={() => handleOpen(capsule.id)}
                  className="mt-3 w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  开启胶囊
                </button>
              )}
              {!capsule.opened && !canOpen(capsule.openDate) && (
                <div className="mt-3 text-center">
                  <span className="text-xs text-gray-400">
                    还有 {Math.ceil((new Date(capsule.openDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 天
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {capsules.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">还没有时间胶囊</p>
            <p className="text-gray-300 text-xs mt-1">创建一个胶囊，写给未来的自己</p>
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100 w-full max-w-md shadow-lg">
              <h3 className="text-gray-900 text-sm font-medium mb-4">创建时间胶囊</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="标题"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="写给未来的自己..."
                  rows={5}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none resize-none"
                />
                <div>
                  <label className="text-gray-500 text-xs mb-1.5 block">开启日期</label>
                  <input
                    type="date"
                    value={openDate}
                    onChange={e => setOpenDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreate}
                  className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  创建
                </button>
                <button
                  onClick={() => setShowCreate(false)}
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
