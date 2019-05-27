const create = require('./src')

const options = {
  // needSize: true,
  destPath: './dist',
  dirPath: '/',
  repo: 'https://github.com/imtaotao/my-practice.git',
  hooks: {
    error (err) {
      console.log(err)
      this.remove()
    },
  }
}

create(options).remove().download()