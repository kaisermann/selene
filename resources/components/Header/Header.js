export default {
  init () {
    const burgerEl = document.querySelector('.js-burger')
    burgerEl.addEventListener('click', function toggleOverlay (e) {
      if (e && typeof e.keyCode !== 'undefined' && e.keyCode !== 27) return

      if (document.body.classList.toggle('is-header-overlay-active')) {
        window.addEventListener('keyup', toggleOverlay)
      } else {
        window.removeEventListener('keyup', toggleOverlay)
      }

      burgerEl.setAttribute(
        'aria-pressed',
        !(this.getAttribute('aria-pressed') === 'true')
      )
    })
  },
}
