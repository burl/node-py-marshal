import {runTest} from './fixtures'
import PyMarshal from '..'

runTest('happy-path', 'supported.pyc', (t, name, data) => {
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
  }
  const p = new PyMarshal(data)
  const obj = p.read()
  t.deepEqual(obj, expected)
  t.end()
})
