#!/bin/bash
#######################################################################
## Code deployment from git repositories
##
## Author: Alfredo Lainez
## Date: 15/08/2013
#######################################################################

set -e
sudo apt-get install git
mkdir $DEPLOYMENT_DIR
cd $DEPLOYMENT_DIR
git clone $GIT_REPOSITORY .
git checkout $GIT_CURRENT_BRANCH

echo ""
echo " Collect static !! "
echo ""
PYTHONPATH=$PYTHONPATH:$DEPLOYMENT_DIR
python manage.py collectstatic --settings=settings.prod