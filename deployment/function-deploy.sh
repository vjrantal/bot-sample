#!/bin/bash -e
set -o pipefail

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_EVENT_TYPE" = "push" ]
then
  git config --global user.name "Travis CI"
  git config --global user.email "noreply@travis-ci.org"
  cd /tmp
  # We redirect any output to /dev/null to hide
  # any sensitive credential data that might otherwise be exposed.
  git clone --quiet "https://${GIT_USER}:${GIT_PASSWORD}@${GIT_TARGET}" functions > /dev/null 2>&1
  cd functions
  git submodule init
  git submodule update --remote --merge
  git commit -a -m "Deployment commit"
  git push --quiet origin master > /dev/null 2>&1
fi
