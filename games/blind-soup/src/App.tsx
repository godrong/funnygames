import {
  Beaker,
  BadgeCheck,
  BookOpen,
  Bot,
  BrainCircuit,
  BriefcaseMedical,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  DoorClosed,
  Droplets,
  Eye,
  Flame,
  FlaskConical,
  Ghost,
  Hammer,
  Hand,
  Hospital,
  KeyRound,
  LampDesk,
  Lightbulb,
  Library,
  LockKeyhole,
  MessageSquareText,
  Moon,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Sparkles,
  Sword,
  Theater,
  TrainFront,
  Trash2,
  Trees,
  UserRound,
  UserRoundX,
  UsersRound,
  Warehouse,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type DragEvent, type PointerEvent } from 'react'
import Archive from './Archive'
import Benchmark from './Benchmark'
import { curatedStories, type CuratedStory } from './curated-stories'
import { buildStory, judgeQuestion, MAX_QUESTIONS, requestStory, type ElementKind, type GameElement, type Story } from './story-engine'

const iconMap: Record<string, LucideIcon> = {
  beaker: Beaker,
  flame: Flame,
  knife: Sword,
  hammer: Hammer,
  key: KeyRound,
  medicine: BriefcaseMedical,
  lamp: LampDesk,
  water: Droplets,
  worker: UserRound,
  victim: UserRoundX,
  crowd: UsersRound,
  doctor: Hospital,
  lab: FlaskConical,
  train: TrainFront,
  forest: Trees,
  warehouse: Warehouse,
  hotel: Building2,
  library: Library,
  midnight: Moon,
  clock: Clock3,
  locked: LockKeyhole,
  blackout: Zap,
  ghost: Ghost,
  missing: Eye,
}

const kindMeta: Record<ElementKind, { label: string; color: string }> = {
  object: { label: '物件', color: 'coral' },
  person: { label: '人物', color: 'gold' },
  place: { label: '场景', color: 'teal' },
  time: { label: '时间', color: 'blue' },
  anomaly: { label: '异常', color: 'violet' },
}

const elementLibrary: GameElement[] = [
  { id: 'beaker', label: '烧杯', kind: 'object', icon: 'beaker' },
  { id: 'torch', label: '火把', kind: 'object', icon: 'flame' },
  { id: 'knife', label: '刀具', kind: 'object', icon: 'knife' },
  { id: 'hammer', label: '钝器', kind: 'object', icon: 'hammer' },
  { id: 'key', label: '钥匙', kind: 'object', icon: 'key' },
  { id: 'medicine', label: '药箱', kind: 'object', icon: 'medicine' },
  { id: 'lamp', label: '台灯', kind: 'object', icon: 'lamp' },
  { id: 'water', label: '一杯水', kind: 'object', icon: 'water' },
  { id: 'worker', label: '值班员', kind: 'person', icon: 'worker' },
  { id: 'victim', label: '失踪者', kind: 'person', icon: 'victim' },
  { id: 'three', label: '三个人', kind: 'person', icon: 'crowd' },
  { id: 'doctor', label: '医生', kind: 'person', icon: 'doctor' },
  { id: 'lab', label: '实验室', kind: 'place', icon: 'lab' },
  { id: 'train', label: '末班车', kind: 'place', icon: 'train' },
  { id: 'forest', label: '森林', kind: 'place', icon: 'forest' },
  { id: 'warehouse', label: '仓库', kind: 'place', icon: 'warehouse' },
  { id: 'hotel', label: '旅馆', kind: 'place', icon: 'hotel' },
  { id: 'archive', label: '档案室', kind: 'place', icon: 'library' },
  { id: 'midnight', label: '午夜', kind: 'time', icon: 'midnight' },
  { id: 'ten-minutes', label: '十分钟前', kind: 'time', icon: 'clock' },
  { id: 'locked', label: '密室', kind: 'anomaly', icon: 'locked' },
  { id: 'blackout', label: '停电', kind: 'anomaly', icon: 'blackout' },
  { id: 'ghost', label: '鬼影', kind: 'anomaly', icon: 'ghost' },
  { id: 'missing-memory', label: '记忆缺失', kind: 'anomaly', icon: 'missing' },
]

