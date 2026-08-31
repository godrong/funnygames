import type { Story } from './story-engine'

export type CuratedStory = Story & {
  id: string
  author: string
  difficulty: number
  approval: number
  plays: number
  createdAt: string
  tags: string[]
  supernatural: boolean
  elementIds: string[]
  reactions: [number, number, number]
}

export const curatedStories: CuratedStory[] = [
  {
    id: 'last-signal',
    title: '最后一次报时',
    surface: '停用多年的山顶报时站，在暴雨夜准点播出了值班员的声音。救援队赶到时，站内没有人，值班员却在山脚昏迷不醒。',
    truth: '值班员白天录下了报时内容，并把旧广播接上定时电源，准备测试线路。暴雨引发的山体滑坡让他在下山途中受伤，而备用电源在预设时间启动，所以山顶传出了他的录音。',
    keyFacts: ['报时声音来自提前录好的录音', '广播由定时备用电源自动启动', '值班员在下山途中因暴雨受伤', '报时站当时确实没有人'],
    prompt: '原创精选汤局：最后一次报时。',
    author: '盲汤编辑部', difficulty: 2, approval: 91, plays: 1842, createdAt: '2026-08-26',
    tags: ['暴雨', '录音', '无人站'], supernatural: false, elementIds: ['worker', 'warehouse', 'ten-minutes', 'blackout'], reactions: [328, 61, 114],
  },
  {
    id: 'warm-icebox',
    title: '冰箱里的暖手袋',
    surface: '独居老人每天睡前都会把暖手袋放进冰箱。家人发现后没有阻止，反而立刻更换了厨房的门锁。为什么？',
    truth: '老人视力衰退，把外形相似的胰岛素冷藏袋误认成暖手袋。家人意识到有陌生护工一直在调换药品，并利用旧钥匙进入厨房，于是保留冷藏习惯作为证据，同时更换门锁。',
    keyFacts: ['老人因视力衰退认错了袋子', '袋子实际用于冷藏药品', '护工曾用旧钥匙进入厨房', '更换门锁是为了阻止护工继续调换药品'],
    prompt: '原创精选汤局：冰箱里的暖手袋。',
    author: '纸灯', difficulty: 3, approval: 87, plays: 1329, createdAt: '2026-08-19',
    tags: ['生活物品', '药品', '钥匙'], supernatural: false, elementIds: ['medicine', 'key', 'worker', 'locked'], reactions: [201, 48, 96],
  },
  {
    id: 'empty-seat',
    title: '雨夜的空座位',
    surface: '末班车上只有三名乘客，司机却坚持每站都为第四个人开门。到终点后，三名乘客一起向司机道谢。',
    truth: '第四个人是坐轮椅的乘客，他在车内监控的死角，司机只能从后视镜看到轮椅反光。司机逐站放下无障碍踏板，是在测试哪一站积水最浅，最终让他安全下车，其他乘客因此道谢。',
    keyFacts: ['第四名乘客位于监控死角', '后视镜只能看见轮椅反光', '司机开门是在测试站台积水', '其他乘客感谢司机帮助轮椅乘客'],
    prompt: '原创精选汤局：雨夜的空座位。',
    author: '夜班车长', difficulty: 3, approval: 84, plays: 2206, createdAt: '2026-08-13',
    tags: ['末班车', '雨夜', '视觉误导'], supernatural: false, elementIds: ['train', 'three', 'water', 'missing-memory'], reactions: [287, 79, 133],
  },
  {
    id: 'unspent-torch',
    title: '没有熄灭的火把',
    surface: '仓库停电后，保安在门外看见里面的火把一直燃烧。消防员破门时却说，仓库里从来没有火。',
    truth: '所谓火把是贴在旋转警示灯前的一张旧宣传画。备用电池让警示灯在停电后继续转动，透过磨砂玻璃看起来像跳动的火焰。保安误以为失火，不敢开门。',
    keyFacts: ['火把其实是宣传画上的图案', '旋转警示灯制造了火焰跳动的错觉', '警示灯由备用电池供电', '磨砂玻璃让保安无法看清仓库内部'],
    prompt: '原创精选汤局：没有熄灭的火把。',
    author: '北窗', difficulty: 2, approval: 82, plays: 972, createdAt: '2026-08-29',
    tags: ['仓库', '火把', '停电'], supernatural: false, elementIds: ['torch', 'warehouse', 'worker', 'blackout'], reactions: [142, 33, 88],
  },
  {
    id: 'second-water',
    title: '凌晨三点的第二杯水',
    surface: '旅馆前台每晚三点都会给空房送两杯水。第三天，他只送了一杯，警察因此找到了失踪者。',
    truth: '失踪者被困在相邻房间的检修夹层，只能敲击水管求救。前台用两杯不同水位的水观察波纹，确认敲击来自哪一侧；第三晚确定方向后留下一杯作标记，并通知警察拆墙救人。',
    keyFacts: ['失踪者被困在相邻房间的检修夹层', '敲击通过水管传到空房', '两杯不同水位用于判断震动方向', '留下的一杯水是给警察的定位标记'],
    prompt: '原创精选汤局：凌晨三点的第二杯水。',
    author: '七号房客', difficulty: 4, approval: 93, plays: 3104, createdAt: '2026-08-30',
    tags: ['旅馆', '一杯水', '失踪'], supernatural: false, elementIds: ['hotel', 'water', 'missing-memory', 'midnight'], reactions: [489, 42, 176],
  },
  {
    id: 'missing-page',
    title: '从未被撕掉的那一页',
    surface: '档案室里一本完整的登记簿少了一页。管理员检查装订线后却立刻承认，是自己让那一页消失的。',
    truth: '登记簿没有被撕页。管理员用两张极薄的复写纸粘在一起，覆盖了一条违规出入记录，页码仍然连续。台灯加热使胶层变软，两张纸分开后，所谓消失的一页重新出现。',
    keyFacts: ['登记簿实际没有被撕页', '两张薄复写纸被粘在一起', '管理员想隐藏违规出入记录', '台灯加热使胶层分开并暴露记录'],
    prompt: '原创精选汤局：从未被撕掉的那一页。',
    author: '墨迹', difficulty: 4, approval: 89, plays: 1678, createdAt: '2026-08-22',
    tags: ['档案室', '台灯', '消失'], supernatural: false, elementIds: ['archive', 'lamp', 'worker', 'missing-memory'], reactions: [245, 51, 128],
  },
]
