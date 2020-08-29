const parseISO = require('date-fns/parseISO')
const differenceInDays = require('date-fns/differenceInDays')

class ExampleMessageParser {
  static type() {
    return 'example'
  }

  constructor(options) {
    options = options||{};

    this.headerEmoji = options.headerEmoji || ':mag:'
    this.reviewHeaderEmoji = options.reviewHeaderEmoji || ':eyes:'
    this.mergeHeaderEmoji = options.mergeHeaderEmoji || ':white_check_mark:';
    this.leaderboardEmoji = options.leaderboardEmoji || ':cold_sweat:';
    this.prLimit = options.prLimit || 30;
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

  createOpenPrLeaderboard(prs) {
    return prs.reduce((accumulator, currentValue) => {
      const entryForCurrentUser = accumulator.find((leaderboardEntry) => (leaderboardEntry.author === currentValue.author));

      if (!entryForCurrentUser) {
        accumulator.push({
          author: currentValue.author,
          amount: 1
        })
      } else {
        entryForCurrentUser.amount += 1
      }

      return accumulator;
    }, []).sort((entryA, entryB) => {
      return entryB.amount - entryA.amount
    }).map((entry, index) => {
      entry.place = index + 1;
      return entry;
    });
  }

  mapHeader(prs) {
    // TODO: if prs is empty array or null
    return `${this.headerEmoji} <!channel> There are *${prs.length}* open PR(s). The oldest one is *${prs[0].timeDiffCreate}* days old.`
  }

  createEmoji(name) {
    const emojiName = name.split(' ').join('').split('.').join('').toLowerCase();
    const slackName = name.split(' ').join('.').toLowerCase();
    return (`:${emojiName}: (<@${slackName}>)`)
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
    return `${this.reviewHeaderEmoji} *${prs.length}* PR(s) open for review. The oldest one is *${prs[0].timeDiffCreate}* days old.`
  }

  mapReviewMessage(pr) {
    const reviewers = pr.waitingReviewNames.map((reviewer) => (this.createEmoji(reviewer))).join(', ')

    return `<${pr.link}|${pr.title}> \n by ${this.createEmoji(pr.author)} - ${pr.timeDiffCreate} days old \n Waiting on ${reviewers || this.createEmoji(pr.author)}`
  }

  mapMergeHeader(prs) {
    return `${this.mergeHeaderEmoji} *${prs.length}* PR(s) are ready to merge. The oldest one is *${prs[0].timeDiffCreate}* days old.`
  }

  mapMergeMessage(pr) {
    return `<${pr.link}|${pr.title}> \n by ${this.createEmoji(pr.author)} - ${pr.timeDiffCreate} days old`
  }

  mapPr(pr, messageParseFunction) {
    return this.mapToMarkdownBlock(messageParseFunction(pr));
  }

  mapLeaderboardHeader(leaderboard) {
    return `${this.leaderboardEmoji} *Uh Oh! ${this.createEmoji(leaderboard[0].author)}* is on top of the leaderboard with *${leaderboard[0].amount}* open PRs.`
  }

  mapLeaderboardEntry(entry) {
    return this.mapToMarkdownBlock(`*${entry.place}.* ${this.createEmoji(entry.author)} - *${entry.amount}* open PR(s)`);
  }

  parsePrs(prs) {
    prs = prs
        .map((pr) => this.addTimeDiffs(pr))
        .sort((pr1, pr2) => (pr2.timeDiffCreate - pr1.timeDiffCreate));

    const toReview = prs.filter((pr) => (pr.waitingReviewNames.length > 0));
    const toMerge = prs.filter((pr) => (pr.waitingReviewNames.length <= 0));
    const leaderboard = this.createOpenPrLeaderboard(prs);

    return {
      text: this.mapHeader(prs),
      attachments: [
        toReview.length ? {
          color: '#f54242',
          blocks: [
            this.mapToMarkdownBlock(this.mapReviewHeader(toReview)),
            ...toReview.slice(0, this.prLimit).map((pr) => (this.mapPr(pr, this.mapReviewMessage.bind(this))))
          ]
        } : {},
        toMerge.length ? {
          color: '#2eb886',
          blocks: [
            this.mapToMarkdownBlock(this.mapMergeHeader(toMerge)),
            ...toMerge.map((pr) => (this.mapPr(pr, this.mapMergeMessage.bind(this))))]
        } : {},
        leaderboard.length ? {
          color: '#df03fc',
          blocks: [
            this.mapToMarkdownBlock(this.mapLeaderboardHeader(leaderboard)),
            ...leaderboard.map((entry) => (this.mapLeaderboardEntry(entry)))
          ]
        } : {}
      ]
    }
  }
}

module.exports = ExampleMessageParser
