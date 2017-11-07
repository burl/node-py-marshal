const test = require('ava')
const fs = require('fs')

function runTest(name, input, evaluate) {
  const file = `${__dirname}/../data/${input}`
  test.cb(name, t => {
    fs.readFile(file, (err, data) => {
      if (err) return t.end(err)
      evaluate(t, name, data);
    })
  })
}

module.exports = {
  runTest: runTest
}
