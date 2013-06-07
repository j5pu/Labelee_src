
$(function(){

    // Cargamos todas las imágenes

    $("#loadingScreen").dialog({
        autoOpen: false,    // set this to false so we can manually open it
        dialogClass: "loadingScreenWindow",
        closeOnEscape: false,
        draggable: false,
        width: 460,
        minHeight: 50,
        modal: true,
        buttons: {},
        resizable: false,
        open: function() {
            // scrollbar fix for IE
            $('body').css('overflow','hidden');
        },
        close: function() {
            // reset overflow
            $('body').css('overflow','auto');
        }
    }); // end of dialog

    // mapeamos lo que nos interesa del DOM

    waitingDialog('Cargando grid para la planta..');

    setTimeout(function(){
        $e.init();

        //cargamos la planta
        Floor.init();
    }, 200);



});


function waitingDialog(msg) { // I choose to allow my loading screen dialog to be customizable, you don't have to
    $("#loadingScreen").html(msg);
    $("#loadingScreen").dialog('open');
}
function closeWaitingDialog() {
    $("#loadingScreen").dialog('close');
}