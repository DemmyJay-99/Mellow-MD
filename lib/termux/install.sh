#!/data/data/com.termux/files/usr/bin/bash

# Update packages
echo "Updating packages..."
pkg update && pkg upgrade -y

# Install proot-distro (recommended for full Linux environment)
echo "Installing proot-distro..."
pkg install proot-distro -y
echo "proot-distro installed successfully."
proot-distro install ubuntu
echo "Ubuntu installed successfully."
proot-distro login ubuntu