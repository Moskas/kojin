;(function () {
  const nav = document.querySelector('.toc-sidebar')
  const prose = document.querySelector('.prose')
  if (!nav || !prose) return

  const list = nav.querySelector('.toc-list')
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'))
  const entries = links
    .map(function (a) {
      const heading = document.getElementById(decodeURIComponent(a.hash.slice(1)))
      return heading ? { link: a, item: a.closest('li'), heading: heading } : null
    })
    .filter(Boolean)
  if (!entries.length) return

  let visibleKey = ''
  let range = null
  let frame = 0

  // A section spans from its heading to the next heading (the last one to the end of the
  // post). Every section intersecting the viewport is marked, so short trailing sections
  // light up once the bottom of the page is reached instead of never reaching the top.
  function visibleRange() {
    const viewTop = 0
    const viewBottom = window.innerHeight
    const proseBottom = prose.getBoundingClientRect().bottom
    let first = -1
    let last = -1
    for (let i = 0; i < entries.length; i++) {
      const top = entries[i].heading.getBoundingClientRect().top
      const bottom =
        i + 1 < entries.length ? entries[i + 1].heading.getBoundingClientRect().top : proseBottom
      if (bottom > viewTop && top < viewBottom) {
        if (first === -1) first = i
        last = i
      } else if (first !== -1) {
        break
      }
    }
    return first === -1 ? null : [first, last]
  }

  // Last range that had something on screen; the bar stays there while only the intro or
  // the footer is visible instead of fading out and back in.
  let shown = null

  // The bar is the list's first background layer (see .toc-list in main.css); the second
  // layer is the static track, so both lists keep two entries for the transition to match.
  function placeIndicator() {
    if (range) shown = range
    if (!shown || !list.offsetHeight) return
    const firstItem = entries[shown[0]].item
    const lastItem = entries[shown[1]].item
    const top = Math.round(firstItem.offsetTop)
    const height = Math.round(lastItem.offsetTop + lastItem.offsetHeight) - top
    list.style.backgroundPosition = '0 ' + top + 'px, 0 0'
    list.style.backgroundSize = '1px ' + height + 'px, 1px 100%'
  }

  // Keep the visible range inside the sidebar when it overflows. Adjusting scrollTop
  // directly avoids scrollIntoView, which would also scroll the page.
  function revealInSidebar() {
    if (!range || nav.scrollHeight <= nav.clientHeight) return
    const navRect = nav.getBoundingClientRect()
    const firstRect = entries[range[0]].item.getBoundingClientRect()
    const lastRect = entries[range[1]].item.getBoundingClientRect()
    const pad = 16
    if (firstRect.top < navRect.top + pad) {
      nav.scrollTop -= navRect.top + pad - firstRect.top
    } else if (lastRect.bottom > navRect.bottom - pad) {
      const delta = Math.min(lastRect.bottom - navRect.bottom + pad, firstRect.top - navRect.top)
      nav.scrollTop += delta
    }
  }

  function update() {
    frame = 0
    range = visibleRange()
    const key = range ? range.join(':') : ''
    if (key === visibleKey) return
    visibleKey = key

    entries.forEach(function (e, i) {
      const visible = !!range && i >= range[0] && i <= range[1]
      e.link.classList.toggle('active', visible)
      if (range && i === range[0]) e.link.setAttribute('aria-current', 'true')
      else e.link.removeAttribute('aria-current')
    })
    placeIndicator()
    revealInSidebar()
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update)
  }

  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })

  // Title wrapping changes item heights without changing the visible range
  if ('ResizeObserver' in window) new ResizeObserver(placeIndicator).observe(list)

  // The list has no size while the mobile toggle is closed
  const toggle = document.querySelector('.toc-mobile')
  if (toggle) toggle.addEventListener('toggle', placeIndicator)

  update()
  // Enable transitions only after the initial placement so the bar doesn't slide in on load
  requestAnimationFrame(function () {
    nav.classList.add('toc-ready')
  })
})()
