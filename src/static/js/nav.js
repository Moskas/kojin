const path = window.location.pathname;
document.querySelectorAll('.nav-dropdown a[href], .nav-mobile-group a[href]').forEach((a) => {
  const href = a.getAttribute('href');
  if (href && (path === href || path.startsWith(href + '/'))) {
    a.classList.add('nav-active');
  }
});

document.addEventListener('click', (e) => {
  const menu = document.querySelector('.nav-mobile')
  if (menu && menu.open && !menu.contains(e.target)) menu.open = false
})

document.querySelectorAll('.nav-group').forEach((group) => {
  let escaping = false

  group.addEventListener('mouseenter', () => group.classList.add('is-open'))
  group.addEventListener('mouseleave', () => group.classList.remove('is-open'))

  group.addEventListener('focusin', () => {
    if (!escaping) group.classList.add('is-open')
    escaping = false
  })
  group.addEventListener('focusout', (e) => {
    if (!group.contains(e.relatedTarget)) {
      group.classList.remove('is-open')
      escaping = false
    }
  })
  group.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && group.classList.contains('is-open')) {
      escaping = true
      group.classList.remove('is-open')
      group.querySelector('.nav-group-label').focus()
    }
  })
})
