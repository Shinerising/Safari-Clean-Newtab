const crypto = require('crypto');
const fs = require('fs');

const files = [
  './index.html',
  './site.webmanifest',
  './favicon.ico',
];
const getHash = (file) => {
    const filename = __dirname + file;
    const shasum = crypto.createHash('sha1');
    const data = fs.readFileSync(file);
    shasum.update(data);
    return shasum.digest('hex');
};
module.exports = {
  loadEntries: () => files.map(file => {
    return {
      url: file,
      revision: getHash(file)
    }
  })
}