const fs = require('fs')
const url = require('url')
const path = require('path')
const axios = require('axios')

const dirExpand = 'file-list'
const fileHost = 'raw.githubusercontent.com'

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
      pathname: path.posix.join(config.path, dirExpand, branch, s),
    })
  }
  
  const file = s => {
    return url.format({
      host: fileHost,
      protocol: config.protocol,
      pathname: path.posix.join(config.path, branch, s),
    })
  }

  return { dir, file, dest, airmUrl }
}

exports.parseHtml = function (text) {
  const files = []
  // 排除返回上一级的按钮
  const list = text.match(/(?<!(rel="nofollow").+)(?<=(js-navigation-open.+href=")).+(tree|blob).+"/g) || []

  for (const item of list) {
    const basename = path.basename(item)
    const exname = path.extname(basename)
    files.push({
      isDir: !exname,
      name: basename.replace('"', ''),
    })
  }

  return files
}

// 获得一个文件夹中的所有文件
exports.getDirItems = async function (url) {
  try {
    console.log(url);
    const res = await axios.get(url)
    const text = res && res.data

    return typeof text === 'string'
      ? exports.parseHtml(text)
      : []
  } catch (error) {
    console.error('error')
    return []
  }
}

// 获取整个文件的大小
exports.totalSize = async function (files) {
  let totalSize = 0

  const getFileSize = async filePath => {
    const data = await axios.head(filePath)
    if (data && data.headers) {
      const size = Number(data.headers['content-length'])
      if (!isNaN(size)) {
        totalSize += size
      }
    }
  }

  return Promise.all(
    files.map(item => getFileSize(item.request))
  ).then(() => totalSize)
}

// 创建文件夹
exports.mkdir = function (dirPath) {
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

// 超过 10min 直接退出进程
exports.timeout = function (msg) {
  msg = msg || 'Checkout you network...'
  let t = setTimeout(() => {
    console.error(msg)
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