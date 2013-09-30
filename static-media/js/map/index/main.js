var mySwiper;

//PREFIX-FREE PLUG-INS
(function($, self){

    if(!$ || !self) {
        return;
    }

    for(var i=0; i<self.properties.length; i++) {
        var property = self.properties[i],
            camelCased = StyleFix.camelCase(property),
            PrefixCamelCased = self.prefixProperty(property, true);

        $.cssProps[camelCased] = PrefixCamelCased;
    }

})(window.jQuery, window.PrefixFree);
(function(a){if(a)a.events={DOMNodeInserted:function(b){var b=b.target,c=b.nodeName;b.nodeType==1&&(/link/i.test(c)?a.link(b):/style/i.test(c)?a.styleElement(b):b.hasAttribute("style")&&a.styleAttribute(b))},DOMAttrModified:function(b){b.attrName==="style"&&(document.removeEventListener("DOMAttrModified",a.events.DOMAttrModified,false),a.styleAttribute(b.target),document.addEventListener("DOMAttrModified",a.events.DOMAttrModified,false))}},document.addEventListener("DOMContentLoaded",function(){document.addEventListener("DOMNodeInserted",
    a.events.DOMNodeInserted,false);document.addEventListener("DOMAttrModified",a.events.DOMAttrModified,false)},false)})(window.StyleFix);
(function(a){if(a&&window.CSSStyleDeclaration)for(var b=0;b<a.properties.length;b++){var c=StyleFix.camelCase(a.properties[b]),d=a.prefixProperty(c),e=CSSStyleDeclaration.prototype,f=function(a){return function(){return this[a]}}(d),d=function(a){return function(b){this[a]=b}}(d);Object.defineProperty?Object.defineProperty(e,c,{get:f,set:d,enumerable:true,configurable:true}):e.__defineGetter__&&(e.__defineGetter__(c,f),e.__defineSetter__(c,d))}})(window.PrefixFree);
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
$(function() {

    main();

});

function main()
{
    ScrollMenu.init();
    Panorama.init();
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

   setTimeout(hideSplash, 100);

    $('div.swiper-slide img').on('click', function (e) {
        e.preventDefault();
        var cupPoint = parseInt($(this).prop('id')),
            cupFloor = new PointResource().read(cupPoint).floor,
            strL = cupFloor.length,
            cupFloor = parseInt(cupFloor.substring(strL-3, strL-1));

        drawRoute(qrPoint.point.id, cupPoint);
        $('div.device').fadeOut();
        LocalStorageHandler.setPrevDestByPoi(cupPoint)
    });
}


function hideSplash() {
    $('div#page').fadeIn(100);
    $('div.splash').fadeOut(100);

    if(!localStorage.getItem('first_shoot'))
    {
        HelpMenu.show();
    }

    loadFloors();

    if(qr_type == 'dest')
    {
        $('#header, #cupones, #myCar').hide();
    }
}


function showRouteFromMenu(origin_id, destination_id)
{
    if(origin_id != destination_id)
    {
        try
        {
            drawRoute(origin_id, destination_id);
            LocalStorageHandler.setPrevDestByPoi(destination_id);
            $('#menu-right').trigger('close');

            // Cambia a la planta del origen si estamos en otra
            var dest_floor = floors_indexed[route.fields.destiny.fields.floor];
            if (current_floor.id != qrFloor.id && current_floor.id != dest_floor.id) {
                var floor_to_show_name = floors_indexed[qrFloor.id].name;
                $('.leaflet-control-layers-base input[type=radio]')
                    .eq(baseLayers[floor_to_show_name].position)
                    .trigger('click');
            }
        }
        catch(err)
        {
            console.error(err);
        }
    }
}

var Coupon = {
    opened: false,

    init: function()
    {
        //Coupon.calculateCouponArea();
        Coupon.bindOpen();
    },


    bindOpen: function()
    {
        $('div#cupones').on('click', function (ev) {
            ev.stopPropagation();
            if (!Coupon.opened)
            {
                Coupon.open();
            }else{
                Coupon.close();
            }
        });
    },


    bindShowFromMarker: function()
    {
        $('div.leaflet-popup-content-wrapper').on('click', function (e) {
            //console.log(e.clientX +':'+ $(this).offset().left+':'+e.clientY +':'+ $(this).offset().top)
            if (e.clientX > $(this).offset().left + 135 &&
                e.clientY > $(this).offset().top + 67)

            {
                var imgID=$(this).find('p>button').data('socialmenu'),
                    myImg="img[id='"+imgID+"']",
                    myPos=$(myImg).parent()[0].index($(myImg).parent().parent());

           window.setTimeout(function(){
                    mySwiper.swipeTo(myPos-1);
                },500);




                 e.stopPropagation();
                 Coupon.open();

            }

        });
    },


    open: function()
    {
        if(Panorama.opened) Panorama.close();

        $('div.device').fadeIn(100);

        $(document).on('click tap touch', function(ev){
            ev.stopPropagation();
            if(Coupon.opened &&
                ($('div.device').has($(ev.target)).length === 0 &&
                    !$(ev.target).hasClass('device')))
                Coupon.close();
        });

        Coupon.opened = true;

    },


/*    calculateCouponArea: function()
    {
        var $img = $('img#cupon-img');

        var ancho = $img.width(),
            alto = $img.height(),
            vert = 360 / 469 * ancho,
            imgCoords = "0," + alto + "," + ancho + "," + alto + "," + vert + ",0,0," + alto,
            $area = $('div#cupones area');

        $area.attr({'coords': imgCoords});
    },*/


    close: function()
    {
        Coupon.opened = false;
        $('div.device').fadeOut(100);
    }
};


var ScrollMenu = {

    init: function()
    {
        this.$listMenu = $('#scrollMenu');
        this.$wrapper = $('nav');
//        this.$wrapper = $('nav#menu-right');
        this.$wrapper.css({
            'overflow-y': 'hidden'
        });
        this.top = this.$listMenu.position().top;

        this.scrollEvent();
    },

    scroll: function(ev)
    {
        var self = ScrollMenu;

        ev.gesture.preventDefault();

        self.top_new = self.top + ev.gesture['deltaY'];
        self.$listMenu.css({
            'top': parseInt(self.top_new) + 'px'
        });
    },

    scrollEnd: function(ev)
    {
        var self = ScrollMenu;

        self.top_new = self.top + ev.gesture['deltaY'];

        if(self.top_new > 50 || self.$listMenu.height() < self.$wrapper.height())
            self.top_new = 50;
        else if(Math.abs(self.top_new) > self.$listMenu.height() - self.$wrapper.height()+25 )
            self.top_new = self.$wrapper.height() - self.$listMenu.height()-25;

        self.$listMenu.css({
            'top': self.top_new + 'px'
        });

        self.top = self.top_new; 
    },

    scrollEvent: function()
    {
        var self = this;

        self.$listMenu.parent().hammer()
            .on('drag', self.scroll)
            .on('dragend', function(ev){
                if(ev.gesture) self.scrollEnd(ev);
            });
    }
};
