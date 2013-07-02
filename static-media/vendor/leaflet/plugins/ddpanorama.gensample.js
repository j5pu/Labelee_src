var panoIndex=0;
var panoDefaultImageName="night3.jpeg";
function addSamplePano(options)
{
    var panoId="pano"+panoIndex;

    if(jQuery('body').find('img#'+panoId).length > 0)
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

    var listener = setInterval(function(){
        if(jQuery('body').find('img#'+panoId).length > 0){
            jQuery("#"+panoId).ddpanorama(options);
            ++panoIndex;

            jQuery('canvas').css({
                'position': 'absolute',
                'z-index': 99999,
                'top': 17+'%',
                'margin': 15+'%'
            });
            clearInterval(listener)
            // What you want to do after it loads
        }
    },100);
}

function setDefaultImagePano(img)
{
    panoDefaultImageName=img;
}