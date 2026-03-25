// Mock react-query for browser testing
window.ReactQuery = {
  QueryClient: class QueryClient {
    constructor(config) {
      this.config = config;
    }
  },
  QueryClientProvider: ({ client, children }) => {
    return children;
  },
  useQuery: (key, fn, options) => {
    return {
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => {},
    };
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.ReactQuery;
}
