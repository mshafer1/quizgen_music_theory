
var GET_data = load_get();

console.log("GET Data: ", GET_data);

function simple_handle() {
    for(var key in GET_data) {
        console.log("Key-val: ", key, GET_data[key]);

        if (key.indexOf('[]') != -1) {
            var values = GET_data[key];
            values.forEach(function (value) {
                var checkbox = $(`#${key.substring(0, key.length-2)}_${value}`);
                if(!(checkbox.length)) {
                    checkbox = $(`input[name='${key}'][value='${value}']`)
                }
                console.log("Key: ", key, "\n\tValue: ", value);
                console.log("CheckBox: ", checkbox);
                checkbox.prop("checked", true);
            })
            continue;
        }

        $(`[name="${key}"]`).val(GET_data[key])
    }
}

function handle_multi_row_insertion() {
    if(!('indexes' in GET_data)) {
        return;
    }

    var indexes = GET_data['indexes'];

    if(indexes.constructor === Array) {
        indexes = indexes.split(',').map(value => load_value(value));
    } else {
        // must be single number
        indexes = [indexes];
    }


    
    console.log("Indexes: ");
    console.log(indexes);

    indexes.forEach(function (value) {
        index = value;
        add_row();
    })
}

function load() {
    handle_multi_row_insertion();
    simple_handle();

    if(typeof index !== 'undefined' &&  index == 0 && typeof add_row !== 'undefined'){
      // only add a default row if one not already added.
      add_row();
    }
}