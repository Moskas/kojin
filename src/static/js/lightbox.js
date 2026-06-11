const lightbox = document.getElementById('lightbox')
const backdrop = document.getElementById('lightbox-backdrop')
const img = document.getElementById('lightbox-img')
const exifEl = document.getElementById('lightbox-exif')
const closeBtn = document.getElementById('lightbox-close')
const prevBtn = document.getElementById('lightbox-prev')
const nextBtn = document.getElementById('lightbox-next')

let photos = []
let idx = 0

function show(i) {
  idx = i
  const p = photos[i]
  img.src = p.medium
  img.alt = p.alt
  exifEl.textContent = p.exif || ''
  exifEl.hidden = !p.exif
  prevBtn.hidden = i <= 0
  nextBtn.hidden = i >= photos.length - 1
}

function open(strip, btn) {
  const btns = [...strip.querySelectorAll('.roll-photo')]
  photos = btns.map((b) => ({ medium: b.dataset.medium, alt: b.dataset.alt, exif: b.dataset.exif }))
  show(btns.indexOf(btn))
  lightbox.removeAttribute('aria-hidden')
  document.body.style.overflow = 'hidden'
}

function close() {
  lightbox.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
  img.src = ''
  photos = []
}

document.querySelectorAll('.roll-photo').forEach((btn) => {
  btn.addEventListener('click', () => {
    open(btn.closest('.roll-strip'), btn)
  })
})

backdrop.addEventListener('click', close)
closeBtn.addEventListener('click', close)

prevBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  if (idx > 0) show(idx - 1)
})

nextBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  if (idx < photos.length - 1) show(idx + 1)
})

document.addEventListener('keydown', (e) => {
  if (lightbox.getAttribute('aria-hidden') === 'true') return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft' && idx > 0) show(idx - 1)
  if (e.key === 'ArrowRight' && idx < photos.length - 1) show(idx + 1)
})
