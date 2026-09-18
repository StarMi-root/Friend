# 我们的故事 - 友谊与摄影记录应用

一个专为热爱摄影和友谊记录的人设计的Web应用，使用 React + TypeScript + Tailwind CSS 构建。

## 功能特性

### 核心功能
- **生日页面**：生日蛋糕动画、许愿池、礼物清单、生日倒计时
- **足迹页面**：摄影作品管理、EXIF信息、标签分类、摄影日记
- **友谊墙**：好友管理、友谊等级、留言板、纪念日
- **成就系统**：基础成就、自定义成就、稀有度分级
- **摄影挑战**：月度主题挑战
- **时间胶囊**：写给未来的自己
- **年度报告**：数据统计、活跃度日历

### 特色功能
- Canon EOS R50 相机动画拍摄
- 深色模式 / 多语言支持
- 全局搜索 / 通知系统
- GitHub 云同步（跨设备数据同步）
- 数据版本控制 / 备份恢复

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS 4
- **数据存储**：LocalStorage + GitHub API
- **部署平台**：GitHub Pages

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 部署到 GitHub Pages

#### 方法一：自动化部署（推荐）

1. **Fork 或克隆此仓库到你的 GitHub**

2. **修改 vite.config.js 中的 base 路径**
   ```javascript
   base: '/你的仓库名/',
   ```

3. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

4. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"
   - 保存后会自动部署

5. **访问网站**
   - 等待 Actions 完成（约1-2分钟）
   - 访问 `https://你的用户名.github.io/仓库名/`

#### 方法二：手动部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **推送 dist 目录到 gh-pages 分支**
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```

3. **启用 GitHub Pages**
   - Settings → Pages → Source 选择 "gh-pages" 分支
   - 保存后等待部署完成

## 配置 GitHub 云同步

### 1. 创建私有数据仓库

1. 在 GitHub 创建新的私有仓库（如 `my-data`）
2. 在仓库中创建 `data` 文件夹
3. 创建空的 `app-data.json` 文件（内容为 `{}`）

### 2. 生成 Personal Access Token

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 复制生成的 Token（以 `ghp_` 开头）

### 3. 在应用中配置

1. 使用管理员账户登录
   - 用户名：`admin`
   - 密码：`wB2510468860`
   - 生日：`2012-06-02`

2. 进入"管理" → "云同步"
3. 填写配置：
   - GitHub Token：粘贴刚才的 Token
   - 仓库所有者：你的 GitHub 用户名
   - 仓库名称：数据仓库名（如 `my-data`）
   - 数据文件路径：`data/app-data.json`
4. 点击"保存配置" → "测试连接"
5. 点击"上传到 GitHub"同步数据

## 默认管理员账户

- **用户名**：admin
- **密码**：wB2510468860
- **生日**：2012年6月2日

⚠️ **重要提示**：首次登录后请立即修改管理员密码！

## 项目结构

```
├── src/
│   ├── components/          # React 组件
│   │   ├── Home.tsx         # 首页
│   │   ├── Birthday.tsx     # 生日页面
│   │   ├── Footprints.tsx   # 足迹页面
│   │   ├── FriendWall.tsx   # 友谊墙
│   │   ├── Achievements.tsx # 成就系统
│   │   └── ...
│   ├── App.tsx              # 主应用组件
│   ├── store.ts             # 数据存储逻辑
│   ├── utils.ts             # 工具函数
│   ├── github-storage.ts    # GitHub 同步
│   └── main.tsx             # 入口文件
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions 部署配置
├── vite.config.js           # Vite 配置
└── package.json
```

## 数据备份

### 导出备份
- 进入"管理" → 点击"导出数据"
- 下载 JSON 备份文件

### 导入恢复
- 进入"管理" → 点击"导入数据"
- 选择之前导出的 JSON 文件

## 浏览器支持

- Chrome / Edge（推荐）
- Firefox
- Safari
- 移动端浏览器

## 常见问题

### Q: 数据会丢失吗？
A: 数据存储在浏览器 LocalStorage 中，清除浏览器数据会丢失。建议：
1. 配置 GitHub 云同步
2. 定期导出备份

### Q: 如何在多个设备间同步？
A: 配置 GitHub 云同步后，所有设备会自动同步数据。

### Q: 可以修改管理员密码吗？
A: 可以，进入"管理" → "用户" → 编辑 admin 用户。

### Q: 部署后访问 404？
A: 检查 `vite.config.js` 中的 `base` 配置是否与仓库名一致。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**为热爱摄影和友谊的你而设计** 📸
