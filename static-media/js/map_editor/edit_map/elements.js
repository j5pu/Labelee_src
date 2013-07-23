//
// Elementos del DOM
//

$e = {

    init: function()
    {
        this.label_category_selector = $('#category select');

        this.label = {
            selector: $('#label select'),
            manage: {
                root_node: $('#label #manage'),
                new: $('#label #manage .new'),
                edit: $('#label #manage .edit'),
                delete: $('#label #manage .delete')
            },
            form: {
                root_node: $('#label-forms'),
                new_node: $('#label-forms .new'),
                edit_node: $('#label-forms .edit'),
                name: $('#label-forms input[name=name]'),
                category: $('#label-forms select'),
                msg: $('#label-forms .msg'),
                create: $('#label-forms button[name=create]'),
                update: $('#label-forms button[name=update]'),
                cancel: $('#label-forms button[name=cancel]')
            }
        };

        this.floor = {
            grid: $('#grid'),
            num_rows: $('#num_rows input[type=text]'),
            num_blocks: $('#num_blocks'),
            toggle_border: $('#toggle_border'),
            toggle_erase_mode: $('input[name=toggle_erase_mode]'),
            toggle_erase_mode_checked: $('input[name=toggle_erase_mode]:checked'),
            blocks: null,
            update: $('#update_floor'),
            change_num_rows: $('#change_num_rows'),
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
