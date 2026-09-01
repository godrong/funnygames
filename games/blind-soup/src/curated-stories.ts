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
    suggestedQuestions: ['声音是提前录好的吗？', '广播会自动启动吗？', '值班员当时在山顶吗？'],
    judgeRules: [
      { pattern: /录音|提前录|预先录|录好的/, verdict: '是', fact: 0, detail: '声音的来源确实不是现场讲话。' },
      { pattern: /定时|备用电源|自动启动|预设时间/, verdict: '是', fact: 1, detail: '广播设备会在特定条件下自行启动。' },
      { pattern: /下山|滑坡|途中.*受伤|暴雨.*受伤/, verdict: '是', fact: 2, detail: '值班员离开山顶后的遭遇很关键。' },
      { pattern: /站内.*没人|站里.*没人|报时站.*无人|山顶.*无人|确实没有人/, verdict: '是', fact: 3, detail: '广播响起时，站内确实没有人。' },
      { pattern: /现场.*说|本人.*广播|值班员.*山顶|值班员.*站内/, verdict: '否', detail: '报时并不是值班员在站内现场播出的。' },
      { pattern: /袭击|凶手|谋杀|自杀|死亡/, verdict: '否', detail: '值班员没有遭到人为袭击，也没有死亡。' },
      { pattern: /藏|躲|同伙|陌生人|其他人/, verdict: '否', detail: '站内没有藏着另一个人。' },
      { pattern: /外星|彩票|宠物|早餐/, verdict: '无关', detail: '这个方向与报时事件无关。' },
    ],
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
    suggestedQuestions: ['老人看错东西了吗？', '袋子和药品有关吗？', '有人用旧钥匙进来过吗？'],
    judgeRules: [
      { pattern: /视力|看错|认错|误认|眼睛/, verdict: '是', fact: 0, detail: '老人的视觉判断出现了偏差。' },
      { pattern: /胰岛素|冷藏袋|药品|药物|装药|和药有关/, verdict: '是', fact: 1, detail: '这个袋子的真正用途与药品有关。' },
      { pattern: /护工|旧钥匙|偷偷.*厨房|进入.*厨房/, verdict: '是', fact: 2, detail: '确实有人利用原有的钥匙进入过厨房。' },
      { pattern: /换锁|门锁|阻止.*护工|调换.*药|保护.*药/, verdict: '是', fact: 3, detail: '换锁是为了阻止药品继续被人动手脚。' },
      { pattern: /老人.*故意|假装|装病|恶作剧/, verdict: '否', detail: '老人不是故意做出这个举动。' },
      { pattern: /暖手|取暖|加热/, verdict: '否', detail: '这个袋子当时并不是用来取暖的。' },
      { pattern: /家人.*害|家人.*凶手|老人.*死亡|老人.*死/, verdict: '否', detail: '家人没有伤害老人，老人也没有死亡。' },
      { pattern: /鬼|诅咒|灵异/, verdict: '否', detail: '事件没有超自然因素。' },
    ],
    author: '纸灯', difficulty: 3, approval: 87, plays: 1329, createdAt: '2026-08-19',
    tags: ['生活物品', '药品', '钥匙'], supernatural: false, elementIds: ['medicine', 'key', 'worker', 'locked'], reactions: [201, 48, 96],
  },
  {
    id: 'empty-seat',
    title: '雨夜的空座位',
    surface: '末班车上只能看见三名乘客，司机却坚持每站都为看不见的那一位开门。到终点后，车上的人一起向司机道谢。',
    truth: '看不见的那一位是坐轮椅的乘客，他处在车内监控的死角，司机只能从后视镜看到轮椅反光。司机逐站放下无障碍踏板，是在测试哪一站积水最浅，最终让他安全下车，其他乘客因此道谢。',
    keyFacts: ['另有一名乘客位于监控死角', '后视镜只能看见轮椅反光', '司机开门是在测试站台积水', '其他乘客感谢司机帮助轮椅乘客'],
    prompt: '原创精选汤局：雨夜的空座位。',
    suggestedQuestions: ['还有一名看不见的乘客在车上吗？', '这和轮椅有关吗？', '司机在测试站台吗？'],
    judgeRules: [
      { pattern: /另.*乘客|还有.*乘客|看不见.*乘客|监控死角|看不到.*乘客/, verdict: '是', fact: 0, detail: '车上确实还有一名不容易被看见的乘客。' },
      { pattern: /轮椅|后视镜|反光|倒影/, verdict: '是', fact: 1, detail: '司机看到的视觉线索与轮椅有关。' },
      { pattern: /积水|测试.*站|哪一站|无障碍踏板/, verdict: '是', fact: 2, detail: '司机逐站开门是在比较下车条件。' },
      { pattern: /帮助.*下车|安全下车|感谢.*司机|道谢.*帮助/, verdict: '是', fact: 3, detail: '道谢是因为司机帮助了一名乘客。' },
      { pattern: /其他乘客.*不存在|没有其他人|司机.*幻觉|看错人/, verdict: '否', detail: '那名乘客真实存在，并非司机的幻觉。' },
      { pattern: /每站.*上车|每站.*下车|接人|等人/, verdict: '否', detail: '开门不是为了让新乘客上下车。' },
      { pattern: /鬼|幽灵|灵异|诅咒/, verdict: '否', detail: '这不是超自然事件。' },
      { pattern: /犯罪|绑架|凶手|死亡/, verdict: '否', detail: '这起事件没有犯罪或死亡。' },
    ],
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
    suggestedQuestions: ['看到的是真火吗？', '这和警示灯有关吗？', '玻璃影响了视线吗？'],
    judgeRules: [
      { pattern: /宣传画|图案|画上.*火|不是真.*火|并非.*真火|没有.*真火/, verdict: '是', fact: 0, detail: '保安看到的“火把”并不是真实火焰。' },
      { pattern: /警示灯|旋转.*灯|灯.*转|跳动.*错觉/, verdict: '是', fact: 1, detail: '会运动的光源制造了火焰跳动的错觉。' },
      { pattern: /备用电池|电池.*供电|停电.*还亮|应急电源/, verdict: '是', fact: 2, detail: '停电后仍有独立电源让设备运转。' },
      { pattern: /磨砂玻璃|玻璃.*看不清|玻璃.*视线|隔着玻璃/, verdict: '是', fact: 3, detail: '玻璃让保安无法看清仓库内的真实情况。' },
      { pattern: /看到.*真火|真的.*燃烧|仓库.*着火|发生.*火灾/, verdict: '否', detail: '仓库里没有发生真实燃烧。' },
      { pattern: /消防员.*撒谎|消防员.*骗/, verdict: '否', detail: '消防员没有说谎。' },
      { pattern: /纵火|凶手|死人|死亡/, verdict: '否', detail: '事件不涉及纵火杀人。' },
      { pattern: /鬼火|幽灵|灵异/, verdict: '否', detail: '看似异常的火光有现实解释。' },
    ],
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
    suggestedQuestions: ['失踪者还活着吗？', '敲击声通过水管传来吗？', '水杯是用来定位的吗？'],
    judgeRules: [
      { pattern: /还活着|没有死|活人/, verdict: '是', detail: '失踪者当时仍然活着。' },
      { pattern: /没有.*被困|没.*被困|并未.*被困|不在.*夹层/, verdict: '否', detail: '失踪者确实处于受困状态。' },
      { pattern: /夹层|相邻房|隔壁房|被困/, verdict: '是', fact: 0, detail: '失踪者被困的位置与相邻房间有关。' },
      { pattern: /水管|敲击|敲.*求救|声音.*管道/, verdict: '是', fact: 1, detail: '求救信号确实通过建筑管道传递。' },
      { pattern: /不同水位|波纹|震动.*方向|判断.*方向|判断.*哪边|两杯水.*定位|水杯.*定位/, verdict: '是', fact: 2, detail: '两杯水被用来比较震动并判断方向。' },
      { pattern: /留下.*一杯|一杯.*标记|警察.*定位|定位标记/, verdict: '是', fact: 3, detail: '最后留下的水杯承担了定位标记的作用。' },
      { pattern: /死了|死亡|尸体|被杀/, verdict: '否', detail: '失踪者没有死亡。' },
      { pattern: /水.*有毒|下毒|毒水|喝水|口渴/, verdict: '否', detail: '水没有毒，也不是给人饮用的。' },
      { pattern: /前台.*凶手|前台.*绑架|警察.*凶手/, verdict: '否', detail: '前台和警察都不是加害者。' },
      { pattern: /鬼|灵异|幽灵/, verdict: '否', detail: '这不是超自然事件。' },
    ],
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
    suggestedQuestions: ['页面真的被撕掉了吗？', '有两张纸粘在一起吗？', '台灯起了作用吗？'],
    judgeRules: [
      { pattern: /没.*撕|没有.*撕|并非.*撕|不是.*撕|装订.*完整/, verdict: '是', fact: 0, detail: '登记簿的装订确实没有缺损。' },
      { pattern: /两张.*纸|复写纸|纸.*粘|粘在一起|重叠.*纸/, verdict: '是', fact: 1, detail: '页面数量异常与两张贴合的纸有关。' },
      { pattern: /隐藏.*记录|违规.*记录|出入记录|管理员.*隐瞒/, verdict: '是', fact: 2, detail: '管理员想掩盖一条不该出现的记录。' },
      { pattern: /台灯|加热|胶.*变软|纸.*分开|灯.*作用/, verdict: '是', fact: 3, detail: '台灯产生的热量让隐藏手法失效。' },
      { pattern: /真的.*撕|页面.*被撕吗|谁.*撕|撕走/, verdict: '否', detail: '没有任何一页被真正撕走。' },
      { pattern: /偷走|换了.*书|伪造.*整本/, verdict: '否', detail: '登记簿没有被调包，页面也没有被偷走。' },
      { pattern: /别人.*陷害|管理员.*无辜/, verdict: '否', detail: '管理员确实参与了隐藏记录。' },
      { pattern: /鬼|魔法|灵异|自动消失/, verdict: '否', detail: '页面没有凭空消失。' },
    ],
    author: '墨迹', difficulty: 4, approval: 89, plays: 1678, createdAt: '2026-08-22',
    tags: ['档案室', '台灯', '消失'], supernatural: false, elementIds: ['archive', 'lamp', 'worker', 'missing-memory'], reactions: [245, 51, 128],
  },
]
