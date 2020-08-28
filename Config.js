async function decrypt(
    projectId = 'leverege-dev-yitaek', // Your GCP projectId
    keyRingId = 'bb-pr-bot',
    locationId = 'us-east4', // Name of the crypto key's key ring
    cryptoKeyId = 'bb-pr-bot-key', // Name of the crypto key, e.g. "my-key"
    ciphertextFileName = '.env.enc',
) {
  const fs = require('fs');
  const {promisify} = require('util')
  const dotenv = require('dotenv')

  const kms = require('@google-cloud/kms')
  const client = new kms.KeyManagementServiceClient()
  const readFile = promisify(fs.readFile)

  const ciphertext = await readFile(ciphertextFileName)
  const name = client.cryptoKeyPath(
      projectId,
      locationId,
      keyRingId,
      cryptoKeyId
  )

  // Decrypts the file using the specified crypto key
  const [result] = await client.decrypt({name, ciphertext})

  const envConfig = dotenv.parse(result.plaintext)

  return envConfig
}

async function create() {
  let envConfig = require('dotenv').config()

  if (process.env.K_SERVICE) {
    envConfig = await decrypt()
  }

  const config = {
    bitbucket: {
      auth: {
        type: 'basic',
        username: process.env.USERNAME || envConfig.USERNAME,
        password: process.env.PASSWORD || envConfig.PASSWORD,
      },
      teamName: process.env.TEAMNAME || envConfig.TEAMNAME,
      projects: process.env.BB_PROJECTS || envConfig.BB_PROJECTS
    },
    slack: {
      webhook: {
        url: process.env.SLACK_WEBHOOK_URL || envConfig.SLACK_WEBHOOK_URL,
        defaults: {
          username: process.env.SLACK_BOT_NAME || envConfig.SLACK_BOT_NAME,
          icon_emoji: process.env.SLACK_BOT_EMOJI || envConfig.SLACK_BOT_EMOJI
        }
      }
    },
    parser: {
      type: process.env.SLACK_MESSAGE_PARSER || envConfig.SLACK_MESSAGE_PARSER,
      options: JSON.parse(process.env.SLACK_MESSAGE_PARSER_OPTIONS || envConfig.SLACK_MESSAGE_PARSER_OPTIONS || '{}')
    }
  }
  return config
}

module.exports = {
  create
}
