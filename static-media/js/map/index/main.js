var mySwiper;

//PREFIX-FREE PLUG-INS
(function ($, self) {

    if (!$ || !self) {
        return;
    }

    for (var i = 0; i < self.properties.length; i++) {
        var property = self.properties[i],
            camelCased = StyleFix.camelCase(property),
            PrefixCamelCased = self.prefixProperty(property, true);

        $.cssProps[camelCased] = PrefixCamelCased;
    }

})(window.jQuery, window.PrefixFree);
(function (a) {
    if (a)a.events = {DOMNodeInserted: function (b) {
        var b = b.target, c = b.nodeName;
        b.nodeType == 1 && (/link/i.test(c) ? a.link(b) : /style/i.test(c) ? a.styleElement(b) : b.hasAttribute("style") && a.styleAttribute(b))
    }, DOMAttrModified: function (b) {
        b.attrName === "style" && (document.removeEventListener("DOMAttrModified", a.events.DOMAttrModified, false), a.styleAttribute(b.target), document.addEventListener("DOMAttrModified", a.events.DOMAttrModified, false))
    }}, document.addEventListener("DOMContentLoaded", function () {
        document.addEventListener("DOMNodeInserted",
            a.events.DOMNodeInserted, false);
        document.addEventListener("DOMAttrModified", a.events.DOMAttrModified, false)
    }, false)
})(window.StyleFix);
(function (a) {
    if (a && window.CSSStyleDeclaration)for (var b = 0; b < a.properties.length; b++) {
        var c = StyleFix.camelCase(a.properties[b]), d = a.prefixProperty(c), e = CSSStyleDeclaration.prototype, f = function (a) {
            return function () {
                return this[a]
            }
        }(d), d = function (a) {
            return function (b) {
                this[a] = b
            }
        }(d);
        Object.defineProperty ? Object.defineProperty(e, c, {get: f, set: d, enumerable: true, configurable: true}) : e.__defineGetter__ && (e.__defineGetter__(c, f), e.__defineSetter__(c, d))
    }
})(window.PrefixFree);
/*
 //Pantalla completa
 function hideAddressBar()
 {

 if(( ua.indexOf("Android") >= 0 ) && (androidversion < 2.3))
 return;

 if(!window.location.hash)
 {
 if(document.height < window.outerHeight)
 {
 document.body.style.height = (window.outerHeight + 50) + 'px';
 }

 setTimeout( function(){ window.scrollTo(0, 1); }, 50 );
 }
 }

 window.addEventListener("load", function(){ if(!window.pageYOffset){ hideAddressBar(); } } );
 window.addEventListener("orientationchange", hideAddressBar );
 */



///	Activación y configuración del menú
$(function () {

    main();

});

function main() {

    ScrollMenu.init();

    Panorama.init();

    HelpMenu.init();

    Map.events.bindAll();


    $('button#closeCoupon').on('click', function () {
        $('div.device').fadeOut(100);
    });

    mySwiper = new Swiper('.swiper-container', {
        pagination: '.pagination',
        loop: true,
        grabCursor: true,
//        momentumRatio: 2,
        paginationClickable: true
    });
    $('.arrow-left').on('click', function (e) {
        e.preventDefault();
        mySwiper.swipePrev();
    });
    $('.arrow-right').on('click', function (e) {
        e.preventDefault();
        mySwiper.swipeNext();
    });

    $('#cupones, #header, span.locator, div#marquee').hide();

    setTimeout(hideSplash, 3000);

    Coupon.bindShowRoute();
}


function hideSplash() {

    $('div#page').fadeIn(2000);
    $('div.splash').fadeOut(2000);

    if (!localStorage.getItem('first_shoot')) {
        HelpMenu.show();
    }

    loadFloors();

    if (qr_type == 'dest') {
        $('#header, #cupones, #myCar').hide();
    }

    var $org = $('#routeDiv').detach();
    $('html').removeClass('mm-no-overflowscrolling');


    $('#routeTab > a').on('click', function (e) {
        e.preventDefault();
        $('#routeDiv').remove();

        var $clone = $org.clone().appendTo('body').mmenu({
            position: "bottom",
            zposition: "next"
        });

        setTimeout(function () {
            $clone.trigger('open');
        }, 50);

        var instructionList = document.getElementById('instructionList');
        instructionList.innerHTML = '';
        $('#routeDiv p').text('Para llegar a ' + route.fields.destiny.fields.description +':');
        for (var subroute_index in route.fields.subroutes) {
            if (instructionList) {
                instructionList.innerHTML += '<li> Planta '+floors_indexed[route.fields.subroutes[subroute_index].floor.pk].name+': ' +route.fields.subroutes[subroute_index]["text_description"] + '</li>'
            }
        }
    });
}


