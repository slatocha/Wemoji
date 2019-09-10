#!/bin/bash
# simple git push and versioning script (package.json)

############################################################
# IMPORTANT
# before using always check that you are on master and are up to date
# Versioning the application inside package.json and push all commits to git
############################################################

############################################################
if test "$1" = "-v" -o "$1" = "--version"; then
  if [[ $2 =~ ^-?[0-9.]+$ ]]; then
    echo -e "Executing npm version patch for version $2 - additionally push the commit including its tag to git " \
    && (npm version $2 -m "Version Script - Updated the package.json version number to $2 via script") \
    && (git push) && (git push --tags)
  else 
    # default patch 
    echo -e "Executing default npm version patch - push the commit including its tag to git " \
    && (npm version patch -m "Version Script - Updated the package.json version number via script") \
    && (git push) && (git push --tags)
  fi
else 
  # default patch 
  echo -e "Executing default npm version patch - push the commit including its tag to git " \
  && (npm version patch -m "Version Script - Updated the package.json version number via script") \
  && (git push) && (git push --tags)
fi