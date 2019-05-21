exports.parseURL = function (url) {
  const info = {}
  const repoPath = new URL(url).pathname
  const splitPath = repoPath.split('/')

  info.author = splitPath[1]
  info.repository = splitPath[2]
  info.branch = splitPath[4]
  info.rootName = splitPath[splitPath.length - 1]

  if(info.branch){
    info.resPath = repoPath.substring(repoPath.indexOf(splitPath[4]) + splitPath[4].length + 1)
  }

  info.downloadFileName = info.rootName
  info.rootDirectoryName = info.rootName + '/'
  info.urlPostfix = "?ref=" + info.branch
  info.urlPrefix = `https://api.github.com/repos/${info.author}/${info.repository}/contents`

  return info
}