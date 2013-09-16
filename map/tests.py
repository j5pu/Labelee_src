"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""
import os

from django.test import TestCase
from map_editor.models import Floor
# -*- coding: utf-8 -*-
from django.test.testcases import LiveServerTestCase
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.wait import WebDriverWait
from selenium import webdriver
import time
from pyvirtualdisplay import Display



class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        item= Floor.objects.filter(enclosure_id=7)
        self.assertEqual(1 + 1, 2)
        self.assertEqual(3,3)



class FunctionalTests(LiveServerTestCase):

    @classmethod
    def setUpClass(cls):
        """ Setup class needed by Selenium. It will setup the driver and assign live_server_url etc."""

        super(LiveServerTestCase, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        """ The teardown will make sure that you close the browser and shutdown the test server etc """

        super(LiveServerTestCase, cls).tearDownClass()

    def setUp(self):
        """Here you initialize your test. Example if you need to login for testing, do it here"""
        pass

    def tearDown(self):
        """Here you tear down after each test"""
        pass

    def test_Selenium(self):
        #crea un monitor virtual para ejecutar el navegador. Necesitas instalar para que funcione:sudo apt-get install xvfb
        display = Display()
        display.start()
        #para que funcione el driver de Chrome hay que bajarselo de https://code.google.com/p/chromedriver/downloads/list
        #ponerlo en el path y luego darle permisos a todos los usuarios chmod 777 chromedriver
        browser = webdriver.Chrome()
        try:
            # Get local session of firefox

            browser.get("http://localhost:8000/map/origin/26_60_30902")
            time.sleep(8)
            elem = browser.find_element_by_id("map")
            time.sleep(0.2)
            assert elem is not None
            browser.get("http://www.yahoo.com") # Load page
            assert "Yahoo!" in browser.title

        finally:
            browser.close()
            browser.quit()
            display.stop()