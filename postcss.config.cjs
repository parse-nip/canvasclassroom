// PostCSS config - handles missing packages gracefully
let plugins = {};

try {
  // Try to load tailwindcss - if it exists, use it
  require.resolve('tailwindcss');
  require.resolve('autoprefixer');
  plugins = {
    tailwindcss: require('tailwindcss'),
    autoprefixer: require('autoprefixer'),
  };
} catch (e) {
  // Packages not installed yet - empty config
  // User needs to run: npm install
  plugins = {};
}

module.exports = {
  plugins,
};

