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
  judgeRules?: JudgeRule[]
  suggestedQuestions?: string[]
}

export type JudgeRule = {
  pattern: RegExp
  verdict: '是' | '否' | '无关'
  detail: string
  fact?: number
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

const pick = (elements: GameElement[], kind: ElementKind, fallback: string) =>
  elements.find((item) => item.kind === kind)?.label ?? fallback

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

type StoryContext = {
  object: string
  extra: string
  person: string
  place: string
  time: string
  anomaly: string
  objectPattern: string
  extraPattern: string
  anomalyPattern: string
}

type StoryCore = Pick<Story, 'title' | 'surface' | 'truth' | 'keyFacts' | 'judgeRules' | 'suggestedQuestions'>

const rule = (pattern: RegExp, verdict: JudgeRule['verdict'], detail: string, fact?: number): JudgeRule =>
  ({ pattern, verdict, detail, fact })

const unrelatedRules = (supernatural: boolean): JudgeRule[] => [
  rule(/早餐|彩票|外星|宠物|星座/, '无关', '这个方向与案件的关键因果无关。'),
  rule(/鬼|幽灵|超自然|诅咒|灵异/, supernatural ? '是' : '否', supernatural ? '异常确实来自无法用现实规律解释的力量。' : '一切都有现实层面的解释。'),
]

const archetypes: Array<(context: StoryContext, settings: StorySettings) => StoryCore> = [
  (c) => ({
    title: '早已结束的午夜命案',
    surface: `${c.time}，${c.place}发生${c.anomaly}。${c.person}被发现倒在锁住的房间里，身边的${c.object}仍是温热的，门外却放着${c.extra}。法医坚持说，众人听见响声前案件就已经结束。为什么？`,
    truth: `${c.person}早在众人听见响声前就已死亡。有人提前加热${c.object}来伪造近期活动的迹象，再用${c.extra}启动延时装置制造响声；${c.anomaly}掩盖了装置运作的短暂痕迹。锁门只是为了让人误判死亡时间，并非无人能完成作案。`,
    keyFacts: [`${c.person}的死亡时间早于现场响声`, `${c.object}被加热以伪造近期活动`, `${c.extra}触发了延时装置`, `${c.anomaly}掩盖了装置运行痕迹`],
    suggestedQuestions: ['死亡时间比大家以为的更早吗？', `${c.object}被人加热过吗？`, `${c.extra}触发了延时装置吗？`],
    judgeRules: [
      rule(/死亡时间.*更早|更早.*死亡|提前.*死亡|响声前.*死/, '是', '真正的死亡时间比目击者判断的更早。', 0),
      rule(new RegExp(`${c.objectPattern}.*(加热|温度|温热)|(加热|温度).*${c.objectPattern}`), '是', `${c.object}的温度是人为制造的线索。`, 1),
      rule(new RegExp(`${c.extraPattern}.*(延时|装置|触发)|(延时|触发).*${c.extraPattern}`), '是', `${c.extra}确实用于启动延时装置。`, 2),
      rule(new RegExp(`${c.anomalyPattern}.*(掩盖|计划|人为)|(掩盖|计划).*${c.anomalyPattern}`), '是', `${c.anomaly}帮助掩盖了作案痕迹。`, 3),
      rule(/响声时.*才死|当场.*死亡|刚刚.*死亡/, '否', '响声出现时，受害者早已死亡。'),
      rule(new RegExp(`${c.extraPattern}.*(凶器|直接杀)|(凶器|杀人).*${c.extraPattern}`), '否', `${c.extra}不是直接致死的凶器。`),
      ...unrelatedRules(false),
    ],
  }),
  (c) => ({
    title: '认错的失踪者',
    surface: `${c.time}，${c.place}的监控拍到${c.person}拿着${c.object}离开。随后${c.anomaly}，警方却在室内找到属于他的${c.extra}，家属看过录像后反而说：“出去的人不是他。”他们凭什么确定？`,
    truth: `录像里的人穿着${c.person}的外套并携带${c.object}，但其实是另一名工作人员。真正的${c.person}因${c.anomaly}被困在建筑夹层，用${c.extra}留下求救记号。家属从惯用手与步态认出伪装者，监控记录的是身份替换，不是本人离开。`,
    keyFacts: ['监控中的人冒用了失踪者身份', `${c.object}只是伪装身份的道具`, `${c.person}被困在建筑夹层`, `${c.extra}被用来留下求救记号`],
    suggestedQuestions: ['监控里的人假扮了失踪者吗？', `${c.object}是伪装用的道具吗？`, `${c.person}还在建筑里面吗？`],
    judgeRules: [
      rule(/监控.*(假扮|伪装|不是本人|冒用)|身份.*(替换|冒用)|认错人/, '是', '录像中的身份与外表显示的不一致。', 0),
      rule(new RegExp(`${c.objectPattern}.*(伪装|道具|身份)|(伪装|身份).*${c.objectPattern}`), '是', `${c.object}被用来加强伪装。`, 1),
      rule(new RegExp(`${escapeRegExp(c.person)}.*(里面|夹层|被困)|(夹层|建筑内).*${escapeRegExp(c.person)}`), '是', `${c.person}其实没有离开建筑。`, 2),
      rule(new RegExp(`${c.extraPattern}.*(求救|记号|标记)|(求救|记号).*${c.extraPattern}`), '是', `${c.extra}承担了求救标记的作用。`, 3),
      rule(/监控.*本人|本人.*离开|正常离开/, '否', '监控拍到的并非失踪者本人。'),
      rule(/家属.*撒谎|家属.*包庇/, '否', '家属是从动作习惯识破伪装的。'),
      ...unrelatedRules(false),
    ],
  }),
  (c) => ({
    title: '被当成罪证的求救信号',
    surface: `${c.time}，${c.place}连续发生${c.anomaly}，每次之后${c.object}都会出现在不同位置。${c.person}因此被警方带走，可他坚持那不是威胁，而是在救人。直到警方读懂${c.extra}上的记号，才相信他。为什么？`,
    truth: `${c.person}发现有人被困在无法直接进入的维修层。他按照约定移动${c.object}，把位置编码传给外面的救援者；${c.anomaly}是受困者敲击管线造成的反馈。${c.extra}上的记号对应建筑分区，证明每次移动都代表一个坐标，而不是犯罪暗号。`,
    keyFacts: [`${c.object}的位置变化是一组坐标编码`, `${c.anomaly}来自受困者的求救反馈`, `${c.person}在协助救援而非威胁他人`, `${c.extra}上有建筑分区记号`],
    suggestedQuestions: [`${c.object}的位置是在传递坐标吗？`, `${c.anomaly}是受困者发出的信号吗？`, `${c.person}其实是在救人吗？`],
    judgeRules: [
      rule(new RegExp(`${c.objectPattern}.*(坐标|编码|传递)|(坐标|编码).*${c.objectPattern}`), '是', `${c.object}的位置变化包含可解读的信息。`, 0),
      rule(new RegExp(`${c.anomalyPattern}.*(求救|信号|受困)|(求救|信号).*${c.anomalyPattern}`), '是', `${c.anomaly}是受困者能够发出的反馈。`, 1),
      rule(new RegExp(`${escapeRegExp(c.person)}.*(救人|救援|帮助)|(救人|救援).*${escapeRegExp(c.person)}`), '是', `${c.person}的目的确实是救人。`, 2),
      rule(new RegExp(`${c.extraPattern}.*(地图|分区|记号|图纸)|(地图|分区|记号|图纸).*${c.extraPattern}`), '是', `${c.extra}上有解码所需的分区记号。`, 3),
      rule(/威胁|勒索|犯罪暗号|准备杀人/, '否', '这些动作不是威胁或犯罪暗号。'),
      rule(/被困者.*死亡|已经死/, '否', '求救发生时，被困者仍然活着。'),
      ...unrelatedRules(false),
    ],
  }),
  (c) => ({
    title: '无人碰过的机关',
    surface: `${c.time}，空无一人的${c.place}里，${c.object}自行落下并引发${c.anomaly}。门窗的封条都完好，唯一被带出现场的是${c.person}白天用过的${c.extra}。没有遥控器，也没有人定时返回，机关为何仍会启动？`,
    truth: `${c.person}白天把吸水线藏在${c.extra}下，并让它连接${c.object}的卡扣。环境湿度逐渐上升后，线材伸长释放卡扣，${c.object}落下，再通过机械连锁造成${c.anomaly}。这是一套利用环境变化延迟触发的纯机械机关。`,
    keyFacts: [`${c.object}由机械卡扣固定`, `${c.extra}遮住了吸水触发线`, '湿度变化让触发线伸长', `${c.anomaly}是连锁机关的结果`],
    suggestedQuestions: [`${c.object}原本被卡扣固定吗？`, `${c.extra}下面藏着触发线吗？`, '机关是湿度变化触发的吗？'],
    judgeRules: [
      rule(new RegExp(`${c.objectPattern}.*(卡扣|固定|机关)|(卡扣|固定).*${c.objectPattern}`), '是', `${c.object}原本由可释放的卡扣固定。`, 0),
      rule(new RegExp(`${c.extraPattern}.*(触发线|吸水线|下面)|(触发线|吸水线).*${c.extraPattern}`), '是', `${c.extra}遮住了机关的一部分。`, 1),
      rule(/湿度|吸水|线.*伸长|环境变化.*触发/, '是', '机关依靠缓慢的湿度变化延迟启动。', 2),
      rule(new RegExp(`${c.anomalyPattern}.*(连锁|机关|结果)|(连锁|机关).*${c.anomalyPattern}`), '是', `${c.anomaly}来自机械连锁反应。`, 3),
      rule(/遥控|远程控制|有人.*回来|现场有人/, '否', '启动时没有人远程控制或返回现场。'),
      rule(/电子定时器|电脑程序/, '否', '机关不依赖电子计时设备。'),
      ...unrelatedRules(false),
    ],
  }),
  (c) => ({
    title: '主动消失的人',
    surface: `${c.time}，${c.person}在${c.place}留下${c.object}后失踪。搜查期间发生${c.anomaly}，大家发现出口旁的${c.extra}从未被拿走。三天后警方宣布：没有绑架，失踪者也从未离开。怎么回事？`,
    truth: `${c.person}发现内部人员在追踪自己，于是主动藏进停用的检修区收集证据。${c.object}被留在显眼处制造仓促离开的假象，${c.extra}仍在出口证明他没有正常离开；${c.anomaly}则是他从夹层接入设备、向警方发送证据时产生的。`,
    keyFacts: [`${c.person}是主动躲藏`, `${c.object}用于制造已经离开的假象`, `${c.extra}证明正常出口没有被使用`, `${c.anomaly}来自失踪者传送证据`],
    suggestedQuestions: [`${c.person}是主动藏起来的吗？`, `${c.object}是故意留下的假线索吗？`, `${c.anomaly}与发送证据有关吗？`],
    judgeRules: [
      rule(new RegExp(`${escapeRegExp(c.person)}.*(主动|躲藏|藏起来)|(主动|躲藏).*${escapeRegExp(c.person)}`), '是', `${c.person}的消失是自己计划的。`, 0),
      rule(new RegExp(`${c.objectPattern}.*(假线索|假象|故意留下)|(假线索|假象).*${c.objectPattern}`), '是', `${c.object}被故意留作误导。`, 1),
      rule(new RegExp(`${c.extraPattern}.*(出口|没用|没有拿)|(出口|离开).*${c.extraPattern}`), '是', `${c.extra}说明正常出口没有被使用。`, 2),
      rule(new RegExp(`${c.anomalyPattern}.*(证据|发送|传送)|(证据|发送).*${c.anomalyPattern}`), '是', `${c.anomaly}与秘密传送证据有关。`, 3),
      rule(/绑架|被人抓走|遭到杀害|已经死亡/, '否', `${c.person}没有被绑架或杀害。`),
      rule(/已经离开|逃到外面|正常出门/, '否', `${c.person}一直藏在建筑内部。`),
      ...unrelatedRules(false),
    ],
  }),
  (c) => ({
    title: '来自空房间的回答',
    surface: `${c.time}，警方隔着${c.place}的门询问${c.person}，屋内每次都在${c.anomaly}后给出准确回答。破门后里面没有人，桌上只有${c.object}和放在门边的${c.extra}。声音既不是实时通话，也不是门外的人发出的。答案从哪里来？`,
    truth: `${c.person}事先把常见问题的回答录进${c.object}，并把${c.extra}固定在门边，作为压力感应器的传导件。询问者每次敲门都会选择下一段录音，${c.anomaly}只是设备切换音轨时发出的提示。回答看似针对现场，其实问题顺序早已被内部流程固定。`,
    keyFacts: [`${c.person}提前录制了回答`, `${c.object}保存并播放录音`, `${c.extra}连接着门上的感应器`, '提问顺序早已由流程固定'],
    suggestedQuestions: ['回答是提前录制的吗？', `${c.object}在播放声音吗？`, `${c.extra}连接着感应器吗？`],
    judgeRules: [
      rule(/提前.*录|预先.*录|录制.*回答|回答.*录音/, '是', '所有回答都在事件发生前录好了。', 0),
      rule(new RegExp(`${c.objectPattern}.*(录音|播放|声音)|(录音|播放).*${c.objectPattern}`), '是', `${c.object}承担了保存或播放声音的作用。`, 1),
      rule(new RegExp(`${c.extraPattern}.*(感应器|连接|压力|传导)|(感应器|连接|传导).*${c.extraPattern}`), '是', `${c.extra}连接着触发录音的装置。`, 2),
      rule(/问题.*顺序|顺序.*固定|流程.*固定|预先.*问题/, '是', '询问的流程让预录回答显得准确。', 3),
      rule(/实时通话|藏在屋里|现场回答|门外.*回答/, '否', '声音不是任何人在现场实时说出的。'),
      rule(/人工智能|模型.*生成/, '否', '回答来自预先安排的录音，而不是即时生成。'),
      ...unrelatedRules(false),
    ],
  }),
  (c) => ({
    title: '水面上不存在的火',
    surface: `${c.time}，${c.place}发生${c.anomaly}。${c.person}透过一层水看见${c.object}正在燃烧，靠近后火焰却消失，只剩${c.extra}完好无损。消防记录确认现场温度从未升高。所有人看到的火从何而来？`,
    truth: `${c.object}没有燃烧。远处的应急灯被水面和弧形玻璃二次反射，光斑恰好落在${c.object}上；${c.anomaly}让水面周期性震动，看起来像跳动的火焰。${c.extra}被放在光路旁作为参照，靠近后观察角度改变，错觉自然消失。`,
    keyFacts: [`${c.object}从未真正燃烧`, '火焰是灯光经过水面与玻璃形成的反射', `${c.anomaly}让反射光看起来在跳动`, '靠近后观察角度改变使错觉消失'],
    suggestedQuestions: [`${c.object}其实没有燃烧吗？`, '火焰是水面反射出来的吗？', '靠近后是因为观察角度改变吗？'],
    judgeRules: [
      rule(new RegExp(`${c.objectPattern}.*(没有燃烧|没燃烧|不是真火|从未燃烧)`), '是', `${c.object}没有发生真实燃烧。`, 0),
      rule(/水面.*反射|玻璃.*反射|灯光.*反射|反射.*火焰/, '是', '所谓火焰是多次反射形成的光学影像。', 1),
      rule(new RegExp(`${c.anomalyPattern}.*(跳动|震动|反射)|(跳动|震动).*${c.anomalyPattern}`), '是', `${c.anomaly}让反射产生了运动感。`, 2),
      rule(/角度.*改变|观察角度|靠近.*消失|视角.*变化/, '是', '观察位置改变后，反射条件不再成立。', 3),
      rule(/真的.*着火|温度.*升高|发生.*燃烧/, '否', '现场没有真实火焰，温度也没有升高。'),
      rule(new RegExp(`${c.extraPattern}.*(燃烧|损坏|凶器)`), '否', `${c.extra}没有燃烧或造成伤害。`),
      ...unrelatedRules(false),
    ],
  }),
  (c, settings) => settings.supernatural ? ({
    title: '重复到第八次的午夜',
    surface: `${c.time}，${c.place}发生${c.anomaly}。${c.person}每次拿起${c.object}，房间都会恢复原状，只有${c.extra}上的划痕会多一道。第八次循环开始时，他没有再碰任何东西，循环却停止了。为什么？`,
    truth: `${c.place}被困在真实的时间循环中，触发条件并不是${c.object}，而是${c.person}每轮都会产生的“必须修正现场”的念头。${c.extra}来自循环之外，所以能保留划痕。第八次他接受${c.anomaly}无法被自己消除，放弃重演动作，也就切断了循环。`,
    keyFacts: ['房间经历了真实的时间循环', `${c.object}并非循环触发器`, `${c.extra}来自循环之外并保留变化`, '停止循环的关键是放弃修正现场'],
    suggestedQuestions: ['房间真的在时间循环吗？', `${c.object}其实不是触发器吗？`, `${c.extra}能保留之前循环的痕迹吗？`],
    judgeRules: [
      rule(/真实.*时间循环|真的.*循环|房间.*循环|时间.*重置/, '是', '这里存在真实的时间循环。', 0),
      rule(new RegExp(`${c.objectPattern}.*(不是|并非).*(触发|原因)|(触发器|原因).*不是.*${c.objectPattern}`), '是', `${c.object}只是每轮都会出现的误导。`, 1),
      rule(new RegExp(`${c.extraPattern}.*(保留|划痕|循环之外)|(保留|循环之外).*${c.extraPattern}`), '是', `${c.extra}不受房间重置影响。`, 2),
      rule(/放弃.*修正|接受.*无法|不再.*重演|念头.*触发/, '是', '循环与试图修正现场的执念有关。', 3),
      rule(new RegExp(`${c.objectPattern}.*(触发器|导致循环|开启循环)`), '否', `${c.object}不是循环真正的触发条件。`),
      rule(/梦|幻觉|表演|恶作剧/, '否', '循环是真实发生的，并非梦境或骗局。'),
      ...unrelatedRules(true),
    ],
  }) : ({
    title: '第八次完全相同的演练',
    surface: `${c.time}，${c.place}发生${c.anomaly}。${c.person}连续七次拿起${c.object}后，房间都恢复原状，只有${c.extra}上的划痕不断增加。第八次他什么也没碰，“重置”反而停止了。为什么？`,
    truth: `这里在进行事故记忆测试。工作人员每轮都会按流程复原房间，${c.extra}不在复原清单中，所以保留了划痕。${c.object}只是引导${c.person}重复错误动作的提示物；第八次他拒绝照做，证明已经识别出${c.anomaly}的诱因，测试因此结束。`,
    keyFacts: ['所谓重置是工作人员进行的事故演练', `${c.object}是诱导重复错误的提示物`, `${c.extra}不在复原清单所以保留划痕`, `${c.person}拒绝动作后通过了测试`],
    suggestedQuestions: ['房间重置其实是人工复原吗？', `${c.object}是在诱导他重复动作吗？`, `${c.extra}没有被工作人员复原吗？`],
    judgeRules: [
      rule(/人工.*复原|工作人员.*复原|事故.*演练|记忆测试/, '是', '房间的“重置”是测试人员完成的。', 0),
      rule(new RegExp(`${c.objectPattern}.*(诱导|提示|重复动作)|(诱导|提示).*${c.objectPattern}`), '是', `${c.object}用于诱导受试者重演动作。`, 1),
      rule(new RegExp(`${c.extraPattern}.*(没有复原|不在.*清单|保留.*划痕)|(复原清单|划痕).*${c.extraPattern}`), '是', `${c.extra}不属于工作人员的复原范围。`, 2),
      rule(new RegExp(`${escapeRegExp(c.person)}.*(通过|拒绝|不再)|(通过测试|拒绝动作).*${escapeRegExp(c.person)}`), '是', `${c.person}停止重演后通过了测试。`, 3),
      rule(/真实.*时间循环|超自然.*循环|魔法.*重置/, '否', '房间没有真的回到过去。'),
      rule(/第八次.*故障|设备坏了/, '否', '停止不是设备故障，而是测试目标已经达成。'),
      ...unrelatedRules(false),
    ],
  }),
]

export function buildStory(elements: GameElement[], settings: StorySettings): Story {
  const object = pick(elements, 'object', '一只停摆的钟')
  const person = pick(elements, 'person', '夜班保安')
  const place = pick(elements, 'place', '封闭的旧楼')
  const time = pick(elements, 'time', '午夜')
  const anomaly = pick(elements, 'anomaly', '突然停电')
  const extra = elements.find((item) => item.kind === 'object' && item.label !== object)?.label ?? '一把钥匙'
  const context: StoryContext = {
    object,
    extra,
    person,
    place,
    time,
    anomaly,
    objectPattern: escapeRegExp(object),
    extraPattern: escapeRegExp(extra),
    anomalyPattern: escapeRegExp(anomaly),
  }
  const index = ((settings.variant % archetypes.length) + archetypes.length) % archetypes.length
  const core = archetypes[index](context, settings)
  const brief = settings.brief.trim().slice(0, 80)
  const briefLine = brief ? ` 已知的额外条件是：“${brief}”。` : ''
  const toneLead = settings.tone === '荒诞' ? '所有人的说法都很离奇，但没有人说谎。' : settings.tone === '惊悚' ? '现场没有留下第二次解释的机会。' : ''
  const unusedLabels = elements
    .map((item) => item.label)
    .filter((label, itemIndex, labels) => labels.indexOf(label) === itemIndex)
    .filter((label) => !`${core.surface}${core.truth}`.includes(label))
  const elementLine = unusedLabels.length ? ` ${unusedLabels.join('、')}则提供了核对事件顺序与在场者说法的旁证，也是识破误导所需的线索。` : ''
  const difficultyLine = settings.difficulty >= 4
    ? ' 关键在于区分事件发生的顺序、观察者知道的信息与物品的真实用途。'
    : settings.difficulty <= 2
      ? ' 最直接的线索是物品的真实用途。'
      : ''

  return {
    ...core,
    surface: `${toneLead}${core.surface}${briefLine}`,
    truth: `${core.truth}${elementLine}${difficultyLine}`,
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
  if (story.keyFacts.length === 0) return 0
  return Math.min(story.keyFacts.length, Math.max(1, Math.ceil(story.keyFacts.length * 0.75)))
}

export function judgeQuestion(
  question: string,
  story: Story,
  supernatural: boolean,
  knownFacts: number[] = [],
): JudgeResult {
  const normalized = question.trim()
  if (!normalized) return { verdict: '无关', detail: '先提出一个可以用“是或否”回答的问题。', matchedFacts: [], solved: false }

  if (story.judgeRules?.length) {
    const matchedRules = story.judgeRules.filter((rule) => rule.pattern.test(normalized))
    const primaryRule = matchedRules[0]
    if (primaryRule?.verdict === '否') {
      return { verdict: '否', detail: primaryRule.detail, matchedFacts: [], solved: false }
    }
    if (primaryRule?.verdict === '无关') {
      return { verdict: '无关', detail: primaryRule.detail, matchedFacts: [], solved: false }
    }

    const positiveRules = matchedRules.filter((rule) => rule.verdict === '是')
    if (positiveRules.length > 0) {
      const matchedFacts = [...new Set(positiveRules.flatMap((rule) => rule.fact === undefined ? [] : [rule.fact]))]
      const coveredFacts = new Set([...knownFacts, ...matchedFacts])
      const solved = coveredFacts.size >= requiredFactCount(story)
      if (solved) {
        return { verdict: '猜对了', detail: '关键因果已经闭合。你还原出了这碗汤的核心真相。', matchedFacts, solved: true }
      }
      return { verdict: '是', detail: positiveRules[0].detail, matchedFacts, solved: false }
    }

    return {
      verdict: '无关',
      detail: '这个方向与案件的关键因果无关。',
      matchedFacts: [],
      solved: false,
    }
  }

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
