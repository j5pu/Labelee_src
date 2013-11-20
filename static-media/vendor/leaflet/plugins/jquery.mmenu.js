/*	
 *	jQuery mmenu 1.1.0
 *	
 *	Copyright (c) 2013 Fred Heusschen
 *	www.frebsite.nl
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	http://en.wikipedia.org/wiki/MIT_Licenseº
 *	http://en.wikipedia.org/wiki/GNU_General_Public_License
 */


(function( $ ) {
	
	var $html = null,
		$body = null,
		$page = null,
		$blck = null;

	$.fn.mmenu = function( o )
	{
		if ( !$html )
		{
			$html = $('html');
			$body = $('body');
		}

		return this.each(
			function()
			{

				//	STORE VARIABLES
				var $menu = $(this),
					opts = $.extend( true, {}, $.fn.mmenu.defaultOptions, o );

				opts.configuration.opened	 	= false;
				opts.configuration.direction	= ( opts.slidingSubmenus ) ? 'horizontal' : 'vertical';


				//	INIT PAGE +  MENU
				$page = _initPage( $page, opts.configuration );
				$menu = _initMenu( $menu, opts.configuration );
				$menu = _initSubmenus( $menu, opts.configuration );
				$blck = _initBlocker( $blck, $menu, opts.configuration );


				//	BIND MENU EVENTS
				$menu
					.bind(
						evt( 'toggle' ),
						function( e )
						{
							e.preventDefault();
							e.stopPropagation();

							return $menu.triggerHandler( evt( opts.configuration.opened ? 'close' : 'open' ) );
						}
					)
					.bind(
						evt( 'open' ),
						function( e )
						{
							e.preventDefault();
							e.stopPropagation();

							if ( opts.configuration.opened )
							{
								return false;
							}

							opts.configuration.opened = true;

							$page
								.data( dta( 'style' ), $page.attr( 'style' ) || '' )
								.width( $page.outerWidth() );
	
							_click( $page,
								function()
								{
									$menu.trigger( evt( 'close' ) );
								}
							);
	
							$menu.addClass( cls( 'opened' ) );
							$html.addClass( cls( 'opened' ) ).addClass( cls( opts.position ) );
							setTimeout(
								function()
								{
									$html.addClass( cls( 'opening' ) );
								}, 25
							);
							
							return 'open';
						}
					)
					.bind(
						evt( 'close' ),
						function( e )
						{
							e.preventDefault();
							e.stopPropagation();

							if ( !opts.configuration.opened )
							{
								return false;
							}

							opts.configuration.opened = false;
							$html.removeClass( cls( 'opening' ) );
							$page.unbind( evt( 'click' ) );

							setTimeout(
								function()
								{
									$html.removeClass( cls( 'opened' ) ).removeClass( cls( opts.position ) );
									$menu.removeClass( cls( 'opened' ) );
									$page.attr( 'style', $page.data( dta( 'style' ) ) );
								}, opts.configuration.slideDuration + 25
							);

							return 'close';
						}
					);


				//	BIND SUBMENU EVENTS
				var $subs = $menu.find( 'ul' );

				if ( opts.configuration.direction == 'horizontal' )
				{
					$subs
						.bind(
							evt( 'toggle' ),
							function( e )
							{
								e.preventDefault();
								e.stopPropagation();
								
								var $t = $(this);
								return $t.triggerHandler( evt( 'open' ) );
							}
						)
						.bind(
							evt( 'open' ),
							function( e )
							{
								e.preventDefault();
								e.stopPropagation();

								var $t = $(this);

								$t.prevAll().addClass( cls( 'subopened' ) );
								$t.nextAll().removeClass( cls( 'subopened' ) );
								$t.removeClass( cls( 'subopened' ) ).addClass( cls( 'opened' ) );
								setTimeout(
									function()
									{
										$t.nextAll().removeClass( cls( 'opened' ) );
									}, opts.configuration.slideDuration + 25
								);
								return 'open';
							}
						)
						.bind(
							evt( 'close' ),
							function( e )
							{
								e.preventDefault();
								e.stopPropagation();

								$(this).prevAll( '.' + cls( 'opened' ) ).first().trigger( evt( 'open' ) );
								return 'close';
							}
						);
				}
				else
				{
					$subs
						.bind(
							evt( 'toggle' ),
							function( e )
							{
								e.preventDefault();
								e.stopPropagation();

								var $t = $(this);
								return $t.triggerHandler( evt( ( $t.parent().hasClass( cls( 'opened' ) ) ) ? 'close' : 'open' ) );
							}
						)
						.bind(
							evt( 'open' ),
							function( e )
							{
								e.preventDefault();
								e.stopPropagation();

								var $t = $(this);
								$t.parent().addClass( cls( 'opened' ) );
								return 'open';
							}
						)
						.bind(
							evt( 'close' ),
							function( e )
							{
								e.preventDefault();
								e.stopPropagation();

								var $t = $(this);
								$t.parent().removeClass( cls( 'opened' ) );
								return 'close';
							}
						);
				}


				//	OPEN MENU LINKS
				var menuid = $menu.attr( 'id' );
				if ( menuid && menuid.length > 0 )
				{
					_click( 'a[href="#' + menuid + '"]',
						function()
						{
							$menu.trigger( evt( 'open' ) );
						}
					);
				}

				//	OPEN SUBMENU LINKS
				_click( $( 'a.' + cls( 'subopen' ) + ', ' + 'a.' + cls( 'subclose' ), $menu ),
					function()
					{
						$( $(this).attr( 'href' ) ).trigger( evt( 'toggle' ) );
					}
				);


				//	CLOSE MENU, DELAY URL-CHANGE
				if ( opts.closeOnClick )
				{
					//	TODO
					var $navigationlinks = $('a', $menu).not( '.' + cls( 'subopen' ) ).not( '.' + cls( 'subclose' ) );
					_click( $navigationlinks,
						function()
						{
							var $t = $(this),
								href = $t.attr( 'href' );

							$menu.trigger( evt( 'close' ) );
							$navigationlinks.parent().removeClass( cls( 'selected' ) );
							$t.parent().addClass( cls( 'selected' ) );
							if ( href.slice( 0, 1 ) != '#' )
							{
								setTimeout(
									function()
									{
										window.location.href = href;
									}, opts.configuration.slideDuration - 100
								);
							}
						}
					);
				}
			}
		);
	};

	$.fn.mmenu.defaultOptions = {
		slidingSubmenus	: true,
		closeOnClick	: true,
		position		: 'left',
		configuration	: {
			selectedClass	: 'Selected',
			labelClass		: 'Label',
			pageNodetype	: 'div',
			menuNodetype	: 'nav',
			slideDuration	: 500
		}
	};

	$.fn.mmenu.debug = function( msg )
	{
		if ( typeof console != 'undefined' && typeof console.log != 'undefined' )
		{
			console.log( 'MMENU: ' + msg );
		}
	}
	$.fn.mmenu.deprecated = function( depr, repl )
	{
		if ( typeof console != 'undefined' && typeof console.warn != 'undefined' )
		{
			console.warn( 'MMENU: ' + depr + ' is deprecated, use ' + repl + ' instead.' );
		}
	}

	function _initPage( $p, conf )
	{
		if ( !$p )
		{
			$p = $( '> ' + conf.pageNodetype, $body );
			if ( $p.length > 1 )
			{
				$p = $p.wrapAll( '<' + conf.pageNodetype + ' />' ).parent();
			}
			$p.addClass( cls( 'page' ) );
		}
		return $p;
	}

	function _initMenu( $m, conf )
	{
		if ( !$m.is( conf.menuNodetype ) )
		{
			$m = $( '<' + conf.menuNodetype + ' />' ).append( $m );
		}
	//	$_dummy = $( '<div class="mmenu-dummy" />' ).insertAfter( $m ).hide();
		$m.addClass( cls( '' ).slice( 0, -1 ) ).prependTo( 'body' );
		$( 'li.' + conf.selectedClass, $m ).removeClass( conf.selectedClass ).addClass( cls( 'selected' ) );
		$( 'li.' + conf.labelClass, $m ).removeClass( conf.labelClass ).addClass( cls( 'label' ) );

		return $m;
	}

	function _initSubmenus( $m, conf )
	{
		$m.addClass( cls( conf.direction ) );

		$( 'ul ul', $m )
			.addClass( cls( 'submenu' ) )
			.each(
				function( i )
				{
					var $t = $(this)
						$a = $t.parent().find( '> *' ).not( 'ul' ),
						id = $t.attr( 'id' ) || cls( 's' + i );

					$t.attr( 'id', id );

					var $btn = $( '<a class="' + cls( 'subopen' ) + '" href="#' + id + '" />' ).insertBefore( $a );
					if ( !$a.is( 'a' ) )
					{
						$btn.addClass( cls( 'fullsubopen' ) );
					}

					if ( conf.direction == 'horizontal' )
					{
						var $p = $t.parent().parent(),
							id = $p.attr( 'id' ) || cls( 'parent' + i );
	
						$p.attr( 'id', id );
						$t.prepend( '<li><a class="' + cls( 'subclose' ) + '" href="#' + id + '">' + $a.text() + '</a></li>' );
					}
				}
			);

		if ( conf.direction == 'horizontal' )
		{
			//	Add opened-classes
			$( 'li.' + cls( 'selected' ), $m )
				.parents( 'li.' + cls( 'selected' ) ).removeClass( cls( 'selected' ) )
				.end().each(
					function()
					{
						var $t = $(this),
							$u = $t.find( '> ul' );
	
						if ( $u.length )
						{
							$t.parent().addClass( cls( 'subopened' ) );
							$u.addClass( cls( 'opened' ) );
						}
					}
				)
				.parent().addClass( cls( 'opened' ) )
				.parents( 'ul' ).addClass( cls( 'subopened' ) );
	
			//	Rearrange markup
			$( 'ul ul', $m ).appendTo( $m );

		}
		else
		{
			//	Replace Selected-class with opened-class in parents from .Selected
			$( 'li.' + cls( 'selected' ), $m )
				.addClass( cls( 'opened' ) )
				.parents( '.' + cls( 'selected' ) ).removeClass( cls( 'selected' ) );
		}

		return $m;
	}
	function _initBlocker( $b, $m, conf )
	{
		if ( !$b )
		{
			$b = $( '<div id="' + cls( 'blocker' ) + '" />' ).appendTo( $body );
		}
		_click( $b,
			function()
			{
				$m.trigger( evt( 'close' ) );
			}
		);
		return $b;
	}

	function _click( $b, fn )
	{
		if ( typeof $b == 'string' )
		{
			$b = $( $b );
		}
		$b.bind(
			evt( 'click' ),
			function( e )
			{
				e.preventDefault();
				e.stopPropagation();

				fn.call( this, e );
			}
		);
	}

	function cls( c )
	{
		return 'mmenu-' + c;
	}
	function dta( d )
	{
		return 'mmenu-' + d;
	}
	function evt( e )
	{
		return e + '.mmenu';
	}

})( jQuery );