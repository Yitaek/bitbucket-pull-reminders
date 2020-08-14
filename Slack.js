const {IncomingWebhook} = require('@slack/webhook')

class Slack {
  constructor( options, parser ) {
    this.slack = new IncomingWebhook(
        options.webhook.url,
        options.webhook.defaults
    )

    this.messageParser = parser
  }


  async sendToSlack(prs) {
    await this.slack.send(this.messageParser.parsePrs(prs));
  }
}

module.exports = Slack
