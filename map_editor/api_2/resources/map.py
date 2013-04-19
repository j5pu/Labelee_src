
# Acciones sobre un recurso 'map'

# def delete(self, *args, **kwargs):
# 		"""
# 		Elimina un mapa y también su imágen
# 		"""
# 		# You have to prepare what you need before delete the model
# 		storage, path = self.img.storage, self.img.path
# 		# Delete the model before the file
# 		super(Map, self).delete(*args, **kwargs)
# 		# Delete the file after the model
# 		print path
# 		storage.delete(path)

# def add_default_img(self):
# 	"""
# 	Añade la imágen por defecto al mapa
# 	"""
# 	fs = FileSystemStorage(location='media/img')
# 	file = fs.open('sample_img.jpg')
# 	self.img.save('sample_img', File(file))

# 	# otra forma más 'guarra'..
# 	# 	file = open('/media/img/sample_img.jpg')
# 	# 	self.img.save('sample_img', File(file))