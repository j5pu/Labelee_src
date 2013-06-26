var Coupon = {
    init: function()
    {
//        Hammer(document.body, { prevent_default: true });


        $('body').append('' +
            '<div id="coupon">' +
                '<div class="sheet s1"></div>' +
                '<div class="sheet s2"></div>' +
            '</div>'
        );
        this.$el = $('#coupon');
        this.top = parseInt(this.$el.css('margin-top'));

        this.dragEvent();
    },

    drag: function(ev)
    {
        var self = Coupon;

        self.top_new = self.top + ev.gesture['deltaY'];

        // margin en %, top en px
        var limit_margin_top = 0.3;
        var limit_margin_bottom = 0.92;
        var current_margin_top = self.top_new / $(window).height(); // ~0.8

        if(current_margin_top < limit_margin_top)
        {
            self.top_new = $(window).height() * limit_margin_top;
            return;
        }
        else if(current_margin_top > limit_margin_bottom)
        {
            self.top_new = $(window).height() * limit_margin_bottom;
            return;
        }

        console.log(self.top_new);

        self.$el.css({
            'margin-top': self.top_new + 'px'
        });
    },

    dragEnd: function(ev)
    {
        var self = Coupon;

//        ev.preventDefault();

        console.log(self.top_new);

//        if(self.top_new > 0 || self.$listMenu.height() < self.$wrapper.height())
//            self.top_new = 0;
//        else if(Math.abs(self.top_new) > self.$listMenu.height() - self.$wrapper.height())
//            self.top_new = $('nav').height() - self.$listMenu.height();


        // map.css({
        // 	'transition': 'top 1s linear 2s, left 1s linear 2s'
        // });

//        self.$el.css({
//            'margin-top': self.top_new + 'px'
//        });

        self.top = self.top_new;
    },

    dragEvent: function()
    {
        var self = this;

        self.$el.hammer({ prevent_default: true })
            .bind('drag', self.drag)
            .bind('dragend', self.dragEnd)
    }

};