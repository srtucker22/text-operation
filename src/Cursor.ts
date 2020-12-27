import { TextOperation } from ".";

export default class Cursor {
  position: number;
  selectionEnd: number;

  // A cursor has a `position` and a `selectionEnd`. Both are zero-based indexes
  // into the document. When nothing is selected, `selectionEnd` is equal to
  // `position`. When there is a selection, `position` is always the side of the
  // selection that would move if you pressed an arrow key.
  constructor(position: number, selectionEnd: number) {
    this.position = position;
    this.selectionEnd = selectionEnd;
  }

  static fromJSON(obj: {position: number; selectionEnd: number}) {
    return new Cursor(obj.position, obj.selectionEnd);
  }

  equals(other: Cursor) {
    return this.position === other.position &&
      this.selectionEnd === other.selectionEnd;
  }

  // Return the more current cursor information.
  compose(other: Cursor) {
    return other;
  }

  // Update the cursor with respect to an operation.
  transform(other: TextOperation) {
    function transformIndex(index: number) {
      let newIndex = index;
      const ops = other.ops;
      for (let i = 0, l = other.ops.length; i < l; i++) {
        if (ops[i].isRetain()) {
          index -= ops[i].chars!;
        } else if (ops[i].isInsert()) {
          newIndex += ops[i].text!.length;
        } else {
          newIndex -= Math.min(index, ops[i].chars!);
          index -= ops[i].chars!;
        }
        if (index < 0) { break; }
      }
      return newIndex;
    }

    const newPosition = transformIndex(this.position);
    if (this.position === this.selectionEnd) {
      return new Cursor(newPosition, newPosition);
    }
    return new Cursor(newPosition, transformIndex(this.selectionEnd));
  }
}
