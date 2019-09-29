const SAVE_DIALOGUE_ID = 'saveDialog'

function clear_selection(caller) {
    $('.js_save_option').each(function () {
        $(this).attr('checked', false);
    })

    $('.js_new_name').each(function () {
        $(this).css.background="none";
    })

    $('#save_footer').hide();

    set_selection(caller); // handle case where it has data
}

function get_saved_items_for_quiz_type(quizType) {
    var path = `${quizType}/`;
    storage = window.localStorage;
    console.log("storage", storage);

    for(var key in storage) {
        if(key.startsWith(path)) {
            console.log(`{Key: ${key}, Value: ${storage[key]}}`);
        }
    }    
}

function set_selection(target) {
    var value = target.value;
    console.log('Value: ', value);

    if(value.length == 0) {
        return;
    }

    $('.js_new_name').each(function () {
        console.log("Clearing: ", $(this));
        $(this).css('background', 'transparent');
    })

    var parent_div = target.closest('.js_save_option');

    parent_div.style.background="darkgray";

    footer = $('#save_footer');

    footer.html(`
    <div class="w3-row">
        <div class="w3-col s1">Save As: </div>
        <div class="w3-col s10">${value}</div>
        <div class="w3-col s1"><button class="w3-btn w3-black" onclick="_save_data('${value}')">Save</button></div>
    </div>
    `);

    footer.show();

}

function _show_save_dialogue() {
    $('#' + SAVE_DIALOGUE_ID).show();
    console.log("Save called");
}

function _close_save_dialogue() {
    $('#' + SAVE_DIALOGUE_ID).hide();
}

function _save_data(name) {
    var _key_holder = $('#qType').val();
    var target_path = 'quizes/' + _key_holder + '/' + name;

    var form = $('#_input_form')[0];

    if(pre_submit.prototype !== undefined) {
        pre_submit();
    }

    // from https://stackoverflow.com/a/48950600
    queryString = new URLSearchParams(new FormData(form)).toString();
    // console.log("queryString", queryString);
    localStorage.setItem(target_path, queryString);

    _close_save_dialogue();
}

save = _show_save_dialogue;
