# -*- coding: utf-8 -*-

from django.contrib.auth.models import Group
import factory
from factory import DjangoModelFactory
from utils.constants import USER_GROUPS
from map_editor import models


class CustomUserFactory(DjangoModelFactory):
    FACTORY_FOR = models.CustomUser

    password = '1234'

    # # antes de crear cada usuario comprobamos que se han creado los grupos
    # @classmethod
    # def _generate(cls, create, attrs):
    #     if create and len(Group.objects.all()) != 2:
    #         Group.objects.create(name='enclosure_owners')
    #         Group.objects.create(name='shop_owners')
    #     return super(CustomUserFactory, cls)._generate(create, attrs)


class StaffFactory(CustomUserFactory):
    username = factory.Sequence(lambda n: 'staff%s' % n)
    is_staff = True


class EnclosureOwnerFactory(CustomUserFactory):
    username = factory.Sequence(lambda n: 'enclosure_owner%s' % n)

    @factory.post_generation
    def assign_group(self, create, extracted, **kwargs):
        group = Group.objects.get(pk=USER_GROUPS['enclosure_owners'])
        self.groups.add(group)
        # Enclosure.objects.create(owner=self)


class SiteOwnerFactory(CustomUserFactory):
    username = factory.Sequence(lambda n: 'site_owner%s' % n)

    @factory.post_generation
    def assign_group(self, create, extracted, **kwargs):
        group = Group.objects.get(pk=USER_GROUPS['shop_owners'])
        self.groups.add(group)


class InvalidUserFactory(CustomUserFactory):
    username = factory.Sequence(lambda n: 'invalid_user%s' % n)


class EnclosureFactory(DjangoModelFactory):
    FACTORY_FOR = models.Enclosure

    name = factory.Sequence(lambda n: 'enclosure_{0}'.format(n))
    # con esto podemos hacer EnclosureFactory(owner=objeto_owner_dado)
    # o bien EnclosureFactory(), creando un nuevo EnclosureOwner
    owner = factory.SubFactory(EnclosureOwnerFactory)


class LabelCategoryFactory(DjangoModelFactory):
    FACTORY_FOR = models.LabelCategory

    name = factory.Sequence(lambda n: 'category_{0}'.format(n))
