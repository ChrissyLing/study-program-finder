/* global window, document, fetch, localStorage */

const $ = (selector) => document.querySelector(selector)
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector))

const REGION_LABELS = {
  UK: '英国',
  US: '美国',
  HongKong: '香港',
  Singapore: '新加坡'
}

const DIRECTION_OPTIONS = [
  { value: 'BA', label: '商业分析', keywords: ['business analytics', 'msba', 'mban', '商业分析', 'analytics and business'] },
  { value: 'Finance', label: 'Finance', keywords: ['finance', 'mfin', 'financial', '金融', 'quantitative finance'] },
  { value: 'MKT', label: 'MKT', keywords: ['marketing', 'mkt', 'market', '市场', 'brand management'] },
  { value: 'Management', label: 'Management', keywords: ['management', 'strategy', 'management science', '管理', '战略', 'mba'] },
  { value: 'Economics', label: 'Economics', keywords: ['economics', 'econ', '经济'] },
  { value: 'MIS', label: 'MIS', keywords: ['mis', 'mism', 'information systems', 'business information systems', '资讯系统', '信息系统'] },
  { value: 'CS', label: '计算机', keywords: ['computer science', 'computing', 'software engineering', 'informatics', 'cyber security', '计算机', '计算机科学', '软件工程', 'msc computer', 'ms computer', 'meng computer', 'artificial intelligence', 'machine learning', 'deep learning', 'robotics'] },
  { value: 'DataScience', label: '数据科学', keywords: ['data science', 'big data', 'statistical science', 'statistics', '数据科学', '大数据', 'analytics'] },
  { value: 'Media', label: '传媒 / 媒体', keywords: ['media', 'communication', 'communications', 'journalism', 'film', 'digital media', 'creative industries', '传媒', '传播', '新闻', '公共关系', 'public relations', 'advertising'] },
  { value: 'HCI', label: '交互 / 设计', keywords: ['human-computer', 'hci', 'interaction design', 'ux design', 'user experience', 'design informatics', '人机交互', '交互设计'] },
  { value: 'Law', label: '法律', keywords: ['law', 'legal', 'llm', 'juris', '法学', '法律', '知识产权法', 'international law', 'commercial law', 'corporate law'] },
  { value: 'Education', label: '教育', keywords: ['education', 'teaching', 'pedagogy', 'curriculum', 'tesol', 'tefl', '教育', '教育学', '师范', 'master of education', 'm.ed', 'ma education', 'ms.ed', 'med programme', 'med program'] }
]

function inferProgramTags (program) {
  const explicit = Array.isArray(program?.program?.tags) ? [...program.program.tags] : []
  const text = [
    program?.program?.name_en,
    program?.program?.name_zh,
    program?.program?.summary_zh
  ].filter(Boolean).join(' ').toLowerCase()

  const inferred = []
  DIRECTION_OPTIONS.forEach((option) => {
    if (option.keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      inferred.push(option.value)
    }
  })
  return [...new Set([...explicit, ...inferred])]
}

const TARGET_REGION_OPTIONS = [
  { value: 'UK', label: 'UK' },
  { value: 'US', label: 'US' },
  { value: 'HongKong', label: 'HK' },
  { value: 'Singapore', label: 'SG' }
]

const STORAGE_KEYS = {
  profile: 'study-program-finder.saas.profile.v1',
  profileLegacy: 'study-program-finder.phase4.assessment',
  favorites: 'study-program-finder.saas.favorites.v1',
  compare: 'study-program-finder.saas.compare.v1',
  viewMode: 'study-program-finder.saas.view-mode.v1'
}

const EXPERIENCE_DISCLAIMER = '⚠️ 经验性参考，非官方数据，仅供决策参考'
const SOFT_BACKGROUND_HELPERS = {
  basic: '基础：经历较少，默认按较弱软背景估计。',
  balanced: '均衡：有一定相关经历，默认按中档软背景估计。',
  strong: '突出：有多段强相关经历或更强科研 / 头部平台经历，默认按强软背景估计。'
}

const INSTITUTION_TIER_SCORES = {
  C9: 100,
  985: 88,
  211: 75,
  双非一本: 62,
  双非普通: 52,
  '海本(QS前100)': 88,
  '海本(QS100-300)': 75,
  '海本(QS300+)': 62,
  其他: 52
}

const UK_GPA_CLASS_SCORES = {
  'First Class': 88,
  '2:1': 78,
  '2:2': 68
}

const ELITE_SCHOOL_KEYWORDS = ['清华', '北京大学', '北大', '复旦', '上海交通', '上交', '浙江大学', '浙大', '中国科学技术大学', '中科大', '南京大学', '南大', '中国人民大学', '人大', '上海财经', '中央财经', '对外经济贸易', '香港大学', '香港中文大学', '香港科技大学']

const DEADLINE_SOON_DAYS = 45

const state = {
  programs: [],
  currentModalProgramId: null,
  currentMessageTimer: null,
  latestAssessmentResults: new Map(),
  hasEvaluated: false,
  filters: {
    q: '',
    regions: new Set(),
    tags: new Set(),
    sortKey: 'qs',
    sortDir: 'asc',
    onlyFavorites: false,
    deadlineSoon: false,
    viewMode: loadViewMode()
  },
  favorites: loadIdArray(STORAGE_KEYS.favorites),
  compareIds: loadIdArray(STORAGE_KEYS.compare),
  profileBundle: loadProfileBundle(),
  currentView: 'browse'
}

const APP_VIEWS = ['browse', 'assessment', 'ppp', 'favorites', 'compare']

function getViewFromHash () {
  const match = location.hash.match(/^#\/([a-z]+)/)
  const name = match?.[1]
  return APP_VIEWS.includes(name) ? name : 'browse'
}

function navigateTo (view) {
  if (!APP_VIEWS.includes(view)) return
  const next = view === 'browse' ? '' : `#/${view}`
  if (location.hash === next || (view === 'browse' && (location.hash === '' || location.hash === '#'))) {
    syncAppView()
    return
  }
  location.hash = next
}

function setupBrowseToolbar () {
  if ($('#view-browse-toolbar')) return
  const nav = document.querySelector('.app-nav')
  if (!nav) return

  nav.insertAdjacentHTML('afterend', `
    <section id="view-browse-toolbar" class="browse-toolbar border-b border-paper-200 bg-paper-50/95">
      <div class="mx-auto w-full max-w-[min(1720px,calc(100vw-32px))] px-4 sm:px-6 lg:px-8 py-1.5 space-y-1.5">
        <div class="flex flex-wrap items-center justify-between gap-1.5">
          <div>
            <h1 class="font-display text-base font-bold text-ink-950 sm:text-lg">浏览项目</h1>
            <p class="mt-0.5 text-xs text-ink-600">共 <span id="browse-stat-summary" class="font-semibold text-ink-900">—</span> 个项目</p>
          </div>
          <button type="button" data-nav-view="assessment" class="text-xs font-medium text-brand-600 hover:underline">背景评估 →</button>
        </div>
        <div id="browse-toolbar-slot-search"></div>
        <div id="browse-toolbar-slot-tags"></div>
        <div id="browse-toolbar-slot-region" class="flex flex-wrap items-center gap-1.5"></div>
        <div id="browse-toolbar-slot-controls" class="flex flex-col gap-1.5 rounded-lg border border-paper-200 bg-white p-2 shadow-soft sm:flex-row sm:items-center sm:justify-between"></div>
      </div>
    </section>
  `)

  const hero = document.querySelector('section.hero-bg')
  if (!hero) return

  const searchBlock = hero.querySelector('#browse-search-block')
  if (searchBlock) $('#browse-toolbar-slot-search').appendChild(searchBlock)

  const tagsRow = searchBlock?.querySelector('#hero-quick-tags')?.parentElement
  if (tagsRow) $('#browse-toolbar-slot-tags').appendChild(tagsRow)

  const regionTabs = $('#region-tabs')
  if (regionTabs) $('#browse-toolbar-slot-region').appendChild(regionTabs)

  const controls = hero.querySelector('#browse-controls-row')
  if (controls) {
    controls.classList.remove('mt-8')
    $('#browse-toolbar-slot-controls').appendChild(controls)
  }

  // 汇率说明保留在隐藏 hero 内的 #fx-meta-banner，供 FX 模块更新；浏览首屏不展示
}

function setupViewShells () {
  const main = $('main')
  const app = $('#app')
  if (!main || !app || $('#view-browse')) return

  const shells = {
    assessment: '<div class="space-y-4"><h2 class="text-base font-semibold">申请者档案与匹配评估</h2><p class="text-sm text-ink-600">填写档案后点击「保存并评估」，浏览页会显示 Reach / Match / Safety 分档。</p><div id="assessment-page-slot"></div></div>',
    ppp: '<div class="space-y-4"><h2 class="text-base font-semibold">学费性价比（PPP）</h2><p class="text-sm text-ink-600">学费换算人民币后 ÷ QS 声望分，越低越划算。全库分档为 S / A / B / C。</p><div id="ppp-page-slot"></div></div>',
    favorites: '<div class="rounded-2xl border border-paper-200 bg-white p-5 shadow-soft"><h2 class="text-base font-semibold">收藏项目</h2><p class="mt-1 text-xs text-ink-600">仅保存在当前浏览器</p><div id="favorites-page-body" class="mt-4 space-y-3"></div></div>',
    compare: '<div class="rounded-2xl border border-paper-200 bg-white p-5 shadow-soft"><div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-base font-semibold">项目对比</h2><p class="mt-1 text-xs text-ink-600">最多 4 个项目</p></div><button id="compare-clear-page" type="button" class="rounded-lg border border-paper-200 bg-white px-3 py-2 text-xs font-medium text-ink-900 hover:bg-paper-100">清空队列</button></div><div id="compare-page-body" class="mt-4"></div></div>'
  }

  Object.entries(shells).forEach(([name, html]) => {
    const shell = document.createElement('div')
    shell.id = `view-${name}`
    shell.className = 'app-view hidden space-y-6'
    shell.innerHTML = html
    main.insertBefore(shell, app)
  })

  const browse = document.createElement('div')
  browse.id = 'view-browse'
  browse.className = 'app-view space-y-6'
  app.parentNode.insertBefore(browse, app)
  browse.appendChild(app)

  const panel = $('#assessment-panel')
  const slot = $('#assessment-page-slot')
  if (panel && slot) {
    const summary = panel.querySelector('summary')
    if (summary) summary.remove()
    panel.open = true
    panel.classList.remove('overflow-hidden')
    slot.appendChild(panel)
  }

  const ppp = $('#ppp-highlight')
  if (ppp) {
    ppp.classList.remove('hidden')
    $('#ppp-page-slot')?.appendChild(ppp)
  }

  $$('#view-browse aside > .rounded-2xl').forEach((card, index) => {
    if (index >= 1) card.classList.add('browse-only-hide', 'hidden')
  })
}

function setupViewLayout () {
  setupBrowseToolbar()
  setupViewShells()
}

function syncAppView () {
  const view = getViewFromHash()
  state.currentView = view

  APP_VIEWS.forEach((name) => {
    const el = $(`#view-${name}`)
    if (el) el.classList.toggle('hidden', name !== view)
  })

  $('#view-browse-toolbar')?.classList.toggle('hidden', view !== 'browse')

  $$('[data-nav-view]').forEach((btn) => {
    const active = btn.getAttribute('data-nav-view') === view
    btn.classList.toggle('nav-tab--active', active)
    btn.setAttribute('aria-current', active ? 'page' : 'false')
  })

  if (view === 'favorites') renderFavoritesPage()
  if (view === 'compare') {
    renderComparePage()
    bindScrollShells($('#view-compare'))
  }
  if (view === 'ppp') renderPppHighlight()
  if (view === 'browse') {
    apply()
    scrollBrowseListIntoView()
  }

  window.scrollTo({ top: 0, behavior: 'auto' })
}

let browseListScrolledOnce = false

function scrollBrowseListIntoView () {
  if (browseListScrolledOnce || state.currentView !== 'browse') return
  const table = $('#table-view')
  if (!table) return
  const top = table.getBoundingClientRect().top
  if (top < window.innerHeight * 0.65) {
    browseListScrolledOnce = true
    return
  }
  browseListScrolledOnce = true
  table.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function renderFavoritesPage () {
  const container = $('#favorites-page-body')
  if (!container) return
  if (!state.favorites.length) {
    container.innerHTML = '<div class="rounded-2xl border border-dashed border-paper-200 bg-paper-50 p-6 text-sm text-ink-600">当前还没有收藏项目。可在浏览页表格或卡片中点击收藏。</div>'
    return
  }
  container.innerHTML = state.favorites.map((id) => {
    const program = getProgramById(id)
    if (!program) return ''
    return `
      <div class="rounded-2xl border border-paper-200 bg-paper-50 p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-ink-950">${escapeHtml(program.__name)}</div>
            <div class="mt-1 text-xs text-ink-600">${escapeHtml(program.__uni)} · ${escapeHtml(program.city || '城市未知')} · ${escapeHtml(program.__regionLabel)}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" data-action="open-detail" data-id="${escapeHtml(program.id)}" class="rounded-lg border border-paper-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:bg-paper-100">查看详情</button>
            <button type="button" data-action="toggle-compare" data-id="${escapeHtml(program.id)}" class="rounded-lg border border-paper-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:bg-paper-100">${escapeHtml(isCompared(program.id) ? '移出对比' : '加入对比')}</button>
            <button type="button" data-action="toggle-favorite" data-id="${escapeHtml(program.id)}" class="rounded-lg border border-paper-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:bg-paper-100">取消收藏</button>
          </div>
        </div>
      </div>
    `
  }).join('')
}

function renderComparePage () {
  const container = $('#compare-page-body')
  if (!container) return
  const modalBody = $('#compare-modal-body')
  if (!modalBody) return
  renderCompareModalBody()
  container.innerHTML = modalBody.innerHTML
}

function setupViewNavigation () {
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-nav-view]')
    if (!btn) return
    event.preventDefault()
    navigateTo(btn.getAttribute('data-nav-view'))
  })
  window.addEventListener('hashchange', syncAppView)
}

