import { assert } from './error.utils';

export default class TextOp {
  constructor(type, ...args) {
    this.type = type;
    this.chars = null;
    this.text = null;
    this.attributes = null;

    if (type === 'insert') {
      this.text = args[0];
      assert(typeof this.text === 'string');
      this.attributes = args[1] || {};
      assert(typeof this.attributes === 'object');
    } else if (type === 'delete') {
      this.chars = args[0];
      assert(typeof this.chars === 'number');
    } else if (type === 'retain') {
      this.chars = args[0];
      assert(typeof this.chars === 'number');
      this.attributes = args[1] || {};
      assert(typeof this.attributes === 'object');
    }
  }

  isInsert() { return this.type === 'insert'; }

  isDelete() { return this.type === 'delete'; }

  isRetain() { return this.type === 'retain'; }

  equals(other) {
    return (this.type === other.type
      && this.text === other.text
      && this.chars === other.chars
      && this.attributesEqual(other.attributes));
  }

  attributesEqual(otherAttributes) {
    if (!otherAttributes || !this.attributes) {
      return otherAttributes === this.attributes;
    }

    return Object.keys(this.attributes)
      .every(attr => this.attributes[attr] === otherAttributes[attr])
      && Object.keys(otherAttributes)
        .every(attr => this.attributes[attr] === otherAttributes[attr]);
  }

  hasEmptyAttributes() {
    let empty = true;
    for (const attr in this.attributes) {
      empty = false;
      break;
    }

    return empty;
  }
}
