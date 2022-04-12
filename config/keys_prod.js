// If you want to use this app you'll need to set up your keys here
module.exports = {
    mongoURI: process.env.MONGO_URI,  // mLab URI - [ don't forget to setup a DB user first ]
    googleClientID: process.env.G_ID, // Google Client ID
    googleClientSecret: process.env.G_SECRET  // GoogleClient Secret
  }