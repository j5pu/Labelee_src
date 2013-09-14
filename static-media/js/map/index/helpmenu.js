var HelpMenu = {
    _updateButtons: function()
    {
        if(this.$disclaimer_page.hasClass('current'))
        {
            this.$buttons.removeClass('zero');
            this.$close_disclaimer_button.show();
            this.$next_button.hide();
            this.$open_disclaimer_button.hide();
        }
        else
        {
            if(this.current_entry_index == 0)
            {
                this.$buttons.addClass('zero')
                this.$prev_button.hide();
                this.$next_button.show();
                this.$finish_button.hide();
                this.$open_disclaimer_button.show();
                this.$close_disclaimer_button.hide();
            }
            else if(this.current_entry_index >= this.$entry_list.length-1)
            {
                this.$prev_button.show();
                this.$next_button.hide();
                this.$finish_button.show();
                this.$open_disclaimer_button.hide();
            }
            else
            {
                this.$buttons.removeClass('zero');
                this.$prev_button.show();
                this.$next_button.show();
                this.$finish_button.hide();
                this.$open_disclaimer_button.hide();
            }
        }

        this.$e.find('.entry .first .content').css({
            'top': 0
        });

        this.$e.find('.entry:not(.first) .content').css('top', '10%');

//        Logger.log($(window).width() + 'x' + $(window).height())
//        Logger.log(screen.width + 'x' + screen.height)
    },

    _showPrevEntry: function()
    {
        if(this.current_entry_index > 0)
        {
            this.$entry_list.eq(this.current_entry_index).removeClass('current');
            this.$entry_list.eq(--this.current_entry_index).addClass('current');
            this._updateButtons();
        }
    },

    _showNextEntry: function()
    {
        if(this.current_entry_index < this.$entry_list.length)
        {
            this.$entry_list.eq(this.current_entry_index).removeClass('current');
            this.$entry_list.eq(++this.current_entry_index).addClass('current');
            this._updateButtons();
        }
    },

    _openDisclaimer: function()
    {
        this.$entry_list.eq(this.current_entry_index).removeClass('current');
        this.$disclaimer_page.addClass('current');
        this._updateButtons();
    },

    _closeDisclaimer: function()
    {
        this.$disclaimer_page.removeClass('current');
        this.current_entry_index = 0;
        this.$entry_list.eq(this.current_entry_index).addClass('current');
        this._updateButtons();
    },

    _close: function()
    {
        this.$e.fadeOut(300);
        setTimeout(function(){
            if(HelpMenu.$disclaimer_page.hasClass('current'))
                HelpMenu.$disclaimer_page.removeClass('current');
            else
                HelpMenu.$entry_list.eq(HelpMenu.current_entry_index).removeClass('current');
            HelpMenu.$entry_list.eq(0).addClass('current');
//            HelpMenu.$e.find('*').off();
        },400);
    },

    _mapElements: function()
    {
        this.$e = $('#help_menu');
        this.$e.css({
            width: $(window).width(),
            height: $(window).height()
        });
        this.$buttons = this.$e.find('.button_wrapper');
        this.$prev_button = this.$e.find('.prev');
        this.$next_button = this.$e.find('.next');
        this.$finish_button = this.$e.find('.finish');
        this.$exit_button = this.$e.find('.exit');
        this.$open_disclaimer_button = this.$e.find('.open_disclaimer');
        this.$close_disclaimer_button = this.$e.find('.close_disclaimer');
        this.$disclaimer_page = this.$e.find('.entry.disclaimer');
        this.$entry_list = this.$e.find('.entry:not(.disclaimer)');
    },

    _bindEvents: function()
    {
        this.$prev_button.on('click', function(){
            HelpMenu._showPrevEntry();
        });

        this.$next_button.on('click', function(e){
            HelpMenu._showNextEntry();
        });

        this.$finish_button.on('click', function(e){
            HelpMenu._close();
        });

        this.$exit_button.on('click', function(e){
            HelpMenu._close();
        });

        this.$open_disclaimer_button.on('click', function(e){
            HelpMenu._openDisclaimer();
        });

        this.$close_disclaimer_button.on('click', function(e){
            HelpMenu._closeDisclaimer();
        });
    },

    init: function()
    {
        this._mapElements();
        this.current_entry_index = 0;
        this._updateButtons();
        this._bindEvents();

//        if(androidversion <= 2.3)
//        {
//            this.each(function(){
//                new Scroller(
//                    this.$e.find('.entry.first'),
//                    this.$e.find('.entry .content')
//                );
//                new Scroller(
//                    this.$e.find('.entry:not(.first)'),
//                    this.$e.find('.entry:not(.first) .content'),
//                    50,
//                    50
//                );
//            });

//        }
    },

    resize: function()
    {
        if(this.$e)
        {
            this.$e.css({
                width: $(window).width(),
                height: $(window).height()
            });
        }
    },

    show: function()
    {
        this.$e.show(200);
    },

    showDisclaimer: function()
    {
        this.show();
        this._openDisclaimer();
    }
};