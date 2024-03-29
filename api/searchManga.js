const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const router = express.Router()
const { url } = require('../const')

async function search(name) {
  const data = []
  const no = 1

  try {
    await axios
      .get(`${url}?s=${name}`, {
        headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
      })
      .then((response) => {
        const html_data = response.data
        const $ = cheerio.load(html_data)
        const selectedElement = '.animposx'
        $(selectedElement).each((index, el) => {
          const img = $(el).find('img').attr('src')
          data.push({
            no: index + no,
            title: $(el).find('.tt').find('h4').text(),
            href: $(el)
              .find('a')
              .attr('href')
              .replace('https://komikcast.net/komik', ''),
            img: img.replace('?resize=165,225', ''),
          })
        })
      })
    return data
  } catch (error) {
    return error
  }
}

router.get('/:name', async (req, res) => {
  const data = await search(req.params.name)
  try {
    res.json({
      status: 200,
      result: data,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send('server error')
  }
})

module.exports = router
