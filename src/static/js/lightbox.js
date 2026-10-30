// built here so the overlay controls do not exist without JS (text browsers, noscript)
const lightbox = document.createElement('div')
lightbox.className = 'lightbox'
lightbox.setAttribute('aria-hidden', 'true')
lightbox.innerHTML = `
  <div class="lightbox-backdrop"></div>
  <div class="lightbox-content">
    <button class="lightbox-close" aria-label="close">✕</button>
    <button class="lightbox-prev" aria-label="previous photo">‹</button>
    <button class="lightbox-next" aria-label="next photo">›</button>
    <img class="lightbox-img" src="" alt="" />
    <p class="lightbox-exif"></p>
  </div>`
document.body.appendChild(lightbox)

const backdrop = lightbox.querySelector('.lightbox-backdrop')
const img = lightbox.querySelector('.lightbox-img')
const exifEl = lightbox.querySelector('.lightbox-exif')
const closeBtn = lightbox.querySelector('.lightbox-close')
const prevBtn = lightbox.querySelector('.lightbox-prev')
const nextBtn = lightbox.querySelector('.lightbox-next')

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
  photos = btns.map((b) => ({ medium: b.href, alt: b.dataset.alt, exif: b.dataset.exif }))
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
  btn.addEventListener('click', (e) => {
    e.preventDefault()
    open(btn.closest('.roll-strip, .travel-preview-strip, .travel-detail-strip'), btn)
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
