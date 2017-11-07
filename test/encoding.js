import test from 'ava'
import PyMarshal from '..'
// import dump from 'buffer-hexdump';

function roundTrip(obj) {
  const buffer = PyMarshal.writeToBuffer(obj)
  // console.log(dump(buffer));
  const output = PyMarshal.readFromBuffer(buffer)
  return output
}

test('writeToBuffer', t => {
  const input = {foo: true}
  const output = PyMarshal.writeToBuffer(input)
  t.true(output instanceof Buffer)
})

test('readFromBuffer', t => {
  /* same as roundTrip() - but worth doing as a proof */
  const input = {foo: true}
  const buffer = PyMarshal.writeToBuffer(input)
  const output = PyMarshal.readFromBuffer(buffer)
  t.deepEqual(output, input)
})

test('scalar-number', t => {
  const input = 1
  t.deepEqual(roundTrip(input), input)
})

test('scalar-boolean', t => {
  const input = true
  t.deepEqual(roundTrip(input), input)
})

test('scalar-string', t => {
  const input = "foo"
  t.deepEqual(roundTrip(input), input)
})

test('scalar-null', t => {
  const input = null
  t.deepEqual(roundTrip(input), input)
})

test('scalar-undefined', t => {
  // should map to null
  const input = undefined
  const output = null
  t.deepEqual(roundTrip(input), null)
})

test('numbers', t => {
  const input = {
    zero: 0,
    one: 1,
    answer: 42,
    pi: 3.14,
    less: -42,
    large: 1 << 40,
  }
  t.deepEqual(roundTrip(input), input)
})

test('strings', t => {
  const input = {
    foo: "foo",
    empty: "",
    big: 'foobar'.repeat(1024),
    unicode: "foo\u{E0B0}bar",
  }
  t.deepEqual(roundTrip(input), input)
})

test('mixed', t => {
  const input = {
    string: "foo",
    null: null,
    bool: true,
    number: 3.14
  }
  t.deepEqual(roundTrip(input), input)
})

test('array', t => {
  const input = []
  t.deepEqual(roundTrip(input), input)
})

test('kitchen-sink', t => {
  const input = {
    foo: "bar",
    baz: [
      {bool: true, array: [true, false, 1, 3.14, "foobar", null]},
      ["foo", "bar", null],
      [[[[[5, [6, [7, {"foo": "bar"}]]]]]]]
    ]
  }
  t.deepEqual(roundTrip(input), input)
})

test('unsupported-py-type', t => {
  const input = Buffer.from([0x63, 0x00, 0x00])
  try {
    PyMarshal.readFromBuffer(input)
    t.fail()
  } catch(e) {
    t.pass()
  }
})

test('unsupported-js-type/symbol', t => {
  try {
    PyMarshal.writeToBuffer({symbol: Symbol})
    t.fail()
  } catch(e) {
    t.pass()
  }
})

test('unsupported-js-type/object', t => {
  const fun = function() {}
  const obj = new fun();
  try {
    PyMarshal.writeToBuffer({functionObject: obj})
    t.fail()
  } catch(e) {
    t.pass()
  }
})
