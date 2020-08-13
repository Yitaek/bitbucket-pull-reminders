const parseISO = require('date-fns/parseISO')
const differenceInDays = require('date-fns/differenceInDays')

class DefaultMessageParser {
  static type() {
    return 'default'
  }

  constructor(options) {
    options = options||{};
  }

  parsePrs(prs) {
    const DATE_TODAY = Date.now()

    const blocks = prs.map( (pr) => {
      const reviewers = pr.waitingReviewNames.join(', ')
      const prTime = parseISO(pr.updatedOn)
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

    return {
      text: 'Pull request reminders',
      blocks
    };
  }
}

module.exports = DefaultMessageParser
