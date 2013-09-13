# -*- coding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.http.response import HttpResponseRedirect

from django.shortcuts import render_to_response
from django.template import RequestContext

from django.conf import settings
from utils.constants import USER_GROUPS


@login_required(login_url=settings.LOGIN_URL)
def index(request):
    ctx = {
        '_enclosure': settings.STATIC_URL + 'partials/_enclosure.html',
        'constants': {
            '1': 'Bloqueantes',
            '2': 'Aristas',
            '3': 'Intermedias',
            '4': 'Panoramas'
        }
    }

    # Si es un dueño de una tienda se le redirigirá a su admin de cupones
    if request.user.is_in_group(USER_GROUPS['shop_owners']):
        return HttpResponseRedirect('/coupon/')

    # translation.activate(request.session['django_language'])

    return render_to_response('map_editor/v2/index.html', ctx, context_instance=RequestContext(request))


@login_required(login_url=settings.LOGIN_URL)
def edit(request, pk):
    #import urllib2
    #response = urllib2.urlopen('http://mnopi:1aragon1@localhost:8000/api/v1/map/' + pk)
    #html = response.read()
    ctx = {
    'floor_id': pk
    }
    if request.user.is_in_group(USER_GROUPS['shop_owners']):
        return HttpResponseRedirect('/coupon/')

    return render_to_response('map_editor/v2/edit.html', ctx, context_instance=RequestContext(request))


@login_required(login_url=settings.LOGIN_URL)
def connections(request, enclosure_id):
    ctx = {
    'enclosure_id': enclosure_id
    }
    if request.user.is_in_group(USER_GROUPS['shop_owners']):
        return HttpResponseRedirect('/coupon/')
    return render_to_response('map_editor/v1/connections.html', ctx, context_instance=RequestContext(request))


@login_required(login_url=settings.LOGIN_URL)
def help_page(request):
    if request.user.is_in_group(USER_GROUPS['shop_owners']):
        return HttpResponseRedirect('/coupon/')
    return render_to_response('map_editor/help.html', context_instance=RequestContext(request))

