# Phase 4 变更说明

本轮改动把原来的“只读检索”升级成了“可输入背景、可直接打标签”的申请难度评估工具。页面顶部新增了默认折叠的“填写我的背景”面板，用户填写院校层次、GPA、标化、实习与科研经历后，前端会立即对 67 个项目跑一遍规则评估，并在列表 / 卡片上同步渲染 badge。

这次核心逻辑分成两层。第一层是硬门槛检查：优先读取项目官网可验证的 GPA、IELTS、TOEFL、GRE / GMAT、工作经验门槛，并输出绿 / 黄 / 红灯。第二层是冲 / 稳 / 保分档：基于院校层次、GPA 百分位、软背景与高分标化加成，结合 `selectivity_tier` 与 `is_list_based` 做经验性判断。所有经验性判断都会在 UI 中重复显示 `⚠️ 经验性参考，非官方数据，仅供决策参考`，避免被误读成官方结论。

经验性推断规则如下。`selectivity_tier` 以 QS 排名为主，按前 20 / 20-50 / 50-150 / 150+ 分为 `top`、`high`、`mid`、`accessible`，再对 LSE、CMU 这类项目品牌感知更强的学校做保守上调。`is_list_based` 对英国名校按 `true` 处理，对多数美国和新加坡项目按 `false` 处理，对 HKU 保留 `null`，表示需要人工二次判断。

已知缺失主要集中在 `min_gpa`。很多英国项目只给 `2:1`、`First Class` 等 UK honours 口径，或者美国项目只给 preferred GPA / holistic review，没有统一数值最低线，因此本轮继续保留 `null`，而不是强行映射成数字。`min_work_exp_years` 在当前 67 个项目中大多也是 `null`，因为数据集基本不是 MBA 项目。

本轮还补充了这些交付物：`index.html.bak`、`app.js.bak`、`data/programs.json.bak`、`README.md.bak`、`docs/data_sources.md.bak`，方便回滚；`README.md` 新增了 Phase 4 说明；`docs/data_sources.md` 新增了字段来源与推断规则章节。

## Phase 4.1 调优

Phase 4.1 是在原有申请难度评估框架上的一次小范围调优，主要围绕分档 baseline、难度列的 badge 语义以及“学校 / 城市”列的可读性三点做了优化。

在分档 baseline 方面，继续沿用两层结构不变，但对各档基准线做了温和下调，尤其是对 `high`、`mid` 与 `accessible` 三档：在同样的院校层次和 GPA 百分位下，中档与友好档项目的 baseline 相比 Phase 4 初版更低一些；对于英国等 list-based 项目，`is_list_based === true` 时叠加的 baseline 加分从原来的 6 / 5 调整为 5 / 4，`is_list_based === null` 时的保守加分也从 2 调整为 1。安全档的判定条件从“背景分比基准线高 8 分且硬门槛全绿”放宽到“高 6 分且硬门槛全绿”，整体更愿意把明显宽松的中低档项目归入“保底”而不是全部堆在“匹配”。

在难度列的 UI 上，上下两个 badge 的语义被重新拆分。上方 badge 统一改为“项目梯队”，优先使用 `selectivity_tier` 映射展示“顶尖 / 高门槛 / 中等 / 门槛友好”，只有在缺少 `selectivity_tier` 的项目上才回退到原来的 `difficulty` 字段。下方 badge 改名为“你的匹配”，沿用原来的四档文案“🔴 不达标 / 🔵 冲刺 / 🟡 匹配 / 🟢 保底”，并在未评估时只显示“项目梯队”与一条灰底提示“📝 填写背景查看匹配度”，点击会自动滚动回“填写我的背景”表单区域，避免用户在尚未填写背景时被两个含义不同的“冲刺”标签混淆。

在可读性方面，桌面端列表中的“学校 / 城市”列去掉了强制单行的 `whitespace-nowrap` 限制，改为允许自然换行并启用 `break-words`，移动端卡片中的学校 + 城市行也从强制截断调整为可折行显示。这样可以保证像 “Massachusetts Institute of Technology · Cambridge · United States” 这一类较长英文组合在不同视口下都能完整展示，而不会在尾部出现尴尬的 `Cambridg...` 截断，同时右侧留出更合理的留白与内边距，提升密度较高列表视图中的阅读体验。
