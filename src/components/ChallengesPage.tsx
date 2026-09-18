import React, { useState } from 'react';
import { User, loadData, saveData } from '../store';
import { getChallenges, saveChallenges, Challenge } from '../utils';

interface ChallengesPageProps {
  user: User;
  onDataUpdate: () => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ user, onDataUpdate }) => {
  const [challenges, setChallengesState] = useState<Challenge[]>(getChallenges());
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const handleComplete = (challengeId: string, photoId: string) => {
    const updated = challenges.map(c => 
      c.id === challengeId ? { ...c, completed: true, photoId } : c
    );
    saveChallenges(updated);
    setChallengesState(updated);
    setSelectedChallenge(null);
    onDataUpdate();
  };

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-900">摄影挑战</h1>
          <p className="text-gray-400 text-sm mt-1">完成每月摄影主题挑战，提升你的摄影技术</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm font-medium">本月进度</p>
              <p className="text-gray-400 text-xs mt-1">{completedCount}/{challenges.length} 个挑战已完成</p>
            </div>
            <div className="text-2xl font-light text-gray-900">
              {Math.round((completedCount / challenges.length) * 100)}%
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gray-900 transition-all"
              style={{ width: `${(completedCount / challenges.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map(challenge => (
            <div 
              key={challenge.id}
              className={`bg-gray-50 rounded-xl p-5 border transition-all cursor-pointer ${
                challenge.completed 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
              onClick={() => !challenge.completed && setSelectedChallenge(challenge)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-gray-900 text-sm font-medium">{challenge.title}</h3>
                {challenge.completed && (
                  <span className="text-xs text-green-600 font-medium">已完成</span>
                )}
              </div>
              <p className="text-gray-500 text-xs mb-3">{challenge.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">主题: {challenge.theme}</span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs text-gray-400">
                  {new Date(challenge.endDate).toLocaleDateString('zh-CN')} 截止
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedChallenge && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100 w-full max-w-md shadow-lg">
              <h3 className="text-gray-900 text-sm font-medium mb-2">{selectedChallenge.title}</h3>
              <p className="text-gray-500 text-xs mb-4">{selectedChallenge.description}</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = ev.target?.result as string;
                      const data = loadData();
                      const photoId = `challenge-${Date.now()}`;
                      data.photos.push({
                        id: photoId,
                        src: result,
                        caption: `[挑战] ${selectedChallenge.title}`,
                        score: 0,
                        date: new Date().toISOString(),
                        username: user.username,
                        tags: [selectedChallenge.theme]
                      });
                      saveData(data);
                      handleComplete(selectedChallenge.id, photoId);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="challenge-upload"
              />
              <label htmlFor="challenge-upload" className="block w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 text-center cursor-pointer">
                上传作品
              </label>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="mt-2 w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
