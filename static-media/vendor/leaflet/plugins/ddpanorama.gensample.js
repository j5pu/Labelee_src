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


            jQuery('#canvasPan').css({
                'position': 'absolute',
                'z-index': 9,
                'top': '5px',
//                'left':newWidth *0.049 +'px',
                'left': '2%',
                'border-radius':'1.2em',
                'margin': '0 auto',
                'overflow': 'hidden',
                'padding': '3%',
                'background-color': 'black',
                'border': '2px solid rgba(255, 255, 255, 0.9)'
            });
            jQuery('div#page').prepend('<button id="close">x</button>');
            $('button#close').css({
                'position': 'absolute',
                'z-index': 100000,
                'top': '-1.8rem',
                'right':'-1.7rem',
                'margin': 5+'%',
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

    });
}




function setDefaultImagePano(img)
{
    panoDefaultImageName=img;
}