import test from 'ava'
import PyMarshal from '..'
import fs from 'fs'

const PICKLE_FILE = `${__dirname}/data/pickle.pyc`;
const expected = {
    "integer": 42,
    "string": "foobar",
    "other": "foobar",
    "falseBoolean": false,
    "trueBoolean": true,
    "object": {
        "key": "value",
        "string": "foobar",
    },
    "none": null,
    "unicode": "foobar",
    "list": [
        "one",
        {"two": "three"},
        ["four", 5, {"six": true}],
    ],
    "pi": 3.14,
    // "bignum": 17179869184.0,
}

test.cb('decode', t => {
  fs.readFile(PICKLE_FILE, (err, data) => {
    if (err) return t.end(err)
    const p = new PyMarshal(data)
    const obj = p.read()
    t.deepEqual(obj, expected)
    t.end()
  })
})
