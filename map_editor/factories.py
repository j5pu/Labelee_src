# -*- coding: utf-8 -*-

import factory
from . import models
from utils.constants import USER_GROUPS


class CustomUserFactory(factory.Factory):
    FACTORY_FOR = models.CustomUser

    # username = factory.Sequence(lambda n: 'user' + n)
    password = '1234'

    @classmethod
    def _prepare(cls, create, **kwargs):
        """
        Usado para sobreescribir el método _prepare de factory.Factory, para
        que así podamos hacer más cosas además de guardar el objeto generado
        por factory-boy.

        En este caso, si la factoría tiene el atributo 'group_id', entonces
        además se asigna al usuario el grupo con ese id.
        """
        group_id = kwargs.pop('group_id', None)
        user = super(CustomUserFactory, cls)._prepare(create, **kwargs)
        if create:
            user.save()
            # si ya se ha guardado y recibimos un id de grupo
            if user.id and group_id:
                user.assign_group(group_id)
        return user


class StaffFactory(CustomUserFactory):
    username = factory.Sequence(lambda n: 'staff%s' % n)
    is_staff = True


class EnclosureOwnerFactory(CustomUserFactory):
    username = factory.Sequence(lambda n: 'enclosure_owner%s' % n)
    group_id = USER_GROUPS['enclosure_owners']

class SiteOwnerFactory(CustomUserFactory):
    username = factory.Sequence(lambda n: 'site_owner%s' % n)
    group_id = USER_GROUPS['shop_owners']

class EnclosureFactory(factory.Factory):
    FACTORY_FOR = models.Enclosure

    name = factory.Sequence(lambda n: 'enclosure_{0}'.format(n))
    owner = factory.SubFactory(SiteOwnerFactory)

    @classmethod
    def _prepare(cls, create, **kwargs):
        enclosure = super(EnclosureFactory, cls)._prepare(create, **kwargs)
        if create:
            enclosure.save()
        return enclosure
