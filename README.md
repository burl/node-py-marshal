# py-marshal - python object serialize/deserialize for node

This package is designed to serialize / deserialize the python "internal" marshal format where there are JSON equivalent data types.

## Installation

```
yarn add py-marshal

# or

npm install py-marshal
```

## API

Include in your application / library and use the static convenience methos for reading and writing to /from buffers:

```javascript
const PyMarshal = require('py-marshal');

// javascript object to marshaled buffer:
const obj = {foo: bar, array: [1,true,"Three"]};
const buffer = PyMarshal.writeToBuffer(obj);

// buffer to javascript object
const data = PyMarshal.readFromBuffer(buffer);
```

Or, for reading a buffer of concatenated marshaled objects, you can create a decoder and call the read method until the buffer is exhausted:

```javascript
const PyMarshal = require('py-marshal');

// however you manage to get a buffer...
const buffer = GetABufferOfMarshaledDataSomehow();
const decoder = new PyMarshal(buffer);

while(decoder.MoreData) {
  const obj = decoder.read();
  DoSomethignWithData(obj); // use your data...
}
```

### new([buffer])

Create an instance of the PyMarshal class, intended for deserializing multiple objects.

### readFromBuffer(buffer)

Given a buffer containing python marshaled data, deserialize it and return the javascript-native data.

### writeToBuffer(object)

Given javascript-native data, return a buffer with the python marshaled representation of it.

## Datatype Support

Only a subset of the possible python types are supported (the simpler ones, which translate to JSON equivalents).

| Python Type     | JSON type | Notes                                           |
| --------------- | --------- | ----------------------------------------------- |
| Null            | undefined | (not a JSON type, but supported/useful)         |
| None            | null      |                                                 |
| Boolean         | boolean   |                                                 |
| Number: integer | Number    | 32-bit only, signed/unsigned                    |
| Number: float   | Number    | Only 32-bit IEEE754 (binary or string encoding) |
| string          | String    |                                                 |
| List            | Array     | also: Tuples and Sets                           |
| Dictionary      | Object    |                                                 |
|                 |           |                                                 |

All other python types that might be encoded are not supported.

## License

View the [LICENSE](https://github.com/burl/node-py-marshal/blob/master/LICENSE) file
(MIT).
