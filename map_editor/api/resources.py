# -*- coding: utf-8 -*-

from django.contrib.auth.models import User

from tastypie.authorization import DjangoAuthorization
from tastypie.authentication import BasicAuthentication
from tastypie.paginator import Paginator
# from tastypie.authorization import Authorization
from tastypie.validation import FormValidation
# from tastypie.authentication import Authentication

from tastypie.resources import ModelResource, ALL

#
# Para poder sacar en la api la lista de mapas para el lugar y el lugar al que pertenece el mapa
#
# http://obroll.com/django-tastypie-one-to-many-fields-related-models-reverse-backward/
from tastypie import fields

from map_editor.models import Place, Map
from map_editor.forms import PlaceForm


class UserResource(ModelResource):
	class Meta:
		resource_name = 'users'
		queryset = User.objects.all()
		# excludes = ['email', 'password', 'is_staff', 'is_superuser']
		# allowed_methods = ['get']
		# authorization = DjangoAuthorization()
		# authentication = BasicAuthentication()
		# include_resource_uri = False

	def determine_format(self, request):
		"""
		Sobreescribiendo este método conseguimos quitar el /?format=json de las
		URLs y dejarlo por defecto
		"""
		return 'application/json'


class PlaceResource(ModelResource):
	maps = fields.ToManyField('map_editor.api.resources.MapResource',
		'maps', full=True, null=True)

	class Meta:
		# resource_name = 'places'
		queryset = Place.objects.all()
		include_resource_uri = False
		authorization = DjangoAuthorization()
		authentication = BasicAuthentication()
		validation = FormValidation(form_class=PlaceForm)
		filtering = {
			'name': ALL,
		}
		paginator_class = Paginator

		# http://stackoverflow.com/questions/10138169/returning-data-on-post-in-django-tastypie
		always_return_data = True

	def determine_format(self, request):
		return 'application/json'


class MapResource(ModelResource):
	place = fields.ToOneField(PlaceResource, 'place')

	class Meta:
		resource_name = 'maps'
		queryset = Map.objects.all()
		include_resource_uri = False

	def determine_format(self, request):
		return 'application/json'
