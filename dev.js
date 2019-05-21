const create = require('./src')

const options = {
  destPath: './dist',
  dirPath: 'packages',
  repo: 'https://github.com/facebook/react.git',
}

create(options).remove().download()