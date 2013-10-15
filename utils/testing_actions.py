# -*- coding: utf-8 -*-


#
# Este módulo nos servirá para realizar acciones comunes en los tests (loguearse, crear usuario, etc)
#
from django.contrib.auth.models import Group

from django.test import Client


def log_staff():
    post_data = {
        'username': 'mnopi',
        'password': '1aragon1'
    }
    return Client().post('/accounts/login/', post_data)


def logout():
    return Client().get('/accounts/logout/')


def initialize_database():
    Group.objects.create(name='enclosure_owners')
    Group.objects.create(name='shop_owners')
