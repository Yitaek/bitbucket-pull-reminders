const parseISO = require('date-fns/parseISO')
const differenceInDays = require('date-fns/differenceInDays')

class RobinMessageParser {
  static type() {
    return 'robin'
  }

  constructor(options) {
    options = options||{};

    this.headerEmoji = options.headerEmoji || ':mag:'
    this.reviewHeaderEmoji = options.reviewHeaderEmoji || ':eyes:'
    this.mergeHeaderEmoji = options.mergeHeaderEmoji || ':white_check_mark:';
  }

  addTimeDiffs(pr) {
    const DATE_TODAY = Date.now()

    return Object.assign(pr,
        {
          timeDiffCreate: differenceInDays(DATE_TODAY, parseISO(pr.createdOn)),
          timeDiffUpdate: differenceInDays(DATE_TODAY, parseISO(pr.updatedOn))
        }
    )
  }

  mapHeader(prs) {
    // TODO: if prs is empty array or null
    return `${this.headerEmoji} <!channel> There are *${prs.length}* open PR(s). The oldest one is *${prs[0].timeDiffCreate}* days old.`
  }

  createEmoji(name) {
    const emojiName = name.replace(' ', '').replace('.', '').toLowerCase();
    return (`:${emojiName}: (<@${name.replace(' ', '.').toLowerCase()}>)`)
  }

  mapToMarkdownBlock(text) {
    return {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': text
      }
    };
  }

  mapReviewHeader(prs) {
    // TODO: if prs is empty array or null
    return `${this.reviewHeaderEmoji} *${prs.length}* PR(s) open for review. The oldest one is *${prs[0].timeDiffCreate}* days old.`
  }

  mapReviewMessage(pr) {
    const reviewers = pr.waitingReviewNames.map((reviewer) => (this.createEmoji(reviewer))).join(', ')

    return `<${pr.link}|${pr.title}> \n by ${this.createEmoji(pr.author)} - ${pr.timeDiffCreate} days old \n Waiting on ${reviewers || this.createEmoji(pr.author)}`
  }

  mapMergeHeader(prs) {
    // TODO: if prs is empty array or null
    return `${this.mergeHeaderEmoji} *${prs.length}* PR(s) are ready to merge. The oldest one is *${prs[0].timeDiffCreate}* days old.`
  }

  mapMergeMessage(pr) {
    return `<${pr.link}|${pr.title}> \n by ${this.createEmoji(pr.author)} - ${pr.timeDiffCreate} days old`
  }

  mapPr(pr, messageParseFunction) {
    return this.mapToMarkdownBlock(messageParseFunction(pr));
  }

  parsePrs(prs) {
    prs = prs
        .map((pr) => this.addTimeDiffs(pr))
        .sort((pr1, pr2) => (pr2.timeDiffCreate - pr1.timeDiffCreate));

    const toMerge = prs.filter((pr) => (pr.waitingReviewNames.length <= 0));
    const toReview = prs.filter((pr) => (pr.waitingReviewNames.length > 0));

    return {
      text: this.mapHeader(prs),
      attachments: [
        toReview.length ? {
          color: '#f54242',
          blocks: [
            this.mapToMarkdownBlock(this.mapReviewHeader(toReview)),
            ...toReview.map((pr) => (this.mapPr(pr, this.mapReviewMessage.bind(this))))
          ]
        } : {},
        toMerge.length ? {
          color: '#2eb886',
          blocks: [
            this.mapToMarkdownBlock(this.mapMergeHeader(toMerge)),
            ...toMerge.map((pr) => (this.mapPr(pr, this.mapMergeMessage.bind(this))))]
        } : {}
      ]
    }
  }
}

module.exports = RobinMessageParser
