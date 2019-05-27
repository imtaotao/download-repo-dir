const fs = require('fs')
const ora = require('ora')
const url = require('url')
const path = require('path')
const axios = require('axios')
const chalk = require('chalk')
const cliSpinners  = require('cli-spinners')
const { parse } = require('node-html-parser')

const DIREXPAND = 'file-list'
const FILEHOST = 'raw.githubusercontent.com'
const HREFREG = /(?<=(href=")).+(tree|blob).+"/g

function getSimplifiedPath (nodes) {
  for (const item of nodes) {
    if (item.rawAttrs && item.rawAttrs.includes('simplified-path')) {
      const textNode = item.childNodes[0]
      return textNode && textNode.nodeType === 3
        ? textNode.rawText
        : ''
    }
  }
  return ''
}

function parseHtml (text, branch) {
  const files = []

  const root = parse(text)
  const tags = root.querySelectorAll('.js-navigation-open') || []
  for (const item of tags) {
    // 排除返回上一级的按钮
    if (item.rawAttrs && !item.rawAttrs.includes('rel="nofollow"')) {
      const result = item.rawAttrs.match(HREFREG)
      if (result && result[0]) {
        const simplifiedPath = getSimplifiedPath(item.childNodes)
        const basePath = path.basename(result[0]).replace('"', '')

        files.push({
          isDir: result[0].includes(`/tree/${branch}/`),
          name: path.posix.join(simplifiedPath, basePath),
        })
      }
    }
  }
  return files
}

// 创建文件夹
exports.mkdir = function (dirPath) {
  // 递归创建文件夹
  const prevDirPath = path.dirname(dirPath)
  if (!fs.existsSync(prevDirPath)) {
    exports.mkdir(prevDirPath)
  }

  if (fs.existsSync(dirPath)) {
    const stat = fs.statSync(dirPath)
    // 如果当前文件路径已经存在，但是不是文件夹，就重命名为 .bak 结尾的文件
    if (stat && !stat.isDirectory()) {
      fs.renameSync(dirPath, dirPath + '.back')
      fs.mkdirSync(dirPath)
    }
  } else {
    fs.mkdirSync(dirPath)
  }
}

// 路径相关的信息
exports.separateUrl = function ({repo, destPath, branch, dirPath}) {
  const config = url.parse(repo)
  const exname = path.extname(config.path)

  config.path = config.path.replace(exname, '')
  config.href = config.href.replace(exname, '')

  if (!path.isAbsolute(destPath)) {
    const cwd = process.cwd()
    destPath = path.resolve(cwd, destPath)
  }

  const dest = v => {
    return path.join(destPath, v)
  }

  const dir = v => {
    return url.format({
      host: config.host,
      protocol: config.protocol,
      pathname: path.posix.join(config.path, DIREXPAND, branch, v),
    })
  }
  
  const file = v => {
    return url.format({
      host: FILEHOST,
      protocol: config.protocol,
      pathname: path.posix.join(config.path, branch, v),
    })
  }

  return { dir, file, dest, dirPath, destPath, branch }
}

// 获得一个文件夹中的所有文件
exports.getDirItems = async function (url, branch, errorCb) {
  // console.log(`🕗  ${chalk.cyan('Get folder information: ')}`, chalk.greenBright(url))

  try {
    const res = await axios.get(url)
    const text = res && res.data

    return typeof text === 'string'
      ? parseHtml(text, branch)
      : []
  } catch (error) {
    errorCb(`\n${chalk.red(error)} ${chalk.cyan('--->')} ${chalk.redBright(url)}\n`)
    process.exit(1)
  }
}

// 获取整个文件的大小
exports.totalSize = async function (files, fn, errorCb) {
  let totalSize = 0

  const getFileSize = async ({path, request}) => {
    try {
      const data = await axios.head(request)
      if (data && data.headers) {
        const size = Number(data.headers['content-length'])
        if (!isNaN(size)) {
          totalSize += size
          fn(totalSize, path)
        }
      }
    } catch (error) {
      errorCb(`\n${chalk.red(error)} ${chalk.cyan('--->')} ${chalk.redBright(request)}\n`)
      process.exit(1)
    }
  }

  await Promise.all(files.map(getFileSize))
  return totalSize
}


exports.formatSize = function (size) {
  const kb = parseInt(size / 1024)
  return kb > 1024
      ? `${(kb / 1024).toFixed(2)}M`
      : `${kb}KB`
}

// 超过指定时间直接退出进程，默认为 10min
exports.timeout = function (timeoutTime, errorCb) {
  let t = setTimeout(() => {
    errorCb(`${chalk.red('network timeout...')}\n`)
    process.exit(1)
  }, 1000 * timeoutTime)

  return () => {
    clearTimeout(t)
    t = null
  }
}

exports.extend = function (from, to) {
  const keys = Object.keys(from)
  for (const key of keys) {
    to[key] = from[key]
  }
  return to
}

exports.spinner = function (text) {
  return ora({
    text,
    indent: 2,
    color: 'blue',
    spinner: cliSpinners.dots,
  })
}

exports.getNormalPath = function (path) {
  return path.length < 50
    ? path
    : path.slice(0, 47) + '...'
}