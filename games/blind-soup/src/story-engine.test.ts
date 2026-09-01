import { describe, expect, it } from 'vitest'
import { curatedStories } from './curated-stories'
import { buildStory, findMatchingFacts, judgeQuestion, MAX_QUESTIONS, requiredFactCount, type GameElement } from './story-engine'

const elements: GameElement[] = [
  { id: 'lab', label: '实验室', kind: 'place', icon: 'flask' },
  { id: 'beaker', label: '烧杯', kind: 'object', icon: 'beaker' },
  { id: 'night', label: '午夜', kind: 'time', icon: 'moon' },
]

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

  it('gives generated local stories authored yes and no answers', () => {
    const story = buildStory(elements, { tone: '悬疑', difficulty: 3, supernatural: false, brief: '', variant: 0 })
    expect(judgeQuestion('死亡时间被人误导了吗？', story, false).verdict).toBe('是')
    expect(judgeQuestion('第四个人真实存在吗？', story, false).verdict).toBe('否')
    expect(judgeQuestion('一把钥匙不是真正的凶器吗？', story, false).verdict).toBe('是')
  })

  it('maps a question to the key fact it uncovers', () => {
    const story = buildStory(elements, { tone: '悬疑', difficulty: 3, supernatural: false, brief: '', variant: 0 })
    expect(findMatchingFacts('死亡时间是不是被提前改变了？', story)).toContain(0)
  })

  it('automatically solves a case after enough unique facts are covered', () => {
    const story = buildStory(elements, { tone: '悬疑', difficulty: 3, supernatural: false, brief: '', variant: 0 })
    const knownFacts = [0, 1]
    const result = judgeQuestion('第四个人其实是镜子里的视觉误导吗？', story, false, knownFacts)

    expect(requiredFactCount(story)).toBe(3)
    expect(result.solved).toBe(true)
    expect(result.verdict).toBe('猜对了')
  })

  it('uses an eight-question session limit', () => {
    expect(MAX_QUESTIONS).toBe(8)
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
