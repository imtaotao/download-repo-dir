const fs = require('fs')
const _ = require('./utils')
const path = require('path')
const rm = require('rimraf').sync
const download = require('download')

// https://github.com/imtaotao/Grass/file-list/master/src
// https://raw.githubusercontent.com/imtaotao/Grass/master/index.js

class DownLoad {
  constructor (repo, airmUrl, branch = 'master') {
    if (!repo) throw new Error('error')
    if (!airmUrl) throw new Error('error')
    if (!branch) throw new Error('error')
    this.config = _.separateUrl(repo, airmUrl, branch)
  }

  start (url) {
    this._download(url)
  }

  remove (url) {
    rm(url || this.config.airmUrl)
  }

  // 下载进度条
  progress () {

  }

  async _downFile (requestPath, destination) {
    return new Promise((resolve, reject) => {
      // 生成 request url 和 destination url
      requestPath = this.config.file(requestPath)
      destination = this.config.dest(destination)

      const writer = fs.createWriteStream(destination)
      download(requestPath).pipe(writer)

      writer.on('error', err => {
        reject(`[error]：${destination} -- ${err}`)
      })

      writer.on('finish', () => {
        resolve(`[succuess]：${destination}`)
      })
    })
  }

  async _download (requstPath, preDestinationPath = '') {
    if (!requstPath) return

    const url = this.config.dir(requstPath)
    const mkdirPath = this.config.dest(preDestinationPath)
    const list = await _.getDirItems(url)

    _.mkdir(mkdirPath)
    
    list.forEach(item => {
      // 创建当前路径的 url
      const currentFilePath = path.posix.join(requstPath, item.name)
      const destinationPath = path.posix.join(preDestinationPath, item.name)

      const resFn = msg => console.log(msg)

      if (item.isDir) {
        this._download(currentFilePath, destinationPath)
      } else {
        this._downFile(currentFilePath, destinationPath).then(resFn, resFn)
      }
    })
  }
}

function create (repo, airmUrl, branch) {
  return new DownLoad(repo, airmUrl, branch)
}

const d = create('https://github.com/axios/axios.git', './dist')

d.remove()
d.start('examples')