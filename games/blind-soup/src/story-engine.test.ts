import { describe, expect, it } from 'vitest'
import { buildStory, judgeQuestion, type GameElement } from './story-engine'

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
})
