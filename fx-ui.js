(function () {
  const DISPLAY_MODE_STORAGE_KEY = 'study-program-finder.fx.display-mode';
  const LIVE_RATES_URL = 'https://open.er-api.com/v6/latest/USD';
  const FALLBACK_RATES_URL = './data/fx_rates_fallback.json';
  const REFERENCE_CODES = ['USD', 'GBP', 'EUR', 'HKD', 'SGD'];

  const state = {
    displayMode: loadDisplayMode(),
    meta: null,
    onChange: null,
    bound: false,
  };

  function loadDisplayMode() {
    try {
      return localStorage.getItem(DISPLAY_MODE_STORAGE_KEY) === 'rmb' ? 'rmb' : 'original';
    } catch {
      return 'original';
    }
  }

  function saveDisplayMode(mode) {
    try {
      localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore localStorage failure
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDisplayDate(dateLike) {
    if (!dateLike) return '数据缺失';
    const isoMatch = String(dateLike).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

    const parsed = new Date(dateLike);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }

    return escapeHtml(String(dateLike));
  }

  function formatOriginalAmount(amount, currency) {
    return `${currency || 'N/A'} ${Number(amount).toLocaleString('en-US')}`;
  }

  function formatCnyAmount(amount) {
    return `CNY ${Math.round(amount).toLocaleString('en-US')}`;
  }

  function formatRateValue(value) {
    if (!Number.isFinite(value)) return '—';
    if (value >= 100) return value.toFixed(2);
    if (value >= 10) return value.toFixed(3);
    return value.toFixed(4);
  }

  function normalizeMeta(payload, isFallback) {
    return {
      isFallback,
      providerLabel: payload.provider_label || 'ExchangeRate-API Open Access',
      providerUrl: payload.provider_url || payload.provider || 'https://www.exchangerate-api.com',
      documentationUrl: payload.documentation_url || payload.documentation || 'https://www.exchangerate-api.com/docs/free',
      attributionHtml: payload.attribution_html || '<a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">Rates By Exchange Rate API</a>',
      baseCode: payload.base_code || 'USD',
      lastUpdatedUtc: payload.time_last_update_utc || payload.last_updated_utc || '',
      fetchedDate: formatDisplayDate(payload.time_last_update_utc || payload.last_updated_utc || payload.fetched_date),
      nextUpdatedUtc: payload.time_next_update_utc || payload.next_updated_utc || '',
      rates: payload.rates || {},
      fallbackNote: payload.fallback_note || '',
      fetchedVia: payload.fetched_via || LIVE_RATES_URL,
    };
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  async function loadRates() {
    try {
      const payload = await fetchJson(LIVE_RATES_URL);
      if (payload.result !== 'success') {
        throw new Error(payload['error-type'] || payload.result || 'live fetch failed');
      }
      state.meta = normalizeMeta(payload, false);
      return;
    } catch (liveError) {
      const fallbackPayload = await fetchJson(FALLBACK_RATES_URL);
      state.meta = normalizeMeta(fallbackPayload, true);
      state.meta.liveError = String(liveError);
    }
  }

  function getRateToCny(currencyCode) {
    if (!currencyCode) return null;
    const code = String(currencyCode).toUpperCase();
    if (code === 'CNY' || code === 'RMB') return 1;
    const rates = state.meta?.rates;
    if (!rates || !Number.isFinite(rates.CNY) || !Number.isFinite(rates[code])) return null;
    return rates.CNY / rates[code];
  }

  function canConvert(currencyCode) {
    return Number.isFinite(getRateToCny(currencyCode));
  }

  function getTuitionDisplay(tuition) {
    if (!tuition || !Number.isFinite(Number(tuition.amount))) {
      return {
        label: '数据缺失',
        note: '',
        isConverted: false,
        canConvert: false,
        rateToCny: null,
      };
    }

    const currency = String(tuition.currency || '').toUpperCase();
    const amount = Number(tuition.amount);
    const rateToCny = getRateToCny(currency);
    const wantsRmb = state.displayMode === 'rmb';
    const useConverted = wantsRmb && Number.isFinite(rateToCny);

    if (useConverted) {
      return {
        label: formatCnyAmount(amount * rateToCny),
        note: `按 1 ${currency} ≈ CNY ${formatRateValue(rateToCny)} 折算`,
        isConverted: true,
        canConvert: true,
        rateToCny,
      };
    }

    const fallbackNote = wantsRmb && !Number.isFinite(rateToCny)
      ? '当前未拿到该币种汇率，暂显示原币种'
      : '';

    return {
      label: formatOriginalAmount(amount, currency),
      note: fallbackNote,
      isConverted: false,
      canConvert: Number.isFinite(rateToCny),
      rateToCny,
    };
  }

  function renderToggleButton(tuition, compact) {
    if (!tuition || !Number.isFinite(Number(tuition.amount))) return '';
    const currency = String(tuition.currency || '').toUpperCase();
    const hasRate = canConvert(currency);
    const showingRmb = state.displayMode === 'rmb' && hasRate;
    const nextMode = showingRmb ? 'original' : 'rmb';
    const label = showingRmb ? `切回 ${currency || '原币'}` : '切换到 ¥ RMB';
    const baseClass = compact
      ? 'inline-flex items-center rounded-lg border border-paper-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 hover:bg-paper-100'
      : 'inline-flex items-center rounded-lg border border-paper-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-paper-100';

    return `<button type="button" data-stop-row-click data-fx-toggle data-fx-next="${escapeHtml(nextMode)}" class="${baseClass}">${escapeHtml(label)}</button>`;
  }

  function renderReferenceHint(tuition, compact, context) {
    const display = getTuitionDisplay(tuition);
    const hints = [];

    if (tuition?.period) {
      hints.push(`计费口径：${tuition.period}`);
    }
    if (display.note) {
      hints.push(display.note);
    }
    if (tuition?.note) {
      hints.push(context === 'detail' ? tuition.note : '以官网费用说明为准');
    }
    if (state.meta?.isFallback) {
      hints.push(`使用回退汇率，日期 ${state.meta.fetchedDate}`);
    }

    if (!hints.length) return '';
    const cls = compact ? 'mt-1 text-[11px] text-ink-600' : 'mt-2 text-xs text-ink-600';
    return `<div class="${cls}">${escapeHtml(hints.join(' · '))}</div>`;
  }

  function renderTuitionDisplay(tuition, options = {}) {
    const context = options.context || 'table';
    const display = getTuitionDisplay(tuition);
    const compact = context !== 'detail';
    const buttonHtml = renderToggleButton(tuition, compact);
    const hintHtml = renderReferenceHint(tuition, compact, context);

    if (!tuition || !Number.isFinite(Number(tuition.amount))) {
      return `
        <div>
          <div class="text-sm font-semibold text-ink-950">数据缺失</div>
          ${buttonHtml ? `<div class="mt-2">${buttonHtml}</div>` : ''}
        </div>
      `;
    }

    if (context === 'detail') {
      return `
        <div class="rounded-xl border border-paper-200 bg-paper-50 p-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-xs font-semibold text-ink-700">学费</div>
              <div class="mt-1 text-lg font-semibold tracking-tight text-ink-950">${escapeHtml(display.label)}</div>
            </div>
            <div class="shrink-0" data-stop-row-click>${buttonHtml}</div>
          </div>
          ${hintHtml}
        </div>
      `;
    }

    if (context === 'card') {
      return `
        <div class="rounded-xl border border-paper-200 bg-paper-50 px-3 py-2">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="text-xs text-ink-600">学费</div>
              <div class="mt-1 font-semibold text-ink-950">${escapeHtml(display.label)}</div>
            </div>
            <div class="shrink-0" data-stop-row-click>${buttonHtml}</div>
          </div>
          ${hintHtml}
        </div>
      `;
    }

    return `
      <div>
        <div class="flex items-start justify-between gap-2">
          <div class="text-base font-bold text-ink-950">${escapeHtml(display.label)}</div>
          <div class="shrink-0" data-stop-row-click>${buttonHtml}</div>
        </div>
        ${hintHtml}
      </div>
    `;
  }

  function renderGlobalToggle() {
    const container = document.querySelector('#fx-global-toggle');
    if (!container) return;

    const originalActive = state.displayMode === 'original';
    const rmbActive = state.displayMode === 'rmb';
    const activeCls = 'bg-ink-950 text-white border-ink-950';
    const idleCls = 'bg-white text-ink-700 border-paper-200 hover:bg-paper-100';

    container.innerHTML = `
      <div class="inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-paper-200 bg-paper-50 p-0.5">
        <button type="button" data-fx-toggle data-fx-next="original" class="rounded-md border px-2.5 py-1 text-[11px] font-medium ${originalActive ? activeCls : idleCls}">原币种</button>
        <button type="button" data-fx-toggle data-fx-next="rmb" class="rounded-md border px-2.5 py-1 text-[11px] font-medium ${rmbActive ? activeCls : idleCls}">¥ RMB</button>
      </div>
    `;
  }

  function renderMetaBanner() {
    const container = document.querySelector('#fx-meta-banner');
    if (!container) return;

    if (!state.meta) {
      container.innerHTML = '<div class="rounded-lg border border-paper-200 bg-white px-2.5 py-1 text-[11px] text-ink-500">汇率加载中…</div>';
      return;
    }

    const header = state.meta.isFallback
      ? `当前使用回退汇率，日期 ${escapeHtml(state.meta.fetchedDate)}`
      : `当前使用实时汇率，获取日期 ${escapeHtml(state.meta.fetchedDate)}`;

    const referenceText = REFERENCE_CODES
      .map((code) => {
        const rate = getRateToCny(code);
        return Number.isFinite(rate) ? `1 ${code} ≈ CNY ${formatRateValue(rate)}` : null;
      })
      .filter(Boolean)
      .join(' · ');

    const extraLine = state.meta.isFallback && state.meta.fallbackNote
      ? `<div class="mt-2 text-xs text-amber-900">${escapeHtml(state.meta.fallbackNote)}</div>`
      : '';

    container.innerHTML = `
      <details class="fx-meta-details rounded-lg border ${state.meta.isFallback ? 'border-amber-200 bg-amber-50/80' : 'border-paper-200 bg-white'} px-2.5 py-1.5 shadow-soft">
        <summary class="fx-meta-details__summary cursor-pointer text-[11px] leading-snug text-ink-600">
          <span class="font-semibold text-ink-700">汇率</span>
          <span class="text-ink-500">${escapeHtml(state.meta.fetchedDate)}</span>
          · 切换 ¥ RMB 时按参考价折算 · <span class="text-brand-600">展开说明与各币种</span>
        </summary>
        <div class="mt-2 space-y-1.5 border-t border-paper-200 pt-2 text-[11px] leading-relaxed text-ink-600">
          <div>${header} · 来源：<a class="text-brand-600 hover:underline" href="${escapeHtml(state.meta.providerUrl)}" target="_blank" rel="noreferrer">${escapeHtml(state.meta.providerLabel)}</a> · <a class="text-brand-600 hover:underline" href="${escapeHtml(state.meta.documentationUrl)}" target="_blank" rel="noreferrer">API 说明</a></div>
          <div class="break-words">${escapeHtml(referenceText)}</div>
          <div>汇率仅供参考，请以最终缴费时实际汇率为准。</div>
          ${extraLine}
          <div class="text-ink-500">${state.meta.attributionHtml}</div>
        </div>
      </details>
    `;
  }

  function setDisplayMode(nextMode, options = {}) {
    const mode = nextMode === 'rmb' ? 'rmb' : 'original';
    state.displayMode = mode;
    saveDisplayMode(mode);
    renderGlobalToggle();
    renderMetaBanner();
    if (options.emit !== false && typeof state.onChange === 'function') {
      state.onChange(mode);
    }
  }

  function bindEvents() {
    if (state.bound) return;
    state.bound = true;

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-fx-toggle]');
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      setDisplayMode(trigger.getAttribute('data-fx-next') || 'original');
    });
  }

  async function init(options = {}) {
    state.onChange = typeof options.onChange === 'function' ? options.onChange : null;
    bindEvents();
    renderGlobalToggle();
    renderMetaBanner();
    await loadRates();
    renderGlobalToggle();
    renderMetaBanner();
    return state.meta;
  }

  window.FXUI = {
    init,
    renderTuitionDisplay,
    getDisplayMode: () => state.displayMode,
    getMeta: () => state.meta,
    setDisplayMode,
  };
})();
