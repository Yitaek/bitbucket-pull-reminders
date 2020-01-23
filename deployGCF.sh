#!/bin/bash

source ./setup/setGCPvars.sh

gcloud functions deploy bitbucket-pr-bot \
  --region ${GCP_REGION} \
  --runtime nodejs10 \
  --trigger-topic bb-pr-bot \
  --service-account bb-pr-bot-kms-decryptor@${GCP_PROJECT}.iam.gserviceaccount.com \
  --entry-point sendPullRequestReminders 