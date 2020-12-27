import TextOp, { TextOpType } from './TextOp';
import { assert } from './utils';

export default class TextOperation {
  ops: TextOp[];
  baseLength: number;
  targetLength: number;
  meta?: Record<string, any>;

  constructor() {
    // When an operation is applied to an input string, you can think of this as
    // if an imaginary cursor runs over the entire string and skips over some
    // parts, deletes some parts and inserts characters at some positions. These
    // actions (skip/delete/insert) are stored as an array in the "ops" property.
    this.ops = [];

    // An operation's baseLength is the length of every string the operation
    // can be applied to.
    this.baseLength = 0;

    // The targetLength is the length of every string that results from applying
    // the operation on a valid input string.
    this.targetLength = 0;
  }

  equals(other: TextOperation) {
    if (this.baseLength !== other.baseLength) {
      return false;
    }
    if (this.targetLength !== other.targetLength) {
      return false;
    }
    if (this.ops.length !== other.ops.length) {
      return false;
    }
    for (let i = 0; i < this.ops.length; i++) {
      if (!this.ops[i].equals(other.ops[i])) {
        return false;
      }
    }
    return true;
  }

  // After an operation is constructed, the user of the library can specify the
  // actions of an operation (skip/insert/delete) with these three builder
  // methods. They all return the operation for convenient chaining.

  // Skip over a given number of characters.
  retain(n: number, attributes = {}) {
    if (typeof n !== 'number' || n < 0) {
      throw new Error('retain expects a positive integer.');
    }

    if (n === 0) {
      return this;
    }

    this.baseLength += n;
    this.targetLength += n;
    const prevOp = this.ops.length > 0 ? this.ops[this.ops.length - 1] : null;
    if (prevOp && prevOp.isRetain() && prevOp.attributesEqual(attributes)) {
      // The last op is a retain op with the same attributes => we can merge them into one op.
      prevOp.chars! += n;
    } else {
      // Create a new op.
      this.ops.push(new TextOp(TextOpType.retain, n, attributes));
    }

    return this;
  }

  // Insert a string at the current position.
  insert(str: string, attributes = {}) {
    if (typeof str !== 'string') {
      throw new Error('insert expects a string');
    }

    if (str === '') {
      return this;
    }

    this.targetLength += str.length;
    const prevOp = this.ops.length > 0 ? this.ops[this.ops.length - 1] : null;
    const prevPrevOp =
      this.ops.length > 1 ? this.ops[this.ops.length - 2] : null;
    if (prevOp && prevOp.isInsert() && prevOp.attributesEqual(attributes)) {
      // The last op is an insert op with the same attributes => we can merge them into one op.
      prevOp.text += str;
    } else if (prevOp && prevOp.isDelete()) {
      // It doesn't matter when an operation is applied whether the operation
      // is delete(3), insert("something") or insert("something"), delete(3).
      // Here we enforce that in this case, the insert op always comes first.
      // This makes all operations that have the same effect when applied to
      // a document of the right length equal in respect to the `equals` method.

      // insert("something"), delete(3), insert("else") --> insert("somethingelse"), delete(3)
      if (
        prevPrevOp &&
        prevPrevOp.isInsert() &&
        prevPrevOp.attributesEqual(attributes)
      ) {
        prevPrevOp.text += str;
      } else {
        // delete(3), insert("something") --> insert("something"), delete(3)
        this.ops[this.ops.length - 1] = new TextOp(
          TextOpType.insert,
          str,
          attributes
        );
        this.ops.push(prevOp);
      }
    } else {
      this.ops.push(new TextOp(TextOpType.insert, str, attributes));
    }
    return this;
  }

  // Delete a string at the current position.
  delete(n: number | string) {
    if (typeof n === 'string') {
      n = n.length;
    }

    if (typeof n !== 'number' || n < 0) {
      throw new Error('delete expects a positive integer or a string');
    }

    if (n === 0) {
      return this;
    }

    this.baseLength += n;
    const prevOp = this.ops.length > 0 ? this.ops[this.ops.length - 1] : null;
    if (prevOp && prevOp.isDelete()) {
      prevOp.chars! += n;
    } else {
      // The last op is a delete op with the same attributes => we can merge them into one op.
      this.ops.push(new TextOp(TextOpType.delete, n));
    }
    return this;
  }

  isNoop() {
    return (
      this.ops.length === 0 ||
      (this.ops.length === 1 &&
        this.ops[0].isRetain() &&
        this.ops[0].hasEmptyAttributes())
    );
  }

