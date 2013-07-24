# -*- coding: utf-8 -*-
#sfrom StdSuites.QuickDraw_Graphics_Suite import _Prop_ordering

from django.contrib.auth.models import User

from tastypie.authorization import Authorization, DjangoAuthorization
from tastypie.authentication import BasicAuthentication, ApiKeyAuthentication, SessionAuthentication
from tastypie.bundle import Bundle
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
from map_editor.api.resource_authorization import ResourceAuthorization

from map_editor.models import *
from route.models import *
from log.models import *
from map_editor.forms import EnclosureForm


class UserResource(ModelResource):
    class Meta:
        resource_name = 'user'
        queryset = User.objects.all()
        # authentication = SessionAuthentication()
        # authorization = DjangoAuthorization()
        authorization = ResourceAuthorization('user')
        filtering = {
            'id': ALL,
            }

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
        queryset = Enclosure.objects.all()
        include_resource_uri = True
        authorization = ResourceAuthorization('owner')
        always_return_data = True
        filtering = {
            'owner': ALL_WITH_RELATIONS,
            'id': ALL
            }

    def determine_format(self, request):
        return 'application/json'


class FloorResource(ModelResource):
    enclosure = fields.ToOneField(EnclosureResource, 'enclosure')

    # place = fields.ForeignKey(EnclosureResource, 'place')

    class Meta:
        queryset = Floor.objects.all()
        authorization = ResourceAuthorization('enclosure__owner')
        include_resource_uri = True
        filtering = {
            'enclosure': ALL_WITH_RELATIONS,
            'id': ALL,
        }
        ordering = {
            'floor_number': ALL
        }
        always_return_data = True
        max_limit = 5000

    def determine_format(self, request):
        return 'application/json'


class PointResource(ModelResource):
    floor = fields.ToOneField(FloorResource, 'floor')
    label = fields.ToOneField('map_editor.api.resources.LabelResource', 'label')
    qr_code = fields.ToOneField('map_editor.api.resources.QRCodeResource', 'qr_code', null=True)
    # connection_init = fields.ToOneField('map_editor.api.resources.ConnectionResource', 'connection_init', null=True)
    # connection_end = fields.ToOneField('map_editor.api.resources.ConnectionResource', 'connection_end', null=True)
    # qr_code = fields.ToOneField('map_editor.api.resources.QRCodeResource', 'qr_code', null=True)
    # route = fields.ToOneField('map_editor.api.resources.RouteResource', 'route', null=True)
    # connections = fields.ToManyField('map_editor.api.resources.ConnectionResource', 'connections', null=True)
    # connections2 = fields.ToManyField('map_editor.api.resources.ConnectionResource', 'connections2', null=True)


    class Meta:
        queryset = Point.objects.all()
        authorization = ResourceAuthorization('floor__enclosure__owner')
        always_return_data = True
        filtering = {
            'floor': ALL_WITH_RELATIONS,
            'label': ALL_WITH_RELATIONS,
            'id': ALL,
            'row': ALL,
            'col': ALL,
            'description': ALL,
            'panorama': ALL
        }
        ordering = {
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
        authorization = ResourceAuthorization('category__enclosure__owner')
        always_return_data = True
        filtering = {
            'id': ALL,
            'name': ALL,
            'category': ALL_WITH_RELATIONS,
            'points': ALL_WITH_RELATIONS
        }
        max_limit = 5000

    def determine_format(self, request):
        return 'application/json'


class LabelCategoryResource(ModelResource):
    labels = fields.ToManyField('map_editor.api.resources.LabelResource', 'labels', null=True, blank=True)
    enclosure = fields.OneToOneField('map_editor.api.resources.EnclosureResource', 'enclosure', null=True, full=True)

    class Meta:
        resource_name = 'label-category'
        queryset = LabelCategory.objects.all()
        authorization = ResourceAuthorization('enclosure__owner')
        always_return_data = True
        filtering = {
            'id': ALL,
            'name': ALL,
            'color': ALL,
            'icon': ALL,
            'labels': ALL_WITH_RELATIONS,
            'enclosure': ALL_WITH_RELATIONS,
        }

    def determine_format(self, request):
        return 'application/json'


# class RecipeResource(ModelResource):
#     ingredients = fields.ToManyField(RecipeIngredientResource,
#                                      attribute=lambda bundle: bundle.obj.ingredients.through.objects.filter(
#                                          recipe=bundle.obj) or bundle.obj.ingredients, full=True)
#     class Meta:
#         queryset = Recipe.objects.all()
#         resource_name = 'recipe'

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
            'init': ALL_WITH_RELATIONS,
            'end': ALL_WITH_RELATIONS,
            }

    def determine_format(self, request):
        return 'application/json'


class RouteResource(ModelResource):
    origin = fields.ToOneField('map_editor.api.resources.PointResource', 'origin', full=True)
    destiny = fields.ToOneField('map_editor.api.resources.PointResource', 'destiny', full=True)
    steps = fields.ToManyField('map_editor.api.resources.StepResource', 'steps', null=True, full=True)

    class Meta:
        resource_name = 'route'
        queryset = Route.objects.all()
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        always_return_data = True
        filtering = {
            'id': ALL,
            'origin': ALL_WITH_RELATIONS,
            'destiny': ALL_WITH_RELATIONS
            }

    def determine_format(self, request):
        return 'application/json'


class StepResource(ModelResource):
    route = fields.ToOneField('map_editor.api.resources.RouteResource', 'route')
    floor = fields.ToOneField('map_editor.api.resources.FloorResource', 'floor')

    class Meta:
        resource_name = 'step'
        queryset = Step.objects.all()
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        always_return_data = True
        filtering = {
            'id': ALL,
            'origin': ALL_WITH_RELATIONS,
            'destiny': ALL_WITH_RELATIONS
        }

    def determine_format(self, request):
        return 'application/json'


class LogEntryResource(ModelResource):

    class Meta:
        resource_name = 'log-entry'
        queryset = LogEntry.objects.all()
        authorization = DjangoAuthorization()
        # authentication = BasicAuthentication()
        always_return_data = True
        filtering = {
            'id': ALL,
            'category': ALL,
            'message': ALL,
            'when': ALL
        }

    def determine_format(self, request):
        return 'application/json'
