# -*- coding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.http.response import HttpResponseRedirect

from django.shortcuts import render_to_response
from django.template import RequestContext

from django.conf import settings
from map_editor.models import Enclosure
from utils.constants import USER_GROUPS


@login_required(login_url=settings.LOGIN_URL)
def index(request):
    # Si es un dueño de recintos se le redirigirá al dashboard de su primer recinto.
    # Si el dueño no tiene recintos no podrá acceder.
    if request.user.is_in_group(USER_GROUPS['enclosure_owners']):
        if len(Enclosure.objects.filter(owner=request.user)) > 0:
            first_enclosure_id = Enclosure.objects.filter(owner=request.user)[0].id
            return HttpResponseRedirect('/dashboard/' + str(first_enclosure_id))
        else:
            return HttpResponseRedirect('/accounts/logout/')

    # Si no es staff y no pertenece a ningún grupo se considerará no válido.
    # De momento los dueños de las tiendas tampoco podrán acceder a ninguna página
    # de la administración.
    if not request.user.is_valid or request.user.is_in_group(USER_GROUPS['shop_owners']):
        return HttpResponseRedirect('/accounts/logout/')

    ctx = {
        '_enclosure': settings.STATIC_URL + 'partials/_enclosure.html'
    }
    return render_to_response('map_editor/v2/index.html', ctx, context_instance=RequestContext(request))


@login_required(login_url=settings.LOGIN_URL)
def edit(request, pk):
    # Sólo el staff podrá acceder a la edición de POIs
    if request.user.is_staff:
        return render_to_response('map_editor/v2/edit.html', {'floor_id': pk}, context_instance=RequestContext(request))
    else:
        return HttpResponseRedirect('/accounts/logout/')


@login_required(login_url=settings.LOGIN_URL)
def connections(request, enclosure_id):
    # Sólo el staff podrá editar conexiones entre plantas
    if request.user.is_staff:
        return render_to_response('map_editor/connections.html', {'enclosure_id': enclosure_id}, context_instance=RequestContext(request))
    else:
        return HttpResponseRedirect('/accounts/logout/')


@login_required(login_url=settings.LOGIN_URL)
def help_page(request, section=None):
    # De momento sólo el staff podrá acceder a la ayuda
    if request.user.is_staff:
        template = 'enclosure-manager' if not section else section
        return render_to_response('map_editor/help/' + template + '.html', context_instance=RequestContext(request))
    else:
        return HttpResponseRedirect('/accounts/logout/')