# -*- coding: utf-8 -*-

import services
from utils.helpers import responseJSON


def img(request, resource, id):
    """
    /api-2/[resource]/[id]/img
    """
    imgService = services.ImgService(request, resource, id)

    if request.method == 'POST':
        try:
            for uploaded_file in request.FILES.items():
                imgService.upload_img(uploaded_file[1])
        except:
            return responseJSON(errors='yes')

        # respuesta en el iframe
        data = {
            'form': resource
        }
        return responseJSON(data=data)

    elif request.method == 'DELETE':
        return imgService.delete_img()
