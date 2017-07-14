let burger
let headerOverlay

const toggleOverlay = e => {
  if (e && e.keyCode !== undefined && e.keyCode !== 27) return
  if (
    burger.classList.toggle('is-active') &
    headerOverlay.classList.toggle('is-visible')
  ) {
    // Open
    window.addEventListener('keyup', toggleOverlay)
  } else {
    // Close
    window.removeEventListener('keyup', toggleOverlay)
  }
}

export default {
  init () {
    burger = document.querySelector('.js-burger')
    headerOverlay = document.querySelector('.js-header-overlay')
    burger.addEventListener('click', toggleOverlay)
  },
}
