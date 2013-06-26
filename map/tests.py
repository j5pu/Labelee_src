"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TestCase
from map_editor.models import Floor


class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        item= Floor.objects.filter(enclosure_id=7)
        self.assertEqual(1 + 1, 2)
        self.assertEqual(3,3)