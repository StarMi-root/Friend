import React from 'react';
import { User, loadData } from '../store';
import { generateAnnualReport, getStreakData, getActivityCalendar } from '../utils';

interface AnnualReportPageProps {
  user: User;
}

export const AnnualReportPage: React.FC<AnnualReportPageProps> = ({ user }) => {
  const data = loadData();
  const report = generateAnnualReport(data, user.username);
  const streak = getStreakData();
  const calendar = getActivityCalendar();

  // Generate activity calendar for last 90 days
  const last90Days = Array.from({ length: 90 }, (_, i) => {
    const date = new Date(Date.now() - (89 - i) * 86400000);
    const dateStr = date.toISOString().split('T')[0];
    const activity = calendar.find(a => a.date === dateStr);
    return {
      date: dateStr,
      level: activity ? activity.level : 0
    };
  });

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-900">{report.year} 年度报告</h1>
          <p className="text-gray-400 text-sm mt-1">回顾你这一年的精彩瞬间</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="text-2xl font-light text-gray-900">{report.totalPhotos}</div>
            <div className="text-gray-400 text-xs mt-1">摄影作品</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="text-2xl font-light text-gray-900">{report.totalWishes}</div>
            <div className="text-gray-400 text-xs mt-1">许愿次数</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="text-2xl font-light text-gray-900">{report.totalFriends}</div>
            <div className="text-gray-400 text-xs mt-1">好友数量</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="text-2xl font-light text-gray-900">{report.achievements}</div>
            <div className="text-gray-400 text-xs mt-1">解锁成就</div>
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
          <h3 className="text-gray-900 text-sm font-medium mb-4">年度亮点</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">平均作品评分</span>
              <span className="text-gray-900 text-sm font-medium">{report.avgPhotoScore}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">最常拍摄主题</span>
              <span className="text-gray-900 text-sm font-medium">{report.topTag}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">最活跃月份</span>
              <span className="text-gray-900 text-sm font-medium">{report.favoriteMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">最长连续打卡</span>
              <span className="text-gray-900 text-sm font-medium">{streak.longestStreak} 天</span>
            </div>
          </div>
        </div>

        {/* Activity Calendar */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
          <h3 className="text-gray-900 text-sm font-medium mb-4">活跃度日历 (近90天)</h3>
          <div className="grid grid-cols-15 gap-1">
            {last90Days.map((day, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${
                  day.level === 0 ? 'bg-gray-200' :
                  day.level === 1 ? 'bg-gray-400' :
                  day.level === 2 ? 'bg-gray-600' :
                  day.level === 3 ? 'bg-gray-800' :
                  'bg-gray-900'
                }`}
                title={`${day.date}: ${day.level > 0 ? `${day.level} 次活动` : '无活动'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <span>少</span>
            <div className="w-3 h-3 bg-gray-200 rounded-sm" />
            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
            <div className="w-3 h-3 bg-gray-600 rounded-sm" />
            <div className="w-3 h-3 bg-gray-800 rounded-sm" />
            <div className="w-3 h-3 bg-gray-900 rounded-sm" />
            <span>多</span>
          </div>
        </div>

        {/* Streak Info */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 className="text-gray-900 text-sm font-medium mb-4">打卡统计</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-light text-gray-900">{streak.currentStreak}</div>
              <div className="text-gray-400 text-xs mt-1">当前连续</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-light text-gray-900">{streak.longestStreak}</div>
              <div className="text-gray-400 text-xs mt-1">最长连续</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-light text-gray-900">{streak.totalActiveDays}</div>
              <div className="text-gray-400 text-xs mt-1">总活跃天数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
