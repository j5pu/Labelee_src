# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'Grid'
        db.delete_table(u'map_editor_grid')

        # Adding field 'Floor.num_rows'
        db.add_column(u'map_editor_floor', 'num_rows',
                      self.gf('django.db.models.fields.PositiveIntegerField')(default=1000),
                      keep_default=False)

        # Adding field 'Floor.num_cols'
        db.add_column(u'map_editor_floor', 'num_cols',
                      self.gf('django.db.models.fields.PositiveIntegerField')(default=1000),
                      keep_default=False)

        # Deleting field 'Point.grid'
        db.delete_column(u'map_editor_point', 'grid_id')

        # Adding field 'Point.floor'
        db.add_column(u'map_editor_point', 'floor',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=1000, related_name='points', to=orm['map_editor.Floor']),
                      keep_default=False)


    def backwards(self, orm):
        # Adding model 'Grid'
        db.create_table(u'map_editor_grid', (
            ('map', self.gf('django.db.models.fields.related.ForeignKey')(related_name='grids', to=orm['map_editor.Floor'])),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('num_cols', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('num_rows', self.gf('django.db.models.fields.PositiveIntegerField')()),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
        ))
        db.send_create_signal(u'map_editor', ['Grid'])

        # Deleting field 'Floor.num_rows'
        db.delete_column(u'map_editor_floor', 'num_rows')

        # Deleting field 'Floor.num_cols'
        db.delete_column(u'map_editor_floor', 'num_cols')

        # Adding field 'Point.grid'
        db.add_column(u'map_editor_point', 'grid',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=1000, related_name='points', to=orm['map_editor.Grid']),
                      keep_default=False)

        # Deleting field 'Point.floor'
        db.delete_column(u'map_editor_point', 'floor_id')


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
            'floor': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Floor']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Label']"}),
            'row': ('django.db.models.fields.PositiveIntegerField', [], {})
        }
    }

    complete_apps = ['map_editor']