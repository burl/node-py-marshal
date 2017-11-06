'use strict';

// python marshal format uses IEEE 754 64-bit float encoding
// 8-bytes and a 52-bit mantissa
const readFloat64 = require('ieee754').read;

// strings should be utf8-encoded
const STRING_ENCODING     = 'utf8';

// python marshal format types
const TYPE_NULL           = 0x30; // '0';
const TYPE_NONE           = 0x4e; // 'N';
const TYPE_FALSE          = 0x46; // 'F';
const TYPE_TRUE           = 0x54; // 'T';
const TYPE_STOPITER       = 0x53; // 'S';
const TYPE_ELLIPSIS       = 0x2e; // '.';
const TYPE_INT            = 0x69; // 'i';
const TYPE_INT64          = 0x49; // 'I';
const TYPE_FLOAT          = 0x66; // 'f';
const TYPE_BINARY_FLOAT   = 0x67; // 'g';
const TYPE_COMPLEX        = 'x';
const TYPE_BINARY_COMPLEX = 'y';
const TYPE_LONG           = 'l';
const TYPE_STRING         = 0x73; // 's';
const TYPE_INTERNED       = 0x74; // 't';
const TYPE_STRINGREF      = 0x52; // 'R';
const TYPE_TUPLE          = 0x28; // '(';
const TYPE_LIST           = 0x5b; // '[';
const TYPE_DICT           = 0x7b; // '{';
const TYPE_CODE           = 'c';
const TYPE_UNICODE        = 'u';
const TYPE_UNKNOWN        = '?';
const TYPE_SET            = '<';
const TYPE_FROZENSET      = 0x3e; // '>';

// for private data
const map = new WeakMap();

function isPlainObject(value) {
  if (value === undefined) return false;
  return Object.getPrototypeOf(value) === null || Object === value.constructor;
}

class PyMarshal {

  // create instance of class, pass buffer with serialized data
  // or buffer of concatenated serialized data, etc.
  constructor(buffer) {
    map.set(this, {
      buf: buffer,
      ptr: 0,
      tab: [],
    });
  }

  // static method for serializing data
  static writeToBuffer(obj) {
    const writer = new PyMarshal();
    return writer.write(obj);
  }

  // static method for deserializing data
  static readFromBuffer(buffer) {
    const reader = new PyMarshal(buffer);
    return reader.read();
  }

  // reference to buffer
  get buf() {
    return map.get(this).buf;
  }

  // current position in buffer parse stream
  get pos() {
    return map.get(this).ptr;
  }

  // length of buffer
  get len() {
    return this.buf.length;
  }

  // return true if there is more data in the buffer
  // (beyond the current position)
  get moreData() {
    return !!(this.pos < this.len);
  }


  // return current buffer position and advance position by #octets given
  advance(octets = 1) {
    const attr = map.get(this);
    const res = attr.ptr;
    attr.ptr += octets;
    return res;
  }

  // read the datatype of the current record
  // from the marshalled data in the buffer
  readType() {
    return this.buf.readInt8(this.advance());
  }

  // read unsigned 8-bit number from the buffer at current position
  readUInt8() {
    return this.buf.readUInt8(this.advance());
  }

  // read unsinged 32-bit number from the buffer at current position
  readUInt32() {
    return this.buf.readUInt32LE(this.advance(4));
  }

  // read signed 32-bit number from the buffer at current position
  readInt32() {
    return this.buf.readInt32LE(this.advance(4));
  }

  // read a buffer of len length from the buffer at current position
  readBuffer(len) {
    const pos = this.pos;
    const res = this.buf.slice(pos, pos+len);
    this.advance(len);
    return res;
  }

  // the python-marshalled type at current position in buffer is not supported
  // by this library at this time, or perhaps has no reasonable equivalent...
  _unsupported(type, len) {
    const pos = this.pos;
    const res = {};
    res['$' + type] = this.buf.slice(pos, pos+len).toString();
    this.advance(len);
    return res;
  }

