require('dotenv').config()

module.exports = {
  bitbucket: {
    auth: {
      type: 'basic',
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    },
    
    teamName: process.env.TEAMNAME

  },

  slack: {
    webhook: process.env.SLACK_WEBHOOK_URL
  }
}
