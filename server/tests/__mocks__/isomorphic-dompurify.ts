/**
 * Mock for isomorphic-dompurify
 * Used in tests to avoid ESM import issues with parse5/jsdom
 */

const DOMPurify = {
  sanitize: (dirty: string): string => {
    // Simple sanitization for tests - just return the string as-is
    // In production, the real DOMPurify handles XSS prevention
    return dirty;
  },
  isSupported: true,
  version: 'mock',
  removed: [],
  setConfig: jest.fn(),
  clearConfig: jest.fn(),
  isValidAttribute: jest.fn(() => true),
  addHook: jest.fn(),
  removeHook: jest.fn(),
  removeHooks: jest.fn(),
  removeAllHooks: jest.fn(),
};

export default DOMPurify;
