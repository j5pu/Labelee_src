#!/bin/bash
#########################################################################
## Django environment installation
##
## Author: Alfredo Lainez
## Date: 15/08/2013
#########################################################################


#-------------------------------------------------------------------------
# List of packages to install, add more here if needed

UNIX_PACKAGES=('git' 'python-pip' 'python-dev' 'libmysqlclient-dev')

if [ ! -z "$DEPLOYMENT_DIR" ]
then
    REQUIREMENTS_FILE=${DEPLOYMENT_DIR}/requirements/prod.txt
else
    REQUIREMENTS_FILE=requirements.txt
fi
#--------------------------------------------------------------------------

install_pip_package (){
    sudo pip install $1 >> log_django_installation.txt
}

install_package (){
    sudo apt-get install $1 -y >> log_django_installation.txt
}

#--------------------------------------------------------------------------

echo
echo "Checking and installing dependencies..."
echo

for package in ${UNIX_PACKAGES[@]}
do
    install_package $package
    if [ $? -eq 0 ] 
    then
	echo "Installed (or present in the system): $package"
    else
	echo "Error with $package installation"
	exit -1
    fi	
done

echo
echo "Checking and installing pip packages..."
echo

set -e
pip install -r $REQUIREMENTS_FILE

echo
echo "Django environment successfully installed!"
echo