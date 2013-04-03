# -*- coding: utf8 -*-

from django.http import HttpResponse
import simplejson


def responseValid():
	"""
	Si el servidor procesa la llamada correctamente se devuelve esto
	"""
	return HttpResponse(simplejson.dumps({'valid': True}))


def responseError(errors):
	"""
	"""
	obj = {'valid': False, 'errors': errors}
	return HttpResponse(simplejson.dumps(obj))
