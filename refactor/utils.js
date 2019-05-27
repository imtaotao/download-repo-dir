// https://api.github.com/repos/solomonxie/gists/contents/目录名
const path = require('path')
const axios = require('axios')
const chalk = require('chalk')

exports.parseURL = function ({url, destPath}) {
  const info = {}
  const repoPath = new URL(url).pathname
  const splitPath = repoPath.split('/')

  info.author = splitPath[1]
  info.repository = splitPath[2]
  info.branch = splitPath[4] || 'master'
  info.rootName = splitPath[splitPath.length - 1]

  if (info.branch){
    info.resPath = repoPath.substring(repoPath.indexOf(splitPath[4]) + splitPath[4].length + 1)
  }

  info.downloadFileName = info.rootName
  info.rootDirectoryName = info.rootName + '/'
  info.urlPostfix = `?ref=${info.branch}`
  info.urlPrefix = `https://api.github.com/repos/${info.author}/${info.repository}/contents`

  info.destDirPath = v => path.join(destPath, v)
  info.requestDirUrl = v => `${info.urlPrefix}/${v}${info.urlPostfix}`
  return info
}

// 获得一个文件夹中的所有文件
exports.getDirItems = async function (url, errorHandle) {
  console.log(`🕗  ${chalk.cyan('Get folder information: ')}`, chalk.greenBright(url))

  try {
    const res = await axios.get(url)
    return (res && res.data) || []
  } catch (error) {
    errorHandle(`\n${chalk.red(error)} ${chalk.cyan('--->')} ${chalk.redBright(url)}\n`)
    process.exit(1)
  }
}