  clone() {
    const clone = new TextOperation();
    for (let i = 0; i < this.ops.length; i++) {
      if (this.ops[i].isRetain()) {
        clone.retain(this.ops[i].chars!, this.ops[i].attributes);
      } else if (this.ops[i].isInsert()) {
        clone.insert(this.ops[i].text!, this.ops[i].attributes);
      } else {
        clone.delete(this.ops[i].chars!);
      }
    }

    return clone;
  }

  // Pretty printing.
  toString() {
    return this.ops
      .map(op => {
        if (op.isRetain()) {
          return `retain ${op.chars}`;
        }

        if (op.isInsert()) {
          return `insert '${op.text}'`;
        }

        return `delete ${op.chars}`;
      })
      .join(', ');
  }

  // Converts operation into a JSON value.
  toJSON() {
    const ops = [];
    for (let i = 0; i < this.ops.length; i++) {
      // We prefix ops with their attributes if non-empty.
      if (!this.ops[i].hasEmptyAttributes()) {
        ops.push(this.ops[i].attributes);
      }
      if (this.ops[i].type === 'retain') {
        ops.push(this.ops[i].chars);
      } else if (this.ops[i].type === 'insert') {
        ops.push(this.ops[i].text);
      } else if (this.ops[i].type === 'delete') {
        ops.push(-this.ops[i].chars!);
      }
    }

    return ops;
  }

  static fromJSON(ops: (number | string | object | null)[]) {
    const o = new TextOperation();
    for (let i = 0, l = ops.length; i < l; i++) {
      let op = ops[i];
      let attributes = {};
      if (!!op && typeof op === 'object') {
        attributes = op;
        i++;
        op = ops[i];
      }

      if (typeof op === 'number') {
        if (op > 0) {
          o.retain(op, attributes);
        } else {
          o.delete(-op);
        }
      } else {
        assert(!!op && typeof op === 'string');
        o.insert(op as string, attributes);
      }
    }
    return o;
  }

