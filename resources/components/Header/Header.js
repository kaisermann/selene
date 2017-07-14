let burger
let headerOverlay

const toggleOverlay = () => {
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
