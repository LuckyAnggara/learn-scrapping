const puppeteer = require('puppeteer')
const express = require('express')
const router = express.Router()

async function read(link) {
  let data = {}
  const url = `https://mangakyo.id/${link}/`

  const browser = await puppeteer.launch({ headless: true })
  let page = await browser.newPage()
  await page.setRequestInterception(true)

  // then we can add a call back which inspects every
  // outgoing request browser makes and decides whether to allow it
  page.on('request', (req) => {
    if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
      req.abort()
    } else {
      req.continue()
    }
  })

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36')
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ts-main-image').then(() => console.log('loaded'))
  let chapterImage = []
  const images = await page.$$('.ts-main-image')
  for (const image of images) {
    chapterImage.push(await image.evaluate((node) => node.getAttribute('src')))
  }

  data = chapterImage
  return data
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
