const create = require('./src')

create({
  destUrl: './dist',
  dirPath: 'web',
  repo: 'https://github.com/imtaotao/rustle-music.git',
})
.remove().download()