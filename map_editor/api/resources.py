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
from coupon_manager.models import Coupon, CouponForLabel, CouponForEnclosure
from utils.constants import USER_GROUPS
from utils.helpers import random_string_generator, delete_file
from django.contrib.auth.models import Group

#
# Para poder sacar en la api la lista de mapas para el lugar y el lugar al que pertenece el mapa
#
# http://obroll.com/django-tastypie-one-to-many-fields-related-models-reverse-backward/
from tastypie import fields
from map_editor.api.resource_authorization import ResourceAuthorization

from map_editor.models import *
from route.models import *
from log.models import *


class CustomUserResource(ModelResource):
    class Meta:
        resource_name = 'user'
        queryset = CustomUser.objects.all()
        authorization = ResourceAuthorization('user')
        filtering = {
            'id': ALL,
            'username': ALL,
            }

    def determine_format(self, request):
        """
        Sobreescribiendo este método conseguimos quitar el /?format=json de las
        URLs y dejarlo por defecto
        """
        return 'application/json'


class EnclosureResource(ModelResource):
    floors = fields.ToManyField('map_editor.api.resources.FloorResource', 'floors', null=True)
    owner = fields.ToOneField(CustomUserResource, 'owner', null=False)

    class Meta:
        queryset = Enclosure.objects.all()
        include_resource_uri = True
        authorization = ResourceAuthorization('owner')
        always_return_data = True
        filtering = {
            'owner': ALL_WITH_RELATIONS,
            'id': ALL,
            'name': ALL
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
            'name': ALL,
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

    class Meta:
        queryset = Point.objects.select_related('floor', 'label', 'qr_code').all()
        #queryset = Point.objects.all()
        authorization = ResourceAuthorization('floor__enclosure__owner')
        always_return_data = True
        filtering = {
            'floor': ALL_WITH_RELATIONS,
            'label': ALL_WITH_RELATIONS,
            'id': ALL,
            'row': ALL,
            'col': ALL,
            'description': ALL,
            'panorama': ALL,
            'coupon': ALL
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

    def obj_create(self, bundle, **kwargs):
        """
        Si la etiqueta creada no es genérica (tiene enclosure asociado para su categoría)
        entonces se crea un usuario dueño de ella
        """
        label_created = super(LabelResource, self).obj_create(bundle, user=bundle.request.user)

        if label_created.obj.category.enclosure:
            label_name = label_created.obj.name
            enclosure_name = label_created.obj.category.enclosure.name
            username = label_name + '_' + enclosure_name
            # todo: cambiar a generación aleatoria
            password = '1234'
            # password = random_string_generator(6)

            custom_user = CustomUser().create(username, password)

            g = Group.objects.get(id=USER_GROUPS['shop_owners'])
            g.user_set.add(custom_user.user_ptr)

            label_created.obj.owner = custom_user
            label_created.obj.save()

        return label_created

    def obj_update(self, bundle, **kwargs):
        """
        Si editamos el nombre para la etiqueta también se modifica el nombre
        de usuario para su dueño
        """
        label_updated = super(LabelResource, self).obj_update(bundle, **kwargs)

        if label_updated.obj.category.enclosure:
            label_name = label_updated.obj.name
            enclosure_name = label_updated.obj.category.enclosure.name
            owner = label_updated.obj.owner
            owner.username = label_name + '_' + enclosure_name
            owner.save()

        return label_updated

    def determine_format(self, request):
            return 'application/json'



class LabelCategoryResource(ModelResource):
    labels = fields.ToManyField('map_editor.api.resources.LabelResource', 'labels', null=True, blank=True, full=True)
    enclosure = fields.OneToOneField('map_editor.api.resources.EnclosureResource', 'enclosure', null=True, blank=True, full=True)

    class Meta:
        resource_name = 'label-category'
        queryset = LabelCategory.objects.all()
        authorization = ResourceAuthorization('enclosure__owner')
        always_return_data = True
        filtering = {
            'id': ALL,
            'name': ALL,
            'name_en': ALL,
            'color': ALL,
            'icon': ALL,
            'labels': ALL_WITH_RELATIONS,
            'enclosure': ALL_WITH_RELATIONS,
        }

    def determine_format(self, request):
        return 'application/json'


class QRCodeResource(ModelResource):
    point = fields.ToOneField('map_editor.api.resources.PointResource', 'point', full=True)

    class Meta:
        resource_name = 'qr-code'
        queryset = QR_Code.objects.select_related('point__floor').all()
        authorization = DjangoAuthorization()
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
        always_return_data = True
        filtering = {
            'id': ALL,
            'category': ALL,
            'message': ALL,
            'when': ALL
        }

    def determine_format(self, request):
        return 'application/json'


# class CouponResource(ModelResource):
#     enclosure = fields.ToOneField(EnclosureResource, 'enclosure', null=True)
#
#     class Meta:
#         resource_name = 'coupon'
#         queryset = Coupon.objects.all()
#         authorization = ResourceAuthorization('enclosure__owner')
#         always_return_data = True
#         filtering = {
#             'enclosure': ALL_WITH_RELATIONS,
#         }
#         max_limit = 5000
#
#     def determine_format(self, request):
#         return 'application/json'


class CouponForEnclosureResource(ModelResource):
    enclosure = fields.ToOneField(EnclosureResource, 'enclosure', null=True)

    class Meta:
        resource_name = 'coupon-for-enclosure'
        queryset = CouponForEnclosure.objects.all()
        authorization = ResourceAuthorization('enclosure__owner')
        always_return_data = True
        filtering = {
            'enclosure': ALL_WITH_RELATIONS,
            }
        max_limit = 5000

    def determine_format(self, request):
        return 'application/json'


class CouponForLabelResource(ModelResource):
    label = fields.ToOneField(LabelResource, 'label', null=True, full=True)

    class Meta:
        resource_name = 'coupon-for-label'
        queryset = CouponForLabel.objects.all()
        authorization = ResourceAuthorization('label__category__enclosure__owner')
        always_return_data = True
        filtering = {
            'label': ALL_WITH_RELATIONS,
            }
        max_limit = 5000

    def determine_format(self, request):
        return 'application/json'
