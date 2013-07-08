

$(document).ready(function() {

	if (Modernizr.touch) {
       

			/* ok we have a touch device so we will grab the touch events now */
			$(".navi").click(function() {
				/* for the first ul which is our list of other items display it */
				$(".n1").show();
                $(".n2").show();
                $(".n3").show();
                $(".n4").show();
                //$(".n6").hide();
			});

			/* if the user touches the content of the page then hide all the nav items */
			$("#content").click(function() {
				$(".n1").hide();
                $(".n2").hide();
                $(".n3").hide();
                $(".n4").hide();
                //$(".n6").show();
            })
	}

});