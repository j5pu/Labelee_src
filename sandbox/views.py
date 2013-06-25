# Create your views here.
# -*- coding: utf-8 -*-

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse
import sys


def angular(request):
    return render_to_response('sandbox/angular/index.html', context_instance=RequestContext(request))


def ng_services(request):
    return render_to_response('angularjs/services/services.html', context_instance=RequestContext(request))


def test(request):
    return render_to_response('angularjs/test.html', context_instance=RequestContext(request))


def directives(request):
    return render_to_response('angularjs/directives/directives.html', context_instance=RequestContext(request))

def c(request):
    return render_to_response('c/index.html', context_instance=RequestContext(request))

def d(request):
    return render_to_response('d/index.html', context_instance=RequestContext(request))


def show_vinfo(request):
    import os

    if 'VCAP_SERVICES' in os.environ:
        vcap = os.environ['VCAP_SERVICES']
    else:
        vcap = 'no estás en remoto'
        # ctx = {
    #     'vcap': vcap
    # }
    # return render_to_response('vcap_info.html', ctx, context_instance=RequestContext(request))
    return HttpResponse(vcap, mimetype='application/json')


# def arista(request):
#
#     from map_editor.models import *
#     aristas = Point.objects.filter(label__category__name__icontains='arista')
#     ctx = {
#         'aristas': aristas
#     }
#
#     return render_to_response('map_editor/Prototipo Aristas.html', ctx, context_instance=RequestContext(request))




def tlouder(request):
    return render_to_response('tlouder/index2.html', context_instance=RequestContext(request))


def multix(request):
    return render_to_response('labelee/multix.html', context_instance=RequestContext(request))


def imgLoader(request):
    return render_to_response('imgLoader/imgloader.html', context_instance=RequestContext(request))


from django.utils.translation import ugettext as _


def i18n(request):
    # if request.LANGUAGE_CODE == 'es':
    #     return HttpResponse("You prefer to read Spanish.")
    # else:
    #     return HttpResponse("You prefer to read another language.")

    return render_to_response('i18n/test.html', context_instance=RequestContext(request))


def i18n_2(request):
    sentence = 'Welcome to my site.'
    output = _(sentence)
    return HttpResponse(output)


def dblog(request):
    from log.logger import Logger
    # Logger.warning('prueba de alerta!!!')
    Logger.critical('fallo!!!')

    return HttpResponse('ok')