# -*- coding: utf-8 -*-

from django import forms
from map_editor.models import *

# Con esto hacemos que la descripción de los errores se muestre en español
from django.utils.translation import activate
activate('es')

class PlaceForm(forms.ModelForm):
	class Meta:
		model = Place


class MapForm(forms.ModelForm):
	class Meta:
		model = Map
