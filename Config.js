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
  require('dotenv').config()

  let envConfig

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
      teamName: process.env.TEAMNAME || envConfig.TEAMNAME
    },
    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL || envConfig.SLACK_WEBHOOK_URL
    }
  }
  return config
}

module.exports = {
  create
}
