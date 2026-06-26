# Lottie Stage

> 一个开源、纯前端的 Lottie 动画 3D Cover Flow 舞台。

把多个 Lottie JSON 拖进页面，立刻得到一个类似 Apple Cover Flow 的 3D 轮播舞台：中央卡片正对用户并播放动画，两侧卡片向后倾斜、缩小、半透明。拖拽、点击、键盘、箭头按钮都能丝滑切换中心卡。

打开就有 3 个内置示例动画（橘猫 / 柴犬 / 龙猫），无需上传。

## ✨ 特性

- **Cover Flow 3D 舞台** —— 基于 `translateX / rotateY / scale / opacity / zIndex` 的纯 CSS 变换，中心一张播放，两侧倾斜静止
- **丝滑切换** —— 整个动画由单一连续值 `scrollValue` 驱动，中间值平滑插值，**绝不跳变**
- **多种交互** —— 拖拽 / 点击 / 键盘 ←→ / 箭头按钮全部支持
- **窗口化渲染** —— 只挂载中心 ±2 张真实 Lottie，其余用占位卡代替，支撑 50+ 卡不掉帧
- **IndexedDB 持久化** —— 上传的动画自动保存到本地，刷新不丢
- **离线可用** —— 纯静态站点，零后端
- **上传校验** —— 拖入即自动校验 Lottie 合法性，损坏文件跳过并提示

## 🛠 技术栈

| 层 | 选型 |
|---|---|
| 框架 | React 19 + Vite + TypeScript |
| 动效 | framer-motion（spring 吸附 + 甩动惯性） |
| Lottie | lottie-react |
| 存储 | IndexedDB（idb 封装） |
| 测试 | Vitest（仅纯函数） |
| 包管理 | pnpm |

## 🚀 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev
```

打开终端输出的 URL（默认 `http://localhost:5173/lottie-stage/`）即可看到 3 个内置示例。

## 📦 构建与部署

```bash
pnpm build       # 输出到 dist/
pnpm preview     # 本地预览构建产物
```

部署到 GitHub Pages：
1. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**
2. 推送到 `main` 分支，`.github/workflows/deploy.yml` 自动构建并部署

部署 URL：`https://<your-username>.github.io/lottie-stage/`

> 💡 如果你的仓库名不是 `lottie-stage`，需要同步修改 `vite.config.ts` 中的 `base` 字段。

## 🎮 使用

首次打开会自动加载 3 个内置示例。可以：

- **删除内置**：点 `Delete` 按钮或选中后按删除操作（注意：删除后刷新不会自动恢复）
- **添加自己的**：把 Lottie JSON 拖到页面任意位置，或点上传框选择文件
- **切换中心**：拖拽舞台 / 点两侧卡片 / 按 ←→ 键 / 点 Prev/Next 按钮
- **键盘焦点**：先点一下舞台，再按 ←→

## 📐 架构核心

整个动效由一个连续运动值 `scrollValue` 驱动：

```
offset = index - scrollValue
       ↓
cardStyle(offset)  // 纯函数，offset → 3D 变换
       ↓
framer-motion 响应式应用 transform
```

关键文件：

| 文件 | 职责 |
|---|---|
| `src/lib/geometry.ts` | `offset → CardStyle` 的纯函数映射（含单测） |
| `src/lib/lottie-validate.ts` | Lottie JSON 合法性校验（含单测） |
| `src/hooks/useCarousel.ts` | `scrollValue`、拖拽手势、spring 吸附、甩动惯性 |
| `src/hooks/useLottieStore.ts` | IDB 持久化 + 内存 clips + 默认 seed |
| `src/components/LottieCard.tsx` | 单卡 3D 变换 + 中心播放 / 旁侧定格 |
| `src/components/Stage.tsx` | 舞台容器 + 窗口化 + 点击居中 + 键盘 |

详见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## 🧪 测试

```bash
pnpm test
```

仅对纯函数做单元测试（`geometry.ts`、`lottie-validate.ts`）。交互与视觉需手动验证。

## 📝 License

MIT —— 详见 [`LICENSE`](./LICENSE)。

## 🙏 致谢

- 内置示例动画来源：[LottieFiles](https://lottiefiles.com/)（Free for Personal Use）
- 灵感：Apple Cover Flow