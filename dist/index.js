/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var assert = exports.assert = function assert(b, msg) {
  if (!b) {
    throw new Error(msg || 'assertion error');
  }
};

exports.default = assert;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cursor = __webpack_require__(2);

Object.defineProperty(exports, 'Cursor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_cursor).default;
  }
});

var _textOperation = __webpack_require__(3);

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_textOperation).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cursor = function () {
  // A cursor has a `position` and a `selectionEnd`. Both are zero-based indexes
  // into the document. When nothing is selected, `selectionEnd` is equal to
  // `position`. When there is a selection, `position` is always the side of the
  // selection that would move if you pressed an arrow key.
  function Cursor(position, selectionEnd) {
    _classCallCheck(this, Cursor);

    this.position = position;
    this.selectionEnd = selectionEnd;
  }

  _createClass(Cursor, [{
    key: "equals",
    value: function equals(other) {
      return this.position === other.position && this.selectionEnd === other.selectionEnd;
    }

    // Return the more current cursor information.

  }, {
    key: "compose",
    value: function compose(other) {
      return other;
    }

    // Update the cursor with respect to an operation.

  }, {
    key: "transform",
    value: function transform(other) {
      function transformIndex(index) {
        var newIndex = index;
        var ops = other.ops;
        for (var i = 0, l = other.ops.length; i < l; i++) {
          if (ops[i].isRetain()) {
            index -= ops[i].chars;
          } else if (ops[i].isInsert()) {
            newIndex += ops[i].text.length;
          } else {
            newIndex -= Math.min(index, ops[i].chars);
            index -= ops[i].chars;
          }
          if (index < 0) {
            break;
          }
        }
        return newIndex;
      }

      var newPosition = transformIndex(this.position);
      if (this.position === this.selectionEnd) {
        return new Cursor(newPosition, newPosition);
      }
      return new Cursor(newPosition, transformIndex(this.selectionEnd));
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(obj) {
      return new Cursor(obj.position, obj.selectionEnd);
    }
  }]);

  return Cursor;
}();

exports.default = Cursor;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _textOp = __webpack_require__(4);

var _textOp2 = _interopRequireDefault(_textOp);

var _error = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextOperation = function () {
  function TextOperation() {
    _classCallCheck(this, TextOperation);

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

  _createClass(TextOperation, [{
    key: 'equals',
    value: function equals(other) {
      if (this.baseLength !== other.baseLength) {
        return false;
      }
      if (this.targetLength !== other.targetLength) {
        return false;
      }
      if (this.ops.length !== other.ops.length) {
        return false;
      }
      for (var i = 0; i < this.ops.length; i++) {
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

  }, {
    key: 'retain',
    value: function retain(n) {
      var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (typeof n !== 'number' || n < 0) {
        throw new Error('retain expects a positive integer.');
      }

      if (n === 0) {
        return this;
      }

      this.baseLength += n;
      this.targetLength += n;
      var prevOp = this.ops.length > 0 ? this.ops[this.ops.length - 1] : null;
      if (prevOp && prevOp.isRetain() && prevOp.attributesEqual(attributes)) {
        // The last op is a retain op with the same attributes => we can merge them into one op.
        prevOp.chars += n;
      } else {
        // Create a new op.
        this.ops.push(new _textOp2.default('retain', n, attributes));
      }

      return this;
    }

    // Insert a string at the current position.

  }, {
    key: 'insert',
    value: function insert(str) {
      var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (typeof str !== 'string') {
        throw new Error('insert expects a string');
      }

      if (str === '') {
        return this;
      }

      this.targetLength += str.length;
      var prevOp = this.ops.length > 0 ? this.ops[this.ops.length - 1] : null;
      var prevPrevOp = this.ops.length > 1 ? this.ops[this.ops.length - 2] : null;
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
        if (prevPrevOp && prevPrevOp.isInsert() && prevPrevOp.attributesEqual(attributes)) {
          prevPrevOp.text += str;
        } else {
          // delete(3), insert("something") --> insert("something"), delete(3) 
          this.ops[this.ops.length - 1] = new _textOp2.default('insert', str, attributes);
          this.ops.push(prevOp);
        }
      } else {
        this.ops.push(new _textOp2.default('insert', str, attributes));
      }
      return this;
    }

    // Delete a string at the current position.

  }, {
    key: 'delete',
    value: function _delete(n) {
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
      var prevOp = this.ops.length > 0 ? this.ops[this.ops.length - 1] : null;
      if (prevOp && prevOp.isDelete()) {
        prevOp.chars += n;
      } else {
        // The last op is a delete op with the same attributes => we can merge them into one op.
        this.ops.push(new _textOp2.default('delete', n));
      }
      return this;
    }
  }, {
    key: 'isNoop',
    value: function isNoop() {
      return this.ops.length === 0 || this.ops.length === 1 && this.ops[0].isRetain() && this.ops[0].hasEmptyAttributes();
    }
  }, {
    key: 'clone',
    value: function clone() {
      var clone = new TextOperation();
      for (var i = 0; i < this.ops.length; i++) {
        if (this.ops[i].isRetain()) {
          clone.retain(this.ops[i].chars, this.ops[i].attributes);
        } else if (this.ops[i].isInsert()) {
          clone.insert(this.ops[i].text, this.ops[i].attributes);
        } else {
          clone.delete(this.ops[i].chars);
        }
      }

      return clone;
    }

    // Pretty printing.

  }, {
    key: 'toString',
    value: function toString() {
      return this.ops.map(function (op) {
        if (op.isRetain()) {
          return 'retain ' + op.chars;
        } else if (op.isInsert()) {
          return 'insert \'' + op.text + '\'';
        }
        return 'delete ' + op.chars;
      }).join(', ');
    }

    // Converts operation into a JSON value.

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var ops = [];
      for (var i = 0; i < this.ops.length; i++) {
        // We prefix ops with their attributes if non-empty.
        if (!this.ops[i].hasEmptyAttributes()) {
          ops.push(this.ops[i].attributes);
        }
        if (this.ops[i].type === 'retain') {
          ops.push(this.ops[i].chars);
        } else if (this.ops[i].type === 'insert') {
          ops.push(this.ops[i].text);
        } else if (this.ops[i].type === 'delete') {
          ops.push(-this.ops[i].chars);
        }
      }

      return ops;
    }
  }, {
    key: 'apply',


    // Apply an operation to a string, returning a new string. Throws an error if
    // there's a mismatch between the input string and the operation.
    value: function apply(str, oldAttributes, newAttributes) {
      var operation = this;
      oldAttributes = oldAttributes || [];
      newAttributes = newAttributes || [];

      if (str.length !== operation.baseLength) {
        throw new Error("The operation's base length must be equal to the string's length.");
      }

      var newStringParts = [];
      var j = 0;
      var k = void 0;
      var attr = void 0;
      var oldIndex = 0;

      var ops = this.ops;
      for (var i = 0, l = ops.length; i < l; i++) {
        var op = ops[i];
        if (op.isRetain()) {
          if (oldIndex + op.chars > str.length) {
            throw new Error("Operation can't retain more characters than are left in the string.");
          }
          // Copy skipped part of the retained string.
          newStringParts[j++] = str.slice(oldIndex, oldIndex + op.chars);

          // TODO: simpify with Object.assign
          // Copy (and potentially update) attributes for each char in retained string.
          for (k = 0; k < op.chars; k++) {
            var currAttributes = oldAttributes[oldIndex + k] || {};
            var updatedAttributes = {};
            for (attr in currAttributes) {
              updatedAttributes[attr] = currAttributes[attr];
              (0, _error.assert)(updatedAttributes[attr] !== false);
            }

            for (attr in op.attributes) {
              if (op.attributes[attr] === false) {
                delete updatedAttributes[attr];
              } else {
                updatedAttributes[attr] = op.attributes[attr];
              }
              (0, _error.assert)(updatedAttributes[attr] !== false);
            }
            newAttributes.push(updatedAttributes);
          }

          oldIndex += op.chars;
        } else if (op.isInsert()) {
          // Insert string.
          newStringParts[j++] = op.text;

          // Insert attributes for each char.
          for (k = 0; k < op.text.length; k++) {
            var insertedAttributes = {};
            for (attr in op.attributes) {
              insertedAttributes[attr] = op.attributes[attr];
              (0, _error.assert)(insertedAttributes[attr] !== false);
            }
            newAttributes.push(insertedAttributes);
          }
        } else {
          // delete op
          oldIndex += op.chars;
        }
      }
      if (oldIndex !== str.length) {
        throw new Error("The operation didn't operate on the whole string.");
      }
      var newString = newStringParts.join('');
      (0, _error.assert)(newString.length === newAttributes.length);

      return newString;
    }

    // Computes the inverse of an operation. The inverse of an operation is the
    // operation that reverts the effects of the operation, e.g. when you have an
    // operation 'insert("hello "); retain(6);' then the inverse is 'delete("hello ");
    // retain(6);'. The inverse should be used for implementing undo.

  }, {
    key: 'invert',
    value: function invert(str) {
      var strIndex = 0;
      var inverse = new TextOperation();
      var ops = this.ops;
      for (var i = 0, l = ops.length; i < l; i++) {
        var op = ops[i];
        if (op.isRetain()) {
          inverse.retain(op.chars);
          strIndex += op.chars;
        } else if (op.isInsert()) {
          inverse.delete(op.text.length);
        } else {
          // delete op
          inverse.insert(str.slice(strIndex, strIndex + op.chars));
          strIndex += op.chars;
        }
      }
      return inverse;
    }

    // Compose merges two consecutive operations into one operation, that
    // preserves the changes of both. Or, in other words, for each input string S
    // and a pair of consecutive operations A and B,
    // apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.

  }, {
    key: 'compose',
    value: function compose(operation2) {
      var operation1 = this;
      if (operation1.targetLength !== operation2.baseLength) {
        throw new Error('The base length of the second operation has to be the target length of the first operation');
      }

      // TODO: simplify with Object.assign
      function composeAttributes(first, second, firstOpIsInsert) {
        var merged = {};
        var attr = void 0;
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

      var operation = new TextOperation(); // the combined operation
      var ops1 = operation1.clone().ops;
      var ops2 = operation2.clone().ops;

      var i1 = 0;
      var i2 = 0; // current index into ops1 respectively ops2

      var op1 = ops1[i1++];
      var op2 = ops2[i2++]; // current ops

      var attributes = void 0;

      while (true) {
        // eslint-disable-line no-constant-condition
        // Dispatch on the type of op1 and op2
        if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
          // end condition: both ops1 and ops2 have been processed
          break;
        }

        // delete overrides all
        if (op1 && op1.isDelete()) {
          operation.delete(op1.chars);
          op1 = ops1[i1++];
          continue; // eslint-disable-line no-continue
        }

        // second insert overrides all after op1 deletes
        if (op2 && op2.isInsert()) {
          operation.insert(op2.text, op2.attributes);
          op2 = ops2[i2++];
          continue; // eslint-disable-line no-continue
        }

        if (typeof op1 === 'undefined') {
          throw new Error('Cannot compose operations: first operation is too short.');
        }

        if (typeof op2 === 'undefined') {
          throw new Error('Cannot compose operations: first operation is too long.');
        }

        // 3rd priority -- everything else
        // Both retain
        if (op1.isRetain() && op2.isRetain()) {
          attributes = composeAttributes(op1.attributes, op2.attributes);
          // apply shorter of the 2 retains
          // increment operation from the shorter and keep the remainder
          if (op1.chars > op2.chars) {
            operation.retain(op2.chars, attributes);
            op1.chars -= op2.chars;
            op2 = ops2[i2++];
          } else if (op1.chars === op2.chars) {
            operation.retain(op1.chars, attributes);
            op1 = ops1[i1++];
            op2 = ops2[i2++];
          } else {
            operation.retain(op1.chars, attributes);
            op2.chars -= op1.chars;
            op1 = ops1[i1++];
          }
        } else if (op1.isInsert() && op2.isDelete()) {
          if (op1.text.length > op2.chars) {
            // op1 inserts more than op2 deletes
            // shorten op1 insert and increment op2
            op1.text = op1.text.slice(op2.chars);
            op2 = ops2[i2++];
          } else if (op1.text.length === op2.chars) {
            // cancel each other out
            op1 = ops1[i1++];
            op2 = ops2[i2++];
          } else {
            // op2 deletes more than op1 inserts
            // shorten op2 delete and increment op1
            op2.chars -= op1.text.length;
            op1 = ops1[i1++];
          }
        } else if (op1.isInsert() && op2.isRetain()) {
          attributes = composeAttributes(op1.attributes, op2.attributes, true);
          // op1 insert overrides retain
          if (op1.text.length > op2.chars) {
            operation.insert(op1.text.slice(0, op2.chars), attributes);
            op1.text = op1.text.slice(op2.chars);
            op2 = ops2[i2++];
          } else if (op1.text.length === op2.chars) {
            // op1 insert overrides retain
            operation.insert(op1.text, attributes);
            op1 = ops1[i1++];
            op2 = ops2[i2++];
          } else {
            // op1 insert overrides retain, but we have more retain to go
            operation.insert(op1.text, attributes);
            op2.chars -= op1.text.length;
            op1 = ops1[i1++];
          }
        } else if (op1.isRetain() && op2.isDelete()) {
          // op2 deletes chars retained in op1
          if (op1.chars > op2.chars) {
            // op2 deletes some chars retained in op1, but we have more retaining to go
            operation.delete(op2.chars);
            op1.chars -= op2.chars;
            op2 = ops2[i2++];
          } else if (op1.chars === op2.chars) {
            operation.delete(op2.chars);
            op1 = ops1[i1++];
            op2 = ops2[i2++];
          } else {
            // op2 deletes chars retained in op1, and we have more deleting to go
            operation.delete(op1.chars);
            op2.chars -= op1.chars;
            op1 = ops1[i1++];
          }
        } else {
          throw new Error('This shouldn\'t happen: op1: ' + JSON.stringify(op1) + ', op2: ' + JSON.stringify(op2));
        }
      }

      return operation;
    }
  }, {
    key: 'shouldBeComposedWith',


    // When you use ctrl-z to undo your latest changes, you expect the program not
    // to undo every single keystroke but to undo your last sentence you wrote at
    // a stretch or the deletion you did by holding the backspace key down.
    // This can be implemented by composing operations on the undo stack. This
    // method can help decide whether two operations should be composed. It
    // returns true if the operations are consecutive insert operations or both
    // operations delete text at the same position. You may want to include other
    // factors like the time since the last change in your decision.
    value: function shouldBeComposedWith(other) {
      if (this.isNoop() || other.isNoop()) {
        return true;
      }

      var startA = TextOperation.getStartIndex(this);
      var startB = TextOperation.getStartIndex(other);
      var simpleA = TextOperation.getSimpleOp(this);
      var simpleB = TextOperation.getSimpleOp(other);

      if (!simpleA || !simpleB) {
        return false;
      }

      // progressive inserts
      if (simpleA.isInsert() && simpleB.isInsert()) {
        return startA + simpleA.text.length === startB;
      }

      // consecutive deletes
      if (simpleA.isDelete() && simpleB.isDelete()) {
        // there are two possibilities to delete: with backspace and with the
        // delete key.
        return startB + simpleB.chars === startA || startA === startB;
      }

      return false;
    }

    // Decides whether two operations should be composed with each other
    // if they were inverted, that is
    // `shouldBeComposedWith(a, b) = shouldBeComposedWithInverted(b^{-1}, a^{-1})`.

  }, {
    key: 'shouldBeComposedWithInverted',
    value: function shouldBeComposedWithInverted(other) {
      if (this.isNoop() || other.isNoop()) {
        return true;
      }

      var startA = TextOperation.getStartIndex(this);
      var startB = TextOperation.getStartIndex(other);
      var simpleA = TextOperation.getSimpleOp(this);
      var simpleB = TextOperation.getSimpleOp(other);

      if (!simpleA || !simpleB) {
        return false;
      }

      if (simpleA.isInsert() && simpleB.isInsert()) {
        return startA + simpleA.text.length === startB || startA === startB;
      }

      if (simpleA.isDelete() && simpleB.isDelete()) {
        return startB + simpleB.chars === startA;
      }

      return false;
    }
  }, {
    key: 'transform',


    // convenience method to write transform(a, b) as a.transform(b)
    value: function transform(other) {
      return TextOperation.transform(this, other);
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(ops) {
      var o = new TextOperation();
      for (var i = 0, l = ops.length; i < l; i++) {
        var op = ops[i];
        var attributes = {};
        if ((typeof op === 'undefined' ? 'undefined' : _typeof(op)) === 'object') {
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
          (0, _error.assert)(typeof op === 'string');
          o.insert(op, attributes);
        }
      }
      return o;
    }
  }, {
    key: 'getSimpleOp',
    value: function getSimpleOp(operation) {
      var ops = operation.ops;
      switch (ops.length) {// eslint-disable-line default-case
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
  }, {
    key: 'getStartIndex',
    value: function getStartIndex(operation) {
      if (operation.ops[0].isRetain()) {
        return operation.ops[0].chars;
      }
      return 0;
    }
  }, {
    key: 'transformAttributes',
    value: function transformAttributes(attributes1, attributes2) {
      var attributes1prime = {};
      var attributes2prime = {};
      var attr = void 0;
      var allAttrs = {};

      // TODO: simplify with Object.assign
      for (attr in attributes1) {
        allAttrs[attr] = true;
      }
      for (attr in attributes2) {
        allAttrs[attr] = true;
      }

      for (attr in allAttrs) {
        var attr1 = attributes1[attr],
            attr2 = attributes2[attr];
        (0, _error.assert)(attr1 != null || attr2 != null);
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

  }, {
    key: 'transform',
    value: function transform(operation1, operation2) {
      if (operation1.baseLength !== operation2.baseLength) {
        throw new Error('Both operations have to have the same base length');
      }

      var operation1prime = new TextOperation();
      var operation2prime = new TextOperation();
      var ops1 = operation1.clone().ops;
      var ops2 = operation2.clone().ops;
      var i1 = 0;
      var i2 = 0;
      var op1 = ops1[i1++];
      var op2 = ops2[i2++];
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
          operation1prime.insert(op1.text, op1.attributes);
          operation2prime.retain(op1.text.length);
          op1 = ops1[i1++];
          continue; // eslint-disable-line no-continue
        }
        if (op2 && op2.isInsert()) {
          operation1prime.retain(op2.text.length);
          operation2prime.insert(op2.text, op2.attributes);
          op2 = ops2[i2++];
          continue; // eslint-disable-line no-continue
        }

        if (typeof op1 === 'undefined') {
          throw new Error('Cannot transform operations: first operation is too short.');
        }
        if (typeof op2 === 'undefined') {
          throw new Error('Cannot transform operations: first operation is too long.');
        }

        var minl = void 0;
        if (op1.isRetain() && op2.isRetain()) {
          // Simple case: retain/retain
          // just advance forward by min retain
          // keep remainder for next retain
          var attributesPrime = TextOperation.transformAttributes(op1.attributes, op2.attributes);
          if (op1.chars > op2.chars) {
            minl = op2.chars;
            op1.chars -= op2.chars;
            op2 = ops2[i2++];
          } else if (op1.chars === op2.chars) {
            minl = op2.chars;
            op1 = ops1[i1++];
            op2 = ops2[i2++];
          } else {
            minl = op1.chars;
            op2.chars -= op1.chars;
            op1 = ops1[i1++];
          }

          operation1prime.retain(minl, attributesPrime[0]);
          operation2prime.retain(minl, attributesPrime[1]);
        } else if (op1.isDelete() && op2.isDelete()) {
          // Both operations delete the same string at the same position. We don't
          // need to produce any operations, we just skip over the delete ops and
          // handle the case that one operation deletes more than the other.
          if (op1.chars > op2.chars) {
            op1.chars -= op2.chars;
            op2 = ops2[i2++];
          } else if (op1.chars === op2.chars) {
            op1 = ops1[i1++];
            op2 = ops2[i2++];
          } else {
            op2.chars -= op1.chars;
            op1 = ops1[i1++];
          }
          // next two cases: delete/retain and retain/delete
          // op1 delete up to max op2 retains, keep remainder for next op test
        } else if (op1.isDelete() && op2.isRetain()) {
          if (op1.chars > op2.chars) {
            minl = op2.chars;
            op1.chars -= op2.chars;
            op2 = ops2[i2++];
          } else if (op1.chars === op2.chars) {
            minl = op2.chars;
            op1 = ops1[i1++];
            op2 = ops2[i2++];
          } else {
            // op1 delete all, keep remainder of op2 retain for next op test
            minl = op1.chars;
            op2.chars -= op1.chars;
            op1 = ops1[i1++];
          }
          operation1prime.delete(minl);
          // same in reverse
        } else if (op1.isRetain() && op2.isDelete()) {
          if (op1.chars > op2.chars) {
            minl = op2.chars;
            op1.chars -= op2.chars;
            op2 = ops2[i2++];
          } else if (op1.chars === op2.chars) {
            minl = op1.chars;
            op1 = ops1[i1++];
            op2 = ops2[i2++];
          } else {
            minl = op1.chars;
            op2.chars -= op1.chars;
            op1 = ops1[i1++];
          }
          operation2prime.delete(minl);
        } else {
          throw new Error("The two operations aren't compatible");
        }
      }

      return [operation1prime, operation2prime];
    }
  }]);

  return TextOperation;
}();

exports.default = TextOperation;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _error = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextOp = function () {
  function TextOp(type) {
    _classCallCheck(this, TextOp);

    this.type = type;
    this.chars = null;
    this.text = null;
    this.attributes = null;

    if (type === 'insert') {
      this.text = arguments.length <= 1 ? undefined : arguments[1];
      (0, _error.assert)(typeof this.text === 'string');
      this.attributes = (arguments.length <= 2 ? undefined : arguments[2]) || {};
      (0, _error.assert)(_typeof(this.attributes) === 'object');
    } else if (type === 'delete') {
      this.chars = arguments.length <= 1 ? undefined : arguments[1];
      (0, _error.assert)(typeof this.chars === 'number');
    } else if (type === 'retain') {
      this.chars = arguments.length <= 1 ? undefined : arguments[1];
      (0, _error.assert)(typeof this.chars === 'number');
      this.attributes = (arguments.length <= 2 ? undefined : arguments[2]) || {};
      (0, _error.assert)(_typeof(this.attributes) === 'object');
    }
  }

  _createClass(TextOp, [{
    key: 'isInsert',
    value: function isInsert() {
      return this.type === 'insert';
    }
  }, {
    key: 'isDelete',
    value: function isDelete() {
      return this.type === 'delete';
    }
  }, {
    key: 'isRetain',
    value: function isRetain() {
      return this.type === 'retain';
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return this.type === other.type && this.text === other.text && this.chars === other.chars && this.attributesEqual(other.attributes);
    }
  }, {
    key: 'attributesEqual',
    value: function attributesEqual(otherAttributes) {
      var _this = this;

      if (!otherAttributes || !this.attributes) {
        return otherAttributes === this.attributes;
      }

      return Object.keys(this.attributes).every(function (attr) {
        return _this.attributes[attr] === otherAttributes[attr];
      }) && Object.keys(otherAttributes).every(function (attr) {
        return _this.attributes[attr] === otherAttributes[attr];
      });
    }
  }, {
    key: 'hasEmptyAttributes',
    value: function hasEmptyAttributes() {
      var empty = true;
      for (var attr in this.attributes) {
        empty = false;
        break;
      }

      return empty;
    }
  }]);

  return TextOp;
}();

exports.default = TextOp;

/***/ })
/******/ ]);