

// END PNG LIB

function $_GET(variable) {
//var query = decodeURIComponent(window.location.search.substring(1));
var query = decodeURI(window.location.search.substring(1));
var vars = query.split("&");
for (var i = 0; i < vars.length; i++) {
var pair = vars[i].split("=");
if (pair[0] == variable) {
return unescape(pair[1]);
}
}
return false;
}



// Fullscreen Management
var pfx = ["webkit", "moz", "ms", "o", ""];
function RunPrefixMethod(obj, method) {
	var p = 0, m, t;
	while (p < pfx.length && !obj[m]) {
		m = method;
		if (pfx[p] == "") {
			m = m.substr(0,1).toLowerCase() + m.substr(1);
		}
		m = pfx[p] + m;
		t = typeof obj[m];
		if (t != "undefined") {
			pfx = [pfx[p]];
			return (t == "function" ? obj[m]() : obj[m]);
		}
		p++;
	}
}


// Paragraph text wrapping
	function wrapText() {
        //requestAnimationFrame(wrapText);
        var words = text.split(' ');
        var line = '';
        var tLines = 0;
        var yi = y;
        var xi = x;
		var testLine;
		var metrics;
		var testWidth;

		ctxFake.clearRect(0, 0, canvasFake.width, canvasFake.height);
		ctxFake.fillStyle = bgColor;
		ctxFake.fillRect(0,0,canvasFake.width, canvasFake.height);


// Still have my old transforms

		ctxFake.textAlign = 'center';
		ctxFake.fillStyle = tColor;
		ctxFake.font = fontSize+'pt '+ fontSelected;

	//pending: la línea con más caracteres
        for(var n = 0; n < words.length; n++) {
          testLine = line + words[n] + ' ';
          metrics = ctxFake.measureText(testLine);
          testWidth = metrics.width;

          	  if((testWidth > maxWidth) || (words[n] == spChar)) {

				ctxFake.fillText(line.replace(spChar+" ",""), xi, yi);

				line = words[n] + ' ';
				if (words.length > 1){
					yi += lineHeight;
					tLines++;
				}
			  }
			  else {
				line = testLine;
			  }



		} // end for

		ctxFake.fillText(line.replace(spChar+" ",""), xi, yi);

		if (text != ''){
			$('#cursor').css('left',(x+ctxFake.measureText(line.replace(spChar+" ","")).width/2)+parseInt($('#fakeCanvas').css('margin-left'),10));
		}else{
			$('#cursor').css('left',((canvasFake.width / 2))+parseInt($('#fakeCanvas').css('margin-left'),10));
		}
		if (parseInt($('#cursor').css('left')) > ($(window).width() - 10)){
			$('#cursor').css('left', ($(window).width() - 10));
		}
		$('#cursor').css('top',(yi-(fontSize*0.85))+(parseInt($('#fakeCanvas').css('margin-top'),10)));
		$('#cursor').css('height',fontSize);

		lines = tLines;
		//context.drawImage(canvasFake,0,0,canvasFake.width,canvasFake.height,0,0,canvas.width,canvas.height);


	}
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

  //canvas = $('#myCanvas')[0];
  canvasFake = $('#fakeCanvas')[0];
  ctxFake = canvasFake.getContext('2d');
  cBg = $('#myBackground')[0]
  dimCanvas = ($(window).width() > $(window).height())? $(window).width() : $(window).height();
  canvasFake.width = dimCanvas;
  canvasFake.height = dimCanvas;
  $('#fakeCanvas').css('margin-top', 0);
  $('#fakeCanvas').css('margin-left', 0);
  if ($(window).width() > $(window).height()){
  	$('#fakeCanvas').css('margin-top', ($(window).height()-$(window).width())/2);
  }else{
  	$('#fakeCanvas').css('margin-left', ($(window).width()-$(window).height())/2);
  }
  //context = canvas.getContext('2d');
  //ctxBg = cBg.getContext('2d');

  fontSize = Math.floor(canvasFake.width / 3);
  lineHeight = Math.floor(fontSize * 1.3);
  lines = 0;
  spChar = String.fromCharCode(181);
  ctxFake.textAlign = 'center';
  ctxFake.fillStyle = tColor;
  stopAnimation = false;

