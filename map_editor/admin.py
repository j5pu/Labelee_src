from django.contrib import admin

from map_editor.models import *

class CustomUserAdmin(admin.ModelAdmin):
    exclude = (
        'password',
        'username',
        'is_staff',
        'is_active',
        'is_superuser',
        'groups',
        'user_permissions',
        'first_name',
        'last_name',
        'email',
        'date_joined',
        'last_login',
    )
admin.site.register(CustomUser, CustomUserAdmin)

admin.site.register(Enclosure)
admin.site.register(Floor)
admin.site.register(Point)
admin.site.register(Label)
admin.site.register(LabelCategory)
admin.site.register(QR_Code)