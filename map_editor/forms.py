# -*- coding: utf-8 -*-

from django import forms
from map_editor.models import *

# Con esto hacemos que la descripción de los errores se muestre en español
from django.utils.translation import activate
activate('es')


class PlaceForm(forms.ModelForm):
	name = forms.CharField(min_length=4,
		# https://docs.djangoproject.com/en/1.5/ref/forms/fields/#error-messages
		error_messages={
			'required': 'Por favor, introduzca un nombre para el lugar'
		}
	)

	class Meta:
		model = Place

	# def clean(self):
	# 	"""
	# 	Antes de comprobar el lugar pasamos su nombre a minúsculas
	# 	"""
	# 	self.name = self.name.lower()

	# def clean_name(self):
	#     name = self.cleaned_data['name']
	#     print Place.objects.filter(name=name
	#     if Place.objects.filter(name=name).exclude(pk=self.instance.pk).exists():
	#         raise forms.ValidationError("El lugar indicado ya existe")
	#     return name


class MapForm(forms.ModelForm):
	class Meta:
		model = Map
