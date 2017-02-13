module.exports = str => str.slice(-1) === '/' || (str.indexOf('.') < 0 || str[0] === '.')
