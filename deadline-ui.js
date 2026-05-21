/* global window */

(function () {
  function escapeHtml (str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  function formatDate (dateString) {
    if (!dateString) return '未公开'
    const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return escapeHtml(String(dateString))
    return `${match[1]}-${match[2]}-${match[3]}`
  }

  function uniqUrls (deadline) {
    const seen = new Set()
    const urls = []
    const candidates = []
    if (deadline?.source_url) candidates.push(deadline.source_url)
    if (Array.isArray(deadline?.source_urls)) candidates.push(...deadline.source_urls)

    candidates.forEach((url) => {
      if (!url || typeof url !== 'string') return
      const trimmed = url.trim()
      if (!trimmed || seen.has(trimmed)) return
      seen.add(trimmed)
      urls.push(trimmed)
    })

    return urls
  }

  function inferRounds (deadline) {
    if (Array.isArray(deadline?.rounds) && deadline.rounds.length) {
      return deadline.rounds
    }
    if (/rolling/i.test(deadline?.cycle_label || '') || /rolling/i.test(deadline?.note || '')) {
      return [{
        name: 'Rolling Admissions',
        start: null,
        end: null,
        note: '官网未公布固定截止，通常招满即止。'
      }]
    }
    return []
  }

  function summarize (deadline) {
    if (!deadline) return '数据缺失'
    const rounds = inferRounds(deadline)
    const ends = rounds.map((item) => item && item.end).filter(Boolean).sort()
    let summary = '数据缺失'

    if (ends.length) {
      summary = ends[ends.length - 1]
    } else if (/rolling/i.test(deadline?.cycle_label || '') || /rolling/i.test(deadline?.note || '')) {
      summary = 'Rolling / 招满即止'
    }

    if (deadline?.is_fallback && summary !== '数据缺失') {
      return `参考 ${summary}`
    }
    return summary
  }

  function renderBadge (text, tone) {
    const toneMap = {
      neutral: 'border-paper-200 bg-paper-100 text-ink-700',
      warn: 'border-amber-200 bg-amber-50 text-amber-900',
      brand: 'border-brand-100 bg-brand-50 text-brand-600'
    }
    const cls = toneMap[tone] || toneMap.neutral
    return `<span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}">${escapeHtml(text)}</span>`
  }

  function renderSourceLinks (deadline) {
    const urls = uniqUrls(deadline)
    if (!urls.length) {
      return '<div class="text-xs text-ink-600">官方来源链接：数据缺失</div>'
    }

    return `
      <div class="space-y-1">
        ${urls.map((url, index) => `
          <div class="text-xs">
            <a class="break-all text-brand-600 hover:underline" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">官方来源 ${index + 1}</a>
          </div>
        `).join('')}
      </div>
    `
  }

  function renderRoundsTable (rounds, primarySource) {
    if (!rounds.length) {
      return `
        <div class="mt-3 rounded-xl border border-paper-200 bg-paper-50 px-3 py-3 text-sm text-ink-950">
          官方暂未公开可核对的轮次时间；请直接查看招生官网。
        </div>
      `
    }

    return `
      <div class="scroll-shell mt-3 rounded-2xl border border-paper-200 bg-paper-50" data-scroll-shell>
        <div class="scroll-shell__notice">
          <span>轮次表支持横向滚动，首列固定方便在移动端核对。</span>
        </div>
        <div class="scroll-shell__fade scroll-shell__fade--left"></div>
        <div class="scroll-shell__fade scroll-shell__fade--right"></div>
        <div class="overflow-x-auto nice-scrollbar smooth-x-scroll pb-3" data-scroll-area>
          <table class="min-w-[760px] w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-ink-700">
                <th class="sticky-key-col sticky-key-col--head px-4 py-3 whitespace-nowrap">轮次</th>
                <th class="px-4 py-3 whitespace-nowrap">开放时间</th>
                <th class="px-4 py-3 whitespace-nowrap">截止时间</th>
                <th class="px-4 py-3 whitespace-nowrap">备注</th>
                <th class="px-4 py-3 whitespace-nowrap">来源</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-paper-200 bg-white">
              ${rounds.map((round) => `
                <tr class="border-t border-paper-200 align-top">
                  <td class="sticky-key-col px-4 py-3 font-medium text-ink-950">${escapeHtml(round.name || '轮次')}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-ink-700">${formatDate(round.start)}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-ink-700">${formatDate(round.end)}</td>
                  <td class="px-4 py-3 text-ink-700">${escapeHtml(round.note || '—')}</td>
                  <td class="px-4 py-3 text-xs text-ink-600">
                    ${primarySource ? `<a class="text-brand-600 hover:underline" href="${escapeHtml(primarySource)}" target="_blank" rel="noreferrer">查看官网</a>` : '数据缺失'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  function renderDeadlineSection (deadline) {
    const rounds = inferRounds(deadline)
    const primarySource = deadline?.source_url || uniqUrls(deadline)[0] || null
    const badges = []

    if (deadline?.cycle_label && deadline.cycle_label !== 'unknown') {
      badges.push(renderBadge(`申请周期：${deadline.cycle_label}`, 'brand'))
    }
    if (deadline?.is_fallback) {
      badges.push(renderBadge('参考上一公开周期', 'warn'))
    } else {
      badges.push(renderBadge('以官网为准', 'warn'))
    }

    const fallbackHtml = deadline?.fallback_note
      ? `<div class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">${escapeHtml(deadline.fallback_note)}</div>`
      : ''

    const noteHtml = deadline?.note
      ? `<div class="mt-3 rounded-xl border border-paper-200 bg-paper-50 px-3 py-3 text-xs text-ink-700">${escapeHtml(deadline.note)}</div>`
      : ''

    const verifiedText = deadline?.last_verified ? `轮次核对日期：${escapeHtml(deadline.last_verified)}` : '轮次核对日期：数据缺失'

    return `
      <section class="space-y-3">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 class="text-sm font-semibold">申请轮次 / Deadline</h4>
            <p class="mt-1 text-xs text-ink-600">开放时间、截止时间均以学校官方招生页为准；申请前请再次复核。</p>
          </div>
          <div class="flex flex-wrap gap-2">${badges.join('')}</div>
        </div>

        ${renderRoundsTable(rounds, primarySource)}
        ${fallbackHtml}
        ${noteHtml}

        <div class="rounded-xl border border-paper-200 bg-paper-50 p-3">
          <div class="text-xs font-semibold text-ink-700">复核提醒</div>
          <div class="mt-1 text-xs text-ink-600">以官网为准，申请前复核。若官网尚未公布下一申请周期，本页会明确标注为“参考上一公开周期数据”。</div>
          <div class="mt-2 text-xs text-ink-600">${verifiedText}</div>
          <div class="mt-3">${renderSourceLinks(deadline)}</div>
        </div>
      </section>
    `
  }

  window.DeadlineUI = {
    summarize,
    renderDeadlineSection
  }
})()
