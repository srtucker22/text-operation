import { assert } from './utils';

export enum TextOpType {
  insert = 'insert',
  delete = 'delete',
  retain = 'retain',
}

export default class TextOp {
  type: 'insert' | 'delete' | 'retain';
  chars: number | null;
  text: string | null;
  attributes: Record<string, any>;
  constructor(type: TextOp['type'], ...args: any) {
    this.type = type;
    this.chars = null;
    this.text = null;
    this.attributes = {};

    if (type === TextOpType.insert) {
      this.text = args[0];
      assert(typeof this.text === 'string');
      this.attributes = args[1] || {};
      assert(typeof this.attributes === 'object');
    } else if (type === TextOpType.delete) {
      this.chars = args[0];
      assert(typeof this.chars === 'number');
    } else if (type === TextOpType.retain) {
      this.chars = args[0];
      assert(typeof this.chars === 'number');
      this.attributes = args[1] || {};
      assert(typeof this.attributes === 'object');
    }
  }

  isInsert() {
    return this.type === TextOpType.insert;
  }

  isDelete() {
    return this.type === TextOpType.delete;
  }

  isRetain() {
    return this.type === TextOpType.retain;
  }

  equals(other: TextOp) {
    return (
      this.type === other.type &&
      this.text === other.text &&
      this.chars === other.chars &&
      this.attributesEqual(other.attributes)
    );
  }

  attributesEqual(otherAttributes: TextOp['attributes']) {
    if (!otherAttributes || !this.attributes) {
      return otherAttributes === this.attributes;
    }

    return (
      Object.keys(this.attributes).every(
        attr => this.attributes?.[attr] === otherAttributes[attr]
      ) &&
      Object.keys(otherAttributes).every(
        attr => this.attributes?.[attr] === otherAttributes[attr]
      )
    );
  }

  hasEmptyAttributes() {
    let empty = true;
    for (const _ in this.attributes) {
      empty = false;
      break;
    }

    return empty;
  }
}
