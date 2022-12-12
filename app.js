const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const puppeteer = require('puppeteer')

const port = process.env.port || 3000

const app = express()

async function getLastUpdate() {
  const data = []
  const no = 1
  const url = 'https://mangakyo.id/'

  try {
    await axios
      .get(url, {
        headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
      })
      .then((response) => {
        const html_data = response.data
        const $ = cheerio.load(html_data)
        const selectedElement = 'div.styletere'
        $(selectedElement).each((index, el) => {
          const lastUpdate = []

          const body = $(el).find('.tt').find('a')
          const img = $(el)
            .find('img.ts-post-image')
            .attr('data-src')
            .replace('?resize=165,225', '')

          $(el)
            .find('.chfiv')
            .find('a')
            .each((a, b) => {
              lastUpdate.push({
                chapter: $(b).text(),
                href: $(b).attr('href').replace('https://mangakyo.id', ''),
              })
            })

          data.push({
            no: index + no,
            title: body.attr('title'),
            href: body.attr('href').replace('https://mangakyo.id/komik', ''),
            img: img,
            lastUpdate: lastUpdate,
          })
        })
      })
    return data
  } catch (error) {
    return error
  }
}

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
          const img = $(el)
            .find('img')
            .attr('src')
            .replace('?resize=165,225', '')

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
        const infoLeft = $('.info-left')
        const infoRight = $('.info-right')

        const img = infoLeft.find('img').attr('data-src')
        const detailRilis = {}

        //DETAIL RILIS
        infoLeft.find('.imptdt').each((a, b) => {
          const d = $(b).text().replace('\n', '')
          detailRilis[d.split(' ')[0]] = d
        })

        const desc = infoRight.find('.entry-content').find('p').text()
        const title = infoRight.find('.entry-title').text()
        const titleAlternative = infoRight.find('.alternative').text()
        //GENRE
        const genre = []
        const chapter = []

        //GENRE
        infoRight.find('.mgen a').each((a, b) => {
          genre.push({ name: $(b).text(), href: $(b).attr('href') })
        })

        //CHAPTER
        $('#chapterlist li').each((a, b) => {
          chapter.push({
            name: $(b).attr('data-num'),
            href: $(b)
              .find('a')
              .attr('href')
              .replace('https://mangakyo.id', ''),
          })
        })
        data.detail = {
          img: infoLeft.find('img').attr('data-src'),
          rating: infoLeft.find('img').find('.num').text(),
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

async function read(link) {
  let data = {}
  const url = `https://mangakyo.id/${link}/`

  const browser = await puppeteer.launch({ headless: true })
  let page = await browser.newPage()
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
  )
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ts-main-image').then(() => console.log('loaded'))
  await page.screenshot({ path: 'screenshot.jpg' })
  let chapterImage = []
  const images = await page.$$('.ts-main-image')
  for (const image of images) {
    chapterImage.push(await image.evaluate((node) => node.getAttribute('src')))
  }

  data = chapterImage
  return data
}

app.get('/', async (req, res) => {
  try {
    const data = await getLastUpdate()
    return res.status(200).json({
      result: data,
    })
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    })
  }
})

app.get('/:name', async (req, res) => {
  try {
    const data = await search(req.params.name)
    return res.status(200).json({
      result: data,
    })
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    })
  }
})

app.get('/detail/:link', async (req, res) => {
  try {
    const data = await detail(req.params.link)
    return res.status(200).json({
      result: data,
    })
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    })
  }
})

app.get('/read/:link', async (req, res) => {
  try {
    const data = await read(req.params.link)
    return res.status(200).json({
      result: data,
    })
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    })
  }
})

app.listen(port, () => {
  console.log(`Server Established and  running on Port ⚡${port}`)
})
