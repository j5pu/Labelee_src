//
// Elementos del DOM
//

$e = {

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
                create: $('#category-form button[name=create]'),
                cancel: $('#category-form button[name=cancel]')
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
                create: $('#label-form button[name=create]'),
                cancel: $('#label-form button[name=cancel]')
            }
        };

        this.floor = {
            grid: $('#grid'),
            num_rows: $('#num_rows'),
            num_blocks: $('#num_blocks'),
            toggle_border: $('#toggle_border'),
            toggle_erase_mode: $('input[name=toggle_erase_mode]'),
            toggle_erase_mode_checked: $('input[name=toggle_erase_mode]:checked'),
            blocks: null,
            update: $('#update_floor'),
            clear: $('#clear_floor'),
            labeled_blocks: null,
            poi_menu: $('#poi_menu')
        };

        this.qr = {
            list: $('#qr_list ul'),
            toggle: $('#toggle_qrs')
        };

        this.point_count = {
            saved: $('#num_saved_points'),
            to_save: $('#num_points_to_save'),
            to_delete: $('#num_points_to_delete'),
            total: $('#num_total_points')
        }
    }
};
