const fs = require('fs')
const _ = require('./utils')
const path = require('path')
const chalk = require('chalk')
const rm = require('rimraf').sync
const download = require('download')

// https://github.com/imtaotao/Grass/file-list/master/src
// https://raw.githubusercontent.com/imtaotao/Grass/master/index.js

const hooks = {
  progress (percent, {arrived, total}) {
    this.needSize
      ? console.log('percent: ', percent)
      : console.log('percent: ', percent, `${arrived}/${total}`)
  },
  ready () {
    console.log(chalk.yellow('☕  Ready...'))
  },
  start () {
    console.log(chalk.yellow('🚀  Download...'))
  },
  packageInfo () {
    console.log(chalk.yellow('📦  Get package size...'))
  },
  complete () {
    console.log(chalk.green('🎉  Complete'))
  }
}

class DownLoad {
  constructor (repo, airmUrl, branch = 'master') {
    if (!repo) throw new Error('error')
    if (!airmUrl) throw new Error('error')
    if (!branch) throw new Error('error')

    this.size = {
      total: 0,
      arrived: 0,
    }
    this.needSize = false
    this.config = _.separateUrl(repo, airmUrl, branch)
    _.extend(hooks, this)
  }

  remove (url) {
    rm(url || this.config.airmUrl)
    return this
  }

  async download (url) {
    let remove = _.timeout()

    this._callHook('ready')
    const fileList = await this._getFilesInfo(url)

    if (this.needSize) {
      this._callHook('packageInfo')
      const size = await _.totalSize(fileList.files)
      this.size = {
        arrived: 0,
        total: size,
      }
    } else {
      this.size = {
        arrived: 0,
        total: fileList.files.length,
      }
    }
    
    remove()
    remove = _.timeout()

    this._callHook('start')
    // 创建本地文件夹
    fileList.dirs.forEach(dirPath => _.mkdir(dirPath))
    const asyncArray = fileList.files.map(({request, dest}) => this._downFile(request, dest))

    return Promise.all(asyncArray).then(() => {
      remove()
      this._callHook('complete')
    })
  }

  _callHook (name, ...args) {
    const fn = this[name]
    if (typeof fn === 'function') {
      fn.apply(this, args)
    }
  }

  async _getFilesInfo (requstPath, preDestinationPath = '', map) {
    if (!map) {
      map = {
        dirs: [],
        files: [],
      }
    }
    if (!requstPath) return map

    const url = this.config.dir(requstPath)
    const mkdirPath = this.config.dest(preDestinationPath)
    const list = await _.getDirItems(url, this.config.branch)

    map.dirs.push(mkdirPath)

    for (const item of list) {
      const currentFilePath = path.posix.join(requstPath, item.name)
      const destinationPath = path.posix.join(preDestinationPath, item.name)

      if (item.isDir) {
        await this._getFilesInfo(currentFilePath, destinationPath, map)
      } else {
        map.files.push({
          dest: this.config.dest(destinationPath),
          request: this.config.file(currentFilePath),
        })
      }
    }

    return map
  }

  async _downFile (requestPath, destination) {
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(destination)
      const reader = download(requestPath)
      const errFn = err => {
        console.error(`${chalk.yellow(error)}: ${chalk.redBright(destination)} ${chalk.cyan('--->')} ${chalk.red(err)}`)
        process.exit(1)
      }

      reader.pipe(writer)

      reader.on('error', errFn)
      writer.on('error', errFn)

      reader.on('data', chunk => {
        if (this.needSize) {
          this.size.arrived += chunk.length
          const percent = this.size.arrived / this.size.total
          this._callHook('progress', percent.toFixed(3), this.size)
        }
      })

      writer.on('finish', () => {
        if (!this.needSize) {
          // 以下载的文件为百分比计算
          this.size.arrived++
          const percent = this.size.arrived / this.size.total
          this._callHook('progress', percent.toFixed(3), this.size)
        }
        resolve(`[succuess]: ${destination}`)
      })
    })
  }
}

function create (repo, airmUrl, branch) {
  return new DownLoad(repo, airmUrl, branch)
}

create('https://github.com/PanJiaChen/vue-element-admin.git', './dist')
.remove()
.download('mock').then(() => {
  console.log('完成')
})