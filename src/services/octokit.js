const Octokit = require('@octokit/rest')

const octokit = new Octokit()
octokit.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN
})

module.exports = octokit
