#!/bin/bash
####################################################
## Open CV installation. 
## Following the official installation guide for linux:
## http://docs.opencv.org/trunk/doc/tutorials/introduction/linux_install/linux_install.html
##
## Author: Alfredo Lainez
## Date: 15/08/2013
####################################################

#-------------------------------------------------------------------------
# List of packages to install, if needed add more here

PACKAGES=('build-essential'
          'cmake'
	  'python-dev'
	  'python-numpy'
	  'ffmpeg')
#-------------------------------------------------------------------------

install_package (){
    sudo apt-get install $1 -y --force-yes >> log_opencv_installation.txt
}

#-------------------------------------------------------------------------

rm log_opencv_installation.txt
touch log_opencv_installation.txt

echo
echo "Checking and installing dependencies..."
echo 

for package in ${PACKAGES[@]}
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
echo "All dependencies were complied"
echo 


# From now on exit automatically upon errors
set -e

# Tar
rm -rfv opencv > /dev/null
mkdir opencv
cp opencv-2.4.6.1.tar.gz opencv
cd opencv
tar -xf opencv-2.4.6.1.tar.gz
cd opencv-2.4.6.1

# Install opencv
mkdir cmake_binary_dir
cd cmake_binary_dir/

echo
echo "Compilation and installation of OpenCV will begin now" 
echo

cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local ..
make
sudo make install

echo
echo "OpenCV successfully installed!"
echo 