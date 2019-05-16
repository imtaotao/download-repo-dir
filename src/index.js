const axios = require('axios')
const _ = require('./utils')

// https://github.com/imtaotao/Grass/file-list/master/src
// https://raw.githubusercontent.com/imtaotao/Grass/master/index.js

class DownLoad {
  constructor (repo, branch = 'master') {
    if (!repo) throw new Error('error')
    if (!branch) throw new Error('error')
    this.config = _.separateUrl(repo, branch)
  }

  _dealWithDir (text) {
    const list = _.getDirItems(text)
    if (list.length > 0) {
      console.log(list);
    }
  }

  async downFile (url) {
    if (!url) return false
    
  }

  async downDir (url) {
    if (!url) return false
    url = this.config.dir(url)

    try {
      const res = await axios.get(url)
      const text = res && res.data

      if (typeof text === 'string') {
        this._dealWithDir(text)
      }
    } catch (err) {
      console.error(err)
      return false
    }
  }
}

function create (repo, branch) {
  return new DownLoad(repo, branch)
}
create('https://github.com/imtaotao/Grass.git').downDir('src')