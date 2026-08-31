import { describe, expect, it } from 'vitest'
import { modelOptions, simulateBenchmark } from './model-benchmark'
import type { Story } from './story-engine'

const story: Story = {
  title: '测试汤',
  surface: '一个密室谜题。',
  truth: '镜子制造了第四个人。',
  keyFacts: ['时间错误', '物品不是凶器', '视觉误导', '停电是计划的一部分'],
  prompt: '',
}

describe('model benchmark', () => {
  it('produces stable bounded metrics', () => {
    const first = simulateBenchmark(story, modelOptions[0])
    const second = simulateBenchmark(story, modelOptions[0])
    expect(first).toEqual(second)
    expect(first.score).toBeGreaterThanOrEqual(0)
    expect(first.score).toBeLessThanOrEqual(100)
  })
})
