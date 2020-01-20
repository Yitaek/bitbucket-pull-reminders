#!/bin/bash

if [ "$1" != "encrypt" ] && [ "$1" != "decrypt" ] && [ "$1" != "setup" ]; then
  echo "   Invalid option: choose encrypt, decrypt, or setup"
  exit 1
fi

action=$1
GCP_PROJECT=leverege-dev-yitaek
GCP_REGION=us-east4
KMS_KEY_RING=bb-pr-bot
KMS_KEY=bb-pr-bot-key

encrypt_options(){
  if [ "$action" = "encrypt" ]; then
    encrypt
  elif [ "$action" = "decrypt" ]; then
    decrypt
  else
    setup
  fi
}

encrypt(){
  echo "Encrypting .env file --> .env.enc"
  gcloud kms encrypt --project ${GCP_PROJECT} \
    --key ${KMS_KEY} \
    --keyring ${KMS_KEY_RING} \
    --location ${GCP_REGION} \
    --plaintext-file .env \
    --ciphertext-file .env.enc
}

decrypt(){
  echo "Decrypting .env.enc file --> .env"
  gcloud kms decrypt --project ${GCP_PROJECT} \
    --key ${KMS_KEY} \
    --keyring ${KMS_KEY_RING} \
    --location ${GCP_REGION} \
    --plaintext-file .env \
    --ciphertext-file .env.enc
}

setup(){
  echo "Creating KMS key and key ring"

  ## Enable KMS API
  gcloud services enable \
    cloudkms.googleapis.com \
    --project ${GCP_PROJECT}

  ## Create key ring
  gcloud kms keyrings create ${KMS_KEY_RING} \
    --location ${GCP_REGION} \
    --project ${GCP_PROJECT}

  ## Create key
  gcloud kms keys create ${KMS_KEY} \
    --location ${GCP_REGION}  \
    --keyring ${KMS_KEY_RING} \
    --purpose encryption \
    --project ${GCP_PROJECT}
}

encrypt_options
