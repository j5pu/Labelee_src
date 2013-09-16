#!/bin/bash
#########################################################################
## MySQL environment installation
##
## Author: Alfredo Lainez
## Date: 16/08/2013
#########################################################################

TEMPORAL_SQL_SCRIPT=/tmp/dbsql.sql

#-------------------------------------------------------------------------
# List of packages to install, add more here if needed

UNIX_PACKAGES=('mysql-server')

#--------------------------------------------------------------------------

install_package (){
    sudo apt-get install $1 -y
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

set -e

echo 
echo "Dependencies OK"
echo

echo
echo "Creating database..."
echo 
read -p "MySql user: " DB_USER
read -p "Password: " DB_PASSWORD
read -p "SQL Dump: " SQL_DUMP

echo "create database labelee;" > $TEMPORAL_SQL_SCRIPT
mysql -u $DB_USER -p < $TEMPORAL_SQL_SCRIPT
mysql -u root --password=1aragon1 labelee < $SQL_DUMP

echo
echo "MySQL environment successfully installed!"
echo
