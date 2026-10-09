#!/usr/bin/env bash
set -e

echo "Setting up Termux environment..."
apt update && apt upgrade -y
echo "Installing required packages..."
apt install -y git ffmpeg build-essential libvips-dev webp curl ca-certificates
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs
echo "Installing Yarn package manager..."
npm install -g yarn
echo "Cloning Mellow-MD repository..."
if [ -d "Mellow-MD/.git" ]; then echo "Mellow-MD is already cloned. Skipping clone." else git clone https://github.com/DemmyJay-99/Mellow-MD.git && cd Mellow-MD; fi
if [ ! -f config.env ]; then if [ -f .env.example ]; then cp .env.example config.env else echo "Error: .env.example was not found." exit 1 fi fi
nano config.env
yarn install
npm start