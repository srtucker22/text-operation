# text-operation [![Npm version](https://img.shields.io/npm/v/text-operation.svg)](https://www.npmjs.com/package/text-operation) [![Build Status](https://travis-ci.org/srtucker22/text-operation.svg?branch=master)](https://travis-ci.org/srtucker22/text-operation) [![Coverage Status](https://coveralls.io/repos/github/srtucker22/text-operation/badge.svg?branch=master)](https://coveralls.io/github/srtucker22/text-operation?branch=master)

## Classes for Rich Text Operations using Operational Transformation

* [Overview](#overview)
* [Installing](#installing)
* [Usage](#usage)
* [Contributing](#contributing)
* [Licence](#licence)

## Overview

This package is heavily based on [firepad](https://github.com/firebase/firepad)'s OT operations, which were in turn based on [ot.js](https://github.com/Operational-Transformation/ot.js/). Yay OSS!

This package is a conversion of their masterful work into ES6, and turned into an easy to use module.

## Installation

```bash
npm i -S text-operation
```

## Usage

The easiest way to get familiar with the `TextOperation` class is to check out [text-operation.utils.spec.js](test/text-operation.utils.spec.js)

The OT operations we allow are `retain` `insert` `delete`.
A single `TextOperation` will contain one or many of these operations, but must traverse exactly entire string for which they will be applied:

```javascript
import { TextOperation } from 'text-operation';

const testString = 'I am a test string';

const o = new TextOperation();
o.retain(2);
o.delete(2);
o.insert('was');
o.retain(14);
o.insert('!');

// apply operations to a string
console.log(o.apply(testString)); // I was a test string!

// composition example
const o2 = new TextOperation();
o2.retain(2);
o2.delete(3);
o2.insert('still am');
o2.retain(15);
o2.insert('!!');

const composed = o.compose(o2);
console.log(composed);
// TextOperation {
//   ops:
//    [ TextOp { type: 'retain', chars: 2, text: null, attributes: {} },
//      TextOp { type: 'insert', chars: null, text: 'still am', attributes: {} },
//      TextOp { type: 'delete', chars: 2, text: null, attributes: null },
//      TextOp { type: 'retain', chars: 14, text: null, attributes: {} },
//      TextOp { type: 'insert', chars: null, text: '!!!!', attributes: {} } ],
//   baseLength: 18,
//   targetLength: 28 }

console.log(composed.apply(testString)); // I still am a test string!!!

// transformation example
const simpleString = 'abcdef';

const op1 = new TextOperation();
const op2 = new TextOperation();

op1.retain(6).insert('ghijk');
op2.retain(3).delete(3);
const transformed = op1.transform(op2);
console.log(transformed[0].toJSON(), transformed[1].toJSON()); // [ 3, 'ghijk' ] [ 3, -3, 5 ]

console.log(transformed[1].apply(op1.apply(simpleString))); // abcghijk
```

## Contributing

This project welcomes code contributions, bug reports and feature requests. Please see the guidelines in [CONTRIBUTING.md](CONTRIBUTING.md) if you are interested in contributing.

## License

MIT License

Copyright (c) 2019 Simon Tucker

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
