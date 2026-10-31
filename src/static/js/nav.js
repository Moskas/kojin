const path = window.location.pathname
document.querySelectorAll('.nav-dropdown a[href]').forEach((a) => {
  const href = a.getAttribute('href')
  if (href && (path === href || path.startsWith(href + '/'))) {
    a.classList.add('nav-active')
  }
})

const groups = document.querySelectorAll('.nav-group')

document.addEventListener('click', (e) => {
  const menu = document.querySelector('.nav-mobile')
  const links = document.querySelector('.nav-links')
  if (menu && menu.open && !menu.contains(e.target) && !links.contains(e.target)) {
    menu.open = false
  }
  groups.forEach((group) => {
    if (group.open && !group.contains(e.target)) group.open = false
  })
})

// bfcache restores the open attribute; always start closed
window.addEventListener('pageshow', () => groups.forEach((group) => (group.open = false)))

const canHover = window.matchMedia('(hover: hover)')

groups.forEach((group) => {
  const label = group.querySelector('.nav-group-label')
  let hoverOpened = false

  // keep only one group open at a time
  group.addEventListener('toggle', () => {
    if (!group.open) return
    groups.forEach((other) => {
      if (other !== group) other.open = false
    })
  })

  group.addEventListener('mouseenter', () => {
    if (!canHover.matches || group.open) return
    group.open = true
    hoverOpened = true
  })
  group.addEventListener('mouseleave', () => {
    if (!canHover.matches || !hoverOpened) return
    group.open = false
    hoverOpened = false
  })

  // a click on a hover-opened label would otherwise toggle it shut
  label.addEventListener('click', (e) => {
    if (hoverOpened) e.preventDefault()
    hoverOpened = false
  })

  group.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !group.contains(e.relatedTarget)) group.open = false
  })
  group.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && group.open) {
      group.open = false
      label.focus()
    }
  })
})
