import React, { useState } from 'react';
import { User, loadData, saveData, generateId, Friend, Photo, calculateLevel, getLevelLabel } from '../store';
import { CameraAnimation } from './CameraAnimation';

interface FriendWallProps {
  user: User;
  onDataUpdate: () => void;
}

export const FriendWall: React.FC<FriendWallProps> = ({ user, onDataUpdate }) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendGroup, setNewFriendGroup] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);

  const data = loadData();
  const userFriends = data.friends.filter(f => f.username === user.username);
  const groups = [...new Set(userFriends.map(f => f.group))];

  const handleAddFriend = () => {
    if (!newFriendName.trim() || !newFriendGroup.trim()) return;
    const friend: Friend = {
      id: generateId(),
      name: newFriendName,
      group: newFriendGroup,
      photos: [],
      username: user.username
    };
    data.friends.push(friend);
    // Unlock friend achievement
    const ach = data.achievements.find(a => a.id === 'ach-2' && a.username === user.username);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
    }
    // Check for 5 friends achievement
    if (userFriends.length + 1 >= 5) {
      const ach2 = data.achievements.find(a => a.id === 'ach-7' && a.username === user.username);
      if (ach2 && !ach2.unlocked) {
        ach2.unlocked = true;
      }
    }
    saveData(data);
    setNewFriendName('');
    setNewFriendGroup('');
    setShowAddFriend(false);
    onDataUpdate();
  };

  const handleCameraComplete = (imageData: string) => {
    if (selectedFriend) {
      const photo: Photo = {
        id: generateId(),
        src: imageData,
        caption: `与 ${selectedFriend.name} 的回忆`,
        score: 0,
        date: new Date().toISOString(),
        username: user.username
      };
      const idx = data.friends.findIndex(f => f.id === selectedFriend.id);
      if (idx !== -1) {
        data.friends[idx].photos.push(photo);
        saveData(data);
        setSelectedFriend(data.friends[idx]);
        onDataUpdate();
      }
    }
    setShowCamera(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedFriend) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const photo: Photo = {
          id: generateId(),
          src: result,
          caption: `与 ${selectedFriend.name} 的回忆`,
          score: 0,
          date: new Date().toISOString(),
          username: user.username
        };
        const idx = data.friends.findIndex(f => f.id === selectedFriend.id);
        if (idx !== -1) {
          data.friends[idx].photos.push(photo);
          saveData(data);
          setSelectedFriend(data.friends[idx]);
          onDataUpdate();
        }
      };
      reader.readAsDataURL(file);
    }
    setShowUpload(false);
  };

  const handleDeleteFriend = (friendId: string) => {
    data.friends = data.friends.filter(f => f.id !== friendId);
    saveData(data);
    setSelectedFriend(null);
    onDataUpdate();
  };

  const handleDeletePhoto = (friendId: string, photoId: string) => {
    const idx = data.friends.findIndex(f => f.id === friendId);
    if (idx !== -1) {
      data.friends[idx].photos = data.friends[idx].photos.filter(p => p.id !== photoId);
      saveData(data);
      if (selectedFriend && selectedFriend.id === friendId) {
        setSelectedFriend(data.friends[idx]);
      }
      onDataUpdate();
    }
  };

  const getFriendLevel = (friend: Friend): number => {
    const count = friend.photos.length;
    const avgScore = count > 0 ? friend.photos.reduce((s, p) => s + p.score, 0) / count : 0;
    return calculateLevel(count, avgScore);
  };

  // Friend detail view
  if (selectedFriend) {
    const friendLevel = getFriendLevel(selectedFriend);
    const levelLabel = getLevelLabel(friendLevel);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-4 md:p-8">
        {showCamera && (
          <CameraAnimation
            onComplete={handleCameraComplete}
            onCancel={() => setShowCamera(false)}
          />
        )}

        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setSelectedFriend(null)}
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
          >
            ← 返回友谊墙
          </button>

          {/* Friend Header */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedFriend.name}</h2>
                <p className="text-gray-400">分组: {selectedFriend.group}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">Lv.{friendLevel}</div>
                <div className="text-gray-400 text-sm">{levelLabel}</div>
              </div>
            </div>

            {/* Level progress */}
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${(friendLevel / 6) * 100}%` }}
                ></div>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {selectedFriend.photos.length} 张合照 | 友谊等级 Lv.{friendLevel}
              </p>
            </div>

            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                onClick={() => setShowCamera(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold"
              >
                📷 拍摄
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                📁 上传照片
              </button>
              {user.isAdmin && (
                <button
                  onClick={() => handleDeleteFriend(selectedFriend.id)}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg text-sm"
                >
                  删除好友
                </button>
              )}
            </div>

            {showUpload && (
              <div className="mt-3">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="friend-upload" />
                <label htmlFor="friend-upload" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer inline-block text-sm">
                  选择照片
                </label>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedFriend.photos.map(photo => (
              <div key={photo.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 group relative">
                <img src={photo.src} alt={photo.caption} className="w-full h-40 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs">{photo.caption}</p>
                  <p className="text-gray-400 text-xs">{new Date(photo.date).toLocaleDateString('zh-CN')}</p>
                </div>
                {user.isAdmin && (
                  <button
                    onClick={() => handleDeletePhoto(selectedFriend.id, photo.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedFriend.photos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📸</div>
              <p className="text-gray-400">还没有和 {selectedFriend.name} 的合照</p>
              <p className="text-gray-500 text-sm mt-2">拍摄或上传照片来记录你们的友谊吧！</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Friend wall main view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🤝 友谊墙</h1>
          <p className="text-gray-400">记录与每一位朋友的珍贵时光</p>
        </div>

        {/* Add Friend Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAddFriend(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all transform hover:scale-105"
          >
            + 添加好友
          </button>
        </div>

        {/* Add Friend Modal */}
        {showAddFriend && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 w-full max-w-sm">
              <h3 className="text-white text-lg font-bold mb-4">添加好友</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newFriendName}
                  onChange={e => setNewFriendName(e.target.value)}
                  placeholder="朋友名字"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={newFriendGroup}
                  onChange={e => setNewFriendGroup(e.target.value)}
                  placeholder="分组（如：篮球友、摄影友、同学）"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddFriend}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  添加
                </button>
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Friends by Group */}
        {groups.map(group => (
          <div key={group} className="mb-8">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {group}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userFriends.filter(f => f.group === group).map(friend => {
                const friendLevel = getFriendLevel(friend);
                return (
                  <div
                    key={friend.id}
                    className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {friend.name[0]}
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{friend.name}</h4>
                          <p className="text-gray-500 text-xs">{friend.photos.length} 张合照</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-400 font-bold">Lv.{friendLevel}</span>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm italic">
                      "{getLevelLabel(friendLevel)}"
                    </div>
                    {user.isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFriend(friend.id); }}
                        className="mt-2 text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        删除
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {userFriends.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤝</div>
            <p className="text-gray-400 text-lg">友谊墙还是空的</p>
            <p className="text-gray-500 text-sm mt-2">添加你的第一个好友吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};
