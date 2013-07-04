var panoIndex=0;
var panoDefaultImageName="night3.jpeg";
function addSamplePano(options)
{
    var panoId="pano"+panoIndex;

    if(jQuery('body').find('img[id*=pano]').length > 0)
        return;

    var optionStr;
    var src=panoDefaultImageName;
    if (arguments.length == 2)
    {
        src=arguments[0];
        options=arguments[1];
        optionStr=JSON.stringify(options);
    }
    else if (arguments.length == 3)
    {
        src=arguments[0];
        options=arguments[1];
        optionStr=arguments[2];
    }
    else
    {
        optionStr=JSON.stringify(options);
    }
    
    

//    document.write("<h2>"+ optionStr + "</h2>");
    jQuery('body').prepend('<img id="'+panoId+'" src="'+ src + '" alt="" />');


//        setTimeout(function(){
//            try{
//            jQuery('body').find('img[id*=pano]').ddpanorama(options);
//            }
//            catch(e){}
//        }, 5000);



    var i = 1;
    var listener = setInterval(function(){

        console.log('loop ' + i++);
        console.log(jQuery('body').find('img[id*=pano]').length);
        if(jQuery('body').find('img[id*=pano]').length > 0){


//            jQuery('body').find('img[id*=pano]').ddpanorama(options);
            try{
                jQuery('body').find('img[id*=pano]').ddpanorama(options);
            }
            catch(e){}

            ++panoIndex;
            var $width = $(window).width();

            jQuery('canvas').css({
                'position': 'absolute',
                'z-index': 99999,
                'top': 0,
                'margin': 8+'%',
                'width':$width * 0.84,
                'border-radius':'.5em',
                'border': '2px solid rgb(196, 190, 170)'
            });
            jQuery('body').prepend('<button id="close">X</button>');
            $('button#close').css({
                'position': 'absolute',
                'z-index': 100000,
                'top': 0,
                'margin': 6+'%',
                'font-size':'1.2em',
                'background-color':'#333',
                'color':'rgb(196, 190, 170)',
                'border-radius':'.5em',
                'border': '2px solid rgb(196, 190, 170)'

            })
                .on('click', function(){
                    jQuery('canvas').remove();
                    jQuery('body').find('img[id*=pano]').remove();
                    $(this).remove();
                })
            ;

            $(window).resize(function(){
                var $newWidth = $(this).width;
                $('canvas').css({
                    'width':$newWidth * 0.84

                });

            });

            clearInterval(listener);

            $('canvas').trigger('click');


            // What you want to do after it loads
        }
    },100);
}

function setDefaultImagePano(img)
{
    panoDefaultImageName=img;
}