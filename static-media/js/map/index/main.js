var ua = navigator.userAgent;
var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8));

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

    //SwipeMenu.init();
    if(androidversion <= 2.3)
    {
        ScrollMenu.init();
    }
    Panorama.init();

    Map.events.bindAll();

    var $menu = $('nav#menu-right');
//    try{
        $menu.mmenu({
            position: 'left',
            slideDuration    : 300
        });
//    }catch(e){
//        console.log($menu);
//    }

    //	Añadir contadores
    $menu.find( 'i' ).bind(
        'count.search',
        function()
        {
            var $t = $(this);
            var $li = $t.parents( 'li' );
            var length = $( $t.parent().prev().attr( 'href' ) ).children().not( '.mmenu-label' ).not( '.hidden' ).length - 1;

            $li.show();
            $t.text( length );
            if ( length == 0 )
            {
                $li.hide();
            }
        }
    ).trigger( 'count.search' );

    //	Búsqueda en el menú (a varios niveles)
    var $input = $menu.find( 'div.search input' );
    var $items = $menu.find( '.mmenu-submenu li' ).not( ':first-child' ).not( '.mmenu-label' ).not( '.no-results' );
    var $labels = $menu.find( 'li.mmenu-label' );
    var $noresults = $menu.find( 'li.no-results' );
    var $counters = $menu.find( 'i' );

    $input.bind(
        'keyup.search',
        function()
        {
            var search = $(this).val().toLowerCase();
            $items.each(
                function()
                {
                    var $t = $(this).show().removeClass( 'hidden' );
                    if ( $t.text().toLowerCase().indexOf( search ) == -1 )
                    {
                        $t.hide().addClass( 'hidden' );
                    }
                }
            );
            $labels.hide();
            $items.each(
                function()
                {
                    $(this).not( '.hidden' ).prevAll( '.mmenu-label' ).first().show();
                }
            );

            $noresults[ $items.not( '.hidden' ).length ? 'hide' : 'show' ]();
            $counters.trigger( 'count.search' );
        }
    );

    //	Clic sobre un elemento del menú
    var $confirm = $('#confirmation');
    $('#menu-right a').not( '.mmenu-subopen' ).not( '.mmenu-subclose' ).bind(
        'click.example',
        function( e )
        {
            e.preventDefault();
            $confirm.show().text( 'You clicked "' + $(this).text() + '"' );
            $('#menu-right').trigger( 'close' );
        }
    );


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
});


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
        drawRoute(origin_id, destination_id);
        LocalStorageHandler.setPrevDestByPoi(destination_id);
        $('#menu-right').trigger('close');
    }
}


var HelpMenu = {
    _updateButtons: function()
    {
        if(this.current_entry_index == 0)
        {
            this.$prev_button.hide();
            this.$next_button.show();
        }
        else if(this.current_entry_index >= this.$entry_list.length-1)
        {
            this.$prev_button.show();
            this.$next_button.hide();
            this.$finish_button.show();
        }
        else
        {
            this.$prev_button.show();
            this.$next_button.show();
            this.$finish_button.hide();
        }
    },

    _showPrevEntry: function()
    {
        if(this.current_entry_index > 0)
        {
            this.$entry_list.eq(this.current_entry_index).removeClass('current');
            this.$entry_list.eq(--this.current_entry_index).addClass('current');
            this._updateButtons();
        }
    },

    _showNextEntry: function()
    {
        if(this.current_entry_index < this.$entry_list.length)
        {
            this.$entry_list.eq(this.current_entry_index).removeClass('current');
            this.$entry_list.eq(++this.current_entry_index).addClass('current');
            this._updateButtons();
        }
    },

    _close: function()
    {
        this.$e.fadeOut(300);
        setTimeout(function(){
            HelpMenu.$entry_list.eq(HelpMenu.current_entry_index).removeClass('current');
            HelpMenu.$entry_list.eq(0).addClass('current');
            HelpMenu.$e.find('*').off();
        },400);
    },

    show: function()
    {
        this.$e = $('#help_menu');
        this.$e.css({
            width: $(window).width(),
            height: $(window).height()
        });

        // asignamos los eventos sobre los botones de anterior y siguiente
        this.$prev_button = this.$e.find('.prev');
        this.$next_button = this.$e.find('.next');
        this.$finish_button = this.$e.find('.finish');
        this.$entry_list = this.$e.find('.entry');
        this.current_entry_index = 0;
        this.$prev_button.hide();
        this.$next_button.show();
        this.$finish_button.hide();

        this.$prev_button.on('click', function(){
            HelpMenu._showPrevEntry();
        });

        this.$next_button.on('click', function(e){
            HelpMenu._showNextEntry();
        });

        this.$finish_button.on('click', function(e){
            HelpMenu._close();
        });

        this.$e.show(200);
    }
};


