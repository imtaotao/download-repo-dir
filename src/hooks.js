const ora = require('ora')
const _ = require('./utils')
const chalk = require('chalk')
const ProgressBar = require('progress')
const cliSpinners  = require('cli-spinners')

module.exports = {
  ready () {
    console.clear()
    console.log(chalk.yellow('☕  Ready...'))
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
    this.spinner = ora({
      indent: 2,
      color: 'blue',
      text: chalk.red('0.0KB'),
      spinner: cliSpinners.dots,
    })
    this.spinner.start()
  },

  packageInfoProcess (totalSize) {
    this.spinner.text = chalk.red(`${_.formatSize(totalSize)}`)
  },

  packageInfoEnd () {
    this.spinner.stop()
    this.spinner = null
  },

  progress (percent, tick, requestPath) {
    const { total, arrived } = this.size
    if (!this.progressBar) {
      const titleText = '✨  [:bar] :percent (:token1) :token2'
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
      token1: chalk.yellowBright(token1),
      token2: chalk.greenBright(requestPath),
    })
  },

  complete () {
    console.clear()
    console.log(chalk.green('🎉  Complete!\n'))
  },

  error (errMsg) {
    console.error(`❌  ${errMsg}`)
    process.exit(1)
  },
}