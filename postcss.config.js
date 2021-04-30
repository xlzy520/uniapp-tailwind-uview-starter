const path = require('path')
const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
  syntax: 'postcss-scss',
  parser: require('postcss-comment'),
  plugins: [
    require('postcss-import')({
      resolve(id, basedir, importOptions) {
        if (id.startsWith('~@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(3))
        } else if (id.startsWith('@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(2))
        } else if (id.startsWith('/') && !id.startsWith('//')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(1))
        }
        return id
      },
    }),
    // purgecss({
    //   content: ['./**/*.vue', './**/*.wxml', './**/*.html'],
    //   css: ['**/*.wxss', '**/*.css'],
    // }),
    require('autoprefixer')({
      remove: process.env.UNI_PLATFORM !== 'h5',
    }),
    require('@dcloudio/vue-cli-plugin-uni/packages/postcss'),
    require('tailwindcss')({ config: './tailwind.config.js' }),
    require('postcss-class-rename')({
      '\\\\:': '--',
      '\\\\/': '_',
    })
  ],
}
