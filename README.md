## Description
[![NPM version][npm-image]][npm-url]<br>

I want to find a libray that can download folder in the github repository, but I can't find, so, I only write by myself.

## Usage
```js
  const create = require('get-repo-dir')

  const options = {
    destPath: './dist',
    dirPath: 'packages',
    repo: 'https://github.com/facebook/react.git',
  }

  // Clear old files before every download
  create(options).remove().download()
```

## Options
- `repo` - The github repesitory url that needs to be downloaded.
- `dirPath` - The folder url of need download, the root path is current repository.
- `destPath` - Download the file storage path.
- `branch` - Repository branch，default is `master`.
- `needSize` - You whether need to detect the size of the file package, let the download progress bar use, default is `false`.
- `timeout` - Specify the timeout period, timeout will exit the process, The unit is `s`, default is `5 * 60`s.
- `hooks` - The hooks of the download process, the `this` in the hooks function points to the currently created instance, the default hooks is defined in [here](./src/hooks.js).

## API
### remove(url?: string)
Example: `D.remove()`

The `remove` method will deletes the specified folder, and if the url is not passed, deletes the folder where the download file path is stored by default.

### download()
Example: `D.download()`

The `download` will download specify files

## Tips
+ For the `options.needSize` item, if you download a small number of large files, you can set it to `true` so that the progress bar is displayed according to the file package size for a better download experience. If you are downloading a large number of small files, it is recommended to set `false`, don't waste time because of too many requests.

+ This package will detect the html string of the folder page and get the file to be downloaded. Therefore, the more folders, the more it affects the download speed. If you need to download the full repository, it is recommended to use the [download-git-repo](https://www.npmjs.com/package/download-git-repo) package.

+ If the downloaded file is particularly large, `options.timeout` may need to be reset to a longer time.


## Cli
```
npm i get-repo-dir -g
```
```
repo download [options] [repoURL]
```
Supported options:

- `-d, --dirpath` - Same as `options.dirPath`, default is `/`.
- `-l, --local` - Same as `options.destPath`, default is `process.cwd()`.
- `-b, --branch` - Same as `options.branch`, default is `master`.
- `-s, --needsize` - Same as `options.needSize`, default is `false`.
- `-t, --timeout` - Same as `options.timeout`, default is `5 * 60`s.

### demo
```
  repo download https://github.com/vuejs/vue.git -d ./src -l ./vue
```

[npm-url]: https://www.npmjs.com/package/get-repo-dir
[npm-image]: https://img.shields.io/npm/v/get-repo-dir.svg