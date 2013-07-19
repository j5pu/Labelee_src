# -*- coding: utf-8 -*-

from django.contrib.auth.models import User
from tastypie.authorization import Authorization
from tastypie.exceptions import Unauthorized


class ResourceAuthorization(Authorization):
    """
    Clase para autorizar las operaciones CRUD sobre cada recurso de la API 1

    http://django-tastypie.readthedocs.org/en/latest/authorization.html
    """

    AUTHORIZED_RESOURCES_FOR_READ = [
        'enclosure',
        'floor',
        'point'
    ]

    def __init__(self, rel_to_user):
        """
        Le metemos la ruta a seguir en el esquema relacional hasta llegar al usuario
        (owner del enclosure).

        Por ejemplo para llegar desde EnclosureResource:
            authorization = ResourceAuthorization('owner')
        Desde LabelCategoryResource:
            authorization = ResourceAuthorization('enclosure__owner')
        """
        self.rel_to_user = rel_to_user

    def _user_has_permission(self, bundle):
        """
        Determina si un usuario tiene permiso para manipular el recurso dado
        """
        if type(bundle.obj) is User:
            return bundle.obj.id == bundle.request.user.id

        # Vamos iterando en cada uno de los elementos que nos llevan hasta owner.
        # Por ejemplo, para LabelCategory:
        #   'enclosure__owner' -> ['enclosure', 'owner'],
        #   lo que crearía esta comparación:
        #       bundle.obj.enclosure.owner == bundle.request.user
        attrs = self.rel_to_user.split('__')
        value = None
        for i in range(len(attrs)):
            if i == 0:
                value = getattr(bundle.obj, attrs[i])
            else:
                value = getattr(value, attrs[i])

        return value == bundle.request.user

    def read_list(self, object_list, bundle):
        if self.resource_meta.resource_name in self.AUTHORIZED_RESOURCES_FOR_READ:
            return object_list

        if type(bundle.obj) is User:
            return object_list.filter(id=bundle.request.user.id)

        args = {self.rel_to_user:bundle.request.user}
        return object_list.filter(**args)

    def read_detail(self, object_list, bundle):
        # Is the requested object owned by the user?
        if self.resource_meta.resource_name in self.AUTHORIZED_RESOURCES_FOR_READ\
            or self.resource_created:
            self.resource_created = False
            return True

        return self._user_has_permission(bundle)

    def create_list(self, object_list, bundle):
        # Assuming their auto-assigned to ``user``.
        return object_list

    def create_detail(self, object_list, bundle):
        # return bundle.obj.user == bundle.request.user
        self.resource_created = True
        return bundle.request.user.is_authenticated()

    def update_list(self, object_list, bundle):
        allowed = []

        # Since they may not all be saved, iterate over them.
        for obj in object_list:
            if obj.user == bundle.request.user:
                allowed.append(obj)

        return allowed

    def update_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user

    def delete_list(self, object_list, bundle):
        # Sorry user, no deletes for you!
        raise Unauthorized("Sorry, no deletes.")

    def delete_detail(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")