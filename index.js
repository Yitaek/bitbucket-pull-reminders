
const { IncomingWebhook } = require('@slack/webhook')
const parseISO = require('date-fns/parseISO')
const differenceInDays = require('date-fns/differenceInDays')
const config = require('./Config')
const Bitbucket = require('./Bitbucket')


// exports.sendPullRequestReminders = async (event, context) => {
//   await getAllPRs(teamName)
// };

getAllPRs()

async function getAllPRs(){
  const bitbucket = new Bitbucket( config.bitbucket )
  const reviewers = await bitbucket.getAllPRs()

  console.log(reviewers)
}


async function sendToSlack(message){

  const DATE_TODAY = Date.now()

  const blocks = message.map( pr => {
    const reviewers = pr.reviewerName.join(', ')
    const prTime = parseISO(pr.updated_on)
    const timeDiff = differenceInDays(DATE_TODAY, prTime)
    const link = pr.link
    const slackMsg = {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `<${link}|${pr.title}> - ${timeDiff} days old - Waiting on ${reviewers}`
      }
    }

    return slackMsg
  })

  const url = config.slack.webhook
  const webhook = new IncomingWebhook(url)

  await webhook.send({
    text: "Pull request reminders", 
    blocks
  })
}
