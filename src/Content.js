const axios = require('axios')
const Boom = require('boom')
const Path = require('path')
const { tmpdir } = require('os')
const { createWriteStream } = require('fs')
const { randomBytes } = require('crypto')
const AdmZip = require('adm-zip')
const octokit = require('./octokit')

async function fetchZip({
  owner,
  repo,
  ref,
}) {
  const zipURL = `https://api.github.com/repos/${owner}/${repo}/zipball/${ref}`
  console.log('zip url ', zipURL)
  const { data: zipDownload } = await axios.get(zipURL, {
    responseType: 'stream'
  })
    .catch(error => {
      throw Boom.boomify(error, { statusCode: error.response.status })
    })

  const fileName = randomBytes(32).toString('hex') + '.zip'
  const writePath = Path.join(tmpdir(), fileName)
  const zipWriteFile = createWriteStream(writePath)

  const finishWritePromise = Promise.all([
    new Promise((resolve, reject) => {
      zipDownload.on('error', reject)
      zipDownload.on('end', resolve)
    }),
    new Promise((resolve, reject) => {
      zipWriteFile.on('error', reject)
      zipWriteFile.on('finish', resolve)
    })
  ])

  zipDownload.pipe(zipWriteFile)

  await finishWritePromise

  const zip = new AdmZip(writePath)
  return zip.getEntries().map(zipEntry => {
    const slashIndex = zipEntry.entryName.indexOf('/')
    const path = zipEntry.entryName.slice(slashIndex + 1)
    if (path === '') {
      return
    }
    return {
      path,
      isDirectory: zipEntry.isDirectory
    }
  }).filter(Boolean)
}

async function listComponents1({
  owner,
  repo,
  ref,
  path,
  download = false
}) {
  const result = await octokit.repos.getContent({
    owner,
    repo,
    ref,
    path
  })
    .catch(error => {
      if (/Not Found/.test(error.message)) {
        throw Boom.notFound()
      }
      else {
        throw error
      }
    })

  const itemContents = await Promise.all(
    result.data.map(async (item) => {
      if (item.type === 'dir') {
        if (/^_/.test(item.name)) {
          return
        }
        const items = await listComponents({ owner, repo, ref, path: `${path}/${item.name}` })
        return { items }
      }
      else if (item.type === 'file') {
        let content = null
        if (download) {
          const response = await axios.get(item.download_url, {
            responseType: 'text',
            transformResponse: data => data
          })
          content = response.data
        }

        return {
          name: item.name,
          size: item.size,
          content,
          url: item.download_url
        }
      }
      else {
        return
      }
    })
  )
  return itemContents.filter(Boolean)
}

module.exports = {
  listComponents: listComponents1,
  fetchZip
}