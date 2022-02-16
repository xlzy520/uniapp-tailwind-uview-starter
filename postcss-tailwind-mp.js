const postcss = require('postcss');

module.exports = postcss.plugin('postcss-tailwind-mp', () => {
  return (root) => {
    root.walk((rule) => {
      if (rule.type === 'rule') {
        if (rule.selector.includes('*,')) {
          const isH5 = process.env.UNI_PLATFORM === 'h5';
          if (!isH5) {
            rule.selector = rule.selector.replace('*,', '');
          }
        }
      }
    });
  };
});
