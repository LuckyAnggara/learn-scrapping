const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const router = express.Router()

async function detail(link) {
  const data = {}
  const url = `https://mangakyo.id/=${link}/`
  try {
    await axios
      .get(url, {
        headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
      })
      .then((response) => {
        const html_data = response.data
        const $ = cheerio.load(html_data)

        const img = $('.thumb').find('img').attr('src')
        const rating = $('.num').text()
        const detailRilis = []

        //DETAIL RILIS
        $('.infotable tr').each((a, b) => {
          detailRilis.push($(b).innerHtml)
        })

        const desc = $('.entry-content').find('p').text()
        const title = $('.entry-title').text()
        const titleAlternative = $('.alternative').text()
        //GENRE
        const genre = []
        const chapter = []

        //GENRE
        $('.seriestugenre a').each((a, b) => {
          genre.push({ name: $(b).text(), href: $(b).attr('href').replace('https://mangakyo.id/', '') })
        })

        //CHAPTER
        $('#chapterlist li').each((a, b) => {
          chapter.push({
            name: $(b).attr('data-num'),
            href: $(b).find('a').attr('href').replace('https://mangakyo.id', ''),
          })
        })
        data.detail = {
          img: img,
          rating: rating,
          detailRilis: detailRilis,
        }
        data.desc = desc
        data.title = {
          original: title.replace('Komik ', ''),
          alternative: titleAlternative,
        }
        data.genre = genre
        data.chapter = chapter
      })
    return data
  } catch (error) {
    return error
  }
}

router.get('/:link', async (req, res) => {
  try {
    const data = await detail(req.params.link)
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
