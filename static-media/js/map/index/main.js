//Pantalla completa
/*
function hideAddressBar()
{
    var ua = navigator.userAgent;
    if( ua.indexOf("Android") >= 0 )
    {
        var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8));
        if (androidversion < 2.3)
        {
            return;
        }
    }

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
});


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

