# -*- coding: utf-8 -*-
from PIL import Image


def resize(size, n):
    """
    Decrementamos size hasta que sea múltiplo de n
    """
    while size > 0:
        if size % n == 0:
            return size
        else:
            size -= 1


def renderEmpty(request, floor):
    floor_img = floor.img or floor.imgB
    floor_img = Image.open(floor_img)
    num_rows = int(request.GET.get('rows')) if request.GET.get('rows') \
        else floor.num_rows
    grid_height = resize(floor_img.size[1], num_rows)
    block_height = grid_height / num_rows
    grid_width = resize(floor_img.size[0], block_height)
    num_cols = grid_width / block_height
    block_width = grid_width / num_cols

    a = 'aa'


def renderSaved(floor):
    pass