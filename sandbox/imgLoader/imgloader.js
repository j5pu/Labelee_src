$(function(){

var labels = new LabelResource().readFromFloor(17);

console.log('cargando imágenes..');

img_srcs = [];

for(var key in labels)
    img_srcs.push(labels[key].img);

ImgLoader.load(img_srcs, main);
//    main();

});

var main = function(){
    console.log('imágenes cargadas!');

    $('body').append('<img src="' + ImgLoader.get('/media/img/labels/Restaurantes/vips_2.png') + '">');
//    $('body').append('<img src="/media/img/enclosures/Matadero_Prueba/floors/mapa_matadero_1500.jpg">');

//    $('body img').css({'width': '200px'});

    var img = $('body').find('img');

    console.log(img.height());
};
