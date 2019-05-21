## 简介
[![NPM version][npm-image]][npm-url]<br>
想找一个可以下载 github 仓库中某一个文件夹中的文件的库，一直没有找到，所以只能自己写了，现在只能下载 github 上仓储的代码，抱歉

## demo
```js
  const create = require('get-repo-dir')

  // create(repoUrl, destPath, branch = 'master')
  // branch 默认为 master，如果要下载其他分支的代码，可以选择第三个参数
  const download = create('https://github.com/vuejs/vue.git', './dist')
  
  // 设置为 true，进度条以文件大小计算，否则以文件个数计算，默认以文件个数计算
  // 设置为 true 时，会发生 head 请求，以得到文件大小，对于少量大文件可以设置为 true，得到更好的体验，大量的小文件则会很耗费时间，需要注意
  download.needSize = true

  // 删除已经存在的文件夹（下载存放的目录），没有默认默认跳过
  download.remove()
  download.download('src/core').then(() => {
    // console.log('complete')
  })
```

## 小提示
这个包会检测文件夹页面的 html 字符串，拿到需要下载的文件，所以，文件夹越多，越影响下载速度。如果需要下载完整的仓库，推荐使用 [download-git-repo](https://www.npmjs.com/package/download-git-repo) 这个包


[npm-image]: https://img.shields.io/npm/v/get-repo-dir.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/get-repo-dir