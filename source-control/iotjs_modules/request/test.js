var fs = require('fs');
var request = require('request');
var file_path = './travis.yml';

function download_file(urlStr) {
  request.get(urlStr, null, function(err, data) {
    if (err) {
      console.error(err);
      return;
    }
    console.log(data);

    fs.writeFileSync(file_path, data);
  });
};

download_file('https://raw.githubusercontent.com/Samsung/iotjs/master/.travis.yml');
