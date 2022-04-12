// Depending of the env choose the file to for your access keys
if(process.env.NODE_ENV === 'production'){
  module.exports = require('./keys_prod');
} else {
  module.exports = require('./keys_dev');
}