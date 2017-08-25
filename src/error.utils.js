export const assert = (b, msg) => {
  if (!b) {
    throw new Error(msg || 'assertion error');
  }
};

export default assert;
