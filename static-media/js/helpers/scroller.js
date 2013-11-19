/**
 * With this class we can set scrollable DOM elements for incompatible
 * mobile devices (i.e. Android <= 2.3).
 *
 * Dependencies:
 *      - jquery.js
 *      - jquery.hammer.js
 *
 * @param $wrapper  DOM element which has native scroll applied. (with CSS
 *                  property "overflow-y: hidden")
 *
 * Optionally it takes offsets to set upper and lower limits for
 * the content position:
 *      @param fixed_up
 *      @param fixed_down
 *
 * @constructor
 */
function Scroller($wrapper, fixed_up, fixed_down)
{
    this._scroll = function (ev) {
        ev.gesture.preventDefault();
        self.$content = $(ev.currentTarget).children();

        self.top_new = self.top + ev.gesture['deltaY'];
        
        self.$content.css({
            'top': parseInt(self.top_new) + 'px'
        });

        console.log(self.top_new);
    };

    this._scrollEnd = function (ev) {
        self.top_new = self.top + ev.gesture['deltaY'];

        if (self.top_new > self.fixed_up ||
            self.$content.height() < self.$wrapper.height())
        {
            self.top_new = self.fixed_up;
        }
        else if (Math.abs(self.top_new) >
            (self.$content.height() - self.$wrapper.height()))
        {
            self.top_new = (self.$wrapper.height() - self.$content.height())
                - self.fixed_down - parseInt(self.$content.css('margin-top'));
        }
        console.log(self.top_new);

        self.$content.css({
            'top': self.top_new + 'px'
        });

        self.top = self.top_new;
    };

    this._bindScroll = function () {
        self.$wrapper.hammer()
            .on('drag', function(ev){
                if(ev.gesture) self._scroll(ev);
            })
            .on('dragend', function(ev){
                if(ev.gesture) self._scrollEnd(ev);
            });
    };

    var self = this;

    this.$wrapper = $wrapper;
    this.$content = $wrapper.children(); // <div> element within the $wrapper

    this.fixed_up = fixed_up || 0;
    this.fixed_down = fixed_down || 0;

    this.$wrapper.css({
        'overflow-y': 'hidden'
    });
    this.$content.css({
        'position': 'relative',
        'top': self.fixed_up + 'px'
    });
    this.top = this.$content.position().top;

    this._bindScroll();
}