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
SLACK_WEBHOOK_URL=<slack webhook url>
```

## Roadmap

- Include AWS and GCP deployment artifacts (e.g. serverless.io, terraform) 
- Refactor code and make it more dynamic
- Other components from Pull Panda (e.g. UI, analytics board, etc) 

## License

Distributed under the MIT License. See `LICENSE.md` for more information.
