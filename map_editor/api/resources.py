# -*- coding: utf-8 -*-

from django.contrib.auth.models import User

from tastypie.authorization import DjangoAuthorization, Authorization
from tastypie.authentication import BasicAuthentication, ApiKeyAuthentication
from tastypie.paginator import Paginator
# from tastypie.authorization import Authorization
from tastypie.validation import FormValidation
# from tastypie.authentication import Authentication

from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS

#
# Para poder sacar en la api la lista de mapas para el lugar y el lugar al que pertenece el mapa
#
# http://obroll.com/django-tastypie-one-to-many-fields-related-models-reverse-backward/
from tastypie import fields

from map_editor.models import *
from route.models import *
from map_editor.forms import EnclosureForm


class UserResource(ModelResource):
    class Meta:
        resource_name = 'user'
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


class EnclosureResource(ModelResource):
    floors = fields.ToManyField('map_editor.api.resources.FloorResource', 'floors', null=True)
    owner = fields.ToOneField(UserResource, 'owner', null=False)

    class Meta:
        # resource_name = 'places'
        queryset = Enclosure.objects.all()
        include_resource_uri = True
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        # 		validation = FormValidation(form_class=EnclosureForm)
        filtering = {
            'name': ALL,
            'id': ALL,
            'floors': ALL_WITH_RELATIONS
        }
        paginator_class = Paginator

        # http://stackoverflow.com/questions/10138169/returning-data-on-post-in-django-tastypie
        always_return_data = True

    def determine_format(self, request):
        return 'application/json'


class FloorResource(ModelResource):
    enclosure = fields.ToOneField(EnclosureResource, 'enclosure')

    # place = fields.ForeignKey(EnclosureResource, 'place')

    class Meta:
        queryset = Floor.objects.all()
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        include_resource_uri = True
        filtering = {
            'enclosure': ALL_WITH_RELATIONS,
            'id': ALL
        }
        always_return_data = True
        max_limit = 5000

    def determine_format(self, request):
        return 'application/json'


class PointResource(ModelResource):
    floor = fields.ToOneField(FloorResource, 'floor')
    label = fields.ToOneField('map_editor.api.resources.LabelResource', 'label')
    qr_code = fields.ToOneField('map_editor.api.resources.QRCodeResource', 'qr_code', null=True)
    # connections = fields.ToManyField('map_editor.api.resources.ConnectionResource', 'connections', null=True)
    # connections2 = fields.ToManyField('map_editor.api.resources.ConnectionResource', 'connections2', null=True)


    class Meta:
        queryset = Point.objects.all()
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        # usando apikey:
        # authentication = ApiKeyAuthentication()
        always_return_data = True
        filtering = {
            'floor': ALL_WITH_RELATIONS,
            'label': ALL_WITH_RELATIONS,
            'id': ALL,
            'row': ALL,
            'col': ALL,
            'description': ALL
        }
        max_limit = 5000

    def determine_format(self, request):
        return 'application/json'


class LabelResource(ModelResource):
    category = fields.ToOneField('map_editor.api.resources.LabelCategoryResource', 'category')
    # points = fields.ToManyField('map_editor.api.resources.PointResource', 'points', null=True)

    class Meta:
        queryset = Label.objects.all()
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        always_return_data = True
        filtering = {
            'id': ALL,
            'category': ALL_WITH_RELATIONS,
            'points': ALL_WITH_RELATIONS
        }
        max_limit = 5000

    def determine_format(self, request):
        return 'application/json'


class LabelCategoryResource(ModelResource):
    labels = fields.ToManyField('map_editor.api.resources.LabelResource', 'labels', null=True, blank=True)

    class Meta:
        resource_name = 'label-category'
        queryset = LabelCategory.objects.all()
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        always_return_data = True
        filtering = {
            'id': ALL,
            'name': ALL,
            'color': ALL,
            'labels': ALL_WITH_RELATIONS,
        }

    def determine_format(self, request):
        return 'application/json'


class QRCodeResource(ModelResource):
    point = fields.ToOneField('map_editor.api.resources.PointResource', 'point', full=True)

    class Meta:
        resource_name = 'qr-code'
        queryset = QR_Code.objects.all()
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        always_return_data = True
        filtering = {
            'id': ALL,
            'point': ALL_WITH_RELATIONS,
        }

    def determine_format(self, request):
        return 'application/json'


class ConnectionResource(ModelResource):
    init = fields.ToOneField('map_editor.api.resources.PointResource', 'init', full=True)
    end = fields.ToOneField('map_editor.api.resources.PointResource', 'end', full=True)

    class Meta:
        resource_name = 'connection'
        queryset = Connection.objects.all()
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        always_return_data = True
        filtering = {
            'id': ALL,
            'init': ALL_WITH_RELATIONS
            }

    def determine_format(self, request):
        return 'application/json'

