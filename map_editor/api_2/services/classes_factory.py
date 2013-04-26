'''
Created on 25/04/2013

@author: yomac
'''

from map_editor.models import Place, Map, Grid, ObjectCategory, Object, Point

# http://whilefalse.net/2009/10/21/factory-pattern-python-__new__/
CLASSES = {
    'place': Place,
    'map': Map,
    'grid': Grid,
    'object-category': ObjectCategory,
    'object': Object,
    'point': Point
}
