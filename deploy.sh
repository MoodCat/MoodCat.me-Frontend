#!/bin/bash
echo "Pulling latest version..."
git pull > /dev/null || { echo "Git pull failed, exiting"; exit 1; }
echo "Executing grunt build..."
grunt build > /dev/null || { echo "Grunt build failed, exiting"; exit 1; }
echo "Copying needed files to dist/..."
cp -r app/mocks dist/
cp -r bower_components/ui-router-extras dist/bower_components/
cp -r app/images/arousal/* dist/images/arousal/
cp -r app/images/valence/* dist/images/valence/
echo "Removing /usr/share/nginx/html/dist"
ssh moodcat@moodcat.me 'rm -r /usr/share/nginx/html/dist' || { echo "Connecting to server failed, exiting"; exit 1; }
echo "Deploying new dist/"
scp -r dist moodcat@moodcat.me:/usr/share/nginx/html/dist/ > /dev/null
echo "Done."
exit 0
