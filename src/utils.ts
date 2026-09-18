import type { AppData, Photo, Wish, Friend, Achievement, User } from './store';

// Dark mode
export function initDarkMode(): void {
  const saved = localStorage.getItem('dark-mode');
  if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

export function toggleDarkMode(): boolean {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('dark-mode', String(isDark));
  return isDark;
}

export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

// Image compression
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// EXIF-like info generator (simulated for Canon R50)
export interface ExifInfo {
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  date: string;
}

export function generateExif(date: string): ExifInfo {
  const lenses = ['RF-S 18-45mm f/4.5-6.3', 'RF 50mm f/1.8', 'RF-S 55-210mm f/5-7.1', 'RF 24mm f/1.8'];
  const focalLengths = ['18mm', '24mm', '35mm', '50mm', '85mm', '135mm', '200mm'];
  const apertures = ['f/1.8', 'f/2.0', 'f/2.8', 'f/4.0', 'f/5.6', 'f/8.0'];
  const shutters = ['1/60', '1/125', '1/250', '1/500', '1/1000', '1/2000'];
  const isos = ['100', '200', '400', '800', '1600', '3200'];
  
  const hash = date.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    camera: 'Canon EOS R50',
    lens: lenses[hash % lenses.length],
    focalLength: focalLengths[hash % focalLengths.length],
    aperture: apertures[(hash * 3) % apertures.length],
    shutterSpeed: shutters[(hash * 7) % shutters.length],
    iso: isos[(hash * 11) % isos.length],
    date: new Date(date).toLocaleString('zh-CN')
  };
}

// Search utility
export function searchAll(data: AppData, query: string): {
  photos: Photo[];
  wishes: Wish[];
  friends: Friend[];
} {
  const q = query.toLowerCase();
  return {
    photos: data.photos.filter((p: Photo) => 
      p.caption.toLowerCase().includes(q) || 
      (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q))) ||
      (p.diary && p.diary.toLowerCase().includes(q))
    ),
    wishes: data.wishes.filter((w: Wish) => w.text.toLowerCase().includes(q)),
    friends: data.friends.filter((f: Friend) => 
      f.name.toLowerCase().includes(q) || 
      f.group.toLowerCase().includes(q)
    ),
  };
}

// Photo tags
export const DEFAULT_TAGS = ['风景', '人像', '街拍', '建筑', '美食', '动物', '运动', '黑白', '夜景', '微距'];

// Achievement rarity
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export function getRarityLabel(rarity: Rarity): string {
  const labels: Record<Rarity, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  };
  return labels[rarity];
}

export function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    common: 'bg-gray-100 text-gray-600 border-gray-200',
    rare: 'bg-blue-50 text-blue-600 border-blue-200',
    epic: 'bg-purple-50 text-purple-600 border-purple-200',
    legendary: 'bg-amber-50 text-amber-600 border-amber-200'
  };
  return colors[rarity];
}

// Streak tracking
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalActiveDays: number;
}

export function getStreakData(): StreakData {
  const stored = localStorage.getItem('streak-data');
  if (stored) return JSON.parse(stored);
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', totalActiveDays: 0 };
}

export function updateStreak(): StreakData {
  const data = getStreakData();
  const today = new Date().toISOString().split('T')[0];
  
  if (data.lastActiveDate === today) return data;
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (data.lastActiveDate === yesterday) {
    data.currentStreak++;
  } else {
    data.currentStreak = 1;
  }
  
  data.lastActiveDate = today;
  data.totalActiveDays++;
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
  
  localStorage.setItem('streak-data', JSON.stringify(data));
  return data;
}

// Activity calendar
export interface ActivityDay {
  date: string;
  count: number;
  level: number; // 0-4
}

export function getActivityCalendar(): ActivityDay[] {
  const stored = localStorage.getItem('activity-calendar');
  if (stored) return JSON.parse(stored);
  return [];
}

export function recordActivity(): void {
  const calendar = getActivityCalendar();
  const today = new Date().toISOString().split('T')[0];
  
  const existing = calendar.find(d => d.date === today);
  if (existing) {
    existing.count++;
    existing.level = Math.min(4, Math.floor(existing.count / 2));
  } else {
    calendar.push({ date: today, count: 1, level: 1 });
  }
  
  // Keep only last 365 days
  const cutoff = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];
  const filtered = calendar.filter(d => d.date >= cutoff);
  localStorage.setItem('activity-calendar', JSON.stringify(filtered));
}

