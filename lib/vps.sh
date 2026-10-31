#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "=== Mellow-MD Installation ==="

echo "Updating packages..."
sudo apt update

echo "Installing required packages..."
sudo apt install -y git ffmpeg build-essential libvips-dev webp curl ca-certificates

echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

echo "Installing Yarn and PM2..."
sudo npm install -g yarn pm2

echo "Cloning Mellow-MD..."
if [ -d "Mellow-MD/.git" ]; then
  echo "Already cloned, skipping."
else
  git clone https://github.com/DemmyJay-99/Mellow-MD.git
fi

cd Mellow-MD

if [ ! -f config.env ]; then
  if [ -f .env.example ]; then
    cp .env.example config.env
  else
    echo "Error: .env.example not found." >&2
    exit 1
  fi
fi

# Only open the editor in an interactive terminal
if [ -t 0 ]; then
  nano config.env
else
  echo "Non-interactive shell: edit config.env manually before starting."
  exit 0
fi

yarn install
yarn start 