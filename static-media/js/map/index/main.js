var ua = navigator.userAgent;
var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8));

EVENTS = 'click touch tap';
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



    SwipeMenu.init();
    ScrollMenu.init();
    Panorama.init();


    var $menu = $('nav#menu-right');
    $menu.mmenu({
        position: 'left',
        slideDuration    : 300
    });

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


    if (window.DeviceOrientationEvent) {
        window.addEventListener('orientationchange', myOrientResizeFunction, false);
    }
    $(window).resize(function () {
        myOrientResizeFunction()
    });


    $('button#closeCoupon').on(EVENTS, function () {
        $('div.device').fadeOut();
    });
    var mySwiper = new Swiper('.swiper-container', {
        pagination: '.pagination',
        loop: true,
        grabCursor: true,
        paginationClickable: true
    });
    $('.arrow-left').on(EVENTS, function (e) {
        e.preventDefault();
        mySwiper.swipePrev();
    });
    $('.arrow-right').on(EVENTS, function (e) {
        e.preventDefault();
        mySwiper.swipeNext();
    });

    $('div#page').hide();
    $('body').prepend('<div class="splash">    <div class="container">        <div class="sp-container"             >            <div class="frame-5"><span><img src="/media/logo-labelee-sin-slogan.png"></span></div>            <div id="find" class="frame-6">find<span id="your"> your<span id="way"> way!</span></span></div>        </div>    </div></div>')
    setTimeout(hideSplash, 3000);

    $('div.swiper-slide img').on(EVENTS, function (e) {
        e.preventDefault();
        var $id = $(this).prop('id');
        if ($id === "cup1") preDrawRoute(qrPoint.point.id, qrFloor.id, 2850, 28);
        else if ($id === "cup2") preDrawRoute(qrPoint.point.id, qrFloor.id, 2842, 28);
        else preDrawRoute(qrPoint.point.id, qrFloor.id, 5655, 40);
        $('div.device').fadeOut();

    });

});



function myOrientResizeFunction() {
    Coupon.calculateCouponArea();
    Panorama.resize();
}



function hideSplash() {
    var d = new Date();
    $('div#page').fadeIn(100);
    $('div.splash').fadeOut(200);
    loopFloors(floor_index);
    LocalStorageHandler.init();
    $('span#myCar').show();
}

var Coupon = {
    opened: false,

    init: function()
    {
        Coupon.calculateCouponArea();
        Coupon.bindOpen();
    },


    bindOpen: function()
    {
        $('div#cupones area').on(EVENTS, function (ev) {
            ev.stopPropagation();
            Coupon.open();
        });
    },


    open: function()
    {
        if(Panorama.opened) Panorama.close();

        if(Coupon.opened){
            Coupon.close();
            return;
        }

        $('div.device').fadeIn(300);

        $(document).on(EVENTS, function(ev){
            ev.stopPropagation();
            //console.log('click: '+ Coupon.opened);
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
        $('div.device').fadeOut(200);
    }
};






var ScrollMenu = {

    init: function()
    {
        this.$listMenu = $('#scrollMenu');
        this.$wrapper = $('nav');
        this.top = this.$listMenu.position().top;

        this.scrollEvent();
    },

    scroll: function(ev)
    {
        var self = ScrollMenu;

        ev.preventDefault();

        self.top_new = self.top + ev.gesture['deltaY'];
        self.$listMenu.css({
            'top': parseInt(self.top_new) + 'px'
        });
    },

    scrollEnd: function(ev)
    {
        var self = ScrollMenu;

        ev.preventDefault();

        if(self.top_new > 0 || self.$listMenu.height() < self.$wrapper.height())
            self.top_new = 0;
        else if(Math.abs(self.top_new) > self.$listMenu.height() - self.$wrapper.height())
            self.top_new = $('nav').height() - self.$listMenu.height();


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

        self.$listMenu
            .hammer()

            // SCROLL
            .bind('drag', self.scroll)
            .bind('dragend', self.scrollEnd)
    }
};


var SwipeMenu = {

    init: function()
    {
        var self = this;
        self.$swipeTab = $('#header');
        self.left = self.$swipeTab.position().left;

//        $('#header').trigger('click');

        $('#mmenu-blocker').css({
            'display': 'block',
            'margin-left': -91.7 + '%'
        });

        self.swipeEvent();
    },



    // SWIPE
    swipe: function(ev)
    {
        var self = SwipeMenu;

        self.left_new = self.left + ev.gesture['deltaX'];
        self.$swipeTab.css({
            'left': parseInt(self.left_new) + 'px'
        });


        $('html.mmenu-left.mmenu-opening .mmenu-page').css({
            'margin-left': -100 * ($(window).width() / parseInt(self.left_new)) + '%'
        });
        $('html.mmenu-left.mmenu-opening #mmenu-blocker').css({
            'margin-left': -100 * ($(window).width() / parseInt(self.left_new)) + '%'
        });

        console.log(self.left_new);
    },

    swipeEnd: function()
    {
        var self = SwipeMenu;

        var limit = $(document).width() * 0.65;
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

        console.log('END: ' + self.left_new);

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

