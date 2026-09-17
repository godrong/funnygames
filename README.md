# FunnyGames

一个收集小型实验游戏与趣味工具的父项目。内部游戏独立放在 `games/` 下，外部实验由统一大厅提供入口。

## 当前游戏

- `games/blind-soup`：盲汤，支持拖拽生成海龟汤、人类推理和多模型智测。
- `LinkedIn Speak`：职场吐槽翻译，部署在 `wangrong.bond/projects/linkedin-speak/`，由 FunnyGames 大厅统一收录。

## 本地开发

```bash
npm install
npm run dev:blind-soup
```

完整测试与构建：

```bash
npm test
npm run build
```

构建产物：

- `dist/index.html`：FunnyGames 游戏大厅
- `dist/blind-soup/`：盲汤游戏

推送到 `main` 后，GitHub Actions 会自动测试、构建并部署 GitHub Pages。
