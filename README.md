## 简介
想找一个可以下载 github 仓库中某一个文件夹中的文件的库，一直没有找到，所以只能自己写了，现在只能下载 github 上仓储的代码，抱歉

## demo
```js
  const create = require('get-repo-dir')

  const download = create('https://github.com/vuejs/vue.git', './dist')
  
  // 设置为 true，进度条以文件大小计算，否则以文件个数计算，默认以文件个数计算
  // 设置为 true，会发生 head 请求，以得到文件大小，对于少量大文件可以设置为 true，大量的小文件则会很耗费时间
  download.needSize = true

  download.remove()
  download.download('src/core').then(() => {
    // console.log('complete')
  })
```

## 小提示
这个包会检测文件夹页面的 html 字符串，拿到需要下载的文件，所以，文件夹越多，越影响下载速度。不支持完整的仓库下载，如果需要，请使用[download-git-repo](https://www.npmjs.com/package/download-git-repo)