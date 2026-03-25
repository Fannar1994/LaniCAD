// Mock styled-components for browser testing
window.styled = new Proxy(() => {}, {
  get: (target, prop) => {
    return (styles) => {
      return (props) => {
        const Tag = typeof prop === 'string' ? prop : 'div';
        return window.React.createElement(Tag, props);
      };
    };
  },
  apply: (target, thisArg, args) => {
    return (styles) => {
      return (props) => {
        const Component = args[0];
        return window.React.createElement(Component, props);
      };
    };
  }
});

// Export default
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.styled;
  module.exports.default = window.styled;
}
