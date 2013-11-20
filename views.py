from django.contrib.auth import authenticate
from django.http import HttpResponse

import sys
from map_editor.models import CustomUser


def createuser(request):
    # TODO: Don't actually use this bogus admin account.
    default_username = 'mnopi'
    default_pass = '1aragon1'
    default_email = 'you@example.com'
    if authenticate(username=default_username, password=default_pass) is not None:
        return HttpResponse("User already created.")
    try:
        user = CustomUser.objects.create_user(default_username, default_email, default_pass)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return HttpResponse("User created!")
    except:
        print sys.exc_info()[0]
        return HttpResponse("Couldn\'t create user.")