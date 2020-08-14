const Config = require('./Config')
const Bitbucket = require('./Bitbucket')
const Slack = require('./Slack')
const MessageParserFactory = require('./messageParsers');

exports.sendPullRequestReminders = async (event, context) => {
  await getAllPRs()
};

async function getAllPRs() {
  const config = await Config.create()

  const bitbucket = new Bitbucket( config.bitbucket )

  const messageParserFactory = new MessageParserFactory();
  const MessageParserType = messageParserFactory.getParser(config.parser.type);

  const slack = new Slack(
      config.slack,
      new MessageParserType(config.parser.options)
  );

  const reviewers = await bitbucket.getAllPRs()

  try {
    await slack.sendToSlack(reviewers)
  } catch (error) {
    console.log(error);
  }
}
