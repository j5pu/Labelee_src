/**
 * User: Miguel A.
 * Date: 18/06/13
 * Time: 11:43
 * To change this template use File | Settings | File Templates.
 */

$(function () {
    Inicializar(); //Inicializamos los comprobadores de la brújula.
});

function Inicializar() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function (eventData) {
            var hor = eventData.gamma; //El parámetro alpha hace referencia a la brujula, los parámetros beta y gamma hacen referencia al giroscopio
            var ver = eventData.beta;
            var dir = eventData.alpha;
            rotarImagen(hor, ver, dir); //Rotamos pasándole los valores de la brújula y el giroscopio.
        }, false);
    }
    $(window).trigger('deviceorientation');
}

function rotarImagen(hor, ver, dir) {
    //Con el telefono en vertical//////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (window.orientation == 0) {
        ver=ver * -1;
        ver = ver + 55;
        if (ver < 0) ver = 0;
        if (ver > 35) ver = 35;

       $('div.leaflet-objects-pane').css(
            '-webkit-transform', "perspective(600) rotateZ(" + (dir) + "deg)" //rotateX(" + (ver) + "deg)
        );
    }
    //Con el telefono en horizontal 1//////////////////////////////////////////////////////////////////////////////////////////////////////
    else if (window.orientation == 90) {
        hor = hor + 55;
        if (hor < 0) hor = 0;
        if (hor > 35) hor = 35;

        $('div.leaflet-objects-pane').css(
            '-webkit-transform', "perspective(600) rotateZ(" + (dir-90) + "deg)" //rotateX(" + (hor) + "deg)
        );
    }
    //Con el telefono en horizontal 2//////////////////////////////////////////////////////////////////////////////////////////////////////
    else {
        hor = hor*-1 //Igual que en el caso anterior pero multiplicamos por -1
        hor = hor + 55;
        if (hor < 0) hor = 0;
        if (hor > 35) hor = 35;
        $('div.leaflet-objects-pane').css(
            '-webkit-transform', "perspective(600) rotateZ(" + (dir+90) + "deg)" //rotateX(" + (hor) + "deg)
        );
    }
}