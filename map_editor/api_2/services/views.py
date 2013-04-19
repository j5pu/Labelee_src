

from map_editor.models import *
from map_editor.forms import *

from django_web.utils import *

import services


def img(request, resource, id):
	"""
	/api-2/[resource]/[id]/img
	"""
	return services.ImgService(request, resource, id)
