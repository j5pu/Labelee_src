# -*- coding: utf-8 -*-

import services


def img(request, resource, id):
    """
    /api-2/[resource]/[id]/img
    """
    imgService = services.ImgService(request, resource, id)

    if request.method == 'POST':
        return imgService.upload_img()
    elif request.method == 'DELETE':
        return imgService.delete_img()
