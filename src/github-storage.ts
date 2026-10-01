// GitHub API data storage
import { AppData } from './store';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  path: string; // file path in repo, e.g. 'data/app-data.json'
}

const CONFIG_KEY = 'github-config';
const FILE_SHA_KEY = 'github-file-sha';

export function getGitHubConfig(): GitHubConfig | null {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function saveGitHubConfig(config: GitHubConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearGitHubConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(FILE_SHA_KEY);
}

export function isGitHubConfigured(): boolean {
  const config = getGitHubConfig();
  return !!(config && config.owner && config.repo && config.path);
}

// Read data from GitHub
export async function readFromGitHub(): Promise<AppData | null> {
  const config = getGitHubConfig();
  if (!config) return null;

  try {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.status === 404) {
      // File doesn't exist yet
      return null;
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Save the SHA for future updates
    localStorage.setItem(FILE_SHA_KEY, result.sha);

    // Decode base64 content
    const content = decodeBase64(result.content);
    const data = JSON.parse(content) as AppData;
    return data;
  } catch (e) {
    console.error('Failed to read from GitHub:', e);
    return null;
  }
}

// Write data to GitHub
export async function writeToGitHub(data: AppData): Promise<boolean> {
  const config = getGitHubConfig();
  if (!config) return false;

  try {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
    const content = encodeBase64(JSON.stringify(data, null, 2));
    const sha = localStorage.getItem(FILE_SHA_KEY);

    const body: any = {
      message: `Update app data - ${new Date().toISOString()}`,
      content: content,
    };

    // If file exists, include SHA for update
    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      
      // If SHA mismatch, re-fetch and retry
      if (response.status === 409 || (errorData.message && errorData.message.includes('sha'))) {
        return await retryWrite(data);
      }
      
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const result = await response.json();
    // Save new SHA
    localStorage.setItem(FILE_SHA_KEY, result.content.sha);
    return true;
  } catch (e) {
    console.error('Failed to write to GitHub:', e);
    return false;
  }
}

// Retry write after re-fetching SHA
async function retryWrite(data: AppData): Promise<boolean> {
  const config = getGitHubConfig();
  if (!config) return false;

  try {
    // Re-fetch to get latest SHA
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
    const getResponse = await fetch(url, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (getResponse.ok) {
      const getResult = await getResponse.json();
      localStorage.setItem(FILE_SHA_KEY, getResult.sha);
    } else {
      localStorage.removeItem(FILE_SHA_KEY);
    }

    // Retry write
    return await writeToGitHub(data);
  } catch (e) {
    console.error('Retry failed:', e);
    return false;
  }
}

// Base64 encoding/decoding
function encodeBase64(str: string): string {
  // Use TextEncoder for proper UTF-8 handling
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

function decodeBase64(base64: string): string {
  // Remove whitespace
  const clean = base64.replace(/\s/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

// Test GitHub connection
export async function testGitHubConnection(): Promise<{ success: boolean; message: string }> {
  const config = getGitHubConfig();
  if (!config) {
    return { success: false, message: '未配置 GitHub' };
  }

  try {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      return { success: true, message: '连接成功' };
    } else if (response.status === 401) {
      return { success: false, message: 'Token 无效或已过期' };
    } else if (response.status === 404) {
      return { success: false, message: '仓库不存在或无权访问' };
    } else {
      return { success: false, message: `错误: ${response.status}` };
    }
  } catch (e) {
    return { success: false, message: '网络连接失败' };
  }
}