// Generate share card
export function generateShareCard(title: string, subtitle: string, bgColor = '#111827'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;
  
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 600, 400);
  
  // Border
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 560, 360);
  
  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 300, 180);
  
  // Subtitle
  ctx.fillStyle = '#9ca3af';
  ctx.font = '18px sans-serif';
  ctx.fillText(subtitle, 300, 220);
  
  // Footer
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px sans-serif';
  ctx.fillText('我们的故事 · Canon EOS R50', 300, 350);
  
  return canvas.toDataURL('image/png');
}

// Photography challenge
export interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  photoId?: string;
}

export function getChallenges(): Challenge[] {
  const stored = localStorage.getItem('challenges');
  if (stored) return JSON.parse(stored);
  return getDefaultChallenges();
}

export function saveChallenges(challenges: Challenge[]): void {
  localStorage.setItem('challenges', JSON.stringify(challenges));
}

function getDefaultChallenges(): Challenge[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  return [
    { id: 'c1', title: '光影猎人', description: '拍摄一张利用光影效果的照片', theme: '光影', startDate: monthStart, endDate: monthEnd, completed: false },
    { id: 'c2', title: '城市之眼', description: '用独特视角拍摄城市建筑', theme: '建筑', startDate: monthStart, endDate: monthEnd, completed: false },
    { id: 'c3', title: '色彩大师', description: '拍摄一张色彩鲜明的照片', theme: '色彩', startDate: monthStart, endDate: monthEnd, completed: false },
    { id: 'c4', title: '故事瞬间', description: '捕捉一个有故事感的瞬间', theme: '纪实', startDate: monthStart, endDate: monthEnd, completed: false },
  ];
}

// Time capsule
export interface TimeCapsule {
  id: string;
  title: string;
  content: string;
  openDate: string;
  createDate: string;
  opened: boolean;
  photo?: string;
  username: string;
}

export function getTimeCapsules(): TimeCapsule[] {
  const stored = localStorage.getItem('time-capsules');
  if (stored) return JSON.parse(stored);
  return [];
}

export function saveTimeCapsules(capsules: TimeCapsule[]): void {
  localStorage.setItem('time-capsules', JSON.stringify(capsules));
}

// Notification
export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'birthday' | 'achievement' | 'streak' | 'system';
}

export function getNotifications(): Notification[] {
  const stored = localStorage.getItem('notifications');
  if (stored) return JSON.parse(stored);
  return [];
}

export function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem('notifications', JSON.stringify(notifications));
}

export function addNotification(title: string, message: string, type: Notification['type']): void {
  const notifications = getNotifications();
  notifications.unshift({
    id: Date.now().toString(36),
    title,
    message,
    date: new Date().toISOString(),
    read: false,
    type
  });
  // Keep only last 50
  saveNotifications(notifications.slice(0, 50));
}

// Annual report data
export interface AnnualReport {
  year: number;
  totalPhotos: number;
  totalWishes: number;
  totalFriends: number;
  avgPhotoScore: number;
  topTag: string;
  longestStreak: number;
  favoriteMonth: string;
  achievements: number;
}

