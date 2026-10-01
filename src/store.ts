// Data store using localStorage
export interface User {
  username: string;
  password: string;
  birthday: string; // MM-DD format
  isAdmin?: boolean;
}

export interface Wish {
  id: string;
  text: string;
  date: string;
  username: string;
}

export interface Photo {
  id: string;
  src: string;
  caption: string;
  score: number;
  date: string;
  username: string;
  tags?: string[];
  diary?: string;
  exif?: {
    camera: string;
    lens: string;
    focalLength: string;
    aperture: string;
    shutterSpeed: string;
    iso: string;
  };
  aiScore?: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    date: string;
  };
}

export interface Friend {
  id: string;
  name: string;
  group: string;
  photos: Photo[];
  username: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  photo?: string;
  username: string;
  isCustom?: boolean;
}

export interface AppData {
  users: User[];
  wishes: Wish[];
  photos: Photo[];
  friends: Friend[];
  achievements: Achievement[];
}

const DEFAULT_DATA: AppData = {
  users: [
    { username: 'admin', password: 'wB2510468860', birthday: '2012-06-02', isAdmin: true }
  ],
  wishes: [],
  photos: [],
  friends: [],
  achievements: []
};

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem('friendship-app-data');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data', e);
  }
  return { ...DEFAULT_DATA };
}

export function clearAllData(): void {
  localStorage.removeItem('friendship-app-data');
  localStorage.removeItem('current-user');
}

export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.users && data.wishes && data.photos && data.friends && data.achievements) {
      localStorage.setItem('friendship-app-data', jsonString);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to import data', e);
    return false;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem('friendship-app-data', JSON.stringify(data));
  
  // Sync to GitHub if configured (async, non-blocking)
  import('./github-storage').then(({ isGitHubConfigured, writeToGitHub }) => {
    if (isGitHubConfigured()) {
      writeToGitHub(data).catch(err => {
        console.error('Failed to sync to GitHub:', err);
      });
    }
  }).catch(err => {
    console.error('Failed to load GitHub storage module:', err);
  });
}

// Sync data from GitHub to localStorage
export async function syncFromGitHub(): Promise<{ success: boolean; message: string }> {
  try {
    const { isGitHubConfigured, readFromGitHub } = await import('./github-storage');
    
    if (!isGitHubConfigured()) {
      return { success: false, message: '未配置 GitHub' };
    }

    const githubData = await readFromGitHub();
    
    if (githubData) {
      localStorage.setItem('friendship-app-data', JSON.stringify(githubData));
      return { success: true, message: '同步成功' };
    } else {
      return { success: false, message: 'GitHub 上没有数据' };
    }
  } catch (e) {
    console.error('Sync from GitHub failed:', e);
    return { success: false, message: '同步失败' };
  }
}

// Sync data from localStorage to GitHub
export async function syncToGitHub(): Promise<{ success: boolean; message: string }> {
  try {
    const { isGitHubConfigured, writeToGitHub } = await import('./github-storage');
    
    if (!isGitHubConfigured()) {
      return { success: false, message: '未配置 GitHub' };
    }

    const localData = loadData();
    const success = await writeToGitHub(localData);
    
    if (success) {
      return { success: true, message: '上传成功' };
    } else {
      return { success: false, message: '上传失败' };
    }
  } catch (e) {
    console.error('Sync to GitHub failed:', e);
    return { success: false, message: '上传失败' };
  }
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem('current-user');
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem('current-user', JSON.stringify(user));
  } else {
    localStorage.removeItem('current-user');
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getBirthdayAge(birthday: string): number | null {
  // birthday format: MM-DD or YYYY-MM-DD
  const parts = birthday.split('-');
  let month: number, day: number, year: number | null;
  if (parts.length === 3 && parts[0].length === 4) {
    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
    day = parseInt(parts[2]);
  } else {
    month = parseInt(parts[0]);
    day = parseInt(parts[1]);
    year = null; // No year information
  }
  
  // Cannot calculate age without year
  if (year === null) return null;
  
  const now = new Date();
  let age = now.getFullYear() - year;
  const thisYearBday = new Date(now.getFullYear(), month - 1, day);
  if (now < thisYearBday) age--;
  return age;
}

export function getMonthsSinceBirthday(birthday: string): number {
  const parts = birthday.split('-');
  let month: number, day: number;
  if (parts.length === 3 && parts[0].length === 4) {
    month = parseInt(parts[1]);
    day = parseInt(parts[2]);
  } else {
    month = parseInt(parts[0]);
    day = parseInt(parts[1]);
  }
  const now = new Date();
  const currentYear = now.getFullYear();
  let lastBirthday = new Date(currentYear, month - 1, day);
  if (now < lastBirthday) {
    lastBirthday = new Date(currentYear - 1, month - 1, day);
  }
  const diffMs = now.getTime() - lastBirthday.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  return Math.min(diffMonths, 12);
}

export function getCakePercentage(birthday: string): number {
  const months = getMonthsSinceBirthday(birthday);
  return Math.max(0, 100 - (months * 8.33));
}

export function getLevelLabel(level: number): string {
  const labels: Record<number, string> = {
    1: '你是谁？',
    2: '初次相识',
    3: '渐入佳境',
    4: '友谊升温',
    5: '友谊坚如磐石',
    6: '一生挚友'
  };
  return labels[level] || '未知';
}

export function calculateLevel(count: number, avgScore: number): number {
  const score = count * 1 + avgScore * 3;
  if (score >= 100) return 6;
  if (score >= 70) return 5;
  if (score >= 45) return 4;
  if (score >= 25) return 3;
  if (score >= 10) return 2;
  return 1;
}
