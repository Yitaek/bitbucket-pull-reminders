# bitbucket-pull-reminders

The purpose of this repo is to replicate the behavior of Pull Panda on Github for Bitbucket repositories. 

## About the Project

Github acquired Pull Panda and now offers Pull Request reminders for free. There is no open source alternative for Bitbucket, and the ones I've found lacked some functionality such as listing members who did not act on the pull request and how long the pull request has been stale for. This project mimics the behavior of Pull Panda for Bitbucket users. 

## Getting Started

This application assumes access to Bitbucket and Slack. 

### Installation

1. Clone the repo
```sh
git clone git@github.com:Yitaek/bitbucket-pull-reminders.git
```

2. Install NPM packages
```sh
npm install
```

3. Create a `.env` file and fill out the following details
```sh
PASSWORD=<bitbucket password>
USERNAME=<bitbucket username>
TEAMNAME=<bitbucket teamname>
BB_PROJECTS=<AB,CD,EF> # comma separated list of project names
SLACK_WEBHOOK_URL=<slack webhook url>
```

When the script is running locally, it will use unencrpyted variables from .env. In production, KMS will be used to encrpyt secrets prior to deploying to Cloud Functions so other can't see your bitbucket password or slack webhook in unencrpyted form. 

## Deployment

Currently, a full, automated setup is supported on GCP via Cloud Scheduler and Cloud Functions, but a similar architecture is possible via AWS CloudWatch and Lambda. 

### GCP

Requirements
- Cloud Scheduler
- Cloud Functions
- Cloud Pub/Sub
- Cloud KMS (optional) 
- gcloud 

Replace the GCP variables under `setup/setGCPvars.sh` 

```sh
export GCP_PROJECT=<YOUR-GCP-PROJECT-NAME>

## Feel free to use these defaults
export GCP_REGION=us-east4
export KMS_KEY_RING=bb-pr-bot
export KMS_KEY=bb-pr-bot-key
export PUBSUB_TOPIC=bb-pr-bot
```

Run `npm setup:gcp` to create Pub/Sub, KMS key ring, IAM bindings, and Cloud Scheduler. 

By default, this will create a Cloud Function named `bitbucket-pr-bot` listening to PubSub topic `bb-pr-bot` that is triggered at 9am ET on weekdays via Cloud Scheduler job `bitbucket-pr-bot-daily`. 

Run `npm encrypt` to create an encrypted version (.env.enc) of your configs. 

Finally, run `npm deploy:gcf` to package and deploy the Cloud Function.

## Custom Parsers
In bitbucket-pull-reminders you can implement custom messages parsers.
This allows you to present the PRs retrieved from BitBucket in any format you like in Slack.
We provided 2 parsers by default for you. 
The `defaultMessageParser.js` is a pretty basic parser while the `exampleMessageParser.js` presents the PRs in a more advanced format (like divide open en approved PRs,...).

### Implementing a custom parser
In order to implement a custom parser you need to take 3 basic steps.

1. Add a js file in the messageParsers folder that exports a class with a static function `type()`.
It is very important that you return a name of your parser here. If you don't do this correctly you will not be able to select your parser.

The code will call the parsePrs function in order to convert the PRs to a Slack message.

2. Add the parser to `messageParsers/index.js`.
Simply import the class and add it to the parsers array.

3. Select the parser using the `SLACK_MESSAGE_PARSER` environment variable.
Set the `SLACK_MESSAGE_PARSER` variable to whatever you called your parser in the static `type()` function of your new parser.

You can base your parsers. On one of the existing ones.
From this point on your imagination is the limit. Get creative, get crazy, get coding :).
If you have any questions feel free to reach out!

## Roadmap

- Include AWS equivalent deployment using Lambda and Cloudwatch
- Make Slack messages more useful (e.g. unmerged branches with all approvals, tag users)
- Other components from Pull Panda (e.g. UI, analytics board, etc) 

## License

Distributed under the MIT License. See `LICENSE.md` for more information.
