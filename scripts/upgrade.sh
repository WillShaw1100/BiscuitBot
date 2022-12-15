#!/bin/bash
# exit if there's an arror
set -e
# sets the directory variable to the scripts dir
script_dir="$(dirname "$0")"
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
git fetch https://github.com/WillShaw1100/BiscuitBot
echo 'Installing node packages'
npm install
