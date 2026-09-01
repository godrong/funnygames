import { describe, expect, it } from 'vitest'
import { curatedStories } from './curated-stories'
import { buildStory, findMatchingFacts, judgeQuestion, MAX_QUESTIONS, requiredFactCount, type GameElement } from './story-engine'

const elements: GameElement[] = [
  { id: 'lab', label: '实验室', kind: 'place', icon: 'flask' },
  { id: 'beaker', label: '烧杯', kind: 'object', icon: 'beaker' },
  { id: 'night', label: '午夜', kind: 'time', icon: 'moon' },
]

const fullElements: GameElement[] = [
  { id: 'lab', label: '实验室', kind: 'place', icon: 'flask' },
  { id: 'beaker', label: '烧杯', kind: 'object', icon: 'beaker' },
  { id: 'key', label: '钥匙', kind: 'object', icon: 'key' },
  { id: 'worker', label: '值班员', kind: 'person', icon: 'person' },
  { id: 'night', label: '午夜', kind: 'time', icon: 'moon' },
  { id: 'blackout', label: '停电', kind: 'anomaly', icon: 'zap' },
  { id: 'knife', label: '刀具', kind: 'object', icon: 'knife' },
  { id: 'doctor', label: '医生', kind: 'person', icon: 'doctor' },
]

const settings = (variant: number, overrides: Partial<Parameters<typeof buildStory>[1]> = {}) => ({
  tone: '悬疑' as const,
  difficulty: 3,
  supernatural: false,
  brief: '',
  variant,
  ...overrides,
})

