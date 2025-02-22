const path = require('path');

module.exports = {
  entry: './vision.js',
  output: {
    filename: 'HVP.js', 
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development', 
};