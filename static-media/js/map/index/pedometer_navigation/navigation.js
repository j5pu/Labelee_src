

var STEPS_UNTIL_NAVIGATION_END = 15;
var IDLE_NAVIGATOR_TIMEOUT = 5000;

var valorPrevio = 1.0;
var valorPrevPrevio = 1.0;
var cotaInferior = 0;
var cotaSuperior = 0;
var datosDesdeUltimaCotaSup = 0;
var datosDesdeUltimaCotaInf = 0;
var pasos = 0;

var minDatosEntreCotas = 10; //
var difCotaSupInf = 0.2; //0.2
var zNeutral = -1.1; //-1.1 //Según la inclinación del teléfono
var cotaInferiorNeutral = -0.04; //-0.04
var cotaSuperiorNeutral = 0.06; //0.06
var ultimaCota = 1;// 1 es inf 0 es sup

$(function () {



});

function deviceOrientationListener (event) {

    var hor = event.gamma; //El parámetro alpha hace referencia a la brujula, los parámetros beta y gamma hacen referencia al giroscopio
    var ver = event.beta;
//    var dir = event.webkitCompassHeading; //Si el usuario navega desde iOS debe usarse esta función, restándole 360 conseguimos que la imagen rote correctamente
    var dir = 360-event.webkitCompassHeading; //Si el usuario navega desde iOS debe usarse esta función, restándole 360 conseguimos que la imagen rote correctamente
    pedometer_navigator.turnOffIfTimeout();
    pedometer_navigator.changeOrientation(dir);

}

function deviceMotionListener (event) {

    var aceleracion = event.acceleration;
    var x = Math.round(aceleracion.x);
    var y = aceleracion.y;
    var z = aceleracion.z;

    pedometer_navigator.turnOffIfTimeout();
    cuentaPasos(x, y, z);
}



function cuentaPasos(x, y, z) {

    if (z < valorPrevio && valorPrevPrevio < valorPrevio && datosDesdeUltimaCotaSup > minDatosEntreCotas && valorPrevio > zNeutral + cotaSuperiorNeutral && ultimaCota == 1) {
        cotaSuperior = valorPrevio;
        datosDesdeUltimaCotaSup = 0;
        if (Math.abs(cotaSuperior - cotaInferior) > difCotaSupInf) {
            if (((x>-2) && (x<2))&&(z>-3.5)&&(z<3.5)) {
                pedometer_navigator.walk();
            }
            ultimaCota = 0;
        }
    }
    else
        datosDesdeUltimaCotaSup++;
    if (z > valorPrevio && valorPrevPrevio > valorPrevio && datosDesdeUltimaCotaInf > minDatosEntreCotas && valorPrevio < zNeutral + cotaInferiorNeutral && ultimaCota == 0) {
        cotaInferior = valorPrevio;
        datosDesdeUltimaCotaInf = 0;
        ultimaCota =1;
    }
    else
        datosDesdeUltimaCotaInf++;
    if (z != valorPrevio) {
        valorPrevPrevio = valorPrevio;
        valorPrevio = z;
    }
}


function PedometerNavigator () {
    // Recibe un marker:
    //      - extrae loc
    //      - recalcula desplazamiento
    this.marker = L.marker(qrLoc, {icon: podometerIcon});
    map.addLayer(this.marker);
    this.lat = qrLoc[0];
    this.long = qrLoc[1];
    this.orientation = 0;
    this.stepLength = 3;
    this.stepLat = this.stepLength * map.getSize().x / $(window).height();
    this.stepLong = this.stepLength * map.getSize().y / $(window).width();
    this.currentSteps = 0;

    this.navigatorActive = false;
    this.navigatorDestroyed = false;
    this.lastInteractionTime = null;


    this.init = function()
    {
        $('#walk').click(function(){
            pedometer_navigator.walk();
        });

        $('#orienta').click(function(){
            pedometer_navigator.changeOrientation(pedometer_navigator.orientation + 90);
        });

        $('#more_step').click(function(){
            pedometer_navigator.stepLength = ++pedometer_navigator.stepLength;
        });

        $('#less_step').click(function(){
            pedometer_navigator.stepLength = --pedometer_navigator.stepLength;
        });


        // Only available in Apple devices
        if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {

            // Compass listener
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', deviceOrientationListener, false);
            }

            // Motion listener
            if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', deviceMotionListener, false);
            }

        }
    };

    // User changes orientation
    this.changeOrientation = function (orientation){


        $('.podo-icon').show();
        // If the device is oriented horizontally the angle must be changed accordingly
        if (window.orientation == null || window.orientation == 0){
            this.orientation = orientation;
        } else {
            this.orientation = orientation - window.orientation;
        }

        this.orientation += compass.angle_offset;

        this._paint();
        this.lastInteractionTime = new Date().getTime();

    };

    // User advances one step
    this.walk = function () {
        this.long = this.long - this.stepLong * Math.round(Math.cos(this.orientation *  Math.PI / 180));
        this.lat = this.lat + this.stepLat * Math.round(Math.sin(this.orientation * Math.PI / 180));
        this.currentSteps++;

        // The first step sets the navigator as active (the user is moving)
        if (!this.navigatorActive) {
            this.navigatorActive = true;
        }

        if (this.currentSteps >= STEPS_UNTIL_NAVIGATION_END) {
            this._endNavigation();
        } else {
            this._paint();
            this.lastInteractionTime = new Date().getTime();
        }
    };


    /**
     *  Checks if navigator should be turned off because of time elapsed
     *  This is necessary because if the user minimizes the browser, his position is not under control anymore
     */
    this.turnOffIfTimeout = function() {

        if (this.navigatorActive) {
            if (new Date().getTime() - this.lastInteractionTime > IDLE_NAVIGATOR_TIMEOUT) {
                this._endNavigation();
            }
        }
    };

    this._endNavigation = function() {
        map.removeLayer(this.marker);
        this.navigatorActive = false;
        this.navigatorDestroyed = true;
        window.removeEventListener('deviceorientation', deviceOrientationListener);
        window.removeEventListener('devicemotion', deviceMotionListener);
    };

    this._paint = function() {

        if (!this.navigatorDestroyed){
            //this.navigator_object.css('-webkit-transform', 'rotate(' + this.orientation + 'deg)');
            $('.podo-icon').css('opacity', 1.0 - this.currentSteps / STEPS_UNTIL_NAVIGATION_END)
            this.marker.setLatLng([this.lat, this.long]);
        }
    };

}