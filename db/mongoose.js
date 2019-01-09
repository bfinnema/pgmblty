var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

module.exports = {mongoose};
