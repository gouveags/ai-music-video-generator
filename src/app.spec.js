const express = require('express')
const request = require('supertest')
const chai = require('chai')
const expect = chai.expect

const app = express()

app.get('/hello', (req, res) => {
  res.send('Hello, World!')
})

describe('GET /hello', function () {
  it('should return Hello, World!', function (done) {
    request(app)
      .get('/hello')
      .expect('Content-Type', /text/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.text).to.equal('Hello, World!')
        done()
      })
  })
})
