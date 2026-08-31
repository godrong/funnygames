import type { Story } from './story-engine'

export type ModelFamilyId = 'deepseek' | 'claude' | 'codex' | 'open'

export type ModelOption = {
  id: string
  name: string
  family: ModelFamilyId
  note: string
  badge: string
  accent: 'teal' | 'coral' | 'violet' | 'gold'
}

export type BenchmarkTurn = {
  round: number
  question: string
  verdict: '是' | '否' | '无关'
}

export type BenchmarkResult = {
  score: number
  coverage: number
  validQuestionRate: number
  turns: number
  rank: string
  finalAnswer: string
  trace: BenchmarkTurn[]
  source: 'gateway' | 'simulation'
}

export const modelFamilies: Array<{ id: ModelFamilyId; name: string; caption: string }> = [
  { id: 'deepseek', name: 'DeepSeek', caption: '深度推理' },
  { id: 'claude', name: 'Claude Code', caption: '长上下文' },
  { id: 'codex', name: 'Codex', caption: '代理推理' },
  { id: 'open', name: '开源 API', caption: '自托管' },
]

export const modelOptions: ModelOption[] = [
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', family: 'deepseek', note: '强化长链推理，适合高难汤底', badge: 'REASONING', accent: 'teal' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', family: 'deepseek', note: '更快的多轮提问与假设检验', badge: 'FAST', accent: 'teal' },
  { id: 'claude-opus', name: 'Claude Opus', family: 'claude', note: '能力优先的复杂因果还原', badge: 'MAX', accent: 'violet' },
  { id: 'claude-sonnet', name: 'Claude Sonnet', family: 'claude', note: '推理质量与响应速度平衡', badge: 'BALANCED', accent: 'violet' },
  { id: 'claude-haiku', name: 'Claude Haiku', family: 'claude', note: '低延迟快速扫过线索空间', badge: 'FAST', accent: 'violet' },
  { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', family: 'codex', note: '复杂推理与代理任务能力优先', badge: 'FLAGSHIP', accent: 'coral' },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', family: 'codex', note: '能力、速度和成本平衡', badge: 'BALANCED', accent: 'coral' },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', family: 'codex', note: '高吞吐、成本敏感型测试', badge: 'FAST', accent: 'coral' },
  { id: 'qwen3-32b', name: 'Qwen3 32B', family: 'open', note: '适合本地部署的推理模型', badge: 'OPEN', accent: 'gold' },
  { id: 'llama-3.3-70b-instruct', name: 'Llama 3.3 70B', family: 'open', note: '通用指令模型基线', badge: 'OPEN', accent: 'gold' },
  { id: 'gpt-oss-120b', name: 'gpt-oss-120b', family: 'open', note: 'OpenAI 开放权重推理模型', badge: 'OPEN', accent: 'gold' },
  { id: 'custom', name: '自定义模型', family: 'open', note: '由网关映射任意兼容 API', badge: 'CUSTOM', accent: 'gold' },
]

const hash = (value: string) => [...value].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7)

export function simulateBenchmark(story: Story, model: ModelOption): BenchmarkResult {
  const seed = hash(`${story.title}:${model.id}`)
  const familyBonus: Record<ModelFamilyId, number> = { deepseek: 5, claude: 4, codex: 6, open: 0 }
  const coverage = Math.min(98, 72 + (seed % 17) + familyBonus[model.family])
  const validQuestionRate = Math.min(97, 76 + ((seed >> 3) % 17) + Math.floor(familyBonus[model.family] / 2))
  const turns = Math.max(5, 12 - familyBonus[model.family] + ((seed >> 5) % 4))
  const efficiency = Math.max(45, 100 - turns * 3)
  const score = Math.round(coverage * .55 + validQuestionRate * .25 + efficiency * .2)
  const rank = score >= 90 ? '侧写大师' : score >= 82 ? '逻辑侦探' : score >= 74 ? '合格推理者' : '线索学徒'

  return {
    score,
    coverage,
    validQuestionRate,
    turns,
    rank,
    source: 'simulation',
    finalAnswer: `事件的死亡时间被人为误导，房外物件用于触发机关；所谓“第四个人”来自反射造成的视觉错位。${story.keyFacts[3] ?? ''}`,
    trace: [
      { round: 1, question: '异常发生的时间比表面看起来更早吗？', verdict: '是' },
      { round: 2, question: '门外的物品直接造成了死亡吗？', verdict: '否' },
      { round: 3, question: '所有目击者看到的是同一个对象吗？', verdict: '是' },
      { round: 4, question: '第四个人是真实进入现场的人吗？', verdict: '否' },
    ],
  }
}

export async function runBenchmark(story: Story, model: ModelOption, customModelId?: string): Promise<BenchmarkResult> {
  const endpoint = import.meta.env.VITE_BENCHMARK_API_URL
  if (!endpoint) return simulateBenchmark(story, model)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model.id === 'custom' ? customModelId : model.id,
      family: model.family,
      maxTurns: 12,
      puzzle: { surface: story.surface, truth: story.truth, keyFacts: story.keyFacts },
    }),
  })
  if (!response.ok) throw new Error(`Benchmark API returned ${response.status}`)
  const payload: unknown = await response.json()
  if (!isBenchmarkResult(payload)) throw new Error('Benchmark API returned an invalid payload')
  return { ...payload, source: 'gateway' }
}

function isBenchmarkResult(value: unknown): value is Omit<BenchmarkResult, 'source'> {
  if (!value || typeof value !== 'object') return false
  const result = value as Record<string, unknown>
  return typeof result.score === 'number'
    && typeof result.coverage === 'number'
    && typeof result.validQuestionRate === 'number'
    && typeof result.turns === 'number'
    && typeof result.rank === 'string'
    && typeof result.finalAnswer === 'string'
    && Array.isArray(result.trace)
}
