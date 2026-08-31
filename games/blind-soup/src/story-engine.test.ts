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
})
