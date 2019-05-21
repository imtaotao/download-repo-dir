const fs = require('fs')
const _ = require('./utils')
const path = require('path')
const chalk = require('chalk')
const rm = require('rimraf').sync
const download = require('download')
const defaultHooks = require('./hooks')

class DownLoadCore {
  constructor (options) {
    const { repo, destPath, branch, dirPath, hooks } = options
    if (!repo || !dirPath || !destPath || !branch) {
      defaultHooks.error(chalk.red('Lack of necessary parameters...'))
      return
    }

    this._isDownloading = false
    this.size = { total: 0, arrived: 0 }
    this.config = _.separateUrl(options)
    this.needSize = options.needSize
    this.timeout = options.needSize.timeout
    _.extend(hooks || defaultHooks, this)
  }

  remove (url) {
    url = url || this.config.destPath
    if (fs.existsSync(url)) rm(url)
    return this
  }

  async download () {
    if (this._isDownloading) {
      return Promise.reject(chalk.red('Currently downloading...'))
    }
    
    this._isDownloading = true
    const errorCb = error => this._callHook('error', error)
    const timeoutTime = typeof this.timeout === 'number'
      ? this.timeout
      : 10 * 60

    let remove = _.timeout(timeoutTime, errorCb)

    this._callHook('ready')
    const fileList = await this._getFilesInfo(this.config.dirPath)

    if (this.needSize) {
      this._callHook('packageInfoStart')
      const total = await _.totalSize(fileList.files, totalSize => this._callHook('packageInfoProcess', totalSize), errorCb)
      this.size = { total, arrived: 0 }
      this._callHook('packageInfoEnd')
    } else {
      this.size = {
        arrived: 0,
        total: fileList.files.length,
      }
    }
    
    remove()
    remove = _.timeout(timeoutTime, errorCb)

    this._callHook('start')
    // 创建本地文件夹
    fileList.dirs.forEach(dirPath => _.mkdir(dirPath))
    const asyncArray = fileList.files.map(({request, dest, path}) => {
      return this._downFile(request, dest, path)
    })

    return Promise.all(asyncArray).then(() => {
      remove()
      this._resetFlagAttrs()
      this._callHook('complete')
    })
  }

  _resetFlagAttrs () {
    this._isDownloading = false
    this.size = { total: 0, arrived: 0 }
  }

  _callHook (name, ...args) {
    const fn = this[name]
    if (typeof fn === 'function') {
      fn.apply(this, args)
    }
  }

  // 获取所有的文件路径
  async _getFilesInfo (requstPath, preDestinationPath = '', map) {
    if (!map) map = { dirs: [], files: [] }
    if (!requstPath) return map

    const dirAsyncArr = []
    const url = this.config.dir(requstPath)
    const mkdirPath = this.config.dest(preDestinationPath)
    const list = await _.getDirItems(url, this.config.branch, error => {
      this._callHook('error', error)
    })

    map.dirs.push(mkdirPath)

    for (const item of list) {
      const currentFilePath = path.posix.join(requstPath, item.name)
      const destinationPath = path.posix.join(preDestinationPath, item.name)

      if (item.isDir) {
        const pedding = this._getFilesInfo(currentFilePath, destinationPath, map)
        dirAsyncArr.push(pedding)
      } else {
        map.files.push({
          path: currentFilePath,
          dest: this.config.dest(destinationPath),
          request: this.config.file(currentFilePath),
        })
      }
    }

    return Promise.all(dirAsyncArr).then(() => map, () => process.exit(1))
  }

  // 下载文件
  async _downFile (requestUrl, destination, requestPath) {
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(destination)
      const reader = download(requestUrl)
      const errFn = error => {
        this._callHook('error', `\n${chalk.yellow('error')}: ${chalk.red(error)} ${chalk.cyan('--->')} ${chalk.redBright(requestUrl)}\n`)
        reject()
      }

      reader.pipe(writer)

      reader.on('error', errFn)
      writer.on('error', errFn)
      reader.on('data', chunk => {
        if (this.needSize) {
          this.size.arrived += chunk.length
          const percent = this.size.arrived / this.size.total
          this._callHook('progress', percent.toFixed(3), chunk.length, requestPath)
        }
      })

      writer.on('finish', () => {
        if (!this.needSize) {
          // 以下载的文件为百分比计算
          this.size.arrived++
          const percent = this.size.arrived / this.size.total
          this._callHook('progress', percent.toFixed(3), 1, requestPath)
        }
        resolve(`[succuess]: ${destination}`)
      })
    })
  }
}

module.exports = function (options = {}) {
  options.branch = options.branch || 'master'
  options.needSize = options.needSize || false
  options.timeout = typeof options.timeout === 'number'
    ? options.timeout
    : 10 * 60

  return new DownLoadCore(options)
}