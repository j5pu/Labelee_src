
// Global vars
var canvas,cBg,canvasFake;
var context,ctxBg,ctxFake;
var maxWidth;
var fontSize;
var lineHeight;
var x,y;
var text;
var lines;
var spChar;
var tabHeight;
var drag_up;
var dimCanvas;
// URL Vars

var custom;
var bgColor;
var tColor;
var fontSelected;
var stopAnimation;
var dragStyles;

var tWidth;
var xMenu;
var tObject;
var shortCode;

function TLoader() {
   shortCode = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');
   tObject = new Object();
   text = '';




  $(window).resize(function(e){
	  	layoutThumbs();
	  	e.preventDefault();
	  	e.stopPropagation();


  });

  var focused = false;

// Init Menu
initMenu();


}

function closeMenu(){
			$("#tabContaier").removeClass("open");
			$("#tabContaier").css('margin-top', -tabHeight);
			drag_up = false;
			$('#close_tab').css('display', 'none');
			$("#tabContaier ul li").removeClass("active"); // Remove pre-highlighted link
			$('.tabDetails').css('background', '#f0f0f0');
			$('#tabContaier').css('border','1px solid #f0f0f0');
			//$('#tabContaier').trigger('focus');
	}



// Google Fonts Management & Instacen Initialization/**/
var tloader;


 WebFontConfig = {
     google: { families: [ 'Roboto:300:latin', 'Open Sans:300:latin', 'Armata::latin', 'Titan+One::latin', 'Courgette::latin'] },
     loading: function() {

     },
     active: function() {

         tloader = new TLoader();
     }
   };
   (function() {
     var wf = document.createElement('script');
     wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
       '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
     wf.type = 'text/javascript';
     wf.async = 'true';
     var s = document.getElementsByTagName('script')[0];
     s.parentNode.insertBefore(wf, s);
  })();

