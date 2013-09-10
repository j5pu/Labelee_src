var panoIndex=0;
var panoDefaultImageName="night3.jpeg";
function addSamplePano(options)
{
    ddpanoramas.timerId = window.setInterval(function() {
        for ( var i = 0; i < ddpanoramas.animations.length; ++i) {
            ddpanoramas.animations[i].update();
        }
    }, 1000 / 30);

    var panoId="pano"+panoIndex;

    if(jQuery('div#page').find('img[id*=pano]').length > 0)
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
    jQuery('div#page').prepend('<img id="'+panoId+'" src="'+ src + '" alt="" />');

    jQuery('div#page').find('img[id*=pano]').on('load', function(){
        try{
            jQuery('div#page').find('img[id*=pano]').ddpanorama(options);
        }
        catch(e){
            console.log(e);
        }
        finally
        {
            ++panoIndex;
            var newWidth = window.innerWidth;


            jQuery('canvas').css({
                'position': 'absolute',
                'z-index': 9,
                'top': '5px',
                'left':newWidth *0.049 +'px',
//            'box-sizing':'content-box',
//            'margin':'0px, ' +(newWidth *0.049) +'px, 0px, ' +(newWidth *0.049) +'px',
//            'width':$width * 0.74,
                'border-radius':'.5em',
                'border': '2px solid rgba(255, 255, 255, 0.9)'
            });
            jQuery('div#page').prepend('<button id="close">x</button>');
            $('button#close').css({
                'position': 'absolute',
                'z-index': 100000,
                'top': '-2rem',
                'right':'-0.3rem',
                'margin': 6+'%',
                'font-size':'1.4em',
                'color':'rgba(255, 255, 255, 0.9)',
                'text-shadow': '2px 2px 2px #555'
            })
                .on('click', function(){
                    try{
                        Panorama.close();
                    }catch(e){}

                })
            ;

            Panorama.opened = true;
        }

//        $('canvas').trigger('click tap touch swipe drag');
    });
}




function setDefaultImagePano(img)
{
    panoDefaultImageName=img;
}