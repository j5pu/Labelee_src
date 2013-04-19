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


def slug_to_class_name(slug):
	"""
	Recibimos un slug y lo devolvemos formateado para que luego podamos encontrar la
	correspondiente clase con el método getattr([modulo], [nombre_de_clase])

	Xej:
		slug = 'object-category'
		return = 'ObjectCategory'
	"""
	sal = ''
	for word in slug.split('-'):
		sal += word.capitalize()

	return sal


import imp
import sys
from map_editor import models

#----------------------------------------------------------------------


def dynamic_importer(name, class_name):
	"""
	Dynamically imports modules / classes
	"""
	try:
		fp, pathname, description = imp.find_module(name)
	except ImportError:
		print "unable to locate module: " + name
		return (None, None)

	try:
		example_package = imp.load_module(name, fp, pathname, description)
	except Exception, e:
		print e

	try:
		myclass = imp.load_module("%s.%s" % (name, class_name), fp, pathname, description)
		print myclass
	except Exception, e:
		print e

	return example_package, myclass

if __name__ == "__main__":
	module, modClass = dynamic_importer("decimal", "Context")