// Text

	function initMenu(){
		$(".tabContents").hide(); // Hide all tab conten divs by default
		$(".tabContents:first").show(); // Show the first div of tab content by default
		$('#tabContaier').css('display', 'block');

		// fake close
		$("#tabContaier").removeClass("open");
		$("#tabContaier").css('margin-top', -tabHeight);
		drag_up = false;
		$('#close_tab').css('display', 'none');
		$("#tabContaier ul li").removeClass("active"); // Remove pre-highlighted link
		$('.tabDetails').css('background', '#f0f0f0');
		$('#tabContaier').css('border','1px solid #f0f0f0');

		    Hammer.plugins.fakeMultitouch();

		    function getEl(id) {
		        return document.getElementById(id);
		    }


		    var prevent_scroll_drag = true;
			drag_up = false;
			tabHeight = -parseInt($('#tabContaier').css('margin-top'),10);

			var dragGesture = function(e){
				e.stopPropagation();
			// disable browser scrolling
									            e.gesture.preventDefault();

			   	var ttop;
				switch(e.type){
			   		case 'dragdown':
			   			drag_up = false;
			   			ttop =e.gesture.center.pageY;
			   			if ((ttop >= 0) && (ttop <= (tabHeight+50))){
							$("#tabContaier").css('margin-top', (-tabHeight+e.gesture.center.pageY));
			   			}
			   		break;
					case 'dragup':
						drag_up = true;
			   			ttop =e.gesture.center.pageY;
			   			if ((ttop >= 0) && (ttop <= tabHeight)){
							$("#tabContaier").css('margin-top', (-tabHeight+e.gesture.center.pageY));
			   			}
					break;

					case 'touch':
						$('this').focus();
						if ($(this).attr("name") != "close"){
							var activeTab = $(this).attr("name"); // Catch the click link
							if(!$(this).hasClass('active')){
								$(".tabContents").css('display','none'); // hide currently visible tab content div
								$('.tabDetails').css('background', '#fff');
								$('#tabContaier').css('border','1px solid #fff');
								//$(activeTab).fadeIn(); // show the target tab content div by matching clicked link.
								$(activeTab).css('display','block');
							}
							$("#tabContaier ul li").removeClass("active"); // Remove pre-highlighted link
							$(this).addClass("active"); // set clicked link to highlight state

						}
					break;

			   		default: // release
							if ($(this).attr("name") == "close"){
								drag_up = true;
							}
			   				if (drag_up == true){
								//$('this').blur();
								closeMenu();

							}else{
								$("#tabContaier").addClass("open");
								$("#tabContaier").css('margin-top', 0);
								$('#close_tab').css('display', 'block');
								$('#ta').trigger('blur');

							}
					break;
				}

		   }

			var hammertime = $(".tab").hammer();


		    hammertime.on("touch dragdown dragup release", dragGesture);
			var posXthumbs;
			var dragginThumbs = false;
			xMenu = parseInt($('#thumbs').css('margin-left'),10);
			tWidth = (11*88)+44; // longitud total thumbs
			layoutThumbs();
			dragStyles = true;

			var velX = 0;
			var gesX = 0;

	var dragThumbs = function(e){
						e.stopPropagation();
						// disable browser scrolling
						            e.gesture.preventDefault();

			   			switch(e.type){
			   				case 'touch':
			   					posXthumbs = parseInt($('#thumbs').css('margin-left'),10);

			   				break;

			   				case 'release':

			   					 if (dragginThumbs){
									$('#thumbs').css('margin-left',posXthumbs+gesX);
									$('#thumbs').animate({
								    marginLeft: posXthumbs+(gesX+(velX*100))
								    },{
								    duration: 400*e.gesture.velocityX,
									specialEasing:{marginLeft: 'easeOutQuint'},
								    complete: function() {
								    	if (parseInt($('#thumbs').css('margin-left'),10) < (($(window).width()-xMenu) - tWidth)){
											$('#thumbs').css('margin-left', (($(window).width()-xMenu) - tWidth));
										}
										if (parseInt($('#thumbs').css('margin-left'),10) > xMenu){
											$('#thumbs').css('margin-left', xMenu);
										}

									dragginThumbs = false;
  									}
  									});

			   					}else{
			   						$('.thumb').removeClass('selected');
			   						$(this).addClass('selected');
			   						bgColor= $(this).css('background-color');
			   						tColor = $(this).css('color');
			   						fontSelected = $(this).css('font-family');			   						//calculateDim();
			   					}

			   				break;
			   				default: // draggin
			   					if (dragStyles){
									dragginThumbs = true;
									gesX = e.gesture.deltaX;
									$('#thumbs').css('margin-left',posXthumbs+e.gesture.deltaX);
									velX = (e.gesture.deltaX <0)?-e.gesture.velocityX:e.gesture.velocityX;
									//velX = e.gesture.velocityX;
								}
			   				break;
			   			}
				}

		    var hammerThumbs = $(".thumb").hammer();

		    hammerThumbs.on("touch dragleft dragright release", dragThumbs);



			function clickArrow(e){
				e.stopPropagation();
				var moveX;
				if ($(this).attr("id") == "arrow-left"){
					moveX = '+=82';

				}else{ //right
					moveX = '-=82';
				}
				$('#thumbs').animate({
					marginLeft: moveX
					//margin-left: '50px'
					}, 250, function() {
						if (parseInt($('#thumbs').css('margin-left'),10) < (($(window).width()-xMenu) - tWidth)){
							$('#thumbs').css('margin-left', (($(window).width()-xMenu) - tWidth));
						}
						if (parseInt($('#thumbs').css('margin-left'),10) > xMenu){
							$('#thumbs').css('margin-left', xMenu);
						}

				});
			}
			var hammerArrows = $(".arrow").hammer();

			hammerArrows.on("touch", clickArrow);


		$("#tabContaier ul li a").click(function(){ //Fire the click event
		});


};



function layoutThumbs(){
	if (tWidth < ($(window).width()-xMenu - 20)){
					$('.arrow').hide();
					$('#thumbs').css('margin-left',($(window).width()-tWidth - xMenu - 20)/2);
					dragStyles = false;
	}else{
		$('.arrow').show();
		$('#thumbs').css('margin-left',35);
		dragStyles = true;
	}
}


