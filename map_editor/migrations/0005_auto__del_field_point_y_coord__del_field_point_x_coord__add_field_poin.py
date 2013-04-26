# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Removing unique constraint on 'Point', fields ['description']
        db.delete_unique(u'map_editor_point', ['description'])

        # Deleting field 'Point.y_coord'
        db.delete_column(u'map_editor_point', 'y_coord')

        # Deleting field 'Point.x_coord'
        db.delete_column(u'map_editor_point', 'x_coord')

        # Adding field 'Point.row'
        db.add_column(u'map_editor_point', 'row',
                      self.gf('django.db.models.fields.PositiveIntegerField')(default=11),
                      keep_default=False)

        # Adding field 'Point.col'
        db.add_column(u'map_editor_point', 'col',
                      self.gf('django.db.models.fields.PositiveIntegerField')(default=999),
                      keep_default=False)


        # Changing field 'Point.description'
        db.alter_column(u'map_editor_point', 'description', self.gf('django.db.models.fields.CharField')(max_length=200, null=True))

    def backwards(self, orm):
        # Adding field 'Point.y_coord'
        db.add_column(u'map_editor_point', 'y_coord',
                      self.gf('django.db.models.fields.PositiveIntegerField')(default=99),
                      keep_default=False)

        # Adding field 'Point.x_coord'
        db.add_column(u'map_editor_point', 'x_coord',
                      self.gf('django.db.models.fields.PositiveIntegerField')(default=11),
                      keep_default=False)

        # Deleting field 'Point.row'
        db.delete_column(u'map_editor_point', 'row')

        # Deleting field 'Point.col'
        db.delete_column(u'map_editor_point', 'col')


        # Changing field 'Point.description'
        db.alter_column(u'map_editor_point', 'description', self.gf('django.db.models.fields.CharField')(default='lol', max_length=200, unique=True))
        # Adding unique constraint on 'Point', fields ['description']
        db.create_unique(u'map_editor_point', ['description'])


    models = {
        u'map_editor.grid': {
            'Meta': {'object_name': 'Grid'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'map': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'grids'", 'to': u"orm['map_editor.Map']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'num_cols': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'num_rows': ('django.db.models.fields.PositiveIntegerField', [], {})
        },
        u'map_editor.map': {
            'Meta': {'object_name': 'Map'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'place': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'maps'", 'blank': 'True', 'to': u"orm['map_editor.Place']"})
        },
        u'map_editor.object': {
            'Meta': {'object_name': 'Object'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'_objects_'", 'to': u"orm['map_editor.ObjectCategory']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'map_editor.objectcategory': {
            'Meta': {'object_name': 'ObjectCategory'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'})
        },
        u'map_editor.place': {
            'Meta': {'object_name': 'Place'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'})
        },
        u'map_editor.point': {
            'Meta': {'object_name': 'Point'},
            'col': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'grid': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Grid']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'object': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Object']"}),
            'row': ('django.db.models.fields.PositiveIntegerField', [], {})
        }
    }

    complete_apps = ['map_editor']