  // Apply an operation to a string, returning a new string. Throws an error if
  // there's a mismatch between the input string and the operation.
  apply(
    str: string,
    oldAttributes?: TextOp['attributes'][],
    newAttributes?: TextOp['attributes'][]
  ) {
    const operation = this;
    oldAttributes = oldAttributes || [];
    newAttributes = newAttributes || [];

    if (str.length !== operation.baseLength) {
      throw new Error(
        "The operation's base length must be equal to the string's length."
      );
    }

    const newStringParts = [];
    let j = 0;
    let k;
    let attr;
    let oldIndex = 0;

    const ops = this.ops;
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i];
      if (op.isRetain()) {
        if (oldIndex + op.chars! > str.length) {
          throw new Error(
            "Operation can't retain more characters than are left in the string."
          );
        }
        // Copy skipped part of the retained string.
        newStringParts[j++] = str.slice(oldIndex, oldIndex + op.chars!);

        // TODO: simpify with Object.assign
        // Copy (and potentially update) attributes for each char in retained string.
        for (k = 0; k < op.chars!; k++) {
          const currAttributes = oldAttributes[oldIndex + k] || {};
          const updatedAttributes: TextOp['attributes'] = {};
          for (attr in currAttributes) {
            updatedAttributes[attr] = currAttributes[attr];
            assert(updatedAttributes[attr] !== false);
          }

          for (attr in op.attributes) {
            if (op.attributes[attr] === false) {
              delete updatedAttributes[attr];
            } else {
              updatedAttributes[attr] = op.attributes[attr];
            }
            assert(updatedAttributes[attr] !== false);
          }
          newAttributes.push(updatedAttributes);
        }

        oldIndex += op.chars!;
      } else if (op.isInsert()) {
        // Insert string.
        newStringParts[j++] = op.text;

        // Insert attributes for each char.
        for (k = 0; k < op.text!.length; k++) {
          const insertedAttributes: TextOp['attributes'] = {};
          for (attr in op.attributes) {
            insertedAttributes[attr] = op.attributes[attr];
            assert(insertedAttributes[attr] !== false);
          }
          newAttributes.push(insertedAttributes);
        }
      } else {
        // delete op
        oldIndex += op.chars!;
      }
    }
    if (oldIndex !== str.length) {
      throw new Error("The operation didn't operate on the whole string.");
    }
    const newString = newStringParts.join('');
    assert(newString.length === newAttributes.length);

    return newString;
  }

  // Computes the inverse of an operation. The inverse of an operation is the
  // operation that reverts the effects of the operation, e.g. when you have an
  // operation 'insert("hello "); retain(6);' then the inverse is 'delete("hello ");
  // retain(6);'. The inverse should be used for implementing undo.
  invert(str: string) {
    let strIndex = 0;
    const inverse = new TextOperation();
    const ops = this.ops;
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i];
      if (op.isRetain()) {
        inverse.retain(op.chars!);
        strIndex += op.chars!;
      } else if (op.isInsert()) {
        inverse.delete(op.text!.length);
      } else {
        // delete op
        inverse.insert(str.slice(strIndex, strIndex + op.chars!));
        strIndex += op.chars!;
      }
    }
    return inverse;
  }

  // Compose merges two consecutive operations into one operation, that
  // preserves the changes of both. Or, in other words, for each input string S
  // and a pair of consecutive operations A and B,
  // apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.
  compose(operation2: TextOperation) {
    const operation1 = this;
    if (operation1.targetLength !== operation2.baseLength) {
      throw new Error(
        'The base length of the second operation has to be the target length of the first operation'
      );
    }

    // TODO: simplify with Object.assign
    function composeAttributes(
      first: TextOp['attributes'],
      second: TextOp['attributes'],
      firstOpIsInsert?: boolean
    ) {
      const merged: TextOp['attributes'] = {};
      let attr;
      for (attr in first) {
        merged[attr] = first[attr];
      }
      for (attr in second) {
        if (firstOpIsInsert && second[attr] === false) {
          delete merged[attr];
        } else {
          merged[attr] = second[attr];
        }
      }
      return merged;
    }

    const operation = new TextOperation(); // the combined operation
    const ops1 = operation1.clone().ops;
    const ops2 = operation2.clone().ops;

    let i1 = 0;
    let i2 = 0; // current index into ops1 respectively ops2

    let op1 = ops1[i1++];
    let op2 = ops2[i2++]; // current ops

    let attributes;

    while (true) {
      // eslint-disable-line no-constant-condition
      // Dispatch on the type of op1 and op2
      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      // delete overrides all
      if (op1 && op1.isDelete()) {
        operation.delete(op1.chars!);
        op1 = ops1[i1++];
        continue; // eslint-disable-line no-continue
      }

      // second insert overrides all after op1 deletes
      if (op2 && op2.isInsert()) {
        operation.insert(op2.text!, op2.attributes);
        op2 = ops2[i2++];
        continue; // eslint-disable-line no-continue
      }

      if (typeof op1 === 'undefined') {
        throw new Error(
          'Cannot compose operations: first operation is too short.'
        );
      }

      if (typeof op2 === 'undefined') {
        throw new Error(
          'Cannot compose operations: first operation is too long.'
        );
      }

      // 3rd priority -- everything else
      // Both retain
      if (op1.isRetain() && op2.isRetain()) {
        attributes = composeAttributes(op1.attributes, op2.attributes);
        // apply shorter of the 2 retains
        // increment operation from the shorter and keep the remainder
        if (op1.chars! > op2.chars!) {
          operation.retain(op2.chars!, attributes);
          op1.chars! -= op2.chars!;
          op2 = ops2[i2++];
        } else if (op1.chars === op2.chars) {
          operation.retain(op1.chars!, attributes);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation.retain(op1.chars!, attributes);
          op2.chars! -= op1.chars!;
          op1 = ops1[i1++];
        }
      } else if (op1.isInsert() && op2.isDelete()) {
        if (op1.text!.length > op2.chars!) {
          // op1 inserts more than op2 deletes
          // shorten op1 insert and increment op2
          op1.text = op1.text!.slice(op2.chars!);
          op2 = ops2[i2++];
        } else if (op1.text!.length === op2.chars) {
          // cancel each other out
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          // op2 deletes more than op1 inserts
          // shorten op2 delete and increment op1
          op2.chars! -= op1.text!.length;
          op1 = ops1[i1++];
        }
      } else if (op1.isInsert() && op2.isRetain()) {
        attributes = composeAttributes(op1.attributes, op2.attributes, true);
        // op1 insert overrides retain
        if (op1.text!.length > op2.chars!) {
          operation.insert(op1.text!.slice(0, op2.chars!), attributes);
          op1.text = op1.text!.slice(op2.chars!);
          op2 = ops2[i2++];
        } else if (op1.text!.length === op2.chars) {
          // op1 insert overrides retain
          operation.insert(op1.text!, attributes);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          // op1 insert overrides retain, but we have more retain to go
          operation.insert(op1.text!, attributes);
          op2.chars! -= op1.text!.length;
          op1 = ops1[i1++];
        }
      } else if (op1.isRetain() && op2.isDelete()) {
        // op2 deletes chars retained in op1
        if (op1.chars! > op2.chars!) {
          // op2 deletes some chars retained in op1, but we have more retaining to go
          operation.delete(op2.chars!);
          op1.chars! -= op2.chars!;
          op2 = ops2[i2++];
        } else if (op1.chars === op2.chars) {
          operation.delete(op2.chars!);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          // op2 deletes chars retained in op1, and we have more deleting to go
          operation.delete(op1.chars!);
          op2.chars! -= op1.chars!;
          op1 = ops1[i1++];
        }
      } else {
        throw new Error(
          `This shouldn't happen: op1: ${JSON.stringify(
            op1
          )}, op2: ${JSON.stringify(op2)}`
        );
      }
    }

    return operation;
  }

  static getSimpleOp(operation: TextOperation) {
    const ops = operation.ops;
    switch (
      ops.length // eslint-disable-line default-case
    ) {
      case 1:
        return ops[0];
      case 2:
        return ops[0].isRetain() ? ops[1] : ops[1].isRetain() ? ops[0] : null;
      case 3:
        if (ops[0].isRetain() && ops[2].isRetain()) {
          return ops[1];
        }
    }

    return null;
  }

  static getStartIndex(operation: TextOperation) {
    if (operation.ops[0].isRetain()) {
      return operation.ops[0].chars!;
    }
    return 0;
  }

  // When you use ctrl-z to undo your latest changes, you expect the program not
  // to undo every single keystroke but to undo your last sentence you wrote at
  // a stretch or the deletion you did by holding the backspace key down.
  // This can be implemented by composing operations on the undo stack. This
  // method can help decide whether two operations should be composed. It
  // returns true if the operations are consecutive insert operations or both
  // operations delete text at the same position. You may want to include other
  // factors like the time since the last change in your decision.
  shouldBeComposedWith(other: TextOperation) {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = TextOperation.getStartIndex(this);
    const startB = TextOperation.getStartIndex(other);
    const simpleA = TextOperation.getSimpleOp(this);
    const simpleB = TextOperation.getSimpleOp(other);

    if (!simpleA || !simpleB) {
      return false;
    }

    // progressive inserts
    if (simpleA.isInsert() && simpleB.isInsert()) {
      return startA + simpleA.text!.length === startB;
    }

    // consecutive deletes
    if (simpleA.isDelete() && simpleB.isDelete()) {
      // there are two possibilities to delete: with backspace and with the
      // delete key.
      return startB + simpleB.chars! === startA || startA === startB;
    }

    return false;
  }

  // Decides whether two operations should be composed with each other
  // if they were inverted, that is
  // `shouldBeComposedWith(a, b) = shouldBeComposedWithInverted(b^{-1}, a^{-1})`.
  shouldBeComposedWithInverted(other: TextOperation) {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = TextOperation.getStartIndex(this);
    const startB = TextOperation.getStartIndex(other);
    const simpleA = TextOperation.getSimpleOp(this);
    const simpleB = TextOperation.getSimpleOp(other);

    if (!simpleA || !simpleB) {
      return false;
    }

    if (simpleA.isInsert() && simpleB.isInsert()) {
      return startA + simpleA.text!.length === startB || startA === startB;
    }

    if (simpleA.isDelete() && simpleB.isDelete()) {
      return startB + simpleB.chars! === startA;
    }

    return false;
  }

  static transformAttributes(
    attributes1: TextOp['attributes'],
    attributes2: TextOp['attributes']
  ) {
    const attributes1prime: TextOp['attributes'] = {};
    const attributes2prime: TextOp['attributes'] = {};
    let attr;
    const allAttrs: TextOp['attributes'] = {};

    // TODO: simplify with Object.assign
    for (attr in attributes1) {
      allAttrs[attr] = true;
    }
    for (attr in attributes2) {
      allAttrs[attr] = true;
    }

    for (attr in allAttrs) {
      const attr1 = attributes1[attr];
      const attr2 = attributes2[attr];
      assert(attr1 != null || attr2 != null);
      if (attr1 == null) {
        // Only modified by attributes2; keep it.
        attributes2prime[attr] = attr2;
      } else if (attr2 == null) {
        // only modified by attributes1; keep it
        attributes1prime[attr] = attr1;
      } else if (attr1 === attr2) {
        // Both set it to the same value.  Nothing to do.
      } else {
        // attr1 and attr2 are different. Prefer attr1.
        attributes1prime[attr] = attr1;
      }
    }

    return [attributes1prime, attributes2prime];
  }

  // Transform takes two operations A and B that happened concurrently and
  // produces two operations A' and B' (in an array) such that
  // `apply(apply(S, A), B') = apply(apply(S, B), A')`. This function is the
  // heart of OT.
  static transform(operation1: TextOperation, operation2: TextOperation) {
    if (operation1.baseLength !== operation2.baseLength) {
      throw new Error('Both operations have to have the same base length');
    }

    const operation1prime = new TextOperation();
    const operation2prime = new TextOperation();
    const ops1 = operation1.clone().ops;
    const ops2 = operation2.clone().ops;
    let i1 = 0;
    let i2 = 0;
    let op1 = ops1[i1++];
    let op2 = ops2[i2++];
    while (true) {
      // eslint-disable-line no-constant-condition
      // At every iteration of the loop, the imaginary cursor that both
      // operation1 and operation2 have that operates on the input string must
      // have the same position in the input string.

      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      // next two cases: one or both ops are insert ops
      // => insert the string in the corresponding prime operation, skip it in
      // the other one. If both op1 and op2 are insert ops, prefer op1.
      // this means insert op1 then insert op2
      // e.g. str = 'got', we are at retain(2) for both:
      // op1 = insert('a') -> 'goa' no matter what
      // op2 = insert('!') -> 'goat!'
      // if op2 is delete(1), just retain and apply later so we don't overwrite 'a' -> 'goa'
      if (op1 && op1.isInsert()) {
        operation1prime.insert(op1.text!, op1.attributes);
        operation2prime.retain(op1.text!.length);
        op1 = ops1[i1++];
        continue; // eslint-disable-line no-continue
      }
      if (op2 && op2.isInsert()) {
        operation1prime.retain(op2.text!.length);
        operation2prime.insert(op2.text!, op2.attributes);
        op2 = ops2[i2++];
        continue; // eslint-disable-line no-continue
      }

      if (typeof op1 === 'undefined') {
        throw new Error(
          'Cannot transform operations: first operation is too short.'
        );
      }
      if (typeof op2 === 'undefined') {
        throw new Error(
          'Cannot transform operations: first operation is too long.'
        );
      }

      let minl;
      if (op1.isRetain() && op2.isRetain()) {
        // Simple case: retain/retain
        // just advance forward by min retain
        // keep remainder for next retain
        const attributesPrime = TextOperation.transformAttributes(
          op1.attributes,
          op2.attributes
        );
        if (op1.chars! > op2.chars!) {
          minl = op2.chars;
          op1.chars! -= op2.chars!;
          op2 = ops2[i2++];
        } else if (op1.chars === op2.chars) {
          minl = op2.chars;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1.chars;
          op2.chars! -= op1.chars!;
          op1 = ops1[i1++];
        }

        operation1prime.retain(minl!, attributesPrime[0]);
        operation2prime.retain(minl!, attributesPrime[1]);
      } else if (op1.isDelete() && op2.isDelete()) {
        // Both operations delete the same string at the same position. We don't
        // need to produce any operations, we just skip over the delete ops and
        // handle the case that one operation deletes more than the other.
        if (op1.chars! > op2.chars!) {
          op1.chars! -= op2.chars!;
          op2 = ops2[i2++];
        } else if (op1.chars === op2.chars) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2.chars! -= op1.chars!;
          op1 = ops1[i1++];
        }
        // next two cases: delete/retain and retain/delete
        // op1 delete up to max op2 retains, keep remainder for next op test
      } else if (op1.isDelete() && op2.isRetain()) {
        if (op1.chars! > op2.chars!) {
          minl = op2.chars;
          op1.chars! -= op2.chars!;
          op2 = ops2[i2++];
        } else if (op1.chars === op2.chars) {
          minl = op2.chars;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          // op1 delete all, keep remainder of op2 retain for next op test
          minl = op1.chars;
          op2.chars! -= op1.chars!;
          op1 = ops1[i1++];
        }
        operation1prime.delete(minl!);
        // same in reverse
      } else if (op1.isRetain() && op2.isDelete()) {
        if (op1.chars! > op2.chars!) {
          minl = op2.chars;
          op1.chars! -= op2.chars!;
          op2 = ops2[i2++];
        } else if (op1.chars === op2.chars) {
          minl = op1.chars;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1.chars;
          op2.chars! -= op1.chars!;
          op1 = ops1[i1++];
        }
        operation2prime.delete(minl!);
      } else {
        throw new Error("The two operations aren't compatible");
      }
    }

    return [operation1prime, operation2prime];
  }

  // convenience method to write transform(a, b) as a.transform(b)
  transform(other: TextOperation) {
    return TextOperation.transform(this, other);
  }
}
