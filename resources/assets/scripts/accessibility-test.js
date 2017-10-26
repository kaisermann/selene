/*
 * Basic accessibility tests.
 * Logs and outlines all elements with accessibility problems.
 * This code is only loaded on 'development' environment.
 */
import { scanForProblems } from 'accessibilityjs'

document.addEventListener('DOMContentLoaded', function () {
  const errors = []

  scanForProblems(document, function logError (error) {
    errors.push({ el: error.element, msg: `${error.name} - ${error.message}` })
    error.element.style.outline = '10px solid red'
    error.element.addEventListener(
      'click',
      function (e) {
        e.stopPropagation()
        e.preventDefault()
        window.alert(`${error.name}\n\n${error.message}`)
      },
      { once: true }
    )
  })

  if (errors.length) {
    console.group('Accessibility errors')
    errors.forEach(console.log)
    console.groupEnd('Accessibility errors')
  }
})
