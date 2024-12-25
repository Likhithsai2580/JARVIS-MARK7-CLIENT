const path = require('path');

module.exports = {
  // ... other webpack configurations
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      },
      // ... other rules
    ],
  },
}; 