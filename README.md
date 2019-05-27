## Description
想找一个可以下载 github 仓库中某一个文件夹中的文件的库，一直没有找到，所以只能自己写了，现在只能下载 github 上仓储的代码，抱歉

## Usage
```js
  const create = require('get-repo-dir')

  const options = {
    destPath: './dist',
    dirPath: 'packages',
    repo: 'https://github.com/facebook/react.git',
  }

  // 每次在下载前清楚原有下载的文件
  create(options).remove().download()
```

## Options
- `repo` - 指定的仓库路径
- `dirPath` - 指定仓库中的具体要下载的文件夹，根路径为当前仓库
- `destPath` - 下载文件存放的路径
- `branch` - 要下载的仓库分支，默认是 master
- `needSize` - 下载进度条是否检测下载文件包的大小，以供下载进度条显示，默认为 false
- `timeout` - 指定超时时间，超时将会退出进程，单位为 s，默认是 5 * 60s
- `hooks` - 下载过程的钩子，钩子函数中的 `this` 指向当前创建的实例，默认的钩子定义在[这里](./src/hooks.js)

## API
### remove(url?: string)
Example: `D.remove()`

remove 方法会删除指定的文件夹，如果 url 未传入，则删除默认存放下载文件路径的文件夹

### download()
Example: `D.download()`

download 方法会开始下载指定的文件

## Tips
+ 对于 `options.needSize` 这个配置项，如果下载的是少量大文件，可以设置为 `true`，使进度条根据文件包大小展示，以获得更好的下载体验。如果下载的是大量的小文件，则推荐设置 `false`，不要因为过多的请求而浪费时间

+ 这个包会检测文件夹页面的 html 字符串，拿到需要下载的文件，所以，文件夹越多，越影响下载速度。如果需要下载完整的仓库，推荐使用 [download-git-repo](https://www.npmjs.com/package/download-git-repo) 这个包

+ 如果下载的文件特别大，`options.timeout` 可能需要重置为更长的时间