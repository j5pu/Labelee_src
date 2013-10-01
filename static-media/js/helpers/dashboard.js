var DisplayedRoutes = {

    baseUrl: '/dashboard/',
    createDisplayedRoute: function (origin, destination) {
        var data = {originpoi: origin, destinationpoi: destination };
        $.ajax({
            url: DisplayedRoutes.baseUrl + 'Services/CreateDisplayedRoute',
            type: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data),
            dataType: 'json', // esto indica que la respuesta vendrá en formato json
            async: true,
            success: function (response) {


            },
            error: function (response) {

                console.log(response)
            }

        });
    }



};
