import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  Code2,
  Cpu,
  Droplets,
  FlaskConical,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { modelFamilies, modelOptions, runBenchmark, type BenchmarkResult, type ModelFamilyId } from './model-benchmark'
import type { Story } from './story-engine'

type Props = {
  story: Story
  onBack: () => void
  onStudio: () => void
}

const familyIcons = { deepseek: BrainCircuit, claude: Sparkles, codex: Code2, open: Cpu }

export default function Benchmark({ story, onBack, onStudio }: Props) {
  const [family, setFamily] = useState<ModelFamilyId>('deepseek')
  const [modelId, setModelId] = useState('deepseek-reasoner')
  const [customModelId, setCustomModelId] = useState('')
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState('准备测试')
  const [result, setResult] = useState<BenchmarkResult | null>(null)
  const [error, setError] = useState('')
  const gatewayConfigured = Boolean(import.meta.env.VITE_BENCHMARK_API_URL)
  const models = useMemo(() => modelOptions.filter((item) => item.family === family), [family])
  const selectedModel = modelOptions.find((item) => item.id === modelId) ?? models[0]

  const selectFamily = (next: ModelFamilyId) => {
    setFamily(next)
    setModelId(modelOptions.find((item) => item.family === next)!.id)
    setResult(null)
  }

  const start = async () => {
    if (!gatewayConfigured || (selectedModel.id === 'custom' && !customModelId.trim())) return
    setRunning(true)
    setResult(null)
    setError('')
    const phases = ['读取汤面', '建立假设树', '向主持人提问', '提交最终推理']
    for (const nextPhase of phases) {
      setPhase(nextPhase)
      await new Promise((resolve) => window.setTimeout(resolve, 320))
    }
    try {
      setResult(await runBenchmark(story, selectedModel, customModelId.trim()))
    } catch {
      setError('模型网关请求失败。请检查服务地址、鉴权和模型映射后重试。')
    } finally {
      setRunning(false)
      setPhase('测试完成')
    }
  }

  return (
    <main className="app-shell benchmark-shell">
      <header className="topbar benchmark-topbar">
        <button className="brand" onClick={onStudio} aria-label="返回盲汤创作桌">
          <span className="brand-mark"><Droplets size={20} /></span>
          <span>盲汤 <small>BLIND SOUP</small></span>
        </button>
        <div className="flow-steps" aria-label="创作流程">
          <span><b>01</b> 编排</span><ChevronRight size={14} /><span><b>02</b> 推理</span><ChevronRight size={14} /><span className="active"><b>03</b> 模型智测</span>
        </div>
        <span className="lab-status"><span /> LAB READY</span>
      </header>

      <section className="benchmark-layout">
        <aside className="benchmark-case">
          <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> 返回汤局</button>
          <div className="case-stamp"><FlaskConical size={15} /> BENCHMARK CASE</div>
          <h1>{story.title}</h1>
          <p>{story.surface}</p>
          <div className="sealed-truth">
            <LockKeyhole size={19} />
            <div><strong>汤底已密封</strong><span>{story.keyFacts.length} 个关键事实将由裁判计分</span></div>
          </div>
          <div className="test-protocol">
            <span><Clock3 size={15} /> 最多 12 轮</span>
            <span><Target size={15} /> 关键事实覆盖</span>
            <span><KeyRound size={15} /> 独立上下文</span>
          </div>
        </aside>

        <section className="benchmark-workspace">
          {!result ? (
            <>
              <div className="benchmark-heading">
                <div><span className="eyebrow">MODEL ARENA</span><h2>选择挑战模型</h2></div>
                <span>{gatewayConfigured ? '网关已连接' : '未连接模型'}</span>
              </div>

              <div className="family-selector" role="tablist" aria-label="模型系列">
                {modelFamilies.map((item) => {
                  const Icon = familyIcons[item.id]
                  return (
                    <button key={item.id} className={family === item.id ? 'active' : ''} onClick={() => selectFamily(item.id)}>
                      <Icon size={19} /><span><strong>{item.name}</strong><small>{item.caption}</small></span>
                    </button>
                  )
                })}
              </div>

              <div className="model-list" role="radiogroup" aria-label="可用模型">
                {models.map((model) => (
                  <button
                    key={model.id}
                    role="radio"
                    aria-checked={modelId === model.id}
                    className={`model-row accent-${model.accent} ${modelId === model.id ? 'selected' : ''}`}
                    onClick={() => setModelId(model.id)}
                  >
                    <span className="model-radio">{modelId === model.id && <Check size={14} />}</span>
                    <span className="model-copy"><strong>{model.name}</strong><small>{model.note}</small></span>
                    <span className="model-badge">{model.badge}</span>
                  </button>
                ))}
              </div>

              {selectedModel.id === 'custom' && (
                <label className="custom-model-field">
                  <span>网关中的模型 ID</span>
                  <input value={customModelId} onChange={(event) => setCustomModelId(event.target.value)} placeholder="例如：my-org/my-reasoning-model" />
                </label>
              )}

              {!gatewayConfigured && (
                <div className="gateway-notice">
                  <LockKeyhole size={19} />
                  <div><strong>尚未连接真实模型</strong><span>静态网页不能调用本机 Codex。配置服务端模型网关后才能开始智测，当前不会生成虚假分数。</span></div>
                </div>
              )}
              {error && <div className="gateway-error" role="alert">{error}</div>}

              <div className="run-benchmark-bar">
                <div><Bot size={20} /><span><strong>{selectedModel.name}</strong><small>将独立提问并提交完整汤底</small></span></div>
                <button onClick={start} disabled={!gatewayConfigured || running || (selectedModel.id === 'custom' && !customModelId.trim())}>
                  {running ? <LoaderCircle className="spin" size={18} /> : <CircleGauge size={18} />}
                  {running ? phase : gatewayConfigured ? '开始智测' : '等待模型网关'}
                </button>
              </div>
            </>
          ) : (
            <div className="benchmark-result" aria-live="polite">
              <div className="result-title-row">
                <div><span className="eyebrow">TEST COMPLETE</span><h2>{selectedModel.name}</h2></div>
                <span className="result-source">真实模型</span>
              </div>

              <div className="score-summary">
                <div className="score-orbit"><strong>{result.score}</strong><span>汤局指数</span></div>
                <div><Trophy size={23} /><span>评定</span><strong>{result.rank}</strong><small>{result.turns} 轮后提交答案</small></div>
              </div>

              <div className="metric-grid">
                <div><span>真相覆盖</span><strong>{result.coverage}%</strong><div><i style={{ width: `${result.coverage}%` }} /></div></div>
                <div><span>有效问题率</span><strong>{result.validQuestionRate}%</strong><div><i style={{ width: `${result.validQuestionRate}%` }} /></div></div>
                <div><span>推理轮次</span><strong>{result.turns}<small> / 12</small></strong><div><i style={{ width: `${Math.min(100, result.turns / 12 * 100)}%` }} /></div></div>
              </div>

              <div className="reasoning-trace">
                <div className="trace-title"><span>关键提问轨迹</span><small>QUESTION TRACE</small></div>
                {result.trace.map((turn) => (
                  <div className="trace-row" key={turn.round}><b>{String(turn.round).padStart(2, '0')}</b><p>{turn.question}</p><strong className={`trace-${turn.verdict}`}>{turn.verdict}</strong></div>
                ))}
              </div>

              <div className="model-final-answer"><span>模型提交的汤底</span><p>{result.finalAnswer}</p></div>
              <div className="result-actions">
                <button onClick={() => setResult(null)}><RefreshCw size={16} /> 更换模型</button>
                <button className="primary" onClick={start}><CircleGauge size={16} /> 再测一次</button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
