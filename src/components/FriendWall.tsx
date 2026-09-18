import React, { useState } from 'react';
import { User, loadData, saveData, generateId, Friend, Photo, getLevelLabel } from '../store';
import { CameraAnimation } from './CameraAnimation';
import { getFriendMessages, saveFriendMessage, FriendMessage, getAnniversaries, saveAnniversary, getDaysSince, FriendshipAnniversary } from '../utils';

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
  const [newMessage, setNewMessage] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [showAnniversaryInput, setShowAnniversaryInput] = useState(false);

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
    const ach = data.achievements.find(a => a.id === 'ach-2' && a.username === user.username);
    if (ach && !ach.unlocked) ach.unlocked = true;
    if (userFriends.length + 1 >= 5) {
      const ach2 = data.achievements.find(a => a.id === 'ach-7' && a.username === user.username);
      if (ach2 && !ach2.unlocked) ach2.unlocked = true;
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
    // 友谊等级升级更缓慢
    const score = count * 0.5 + avgScore * 2;
    if (score >= 100) return 6;
    if (score >= 70) return 5;
    if (score >= 45) return 4;
    if (score >= 25) return 3;
    if (score >= 10) return 2;
    return 1;
  };

  const handleAddMessage = () => {
    if (!newMessage.trim() || !selectedFriend) return;
    const message: FriendMessage = {
      id: generateId(),
      friendId: selectedFriend.id,
      text: newMessage,
      date: new Date().toISOString(),
      fromUser: user.username
    };
    saveFriendMessage(message);
    setNewMessage('');
  };

  const handleSaveAnniversary = () => {
    if (!anniversaryDate || !selectedFriend) return;
    const anniversary: FriendshipAnniversary = {
      friendId: selectedFriend.id,
      startDate: anniversaryDate,
      username: user.username
    };
    saveAnniversary(anniversary);
    setAnniversaryDate('');
    setShowAnniversaryInput(false);
  };

  const getAnniversaryDays = (friendId: string): number | null => {
    const anniversaries = getAnniversaries(user.username);
    const ann = anniversaries.find(a => a.friendId === friendId);
    if (ann) {
      return getDaysSince(ann.startDate);
    }
    return null;
  };

  // Friend detail view
  if (selectedFriend) {
    const friendLevel = getFriendLevel(selectedFriend);
    const levelLabel = getLevelLabel(friendLevel);

    return (
      <div className="min-h-screen bg-white p-6 md:p-10">
        {showCamera && (
          <CameraAnimation
            onComplete={handleCameraComplete}
            onCancel={() => setShowCamera(false)}
          />
        )}

        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedFriend(null)}
            className="text-gray-400 hover:text-gray-600 mb-6 text-sm transition-colors"
          >
            ← 返回
          </button>

          {/* Friend Header */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-light text-gray-900">{selectedFriend.name}</h2>
                <p className="text-gray-400 text-xs mt-1">分组: {selectedFriend.group}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-light text-gray-900">Lv.{friendLevel}</div>
                <div className="text-gray-400 text-xs">{levelLabel}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 transition-all"
                  style={{ width: `${(friendLevel / 6) * 100}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                {selectedFriend.photos.length} 张合照 · 友谊等级 Lv.{friendLevel}
              </p>
            </div>

            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => setShowCamera(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                拍摄
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                上传照片
              </button>
              {user.isAdmin && (
                <button
                  onClick={() => handleDeleteFriend(selectedFriend.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm hover:bg-red-50 hover:text-red-500"
                >
                  删除好友
                </button>
              )}
            </div>

            {showUpload && (
              <div className="mt-3">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="friend-upload" />
                <label htmlFor="friend-upload" className="px-4 py-2 bg-gray-900 text-white rounded-lg cursor-pointer inline-block text-sm hover:bg-gray-800">
                  选择照片
                </label>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedFriend.photos.map(photo => (
              <div key={photo.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group relative">
                <img src={photo.src} alt={photo.caption} className="w-full h-36 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-xs">{photo.caption}</p>
                  <p className="text-white/60 text-xs">{new Date(photo.date).toLocaleDateString('zh-CN')}</p>
                </div>
                {user.isAdmin && (
                  <button
                    onClick={() => handleDeletePhoto(selectedFriend.id, photo.id)}
                    className="absolute top-2 right-2 bg-white/90 text-gray-600 text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedFriend.photos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">还没有和 {selectedFriend.name} 的合照</p>
              <p className="text-gray-300 text-xs mt-1">拍摄或上传照片来记录你们的友谊吧</p>
            </div>
          )}

          {/* Anniversary Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-8">
            <h3 className="text-gray-900 text-sm font-medium mb-4">友谊纪念日</h3>
            {(() => {
              const days = getAnniversaryDays(selectedFriend.id);
              if (days !== null) {
                return (
                  <div className="text-center py-4">
                    <div className="text-3xl font-light text-gray-900 mb-2">{days}</div>
                    <div className="text-gray-500 text-sm">天</div>
                    <div className="text-gray-400 text-xs mt-2">
                      从 {getAnniversaries(user.username).find(a => a.friendId === selectedFriend.id)?.startDate} 开始
                    </div>
                  </div>
                );
              }
              return (
                <div>
                  {showAnniversaryInput ? (
                    <div className="space-y-3">
                      <input
                        type="date"
                        value={anniversaryDate}
                        onChange={e => setAnniversaryDate(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveAnniversary}
                          className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setShowAnniversaryInput(false)}
                          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAnniversaryInput(true)}
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                    >
                      设置纪念日
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Message Board */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-8">
            <h3 className="text-gray-900 text-sm font-medium mb-4">留言板</h3>
            
            {/* Add message */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="写下你想对 TA 说的话..."
                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && handleAddMessage()}
              />
              <button
                onClick={handleAddMessage}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                留言
              </button>
            </div>

            {/* Messages list */}
            <div className="space-y-3">
              {getFriendMessages(selectedFriend.id).map(msg => (
                <div key={msg.id} className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-gray-900 text-sm font-medium">{msg.fromUser}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(msg.date).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{msg.text}</p>
                </div>
              ))}
            </div>

            {getFriendMessages(selectedFriend.id).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">还没有留言，快来写下第一条吧</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Friend wall main view
  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-light text-gray-900">友谊墙</h1>
            <p className="text-gray-400 text-sm mt-1">记录与每一位朋友的珍贵时光</p>
          </div>
          <button
            onClick={() => setShowAddFriend(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            添加好友
          </button>
        </div>

        {/* Add Friend Modal */}
        {showAddFriend && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100 w-full max-w-sm shadow-lg">
              <h3 className="text-gray-900 text-sm font-medium mb-4">添加好友</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newFriendName}
                  onChange={e => setNewFriendName(e.target.value)}
                  placeholder="朋友名字"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={newFriendGroup}
                  onChange={e => setNewFriendGroup(e.target.value)}
                  placeholder="分组（如：摄影友、同学、同事）"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddFriend}
                  className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  添加
                </button>
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
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
            <h3 className="text-gray-900 text-sm font-medium mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              {group}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userFriends.filter(f => f.group === group).map(friend => {
                const friendLevel = getFriendLevel(friend);
                return (
                  <div
                    key={friend.id}
                    className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group"
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                          {friend.name[0]}
                        </div>
                        <div>
                          <h4 className="text-gray-900 text-sm font-medium">{friend.name}</h4>
                          <p className="text-gray-400 text-xs">{friend.photos.length} 张合照</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-900 text-sm font-light">Lv.{friendLevel}</span>
                        {(() => {
                          const days = getAnniversaryDays(friend.id);
                          if (days !== null) {
                            return (
                              <div className="text-gray-400 text-xs mt-1">
                                {days} 天
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs italic">
                      {getLevelLabel(friendLevel)}
                    </div>
                    {(() => {
                      const messages = getFriendMessages(friend.id);
                      if (messages.length > 0) {
                        return (
                          <div className="mt-2 text-gray-400 text-xs">
                            {messages.length} 条留言
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {user.isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFriend(friend.id); }}
                        className="mt-2 text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
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
            <p className="text-gray-400 text-sm">友谊墙还是空的</p>
            <p className="text-gray-300 text-xs mt-1">添加你的第一个好友吧</p>
          </div>
        )}
      </div>
    </div>
  );
};
