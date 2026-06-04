const lightbox = document.getElementById('lightbox')
const backdrop = document.getElementById('lightbox-backdrop')
const img = document.getElementById('lightbox-img')
const exifEl = document.getElementById('lightbox-exif')
const closeBtn = document.getElementById('lightbox-close')

function open(medium, alt, exif) {
  img.src = medium
  img.alt = alt
  exifEl.textContent = exif || ''
  exifEl.hidden = !exif
  lightbox.removeAttribute('aria-hidden')
  document.body.style.overflow = 'hidden'
}

function close() {
  lightbox.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
  img.src = ''
}

document.querySelectorAll('.roll-photo').forEach((btn) => {
  btn.addEventListener('click', () => {
    open(btn.dataset.medium, btn.dataset.alt, btn.dataset.exif)
  })
})

backdrop.addEventListener('click', close)
closeBtn.addEventListener('click', close)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') close()
})