describe('story engine', () => {
  it('uses selected elements in the generated surface', () => {
    const story = buildStory(elements, { tone: '悬疑', difficulty: 3, supernatural: false, brief: '', variant: 0 })
    expect(story.surface).toContain('实验室')
    expect(story.surface).toContain('烧杯')
  })

  it('keeps supernatural answers consistent with settings', () => {
    const story = buildStory(elements, { tone: '惊悚', difficulty: 4, supernatural: false, brief: '', variant: 1 })
    expect(judgeQuestion('这和鬼有关吗？', story, false).verdict).toBe('否')
  })

  it('gives every generated archetype authored useful quick questions', () => {
    for (let variant = 0; variant < 8; variant += 1) {
      const story = buildStory(fullElements, settings(variant))
      expect(story.suggestedQuestions).toHaveLength(3)
      for (const question of story.suggestedQuestions ?? []) {
        expect(judgeQuestion(question, story, false).verdict, `variant ${variant}: ${question}`).not.toBe('无关')
      }
    }
  })

  it('maps a question to the key fact it uncovers', () => {
    const story = buildStory(elements, { tone: '悬疑', difficulty: 3, supernatural: false, brief: '', variant: 0 })
    expect(findMatchingFacts('死亡时间是不是被提前改变了？', story)).toContain(0)
  })

  it('automatically solves a case after enough unique facts are covered', () => {
    const story = buildStory(elements, { tone: '悬疑', difficulty: 3, supernatural: false, brief: '', variant: 0 })
    const knownFacts = [0, 1]
    const result = judgeQuestion(story.suggestedQuestions![2], story, false, knownFacts)

    expect(requiredFactCount(story)).toBe(3)
    expect(result.solved).toBe(true)
    expect(result.verdict).toBe('猜对了')
  })

  it('uses an eight-question session limit', () => {
    expect(MAX_QUESTIONS).toBe(8)
  })

  it('generates eight structurally different deterministic stories', () => {
    const stories = Array.from({ length: 8 }, (_, variant) => buildStory(fullElements, settings(variant)))

    expect(new Set(stories.map((story) => story.title)).size).toBe(8)
    expect(new Set(stories.map((story) => story.surface)).size).toBe(8)
    expect(new Set(stories.map((story) => story.truth)).size).toBe(8)
    expect(buildStory(fullElements, settings(5))).toEqual(buildStory(fullElements, settings(5)))
  })

  it('does not bake a fixed fourth-person trope into any generated archetype', () => {
    for (let variant = 0; variant < 8; variant += 1) {
      const story = buildStory(fullElements, settings(variant))
      expect(JSON.stringify(story)).not.toContain('第四个人')
      expect(JSON.stringify(story)).not.toContain('第四名')
    }
  })

  it.each([
    ['no elements', []],
    ['exactly three elements', fullElements.slice(0, 3)],
    ['exactly eight elements', fullElements],
    ['no object', fullElements.filter((item) => item.kind !== 'object')],
    ['no person', fullElements.filter((item) => item.kind !== 'person')],
    ['no place', fullElements.filter((item) => item.kind !== 'place')],
    ['no time', fullElements.filter((item) => item.kind !== 'time')],
    ['no anomaly', fullElements.filter((item) => item.kind !== 'anomaly')],
  ] as const)('handles boundary input: %s', (_label, input) => {
    expect(() => buildStory([...input], settings(3))).not.toThrow()
    const story = buildStory([...input], settings(3))
    expect(story.surface.length).toBeGreaterThan(20)
    expect(story.truth.length).toBeGreaterThan(20)
    expect(story.keyFacts).toHaveLength(4)
  })

  it('preserves every supplied element in the surface or truth', () => {
    const story = buildStory(fullElements, settings(2))
    const completeStory = `${story.surface}${story.truth}`

    for (const element of fullElements) expect(completeStory).toContain(element.label)
  })

  it('handles regex characters in element labels and judge rules', () => {
    const specialElements: GameElement[] = [
      { id: 'object', label: '杯子(1)+?', kind: 'object', icon: 'beaker' },
      { id: 'extra', label: '钥匙[备用]*', kind: 'object', icon: 'key' },
      { id: 'person', label: '值班员$A', kind: 'person', icon: 'person' },
      { id: 'place', label: '实验室{东}', kind: 'place', icon: 'lab' },
      { id: 'anomaly', label: '停电|闪烁', kind: 'anomaly', icon: 'zap' },
    ]
    const story = buildStory(specialElements, settings(0))

    expect(() => story.judgeRules?.forEach((judgeRule) => judgeRule.pattern.test('任意问题'))).not.toThrow()
    expect(judgeQuestion('杯子(1)+?被加热过吗？', story, false).verdict).toBe('是')
    expect(judgeQuestion('钥匙[备用]*触发了延时装置吗？', story, false).verdict).toBe('是')
  })

  it.each(['', '   ', '甲'.repeat(80)])('handles brief boundary %j', (brief) => {
    const story = buildStory(elements, settings(1, { brief }))
    if (brief.trim()) expect(story.surface).toContain(brief.trim())
    else expect(story.surface).not.toContain('额外条件')
  })

  it('turns a missing-person brief into an actual story constraint', () => {
    const constrainedElements: GameElement[] = [
      { id: 'locked', label: '密室', kind: 'anomaly', icon: 'lock' },
      { id: 'night', label: '午夜', kind: 'time', icon: 'moon' },
      { id: 'missing', label: '失踪者', kind: 'person', icon: 'person' },
    ]

    for (let variant = 0; variant < 6; variant += 1) {
      const story = buildStory(constrainedElements, settings(variant, { brief: '图书馆8个人少了一个人' }))
      expect(story.surface).toContain('图书馆')
      expect(story.surface).toContain('8个人')
      expect(story.surface).toContain('少了一个')
      expect(story.surface).not.toContain('第四个人')
      expect(story.surface).not.toContain('发生密室')
      expect(story.truth).toContain('登记中减少的是失踪者本人')
      expect(story.truth).not.toContain('或本人')
      expect(story.truth).not.toContain('密室则是')
      expect(['认错的失踪者', '主动消失的人']).toContain(story.title)
      for (const question of story.suggestedQuestions ?? []) {
        expect(judgeQuestion(question, story, false).verdict).not.toBe('无关')
      }
    }
  })

  it('prefers a selected place over a place mentioned in the brief', () => {
    const story = buildStory(elements, settings(0, { brief: '图书馆8个人少了一个人' }))
    expect(story.surface).toContain('实验室')
  })

  it('renders anomaly elements as events instead of malformed verbs', () => {
    const lockedElements: GameElement[] = [
      { id: 'locked', label: '密室', kind: 'anomaly', icon: 'lock' },
      { id: 'person', label: '失踪者', kind: 'person', icon: 'person' },
      { id: 'time', label: '午夜', kind: 'time', icon: 'moon' },
    ]

    for (let variant = 0; variant < 8; variant += 1) {
      const story = buildStory(lockedElements, settings(variant))
      expect(story.surface).not.toMatch(/发生密室|随后密室|密室后|引发密室/)
      expect(story.surface).toContain('房门突然从里面反锁')
    }
  })

  it('uses tone and difficulty as story output controls', () => {
    const plain = buildStory(elements, settings(2, { tone: '悬疑', difficulty: 3 }))
    const absurd = buildStory(elements, settings(2, { tone: '荒诞', difficulty: 5 }))

    expect(absurd.surface).not.toBe(plain.surface)
    expect(absurd.truth).not.toBe(plain.truth)
  })

  it('keeps supernatural logic consistent in both modes', () => {
    const realistic = buildStory(elements, settings(7, { supernatural: false }))
    const supernatural = buildStory(elements, settings(7, { supernatural: true }))

    expect(judgeQuestion('这和鬼或超自然有关吗？', realistic, false).verdict).toBe('否')
    expect(judgeQuestion('这和鬼或超自然有关吗？', supernatural, true).verdict).toBe('是')
    expect(supernatural.truth).toContain('真实的时间循环')
  })

  it('does not invent ghosts in realistic archetypes when supernatural is merely allowed', () => {
    for (let variant = 0; variant < 7; variant += 1) {
      const story = buildStory(elements, settings(variant, { supernatural: true }))
      expect(judgeQuestion('这和鬼或超自然有关吗？', story, true).verdict).toBe('否')
    }
  })

  it('does not award new coverage for repeated, negative, or unrelated questions', () => {
    const story = buildStory(fullElements, settings(0))
    const first = judgeQuestion('死亡时间比大家以为的更早吗？', story, false)
    const repeated = judgeQuestion('死亡时间比大家以为的更早吗？', story, false, first.matchedFacts)
    const negative = judgeQuestion('受害者是响声时才死的吗？', story, false, first.matchedFacts)
    const unrelated = judgeQuestion('这和早餐吃什么有关吗？', story, false, first.matchedFacts)

    expect(first.matchedFacts).toEqual([0])
    expect(new Set([...first.matchedFacts, ...repeated.matchedFacts]).size).toBe(1)
    expect(negative.matchedFacts).toEqual([])
    expect(unrelated.matchedFacts).toEqual([])
    expect(repeated.solved).toBe(false)
  })

  it('requires only available facts for empty and small stories', () => {
    const base = buildStory(elements, settings(0))
    expect(requiredFactCount({ ...base, keyFacts: [] })).toBe(0)
    expect(requiredFactCount({ ...base, keyFacts: ['one'] })).toBe(1)
    expect(requiredFactCount({ ...base, keyFacts: ['one', 'two'] })).toBe(2)
  })

  it('does not overcount facts that only share a generic object phrase', () => {
    const waterStory = curatedStories.find((story) => story.id === 'second-water')!
    expect(findMatchingFacts('两杯水是用来判断震动方向的吗？', waterStory)).toEqual([2])
  })

  it.each([
    ['last-signal', '声音是提前录音吗？', '值班员在站内现场播报吗？'],
    ['warm-icebox', '袋子和冷藏药品有关吗？', '老人是在故意恶作剧吗？'],
    ['empty-seat', '这和轮椅有关吗？', '这是一起绑架案吗？'],
    ['unspent-torch', '火把其实是宣传画吗？', '仓库真的着火了吗？'],
    ['second-water', '敲击声通过水管传来吗？', '水里有毒吗？'],
    ['missing-page', '有两张纸粘在一起吗？', '页面真的被撕走了吗？'],
  ])('judges curated case %s with authored yes and no rules', (id, yesQuestion, noQuestion) => {
    const curated = curatedStories.find((story) => story.id === id)!
    expect(judgeQuestion(yesQuestion, curated, curated.supernatural).verdict).toBe('是')
    expect(judgeQuestion(noQuestion, curated, curated.supernatural).verdict).toBe('否')
    expect(judgeQuestion('这和早餐吃什么有关吗？', curated, curated.supernatural).verdict).toBe('无关')
  })

  it('handles negated guesses without awarding a true fact', () => {
    const waterStory = curatedStories.find((story) => story.id === 'second-water')!
    const result = judgeQuestion('失踪者没有被困在夹层里，对吗？', waterStory, false)

    expect(result.verdict).toBe('否')
    expect(result.matchedFacts).toEqual([])
  })

  it('keeps every curated quick question useful', () => {
    for (const curated of curatedStories) {
      for (const question of curated.suggestedQuestions ?? []) {
        expect(judgeQuestion(question, curated, curated.supernatural).verdict).not.toBe('无关')
      }
    }
  })
})
