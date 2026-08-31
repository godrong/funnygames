export type ElementKind = 'object' | 'person' | 'place' | 'time' | 'anomaly'

export type GameElement = {
  id: string
  label: string
  kind: ElementKind
  icon: string
  x?: number
  y?: number
}

export type StorySettings = {
  tone: '悬疑' | '惊悚' | '荒诞'
  difficulty: number
  supernatural: boolean
  brief: string
  variant: number
}

export type Story = {
  title: string
  surface: string
  truth: string
  keyFacts: string[]
  prompt: string
}

export const MAX_QUESTIONS = 8

export type JudgeResult = {
  verdict: '是' | '否' | '无关' | '猜对了'
  detail: string
  matchedFacts: number[]
  solved: boolean
}

const storySchema = {
  type: 'object',
  required: ['title', 'surface', 'truth', 'keyFacts'],
  properties: {
    title: { type: 'string' },
    surface: { type: 'string' },
    truth: { type: 'string' },
    keyFacts: { type: 'array', items: { type: 'string' } },
  },
}

const titles = ['零点后的第四个人', '没有倒下的影子', '最后一盏灯', '被擦掉的十分钟']

const pick = (elements: GameElement[], kind: ElementKind, fallback: string) =>
  elements.find((item) => item.kind === kind)?.label ?? fallback

export function buildStory(elements: GameElement[], settings: StorySettings): Story {
  const object = pick(elements, 'object', '一只停摆的钟')
  const person = pick(elements, 'person', '夜班保安')
  const place = pick(elements, 'place', '封闭的旧楼')
  const time = pick(elements, 'time', '午夜')
  const anomaly = pick(elements, 'anomaly', '突然停电')
  const extra = elements.find((item) => item.kind === 'object' && item.label !== object)?.label ?? '一把钥匙'
  const supernaturalLine = settings.supernatural
    ? '监控中的异常并非设备故障，而是死者留下的重复幻象。'
    : '看似超自然的现象，其实来自应急电源与镜面反射的时间差。'
  const briefLine = settings.brief.trim() ? `创作者给出的限制是：“${settings.brief.trim()}”。` : ''
  const title = titles[settings.variant % titles.length]

  return {
    title,
    surface: `${time}，${place}里${anomaly}。灯光恢复后，${person}倒在上锁的房间里，手边只有${object}，门外却放着${extra}。警方确认没有人进出，但在场的人都说自己看见了“第四个人”。为什么？`,
    truth: `${person}并非在停电时遇害。${object}被提前动过手脚，它制造了错误的死亡时间；${extra}则被用来触发房间外的机关。所谓“第四个人”是玻璃反射出的延迟影像，三名目击者从不同角度看见了同一个人。${supernaturalLine}${briefLine}`,
    keyFacts: [
      `${object}改变了死亡时间判断`,
      `${extra}不是真正的凶器`,
      '“第四个人”是视觉误导',
      `${anomaly}是计划的一部分`,
    ],
    prompt: `请生成一道${settings.tone}风格、难度 ${settings.difficulty}/5 的海龟汤。必须使用元素：${elements.map((item) => item.label).join('、')}。${settings.supernatural ? '允许真实超自然设定。' : '所有异常必须有现实解释。'}额外限制：${settings.brief || '无'}。输出 title、surface、truth、keyFacts，并保证汤面不泄露汤底。`,
  }
}

export async function requestStory(elements: GameElement[], settings: StorySettings): Promise<Story> {
  const fallback = buildStory(elements, settings)
  const endpoint = import.meta.env.VITE_STORY_API_URL
  if (!endpoint) return fallback

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ elements, settings, prompt: fallback.prompt, schema: storySchema }),
  })
  if (!response.ok) throw new Error(`Story API returned ${response.status}`)

  const payload: unknown = await response.json()
  const candidate = (payload as { story?: unknown }).story ?? payload
  if (!isStory(candidate)) throw new Error('Story API returned an invalid payload')
  return { ...candidate, prompt: fallback.prompt }
}

