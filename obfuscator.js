const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const r = (...args) => path.resolve(__dirname, ...args);

const obfuscatorOptions = {
  optionsPreset: 'medium-obfuscation', // high-obfuscation
  disableConsoleOutput: true,
  debugProtection: true,
  debugProtectionInterval: 300,
  selfDefending: true,
  renameGlobals: true,
  unicodeEscapeSequence: true,
  // deadCodeInjection: true,
  // deadCodeInjectionThreshold: 0.2,
};

const vendorObfuscatorOptions = {
  optionsPreset: 'low-obfuscation', // high-obfuscation
  disableConsoleOutput: true,
};

// 加密整个extension文件夹里面所有的js文件，包括其他文件夹里面的js文件
const obfuscateFolder = (folderPath) => {
  const files = fs.readdirSync(folderPath);
  const obfuscateFile = (filePath, options) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(
      fileContent,
      options || obfuscatorOptions,
    );
    fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode(), 'utf8');
    console.log('Obfuscation of file %s is done!', filePath);
  };

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      obfuscateFolder(filePath);
    } else if (file.endsWith('.js')) {
      if (
        file.startsWith('chunk-vendor') ||
        file.startsWith('pages-index-video')
      ) {
      } else {
        obfuscateFile(filePath);
      }
    }
  });
};

obfuscateFolder(r('dist/build/h5/static/js'));
