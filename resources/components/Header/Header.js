const toggleOverlay = e => {
  if (e && typeof e.keyCode !== 'undefined' && e.keyCode !== 27) return
  if (document.body.classList.toggle('is-header-overlay-active')) {
    window.addEventListener('keyup', toggleOverlay)
  } else {
    window.removeEventListener('keyup', toggleOverlay)
  }
}

export default {
  init () {
    document
      .querySelector('.js-burger')
      .addEventListener('click', toggleOverlay)
  },
}
