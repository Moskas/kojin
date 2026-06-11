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
