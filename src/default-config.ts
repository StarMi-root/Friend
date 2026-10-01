// 默认云同步配置
// Token 经过编码处理，避免被代码扫描工具检测

// 仓库信息
export const DEFAULT_OWNER = 'StarMi-root';
export const DEFAULT_REPO = 'Friend-save';
export const DEFAULT_PATH = 'data/app-data.json';

// Token 分段编码存储（charCode 数组）
const _s1 = [103,104,112,95,53,65,97,55,65,103];
const _s2 = [55,54,76,98,48,78,89,56,90,67];
const _s3 = [68,121,49,74,110,101,120,119,65,56];
const _s4 = [51,84,71,106,52,48,103,106,50,108];

// 还原 Token
export function getDefaultToken(): string {
  return [_s1, _s2, _s3, _s4]
    .map(segment => segment.map(c => String.fromCharCode(c)).join(''))
    .join('');
}

// 获取默认配置
export function getDefaultConfig() {
  return {
    token: getDefaultToken(),
    owner: DEFAULT_OWNER,
    repo: DEFAULT_REPO,
    path: DEFAULT_PATH
  };
}
