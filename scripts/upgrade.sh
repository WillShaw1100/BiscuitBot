#!/bin/bash
# exit if there's an arror
github_repo="https://github.com/WillShaw1100/BiscuitBot"
script_dir="$(dirname "$0")"

set -e

# finds the index.js directory
if test -f $script_dir/index.js; then
    # if the bot is in the same dir
    bot_dir="$script_dir"
elif test -f $script_dir/../index.js; then
    # if the bot is in the parent dir
    bot_dir="$script_dir/../"
else
    # if index.js s not found then exit
    echo 'Cannot find the bot directory'
    exit
fi

cd $bot_dir
echo 'Fetching updates from GitHub'
git fetch $github_repo
git pull $github_repo
echo 'Installing node packages'
npm install
