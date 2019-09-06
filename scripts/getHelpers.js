function load_get() { //originally from https:///stackoverflow.com/a/12049737 - this version from: https://github.com/mshafer1/AHK-generator/blob/eafa2b8a2534f339e884775e131716f799f90075/scripts/keygen.js
    var GET = {}
    if (document.location.toString().indexOf('?') !== -1) {
        var query = document.location
            .toString()
            // get the query string
            .replace(/^.*?\?/, '')
            // and remove any existing hash string (thanks, @vrijdenker)
            .replace(/#.*$/, '')
            .replace(new RegExp(escapeRegExp('+'), 'g'), ' ')
            .split('&');

        for (var i = 0, l = query.length; i < l; i++) {
            aux = decodeURIComponent(query[i])
            //console.log(aux)
            key = aux.match(/([\d\D]+?\=)/)[0].replace('=', '');
            //console.log(key)
            value = aux.replace(key + "=", "")
            value = load_value(value);

            //console.log(value)
            if (key in GET) {
                if (GET[key].constructor === Array) {
                    GET[key].push(value)
                } else {
                    GET[key] = [GET[key], value]
                }
            } else {
                if (key.includes('[]')) {
                    //console.log("Array detected")
                    GET[key] = [];
                    GET[key].push(value)
                } else {
                    GET[key] = value;
                }
                //console.log(key + ":" + GET[key])
                //console.log();
            }
        }
    }
    return GET
}

function load_value(raw) {
    result = Number(raw);
    if (typeof(result) != 'number' || isNaN(result) || ('' + raw).trim().length == 0) {
        return raw;
    }
    else {
        return result;
    }
}


function escapeRegExp(str) { // from https://stackoverflow.com/a/1144788/8100990
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
