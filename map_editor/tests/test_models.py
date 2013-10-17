# -*- coding: utf-8 -*-

from django.test import TestCase
from utils.tests.factories import *


class ModelTest(TestCase):

    def test_staff_creation(self):
        staff = StaffFactory()
        self.assertNotEqual(staff.id, None)
        self.assertTrue(staff.is_staff)

    def test_enclosure_owner_creation(self):
        enclosure_owner = EnclosureOwnerFactory()
        self.assertNotEqual(enclosure_owner.id, None)
        self.assertEqual(len(enclosure_owner.groups.all()), 1)
        self.assertEqual(enclosure_owner.groups.all()[0].id, 1)

    def test_site_owner_creation(self):
        site_owner = SiteOwnerFactory()
        self.assertNotEqual(site_owner.id, None)
        self.assertEqual(len(site_owner.groups.all()), 1)
        self.assertEqual(site_owner.groups.all()[0].id, 2)

    def test_enclosure_creation(self):
        # enclosure con dueño sin especificar (se crea automáticamente)
        enclosure = EnclosureFactory()
        self.assertNotEqual(enclosure.id, None)
        self.assertNotEqual(enclosure.owner, None)

    def test_enclosure_creation_with_specific_owner(self):
        o = EnclosureOwnerFactory()
        enc1 = EnclosureFactory(owner=o)
        enc2 = EnclosureFactory(owner=o)
        enc3 = EnclosureFactory()
        self.assertEqual(enc1.owner, enc2.owner)
        self.assertNotEqual(enc2.owner, enc3.owner)