  // read the contents of the buffer from the current position onward,
  // deserializing a single object or value and returning it.  If the
  // buffer was not all used, then repeated calls can be used to get
  // additional values
  read() {
    if ( ! this.moreData ) return undefined;
    const type = this.readType();
    switch(type) {
    case 0:
    case TYPE_NULL:
      return undefined;

    case TYPE_FALSE:
      return false;

    case TYPE_TRUE:
      return true;

    case TYPE_NONE:
      return null;

    case TYPE_ELLIPSIS:
      return this._unsupported('ELLIPSIS', 0);

    case TYPE_STOPITER:
      return this._unsupported('STOPITER', 0);

    case TYPE_INT:
      return this.readInt32();

    case TYPE_INT64:
      return this._unsupported('INT64', 8);

    case TYPE_BINARY_FLOAT:
      const floatValue = readFloat64(this.readBuffer(8), 0, true, 52, 8);
      return floatValue;

    case TYPE_FLOAT:
      const floatStrLen = this.readUInt8();
      const floatStr = this.readBuffer(floatStrLen).toString(STRING_ENCODING);
      return parseFloat(floatStr);

    case TYPE_STRINGREF:
      const strRef = this.readUInt32();
      const strEntry = map.get(this).tab[strRef];
      return strEntry;

    case TYPE_INTERNED:
    case TYPE_STRING:
      const strLen = this.readUInt32();
      const str = this.readBuffer(strLen).toString(STRING_ENCODING);
      if (type === TYPE_INTERNED) {
        map.get(this).tab.push(str);
      }
      return str;

    case TYPE_LIST:
    case TYPE_TUPLE:
    case TYPE_FROZENSET:
      const nitems = this.readUInt32();
      const resArray = [];
      for (let i = 0; i < nitems; i++) {
        resArray.push(this.read());
      }
      return resArray;

    case TYPE_DICT:
      const res = {};
      while(true) {
        const key = this.read();
        if (typeof key !== 'string') break;
        res[key] = this.read();
      }
      return res;

    default:
      throw new Error(`.read() unhandled type 0x${type.toString(16)}`);
    }
  }

  // return a buffer with the serialized/marshalled value of obj
  write(obj) {
    const type = typeof obj;
    switch(type) {
    case 'undefined':
      return Buffer.from([TYPE_NONE]);

    case 'object':
      if (obj === null) {
        return Buffer.from([TYPE_NONE]);
      }
      if (isPlainObject(obj)) {
        let buf = Buffer.from([TYPE_DICT]);
        for (const key of Object.keys(obj)) {
          buf = Buffer.concat([buf, this.write(key), this.write(obj[key])]);
        }
        return Buffer.concat([buf, Buffer.from([TYPE_NULL])]);
      }
      else if (Array.isArray(obj)) {
        let buf = Buffer.alloc(5);
        buf.writeUInt8(TYPE_LIST, 0);
        buf.writeUInt32LE(obj.length, 1);
        for (let i = 0; i < obj.length; i++) {
          buf = Buffer.concat([buf, this.write(obj[i])]);
        }
        return buf;
      } else {
        throw new Error(`unhandled kind of object ${JSON.stringify(obj)}`);
      }

    case 'string':
      const strLen = Buffer.byteLength(obj, STRING_ENCODING);
      const strBuf = Buffer.alloc(strLen + 5);
      strBuf.writeUInt8(TYPE_STRING, 0);
      strBuf.writeUInt32LE(strLen, 1);
      strBuf.write(obj, 5, STRING_ENCODING);
      return strBuf;

    case 'boolean':
      if (obj === true) return Buffer.from([TYPE_TRUE]);
      return Buffer.from([TYPE_FALSE]);

    case 'number':
      let nBuf;
      if (obj % 1 === 0) {
        // integer
        nBuf = Buffer.alloc(5);
        nBuf.writeUInt8(TYPE_INT, 0);
        nBuf.writeInt32LE(obj, 1);
      }
      else {
        let nStr = obj.toString();
        if (nStr.length > 254) {
          nStr = nStr.substr(0, 254);
        }
        nBuf = Buffer.alloc(2 + nStr.length);
        nBuf.writeUInt8(TYPE_FLOAT, 0);
        nBuf.writeUInt8(nStr.length, 1);
        nBuf.write(nStr, 2);
      }
      return nBuf;

    default:
      throw new Error(`.write() unhandled type ${type}`);
    }
  }
}

module.exports = PyMarshal;
