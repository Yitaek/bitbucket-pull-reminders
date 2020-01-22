const Config = require('./Config')
const Bitbucket = require('./Bitbucket')
const Slack = require('./Slack')

// exports.sendPullRequestReminders = async (event, context) => {
//   await getAllPRs()
// };


getAllPRs()

async function getAllPRs() {
  const config = await Config.create()

  const bitbucket = new Bitbucket( config.bitbucket )
  const slack = new Slack( config.slack )

  const reviewers = await bitbucket.getAllPRs()
  await slack.sendToSlack(reviewers)
}