// CUSTOM URLS
	$.post("urls/redirect.php?url="+shortCode,{contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15"},
				  	function (obj) {
						if (obj != 'Invalid'){
							tObject = JSON.parse(obj);
							custom = tObject.text;
							bgColor = tObject.bgColor;
							tColor = tObject.tColor;
							fontSelected = tObject.fontSelected;
						}else{
							custom = 'Think LOUDER. '+String.fromCharCode(181)+ ' Type LOUDER. '+String.fromCharCode(181)+' (click/tap and start typing NOW)';
							bgColor = "#FAFAFA";
							tColor = "#63add0";
							fontSelected = 'Roboto';
							tObject.text = text;
							tObject.tColor = tColor;
							tObject.bgColor = bgColor;
							tObject.fontSelected = fontSelected;

						}
						  if(custom){
						  	text = '';
						  	iniAnimation(custom,0);
						  }else{
						  	$('#cursor').css('left',((canvasFake.width / 2)+$('#fakeCanvas').css('margin-left')));
							$('#cursor').css('top',(((canvasFake.height-fontSize)/ 2)+$('#fakeCanvas').css('margin-top')));
							$('#cursor').css('height',fontSize);
						  }

					}
          );



  $(window).resize(function(e){
	  	calculateDim();
	  	layoutThumbs();
	  	e.preventDefault();
	  	e.stopPropagation();


  });

  var focused = false;

  $('#ta').bind('keydown',function(event) {
  event.stopPropagation();
  focused = true;
  stopAnimation = true;
          var that = this;
          var e= event;
          setTimeout(function() {
			 //text+=String.fromCharCode(e.which);
			 text=$(that).val();
			 if (e.which == 8){
			   	if (text.substring(text.length-2,text.length) == (" "+spChar)){
			   		text=text.substring(0,text.length-2);
			   		//$(that).val(text);
			   		document.myform.ta.value = text;

			   	}

			}else if (e.which == 13){
				text=text.slice(0,text.length-1);
				text+=" "+spChar+" ";
				//$(that).val(text);
				document.myform.ta.value = text;


			}
			  if (text.length >= 100){
				text=text.slice(0,text.length-1);
				document.myform.ta.value = text;
				$('#alert_char').fadeIn();
				setTimeout(function(){
					$('#alert_char').hide();
				}, 2000);
			}


			calculateDim();
		},100);
  });



 // Animation to show initial text
 function iniAnimation(t,i){
 	if ((i < t.length) && !stopAnimation){
 		text+= t[i];
 		calculateDim();
 		setTimeout(function(){iniAnimation(t,i+1)},100);
 	}
}

 $('#ta').bind('click',function(){
  	/*if (focused && (canvas.width < 600)){
		$('#ta').trigger('blur');
		focused = false;

	}else{*/ //not focused
			$(this).css('height', 20);
			$(this).css('top', '50%');

	//}

 	closeMenu();
  });

  $('#ta').bind('blur',function(){
			$(this).css('height', '90%');
			$(this).css('top', 0);
    	focused = false;

  });


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


 function calculateDim(){
  			  //requestAnimationFrame(calculateDim);
			  //ctxFake.clearRect(0, 0, $(window).width(), $(window).height());
			  //canvas.width = $(window).width();
			  //canvas.height = $(window).height();
			  dimCanvas = ($(window).width() > $(window).height())? $(window).width() : $(window).height();

			  canvasFake.width = dimCanvas;
			  canvasFake.height = dimCanvas;

  $('#fakeCanvas').css('margin-top', 0);
  $('#fakeCanvas').css('margin-left', 0);
  if ($(window).width() > $(window).height()){
  	$('#fakeCanvas').css('margin-top', ($(window).height()-$(window).width())/2);
  }else{
  	$('#fakeCanvas').css('margin-left', ($(window).width()-$(window).height())/2);
  }

			  maxWidth = $(window).width() - 10;


  			  var dist = text.length;

  			  /*var ini = 0;
  			  var fin = 0;
  			  for (var i = 0;i<t.length;i++){
 			  	if (t[i] == spChar){
 					if((i - ini)> (fin - ini)){
 						dist =i- ini;
 						ini = fin;
 						fin = i;
 					}
 			  	}
 		  	  }*/

  			  var tSize = (canvasFake.width > canvasFake.height)? canvasFake.width : canvasFake.height;
  			  fontSize = (dist >15)? Math.floor(tSize / 15) : Math.floor(tSize / dist);
  			  fontSize = (dist < 3)? Math.floor(tSize / 3): fontSize;
  			  //fontSize = fontSize * (int(canvas.height)/int((lines+1)*lineHeight));

  			  // var multi = (canvas.width > canvas.height)? canvas.height/((lines+1)*200) : canvas.height/((lines+1)*75);


  			  //fontSize = (multi < 1)? fontSize*multi : fontSize;

  			  lineHeight = Math.floor(fontSize * 1.3);
  			  //cBg.width = canvasFake.width;
 			  	    //cBg.height = canvasFake.height;
 			  	    //ctxBg.fillStyle=bgColor;
 			  	    //ctxBg.clearRect(0,0,cBg.width,cBg.height);
 	    		//ctxBg.fillRect(0,0,cBg.width,cBg.height);
 	    		//context.clearRect(0,0,canvas.width,canvas.height);

 	  	updateText();
 }



// Google Fonts Management & Instacen Initialization
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

							if ($(this).attr('name') == '#tab2'){ // share tab
								$('#down_button').addClass('disabled');
								$('#down_button').html('wait...');
								shareURL();

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
			randomThumb();
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
			   						fontSelected = $(this).css('font-family');
			   						if($(this).attr('id')== 'random'){
										randomThumb();
									}


			   						calculateDim();
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


// RequestAnimationFrame Code

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// random Thumb
var fontArray = new Array('Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Roboto', 'Open Sans', 'Armata', 'Titan One', 'Courgette');
function randomThumb(){
	var randomIndex=Math.floor(Math.random()*fontArray.length);
	$('#random').css('font-family', fontArray[randomIndex]);
	$('#random').css('color', '#'+(Math.random()*0xFFFFFF<<0).toString(16));
	$('#random').css('background-color', '#'+(Math.random()*0xFFFFFF<<0).toString(16));
}

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



