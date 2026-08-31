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

export function judgeQuestion(question: string, story: Story, supernatural: boolean) {
  const normalized = question.trim()
  if (!normalized) return { verdict: '无关', detail: '先提出一个可以用“是或否”回答的问题。' }
  if (/鬼|幽灵|超自然|诅咒/.test(normalized)) {
    return supernatural
      ? { verdict: '是', detail: '超自然因素确实参与了事件。' }
      : { verdict: '否', detail: '一切都有现实层面的解释。' }
  }
  if (/时间|提前|之前|死亡/.test(normalized)) return { verdict: '是', detail: '死亡时间是关键突破口。' }
  if (/第四个人|反射|镜|影子/.test(normalized)) return { verdict: '是', detail: '你正在接近视觉误导的核心。' }
  if (/凶器|杀死|杀害/.test(normalized)) return { verdict: '否', detail: '你注意到的物品用途和表面看起来不同。' }
  if (story.keyFacts.some((fact) => normalized.split('').filter(Boolean).some((char) => fact.includes(char)) && normalized.length > 4)) {
    return { verdict: '是', detail: '这个方向与真相有关。' }
  }
  return { verdict: '无关', detail: '这个问题不能帮助还原关键因果。' }
}
