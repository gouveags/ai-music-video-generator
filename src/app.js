const express = require('express')

const app = express()

app.use(express.json())

app.post('/api', (req, res) => {
  console.log(req.body)
  res.send('hello world')
})

 const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
