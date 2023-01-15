const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const router = express.Router()
const { url } = require('../const')

async function read(link) {
  const data = []
  const no = 1

  try {
    await axios
      .get(`${url}${link}`, {
        headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
      })
      .then((response) => {
        const html_data = response.data
        const $ = cheerio.load(html_data)

        $('#chimg img').each((index, el) => {
          const img = $(el).attr('src')
          data.push(img)
        })
      })
    return data
  } catch (error) {
    return data
  }
}

router.get('/:link', async (req, res) => {
  try {
    const data = await read(req.params.link)
    return res.json({
      status: 200,
      result: data,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send('server error')
  }
})

module.exports = router
