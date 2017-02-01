wp.customize('blogname', (value) => {
  value.bind(to => (document.querySelector('.brand').textContent = to))
})
