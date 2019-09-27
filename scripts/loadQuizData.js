
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

function load() {
    simple_handle();
}