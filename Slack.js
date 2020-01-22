const {IncomingWebhook} = require('@slack/webhook')
const parseISO = require('date-fns/parseISO')
const differenceInDays = require('date-fns/differenceInDays')

class Slack {
  constructor( options ) {
    this.slack = new IncomingWebhook(options.webhook)
  }

  async sendToSlack(message) {
    const DATE_TODAY = Date.now()

    const blocks = message.map( (pr) => {
      const reviewers = pr.reviewerName.join(', ')
      const prTime = parseISO(pr.updated_on)
      const timeDiff = differenceInDays(DATE_TODAY, prTime)
      const link = pr.link
      const slackMsg = {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `<${link}|${pr.title}> - ${timeDiff} days old - Waiting on ${reviewers}`
        }
      }

      return slackMsg
    })

    await this.slack.send({
      text: 'Pull request reminders',
      blocks
    })
  }
}

module.exports = Slack
