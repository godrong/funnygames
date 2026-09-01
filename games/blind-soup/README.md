# 盲汤 · AI 海龟汤创作桌

一个可以拖拽元素、生成海龟汤、立即试玩并测试模型推理能力的交互原型。默认使用本地规则引擎，无需密钥；也可以连接任意服务端大模型网关。

## 两种游戏入口

- **创作桌**：自由拖拽物件、人物、场景、时间和异常条件，由本地引擎或云端模型生成新汤。
- **汤局档案**：游玩人工编写的原创精选题，支持搜索、按好评或最新排序。

人类推理局最多提问 8 次。精选题和本地生成题都有各自的离线裁判规则，可以区分正向、反向与无关问题；命中足够多的关键事实后自动判定成功。轮次用尽或主动揭晓都会进入结算，之后可反馈“合理 / 意外 / 神来一笔”并直接进入下一题。

## 运行

```bash
npm install
npm run dev
```

测试和生产构建：

```bash
npm test
npm run build
```

## 大模型接入

复制 `.env.example` 为 `.env.local`，将 `VITE_STORY_API_URL` 和 `VITE_BENCHMARK_API_URL` 指向你自己的服务端接口。API Key 必须留在服务端，不要放进任何 `VITE_` 环境变量。

前端发送：

```json
{
  "elements": [{ "id": "beaker", "label": "烧杯", "kind": "object", "icon": "beaker" }],
  "settings": { "tone": "悬疑", "difficulty": 3, "supernatural": false, "brief": "", "variant": 0 },
  "prompt": "完整生成提示词",
  "schema": { "type": "object", "required": ["title", "surface", "truth", "keyFacts"] }
}
```

接口可以直接返回故事对象，也可以返回 `{ "story": ... }`。必须包含 `title`、`surface`、`truth` 和字符串数组 `keyFacts`。模型服务不可用或返回结构错误时，前端会自动降级到本地引擎。

生产版建议把“故事生成模型”和“快速裁判模型”拆开：前者一次性生成汤面、汤底和关键事实，后者只接收汤底、关键事实与当前问题，输出结构化的 `是 / 否 / 无关` 判定。

## 模型智测

最终阶段可从四个系列中选择挑战模型：DeepSeek、Claude Code、Codex 和开源 API。Codex 列表采用 OpenAI 官方文档当前推荐的 `gpt-5.6-sol`、`gpt-5.6-terra`、`gpt-5.6-luna`；Claude Code 作为产品系列入口，具体 Opus / Sonnet / Haiku ID 由网关映射。

未配置 `VITE_BENCHMARK_API_URL` 时，智测按钮会保持禁用，不会用模拟数字冒充真实模型结果。GitHub Pages 无法直接调用本机 Codex，必须通过服务端网关接入模型并保护 API Key。

评测接口接收模型 ID、最多轮次以及密封的汤面 / 汤底 / 关键事实。它应返回 `score`、`coverage`、`validQuestionRate`、`turns`、`rank`、`finalAnswer` 和提问轨迹 `trace`。评分由真相覆盖率、有效问题率和轮次效率组成；未配置网关时会显示明确标注的可重复模拟结果。

Codex 模型依据：[OpenAI 官方 Codex 模型文档](https://developers.openai.com/codex/models)。

## 开源项目参考

- [liyupi/yuhaigui-ai-game](https://github.com/liyupi/yuhaigui-ai-game)：参考 AI 主持人对话和历史局记录的基础流程。
- [GVD20/LABYRINTH](https://github.com/GVD20/LABYRINTH)：参考关键词选择、生成模型与裁判模型分工、多模型兼容的思路。
- [LeoKwo/turtle-soup](https://github.com/LeoKwo/turtle-soup)：参考本地模型动态生成，并吸收其“生成质量不稳定”的经验，加入结构化输出与本地降级。

本项目没有复制上述仓库代码。核心差异是把“关键词选择”升级为可移动的关系画布，让创作者直接操纵物件、人物、场景、时间与异常条件。