const starterIds = ['beaker', 'worker', 'lab', 'midnight', 'blackout']
const starterPositions = [
  { x: 18, y: 21 },
  { x: 64, y: 20 },
  { x: 40, y: 46 },
  { x: 17, y: 70 },
  { x: 68, y: 68 },
]

type ChatItem = { from: 'player' | 'host'; text: string; verdict?: string }

function ElementIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = iconMap[name] ?? CircleHelp
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}

function App() {
  const [view, setView] = useState<'studio' | 'archive' | 'game' | 'benchmark'>('studio')
  const [query, setQuery] = useState('')
  const [activeKind, setActiveKind] = useState<ElementKind | 'all'>('all')
  const [selected, setSelected] = useState<GameElement[]>(() =>
    starterIds.map((id, index) => ({ ...elementLibrary.find((item) => item.id === id)!, ...starterPositions[index] })),
  )
  const [tone, setTone] = useState<'悬疑' | '惊悚' | '荒诞'>('悬疑')
  const [difficulty, setDifficulty] = useState(3)
  const [supernatural, setSupernatural] = useState(false)
  const [brief, setBrief] = useState('')
  const [draftStory, setDraftStory] = useState<Story | null>(null)
  const [story, setStory] = useState<Story | null>(null)
  const [variant, setVariant] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState('')
  const [question, setQuestion] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [coveredFacts, setCoveredFacts] = useState<number[]>([])
  const [outcome, setOutcome] = useState<'won' | 'lost' | 'revealed' | null>(null)
  const [reactionChoice, setReactionChoice] = useState<number | null>(null)
  const [currentCuratedId, setCurrentCuratedId] = useState<string | null>(null)
  const [gameElements, setGameElements] = useState<GameElement[]>([])
  const [gameDifficulty, setGameDifficulty] = useState(3)
  const [gameSupernatural, setGameSupernatural] = useState(false)
  const [benchmarkReturnView, setBenchmarkReturnView] = useState<'studio' | 'game'>('game')
  const boardRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const generatingRef = useRef(false)

  const turnCount = chats.filter((item) => item.from === 'player').length
  const turnsLeft = Math.max(0, MAX_QUESTIONS - turnCount)
  const coverage = story?.keyFacts.length ? Math.round((coveredFacts.length / story.keyFacts.length) * 100) : 0
  const caseNumber = currentCuratedId
    ? curatedStories.findIndex((item) => item.id === currentCuratedId) + 1
    : variant + 1
  const selectionKey = selected.map((item) => item.id).join('|')

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [chats])

  useEffect(() => {
    setDraftStory(null)
  }, [selectionKey, tone, difficulty, supernatural, brief])

  const filteredElements = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return elementLibrary.filter((item) => {
      const kindMatch = activeKind === 'all' || item.kind === activeKind
      return kindMatch && (!normalized || item.label.toLowerCase().includes(normalized))
    })
  }, [activeKind, query])

  const addElement = (element: GameElement, x?: number, y?: number) => {
    setSelected((current) => {
      if (current.some((item) => item.id === element.id) || current.length >= 8) return current
      const index = current.length
      return [...current, { ...element, x: x ?? 18 + (index % 3) * 28, y: y ?? 18 + (index % 2) * 44 }]
    })
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/element-id')
    const element = elementLibrary.find((item) => item.id === id)
    const board = boardRef.current?.getBoundingClientRect()
    if (!element || !board) return
    const x = ((event.clientX - board.left) / board.width) * 100
    const y = ((event.clientY - board.top) / board.height) * 100
    addElement(element, Math.min(86, Math.max(9, x)), Math.min(85, Math.max(12, y)))
  }

  const moveNode = (event: PointerEvent<HTMLDivElement>, id: string) => {
    const node = event.currentTarget
    const board = boardRef.current
    if (!board || (event.target as HTMLElement).closest('button')) return
    node.setPointerCapture(event.pointerId)

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const rect = board.getBoundingClientRect()
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100
      setSelected((items) =>
        items.map((item) =>
          item.id === id ? { ...item, x: Math.min(88, Math.max(10, x)), y: Math.min(84, Math.max(14, y)) } : item,
        ),
      )
    }
    const onUp = () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerup', onUp)
    }
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerup', onUp)
  }

  const generate = async () => {
    if (generatingRef.current) return
    if (selected.length < 3) {
      setToast('至少放入 3 个元素')
      window.setTimeout(() => setToast(''), 1800)
      return
    }
    generatingRef.current = true
    setGenerating(true)
    const nextVariant = draftStory ? variant + 1 : variant
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    try {
      const nextStory = await requestStory(selected, { tone, difficulty, supernatural, brief, variant: nextVariant })
      setVariant(nextVariant)
      setDraftStory(nextStory)
    } catch {
      setDraftStory(buildStory(selected, { tone, difficulty, supernatural, brief, variant: nextVariant }))
      setToast('模型未响应，已使用本地引擎')
      window.setTimeout(() => setToast(''), 2200)
    } finally {
      generatingRef.current = false
      setGenerating(false)
    }
  }

  const beginGame = (targetStory: Story, curated?: CuratedStory) => {
    setStory(targetStory)
    setCurrentCuratedId(curated?.id ?? null)
    setGameDifficulty(curated?.difficulty ?? difficulty)
    setGameSupernatural(curated?.supernatural ?? supernatural)
    if (curated) {
      setGameElements(curated.elementIds.flatMap((id, index) => {
        const element = elementLibrary.find((item) => item.id === id)
        return element ? [{ ...element, ...starterPositions[index % starterPositions.length] }] : []
      }))
    } else {
      setGameElements(selected)
    }
    setChats([{ from: 'host', text: '汤面已经封存。请提出只能用“是 / 否 / 无关”回答的问题。' }])
    setQuestion('')
    setRevealed(false)
    setCoveredFacts([])
    setOutcome(null)
    setReactionChoice(null)
    setView('game')
  }

  const startGame = () => {
    if (draftStory) beginGame(draftStory)
  }

  const startCuratedGame = (curated: CuratedStory) => beginGame(curated, curated)

  const ask = () => {
    if (!story || !question.trim() || outcome || turnCount >= MAX_QUESTIONS) return
    const playerText = question.trim()
    const response = judgeQuestion(playerText, story, gameSupernatural, coveredFacts)
    const nextCoveredFacts = [...new Set([...coveredFacts, ...response.matchedFacts])]
    const nextTurn = turnCount + 1
    setCoveredFacts(nextCoveredFacts)
    setChats((items) => [
      ...items,
      { from: 'player', text: playerText },
      { from: 'host', text: response.detail, verdict: response.verdict },
    ])
    setQuestion('')
    if (response.solved) {
      setRevealed(true)
      setOutcome('won')
    } else if (nextTurn >= MAX_QUESTIONS) {
      setRevealed(true)
      setOutcome('lost')
    }
  }

  const playNext = () => {
    const currentIndex = curatedStories.findIndex((item) => item.id === currentCuratedId)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % curatedStories.length : 0
    startCuratedGame(curatedStories[nextIndex])
  }

  const copyPrompt = async () => {
    if (!draftStory) return
    await navigator.clipboard.writeText(draftStory.prompt)
    setToast('提示词已复制')
    window.setTimeout(() => setToast(''), 1800)
  }

  if (view === 'archive') {
    return <Archive onStudio={() => setView('studio')} onPlay={startCuratedGame} />
  }

  if (view === 'benchmark' && story) {
    return <Benchmark story={story} onBack={() => setView(benchmarkReturnView)} onStudio={() => setView('studio')} />
  }

  if (view === 'game' && story) {
    return (
      <main className="app-shell game-shell">
        <header className="topbar">
          <button className="brand" onClick={() => setView(currentCuratedId ? 'archive' : 'studio')} aria-label={`返回${currentCuratedId ? '汤局档案' : '创作桌'}`}>
            <span className="brand-mark"><Droplets size={20} /></span>
            <span>盲汤 <small>BLIND SOUP</small></span>
          </button>
          <div className="round-status">
            <span className="live-dot" /> {outcome ? '本局已结算' : `还剩 ${turnsLeft} 次提问`}
          </div>
          <button className="icon-button" title="房间设置" aria-label="房间设置"><Settings2 size={19} /></button>
        </header>

        <section className="game-layout">
          <aside className="case-panel">
            <button className="back-button" onClick={() => setView(currentCuratedId ? 'archive' : 'studio')}><ChevronLeft size={17} /> 返回{currentCuratedId ? '汤局档案' : '创作桌'}</button>
            <div className="case-number">CASE / {String(caseNumber).padStart(2, '0')}</div>
            <h1>{story.title}</h1>
            <p className="surface-text">{story.surface}</p>
            <div className="case-tags">
              {gameElements.slice(0, 5).map((item) => <span key={item.id}>{item.label}</span>)}
            </div>
            <div className="game-stats">
              <div><strong>{turnsLeft}/{MAX_QUESTIONS}</strong><span>剩余提问</span></div>
              <div><strong>{gameDifficulty}/5</strong><span>难度</span></div>
              <div><strong>{coverage}%</strong><span>还原度</span></div>
            </div>
            <button className="reveal-button" onClick={() => { setRevealed(true); setOutcome('revealed') }} disabled={Boolean(outcome)}>
              <Eye size={18} /> 放弃并揭晓汤底
            </button>
            <button className="benchmark-entry" onClick={() => { setBenchmarkReturnView('game'); setView('benchmark') }}>
              <BrainCircuit size={18} /> 让模型来破案
            </button>
            {revealed && <div className="truth-panel"><span>汤底</span><p>{story.truth}</p></div>}
          </aside>

          <section className="chat-panel">
            <div className="chat-heading">
              <div><Bot size={20} /><span>AI 主持人</span></div>
              <span>只回答 是 / 否 / 无关</span>
            </div>
            <div className="messages" ref={messagesRef} aria-live="polite">
              {chats.map((item, index) => (
                <div className={`message-row ${item.from}`} key={`${item.text}-${index}`}>
                  <div className="avatar">{item.from === 'host' ? <Bot size={17} /> : <UserRound size={17} />}</div>
                  <div className="message-bubble">
                    {item.verdict && <strong className={`verdict verdict-${item.verdict}`}>{item.verdict}</strong>}
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="quick-questions">
              {(story.suggestedQuestions ?? ['这和时间有关吗？', '现场物品被动过吗？', '有人隐瞒了身份吗？']).map((text) => (
                <button key={text} onClick={() => setQuestion(text)} disabled={Boolean(outcome)}>{text}</button>
              ))}
            </div>
            <div className="question-box">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && ask()}
                placeholder={outcome ? '本局已经结束' : '输入你的问题……'}
                aria-label="向主持人提问"
                disabled={Boolean(outcome)}
              />
              <span className="turn-counter">{turnsLeft}</span>
              <button onClick={ask} title="发送问题" aria-label="发送问题" disabled={Boolean(outcome) || !question.trim()}><Send size={19} /></button>
            </div>
          </section>
        </section>

        {outcome && story && (
          <div className="settlement-backdrop" role="presentation">
            <section className="settlement-dialog" role="dialog" aria-modal="true" aria-labelledby="settlement-title">
              <div className={`settlement-status ${outcome}`}>
                {outcome === 'won' ? <BadgeCheck size={25} /> : <Clock3 size={25} />}
                <span>{outcome === 'won' ? '推理成功' : outcome === 'lost' ? '提问用尽' : '主动揭晓'}</span>
              </div>
              <h2 id="settlement-title">{outcome === 'won' ? `${turnCount} 次提问还原真相` : outcome === 'lost' ? '这碗汤揭晓了' : '本局已放弃'}</h2>
              <div className="settlement-score">
                <div><strong>{coverage}%</strong><span>关键事实覆盖</span></div>
                <div><strong>{turnCount}/{MAX_QUESTIONS}</strong><span>使用轮次</span></div>
              </div>
              <div className="settlement-truth"><span>汤底</span><p>{story.truth}</p></div>
              <div className="reaction-panel">
                <span>你觉得这碗汤如何？</span>
                <div>
                  {[
                    { label: '合理', icon: Check },
                    { label: '意外', icon: Sparkles },
                    { label: '神来一笔', icon: Lightbulb },
                  ].map((item, index) => {
                    const Icon = item.icon
                    const base = currentCuratedId
                      ? curatedStories.find((entry) => entry.id === currentCuratedId)?.reactions[index] ?? 0
                      : [12, 8, 5][index]
                    return (
                      <button className={reactionChoice === index ? 'active' : ''} key={item.label} onClick={() => setReactionChoice(index)}>
                        <Icon size={16} /><strong>{item.label}</strong><small>{base + (reactionChoice === index ? 1 : 0)}</small>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="settlement-actions">
                <button onClick={() => setView('archive')}><BookOpen size={16} /> 汤局档案</button>
                <button className="primary" onClick={playNext}>下一题 <ChevronRight size={16} /></button>
              </div>
            </section>
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="app-shell studio-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('studio')} aria-label="盲汤创作桌">
          <span className="brand-mark"><Droplets size={20} /></span>
          <span>盲汤 <small>BLIND SOUP</small></span>
        </button>
        <nav className="topnav" aria-label="主导航">
          <button className="active" onClick={() => setView('studio')}><FlaskConical size={16} /> 创作桌</button>
          <button onClick={() => setView('archive')}><BookOpen size={16} /> 汤局档案</button>
        </nav>
        <div className="top-actions">
          <span className="local-chip"><span /> {import.meta.env.VITE_STORY_API_URL ? '模型已连接' : '本地试玩'}</span>
          <button className="icon-button" title="设置" aria-label="设置"><Settings2 size={19} /></button>
        </div>
      </header>

      <section className="studio-grid">
        <aside className="library-panel">
          <div className="panel-title">
            <div><span>元素库</span><small>{elementLibrary.length} ITEMS</small></div>
            <button className="icon-button small" title="更多元素" aria-label="更多元素"><MoreHorizontal size={18} /></button>
          </div>
          <label className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索线索" />
          </label>
          <div className="kind-tabs" role="tablist" aria-label="元素分类">
            <button className={activeKind === 'all' ? 'active' : ''} onClick={() => setActiveKind('all')}>全部</button>
            {(Object.keys(kindMeta) as ElementKind[]).map((kind) => (
              <button key={kind} className={activeKind === kind ? 'active' : ''} onClick={() => setActiveKind(kind)}>{kindMeta[kind].label}</button>
            ))}
          </div>
          <div className="element-list">
            {filteredElements.map((item) => {
              const isUsed = selected.some((selectedItem) => selectedItem.id === item.id)
              return (
                <button
                  className={`element-item kind-${kindMeta[item.kind].color} ${isUsed ? 'used' : ''}`}
                  key={item.id}
                  draggable={!isUsed && selected.length < 8}
                  onDragStart={(event) => event.dataTransfer.setData('text/element-id', item.id)}
                  onClick={() => addElement(item)}
                  disabled={isUsed || selected.length >= 8}
                >
                  <span className="element-icon"><ElementIcon name={item.icon} /></span>
                  <span><strong>{item.label}</strong><small>{kindMeta[item.kind].label}</small></span>
                  <span className="add-indicator">{isUsed ? <Check size={15} /> : <Plus size={15} />}</span>
                </button>
              )
            })}
          </div>
          <div className="drag-note"><Hand size={16} /> 拖入画布，或点击添加</div>
        </aside>

        <section className="canvas-section">
          <div className="canvas-heading">
            <div>
              <span className="eyebrow">STORY BOARD</span>
              <h1>案发现场</h1>
            </div>
            <div className="canvas-meta"><span>{selected.length} / 8 元素</span><button title="清空画布" aria-label="清空画布" onClick={() => setSelected([])}><Trash2 size={17} /></button></div>
          </div>
          <div
            className={`story-board ${selected.length === 0 ? 'empty' : ''}`}
            ref={boardRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="board-grid" aria-hidden="true" />
            {selected.length === 0 && <div className="empty-state"><Plus size={28} /><strong>把关键元素放到这里</strong><span>选择至少 3 个元素开始生成</span></div>}
            <svg className="connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {selected.slice(1).map((item, index) => {
                const previous = selected[index]
                return <line key={item.id} x1={previous.x} y1={previous.y} x2={item.x} y2={item.y} />
              })}
            </svg>
            {selected.map((item) => (
              <div
                className={`board-node kind-${kindMeta[item.kind].color}`}
                key={item.id}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                onPointerDown={(event) => moveNode(event, item.id)}
              >
                <button className="node-remove" title={`移除${item.label}`} aria-label={`移除${item.label}`} onClick={() => setSelected((items) => items.filter((entry) => entry.id !== item.id))}><X size={13} /></button>
                <ElementIcon name={item.icon} size={23} />
                <strong>{item.label}</strong>
                <small>{kindMeta[item.kind].label}</small>
              </div>
            ))}
          </div>
          <div className="board-caption"><span><Sparkles size={15} /> 线条表示故事中的潜在因果</span><span>可拖动节点重新安排</span></div>
        </section>

        <aside className="generator-panel">
          <div className="panel-title">
            <div><span>汤底生成器</span><small>AI DIRECTOR</small></div>
            <span className="ready-dot">READY</span>
          </div>

          <div className="control-group">
            <label>叙事口味</label>
            <div className="segmented">
              {(['悬疑', '惊悚', '荒诞'] as const).map((item) => <button key={item} onClick={() => setTone(item)} className={tone === item ? 'active' : ''}>{item}</button>)}
            </div>
          </div>

          <div className="control-group difficulty-control">
            <label><span>推理难度</span><strong>{difficulty}/5</strong></label>
            <input type="range" min="1" max="5" value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value))} />
            <div className="range-labels"><span>轻松</span><span>烧脑</span></div>
          </div>

          <div className="toggle-row">
            <div><Ghost size={18} /><span><strong>允许灵异</strong><small>汤底可包含真实超自然元素</small></span></div>
            <button className={`toggle ${supernatural ? 'on' : ''}`} role="switch" aria-checked={supernatural} onClick={() => setSupernatural((value) => !value)}><span /></button>
          </div>

          <div className="control-group">
            <label htmlFor="brief">一句话灵感 <span>可选</span></label>
            <textarea id="brief" value={brief} onChange={(event) => setBrief(event.target.value.slice(0, 80))} placeholder="例如：所有人都没有说谎……" maxLength={80} />
            <small className="counter">{brief.length}/80</small>
          </div>

          <button className="generate-button" onClick={generate} disabled={generating}>
            {generating ? <RefreshCw className="spin" size={19} /> : <Sparkles size={19} />}
            {generating ? '正在编织因果…' : draftStory ? '换一个汤底' : '生成海龟汤'}
          </button>

          {draftStory ? (
            <article className="story-result" aria-live="polite">
              <div className="result-head"><span>已生成</span><button title="复制模型提示词" aria-label="复制模型提示词" onClick={copyPrompt}><Copy size={16} /></button></div>
              <h2>{draftStory.title}</h2>
              <p>{draftStory.surface}</p>
              <div className="result-buttons">
                <button className="play-button" onClick={startGame}><Play size={17} fill="currentColor" /> 人类试玩</button>
                <button className="benchmark-button" onClick={() => { setStory(draftStory); setBenchmarkReturnView('studio'); setView('benchmark') }}><BrainCircuit size={17} /> 模型智测</button>
              </div>
            </article>
          ) : (
            <div className="generation-preview">
              <Theater size={25} />
              <span>汤面、汤底与裁判规则将在这里生成</span>
            </div>
          )}
        </aside>
      </section>

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}

export default App
