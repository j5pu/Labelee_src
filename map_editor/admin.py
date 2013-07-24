from django.contrib import admin

from map_editor.models import *

admin.site.register(CustomUser)
admin.site.register(Enclosure)
admin.site.register(Floor)
admin.site.register(Point)
admin.site.register(Label)
admin.site.register(LabelCategory)
admin.site.register(QR_Code)