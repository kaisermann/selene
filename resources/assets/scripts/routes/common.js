import Header from '@Components/Header/Header'

export default {
  init () {
    Header.init()
    // JavaScript to be fired on all pages
  },
  finalize () {
    // JavaScript to be fired on all pages, after page specific JS is fired
  },
}
