// Mock React for browser testing
window.React = {
  createElement: (...args) => ({ type: args[0], props: args[1] || {}, children: args.slice(2) }),
  useState: (initial) => {
    const state = typeof initial === 'function' ? initial() : initial;
    return [state, (newVal) => {}]; // Simple mock
  },
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
  Fragment: 'Fragment',
};

window.ReactDOM = {
  render: (element, container) => {
    console.log('Mock ReactDOM.render called', element);
  },
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.React;
  module.exports.default = window.React;
}
