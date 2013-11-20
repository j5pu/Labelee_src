'''
Created on 22/04/2013

@author: yomac
'''

from django.core.management.base import BaseCommand, CommandError
from map_editor.models import Enclosure

class Command(BaseCommand):
    def handle(self, *args, **options):
        print Enclosure.objects.all()[0].name
        



