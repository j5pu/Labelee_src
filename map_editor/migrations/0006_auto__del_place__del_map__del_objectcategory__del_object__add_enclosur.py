# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'Place'
        db.delete_table(u'map_editor_place')

        # Deleting model 'Map'
        db.delete_table(u'map_editor_map')

        # Deleting model 'ObjectCategory'
        db.delete_table(u'map_editor_objectcategory')

        # Deleting model 'Object'
        db.delete_table(u'map_editor_object')

        # Adding model 'Enclosure'
        db.create_table(u'map_editor_enclosure', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=60)),
        ))
        db.send_create_signal(u'map_editor', ['Enclosure'])

        # Adding model 'LabelCategory'
        db.create_table(u'map_editor_labelcategory', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=200)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
        ))
        db.send_create_signal(u'map_editor', ['LabelCategory'])

        # Adding model 'Floor'
        db.create_table(u'map_editor_floor', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('enclosure', self.gf('django.db.models.fields.related.ForeignKey')(related_name='floors', blank=True, to=orm['map_editor.Enclosure'])),
        ))
        db.send_create_signal(u'map_editor', ['Floor'])

        # Adding model 'Label'
        db.create_table(u'map_editor_label', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(related_name='category', blank=True, to=orm['map_editor.LabelCategory'])),
        ))
        db.send_create_signal(u'map_editor', ['Label'])

        # Deleting field 'Point.object'
        db.delete_column(u'map_editor_point', 'object_id')

        # Adding field 'Point.label'
        db.add_column(u'map_editor_point', 'label',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=1000, related_name='points', to=orm['map_editor.Label']),
                      keep_default=False)


        # Changing field 'Grid.map'
        db.alter_column(u'map_editor_grid', 'map_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['map_editor.Floor']))

    def backwards(self, orm):
        # Adding model 'Place'
        db.create_table(u'map_editor_place', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=60, unique=True)),
        ))
        db.send_create_signal(u'map_editor', ['Place'])

        # Adding model 'Map'
        db.create_table(u'map_editor_map', (
            ('place', self.gf('django.db.models.fields.related.ForeignKey')(related_name='maps', to=orm['map_editor.Place'], blank=True)),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal(u'map_editor', ['Map'])

        # Adding model 'ObjectCategory'
        db.create_table(u'map_editor_objectcategory', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200, unique=True)),
        ))
        db.send_create_signal(u'map_editor', ['ObjectCategory'])

        # Adding model 'Object'
        db.create_table(u'map_editor_object', (
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(related_name='_objects_', to=orm['map_editor.ObjectCategory'])),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal(u'map_editor', ['Object'])

        # Deleting model 'Enclosure'
        db.delete_table(u'map_editor_enclosure')

        # Deleting model 'LabelCategory'
        db.delete_table(u'map_editor_labelcategory')

        # Deleting model 'Floor'
        db.delete_table(u'map_editor_floor')

        # Deleting model 'Label'
        db.delete_table(u'map_editor_label')

        # Adding field 'Point.object'
        db.add_column(u'map_editor_point', 'object',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=1, related_name='points', to=orm['map_editor.Object']),
                      keep_default=False)

        # Deleting field 'Point.label'
        db.delete_column(u'map_editor_point', 'label_id')


        # Changing field 'Grid.map'
        db.alter_column(u'map_editor_grid', 'map_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['map_editor.Map']))

    models = {
        u'map_editor.enclosure': {
            'Meta': {'object_name': 'Enclosure'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'})
        },
        u'map_editor.floor': {
            'Meta': {'object_name': 'Floor'},
            'enclosure': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'floors'", 'blank': 'True', 'to': u"orm['map_editor.Enclosure']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'map_editor.grid': {
            'Meta': {'object_name': 'Grid'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'map': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'grids'", 'to': u"orm['map_editor.Floor']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'num_cols': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'num_rows': ('django.db.models.fields.PositiveIntegerField', [], {})
        },
        u'map_editor.label': {
            'Meta': {'object_name': 'Label'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'category'", 'blank': 'True', 'to': u"orm['map_editor.LabelCategory']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'map_editor.labelcategory': {
            'Meta': {'object_name': 'LabelCategory'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'})
        },
        u'map_editor.point': {
            'Meta': {'object_name': 'Point'},
            'col': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'grid': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Grid']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Label']"}),
            'row': ('django.db.models.fields.PositiveIntegerField', [], {})
        }
    }

    complete_apps = ['map_editor']