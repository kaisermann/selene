export default {
  init () {
    document
      .querySelector('.js-burger')
      .addEventListener('click', function toggleOverlay (e) {
        if (e && e.keyCode !== undefined && e.keyCode !== 27) return
        if (document.body.classList.toggle('is-header-overlay-active')) {
          // Open
          window.addEventListener('keyup', toggleOverlay)
        } else {
          // Close
          window.removeEventListener('keyup', toggleOverlay)
        }
      })
  },
}
