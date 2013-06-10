//Pantalla completa

//function hideAddressBar()
//{
//    var ua = navigator.userAgent;
//    if( ua.indexOf("Android") >= 0 )
//    {
//        var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8));
//        if (androidversion < 2.3)
//        {
//            return;
//        }
//    }
//
//    if(!window.location.hash)
//    {
//        if(document.height < window.outerHeight)
//        {
//            document.body.style.height = (window.outerHeight + 50) + 'px';
//        }
//
//        setTimeout( function(){ window.scrollTo(0, 1); }, 50 );
//    }
//}
//
//window.addEventListener("load", function(){ if(!window.pageYOffset){ hideAddressBar(); } } );
//window.addEventListener("orientationchange", hideAddressBar );

////


///	Activación y configuración del menú
$(function() {

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

