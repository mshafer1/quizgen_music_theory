---
---
const SAVE_DIALOGUE_ID = 'saveDialog'

var saved_quizes = []
function update_saved_quizes() {
    saved_quizes = []; // flush the variable
    for (var path in window.localStorage) {
        if (!(path.startsWith(target_path))) {
            continue;
        }

        name = path.substring(target_path.length);
        value = localStorage.getItem(path)
        // console.log("Found one: ", name, "--", value);
        saved_quizes[name] = value;
    }

    $('#previousQuizList').html(''); // flush the dialogue
    for (var quizName in saved_quizes) {

        {% capture row_template %}
        <div class="w3-row">
            <div class="w3-col s12">
                <input type="radio" value="${ quizName }" class="js_save_option" id="_rb_${quizName}" style="display: none;" onclick="set_selection(this)" />
                <label for="_rb_${quizName}"><div class="selectable">${quizName}</div></label>
            </div>
        </div>
        {% endcapture %}

        new_row = `
            {{ row_template }}
            `
        $('#previousQuizList').append(new_row);
    }
}

function clear_selection(caller = null) {
    $('.js_save_option').each(function () {
        $(this).attr('checked', false);
    })
    $('.js_new_name').each(function () {
        $(this).css('background', 'transparent');
    })

    $('#save_footer').hide();

    if(caller != null)
    {
        set_selection(caller); // handle case where it has data
    }
}

function get_saved_items_for_quiz_type(quizType) {
    var path = `${quizType}/`;
    storage = window.localStorage;
    console.log("storage", storage);

    for (var key in storage) {
        if (key.startsWith(path)) {
            console.log(`{Key: ${key}, Value: ${storage[key]}}`);
        }
    }
}

function set_selection(target) {
    var value = target.value;
    console.log('Value: ', value);

    $('.js_new_name').each(function () {
        $(this).css('background', 'transparent');
    })

    var parent_div = target.closest('.js_save_option');

    footer = $('#save_footer');

    if (value.length == 0) {
        footer.hide();
        return;
    }

    if ($(parent_div).hasClass('js_new_name')) {
        console.log("parent is new name");

        parent_div.style.background = "darkgray";
    }

    footer.html(`
    <div class="w3-row">
        <div class="w3-col s1">Save As: </div>
        <div class="w3-col s10">${value}</div>
        <div class="w3-col s1"><button class="w3-btn w3-black" onclick="_save_data('${value}')">Save</button></div>
    </div>
    <div class="w3-row js-error" style="display: none;">
        Error: Could not save quiz. Verify that QuizGen.MusicTheoryPractice.net is allowed to store local storage in your browser.
        <ul>
            <li>Firefox: <a href="https://support.mozilla.org/en-US/kb/storage" target="_blank">Docs</a></li>
            <li>Chrome: <a href="https://techglimpse.com/enable-localstorage-support-google-chrome-browser/" target="_blank">TechGlimpse Article</a></li>
            <li>Other browsers: <a href="https://www.google.com/search?q=how+to+enable+local+storage+in+my+browser" target="_blank">Google it </a></li>
        </ul>
    </div>
    `);

    footer.show();
}

function _show_save_dialogue() {
    $('#' + SAVE_DIALOGUE_ID).show();
    console.log("Save called");
}

function _close_save_dialogue() {
    $('#' + SAVE_DIALOGUE_ID).hide(0, function () {
        update_saved_quizes();
        $('#_new_name_input').val('');
        clear_selection();
    });
}

function _save_data(name) {
    var _key_holder = $('#qType').val();
    var target_path = 'quizes/' + _key_holder + '/' + name;

    var form = $('#_input_form')[0];

    if (typeof pre_submit === "function") {
        pre_submit();
    }

    // from https://stackoverflow.com/a/48950600
    queryString = new URLSearchParams(new FormData(form)).toString();
    // console.log("queryString", queryString);
    try
    {
        localStorage.setItem(target_path, queryString);
        _close_save_dialogue();
    }
    catch (e)
    {
        if(e instanceof DOMException)
        {
            $('.js-error').show();
        }
        throw(e);
    }
}

save = _show_save_dialogue;
