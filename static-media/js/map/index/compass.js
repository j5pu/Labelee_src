var Compass = {

    init: function()
    {
        this.$e = $('.locate-icon');
        this._setNavigator();

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
                if(Compass.navigator == 1)
                {
                    Compass.angle = (360 - eventData.webkitCompassHeading); //Si el usuario navega desde iOS debe usarse esta función, restándole 360 conseguimos que la imagen rote correctamente
                }
                else
                {
                    //En otro caso utilizaremos el alpha, que es soportado por los demás dispositivos.
                    Compass.angle = eventData.alpha;
//                    Compass.dirb = eventData.beta;
//                    Compass.dirg = eventData.gamma;
                }

                if(Compass.angle)
                {
                    if(!Compass.previous)
                    {
                        Compass._rotate(eventData);
                        Compass.previous.timestamp = eventData.timeStamp;
                    }
                    else
                    {
                        var angle_diff = Math.abs(Compass.angle - Compass.previous.angle);
                        var time_diff = eventData.timeStamp - Compass.previous.timestamp;
                        if(angle_diff > 20 && time_diff > 400)
                        {
                            Compass._rotate(eventData);
                            Compass.previous.timestamp = eventData.timeStamp;
                        }

                    }
                }
            }, false);
        }
        $(window).trigger('deviceorientation');
//        if(this.interval) clearInterval(this.interval);
//        this.interval = setInterval(Compass._rotate, 500);
    },

    _setNavigator: function()
    {
        if (navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i))
        {
            this.navigator = 1;
        }
        else this.navigator = 0;
    },

    _rotate: function()
    {
//        console.log('alpha: ' + Compass.angle);
//        console.log('\tbeta: ' + Compass.dirb);
//        console.log('\tgamma: ' + Compass.dirg);
        var rotation;
        if (window.orientation == 0) {
            rotation = Compass.angle;
        }
        else if (window.orientation == 90) {
            rotation = Compass.angle-90;
        }
        else {
            rotation = Compass.angle+90;
        }
        Compass.$e.css({'transform': 'rotate(' + -rotation + 'deg)'});

        Compass.previous = {};
        Compass.previous.angle = Compass.angle;
    }
};




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