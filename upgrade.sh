#!/bin/bash
# exit if there's an arror
set -e
cd "$(dirname "$0")"
echo 'Fetching updates from GitHub'
git fetch https://github.com/WillShaw1100/BiscuitBot
echo 'Installing node packages'
npm install

