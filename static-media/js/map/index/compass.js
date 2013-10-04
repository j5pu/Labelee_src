function Compass(angle_offset)
{
    var self = this;

    // Desviación del norte real con respecto al norte en el mapa
    this.angle_offset = angle_offset;

    this.init = function()
    {
        this.$e = $('.locate-icon');
        this._setNavigator();

        // El ángulo previo
        this.previous = null;

        if (window.DeviceOrientationEvent) {
            window.addEventListener('compassneedscalibration', function (eventData) {
                alert('Necesita calibrar');

                // Aquí se abriría
            });

            window.addEventListener('deviceorientation', function (eventData) {
                // El parámetro alpha hace referencia a la brujula,
                // los parámetros beta y gamma hacen referencia al giroscopio
//                var hor = eventData.gamma;
//                var ver = eventData.beta;
                if(self.navigator == 1)
                {
                    self.angle = (360 - eventData.webkitCompassHeading); //Si el usuario navega desde iOS debe usarse esta función, restándole 360 conseguimos que la imagen rote correctamente
                }
                else
                {
                    //En otro caso utilizaremos el alpha, que es soportado por los demás dispositivos.
                    self.angle = eventData.alpha;
//                    Compass.dirb = eventData.beta;
//                    Compass.dirg = eventData.gamma;
                }

                if(self.angle)
                {
                    // Le añadimos la desviación
                    self.angle += self.angle_offset;

                    if(!self.previous)
                    {
                        self._rotate(self.angle);
                        self.previous.timestamp = eventData.timeStamp;
                    }
                    else
                    {
                        var angle_diff = Math.abs(self.angle - self.previous.angle);
                        var time_diff = eventData.timeStamp - self.previous.timestamp;
                        if(angle_diff > 20 && time_diff > 400)
                        {
                            self._rotate(self.angle);
                            self.previous.timestamp = eventData.timeStamp;
                        }
                    }
                }
            }, false);
        }
        $(window).trigger('deviceorientation');
//        if(this.interval) clearInterval(this.interval);
//        this.interval = setInterval(Compass._rotate, 500);
    };

    this._setNavigator = function()
    {
        if (navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i))
        {
            this.navigator = 1;
        }
        else this.navigator = 0;
    };

    this._rotate = function()
    {
//        console.log('alpha: ' + Compass.angle);
//        console.log('\tbeta: ' + Compass.dirb);
//        console.log('\tgamma: ' + Compass.dirg);
        var rotation;

        // If the device is oriented horizontally the angle must be changed accordingly
        if (window.orientation == null || window.orientation == 0){
            rotation = self.angle;
        } else {
            rotation = self.angle - window.orientation;
        }

        self.$e.css({'transform': 'rotate(' + -rotation + 'deg)'});

        self.previous = {};
        self.previous.angle = self.angle;

        console.log(self.angle);
    };

    this.respawn = function()
    {
        this.$e = $('.locate-icon');
        this.previous = null;
        $(window).trigger('deviceorientation');
    };

    self.init();
}




//(function($){
//    //Attach this new method to jQuery
//    $.fn.extend({
//
//        //This is where you write your plugin's name
//        compass: function() {
//            //Iterate over the current set of matched elements
////            return this.each(function() {
////
////                //code to be inserted here
////                new Compass(this);
////            });
//
//            return new Compass(this).init();
//        }
//    });
//
////pass jQuery to the function,
////So that we will able to use any valid Javascript variable name
////to replace "$" SIGN. But, we'll stick to $ (I like dollar sign: ) )
//})(jQuery);





//
//function Compass(element)
//{
//    var self = this;
//
//    this.$element = element;
//
//    this.init = function()
//    {
//        if (window.DeviceOrientationEvent) {
//            window.addEventListener('deviceorientation', function (eventData) {
//                // El parámetro alpha hace referencia a la brujula,
//                // los parámetros beta y gamma hacen referencia al giroscopio
////                var hor = eventData.gamma;
////                var ver = eventData.beta;
//                if (navigator.userAgent.match(/iPhone/i) ||
//                    navigator.userAgent.match(/iPad/i) ||
//                    navigator.userAgent.match(/iPod/i))
//                {
//                    self.dir = (360 - eventData.webkitCompassHeading); //Si el usuario navega desde iOS debe usarse esta función, restándole 360 conseguimos que la imagen rote correctamente
//                }
//                else self.dir = eventData.alpha; //En otro caso utilizaremos el alpha, que es soportado por los demás dispositivos.
//            }, false);
//        }
//        $(window).trigger('deviceorientation');
//        setInterval(self._rotate, 200);
//    };
//
//    this._rotate = function()
//    {
//        console.log(self.dir);
//        var rotation;
//        if (window.orientation == 0) {
//            rotation = self.dir;
//        }
//        else if (window.orientation == 90) {
//            rotation = self.dir-90;
//        }
//        else {
//            rotation = self.dir+90;
//        }
//        self.$element.css({'-webkit-transform': 'rotate(' + -rotation + 'deg)'});
//    };
//}