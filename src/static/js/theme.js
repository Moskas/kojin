(function () {
  var btn = document.getElementById('theme-toggle')
  var root = document.documentElement

  var ICONS = {
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  }

  var LABELS = { light: 'light mode', dark: 'dark mode', auto: 'auto mode' }
  var NEXT = { light: 'dark', dark: 'auto', auto: 'light' }

  function applyTheme(mode) {
    if (mode === 'auto') {
      root.removeAttribute('data-theme')
      localStorage.removeItem('theme')
    } else {
      root.setAttribute('data-theme', mode)
      localStorage.setItem('theme', mode)
    }
    btn.innerHTML = ICONS[mode]
    btn.setAttribute('aria-label', LABELS[mode])
    btn.dataset.mode = mode
  }

  btn.addEventListener('click', function () {
    applyTheme(NEXT[btn.dataset.mode || 'auto'])
  })

  var stored = localStorage.getItem('theme')
  applyTheme(stored === 'light' || stored === 'dark' ? stored : 'auto')
})()
