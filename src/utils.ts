export const assert = (b: boolean, msg?: string) => {
  if (!b) {
    throw new Error(msg || 'assertion error');
  }
};

export default assert;
