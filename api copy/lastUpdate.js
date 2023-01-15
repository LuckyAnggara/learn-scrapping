const express = require('express')
const puppeteer = require('puppeteer')
const router = express.Router()
// const chromium = require('chrome-aws-lambda')
const { chromium } = require('playwright')

// async function getLastUpdate() {
//   const data = []
//   const url = 'https://mangakyo.id/'

//   const browser = await puppeteer.launch({
//     args: chromium.args,
//     defaultViewport: chromium.defaultViewport,
//     executablePath: await chromium.executablePath,
//     headless: false,
//     ignoreHTTPSErrors: true,
//   })

//   const page = await browser.newPage()

//   await page.setRequestInterception(true)

//   // then we can add a call back which inspects every
//   // outgoing request browser makes and decides whether to allow it
//   page.on('request', (req) => {
//     if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
//       req.abort()
//     } else {
//       req.continue()
//     }
//   })

//   await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36')
//   await page.goto(url, { waitUntil: 'domcontentloaded' })

//   const mangas = await page.$$('.bs.styletere.stylefiv div.bsx')
//   for (const manga of mangas) {
//     data.push(
//       await manga.evaluate((node) => {
//         const lastUpdate = []
//         const updates = node.querySelector('.bigor .chfiv').querySelectorAll('li')

//         for (const update of updates) {
//           lastUpdate.push({
//             chapter: update.querySelector('a').innerText,
//             time: update.querySelector('span').innerText,
//             href: update.querySelector('a').getAttribute('href'),
//           })
//         }

//         return {
//           title: node.querySelector('a').getAttribute('title'),
//           href: node.querySelector('a').getAttribute('href').replace('https://mangakyo.id/komik', ''),
//           image: node.querySelector('a img').getAttribute('src'),
//           lastUpdate: lastUpdate,
//         }
//       })
//     )
//   }

//   return data
// }

async function getLastUpdate() {
  const data = []
  const url = 'https://mangakyo.id/'
  const browser = await chromium.launch({
    headless: true,
  })

  const context = await browser.newContext()
  // Open new page
  const page = await context.newPage()

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  return page

  const mangas = await page.$$('.bs.styletere.stylefiv div.bsx')
  for (const manga of mangas) {
    data.push(
      await manga.evaluate((node) => {
        const lastUpdate = []
        const updates = node.querySelector('.bigor .chfiv').querySelectorAll('li')

        for (const update of updates) {
          lastUpdate.push({
            chapter: update.querySelector('a').innerText,
            time: update.querySelector('span').innerText,
            href: update.querySelector('a').getAttribute('href'),
          })
        }

        return {
          title: node.querySelector('a').getAttribute('title'),
          href: node.querySelector('a').getAttribute('href').replace('https://mangakyo.id/komik', ''),
          image: node.querySelector('a img').getAttribute('src'),
          lastUpdate: lastUpdate,
        }
      })
    )
  }

  await context.close()
  await browser.close()

  return data
}

router.get('/', async (req, res) => {
  try {
    const data = await getLastUpdate()
    return res.json({
      status: 200,
      result: data,
    })
  } catch (error) {
    return res.status(500).json(error)
  }
})

module.exports = router
