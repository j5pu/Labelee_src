# -*- coding: utf-8 -*-

import os
from django.core.files.base import ContentFile

from utils.helpers import *

from map_editor.models import *
from map_editor.forms import *

from factory import CLASSES


class ImgService:
    """
    Helper para construir web services que manipulen la imágen de un recurso dado:
        /api-2/[resource]/[id]/img

    Por ejemplo, para el recurso 'floor' con id=16:
        - Subir imágen para la planta: 	POST > /api-2/floor/16/img
        - Eliminar imágen: 				DELETE > api-2/floor/16/img
    """
    model_img_attr = None

    def __init__(self, request, resource, id):
        self.request = request
        self.resource = resource
        self.id = id
        self.resource_class = CLASSES[resource]

    def upload_img(self, uploaded_file):
        """
        Sube la imágen para el recurso. Si ya hay una imágen ésta se elimina
        """
        file_content = ContentFile(uploaded_file.read())

        # Xej floor: resource_obj = Floor.objects.get(id=self.id)
        resource_obj = self.resource_class.objects.get(id=self.id)

        # Se elimina la imágen que el recurso tenía antes
        # nombre para el atributo donde queremos subir la imagen (panorama, img,..)
        img_name = uploaded_file.field_name
        self.model_img_attr = getattr(resource_obj, img_name)
        if self.model_img_attr.name:
            self.delete_img()

        # Guardamos la nueva imágen
        filename = uploaded_file.name.replace(" ", "_")
        fileName, fileExtension = os.path.splitext(filename)
        fileName = str(resource_obj.id) + fileExtension
        self.model_img_attr.save(fileName, file_content)
        resource_obj.save()





    def delete_img(self):
        """
        Elimina la imágen para el recurso
        """
        obj = self.resource_class.objects.get(id=self.id)
        # You have to prepare what you need before delete the model
        storage, path = self.model_img_attr.storage, self.model_img_attr.path
        # Delete the model before the file
        # super(ObjectType, self).delete(*args, **kwargs)
        # # Delete the file after the model
        # print path
        storage.delete(path)

        return responseJSON(data={'id': self.id})
