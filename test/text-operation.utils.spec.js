import TextOperation from '../src/text-operation.utils';
import TextOp from '../src/text-op.utils';
import helpers from './helper.utils';

describe('TextOperation', () => {
  const h = helpers;

  const n = 500;

  it('Lengths', () => {
    const o = new TextOperation();
    expect(0).toBe(o.baseLength);
    expect(0).toBe(o.targetLength);
    o.retain(5);
    expect(5).toBe(o.baseLength);
    expect(5).toBe(o.targetLength);
    o.insert('abc');
    expect(5).toBe(o.baseLength);
    expect(8).toBe(o.targetLength);
    o.retain(2);
    expect(7).toBe(o.baseLength);
    expect(10).toBe(o.targetLength);
    o.delete(2);
    expect(9).toBe(o.baseLength);
    expect(10).toBe(o.targetLength);
  });

  it('Chaining', () => {
    const o = new TextOperation()
      .retain(5)
      .retain(0)
      .insert('lorem')
      .insert('')
      .delete('abc')
      .delete(3)
      .delete(0)
      .delete('');
    expect(3).toBe(o.ops.length);
  });

  it('ChainingWithDifferentAttributes', () => {
    const o = new TextOperation()
      .retain(5)
      .retain(3, { a: 1 })
      .retain(0, { b: 2 })
      .insert('lorem', { c: 3 })
      .insert('ipsum', { d: 4 })
      .insert('', { e: 5 })
      .delete('abc')
      .delete(3)
      .delete(0)
      .delete('');
    expect(5).toBe(o.ops.length);
  });

  it('Apply', h.randomTest(n, () => {
    const str = h.randomString(50);
    const o = h.randomOperation(str);
    expect(str.length).toBe(o.baseLength);
    expect(o.apply(str).length).toBe(o.targetLength);
  }));

  it('ApplyWithAttributes', h.randomTest(n, () => {
    const str = h.randomString(50);
    const attributes = h.randomAttributesArray(50);
    const o = h.randomOperation(str, /* useAttributes= */true);
    expect(str.length).toBe(o.baseLength);
    const newAttributes = [];
    const newString = o.apply(str, attributes, newAttributes);
    expect(newString.length).toBe(o.targetLength);
    expect(newAttributes.length).toBe(newString.length);
  }));

  it('Invert', h.randomTest(n, () => {
    const str = h.randomString(50);
    const o = h.randomOperation(str);
    const p = o.invert(str);
    expect(o.baseLength).toBe(p.targetLength);
    expect(o.targetLength).toBe(p.baseLength);
    expect(p.apply(o.apply(str))).toBe(str);
  }));

  it('EmptyOps', () => {
    const o = new TextOperation();
    o.retain(0);
    o.insert('');
    o.delete('');
    expect(0).toBe(o.ops.length);
  });

  it('Equals', () => {
    const op1 = new TextOperation()
      .delete(1)
      .insert('lo')
      .retain(2)
      .retain(3);
    const op2 = new TextOperation()
      .delete(1)
      .insert('l')
      .insert('o')
      .retain(5);
    expect(op1.equals(op2)).toBe(true);
    op1.delete(1);
    op2.retain(1);
    expect(!op1.equals(op2)).toBe(true);
  });

  it('EqualsWithAttributes', () => {
    const op1 = new TextOperation()
      .delete(1)
      .insert('lo', { a: 1 })
      .insert('ab', { a: 1 })
      .insert('cd')
      .retain(2, { b: 2 })
      .retain(3, { b: 2 })
      .retain(3);
    const op2 = new TextOperation()
      .delete(1)
      .insert('loab', { a: 1 })
      .insert('cd')
      .retain(5, { b: 2 })
      .retain(3);
    expect(op1.equals(op2)).toBe(true);
  });

  it('OpsMerging', () => {
    function last(arr) { return arr[arr.length - 1]; }

    const o = new TextOperation();
    expect(0).toBe(o.ops.length);
    o.retain(2);
    expect(1).toBe(o.ops.length);
    expect(new TextOp('retain', 2)).toEqual(last(o.ops));
    o.retain(3);
    expect(1).toBe(o.ops.length);
    expect(new TextOp('retain', 5)).toEqual(last(o.ops));
    o.insert('abc');
    expect(2).toBe(o.ops.length);
    expect(new TextOp('insert', 'abc')).toEqual(last(o.ops));
    o.insert('xyz');
    expect(2).toBe(o.ops.length);
    expect(new TextOp('insert', 'abcxyz')).toEqual(last(o.ops));
    o.delete('d');
    expect(3).toBe(o.ops.length);
    expect(new TextOp('delete', 1)).toEqual(last(o.ops));
    o.delete('d');
    expect(3).toBe(o.ops.length);
    expect(new TextOp('delete', 2)).toEqual(last(o.ops));
  });

  it('OpsMergingWithAttributes', () => {
    function last(arr) { return arr[arr.length - 1]; }

    const o = new TextOperation();
    expect(0).toBe(o.ops.length);
    o.retain(2);
    expect(1).toBe(o.ops.length);
    expect(new TextOp('retain', 2)).toEqual(last(o.ops));
    o.retain(3);
    expect(1).toBe(o.ops.length);
    expect(new TextOp('retain', 5)).toEqual(last(o.ops));
    o.retain(4, { a: 1 });
    expect(2).toBe(o.ops.length);
    expect(new TextOp('retain', 4, { a: 1 })).toEqual(last(o.ops));
    o.retain(1, { a: 1 });
    expect(2).toBe(o.ops.length);
    expect(new TextOp('retain', 5, { a: 1 })).toEqual(last(o.ops));
    o.retain(2, { a: 1, b: 2 });
    expect(3).toBe(o.ops.length);
    expect(new TextOp('retain', 2, { a: 1, b: 2 })).toEqual(last(o.ops));
    o.insert('abc');
    expect(4).toBe(o.ops.length);
    expect(new TextOp('insert', 'abc')).toEqual(last(o.ops));
    o.insert('xyz');
    expect(4).toBe(o.ops.length);
    expect(new TextOp('insert', 'abcxyz')).toEqual(last(o.ops));
    o.insert('def', { b: 1 });
    expect(5).toBe(o.ops.length);
    expect(new TextOp('insert', 'def', { b: 1 })).toEqual(last(o.ops));
    o.insert('ghi', { b: 1 });
    expect(5).toBe(o.ops.length);
    expect(new TextOp('insert', 'defghi', { b: 1 })).toEqual(last(o.ops));
    o.delete('d');
    expect(6).toBe(o.ops.length);
    expect(new TextOp('delete', 1)).toEqual(last(o.ops));
    o.delete('d');
    expect(6).toBe(o.ops.length);
    expect(new TextOp('delete', 2)).toEqual(last(o.ops));
  });

  it('IsNoop', () => {
    const o = new TextOperation();
    expect(o.isNoop()).toBe(true);
    o.retain(5);
    expect(o.isNoop()).toBe(true);
    o.retain(3);
    expect(o.isNoop()).toBe(true);
    o.insert('lorem');
    expect(!o.isNoop()).toBe(true);
  });

  it('IsNoop', () => {
    const o = new TextOperation();
    expect(o.isNoop()).toBe(true);
    o.retain(5);
    expect(o.isNoop()).toBe(true);
    o.retain(3, { a: 1 });
    expect(!o.isNoop()).toBe(true);
  });

  it('ToString', () => {
    const o = new TextOperation();
    o.retain(2);
    o.insert('lorem');
    o.delete('ipsum');
    o.retain(5);
    expect(o.toString()).toBe("retain 2, insert 'lorem', delete 5, retain 5");
  });

  it('IdJSON', h.randomTest(n, () => {
    const doc = h.randomString(50);
    const operation = h.randomOperation(doc);
    expect(operation.equals(TextOperation.fromJSON(operation.toJSON()))).toBe(true);
  }));

  it('IdJSONWithAttributes', h.randomTest(n, () => {
    const doc = h.randomString(50);
    const operation = h.randomOperation(doc, /* useAttributes= */true);
    expect(operation.equals(TextOperation.fromJSON(operation.toJSON()))).toBe(true);
  }));

  it('FromJSON', () => {
    const ops = [2, -1, -1, 'cde'];
    const o = TextOperation.fromJSON(ops);
    expect(3).toBe(o.ops.length);
    expect(4).toBe(o.baseLength);
    expect(5).toBe(o.targetLength);

    function assertIncorrectAfter(fn) {
      const ops2 = ops.slice(0);
      fn(ops2);
      expect(() => { TextOperation.fromJSON(ops2); }).toThrow();
    }

    assertIncorrectAfter((ops2) => { ops2.push({ insert: 'x' }); });
    assertIncorrectAfter((ops2) => { ops2.push(null); });
  });

  it('FromJSONWithAttributes', () => {
    const ops = [2, { a: 1 }, 3, -1, -1, 'cde', { a: 2 }, 'fgh'];
    const o = TextOperation.fromJSON(ops);
    expect(5).toBe(o.ops.length);
    expect(7).toBe(o.baseLength);
    expect(11).toBe(o.targetLength);

    function assertIncorrectAfter(fn) {
      const ops2 = ops.slice(0);
      fn(ops2);
      expect(() => { TextOperation.fromJSON(ops2); }).toThrow();
    }

    assertIncorrectAfter((ops2) => { ops2.push({ insert: 'x' }); });
    assertIncorrectAfter((ops2) => { ops2.push(null); });
  });

  it('ShouldBeComposedWith', () => {
    function make() { return new TextOperation(); }
    let a;
    let b;

    a = make().retain(3);
    b = make().retain(1).insert('tag').retain(2);
    expect(a.shouldBeComposedWith(b)).toBe(true);
    expect(b.shouldBeComposedWith(a)).toBe(true);

    a = make().retain(1).insert('a').retain(2);
    b = make().retain(2).insert('b').retain(2);
    expect(a.shouldBeComposedWith(b)).toBe(true);
    a.delete(3);
    expect(!a.shouldBeComposedWith(b)).toBe(true);

    a = make().retain(1).insert('b').retain(2);
    b = make().retain(1).insert('a').retain(3);
    expect(!a.shouldBeComposedWith(b)).toBe(true);

    a = make().retain(4).delete(3).retain(10);
    b = make().retain(2).delete(2).retain(10);
    expect(a.shouldBeComposedWith(b)).toBe(true);
    b = make().retain(4).delete(7).retain(3);
    expect(a.shouldBeComposedWith(b)).toBe(true);
    b = make().retain(2).delete(9).retain(3);
    expect(!a.shouldBeComposedWith(b)).toBe(true);
  });

  it('ShouldBeComposedWithInverted', h.randomTest(2 * n, () => {
    // invariant: shouldBeComposedWith(a, b) = shouldBeComposedWithInverted(b^{-1}, a^{-1})
    const str = h.randomString();
    const a = h.randomOperation(str);
    const aInv = a.invert(str);
    const afterA = a.apply(str);
    const b = h.randomOperation(afterA);
    const bInv = b.invert(afterA);
    expect(a.shouldBeComposedWith(b)).toBe(bInv.shouldBeComposedWithInverted(aInv));
  }));

  it('Compose', h.randomTest(n, () => {
    // invariant: apply(str, compose(a, b)) === apply(apply(str, a), b)
    const str = h.randomString(20);
    const a = h.randomOperation(str);
    const afterA = a.apply(str);
    expect(a.targetLength).toBe(afterA.length);
    const b = h.randomOperation(afterA);
    const afterB = b.apply(afterA);
    expect(b.targetLength).toBe(afterB.length);
    const ab = a.compose(b);
    expect(ab.meta).toBe(a.meta);
    expect(ab.targetLength).toBe(b.targetLength);
    const afterAB = ab.apply(str);
    expect(afterB).toBe(afterAB);
  }));

  it('ComposeWithAttributes', h.randomTest(n, () => {
    // invariant: apply(str, compose(a, b)) === apply(apply(str, a), b)
    const str = h.randomString(20);
    const attributes = h.randomAttributesArray(20);
    const a = h.randomOperation(str, /* useAttributes= */true);
    const afterAattributes = [];
    const afterA = a.apply(str, attributes, afterAattributes);
    expect(a.targetLength).toBe(afterA.length);
    const b = h.randomOperation(afterA, /* useAttributes= */true);
    const afterBattributes = [];
    const afterB = b.apply(afterA, afterAattributes, afterBattributes);
    expect(b.targetLength).toBe(afterB.length);
    const ab = a.compose(b);
    expect(ab.meta).toBe(a.meta);
    expect(ab.targetLength).toBe(b.targetLength);
    const afterABattributes = [];
    const afterAB = ab.apply(str, attributes, afterABattributes);
    expect(afterB).toBe(afterAB);
    expect(afterBattributes).toEqual(afterABattributes);
  }));

  it('Transform', h.randomTest(n, () => {
    // invariant: compose(a, b') = compose(b, a')
    // where (a', b') = transform(a, b)
    const str = h.randomString(20);
    const a = h.randomOperation(str);
    const b = h.randomOperation(str);
    const primes = a.transform(b);
    const aPrime = primes[0];
    const bPrime = primes[1];
    const abPrime = a.compose(bPrime);
    const baPrime = b.compose(aPrime);
    const afterAbPrime = abPrime.apply(str);
    const afterBaPrime = baPrime.apply(str);
    expect(abPrime.equals(baPrime)).toBe(true);
    expect(afterAbPrime).toBe(afterBaPrime);
  }));

  it('TransformWithAttributes', h.randomTest(n, () => {
    // invariant: compose(a, b') = compose(b, a')
    // where (a', b') = transform(a, b)
    const str = h.randomString(20);
    const attributes = h.randomAttributesArray(20);
    const a = h.randomOperation(str, /* useAttributes= */true);
    const b = h.randomOperation(str, /* useAttributes= */true);
    const primes = a.transform(b);
    const aPrime = primes[0];
    const bPrime = primes[1];
    const abPrime = a.compose(bPrime);
    const baPrime = b.compose(aPrime);
    const afterABPrimeAttributes = [];
    const afterAbPrime = abPrime.apply(str, attributes, afterABPrimeAttributes);
    const afterBaPrimeAttributes = [];
    const afterBaPrime = baPrime.apply(str, attributes, afterBaPrimeAttributes);
    expect(abPrime.equals(baPrime)).toBe(true);
    expect(afterAbPrime).toBe(afterBaPrime);
    expect(afterABPrimeAttributes).toEqual(afterBaPrimeAttributes);
  }));
});
