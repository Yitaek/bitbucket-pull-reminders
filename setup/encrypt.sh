#!/bin/bash

source ./setup/setGCPvars.sh

if [ "$1" != "encrypt" ] && [ "$1" != "decrypt" ]; then
  echo "   Invalid option: choose encrypt or decrypt"
  exit 1
fi

action=$1

encrypt_options(){
  if [ "$action" = "encrypt" ]; then
    encrypt
  else
    decrypt
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

encrypt_options
