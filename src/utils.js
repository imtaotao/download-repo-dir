const fs = require('fs')
const url = require('url')
const path = require('path')
const axios = require('axios')
const chalk = require('chalk')
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
exports.separateUrl = function (repo, airmUrl, branch) {
  const config = url.parse(repo)
  const exname = path.extname(config.path)

  config.path = config.path.replace(exname, '')
  config.href = config.href.replace(exname, '')

  if (!path.isAbsolute(airmUrl)) {
    const cwd = process.cwd()
    airmUrl = path.resolve(cwd, airmUrl)
  }

  const dest = s => {
    return path.join(airmUrl, s)
  }

  const dir = s => {
    return url.format({
      host: config.host,
      protocol: config.protocol,
      pathname: path.posix.join(config.path, DIREXPAND, branch, s),
    })
  }
  
  const file = s => {
    return url.format({
      host: FILEHOST,
      protocol: config.protocol,
      pathname: path.posix.join(config.path, branch, s),
    })
  }

  return { dir, file, dest, airmUrl, branch }
}

// 获得一个文件夹中的所有文件
exports.getDirItems = async function (url, branch) {
  console.log(`🕗  ${chalk.cyan('Get folder information: ')}`, chalk.greenBright(url))

  try {
    const res = await axios.get(url)
    const text = res && res.data

    return typeof text === 'string'
      ? parseHtml(text, branch)
      : []
  } catch (error) {
    console.error(`\n${chalk.red(error)}\n`)
    process.exit(1)
  }
}

// 获取整个文件的大小
exports.totalSize = async function (files) {
  let totalSize = 0

  const getFileSize = async filePath => {
    try {
      const data = await axios.head(filePath)
      if (data && data.headers) {
        const size = Number(data.headers['content-length'])
        if (!isNaN(size)) {
          totalSize += size
        }
      }
    } catch (error) {
      console.error(`\n${chalk.red(error)}\n`)
      process.exit(1)
    }
  }

  await Promise.all(files.map(item => getFileSize(item.request)))
  return totalSize
}

// 超过 10min 直接退出进程
exports.timeout = function (msg) {
  msg = msg || '❌  network timeout...'
  let t = setTimeout(() => {
    console.error(`${chalk.red(msg)}\n`)
    process.exit(1)
  }, 1000 * 60 * 10)

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