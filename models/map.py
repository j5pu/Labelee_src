def maps(request, operation):

	if operation == 'new':

		# Si la petición es AJAX creo un mapa sin imágen
		if request.is_ajax():
			map_name = request.POST['map_name']
			form = MapForm({'name': map_name})
			if form.is_valid:
				place = Place.objects.get(id=request.POST['place_id'])
				map = Map(name=map_name, place=place)
				map.add_default_img()
				map.save()
				print map.name
				print map.place

				return responseJSON(data={'map_id': map.id})
			else:
				return responseJSON(errors=form.errors)

		# Si no es AJAX es que quiero subir la imágen para el mapa guardado previamente
		else:
			file_content = ContentFile(request.FILES['map_img'].read())
			print '@@@@ - ' + request.FILES['map_img'].name
			map.img.save(request.FILES['map_img'].name, file_content)
			map.save()
			return HttpResponse('uploaded!')

	else:
		return HttpResponse('ande vaaa')