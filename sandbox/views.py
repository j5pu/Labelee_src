# Create your views here.
# -*- coding: utf8 -*-

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse


def angular(request):
	return render_to_response('sandbox/angular/index.html', context_instance=RequestContext(request))


def ng_services(request):
	return render_to_response('angularjs/services/services.html', context_instance=RequestContext(request))


def test(request):
	return render_to_response('angularjs/test.html', context_instance=RequestContext(request))


def directives(request):
    return render_to_response('angularjs/directives/directives.html', context_instance=RequestContext(request))


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

def test_alfredo(request):
    ctx = {
        'genero': 'hombre super man'
    }
    return render_to_response('alfredo_test/test.html', ctx, context_instance=RequestContext(request))