#!/bin/bash
#########################################################################
## Install server
## Sets the environment for installing the server 
##
## Author: Alfredo Lainez
## Date: 15/08/2013
#########################################################################

#------------------------------------------------------------------------
# Installation parameters

export GIT_REPOSITORY=https://github.com/mnopi/Labelee_src.git

#export DEPLOYMENT_DIR=/home/alainez/borrar22
#export GIT_CURRENT_BRANCH=Labelee

#------------------------------------------------------------------------

print_header (){
    echo
    echo
    echo "====================================================="
    echo "== $1"
    echo "====================================================="
    echo 
    echo
}

#------------------------------------------------------------------------

print_menu (){

    echo
    echo "====================================================="
    echo "Select number:"
    echo "   1) Do everything except install OpenCV"
    echo "   2) Install Django environment"
    echo "   3) Deploy code"
    echo "   4) Install and start apache"
    echo "   5) Install OpenCV"
    echo "====================================================="
    echo
}

#------------------------------------------------------------------------

read_deployment_dir (){

    echo "Deployment dir? (directory in which the code will be installed):" 
    read DEPLOYMENT_DIR
    export DEPLOYMENT_DIR

}    

#------------------------------------------------------------------------

read_github_branch (){
    
    read -p "Github branch? " GIT_CURRENT_BRANCH
    export GIT_CURRENT_BRANCH
    
}

#------------------------------------------------------------------------

print_menu

read -p "Enter your choice: " opt
case $opt in

    "1")
	read_deployment_dir
	read_github_branch
	    
        # Exit automatically upon errors
	set -e
	
	print_header "Deploying code"
	./code-deployment.sh

	print_header "Installing Django Environment"
	./django-environment.sh
	
	print_header "Configuring apache server"
	./apache-wsgy.sh
        ;;
    "2")
	print_header "Installing Django Environment (needs deployed code or requirements.txt)"
	./django-environment.sh
        ;;
    "3")
	read_deployment_dir
	read_github_branch
	
	print_header "Deploying code"
	./code-deployment.sh
        ;;
    "4")
	read_deployment_dir
	
	print_header "Configuring apache server"
	./apache-wsgy.sh
        ;;
    "5")
	print_header "Installing opencv"
	./opencv-install.sh
	;;
    
    *) echo invalid option;;
esac


#------------------------------------------------------------------------


