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
        document.getElementById("doEvent").innerHTML = "Correcto, soporta deviceorientation"; //Mostraria en pantalla si el deviceorientation es soportado por el navegador
        window.addEventListener('deviceorientation', function (eventData) {
            var hor = eventData.gamma; //El parámetro alpha hace referencia a la brujula, los parámetros beta y gamma hacen referencia al giroscopio
            var ver = eventData.beta;
            var dir = eventData.alpha;
            rotarImagen(hor, ver, dir); //Rotamos pasándole los valores de la brújula y el giroscopio.
        }, false);
    } else {
        document.getElementById("doEvent").innerHTML = "No soportado por el navegador"; //Se muestra si el navegador no soporta el deviceorientation
        document.getElementById("doDirection").innerHTML = "-";
        document.getElementById("doVertical").innerHTML = "-";
        document.getElementById("doHorizontal").innerHTML = "-";
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

//        if(hor >= -35 && hor <= 35)
//        {
//            hor = 0;
//            dir = 0;
//        }

        $('#rotate img').css(
            '-webkit-transform', "rotateX(" + (ver) + "deg) rotateZ(" + (dir) + "deg)"
        );
    }
    //Con el telefono en horizontal 1//////////////////////////////////////////////////////////////////////////////////////////////////////
    else if (window.orientation == 90) {
        hor = hor + 55;
        if (hor < 0) hor = 0;
        if (hor > 35) hor = 35;

        $('#rotate img').css(
            '-webkit-transform', "rotateX(" + (hor) + "deg) rotateZ(" + (dir-90) + "deg)"
        );
    }
    //Con el telefono en horizontal 2//////////////////////////////////////////////////////////////////////////////////////////////////////
    else {
        hor = hor*-1 //Igual que en el caso anterior pero multiplicamos por -1
        hor = hor + 55;
        if (hor < 0) hor = 0;
        if (hor > 35) hor = 35;
        $('#rotate img').css(
            '-webkit-transform', "rotateX(" + (hor) + "deg) rotateZ(" + (dir+90) + "deg)"
        );
    }
    document.getElementById("doHorizontal").innerHTML = Math.round(hor) + "º"; //Muestra en la tabla los grados de giro e inclinación
    document.getElementById("doVertical").innerHTML = Math.round(ver) + "º";
    document.getElementById("doDirection").innerHTML = Math.round(dir) + "º";
}