function isStory(value: unknown): value is Omit<Story, 'prompt'> {
  if (!value || typeof value !== 'object') return false
  const story = value as Record<string, unknown>
  return typeof story.title === 'string'
    && typeof story.surface === 'string'
    && typeof story.truth === 'string'
    && Array.isArray(story.keyFacts)
    && story.keyFacts.every((fact) => typeof fact === 'string')
}

const normalize = (value: string) => value.replace(/[\s，。！？、“”‘’：；,.!?;:'"()（）]/g, '')

const ignoredBigrams = new Set([
  '是不是',
  '是否',
  '有关',
  '因为',
  '所以',
  '什么',
  '怎么',
  '这个',
  '那个',
  '真的',
  '可以',
].flatMap((word) => Array.from({ length: Math.max(0, word.length - 1) }, (_, index) => word.slice(index, index + 2))))

function bigrams(value: string) {
  const text = normalize(value)
  return new Set(
    Array.from({ length: Math.max(0, text.length - 1) }, (_, index) => text.slice(index, index + 2))
      .filter((gram) => !ignoredBigrams.has(gram)),
  )
}

const topicPatterns = [
  /时间|提前|之前|死亡|延迟/,
  /反射|镜|影子|视觉|倒影/,
  /机关|触发|遥控|自动|定时/,
  /录音|广播|声音|听见|电话/,
  /温度|冷|热|冰|融化/,
  /身份|假扮|伪装|换装|认错/,
  /灯|火|停电|照明|亮/,
  /药|毒|过敏|病|治疗/,
  /钥匙|门|锁|密室|出入/,
]

export function findMatchingFacts(question: string, story: Story) {
  const questionGrams = bigrams(question)
  const topicMatches = topicPatterns.filter((pattern) => pattern.test(question))

  return story.keyFacts.flatMap((fact, index) => {
    const factGrams = bigrams(fact)
    const overlap = [...questionGrams].filter((gram) => factGrams.has(gram)).length
    const sharesTopic = topicMatches.some((pattern) => pattern.test(fact))
    return overlap >= 3 || sharesTopic ? [index] : []
  })
}

export function requiredFactCount(story: Story) {
  return Math.max(2, Math.ceil(story.keyFacts.length * 0.75))
}

export function judgeQuestion(
  question: string,
  story: Story,
  supernatural: boolean,
  knownFacts: number[] = [],
): JudgeResult {
  const normalized = question.trim()
  if (!normalized) return { verdict: '无关', detail: '先提出一个可以用“是或否”回答的问题。', matchedFacts: [], solved: false }

  const matchedFacts = findMatchingFacts(normalized, story)
  const coveredFacts = new Set([...knownFacts, ...matchedFacts])
  const explicitGuess = /我猜|真相|答案|所以|其实|也就是说|是不是因为|完整还原/.test(normalized)
  const solved = coveredFacts.size >= requiredFactCount(story) || (explicitGuess && matchedFacts.length >= 2)

  if (solved) {
    return {
      verdict: '猜对了',
      detail: '关键因果已经闭合。你还原出了这碗汤的核心真相。',
      matchedFacts,
      solved: true,
    }
  }
  if (/鬼|幽灵|超自然|诅咒/.test(normalized)) {
    return supernatural
      ? { verdict: '是', detail: '超自然因素确实参与了事件。', matchedFacts, solved: false }
      : { verdict: '否', detail: '一切都有现实层面的解释。', matchedFacts, solved: false }
  }
  if (matchedFacts.length > 0) {
    return { verdict: '是', detail: '这个方向与真相有关，继续追问其中的因果。', matchedFacts, solved: false }
  }
  if (/凶器|杀死|杀害/.test(normalized)) {
    return { verdict: '否', detail: '你注意到的物品用途和表面看起来不同。', matchedFacts: [], solved: false }
  }
  return { verdict: '无关', detail: '这个问题不能帮助还原关键因果。', matchedFacts: [], solved: false }
}
