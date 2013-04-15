# -*- coding: utf8 -*-

from django.http import HttpResponse
import simplejson


def responseJSON(**kwargs):
	"""
	Devuelve la respuesta del servidor en formato JSON con:

		* errors	- errores al procesar datos inválidos
		* data		- datos devueltos en la respuesta

		e.g.
			response(errors=form.errors, data=place.id) devolverá:

			{
				'errors': {
					name: ['El lugar indicado ya existe'],
					img: ['La imágen supera los 25MB']
				},

				'data': 25
			}
	"""

	errors = None
	data = None

	for key in kwargs:
		if key == 'errors':
			errors = kwargs[key]
		elif key == 'data':
			data = kwargs[key]

	return HttpResponse(simplejson.dumps({'errors': errors, 'data': data}))