var Coupon = {
    opened: false,

    init: function()
    {
        Coupon.calculateCouponArea();
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

//VERSION CORTA

                window.setTimeout(function(){
                    mySwiper.swipeTo(myPos-1);
                },500);




                 e.stopPropagation();


//VERSION CORTA
                 Coupon.open();


            }

        });
    },


    open: function()
    {
        if(Panorama.opened) Panorama.close();

        $('div.device').fadeIn(100);

        $(document).on('click', function(ev){
            ev.stopPropagation();
            if(Coupon.opened &&
                ($('div.device').has($(ev.target)).length === 0 &&
                    !$(ev.target).hasClass('device')))
                Coupon.close();
        });

        Coupon.opened = true;

    },


    calculateCouponArea: function()
    {
        var $img = $('img#cupon-img');

        var ancho = $img.width(),
            alto = $img.height(),
            vert = 360 / 469 * ancho,
            imgCoords = "0," + alto + "," + ancho + "," + alto + "," + vert + ",0,0," + alto,
            $area = $('div#cupones area');

        $area.attr({'coords': imgCoords});
    },


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
        this.$wrapper = $('nav#menu-right');
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

        ev.gesture.preventDefault();

        self.top_new = self.top + ev.gesture['deltaY'];

        if(self.top_new > 0 || self.$listMenu.height() < self.$wrapper.height())
            self.top_new = 0;
        else if(Math.abs(self.top_new) > self.$listMenu.height() - self.$wrapper.height())
            self.top_new = self.$wrapper.height() - self.$listMenu.height();


        // map.css({
        // 	'transition': 'top 1s linear 2s, left 1s linear 2s'
        // });

        self.$listMenu.css({
            'top': self.top_new + 'px'
        });

        self.top = self.top_new;
    },

    scrollEvent: function()
    {
        var self = this;

        self.$listMenu.hammer()
            .on('drag', self.scroll)
            .on('dragend', self.scrollEnd);
    }
};


var SwipeMenu = {

    init: function()
    {
        this.$swipeTab = $('#menuTab');
        this.left = this.$swipeTab.position().left;

        this.swipeEvent();
    },



    // SWIPE
    swipe: function(ev)
    {
        var self = SwipeMenu;

        var i = this;

        self.left_new = self.left + ev.gesture['deltaX'];
        self.$swipeTab.css({
            'left': parseInt(self.left_new) + 'px'
        });
        $('.mmenu-page').css({
            'left': parseInt(self.left_new) + 'px'
        })
    },

    swipeEnd: function()
    {
        var self = SwipeMenu;

        var limit = $(document).width() * 0.8;
        if(self.left_new > limit)
            self.left_new = limit;
        else if(self.left_new < 0 || self.left_new < limit *  0.5)
            self.left_new = 0;

        // map.css({
        // 	'transition': 'top 1s linear 2s, left 1s linear 2s'
        // });

        self.$swipeTab.css({
            'left': self.left_new + 'px'
        });

        self.left = self.left_new;
    },

    swipeEvent: function()
    {
        var self = this;

        self.$swipeTab
            .hammer({prevent_default: true})

            // SCROLL
            .bind('drag', self.swipe)
            .bind('dragend', self.swipeEnd)
    }
};
