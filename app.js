const express = require('express')
const lastUpdate = require('./api/lastUpdate')
const detailManga = require('./api/detailManga')
const searchManga = require('./api/searchManga')
const readManga = require('./api/readManga')

const port = process.env.port || 3001

const app = express()

app.use('/api/last-update', lastUpdate)
app.use('/api/detail-manga/', detailManga)
app.use('/api/search-manga/', searchManga)
app.use('/api/read-manga/', readManga)

app.listen(port, () => {
  console.log(`Server Established and  running on Port ⚡${port}`)
})
