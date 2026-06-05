(function () {
  const headings = Array.from(
    document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4')
  )
  if (!headings.length) return

  const tocLinks = Array.from(document.querySelectorAll('.toc-sidebar a, .toc-mobile a'))
  if (!tocLinks.length) return

  let activeId = null

  function activate(id) {
    if (id === activeId) return
    activeId = id
    tocLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id)
    })
  }

  function update() {
    const scrollY = window.scrollY
    // A heading becomes active when it has scrolled within 120px of the viewport top.
    // Using absolute document position (getBoundingClientRect + scrollY) so the
    // comparison is stable regardless of when during the scroll event this runs.
    const threshold = scrollY + 120
    let best = headings[0]

    for (let i = 0; i < headings.length; i++) {
      const absTop = headings[i].getBoundingClientRect().top + scrollY
      if (absTop <= threshold) {
        best = headings[i]
      } else {
        break
      }
    }

    activate(best.id)
  }

  window.addEventListener('scroll', update, { passive: true })
  update()
})()
