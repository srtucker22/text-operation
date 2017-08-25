const modules = require('../dist/index');

describe('Build Tests', () => {
  it('Creates a module', () => {
    function cursorTest() {
      return modules.Cursor.fromJSON({ position: 3, selectionEnd: 5 });
    }
    expect(cursorTest).not.toThrow();

    function textOperationTest() {
      return modules.TextOperation.fromJSON([2, -1, -1, 'cde']);
    }
    expect(textOperationTest).not.toThrow();
  });
});
