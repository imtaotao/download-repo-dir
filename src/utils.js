const path = require('path')
const url = require('url')

const dirExpand = 'file-list'
const fileHost = 'raw.githubusercontent.com'

exports.separateUrl = function (repo, branch) {
  const config = url.parse(repo)
  const exname = path.extname(config.path)

  config.path = config.path.replace(exname, '')
  config.href = config.href.replace(exname, '')

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

  return { dir, file }
}

exports.getDirItems = function (text) {
  const files = []
  const list = text.match(/(?<=(js-navigation-open.+href=['"])).+(tree|blob).+(")/g) || []

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