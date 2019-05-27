const fs = require('fs')
const _ = require('./utils')
const path = require('path')
const rm = require('rimraf').sync

class DownloadCore {
  constructor (opts) {
    if (!path.isAbsolute(opts.destPath)) {
      const cwd = process.cwd()
      opts.destPath = path.resolve(cwd, opts.destPath)
    }

    this.opts = opts
    this.info = _.parseURL(opts)
  }

  async download () {
    const fileSet = await this._getFilesInfo(this.info.resPath)

    // 创建本地文件夹
    fileSet.dirs.forEach(dirPath => _.mkdir(dirPath))
    console.log(fileSet.files)
    // const asyncArray = fileSet.files.map(({url, path}) => {
    //   return this._downFile(request, dest, path)
    // })
  }
  
  remove (url) {
    url = url || this.opts.destPath
    if (fs.existsSync(url)) rm(url)
    return this
  }

  _callHook (name, ...args) {
    const fn = this[name]
    if (typeof fn === 'function') {
      fn.apply(this, args)
    }
  }

  async _getFilesInfo (path, map) {
    if (!map) map = { size: 0, dirs: [], files: [] }
    if (!path) return map

    const dirAsyncArr = []
    const dirUrl = this.info.requestDirUrl(path)
    const list = await _.getDirItems(dirUrl, console.log)

    map.dirs.push(path)

    list.forEach(item => {
      const type = (item.type && item.type.toLocaleLowerCase()) || ''

      if (type === 'dir') {
        dirAsyncArr.push(this._getFilesInfo(item.path, map))
      } else if (type === 'file') {
        map.size += item.size
        map.files.push({
          size: item.size,
          path: item.path,
          name: item.name,
          url: item.download_url,
        })
      }
    })

    return Promise.all(dirAsyncArr).then(() => map, () => process.exit(1))
  }

  // 下载文件
  async _downFile (requestUrl, destination, requestPath) {
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(destination)
      const reader = download(requestUrl)
      const errFn = error => {
        this._callHook('error', `\n${chalk.red(error)} ${chalk.cyan('--->')} ${chalk.redBright(requestUrl)}\n`)
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

function create (options) {
  if (typeof options === 'string') {
    options = {
      url: options,
      destPath: './dist',
    }
  }
  if (!options.url) {
    console.log('url is empty')
    process.exit(1)
  }

  return new DownloadCore(options)
}

create('https://github.com/imtaotao/rustle-music/tree/master/web').remove().download()