function showRouteProgrToPoint(origin_id, destination_id)
{
    // Muestra la ruta programáticamente. Por ejemplo, cuando se pulsa sobre algún site
    // desde el menú lateral, botón 'mi coche', etc..
    if (origin_id != destination_id) {
        try {
            drawRoute(origin_id, destination_id);
            LocalStorageHandler.setPrevDestByPoi(destination_id);
            $('#menu-right').trigger('close');

            // Cambia a la planta del origen si estamos en otra
            var dest_floor = floors_indexed[route.fields.destiny.fields.floor];
            if (current_floor.id != dest_floor.id) {
                var floor_to_show_name = floors_indexed[qrFloor.id].name;

                if (!$('.leaflet-control-layers-base input[type=radio]').eq(baseLayers[floor_to_show_name].position).is(':checked'))
                {
                $('.leaflet-control-layers-base input[type=radio]')
                    .eq(baseLayers[floor_to_show_name].position)
                    .trigger('click');
                }
                $('input[type=radio].leaflet-control-layers-selector:checked').parent().css('background-color', 'darkorange');
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}


function showRouteProgrToSite(origin_id, destination_site_id)
{
    var closest_destination_id = routeResource.getClosestPoint(origin_id, destination_site_id).id;
    showRouteProgrToPoint(origin_id, closest_destination_id);
}



var Coupon = {
    opened: false,

    init: function () {
        //Coupon.calculateCouponArea();
        Coupon.bindOpen();
    },


    bindOpen: function () {
        $('div#cupones').on('click', function (ev) {
            ev.stopPropagation();
            if (!Coupon.opened) {
                Coupon.open();
            } else {
                Coupon.close();
            }
        });
    },


    bindShowFromMarker: function () {
        $('div.leaflet-popup-content-wrapper').on('click', function (e) {
//            console.log(e.clientX +':'+ $(this).offset().left+':'+e.clientY +':'+ $(this).offset().top)
            if (e.clientX > $(this).offset().left + 120 &&
                e.clientY > $(this).offset().top + 15) {
                // De momento apuntamos al primer cupón del site
                // Todo: en el swiper, poder paginar los cupones por site
                var siteID = $(this).data('site-id'),
                    myImg = "img[id='" + mapData.coupons[siteID][0].id + "']",
                    myPos = $(myImg).parent()[0].index($(myImg).parent().parent());

                window.setTimeout(function () {
                    mySwiper.swipeTo(myPos - 1);
                }, 500);

                e.stopPropagation();
                Coupon.open();
            }
        });
    },


    open: function () {
        if (Panorama.opened) Panorama.close();

        $('div.device').fadeIn(100);

        $(document).on('click tap touch', function (ev) {
            ev.stopPropagation();
            if (Coupon.opened &&
                ($('div.device').has($(ev.target)).length === 0 && !$(ev.target).hasClass('device')))
                Coupon.close();
        });

        Coupon.opened = true;
    },

    close: function () {
        Coupon.opened = false;
        $('div.device').fadeOut(100);
    },

    addIconOnMarker: function(marker_site_id)
    {
        // Añade el icono '%' si el site (label) del marker que contenga algún cupón
        if (mapData.coupons[marker_site_id] &&
            mapData.coupons[marker_site_id].length != 0) {
            $('div.leaflet-popup-content-wrapper')
                .addClass('withCoupon')
                .attr('data-site-id', marker_site_id);
        }
    },

    bindShowRoute: function()
    {
        // Cuando pulsamos en una imágen de la cuponera (swiper)
        $('div.swiper-slide img').on('click', function (e) {
            e.preventDefault();
            var site_id = parseInt($(this).data('site-id'));
            showRouteProgrToSite(qrPoint.point.id, site_id);
            $('div.device').fadeOut();
        });
    }
};


var ScrollMenu = {

    init: function () {
        this.$listMenu = $('#scrollMenu');
        this.$wrapper = $('nav');
        this.$wrapper.css({
            'overflow-y': 'hidden'
        });
        this.top = this.$listMenu.position().top;

        this.scrollEvent();
    },

    scroll: function (ev) {
        var self = ScrollMenu;

        ev.gesture.preventDefault();

        self.top_new = self.top + ev.gesture['deltaY'];
        self.$listMenu.css({
            'top': parseInt(self.top_new) + 'px'
        });
    },

    scrollEnd: function (ev) {
        var self = ScrollMenu;

        self.top_new = self.top + ev.gesture['deltaY'];

        if (self.top_new > 50 || self.$listMenu.height() < self.$wrapper.height())
            self.top_new = 50;
        else if (Math.abs(self.top_new) > self.$listMenu.height() - self.$wrapper.height() + 25)
            self.top_new = self.$wrapper.height() - self.$listMenu.height() - 25;

        self.$listMenu.css({
            'top': self.top_new + 'px'
        });

        self.top = self.top_new;
    },

    scrollEvent: function () {
        var self = this;

        self.$listMenu.parent().hammer()
            .on('drag', self.scroll)
            .on('dragend', function (ev) {
                if (ev.gesture) self.scrollEnd(ev);
            });
    }
};


function showCookiesMessage() {

    $.jqDialog.confirm("Usamos cookies para asegurarnos de que te ofrecemos la mejor experiencia posible en nuestro sitio web, para más información pulsa <a onclick='HelpMenu.showDisclaimer();'>aquí</a>. ¿Deseas activarlas? ",
        function () {
            alert("This intrusive alert says you clicked YES");
        },		// callback function for 'YES' button
        function () {
            alert("This intrusive alert says you clicked NO");
        }		// callback function for 'NO' button
    );
}
