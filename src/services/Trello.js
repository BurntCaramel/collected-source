const axios = require('axios')
const Boom = require('boom')

async function fetchBoard({
  boardID
}) {
  const url = `https://api.trello.com/1/boards/${boardID}?lists=all&cards=all`
  const { data } = await axios.get(url)
    .catch(error => {
      throw Boom.boomify(error, { statusCode: error.response ? error.response.status : undefined })
    })
  
  return data
}

module.exports = {
  fetchBoard
}
