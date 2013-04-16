var icons_path = '/static/img/icons/';

var object_types = {
	"label": '',
	"wall": '',
	"erase": '',
	'bar': icons_path + 'bar.png',
	'cine': icons_path + 'cine.png',
	'informacion': icons_path + 'informacion.png',
	'restaurante': icons_path + 'restaurante_.png',
	'supermercado': icons_path + 'supermercado.png',
	'tienda': icons_path + 'tienda.png'
};


function setObjSelector()
{
	for(var key in object_types)
		elements.obj_selector.append('<option value="' + key + '">' + key + '</option>');
}


function showMenu()
{
	// setObjSelector();

}