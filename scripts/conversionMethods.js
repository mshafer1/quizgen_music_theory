const BassClef = 'bass';
const AltoClef = 'alto';
const TrebleClef = 'treble';
const Major = 'Major';
const Minor = 'Minor';


class Key {
    constructor(letter, octave, accidental) {
        this.letter = letter;
        this.octave = octave;
        this.accidental = accidental;
    }
}

class Note {
    constructor(keys, accidentals) {
        this.keys = keys;
        this.accidentals = accidentals;
    }
}

class Accidental {
    constructor(index, value) {
        this.index = index;
        this.value = value;
    }
}

class Interval {
    constructor(starting_note, interval) {
        this.starting_note = starting_note;
        this.interval = interval;
    }
}

function note_to_key(note) {
    var letter = note[0];
    var accidental = '';
    var number = 0;
    if (letter.length == 2) {
        number = Number(note[1]);
    } else {
        accidental = note[1];
        number = Number(note[2]);
    }

    return new Key(letter, number, accidental);
}


function teorian_note_to_vexflow_note(note_str) {
    // console.log(note_str);
    var result = note_str.substring(0, note_str.length - 1);
    result += '/';
    result += note_str[note_str.length - 1];

    return result;
}

function teorian_note_to_key(note_str) {
    var letter = note_str[0];
    var octave = Number(note_str[note_str.length - 1])
    var accidental = ''
    if (note_str.length == 3) {
        accidental = note_str[1];
    }
    return new Key(letter, octave, accidental);
}

function keys_to_note(keys) {
    var result = new Note(Array(), Array());
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        result.keys.push(key.letter + '/' + key.octave);
        if (key.accidental != '') {
            result.accidentals.push(new Accidental(i, key.accidental));
        }
    }
    return result;
}

function random_clef() {
    var result = Math.floor(Math.random() * 2); // 0 or 1, 0 denotes Bass Clef

    return (result) ? TrebleClef : BassClef;
}

function shuffled_clefs(n) {
    var result = Array(n);
    for(var i = 0; i < n; i++) {
        result[i] = ((i+1) % 2)? TrebleClef : BassClef;
    }
    return result;
}

function random_major_minor(nMajor, nminor) {
    var total = nMajor + nminor;
    var pick = Array(total);
    for (var i = 0; i < total; i++) {
        pick[i] = (i < nMajor) ? Major : Minor;
    }
    var result = shuffle(pick);
    return result;
}

/* REGION: helpers */

// originally from https://stackoverflow.com/a/2450976
function shuffle(array) {
    var result = array.slice();
    var currentIndex = result.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = result[currentIndex];
        result[currentIndex] = result[randomIndex];
        result[randomIndex] = temporaryValue;
    }

    return result;
}

function shuffled_slice(n, notes) {
    var result = shuffle(notes);

    
    if (n < notes.length) {
        result = result.slice(0, n);
    }
    else if (n == notes.length) {
        // NOOP
    }
    else { // n > notes.length
        if (notes.length == 0) {
            return [] // physically impossible to provide n elements . . .
        }

        var multiplier = n / notes.length;
        var multiplier_whole = Math.floor(multiplier);
        var multiplier_remainder = n - (notes.length * multiplier_whole);

        for (var i = 1; i < multiplier_whole; i++) {
            result = result.concat(shuffle(notes));
        }

        result = result.concat(shuffle(notes).slice(0, multiplier_remainder));
    }

    return result;
}

function shuffled_intervals(n, starting_notes, intervals) {
    var notes = shuffled_slice(n, starting_notes);
    var spaced_intervals = shuffled_slice(n, intervals);
    var result = []
    for(var i = 0; i < notes.length; i++) {
        var note = notes[i];
        var interval = spaced_intervals[i];
        result.push(new Interval(note, interval));
    }
    return result;
}

function shuffled_interval_slices(n, starting_notes, intervals) {
    var intervals = shuffled_intervals(n, starting_notes, intervals);
    var result = slice_array(6, intervals);
    return result;
}

function slice_array(n, array) {
    var size = array.length;
    var result = [];
    for(var i = 0; i < Math.ceil(size / n); i++) {
        var slice = [];
        for(var j = 0; j < n && i*n + j < array.length; j++) {
            var part = array[i*n + j];
            slice.push(part);
        }
        result.push(slice);
    }
    return result;
}