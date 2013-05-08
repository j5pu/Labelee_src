'''
Created on 25/04/2013

@author: yomac
'''

from map_editor.models import Enclosure, Floor, LabelCategory, Label, Point

# http://whilefalse.net/2009/10/21/factory-pattern-python-__new__/
CLASSES = {
    'enclosure': Enclosure,
    'floor': Floor,
    'label-category': LabelCategory,
    'label': Label,
    'point': Point
}
