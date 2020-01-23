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

## Roadmap

- Include AWS equivalent deployment using Lambda and Cloudwatch
- Make Slack messages more useful (e.g. unmerged branches with all approvals, tag users)
- Other components from Pull Panda (e.g. UI, analytics board, etc) 

## License

Distributed under the MIT License. See `LICENSE.md` for more information.
