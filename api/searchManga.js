const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const router = express.Router()

async function search(name) {
  const data = []
  const no = 1
  const url = `https://mangakyo.id/?s=${name}`

  try {
    await axios
      .get(url, {
        headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
      })
      .then((response) => {
        const html_data = response.data
        const $ = cheerio.load(html_data)
        const selectedElement = '.bsx'
        $(selectedElement).each((index, el) => {
          const body = $(el).find('a')
          const lastChapter = $(el).find('.epxs').text()
          const img = $(el).find('img').attr('src').replace('?resize=165,225', '')

          data.push({
            no: index + no,
            title: body.attr('title'),
            href: body.attr('href').replace('https://mangakyo.id/komik', ''),
            img: img,
            lastChapter: lastChapter,
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
