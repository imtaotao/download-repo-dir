## 简介
想找一个可以下载 github 仓库中某一个文件夹中的文件的库，一直没有找到，所以只能自己写了，现在只能下载 github 上仓储的代码，抱歉

## demo
```js
  const create = require('download-repo-dir')

  const download = create('https://github.com/vuejs/vue.git', './dist')
  
  download.remove()
  download.download('src/core').then(() => {
    // console.log('complete')
  })
```

## 小提示
这个包会检测文件夹页面的 html 字符串，拿到需要下载的文件，所以，文件夹越多，越影响下载速度