export function generateAnnualReport(data: AppData, username: string, year?: number): AnnualReport {
  const targetYear = year || new Date().getFullYear();
  const userPhotos = data.photos.filter(p => p.username === username && new Date(p.date).getFullYear() === targetYear);
  const userWishes = data.wishes.filter(w => w.username === username && new Date(w.date).getFullYear() === targetYear);
  const userFriends = data.friends.filter(f => f.username === username);
  
  // Find top tag
  const tagCount: Record<string, number> = {};
  userPhotos.forEach((p: Photo) => {
    (p.tags || []).forEach((t: string) => { tagCount[t] = (tagCount[t] || 0) + 1; });
  });
  const topTag = Object.entries(tagCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '无';
  
  // Find favorite month
  const monthCount: Record<number, number> = {};
  userPhotos.forEach((p: Photo) => {
    const m = new Date(p.date).getMonth();
    monthCount[m] = (monthCount[m] || 0) + 1;
  });
  const favMonthEntry = Object.entries(monthCount).sort((a, b) => b[1] - a[1])[0];
  const favMonth = favMonthEntry ? parseInt(favMonthEntry[0]) : undefined;
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  const avgScore = userPhotos.length > 0 ? userPhotos.reduce((s, p) => s + p.score, 0) / userPhotos.length : 0;
  const streak = getStreakData();
  const userAchievements = data.achievements.filter(a => a.username === username && a.unlocked);
  
  return {
    year: targetYear,
    totalPhotos: userPhotos.length,
    totalWishes: userWishes.length,
    totalFriends: userFriends.length,
    avgPhotoScore: Math.round(avgScore * 10) / 10,
    topTag,
    longestStreak: streak.longestStreak,
    favoriteMonth: favMonth !== undefined ? monthNames[favMonth] : '无',
    achievements: userAchievements.length
  };
}

// Multi-language
export type Lang = 'zh' | 'en';

export function getLang(): Lang {
  return (localStorage.getItem('lang') as Lang) || 'zh';
}

export function setLang(lang: Lang): void {
  localStorage.setItem('lang', lang);
}

export function t(key: string): string {
  const lang = getLang();
  const translations: Record<string, Record<Lang, string>> = {
    'home': { zh: '首页', en: 'Home' },
    'birthday': { zh: '生日', en: 'Birthday' },
    'footprints': { zh: '足迹', en: 'Footprints' },
    'friendwall': { zh: '友谊墙', en: 'Friend Wall' },
    'achievements': { zh: '成就', en: 'Achievements' },
    'welcome': { zh: '欢迎回来', en: 'Welcome back' },
    'login': { zh: '登录', en: 'Login' },
    'register': { zh: '注册', en: 'Register' },
    'logout': { zh: '退出', en: 'Logout' },
    'admin': { zh: '管理', en: 'Admin' },
    'search': { zh: '搜索...', en: 'Search...' },
    'darkMode': { zh: '深色模式', en: 'Dark Mode' },
    'settings': { zh: '设置', en: 'Settings' },
  };
  return translations[key]?.[lang] || key;
}

// Version history
export interface VersionEntry {
  id: string;
  timestamp: string;
  snapshot: string; // compressed JSON
  label: string;
}

export function getVersionHistory(): VersionEntry[] {
  const stored = localStorage.getItem('version-history');
  if (stored) return JSON.parse(stored);
  return [];
}

export function saveVersion(label: string): void {
  const history = getVersionHistory();
  const data = localStorage.getItem('friendship-app-data');
  if (!data) return;
  
  history.unshift({
    id: Date.now().toString(36),
    timestamp: new Date().toISOString(),
    snapshot: data,
    label
  });
  
  // Keep only last 20 versions
  saveVersions(history.slice(0, 20));
}

export function saveVersions(versions: VersionEntry[]): void {
  localStorage.setItem('version-history', JSON.stringify(versions));
}

export function restoreVersion(versionId: string): boolean {
  const history = getVersionHistory();
  const version = history.find(v => v.id === versionId);
  if (version) {
    localStorage.setItem('friendship-app-data', version.snapshot);
    return true;
  }
  return false;
}

// Gift list for birthday
export interface Gift {
  id: string;
  name: string;
  type: 'received' | 'wanted';
  from?: string;
  date: string;
  username: string;
}

export function getGifts(username: string): Gift[] {
  const stored = localStorage.getItem('gifts');
  if (stored) {
    const all: Gift[] = JSON.parse(stored);
    return all.filter(g => g.username === username);
  }
  return [];
}

export function saveGift(gift: Gift): void {
  const stored = localStorage.getItem('gifts');
  const all: Gift[] = stored ? JSON.parse(stored) : [];
  all.push(gift);
  localStorage.setItem('gifts', JSON.stringify(all));
}

export function deleteGift(giftId: string): void {
  const stored = localStorage.getItem('gifts');
  if (stored) {
    const all: Gift[] = JSON.parse(stored);
    localStorage.setItem('gifts', JSON.stringify(all.filter(g => g.id !== giftId)));
  }
}

// Friend message board
export interface FriendMessage {
  id: string;
  friendId: string;
  text: string;
  date: string;
  fromUser: string;
}

export function getFriendMessages(friendId: string): FriendMessage[] {
  const stored = localStorage.getItem('friend-messages');
  if (stored) {
    const all: FriendMessage[] = JSON.parse(stored);
    return all.filter(m => m.friendId === friendId);
  }
  return [];
}

export function saveFriendMessage(msg: FriendMessage): void {
  const stored = localStorage.getItem('friend-messages');
  const all: FriendMessage[] = stored ? JSON.parse(stored) : [];
  all.push(msg);
  localStorage.setItem('friend-messages', JSON.stringify(all));
}

// Friendship anniversary
export interface FriendshipAnniversary {
  friendId: string;
  startDate: string;
  username: string;
}

export function getAnniversaries(username: string): FriendshipAnniversary[] {
  const stored = localStorage.getItem('friend-anniversaries');
  if (stored) {
    const all: FriendshipAnniversary[] = JSON.parse(stored);
    return all.filter(a => a.username === username);
  }
  return [];
}

export function saveAnniversary(anniversary: FriendshipAnniversary): void {
  const stored = localStorage.getItem('friend-anniversaries');
  const all: FriendshipAnniversary[] = stored ? JSON.parse(stored) : [];
  all.push(anniversary);
  localStorage.setItem('friend-anniversaries', JSON.stringify(all));
}

export function getDaysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
