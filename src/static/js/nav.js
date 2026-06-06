document.addEventListener('click', (e) => {
  const menu = document.querySelector('.nav-mobile')
  if (menu && menu.open && !menu.contains(e.target)) menu.open = false
})
