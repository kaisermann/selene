let isOpen = false

export default {
  init () {
    const burgerEl = document.querySelector('.js-burger')
    if (burgerEl) {
      const toggleMenu = () => {
        isOpen = document.body.classList.toggle('is-header-overlay-active')
        burgerEl.setAttribute('aria-expanded', isOpen)
      }

      burgerEl.addEventListener('click', toggleMenu)
      window.addEventListener('keyup', e => {
        if (isOpen && e.keyCode === 27) {
          toggleMenu()
        }
      })
    }
  },
}
