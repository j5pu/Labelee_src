
$(function(){

    // Cargamos todas las imágenes

    WaitingDialog.init();

    setTimeout(function(){
        // mapeamos lo que nos interesa del DOM
        $e.init();

        //cargamos la planta
        Floor.init();
    }, 200);



});