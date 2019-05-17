const fs = require('fs')
const url = require('url')
const path = require('path')
const axios = require('axios')

const DIREXPAND = 'file-list'
const FILEHOST = 'raw.githubusercontent.com'

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

exports.getDirItems = async function (url) {
  try {
    const res = await axios.get(url)
    const text = res && res.data

    return typeof text === 'string'
      ? exports.parseHtml(text)
      : []
  } catch ({ port, errno }) {
    console.error(`[error]：${url} -> ${port}`)
    return []
  }
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