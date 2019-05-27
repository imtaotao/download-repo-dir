const _ = require('./utils')
const chalk = require('chalk')
const ProgressBar = require('progress')

module.exports = {
  ready () {
    console.clear()
    console.log(chalk.yellow('☕  Get files...'))
  },

  start () {
    const total = this.needSize
      ? _.formatSize(this.size.total)
      : this.size.total
    
    console.clear()
    console.log(chalk.yellow(`🚀  Download( ${chalk.greenBright(total)} )...`))
  },

  packageInfoStart () {
    console.clear()
    console.log(chalk.yellow('📦  Get package size...'));
    this.spinner = _.spinner(chalk.blue(' 0.0KB'))
    this.spinner.start()
  },

  packageInfoProcess (totalSize, path) {
    path = _.getNormalPath(path)
    this.spinner.text = ` ${chalk.blue(_.formatSize(totalSize))} ${chalk.greenBright(path)}`
  },

  packageInfoEnd () {
    this.spinner.stop()
    this.spinner = null
  },

  progress (percent, tick, path) {
    const { total, arrived } = this.size
    if (!this.progressBar) {
      const titleText = '[:bar] :percent (:token1) :token2'
      this.progressBar = new ProgressBar(titleText, {
        total,
        width: 20,
        clear: true,
        complete: '█',
        incomplete: '░',
      })
    }

    const token1 = this.needSize
      ? `${_.formatSize(arrived)}/${_.formatSize(total)}`
      : `${arrived}/${total}`

    this.progressBar.tick(tick, {
      token1: chalk.blue(token1),
      token2: chalk.greenBright(_.getNormalPath(path)),
    })
  },

  complete () {
    console.clear()
    console.log(chalk.green('✨  Success!\n'))
  },

  error (errMsg) {
    console.error(`\n❌  ${errMsg}`)
    process.exit(1)
  },
}