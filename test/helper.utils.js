import TextOperation from '../src/text-operation.utils';

const attrNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const attrValues = [-4, 0, 10, 50, '0', '10', 'a', 'b', 'c', true, false];

export default class helpers {
  static randomInt(n) {
    return Math.floor(Math.random() * n);
  }

  static randomString(n) {
    let str = '';
    while (n--) {
      if (Math.random() < 0.15) {
        str += '\n';
      } else {
        const chr = helpers.randomInt(26) + 97;
        str += String.fromCharCode(chr);
      }
    }
    return str;
  }

  static randomAttributes(allowFalse) {
    const attributes = { };
    const count = helpers.randomInt(3);
    for (let i = 0; i < count; i++) {
      const name = attrNames[helpers.randomInt(attrNames.length)];
      const value = attrValues[helpers.randomInt(attrValues.length - (allowFalse ? 0 : 1))];
      attributes[name] = value;
    }

    return attributes;
  }

  static randomAttributesArray(n) {
    const attributes = Array(n);
    for (let i = 0; i < n; i++) {
      attributes[i] = helpers.randomAttributes();
    }
    return attributes;
  }

  static randomOperation(str, useAttributes) {
    const operation = new TextOperation();
    let left;
    while (true) {
      left = str.length - operation.baseLength;
      if (left === 0) { break; }
      const r = Math.random();
      const l = 1 + helpers.randomInt(Math.min(left - 1, 20));
      if (r < 0.2) {
        operation.insert(helpers.randomString(l), (useAttributes ? helpers.randomAttributes() : { }));
      } else if (r < 0.4) {
        operation.delete(l);
      } else {
        operation.retain(l, (useAttributes ? helpers.randomAttributes(/* allowFalse= */true) : { }));
      }
    }
    if (Math.random() < 0.3) {
      operation.insert(1 + helpers.randomString(10));
    }
    return operation;
  }

  // A random test generates random data to check some invariants. To increase
  // confidence in a random test, it is run repeatedly.
  static randomTest(n, fun) {
    return function () {
      while (n--) {
        fun();
      }
    };
  }

  static randomElement(arr) {
    return arr[helpers.randomInt(arr.length)];
  }
}