function escapeHtml (str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function isFiniteNumber (value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function toNumberOrNull (value) {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function loadJson (key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed === null || parsed === undefined ? fallback : parsed
  } catch {
    return fallback
  }
}

function saveJson (key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getDefaultProfileState () {
  return {
    schoolTier: '双非普通',
    schoolName: '',
    major: '商科',
    gpaMode: '4.0',
    gpaValue: '',
    gpaUkClass: '2:1',
    ielts: '',
    toefl: '',
    gre: '',
    gmat: '',
    softLevel: 'balanced',
    targetDirections: [],
    targetRegions: []
  }
}

function loadProfileBundle () {
  const fallback = {
    savedAt: null,
    data: getDefaultProfileState()
  }
  const stored = loadJson(STORAGE_KEYS.profile, null)
  if (stored && stored.data) {
    return {
      savedAt: stored.savedAt || null,
      data: normalizeProfileState(stored.data)
    }
  }

  const legacy = loadJson(STORAGE_KEYS.profileLegacy, null)
  if (legacy) {
    return {
      savedAt: null,
      data: normalizeProfileState(legacy)
    }
  }

  return fallback
}

function normalizeProfileState (raw) {
  const fallback = getDefaultProfileState()
  return {
    ...fallback,
    ...raw,
    softLevel: raw?.softLevel || fallback.softLevel,
    targetDirections: Array.isArray(raw?.targetDirections) ? raw.targetDirections : fallback.targetDirections,
    targetRegions: Array.isArray(raw?.targetRegions) ? raw.targetRegions : fallback.targetRegions
  }
}

function saveProfileState (nextState) {
  const bundle = {
    savedAt: new Date().toISOString(),
    data: normalizeProfileState(nextState)
  }
  state.profileBundle = bundle
  saveJson(STORAGE_KEYS.profile, bundle)
  saveJson(STORAGE_KEYS.profileLegacy, bundle.data)
  renderProfileStorageStatus()
  return bundle
}

function clearProfileState () {
  localStorage.removeItem(STORAGE_KEYS.profile)
  localStorage.removeItem(STORAGE_KEYS.profileLegacy)
  state.profileBundle = {
    savedAt: null,
    data: getDefaultProfileState()
  }
  state.latestAssessmentResults = new Map()
  state.hasEvaluated = false
  renderProfileStorageStatus()
}

function loadIdArray (key) {
  const parsed = loadJson(key, [])
  return Array.isArray(parsed) ? parsed.filter(Boolean) : []
}

function saveFavorites () {
  saveJson(STORAGE_KEYS.favorites, state.favorites)
}

function saveCompareIds () {
  saveJson(STORAGE_KEYS.compare, state.compareIds)
}

function loadViewMode () {
  return localStorage.getItem(STORAGE_KEYS.viewMode) === 'cards' ? 'cards' : 'table'
}

function saveViewMode (mode) {
  localStorage.setItem(STORAGE_KEYS.viewMode, mode)
}

function formatSavedTime (iso) {
  if (!iso) return '未保存'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '已保存'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function showAppMessage (message, tone = 'brand') {
  const el = $('#app-message')
  if (!el) return
  const toneMap = {
    brand: 'border-brand-100 bg-brand-50 text-ink-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-rose-200 bg-rose-50 text-rose-700'
  }
  el.className = `mb-4 rounded-2xl border px-4 py-3 text-sm shadow-soft ${toneMap[tone] || toneMap.brand}`
  el.textContent = message
  el.classList.remove('hidden')
  window.clearTimeout(state.currentMessageTimer)
  state.currentMessageTimer = window.setTimeout(() => el.classList.add('hidden'), 3600)
}

function parseDateMs (value) {
  if (!value) return null
  const m = String(value).match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T23:59:59`)
  return Number.isNaN(d.getTime()) ? null : d.getTime()
}

function getProgramDeadlineMs (program) {
  const rounds = Array.isArray(program?.deadline?.rounds) ? program.deadline.rounds : []
  const future = []
  const past = []
  const now = Date.now()
  rounds.forEach((round) => {
    const ms = parseDateMs(round?.end)
    if (!ms) return
    if (ms >= now) future.push(ms)
    else past.push(ms)
  })
  if (future.length) return Math.min(...future)
  if (past.length) return Math.max(...past)
  return null
}

function getDeadlineUrgency (program) {
  const text = `${program?.deadline?.cycle_label || ''} ${program?.deadline?.note || ''}`
  const isRolling = /rolling/i.test(text)
  const ms = getProgramDeadlineMs(program)
  const now = Date.now()
  if (ms && ms >= now) {
    const days = Math.ceil((ms - now) / 86400000)
    if (days <= 14) return { kind: 'soon', days }
    if (days <= DEADLINE_SOON_DAYS) return { kind: 'near', days }
    return { kind: 'far', days }
  }
  if (ms && ms < now) return { kind: 'past', days: Math.ceil((now - ms) / 86400000) }
  if (isRolling) return { kind: 'rolling' }
  return { kind: 'unknown' }
}

function normalizeProgram (program) {
  const name = program?.program?.name_zh || program?.program?.name_en || '未命名项目'
  const university = program?.university?.name_zh || program?.university?.name_en || '未命名学校'
  const region = program?.region || '—'
  const tags = inferProgramTags(program)
  const haystack = [
    name,
    program?.program?.name_en,
    university,
    program?.university?.name_en,
    program?.city,
    program?.country,
    region,
    program?.program?.summary_zh,
    ...tags
  ].filter(Boolean).join(' ').toLowerCase()

  const deadlineMs = getProgramDeadlineMs(program)
  const urgency = getDeadlineUrgency(program)

  return {
    ...program,
    __name: name,
    __uni: university,
    __regionLabel: REGION_LABELS[region] || region,
    __tags: tags,
    __haystack: haystack,
    __deadlineMs: deadlineMs,
    __urgency: urgency
  }
}

function getProgramById (id) {
  return state.programs.find((program) => program.id === id) || null
}

function makePill (text, tone = 'neutral') {
  const toneCls = {
    neutral: 'bg-paper-100 text-ink-700 border-paper-200',
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    warn: 'bg-amber-50 text-amber-900 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tierTop: 'bg-ink-900 text-paper-50 border-ink-900',
    tierHigh: 'bg-ink-700 text-paper-50 border-ink-700',
    tierMid: 'bg-paper-200 text-ink-900 border-paper-200',
    tierAccessible: 'bg-paper-100 text-ink-800 border-paper-200'
  }
  return `<span class="inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${toneCls[tone] || toneCls.neutral}">${escapeHtml(text)}</span>`
}

function normalizeDifficultyLabel (rawLabel) {
  const label = String(rawLabel || '').trim()
  if (!label) return '数据缺失'
  if (label.includes('冲刺') || label.includes('高') || label.includes('难')) return '冲刺'
  if (label.includes('匹配') || label.includes('中')) return '匹配'
  if (label.includes('保底') || label.includes('低') || label.includes('稳')) return '保底'
  return label
}

function makeDifficultyBadge (rawLabel) {
  const label = normalizeDifficultyLabel(rawLabel)
  if (label === '冲刺') return makePill('冲刺', 'danger')
  if (label === '匹配') return makePill('匹配', 'warn')
  if (label === '保底') return makePill('保底', 'success')
  return makePill(label, 'neutral')
}

function makeQsBadge (qs) {
  const rank = qs?.rank
  if (!isFiniteNumber(rank)) return makePill('QS：数据缺失')
  if (rank <= 20) return `<span class="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-ink-950 bg-gradient-to-r from-ink-950 to-ink-800 px-2.5 py-1 text-xs font-semibold text-white shadow-sm"><svg viewBox="0 0 20 20" fill="currentColor" class="h-3 w-3 text-amber-300"><path d="M10 1.5 12.59 7.36l6.41.55-4.86 4.21 1.46 6.28L10 14.9l-5.6 3.5 1.46-6.28L1 7.91l6.41-.55L10 1.5Z"/></svg>QS #${rank}</span>`
  if (rank <= 50) return `<span class="inline-flex items-center whitespace-nowrap rounded-full border border-ink-700 bg-ink-700 px-2.5 py-1 text-xs font-semibold text-paper-50">QS #${rank}</span>`
  if (rank <= 100) return `<span class="inline-flex items-center whitespace-nowrap rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">QS #${rank}</span>`
  return `<span class="inline-flex items-center whitespace-nowrap rounded-full border border-paper-200 bg-paper-100 px-2.5 py-1 text-xs font-semibold text-ink-700">QS #${rank}</span>`
}

function makeUsNewsBadge (program) {
  if (program?.region !== 'US') return `<span class="text-xs text-ink-500">—</span>`
  const rank = program?.university?.us_rank?.rank
  if (!isFiniteNumber(rank)) return makePill('US：数据缺失')
  if (rank <= 10) return `<span class="inline-flex items-center whitespace-nowrap rounded-full border border-ink-950 bg-ink-950 px-2.5 py-1 text-xs font-semibold text-white">US #${rank}</span>`
  if (rank <= 30) return `<span class="inline-flex items-center whitespace-nowrap rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">US #${rank}</span>`
  return `<span class="inline-flex items-center whitespace-nowrap rounded-full border border-paper-200 bg-paper-100 px-2.5 py-1 text-xs font-semibold text-ink-700">US #${rank}</span>`
}

function makeSelectivityTierBadge (program) {
  const toneMap = {
    top: ['项目梯队：顶尖', 'tierTop'],
    high: ['项目梯队：高门槛', 'tierHigh'],
    mid: ['项目梯队：中等', 'tierMid'],
    accessible: ['项目梯队：门槛友好', 'tierAccessible']
  }
  const mapped = toneMap[program?.selectivity_tier]
  if (mapped) return makePill(mapped[0], mapped[1])
  return makePill(`项目梯队：${normalizeDifficultyLabel(program?.difficulty_label?.label)}`)
}

function formatDuration (duration) {
  if (!duration || duration.value === null || duration.value === undefined) return '数据缺失'
  const unitMap = { months: '个月', month: '个月', year: '年', years: '年', semesters: '学期' }
  return `${duration.value}${unitMap[duration.unit] || duration.unit || ''}`
}

function formatTuitionPlain (tuition) {
  if (!tuition || !isFiniteNumber(Number(tuition.amount))) return '数据缺失'
  return `${String(tuition.currency || '').toUpperCase()} ${Number(tuition.amount).toLocaleString('en-US')}`
}

function renderTuitionDisplay (tuition, options = {}) {
  if (window.FXUI?.renderTuitionDisplay) return window.FXUI.renderTuitionDisplay(tuition, options)
  return `<div class="text-sm font-semibold text-ink-950">${escapeHtml(formatTuitionPlain(tuition))}</div>`
}

function summarizeDeadline (deadline) {
  if (window.DeadlineUI?.summarize) return window.DeadlineUI.summarize(deadline)
  return '数据缺失'
}

const FALLBACK_TO_CNY = {
  USD: 7.1,
  CNY: 1,
  GBP: 9.4,
  EUR: 7.7,
  HKD: 0.91,
  SGD: 5.3,
  AUD: 4.7,
  JPY: 0.046,
  KRW: 0.0052,
  CAD: 5.2
}

function getTuitionCny (program) {
  const amount = program?.tuition?.amount
  const currency = String(program?.tuition?.currency || '').toUpperCase()
  if (!isFiniteNumber(Number(amount)) || !currency) return null
  const amt = Number(amount)
  if (window.FXUI?.getMeta) {
    const meta = window.FXUI.getMeta()
    if (meta?.rates && Number.isFinite(meta.rates.CNY) && Number.isFinite(meta.rates[currency])) {
      return amt * (meta.rates.CNY / meta.rates[currency])
    }
  }
  const rate = FALLBACK_TO_CNY[currency]
  return rate ? amt * rate : null
}

function getValueIndex (program) {
  const rank = program?.qs?.rank
  if (!isFiniteNumber(rank)) return null
  const cny = getTuitionCny(program)
  if (!isFiniteNumber(cny) || cny <= 0) return null
  const prestige = Math.max(10, 220 - rank)
  return cny / prestige
}

function precomputePppRanks () {
  const indices = state.programs
    .map((program) => ({ id: program.id, idx: getValueIndex(program) }))
    .filter((item) => isFiniteNumber(item.idx))
    .sort((a, b) => a.idx - b.idx)

  const idToTier = new Map()
  const total = indices.length
  indices.forEach((item, position) => {
    const pct = total > 1 ? position / (total - 1) : 0
    let tier
    if (pct <= 0.2) tier = 'S'
    else if (pct <= 0.5) tier = 'A'
    else if (pct <= 0.8) tier = 'B'
    else tier = 'C'
    idToTier.set(item.id, { tier, position: position + 1, total, valueIndex: item.idx })
  })

  state.programs.forEach((program) => {
    program.__ppp = idToTier.get(program.id) || null
  })
}

const PPP_TIER_STYLES = {
  S: { label: '性价比 S · 顶尖', cls: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  A: { label: '性价比 A · 高', cls: 'border-teal-200 bg-teal-50 text-teal-700' },
  B: { label: '性价比 B · 一般', cls: 'border-paper-200 bg-paper-100 text-ink-700' },
  C: { label: '性价比 C · 偏贵', cls: 'border-rose-200 bg-rose-50 text-rose-700' }
}

function renderPppBadge (program, compact = false) {
  const ppp = program?.__ppp
  if (!ppp) return ''
  const style = PPP_TIER_STYLES[ppp.tier]
  if (!style) return ''
  const size = compact ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return `<span class="inline-flex items-center gap-1 whitespace-nowrap rounded-full border ${style.cls} ${size} font-semibold" title="基于学费 ÷ QS 启发式：排名 ${ppp.position}/${ppp.total}">${escapeHtml(style.label)}</span>`
}

function renderDeadlineBadge (program) {
  const urgency = program?.__urgency
  if (!urgency) return ''
  if (urgency.kind === 'soon') return `<span class="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-800"><span class="dot bg-orange-500"></span>${urgency.days}天内</span>`
  if (urgency.kind === 'near') return `<span class="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"><span class="dot bg-amber-500"></span>${urgency.days}天</span>`
  if (urgency.kind === 'rolling') return '<span class="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"><span class="dot bg-emerald-500"></span>Rolling</span>'
  if (urgency.kind === 'past') return '<span class="inline-flex items-center whitespace-nowrap rounded-full border border-paper-200 bg-paper-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">已过期</span>'
  return ''
}

function getEmploymentSummary (program) {
  return program?.employment_direction?.content_zh || program?.employment?.common_directions || program?.employment?.note || '数据缺失'
}

function formatLanguageRequirement (program) {
  const parts = []
  if (program?.language_requirement?.ielts?.overall) parts.push(`IELTS ${program.language_requirement.ielts.overall}`)
  if (program?.language_requirement?.toefl_ibt?.overall) parts.push(`TOEFL ${program.language_requirement.toefl_ibt.overall}`)
  if (!parts.length && program?.language_requirement?.official_note) parts.push(program.language_requirement.official_note)
  return parts.length ? parts.join(' / ') : '数据缺失'
}

function formatGpaRequirement (program) {
  const min = program?.gpa?.official_min
  if (min && isFiniteNumber(min.value) && isFiniteNumber(min.scale)) return `${min.value}/${min.scale}`
  return program?.gpa?.official_note || '数据缺失'
}

function formatGreGmat (program) {
  const parts = []
  if (program?.gre_gmat?.gre) parts.push(`GRE：${program.gre_gmat.gre}`)
  if (program?.gre_gmat?.gmat) parts.push(`GMAT：${program.gre_gmat.gmat}`)
  if (!parts.length) {
    if (program?.gre_required === true || program?.gmat_required === true) return '要求提交 GRE 或 GMAT'
    if (program?.gre_required === false && program?.gmat_required === false) return '不强制'
  }
  return parts.length ? parts.join('；') : '数据缺失'
}

function createToggleChip ({ value, label, dataset }) {
  return `
    <label class="inline-flex items-center gap-2 rounded-full border border-paper-200 bg-white px-3 py-2 text-xs text-ink-700 shadow-soft hover:bg-paper-100">
      <input type="checkbox" value="${escapeHtml(value)}" ${dataset} class="h-3.5 w-3.5" />
      <span>${escapeHtml(label)}</span>
    </label>
  `
}

function renderAssessmentTargets () {
  $('#assessment-target-directions').innerHTML = DIRECTION_OPTIONS.map((item) => createToggleChip({ value: item.value, label: item.label, dataset: 'data-assessment-direction' })).join('')
  $('#assessment-target-regions').innerHTML = TARGET_REGION_OPTIONS.map((item) => createToggleChip({ value: item.value, label: item.label, dataset: 'data-assessment-region' })).join('')
}

function getProfileFormState () {
  return {
    schoolTier: $('#assessment-school-tier').value,
    schoolName: $('#assessment-school-name').value.trim(),
    major: $('#assessment-major').value,
    gpaMode: $('#assessment-gpa-mode').value,
    gpaValue: $('#assessment-gpa-value').value,
    gpaUkClass: $('#assessment-gpa-uk-class').value,
    ielts: $('#assessment-ielts').value,
    toefl: $('#assessment-toefl').value,
    gre: $('#assessment-gre').value,
    gmat: $('#assessment-gmat').value,
    softLevel: $('#assessment-soft-level').value,
    targetDirections: $$('[data-assessment-direction]:checked').map((input) => input.value),
    targetRegions: $$('[data-assessment-region]:checked').map((input) => input.value)
  }
}

function applyProfileStateToForm (profileState) {
  const nextState = normalizeProfileState(profileState)
  $('#assessment-school-tier').value = nextState.schoolTier
  $('#assessment-school-name').value = nextState.schoolName
  $('#assessment-major').value = nextState.major
  $('#assessment-gpa-mode').value = nextState.gpaMode
  $('#assessment-gpa-value').value = nextState.gpaValue
  $('#assessment-gpa-uk-class').value = nextState.gpaUkClass
  $('#assessment-ielts').value = nextState.ielts
  $('#assessment-toefl').value = nextState.toefl
  $('#assessment-gre').value = nextState.gre
  $('#assessment-gmat').value = nextState.gmat
  $('#assessment-soft-level').value = nextState.softLevel

  $$('[data-assessment-direction]').forEach((input) => {
    input.checked = nextState.targetDirections.includes(input.value)
  })
  $$('[data-assessment-region]').forEach((input) => {
    input.checked = nextState.targetRegions.includes(input.value)
  })

  syncGpaMode()
  syncSoftLevelHelper()
}

function syncGpaMode () {
  const mode = $('#assessment-gpa-mode').value
  const valueWrap = $('#assessment-gpa-value-wrap')
  const ukWrap = $('#assessment-gpa-uk-wrap')
  const input = $('#assessment-gpa-value')
  const helper = $('#assessment-gpa-helper')
  const isUk = mode === 'uk'

  valueWrap.classList.toggle('hidden', isUk)
  ukWrap.classList.toggle('hidden', !isUk)

  if (mode === '4.0') {
    input.placeholder = '例如 3.7'
    input.step = '0.01'
    input.max = '4.0'
    helper.textContent = '当前按 4.0 制输入；硬门槛只在项目给出可量化 GPA 时做精确比较。'
  } else if (mode === '100') {
    input.placeholder = '例如 88'
    input.step = '0.1'
    input.max = '100'
    helper.textContent = '当前按百分制输入；若项目官方 GPA 是 4.0 制，会按线性近似换算，仅用于前端粗筛。'
  } else {
    helper.textContent = '当前按 UK honours 等级输入；若项目只给数值 GPA，会用经验映射辅助比较。'
  }
}

function syncSoftLevelHelper () {
  $('#assessment-soft-helper').textContent = SOFT_BACKGROUND_HELPERS[$('#assessment-soft-level').value] || SOFT_BACKGROUND_HELPERS.balanced
}

function renderProfileStorageStatus () {
  const status = state.profileBundle.savedAt
    ? `已保存档案：${formatSavedTime(state.profileBundle.savedAt)}；刷新后会自动载入，但不会自动评估。`
    : '未检测到已保存档案'
  $('#profile-storage-status').textContent = status
}

function getSoftBackgroundMapping (level) {
  const map = {
    basic: { internshipCount: '0', internshipQuality: '无', researchPaper: false, researchRA: false },
    balanced: { internshipCount: '1-2', internshipQuality: '普通公司', researchPaper: false, researchRA: false },
    strong: { internshipCount: '3-4', internshipQuality: '头部公司', researchPaper: true, researchRA: true }
  }
  return map[level] || map.balanced
}

function validateProfile (profileState) {
  if (profileState.gpaMode !== 'uk' && !profileState.gpaValue) return '请先填写 GPA。'
  if (!profileState.ielts && !profileState.toefl) return '请至少填写 IELTS 或 TOEFL 其一。'
  return ''
}

function getAssessmentProfile (profileState) {
  const mapping = getSoftBackgroundMapping(profileState.softLevel)
  return {
    ...profileState,
    ...mapping,
    gpaValue: profileState.gpaMode === 'uk' ? null : toNumberOrNull(profileState.gpaValue),
    gpaScale: profileState.gpaMode === '100' ? 100 : profileState.gpaMode === '4.0' ? 4.0 : null,
    ielts: toNumberOrNull(profileState.ielts),
    toefl: toNumberOrNull(profileState.toefl),
    gre: toNumberOrNull(profileState.gre),
    gmat: toNumberOrNull(profileState.gmat),
    targetDirections: new Set(profileState.targetDirections || []),
    targetRegions: new Set(profileState.targetRegions || [])
  }
}

function getStudentGpaPercentile (student) {
  if (student.gpaMode === 'uk') return UK_GPA_CLASS_SCORES[student.gpaUkClass] || 72
  if (student.gpaScale === 4.0 && isFiniteNumber(student.gpaValue)) return Math.max(0, Math.min(100, (student.gpaValue / 4.0) * 100))
  if (student.gpaScale === 100 && isFiniteNumber(student.gpaValue)) return Math.max(0, Math.min(100, student.gpaValue))
  return null
}

function convertGpa (value, fromScale, toScale) {
  if (!isFiniteNumber(value) || !isFiniteNumber(fromScale) || !isFiniteNumber(toScale)) return null
  if (fromScale === toScale) return value
  return value / fromScale * toScale
}

function normalizeOfficialGpaMin (program) {
  const raw = program?.gpa?.official_min
  if (!raw || typeof raw !== 'object') return null
  const scale = raw.scale === 4 ? 4.0 : raw.scale
  if (!isFiniteNumber(raw.value) || !(scale === 4.0 || scale === 100)) return null
  return { value: raw.value, scale }
}

function getStudentGpaOnScale (student, targetScale) {
  if (student.gpaMode === 'uk') {
    const percentile = getStudentGpaPercentile(student)
    return targetScale === 100 ? percentile : percentile / 25
  }
  return convertGpa(student.gpaValue, student.gpaScale, targetScale)
}

function checkHardGates (student, program) {
  const items = []
  const push = (tone, label, text) => items.push({ tone, label, text })
  const officialGpa = normalizeOfficialGpaMin(program)

  if (!officialGpa) {
    push('info', 'GPA', '官网未给出可直接量化的 GPA 门槛，需手动核对。')
  } else {
    const studentGpa = getStudentGpaOnScale(student, officialGpa.scale)
    const tolerance = officialGpa.scale === 100 ? 2 : 0.1
    const scaleText = officialGpa.scale === 100 ? '100' : '4.0'
    if (!isFiniteNumber(studentGpa)) push('warn', 'GPA', `未能读取你的 GPA，当前无法与官方最低 ${officialGpa.value}/${scaleText} 对比。`)
    else if (studentGpa >= officialGpa.value) push('success', 'GPA', `达标：约 ${studentGpa.toFixed(2)}/${scaleText} ≥ 官方最低 ${officialGpa.value}/${scaleText}`)
    else if (officialGpa.value - studentGpa <= tolerance) push('warn', 'GPA', `临界：约差 ${(officialGpa.value - studentGpa).toFixed(2)}（官方最低 ${officialGpa.value}/${scaleText}）`)
    else push('danger', 'GPA', `不达标：约差 ${(officialGpa.value - studentGpa).toFixed(2)}（官方最低 ${officialGpa.value}/${scaleText}）`)
  }

  const languageComparisons = []
  if (isFiniteNumber(program?.min_ielts)) languageComparisons.push({ label: 'IELTS', score: student.ielts, min: program.min_ielts, tolerance: 0.5 })
  if (isFiniteNumber(program?.min_toefl)) languageComparisons.push({ label: 'TOEFL', score: student.toefl, min: program.min_toefl, tolerance: 5 })

  if (!languageComparisons.length) push('info', '语言', '官网未列出可直接比对的 IELTS / TOEFL 最低分。')
  else {
    const comparable = languageComparisons.filter((item) => isFiniteNumber(item.score))
    if (!comparable.length) push('warn', '语言', '你还没填写对应语言成绩，当前只能先视为待核对。')
    else {
      const best = comparable.sort((a, b) => (b.score - b.min) - (a.score - a.min))[0]
      const diff = best.score - best.min
      if (diff >= 0) push('success', best.label, `达标：${best.score} ≥ 官方最低 ${best.min}`)
      else if (Math.abs(diff) <= best.tolerance) push('warn', best.label, `临界：差 ${Math.abs(diff).toFixed(best.label === 'IELTS' ? 1 : 0)}（官方最低 ${best.min}）`)
      else push('danger', best.label, `不达标：差 ${Math.abs(diff).toFixed(best.label === 'IELTS' ? 1 : 0)}（官方最低 ${best.min}）`)
    }
  }

  const standardizedRequired = program?.gre_required === true || program?.gmat_required === true
  const hasStandardizedScore = isFiniteNumber(student.gre) || isFiniteNumber(student.gmat)
  if (standardizedRequired && !hasStandardizedScore) push('danger', 'GRE/GMAT', '该项目要求提交 GRE 或 GMAT，你当前未填写。')
  else if (standardizedRequired) push('success', 'GRE/GMAT', `已提供：${isFiniteNumber(student.gre) ? `GRE ${student.gre}` : `GMAT ${student.gmat}`}`)
  else if (program?.gre_required === 'optional' || program?.gmat_required === 'optional') push('info', 'GRE/GMAT', `${isFiniteNumber(student.gre) ? `GRE ${student.gre}` : isFiniteNumber(student.gmat) ? `GMAT ${student.gmat}` : '未提交'}；官网口径为可选 / 建议。`)
  else if (program?.gre_required === false && program?.gmat_required === false) push('success', 'GRE/GMAT', '官网口径为不强制。')
  else push('info', 'GRE/GMAT', '官网未明确写清是否必须提交。')

  const hasDanger = items.some((item) => item.tone === 'danger')
  const hasWarnOrInfo = items.some((item) => item.tone === 'warn' || item.tone === 'info')
  return { status: hasDanger ? 'red' : hasWarnOrInfo ? 'yellow' : 'green', items }
}

function inferTargetSchool (student) {
  if (student.schoolTier === 'C9' || student.schoolTier === '985' || student.schoolTier === '海本(QS前100)') return true
  if (student.schoolName && ELITE_SCHOOL_KEYWORDS.some((keyword) => student.schoolName.includes(keyword))) return true
  return false
}

function getProgramFocus (program) {
  const text = [
    ...(Array.isArray(program?.program?.tags) ? program.program.tags : []),
    program?.program?.name_en,
    program?.program?.name_zh,
    program?.program?.summary_zh
  ].filter(Boolean).join(' ').toLowerCase()

  if (/hci|interaction design|ux design|design informatics|人机交互|交互设计|user experience/.test(text)) return 'hci'
  if (/media|communication|journalism|传播|传媒|新闻|film|creative industries|advertising|public relations/.test(text)) return 'media'
  if (/\blaw\b|legal|llm|法学|法律|juris/.test(text)) return 'law'
  if (/education|teaching|tesol|tefl|教育|教育学|pedagogy/.test(text)) return 'education'
  if (/finance|financial|mfin|金融|economics|econ|经济|analytics|business analytics|msba|mis|mism|data science|big data|statistics|数据科学|大数据|statistical/.test(text)) return 'quant'
  if (/marketing|mkt|市场/.test(text)) return 'marketing'
  return 'general'
}

function getMajorFitAdjustment (student, program) {
  const focus = getProgramFocus(program)
  const major = student.major

  if (focus === 'quant') {
    if (major === '数学统计' || major === 'CS/工科' || major === '经济学') return 4
    if (major === '商科') return 1
    if (major === '艺术类') return -2
    return -4
  }
  if (focus === 'marketing') {
    if (major === '商科' || major === '文社科' || major === '艺术类') return 2
    return 0
  }
  if (focus === 'media') {
    if (major === '艺术类' || major === '文社科') return 3
    if (major === '商科') return 2
    return 0
  }
  if (focus === 'hci') {
    if (major === '艺术类') return 4
    if (major === 'CS/工科') return 3
    if (major === '文社科') return 1
    return 0
  }
  if (focus === 'law') {
    if (major === '文社科' || major === '经济学') return 2
    if (major === '艺术类') return 0
    return -1
  }
  if (focus === 'education') {
    if (major === '文社科' || major === '艺术类' || major === '商科') return 2
    return 0
  }
  if (major === '商科' || major === '经济学') return 2
  return 0
}

function getSoftBonus (student) {
  const countBonus = { 0: 0, '1-2': 4, '3-4': 8, '5+': 10 }
  const qualityBonus = { 无: 0, 普通公司: 3, 头部公司: 6 }
  let researchBonus = 0
  if (student.researchPaper) researchBonus += 4
  if (student.researchRA) researchBonus += 2
  return Math.min(15, (countBonus[student.internshipCount] || 0) + (qualityBonus[student.internshipQuality] || 0) + researchBonus)
}

function getStandardizedBonus (student) {
  let bonus = 0
  if (isFiniteNumber(student.gre) && student.gre >= 325) bonus += 5
  if (isFiniteNumber(student.gmat) && student.gmat >= 700) bonus += 5
  return Math.min(10, bonus)
}

function computeBackgroundScore (student, program) {
  const institutionScore = INSTITUTION_TIER_SCORES[student.schoolTier] || INSTITUTION_TIER_SCORES['其他']
  const gpaPercentile = getStudentGpaPercentile(student) ?? 65
  const softBonus = getSoftBonus(student)
  const standardizedBonus = getStandardizedBonus(student)
  const majorFit = getMajorFitAdjustment(student, program)
  return {
    score: institutionScore * 0.4 + gpaPercentile * 0.45 + softBonus * 1.3 + standardizedBonus * 1.2 + majorFit,
    institutionScore,
    gpaPercentile,
    softBonus,
    standardizedBonus,
    majorFit
  }
}

function getBaseline (program, student) {
  const tierBaseline = { top: 86, high: 76, mid: 64, accessible: 54 }
  let baseline = tierBaseline[program?.selectivity_tier] ?? 64
  const reasons = []
  const targetSchool = inferTargetSchool(student)

  if (program?.selectivity_tier === 'top') reasons.push('QS / 项目知名度处于顶档')
  else if (program?.selectivity_tier === 'high') reasons.push('QS / 项目知名度处于高竞争档')
  else if (program?.selectivity_tier === 'mid') reasons.push('整体竞争强度中等偏上')
  else reasons.push('整体竞争强度相对友好')

  if (program?.is_list_based === true) {
    baseline += 5
    reasons.push('学校通常更看重本科院校名单 / 背景匹配')
    if (!targetSchool) {
      baseline += 4
      reasons.push('当前背景不属于明显 target school 档，需要更高综合分才更稳')
    }
  } else if (program?.is_list_based === null) {
    baseline += 1
    reasons.push('list-based 情况未完全明确，按保守口径估计')
  }

  return { baseline, reasons }
}

function programMatchesDirection (program, selectedDirections) {
  if (!selectedDirections || selectedDirections.size === 0) return true
  const tagList = Array.isArray(program?.__tags)
    ? program.__tags
    : (Array.isArray(program?.program?.tags) ? program.program.tags : [])
  const text = [
    ...tagList,
    program?.program?.name_en,
    program?.program?.name_zh,
    program?.program?.summary_zh,
    program?.employment_direction?.content_zh
  ].filter(Boolean).join(' ').toLowerCase()

  const selected = DIRECTION_OPTIONS.filter((item) => selectedDirections.has(item.value))
  return selected.some((option) => option.keywords.some((keyword) => text.includes(keyword.toLowerCase())))
}

function evaluateProgram (student, program) {
  const hardGate = checkHardGates(student, program)
  const background = computeBackgroundScore(student, program)
  const baseline = getBaseline(program, student)
  const regionMatched = student.targetRegions.size === 0 || student.targetRegions.has(program.region)
  const directionMatched = programMatchesDirection(program, student.targetDirections)
  const gap = background.score - baseline.baseline

  let kind = 'match'
  if (hardGate.status === 'red') kind = 'hard_fail'
  else if (gap <= -8) kind = 'reach'
  else if (hardGate.status === 'green' && gap >= 6) kind = 'safe'

  const toneMap = { hard_fail: 'danger', reach: 'brand', match: 'warn', safe: 'success' }
  const labelMap = { hard_fail: '🔴 不达标', reach: '🔵 Reach', match: '🟡 Match', safe: '🟢 Safety' }
  const targetNotes = []
  if (!regionMatched) targetNotes.push('当前不在你勾选的目标地区内')
  if (!directionMatched) targetNotes.push('当前不在你勾选的目标方向内')

  return {
    kind,
    tone: toneMap[kind],
    label: labelMap[kind],
    hardGate,
    background,
    baseline,
    targetNotes,
    shortReason: kind === 'hard_fail'
      ? `硬门槛存在未达标项；同时 ${baseline.reasons.join('，')}。`
      : `${baseline.reasons.join('，')}，你的综合背景分约 ${background.score.toFixed(1)}，基准线约 ${baseline.baseline.toFixed(1)}。`,
    experienceDisclaimer: EXPERIENCE_DISCLAIMER
  }
}

function runAssessment (programs, student) {
  const results = new Map()
  const counts = { hard_fail: 0, reach: 0, match: 0, safe: 0 }
  programs.forEach((program) => {
    const result = evaluateProgram(student, program)
    results.set(program.id, result)
    counts[result.kind] += 1
  })
  return { results, counts }
}

function renderGateItem (item) {
  const toneClass = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
    info: 'border-paper-200 bg-paper-50 text-ink-700'
  }
  return `<li class="rounded-xl border px-3 py-2 ${toneClass[item.tone] || toneClass.info}"><span class="font-semibold">${escapeHtml(item.label)}</span>：${escapeHtml(item.text)}</li>`
}

function renderUserEvaluationBadge (program) {
  if (!state.hasEvaluated) return ''
  const result = state.latestAssessmentResults.get(program.id)
  return result ? makePill(`你的匹配：${result.label}`, result.tone) : ''
}

function renderUserEvaluationDetail (program, compact = false) {
  if (!state.hasEvaluated) return ''
  const result = state.latestAssessmentResults.get(program.id)
  if (!result) return ''
  const textSize = compact ? 'text-xs' : 'text-sm'
  return `
    <details class="mt-3 rounded-xl border border-paper-200 bg-paper-50 px-3 py-2 ${textSize}">
      <summary class="cursor-pointer list-none font-medium text-ink-900">查看匹配说明</summary>
      <div class="mt-3 space-y-3">
        <div class="flex flex-wrap gap-2">${renderUserEvaluationBadge(program)}</div>
        <ul class="space-y-2 text-xs text-ink-800">${result.hardGate.items.map((item) => renderGateItem(item)).join('')}</ul>
        <div class="rounded-xl border border-paper-200 bg-white px-3 py-2 text-xs text-ink-700">
          <div class="font-semibold text-ink-900">分档理由</div>
          <p class="mt-1">${escapeHtml(result.shortReason)}</p>
          <p class="mt-1">背景分 ${escapeHtml(result.background.score.toFixed(1))} vs 基准线 ${escapeHtml(result.baseline.baseline.toFixed(1))}</p>
          ${result.targetNotes.length ? `<p class="mt-1">目标提醒：${escapeHtml(result.targetNotes.join('；'))}</p>` : ''}
        </div>
        <div class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-ink-800">${escapeHtml(result.experienceDisclaimer)}</div>
      </div>
    </details>
  `
}

function sortPrograms (programs) {
  const factor = state.filters.sortDir === 'asc' ? 1 : -1
  const getValue = (program) => {
    if (state.filters.sortKey === 'qs') return program?.qs?.rank ?? Number.POSITIVE_INFINITY
    if (state.filters.sortKey === 'usnews') return program?.region === 'US' ? (program?.university?.us_rank?.rank ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY
    if (state.filters.sortKey === 'tuition') return program?.tuition?.amount ?? Number.POSITIVE_INFINITY
    if (state.filters.sortKey === 'duration') return program?.duration?.value ?? Number.POSITIVE_INFINITY
    if (state.filters.sortKey === 'deadline') return program?.__deadlineMs ?? Number.POSITIVE_INFINITY
    if (state.filters.sortKey === 'ppp') return program?.__ppp?.valueIndex ?? Number.POSITIVE_INFINITY
    return program?.__name ?? ''
  }

  return [...programs].sort((a, b) => {
    const av = getValue(a)
    const bv = getValue(b)
    if (typeof av === 'string' || typeof bv === 'string') return String(av).localeCompare(String(bv), 'zh-Hans-CN') * factor
    return (av - bv) * factor
  })
}

function isDeadlineSoonProgram (program) {
  const urgency = program?.__urgency
  if (!urgency) return false
  return urgency.kind === 'soon' || urgency.kind === 'near' || urgency.kind === 'rolling'
}

function getFilteredPrograms () {
  let next = [...state.programs]
  if (state.filters.q.trim()) next = next.filter((program) => program.__haystack.includes(state.filters.q.trim().toLowerCase()))
  if (state.filters.regions.size) next = next.filter((program) => state.filters.regions.has(program.region))
  if (state.filters.tags.size) next = next.filter((program) => program.__tags.some((tag) => state.filters.tags.has(tag)))
  if (state.filters.onlyFavorites) next = next.filter((program) => state.favorites.includes(program.id))
  if (state.filters.deadlineSoon) next = next.filter(isDeadlineSoonProgram)
  return sortPrograms(next)
}

function isFavorite (id) {
  return state.favorites.includes(id)
}

function isCompared (id) {
  return state.compareIds.includes(id)
}

function toggleFavorite (id) {
  state.favorites = isFavorite(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id]
  saveFavorites()
  apply()
  if (state.currentModalProgramId === id && !$('#modal').classList.contains('hidden')) openModal(getProgramById(id))
}

function toggleCompare (id) {
  if (isCompared(id)) {
    state.compareIds = state.compareIds.filter((item) => item !== id)
  } else {
    if (state.compareIds.length >= 4) {
      showAppMessage('对比队列最多同时保留 4 个项目。', 'warn')
      return
    }
    state.compareIds = [...state.compareIds, id]
  }
  saveCompareIds()
  apply()
  if (state.currentModalProgramId === id && !$('#modal').classList.contains('hidden')) openModal(getProgramById(id))
  if (!$('#compare-modal').classList.contains('hidden')) renderCompareModalBody()
}

function renderActionButtons (program, compact = false) {
  const favoriteLabel = isFavorite(program.id) ? '已收藏' : '收藏'
  const compareLabel = isCompared(program.id) ? '已加入对比' : '加入对比'
  const baseCls = compact
    ? 'rounded-lg border border-paper-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 hover:bg-paper-100'
    : 'rounded-lg border border-paper-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-paper-100'
  return `
    <div class="flex flex-wrap gap-2" data-stop-row-click>
      <button type="button" data-action="toggle-favorite" data-id="${escapeHtml(program.id)}" class="${baseCls}">${escapeHtml(favoriteLabel)}</button>
      <button type="button" data-action="toggle-compare" data-id="${escapeHtml(program.id)}" class="${baseCls}">${escapeHtml(compareLabel)}</button>
    </div>
  `
}

function renderRegionChip (region, regionLabel) {
  const accent = REGION_ACCENT[region]
  if (!accent) return `<span class="pill border-paper-200 bg-paper-100 text-ink-700">${escapeHtml(regionLabel)}</span>`
  return `<span class="pill ${accent.soft}"><span class="dot ${accent.dot} mr-1"></span>${escapeHtml(regionLabel)}</span>`
}

function renderTable (programs) {
  if (!programs.length) {
    $('#table-body').innerHTML = `
      <tr><td colspan="9" class="px-6 py-16">
        <div class="mx-auto max-w-sm text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-100 text-ink-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-6 w-6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </div>
          <div class="mt-3 text-sm font-semibold text-ink-950">没有匹配的项目</div>
          <p class="mt-1 text-xs text-ink-600">试着减少标签、清空搜索词，或点击右上角「重置筛选」。</p>
        </div>
      </td></tr>
    `
    return
  }
  $('#table-body').innerHTML = programs.map((program) => `
    <tr class="table-row cursor-pointer border-t border-paper-200 align-top hover:bg-paper-50" data-open-program="${escapeHtml(program.id)}">
      <td class="sticky-first-col px-4 py-3 align-top">
        <div class="flex items-start gap-3">
          <div class="region-stripe region-${escapeHtml(program.region)}"></div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold text-ink-950">${escapeHtml(program.__name)}</div>
            <div class="mt-1 text-xs text-ink-600">${escapeHtml(program.__uni)} · ${escapeHtml(program.city || '城市未知')}</div>
            <div class="mt-2 flex flex-wrap items-center gap-1.5">${renderRegionChip(program.region, program.__regionLabel)}${program.__tags.slice(0, 4).map((tag) => makePill(tag)).join('')}</div>
            <div class="mt-3 text-xs text-ink-700 line-clamp-2">${escapeHtml(program.program?.summary_zh || '暂无项目简介')}</div>
            <div class="mt-3">${renderActionButtons(program, true)}</div>
            ${renderUserEvaluationDetail(program, true)}
          </div>
        </div>
      </td>
      <td class="px-4 py-3 align-top whitespace-nowrap">${makeQsBadge(program.qs)}</td>
      <td class="px-4 py-3 align-top whitespace-nowrap">${makeUsNewsBadge(program)}</td>
      <td class="px-4 py-3 align-top whitespace-nowrap">${renderTuitionDisplay(program.tuition, { context: 'table' })}</td>
      <td class="px-4 py-3 align-top whitespace-nowrap text-sm font-medium text-ink-900">${escapeHtml(formatDuration(program.duration))}</td>
      <td class="px-4 py-3 align-top">
        <div class="flex flex-col items-start gap-2">
          ${makeSelectivityTierBadge(program)}
          ${renderPppBadge(program, true)}
          ${program?.difficulty_label?.label ? makeDifficultyBadge(program.difficulty_label.label) : ''}
          ${renderUserEvaluationBadge(program)}
        </div>
      </td>
      <td class="px-4 py-3 align-top text-sm text-ink-700">${escapeHtml(`${program.__regionLabel} · ${program.city || '城市未知'}`)}</td>
      <td class="px-4 py-3 align-top text-sm text-ink-700 whitespace-nowrap">
        <div class="flex flex-col items-start gap-1">
          <span>${escapeHtml(summarizeDeadline(program.deadline))}</span>
          ${renderDeadlineBadge(program)}
        </div>
      </td>
      <td class="px-4 py-3 align-top text-sm text-ink-700"><div class="line-clamp-2">${escapeHtml(getEmploymentSummary(program))}</div></td>
    </tr>
  `).join('')
}

function renderCards (programs) {
  if (!programs.length) {
    $('#cards-view').innerHTML = `
      <div class="md:col-span-2 rounded-2xl border border-dashed border-paper-200 bg-white p-10 text-center shadow-soft">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-100 text-ink-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-6 w-6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        </div>
        <div class="mt-3 text-sm font-semibold text-ink-950">没有匹配的项目</div>
        <p class="mt-1 text-xs text-ink-600">试着减少标签、清空搜索词，或点击右上角「重置筛选」。</p>
      </div>
    `
    return
  }
  $('#cards-view').innerHTML = programs.map((program) => `
    <article class="program-card relative overflow-hidden rounded-2xl border border-paper-200 bg-white p-4 shadow-soft">
      <span class="absolute left-0 top-0 h-full w-1 region-${escapeHtml(program.region)}"></span>
      <div class="flex items-start justify-between gap-3 pl-2">
        <div class="min-w-0">
          <button type="button" data-action="open-detail" data-id="${escapeHtml(program.id)}" class="text-left text-sm font-semibold text-ink-950 hover:text-brand-600">${escapeHtml(program.__name)}</button>
          <div class="mt-1 text-xs text-ink-600">${escapeHtml(program.__uni)} · ${escapeHtml(program.city || '城市未知')}</div>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">${renderRegionChip(program.region, program.__regionLabel)}${renderDeadlineBadge(program)}</div>
        </div>
        <div class="shrink-0 flex flex-col items-end gap-1">
          ${makeQsBadge(program.qs)}
          ${program.region === 'US' ? makeUsNewsBadge(program) : ''}
        </div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-2 text-sm pl-2">
        <div class="rounded-xl border border-paper-200 bg-paper-50 px-3 py-2">${renderTuitionDisplay(program.tuition, { context: 'card' })}</div>
        <div class="rounded-xl border border-paper-200 bg-paper-50 px-3 py-2">
          <div class="text-xs text-ink-600">学制</div>
          <div class="mt-1 font-semibold text-ink-950">${escapeHtml(formatDuration(program.duration))}</div>
        </div>
      </div>
      <div class="mt-3 flex flex-wrap gap-2 pl-2">
        ${makeSelectivityTierBadge(program)}
        ${renderPppBadge(program)}
        ${program?.difficulty_label?.label ? makeDifficultyBadge(program.difficulty_label.label) : ''}
        ${renderUserEvaluationBadge(program)}
      </div>
      <div class="mt-3 text-xs text-ink-700 line-clamp-2 pl-2">${escapeHtml(program.program?.summary_zh || '暂无项目简介')}</div>
      <div class="mt-3 flex flex-wrap gap-1 pl-2">${program.__tags.slice(0, 4).map((tag) => makePill(tag)).join('')}</div>
      <div class="mt-3 text-xs text-ink-600 pl-2">截止：${escapeHtml(summarizeDeadline(program.deadline))}</div>
      <div class="mt-3 pl-2">${renderActionButtons(program)}</div>
      ${renderUserEvaluationDetail(program)}
    </article>
  `).join('')
}

function renderCountsBadges (counts) {
  $('#evaluation-counts-inline').innerHTML = counts
    ? [
        makePill(`不达标 ${counts.hard_fail}`, 'danger'),
        makePill(`Reach ${counts.reach}`, 'brand'),
        makePill(`Match ${counts.match}`, 'warn'),
        makePill(`Safety ${counts.safe}`, 'success')
      ].join('')
    : ''
}

function renderAssessmentBanner () {
  const banner = $('#evaluation-banner')
  const status = $('#assessment-status')
  if (!banner) return

  if (!state.hasEvaluated) {
    const hint = state.profileBundle.savedAt
      ? '已载入本地档案，尚未评估。'
      : '尚未评估。'
    if (state.currentView === 'browse') {
      banner.innerHTML = `${escapeHtml(hint)}<button type="button" data-nav-view="assessment" class="ml-2 font-medium text-brand-600 hover:underline">去填写档案并评估 →</button>`
    } else {
      banner.textContent = state.profileBundle.savedAt
        ? '已自动载入浏览器中的档案，但暂未运行评估。点击“保存并评估”后才会显示个人匹配结果。'
        : '尚未评估。填写档案后点击“保存并评估”。'
    }
    if ($('#assessment-summary')) $('#assessment-summary').textContent = banner.textContent
    if (status) status.textContent = '尚未评估'
    renderCountsBadges(null)
    return
  }

  const counts = { hard_fail: 0, reach: 0, match: 0, safe: 0 }
  state.latestAssessmentResults.forEach((result) => { counts[result.kind] += 1 })
  const text = `已评估：不达标 ${counts.hard_fail} · Reach ${counts.reach} · Match ${counts.match} · Safety ${counts.safe}`
  if (state.currentView === 'browse') {
    banner.innerHTML = `${escapeHtml(text)}。<button type="button" data-nav-view="assessment" class="ml-2 font-medium text-brand-600 hover:underline">查看 / 修改档案</button>`
  } else {
    const full = `已评估 ${state.programs.length} 个项目：不达标 ${counts.hard_fail}，Reach ${counts.reach}，Match ${counts.match}，Safety ${counts.safe}。`
    banner.innerHTML = `<p class="font-semibold text-ink-900">${escapeHtml(full)}</p><p class="mt-2 text-sm text-ink-700">${escapeHtml(EXPERIENCE_DISCLAIMER)} 学费、语言、GPA、截止等信息仍需以官网为准。</p>`
  }
  if ($('#assessment-summary')) $('#assessment-summary').innerHTML = banner.innerHTML
  if (status) status.textContent = text
  renderCountsBadges(counts)
}

const REGION_ACCENT = {
  UK: { dot: 'bg-accent-uk', soft: 'border-indigo-200 bg-indigo-50 text-indigo-700', short: 'UK' },
  US: { dot: 'bg-accent-us', soft: 'border-rose-200 bg-rose-50 text-rose-700', short: 'US' },
  HongKong: { dot: 'bg-accent-hk', soft: 'border-violet-200 bg-violet-50 text-violet-700', short: 'HK' },
  Singapore: { dot: 'bg-accent-sg', soft: 'border-teal-200 bg-teal-50 text-teal-700', short: 'SG' }
}

function renderRegionFilters () {
  $('#filter-regions').innerHTML = ['UK', 'US', 'HongKong', 'Singapore'].map((key) => {
    const accent = REGION_ACCENT[key] || { dot: 'bg-ink-700', short: key }
    const active = state.filters.regions.has(key)
    return `
      <button type="button" data-filter-region="${escapeHtml(key)}" class="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm shadow-soft transition ${active ? 'border-ink-950 bg-ink-950 text-white' : 'border-paper-200 bg-white text-ink-800 hover:bg-paper-100'}">
        <span class="inline-flex items-center gap-2"><span class="dot ${accent.dot}"></span><span class="font-medium">${escapeHtml(REGION_LABELS[key] || key)}</span></span>
        <span class="text-[11px] ${active ? 'text-white/70' : 'text-ink-500'}">${escapeHtml(accent.short)}</span>
      </button>
    `
  }).join('')
}

function renderRegionTabs () {
  const wrap = $('#region-tabs')
  if (!wrap) return
  const total = state.programs.length
  const counts = state.programs.reduce((acc, program) => {
    acc[program.region] = (acc[program.region] || 0) + 1
    return acc
  }, {})
  const tabs = [
    { key: '__all', label: '全部', count: total, accent: 'bg-ink-700' },
    ...['UK', 'US', 'HongKong', 'Singapore'].map((key) => ({
      key,
      label: REGION_LABELS[key] || key,
      count: counts[key] || 0,
      accent: REGION_ACCENT[key]?.dot || 'bg-ink-700'
    }))
  ]
  const onlySelected = state.filters.regions.size === 1
  wrap.innerHTML = tabs.map((tab) => {
    const active = tab.key === '__all' ? state.filters.regions.size === 0 : (onlySelected && state.filters.regions.has(tab.key))
    return `
      <button type="button" data-region-tab="${escapeHtml(tab.key)}" class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${active ? 'border-ink-950 bg-ink-950 text-white shadow-card' : 'border-paper-200 bg-white text-ink-800 hover:bg-paper-100'}">
        <span class="dot ${tab.accent}"></span>
        <span>${escapeHtml(tab.label)}</span>
        <span class="rounded-full ${active ? 'bg-white/15 text-white' : 'bg-paper-100 text-ink-600'} px-1.5 py-0.5 text-[10px] font-semibold">${tab.count}</span>
      </button>
    `
  }).join('')
}

function renderTagFilters () {
  const tagCount = new Map()
  state.programs.forEach((program) => program.__tags.forEach((tag) => {
    tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
  }))
  const sorted = Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  $('#filter-tags').innerHTML = sorted.map(([tag, count]) => `
    <button type="button" data-filter-tag="${escapeHtml(tag)}" class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium shadow-soft transition ${state.filters.tags.has(tag) ? 'border-ink-950 bg-ink-950 text-white' : 'border-paper-200 bg-white text-ink-800 hover:bg-paper-100'}">
      <span>${escapeHtml(tag)}</span>
      <span class="rounded-full ${state.filters.tags.has(tag) ? 'bg-white/15 text-white' : 'bg-paper-100 text-ink-600'} px-1.5 py-0.5 text-[10px] font-semibold">${count}</span>
    </button>
  `).join('')
  const countEl = $('#filter-tags-count')
  if (countEl) countEl.textContent = `共 ${sorted.length} 个标签`
}

function renderHeroQuickTags () {
  const wrap = $('#hero-quick-tags')
  if (!wrap) return
  const tagCount = new Map()
  state.programs.forEach((program) => program.__tags.forEach((tag) => {
    tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
  }))
  const top = Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
  wrap.innerHTML = top.map(([tag, count]) => {
    const active = state.filters.tags.has(tag)
    return `<button type="button" class="chip chip-compact" aria-pressed="${active ? 'true' : 'false'}" data-filter-tag="${escapeHtml(tag)}">${escapeHtml(tag)} <span class="text-[10px] opacity-70">${count}</span></button>`
  }).join('')
}

function formatCnyShort (cny) {
  if (!isFiniteNumber(cny)) return '—'
  if (cny >= 10000) return `¥${(cny / 10000).toFixed(1)}万`
  return `¥${Math.round(cny).toLocaleString()}`
}

function renderPppHighlight () {
  const section = $('#ppp-highlight')
  const list = $('#ppp-highlight-list')
  if (!section || !list) return
  const ranked = state.programs
    .filter((program) => program.__ppp)
    .sort((a, b) => a.__ppp.valueIndex - b.__ppp.valueIndex)
    .slice(0, 5)
  if (!ranked.length) {
    section.classList.add('hidden')
    return
  }
  section.classList.remove('hidden')
  list.innerHTML = ranked.map((program, index) => {
    const cny = getTuitionCny(program)
    const rank = program?.qs?.rank
    return `
      <button type="button" data-action="open-detail" data-id="${escapeHtml(program.id)}" class="text-left rounded-xl border border-emerald-200 bg-white p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-pop">
        <div class="flex items-center justify-between gap-2">
          <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">${index + 1}</span>
          ${makeQsBadge(program.qs)}
        </div>
        <div class="mt-2 text-sm font-semibold text-ink-950 line-clamp-2">${escapeHtml(program.__name)}</div>
        <div class="mt-1 text-[11px] text-ink-600 line-clamp-1">${escapeHtml(program.__uni)}</div>
        <div class="mt-2 flex items-center justify-between text-[11px] text-emerald-800">
          <span>约 ${escapeHtml(formatCnyShort(cny))}</span>
          <span>QS #${escapeHtml(rank ?? '—')}</span>
        </div>
      </button>
    `
  }).join('')
}

function renderHeroStats () {
  const total = state.programs.length
  const regionCount = new Set(state.programs.map((p) => p.region).filter(Boolean)).size
  const tagCount = new Set(state.programs.flatMap((p) => p.__tags)).size
  const now = Date.now()
  const monthFromNow = now + 31 * 86400000
  const deadlineSoon = state.programs.filter((p) => p.__deadlineMs && p.__deadlineMs >= now && p.__deadlineMs <= monthFromNow).length
  const set = (id, value) => { const el = $(id); if (el) el.textContent = value }
  set('#hero-total', total)
  set('#hero-stat-programs', total)
  set('#hero-stat-regions', regionCount)
  set('#hero-stat-tags', tagCount)
  set('#hero-stat-deadline', deadlineSoon)
}

function renderFavoritesPreview () {
  const wrap = $('#favorites-preview')
  if (!state.favorites.length) {
    wrap.innerHTML = '<div class="rounded-xl border border-dashed border-paper-200 bg-paper-50 px-3 py-3 text-xs text-ink-600">还没有收藏项目。可在表格、卡片或详情页中点击“收藏”。</div>'
    return
  }
  wrap.innerHTML = state.favorites.slice(0, 6).map((id) => {
    const program = getProgramById(id)
    if (!program) return ''
    return `
      <div class="rounded-xl border border-paper-200 bg-paper-50 px-3 py-3">
        <button type="button" data-action="open-detail" data-id="${escapeHtml(program.id)}" class="text-left text-sm font-medium text-ink-900 hover:text-brand-600">${escapeHtml(program.__name)}</button>
        <div class="mt-1 text-xs text-ink-600">${escapeHtml(program.__uni)}</div>
      </div>
    `
  }).join('')
}

function renderComparePreview () {
  const wrap = $('#compare-preview')
  if (!state.compareIds.length) {
    wrap.innerHTML = '<div class="rounded-xl border border-dashed border-paper-200 bg-paper-50 px-3 py-3 text-xs text-ink-600">对比队列为空。加入 2-4 个项目后可以在同屏表格中查看差异。</div>'
    return
  }
  wrap.innerHTML = state.compareIds.map((id, index) => {
    const program = getProgramById(id)
    if (!program) return ''
    return `
      <div class="flex items-start justify-between gap-3 rounded-xl border border-paper-200 bg-paper-50 px-3 py-3">
        <div class="min-w-0">
          <div class="text-xs text-ink-600">对比位 ${index + 1}</div>
          <button type="button" data-action="open-detail" data-id="${escapeHtml(program.id)}" class="mt-1 text-left text-sm font-medium text-ink-900 hover:text-brand-600">${escapeHtml(program.__name)}</button>
        </div>
        <button type="button" data-action="toggle-compare" data-id="${escapeHtml(program.id)}" class="rounded-lg border border-paper-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 hover:bg-paper-100">移除</button>
      </div>
    `
  }).join('')
}

function renderFavoriteModalBody () {
  const container = $('#favorites-modal-body')
  if (!state.favorites.length) {
    container.innerHTML = '<div class="rounded-2xl border border-dashed border-paper-200 bg-paper-50 p-6 text-sm text-ink-600">当前还没有收藏项目。</div>'
    return
  }
  container.innerHTML = `<div class="space-y-3">${state.favorites.map((id) => {
    const program = getProgramById(id)
    if (!program) return ''
    return `
      <div class="rounded-2xl border border-paper-200 bg-paper-50 p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-ink-950">${escapeHtml(program.__name)}</div>
            <div class="mt-1 text-xs text-ink-600">${escapeHtml(program.__uni)} · ${escapeHtml(program.city || '城市未知')} · ${escapeHtml(program.__regionLabel)}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" data-action="open-detail" data-id="${escapeHtml(program.id)}" class="rounded-lg border border-paper-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:bg-paper-100">查看详情</button>
            <button type="button" data-action="toggle-compare" data-id="${escapeHtml(program.id)}" class="rounded-lg border border-paper-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:bg-paper-100">${escapeHtml(isCompared(program.id) ? '移出对比' : '加入对比')}</button>
            <button type="button" data-action="toggle-favorite" data-id="${escapeHtml(program.id)}" class="rounded-lg border border-paper-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:bg-paper-100">取消收藏</button>
          </div>
        </div>
      </div>
    `
  }).join('')}</div>`
}

function renderCompareModalBody () {
  const container = $('#compare-modal-body')
  const programs = state.compareIds.map((id) => getProgramById(id)).filter(Boolean)
  if (!programs.length) {
    container.innerHTML = '<div class="rounded-2xl border border-dashed border-paper-200 bg-paper-50 p-6 text-sm text-ink-600">当前对比队列为空。你可以从表格、卡片或详情页中加入项目。</div>'
    return
  }

  const rows = [
    ['项目 / 院校', (program) => `${program.__name}\n${program.__uni}`],
    ['QS', (program) => program?.qs?.rank ? `#${program.qs.rank}` : '数据缺失'],
    ['US 排名（US News）', (program) => program?.region === 'US' ? (program?.university?.us_rank?.rank ? `#${program.university.us_rank.rank}` : '数据缺失') : '—'],
    ['地区 / 城市', (program) => `${program.__regionLabel} · ${program.city || '城市未知'}`],
    ['学费', (program) => formatTuitionPlain(program.tuition)],
    ['学制', (program) => formatDuration(program.duration)],
    ['项目梯队', (program) => normalizeDifficultyLabel(program?.difficulty_label?.label || program?.selectivity_tier || '数据缺失')],
    ['申请截止', (program) => summarizeDeadline(program.deadline)],
    ['就业方向', (program) => getEmploymentSummary(program)],
    ['语言要求', (program) => formatLanguageRequirement(program)],
    ['GPA / 学术门槛', (program) => formatGpaRequirement(program)],
    ['GRE / GMAT', (program) => formatGreGmat(program)],
    ['性价比 PPP', (program) => program?.__ppp ? `${program.__ppp.tier} 档（#${program.__ppp.position}/${program.__ppp.total}）` : '学费或 QS 缺失'],
    ['个人匹配', (program) => state.hasEvaluated ? (state.latestAssessmentResults.get(program.id)?.label || '未评估') : '尚未评估'],
    ['官网', (program) => program?.website?.program_url || '数据缺失']
  ]

  container.innerHTML = `
    <div class="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-ink-800">说明：对比表支持横向滚动与 sticky 首列；数据仅保存在当前浏览器。</div>
    <div class="scroll-shell mt-4 rounded-2xl border border-paper-200 bg-paper-50" data-scroll-shell>
      <div class="scroll-shell__notice"><span>左右滑动即可同屏查看最多 4 个项目的关键字段。</span></div>
      <div class="scroll-shell__fade scroll-shell__fade--left"></div>
      <div class="scroll-shell__fade scroll-shell__fade--right"></div>
      <div class="overflow-x-auto nice-scrollbar smooth-x-scroll pb-3" data-scroll-area>
        <table class="min-w-[900px] w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th class="sticky-key-col sticky-key-col--head px-4 py-3 text-left text-xs font-semibold text-ink-700">字段</th>
              ${programs.map((program) => `
                <th class="px-4 py-3 text-left align-top text-xs font-semibold text-ink-700 min-w-[240px]">
                  <div class="text-sm font-semibold text-ink-950">${escapeHtml(program.__name)}</div>
                  <div class="mt-1 text-xs font-normal text-ink-600">${escapeHtml(program.__uni)}</div>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <button type="button" data-action="open-detail" data-id="${escapeHtml(program.id)}" class="rounded-lg border border-paper-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 hover:bg-paper-100">详情</button>
                    <button type="button" data-action="toggle-compare" data-id="${escapeHtml(program.id)}" class="rounded-lg border border-paper-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 hover:bg-paper-100">移除</button>
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="bg-white">
            ${rows.map(([label, render]) => `
              <tr class="border-t border-paper-200 align-top">
                <td class="sticky-key-col px-4 py-3 font-medium text-ink-950 whitespace-nowrap">${escapeHtml(label)}</td>
                ${programs.map((program) => {
                  const content = render(program)
                  if (label === '官网' && program?.website?.program_url) {
                    return `<td class="px-4 py-3 text-ink-700"><a class="break-all text-brand-600 hover:underline" href="${escapeHtml(program.website.program_url)}" target="_blank" rel="noreferrer">打开官网</a></td>`
                  }
                  return `<td class="px-4 py-3 text-ink-700 whitespace-pre-wrap">${escapeHtml(content)}</td>`
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function buildFieldRow (label, value, url) {
  const val = value === null || value === undefined || value === '' ? '数据缺失' : value
  return `
    <div class="rounded-xl border border-paper-200 bg-paper-50 px-3 py-3">
      <div class="flex items-start justify-between gap-3">
        <div class="text-xs font-semibold text-ink-700">${escapeHtml(label)}</div>
        ${url ? `<a class="text-xs text-brand-600 hover:underline" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">来源</a>` : '<span class="text-xs text-ink-600">来源：数据缺失</span>'}
      </div>
      <div class="mt-2 text-sm text-ink-950 whitespace-pre-wrap">${escapeHtml(String(val))}</div>
    </div>
  `
}

function openModal (program) {
  if (!program) return
  state.currentModalProgramId = program.id
  $('#modal-title').textContent = program.__name
  $('#modal-sub').textContent = `${program.__uni} · ${program.city || '城市未知'} · ${program.__regionLabel}`
  $('#modal-program-url').setAttribute('href', program?.website?.program_url || '#')
  $('#modal-favorite').textContent = isFavorite(program.id) ? '已收藏' : '收藏'
  $('#modal-compare').textContent = isCompared(program.id) ? '已加入对比' : '加入对比'

  const sections = []
  sections.push(`
    <section class="rounded-2xl border border-paper-200 bg-white p-4 shadow-soft">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-xl border border-paper-200 bg-paper-50 p-3"> <div class="text-xs text-ink-600">QS</div><div class="mt-2">${makeQsBadge(program.qs)}</div> </div>
        <div class="rounded-xl border border-paper-200 bg-paper-50 p-3"> <div class="text-xs text-ink-600">学费</div><div class="mt-2">${renderTuitionDisplay(program.tuition, { context: 'detail' })}</div> </div>
        <div class="rounded-xl border border-paper-200 bg-paper-50 p-3"> <div class="text-xs text-ink-600">学制</div><div class="mt-2 text-sm font-semibold text-ink-950">${escapeHtml(formatDuration(program.duration))}</div> </div>
        <div class="rounded-xl border border-paper-200 bg-paper-50 p-3"> <div class="text-xs text-ink-600">地区 / 城市</div><div class="mt-2 text-sm font-semibold text-ink-950">${escapeHtml(`${program.__regionLabel} · ${program.city || '城市未知'}`)}</div> </div>
      </div>
      <div class="mt-4 rounded-xl border border-paper-200 bg-paper-50 p-3">
        <div class="text-xs font-semibold text-ink-700">项目简介</div>
        <div class="mt-2 text-sm text-ink-950 whitespace-pre-wrap">${escapeHtml(program.program?.summary_zh || '数据缺失')}</div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">${makeSelectivityTierBadge(program)} ${renderPppBadge(program)} ${program?.difficulty_label?.label ? makeDifficultyBadge(program.difficulty_label.label) : ''} ${renderUserEvaluationBadge(program)}</div>
      ${renderUserEvaluationDetail(program)}
      ${!state.hasEvaluated ? '<div class="mt-4 rounded-xl border border-dashed border-paper-200 bg-paper-50 px-3 py-3 text-xs text-ink-600">当前尚未运行背景评估。点击页面顶部“填写档案并评估”后，可查看该项目的个人匹配说明。</div>' : ''}
    </section>
  `)

  sections.push(`
    <section>
      <h4 class="text-sm font-semibold">申请要求</h4>
      <p class="mt-1 text-xs text-ink-600">这里展示的是项目公开要求或官方说明，实际录取通常高于最低门槛。</p>
      <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        ${buildFieldRow('语言要求', formatLanguageRequirement(program), Array.isArray(program?.language_requirement?.source_urls) ? program.language_requirement.source_urls[0] : null)}
        ${buildFieldRow('GPA / 学术门槛', formatGpaRequirement(program), program?.gpa?.source_url || null)}
        ${buildFieldRow('GRE / GMAT', formatGreGmat(program), program?.gre_gmat?.source_url || (Array.isArray(program?.gre_gmat?.source_urls) ? program.gre_gmat.source_urls[0] : null))}
        ${buildFieldRow('申请截止摘要', summarizeDeadline(program.deadline), program?.deadline?.source_url || null)}
      </div>
    </section>
  `)

  sections.push(window.DeadlineUI?.renderDeadlineSection ? window.DeadlineUI.renderDeadlineSection(program.deadline) : '')

  sections.push(`
    <section>
      <h4 class="text-sm font-semibold">就业与去向</h4>
      <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        ${buildFieldRow('就业方向', getEmploymentSummary(program), program?.employment_direction?.source_url || null)}
        ${buildFieldRow('项目官网', program?.website?.program_url || '数据缺失', program?.website?.program_url || null)}
      </div>
    </section>
  `)

  $('#modal-body').innerHTML = sections.join('')
  $('#modal').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
  bindScrollShells($('#modal'))
}

function closeOverlay (id) {
  const el = $(id)
  if (!el) return
  el.classList.add('hidden')
  if (['#modal', '#help', '#sources', '#favorites-modal', '#compare-modal'].every((selector) => $(selector).classList.contains('hidden'))) {
    document.body.style.overflow = ''
  }
}

function openSimpleOverlay (id) {
  $(id).classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function apply () {
  const programs = getFilteredPrograms()
  $('#stat-count').textContent = `${programs.length}/${state.programs.length}`
  const browseSummary = $('#browse-stat-summary')
  if (browseSummary) browseSummary.textContent = String(state.programs.length)
  $('#favorites-count-badge').textContent = String(state.favorites.length)
  $('#compare-count-badge').textContent = `${state.compareIds.length}/4`
  $('#toggle-favorite-filter').textContent = `仅看收藏：${state.filters.onlyFavorites ? '开' : '关'}`
  $('#sort-key').value = state.filters.sortKey
  $('#sort-dir').value = state.filters.sortDir

  const deadlineChip = $('#filter-deadline-soon')
  if (deadlineChip) deadlineChip.setAttribute('aria-pressed', state.filters.deadlineSoon ? 'true' : 'false')

  renderAssessmentBanner()
  renderTable(programs)
  renderCards(programs)

  const isTable = state.filters.viewMode === 'table'
  $('#table-view').classList.toggle('hidden', !isTable)
  const cardsView = $('#cards-view')
  cardsView.classList.toggle('hidden', isTable)
  cardsView.classList.toggle('grid', !isTable)
  $('#view-mode-table').className = `rounded-md border px-2.5 py-1 text-[11px] font-medium ${isTable ? 'border-ink-950 bg-ink-950 text-white' : 'border-paper-200 bg-white text-ink-700'}`
  $('#view-mode-cards').className = `rounded-md border px-2.5 py-1 text-[11px] font-medium ${!isTable ? 'border-ink-950 bg-ink-950 text-white' : 'border-paper-200 bg-white text-ink-700'}`

  if (state.currentView === 'browse') {
    renderFavoritesPreview()
    renderComparePreview()
  }
  renderProfileStorageStatus()
  renderRegionTabs()
  renderHeroQuickTags()
  if (state.currentView === 'ppp') renderPppHighlight()
  if (state.currentView === 'favorites') renderFavoritesPage()
  if (state.currentView === 'compare') renderComparePage()
  bindScrollShells(document)
  if (state.currentView === 'browse') scrollBrowseListIntoView()
}

function bindScrollShells (scope = document) {
  $$('[data-scroll-shell]', scope).forEach((shell) => {
    const area = shell.querySelector('[data-scroll-area]')
    if (!area) return
    const sync = () => {
      shell.dataset.leftShadow = area.scrollLeft > 4 ? 'true' : 'false'
      shell.dataset.rightShadow = area.scrollLeft + area.clientWidth < area.scrollWidth - 4 ? 'true' : 'false'
    }
    if (!shell.dataset.boundScroll) {
      shell.dataset.boundScroll = 'true'
      area.addEventListener('scroll', sync, { passive: true })
      window.addEventListener('resize', sync)
    }
    sync()
  })
}

async function openSources () {
  openSimpleOverlay('#sources')
  const pre = $('#sources-content')
  pre.textContent = '加载中…'
  try {
    const res = await fetch('./docs/data_sources.md', { cache: 'no-store' })
    pre.textContent = await res.text()
  } catch (error) {
    pre.textContent = `加载失败：${String(error)}`
  }
}

function runAssessmentFromCurrentForm () {
  const snapshot = getProfileFormState()
  const validationError = validateProfile(snapshot)
  if (validationError) {
    showAppMessage(validationError, 'warn')
    navigateTo('assessment')
    $('#assessment-panel').open = true
    return
  }
  saveProfileState(snapshot)
  const { results } = runAssessment(state.programs, getAssessmentProfile(snapshot))
  state.latestAssessmentResults = results
  state.hasEvaluated = true
  showAppMessage('已根据当前档案完成评估。结果仅在本地前端生成。')
  apply()
  if (state.currentModalProgramId && !$('#modal').classList.contains('hidden')) openModal(getProgramById(state.currentModalProgramId))
}

async function main () {
  const loading = $('#loading')

  if (location.protocol === 'file:') {
    loading.innerHTML = `<div class="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-soft"><div class="text-sm font-semibold text-amber-900">请用本地服务器打开</div><p class="mt-2 text-sm text-ink-700">直接双击 HTML 无法加载项目数据。请在 study-program-finder 目录运行 <code class="rounded bg-white px-1.5 py-0.5 text-xs">python3 -m http.server 8000</code>，再访问 <code class="rounded bg-white px-1.5 py-0.5 text-xs">http://127.0.0.1:8000/</code></p></div>`
    return
  }

  try {
    const res = await fetch('./data/programs.json')
    const raw = await res.text()
    if (!res.ok) {
      let message = `无法加载项目数据（HTTP ${res.status}）。`
      try {
        const errBody = JSON.parse(raw)
        if (errBody?.error === 'usage_exceeded' || /usage exceeded/i.test(errBody?.message || '')) {
          message = '线上站点托管平台（Netlify）本月流量/用量已超限，暂时返回 503，与是否填写背景信息无关。请在 Netlify 控制台查看用量，或改用本地预览。'
        }
      } catch {
        // not JSON error body
      }
      if (res.status === 503 && !message.includes('Netlify')) {
        message += ' 若使用 study-program-finder.netlify.app，多为托管额度问题；本地请在项目目录运行 python3 -m http.server 8000。'
      } else if (res.status !== 503) {
        message += ' 本地预览请在 study-program-finder 目录运行：python3 -m http.server 8000'
      }
      throw new Error(message)
    }
    const payload = JSON.parse(raw)
    state.programs = (payload.programs || []).map(normalizeProgram)
  } catch (error) {
    const hint = error?.message?.includes('Netlify')
      ? '<p class="mt-3 text-sm text-ink-600">本地预览：<code class="rounded bg-paper-100 px-1.5 py-0.5 text-xs">cd study-program-finder && python3 -m http.server 8000</code>，再打开 <code class="rounded bg-paper-100 px-1.5 py-0.5 text-xs">http://127.0.0.1:8000/</code></p>'
      : '<p class="mt-3 text-sm text-ink-600">请确认未用 file:// 直接打开；在项目目录启动本地 HTTP 服务后再访问。</p>'
    loading.innerHTML = `<div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-soft"><div class="text-sm font-semibold">加载失败</div><p class="mt-2 text-sm text-ink-700">${escapeHtml(String(error?.message || error))}</p>${hint}</div>`
    return
  }

  try {
  renderAssessmentTargets()
  applyProfileStateToForm(state.profileBundle.data)
  renderRegionFilters()
  renderTagFilters()
  renderHeroStats()
  await window.FXUI?.init({ onChange: () => { precomputePppRanks(); apply() } })
  precomputePppRanks()

  setupViewLayout()
  setupViewNavigation()
  syncAppView()

  $('#search').addEventListener('input', (event) => { state.filters.q = event.target.value || ''; apply() })
  $('#sort-key').addEventListener('change', (event) => { state.filters.sortKey = event.target.value; apply() })
  $('#sort-dir').addEventListener('change', (event) => { state.filters.sortDir = event.target.value; apply() })
  $('#toggle-favorite-filter').addEventListener('click', () => { state.filters.onlyFavorites = !state.filters.onlyFavorites; apply() })
  $('#btn-reset').addEventListener('click', () => {
    state.filters.q = ''
    state.filters.regions = new Set()
    state.filters.tags = new Set()
    state.filters.sortKey = 'qs'
    state.filters.sortDir = 'asc'
    state.filters.onlyFavorites = false
    state.filters.deadlineSoon = false
    $('#search').value = ''
    renderRegionFilters()
    renderTagFilters()
    apply()
  })

  $('#filter-deadline-soon')?.addEventListener('click', () => {
    state.filters.deadlineSoon = !state.filters.deadlineSoon
    apply()
  })

  const scrollTopBtn = $('#scroll-top')
  const updateScrollTop = () => {
    if (!scrollTopBtn) return
    scrollTopBtn.classList.toggle('is-visible', window.scrollY > 480)
  }
  window.addEventListener('scroll', updateScrollTop, { passive: true })
  scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
  updateScrollTop()

  $('#footer-help')?.addEventListener('click', () => openSimpleOverlay('#help'))
  $('#footer-sources')?.addEventListener('click', openSources)

  $('#ppp-sort-shortcut')?.addEventListener('click', () => {
    state.filters.sortKey = 'ppp'
    state.filters.sortDir = 'asc'
    navigateTo('browse')
    apply()
    $('#table-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })

  $('#view-mode-table')?.addEventListener('click', () => { state.filters.viewMode = 'table'; saveViewMode('table'); apply() })
  $('#view-mode-cards')?.addEventListener('click', () => { state.filters.viewMode = 'cards'; saveViewMode('cards'); apply() })
  $('#assessment-gpa-mode')?.addEventListener('change', syncGpaMode)
  $('#assessment-soft-level')?.addEventListener('change', syncSoftLevelHelper)

  $('#profile-save').addEventListener('click', () => {
    saveProfileState(getProfileFormState())
    showAppMessage('档案已保存到当前浏览器。')
  })
  $('#profile-save-side').addEventListener('click', () => $('#profile-save').click())
  $('#assessment-run').addEventListener('click', runAssessmentFromCurrentForm)
  $('#profile-clear').addEventListener('click', () => {
    clearProfileState()
    applyProfileStateToForm(getDefaultProfileState())
    showAppMessage('已清空本地档案与当前评估结果。', 'warn')
    apply()
  })
  $('#profile-clear-side').addEventListener('click', () => $('#profile-clear').click())
  $('#compare-clear')?.addEventListener('click', () => {
    state.compareIds = []
    saveCompareIds()
    apply()
    if (!$('#compare-modal')?.classList.contains('hidden')) renderCompareModalBody()
    if (state.currentView === 'compare') renderComparePage()
  })
  $('#compare-clear-page')?.addEventListener('click', () => $('#compare-clear')?.click())

  $('#btn-open-favorites-side')?.addEventListener('click', () => navigateTo('favorites'))
  $('#btn-open-compare-side')?.addEventListener('click', () => navigateTo('compare'))
  $('#btn-help').addEventListener('click', () => openSimpleOverlay('#help'))
  $('#help-close').addEventListener('click', () => closeOverlay('#help'))
  $('#btn-open-sources').addEventListener('click', openSources)
  $('#sources-close').addEventListener('click', () => closeOverlay('#sources'))

  $('#favorites-close')?.addEventListener('click', () => closeOverlay('#favorites-modal'))
  $('#compare-close')?.addEventListener('click', () => closeOverlay('#compare-modal'))
  $('#modal-close').addEventListener('click', () => closeOverlay('#modal'))
  $('#modal-favorite').addEventListener('click', () => state.currentModalProgramId && toggleFavorite(state.currentModalProgramId))
  $('#modal-compare').addEventListener('click', () => state.currentModalProgramId && toggleCompare(state.currentModalProgramId))

  document.addEventListener('click', (event) => {
    const regionTab = event.target.closest('[data-region-tab]')
    if (regionTab) {
      const key = regionTab.getAttribute('data-region-tab')
      if (key === '__all') {
        state.filters.regions = new Set()
      } else {
        const onlySelected = state.filters.regions.size === 1 && state.filters.regions.has(key)
        state.filters.regions = onlySelected ? new Set() : new Set([key])
      }
      renderRegionFilters()
      apply()
      return
    }

    const regionButton = event.target.closest('[data-filter-region]')
    if (regionButton) {
      const key = regionButton.getAttribute('data-filter-region')
      if (state.filters.regions.has(key)) state.filters.regions.delete(key)
      else state.filters.regions.add(key)
      renderRegionFilters()
      apply()
      return
    }

    const tagButton = event.target.closest('[data-filter-tag]')
    if (tagButton) {
      const key = tagButton.getAttribute('data-filter-tag')
      if (state.filters.tags.has(key)) state.filters.tags.delete(key)
      else state.filters.tags.add(key)
      renderTagFilters()
      apply()
      return
    }

    const actionButton = event.target.closest('[data-action]')
    if (actionButton) {
      const id = actionButton.getAttribute('data-id')
      const action = actionButton.getAttribute('data-action')
      event.preventDefault()
      event.stopPropagation()
      if (action === 'toggle-favorite') toggleFavorite(id)
      if (action === 'toggle-compare') toggleCompare(id)
      if (action === 'open-detail') openModal(getProgramById(id))
      if (action === 'open-assessment') navigateTo('assessment')
      if (state.currentView === 'favorites') renderFavoritesPage()
      if (state.currentView === 'compare') renderComparePage()
      if (!$('#favorites-modal')?.classList.contains('hidden')) renderFavoriteModalBody()
      return
    }

    const rowTrigger = event.target.closest('[data-open-program]')
    if (rowTrigger && !event.target.closest('[data-stop-row-click]')) {
      openModal(getProgramById(rowTrigger.getAttribute('data-open-program')))
    }
  })

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    closeOverlay('#modal')
    closeOverlay('#help')
    closeOverlay('#sources')
    closeOverlay('#favorites-modal')
    closeOverlay('#compare-modal')
  })

  } catch (initError) {
    console.error(initError)
    showAppMessage(`界面初始化出错：${initError.message}`, 'warn')
  } finally {
    revealBrowseApp()
    apply()
  }
}

function revealBrowseApp () {
  $('#loading')?.classList.add('hidden')
  $('#view-browse')?.classList.remove('hidden')
  $('#app')?.classList.remove('hidden')
}

main()
