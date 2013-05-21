//
// Elementos del DOM
//

var $e = {

    init: function()
    {
        this.category = {
            selector: $('#category select'),
            new: $('#category .new'),
            edit: $('#category .edit'),
            delete: $('#category .delete'),
            form: {
                root_node: $('#category-form'),
                img_form: $('#category-form form'),
                img: $('#category-form input[name=img]'),
                name: $('#category-form input[name=name]'),
                color: $('#category-form input[name=color]'),
                create: $('#category-form button[name=create]')
            }
        };

        this.label = {
            selector: $('#label select'),
            new: $('#label .new'),
            edit: $('#label .edit'),
            delete: $('#label .delete'),
            form: {
                root_node: $('#label-form'),
                img_form: $('#label-form form'),
                img: $('#label-form input[name=img]'),
                name: $('#label-form input[name=name]'),
                category: $('#label-form select'),
                create: $('#label-form button[name=create]')
            }
        };

        this.floor = {
            grid: $('#grid'),
            num_rows: $('#num_rows'),
            num_blocks: $('#num_blocks'),
            toggle_border: $('#toggle_border'),
            blocks: null,
            update: $('#update_floor'),
            clear: $('#clear_floor')
        };

        this.qr = {
            list: $('#qr_list ul'),
            toggle: $('#toggle_qrs')
        };
    }
};
