#! /usr/bin/env node

const create = require('./index')
const program = require('commander')
const inquirer = require('inquirer')
const version = require('../package.json').version

const warn = message => {
  throw new Error('Rustle Cli Warn: ' + message)
}

const download = opts => {
  create(opts).remove().download()
}

const processOpts = (repoURL, {local, branch, needsize, timeout, dir}) => {
  timeout = Number(timeout)
  const opts = () => ({
    branch,
    repo: repoURL,
    destPath: local,
    dirPath: dir || '/',
    needSize: !!needsize,
    timeout: isNaN(timeout) ? null : timeout,
  })

  return new Promise(resolve => {
    if (!local) {
      inquirer.prompt([{
        type: 'input',
        name: 'path',
        message: 'please input download local path:',
      }])
      .then(answers => {
        local = answers.path || process.cwd()
        resolve(opts())
      }, warn)
    } else {
      resolve(opts())
    }
  })
}

// 定义命令
program
  .version(version, '-v, --version')
  .command('download [repoURL]')
  .description('download repo folder')
  .option('-s, --needsize', 'get package size')
  .option('-d, --dir [dirpath]', 'repo folder path')
  .option('-t, --timeout <timeout>', 'download timeout')
  .option('-l, --local <localpath>', 'download local path')
  .option('-b, --branch [branch]', 'download branch name')
  .action((repoURL, opts) => {
    if (!repoURL) {
      inquirer.prompt([{
        type: 'input',
        name: 'path',
        message: 'please input download repository url:',
      }])
      .then(answers => {
        repoURL = answers.path
        !repoURL
          ? warn('download path cannot be empty')
          : processOpts(answers.path, opts).then(download)
      }, warn)
    } else {
      processOpts(repoURL, opts).then(download)
    }
  })

program.parse(process.argv)