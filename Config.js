require('dotenv').config()

module.exports = {
  bitbucket: {
    type: 'basic',
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  }
}
