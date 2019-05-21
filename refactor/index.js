const utils = require('./utils')

class DownloadCore {
  constructor (url) {
  
  }
}

module.exports = function (url) {
  if (!url) {
    console.log('url is empty')
    process.exit(1)
  }
  return new DownloadCore(url)
}