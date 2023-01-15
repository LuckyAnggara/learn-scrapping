const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const router = express.Router()
const { url } = require('../const')

async function detail(link) {
  const data = {}
  try {
    await axios
      .get(`${url}komik/${link}/`, {
        headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
      })
      .then((response) => {
        const html_data = response.data
        const $ = cheerio.load(html_data)

        const img = $('.thumb img').attr('src').replace('?resize=214,315', '')
        const rating = $('.archiveanime-rating').find('i').text()
        // const detailRilis = []

        //DETAIL RILIS
        // $('.infotable tr').each((a, b) => {})

        const desc = $('p').text()
        // const title = $('.entry-title').text()
        // const titleAlternative = $('.alternative').text()
        //GENRE
        // const genre = []
        const chapter = []

        //GENRE
        // $('.seriestugenre a').each((a, b) => {
        //   genre.push({
        //     name: $(b).text(),
        //     href: $(b).attr('href').replace('https://mangakyo.id/', ''),
        //   })
        // })

        //CHAPTER
        $('#chapter_list li').each((a, b) => {
          chapter.push({
            name: $(b).find('a').find('chapter').text(),
            href: $(b).find('a').attr('href').replace(url, ''),
          })
        })
        data.detail = {
          img: img,
          rating: rating,
          // detailRilis: detailRilis,
        }
        data.desc = desc
        // data.title = {
        //   original: title.replace('Komik ', ''),
        //   alternative: titleAlternative,
        // }
        // data.genre = genre
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
