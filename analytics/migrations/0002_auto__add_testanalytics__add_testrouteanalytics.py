# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'TestAnalytics'
        db.create_table(u'analytics_testanalytics', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('category', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('month', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('users', self.gf('django.db.models.fields.PositiveIntegerField')()),
        ))
        db.send_create_signal(u'analytics', ['TestAnalytics'])

        # Adding model 'TestRouteAnalytics'
        db.create_table(u'analytics_testrouteanalytics', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('type', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('month', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('number', self.gf('django.db.models.fields.PositiveIntegerField')()),
        ))
        db.send_create_signal(u'analytics', ['TestRouteAnalytics'])


    def backwards(self, orm):
        # Deleting model 'TestAnalytics'
        db.delete_table(u'analytics_testanalytics')

        # Deleting model 'TestRouteAnalytics'
        db.delete_table(u'analytics_testrouteanalytics')


    models = {
        u'analytics.testanalytics': {
            'Meta': {'object_name': 'TestAnalytics'},
            'category': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'month': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'users': ('django.db.models.fields.PositiveIntegerField', [], {})
        },
        u'analytics.testrouteanalytics': {
            'Meta': {'object_name': 'TestRouteAnalytics'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'month': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'number': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['analytics']