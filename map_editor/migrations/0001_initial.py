# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Place'
        db.create_table(u'map_editor_place', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=10)),
        ))
        db.send_create_signal(u'map_editor', ['Place'])

        # Adding model 'Map'
        db.create_table(u'map_editor_map', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100)),
            ('place', self.gf('django.db.models.fields.related.ForeignKey')(related_name='maps', to=orm['map_editor.Place'])),
        ))
        db.send_create_signal(u'map_editor', ['Map'])

        # Adding model 'Grid'
        db.create_table(u'map_editor_grid', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('num_rows', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('num_cols', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('map', self.gf('django.db.models.fields.related.ForeignKey')(related_name='grids', to=orm['map_editor.Map'])),
        ))
        db.send_create_signal(u'map_editor', ['Grid'])

        # Adding model 'ObjectCategory'
        db.create_table(u'map_editor_objectcategory', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('type', self.gf('django.db.models.fields.CharField')(unique=True, max_length=200)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
        ))
        db.send_create_signal(u'map_editor', ['ObjectCategory'])

        # Adding model 'Object'
        db.create_table(u'map_editor_object', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(related_name='objects', to=orm['map_editor.ObjectCategory'])),
        ))
        db.send_create_signal(u'map_editor', ['Object'])

        # Adding model 'Point'
        db.create_table(u'map_editor_point', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('description', self.gf('django.db.models.fields.CharField')(unique=True, max_length=200)),
            ('x_coord', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('y_coord', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('object', self.gf('django.db.models.fields.related.ForeignKey')(related_name='object', to=orm['map_editor.Object'])),
            ('grid', self.gf('django.db.models.fields.related.ForeignKey')(related_name='points', to=orm['map_editor.Grid'])),
        ))
        db.send_create_signal(u'map_editor', ['Point'])


    def backwards(self, orm):
        # Deleting model 'Place'
        db.delete_table(u'map_editor_place')

        # Deleting model 'Map'
        db.delete_table(u'map_editor_map')

        # Deleting model 'Grid'
        db.delete_table(u'map_editor_grid')

        # Deleting model 'ObjectCategory'
        db.delete_table(u'map_editor_objectcategory')

        # Deleting model 'Object'
        db.delete_table(u'map_editor_object')

        # Deleting model 'Point'
        db.delete_table(u'map_editor_point')


    models = {
        u'map_editor.grid': {
            'Meta': {'object_name': 'Grid'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'map': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'grids'", 'to': u"orm['map_editor.Map']"}),
            'num_cols': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'num_rows': ('django.db.models.fields.PositiveIntegerField', [], {})
        },
        u'map_editor.map': {
            'Meta': {'object_name': 'Map'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'place': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'maps'", 'to': u"orm['map_editor.Place']"})
        },
        u'map_editor.object': {
            'Meta': {'object_name': 'Object'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'objects'", 'to': u"orm['map_editor.ObjectCategory']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'map_editor.objectcategory': {
            'Meta': {'object_name': 'ObjectCategory'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'})
        },
        u'map_editor.place': {
            'Meta': {'object_name': 'Place'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '10'})
        },
        u'map_editor.point': {
            'Meta': {'object_name': 'Point'},
            'description': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'grid': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Grid']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'object': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'object'", 'to': u"orm['map_editor.Object']"}),
            'x_coord': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'y_coord': ('django.db.models.fields.PositiveIntegerField', [], {})
        }
    }

    complete_apps = ['map_editor']