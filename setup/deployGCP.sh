#!/bin/bash

source ./setup/setGCPvars.sh

# Set GCP defaults
gcloud config set project ${GCP_PROJECT}

# Create PubSub topic
gcloud pubsub topics create bb-pr-bot

# Create KMS key ring and key
gcloud services enable \
  cloudkms.googleapis.com \
  --project ${GCP_PROJECT}

gcloud kms keyrings create ${KMS_KEY_RING} \
  --location ${GCP_REGION} \
  --project ${GCP_PROJECT}

gcloud kms keys create ${KMS_KEY} \
  --location ${GCP_REGION}  \
  --keyring ${KMS_KEY_RING} \
  --purpose encryption \
  --project ${GCP_PROJECT}
}

# Create svc account 
gcloud iam service-accounts create bb-pr-bot-kms-decryptor

# Bind KMS IAM role
gcloud kms keys add-iam-policy-binding ${KMS_KEY} \
  --location ${GCP_REGION} \
  --keyring ${KMS_KEY_RING} \
  --member "serviceAccount:bb-pr-bot-kms-decryptor@${GCP_PROJECT}.iam.gserviceaccount.com" \
  --role roles/cloudkms.cryptoKeyDecrypter

# Set up Cloud Scheduler
gcloud beta scheduler jobs create pubsub bitbucket-pr-bot-daily \
  --schedule "0 9 * * 1-5" \
  --topic bb-pr-bot \
  --message-body "{}" \
  --time-zone "America/New_York"
