const BassClef = 'bass';
const AltoClef = 'alto';
const TrebleClef = 'treble';

const ClefAuto = 'auto';

const Major = 'Major';
const Minor = 'Minor';
const NaturalMinor = 'Natural Minor'
const HarmonicMinor = 'Harmonic Minor';
const MelodicMinor = 'Melodic Minor';


try
{
    teoria = require('./teoria/teoria.js');
} catch (error) {
    // pass
}

const max_bass_note = new teoria.note('e4').key();
const min_treble_Note = new teoria.note('a3').key();
const middle_c_note = new teoria.note('c4').key();

class Key {
    constructor(letter, octave, accidental) {
        this.letter = letter;
        this.octave = octave;
        this.accidental = accidental;
    }

    toString(){
        return `{${this.letter}${this.octave}${this.accidental}}`;
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

class IntervalInfo {
    constructor(starting_note, interval, clef) {
        this.starting_note = starting_note;
        this.interval = interval;
        this.clef = clef;
    }
}

function teorian_note_to_vexflow_note(note_str) {
    // console.log(note_str);
    var result = note_str.substring(0, note_str.length - 1);
    result += '/';
    result += note_str[note_str.length - 1];

    return result;
}

function teorian_note_to_key(note_str, keep_accidentals = true) {
    var letter = note_str[0];
    var octave = Number(note_str[note_str.length - 1])
    var accidental = ''
    if (note_str.length == 3 && keep_accidentals) {
        accidental = note_str[1];
    } else if (note_str.length == 4 && keep_accidentals) {
        accidental = note_str.substring(1, 3);
    }
    return new Key(letter, octave, accidental);
}

function keys_to_note(keys, keep_accidentals = true) {
    var result = new Note(Array(), Array());
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        result.keys.push(key.letter + '/' + key.octave);
        if (key.accidental != '' && keep_accidentals) {
            var accidental = key.accidental;
            if (accidental == 'x') { // teoria uses x, VexFlow uses ##
                accidental = '##'
            }
            result.accidentals.push(new Accidental(i, accidental));
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
    for (var i = 0; i < n; i++) {
        result[i] = ((i + 1) % 2) ? TrebleClef : BassClef;
    }
    return result;
}

function random_major_minor(nMajor, nminor, nhminor, nmminor) {
    var total = nMajor + nminor + nhminor + nmminor;
    var pick = Array(total);
    for (var i = 0; i < total; i++) {
        if (i < nMajor) {
            pick[i] = Major;
        }
        else if (i < nMajor + nminor) {
            pick[i] = NaturalMinor;
        }
        else if (i < nMajor + nminor + nhminor) {
            pick[i] = HarmonicMinor;
        }
        else {
            pick[i] = MelodicMinor;
        }
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
    for (var i = 0; i < notes.length; i++) {
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
    for (var i = 0; i < Math.ceil(size / n); i++) {
        var slice = [];
        for (var j = 0; j < n && i * n + j < array.length; j++) {
            var part = array[i * n + j];
            slice.push(part);
        }
        result.push(slice);
    }
    return result;
}

function _coerce_clef_helper(_notes) {
    console.debug("Notes: ", _notes);
    if (_notes.length == 1) {
        var note = _notes[0]
        var _note_teorian_style = note.letter + note.octave;
        console.log("Note: ", _note_teorian_style);
        var teorian_note = new teoria.note(_note_teorian_style);
        console.log("Key: ", teorian_note);
        var key = teorian_note.key();

        console.log("Key: ", key, " VS C4", middle_c_note);

        if (key > middle_c_note) {
            return TrebleClef;
        } else if(key < middle_c_note) {
            return BassClef;
        } else {
            return 'coin_toss';
        }
    }

    console.debug('Notes: ', _notes);
    var low_note = _notes[0];
    var low_teoria = new teoria.note(low_note.letter + low_note.octave);
    var high_note = _notes[_notes.length - 1];
    var high_teoria = new teoria.note(high_note.letter + high_note.octave);
    console.debug('Low note: ', low_note, '\n', low_teoria, '\n\tN: ', low_teoria.key());
    console.debug('High note: ', high_note, '\n', high_teoria, '\n\tN: ', high_teoria.key());

    var can_be_treble = low_teoria.key() >= min_treble_Note;
    var can_be_bass = high_teoria.key() <= max_bass_note;

    // toss a coin
    var coin_toss = can_be_bass && can_be_treble;
    console.debug('can_be_bass: ', can_be_bass, '\n\tcan_be_treble: ', can_be_treble, '\n\tis_coin_toss: ', coin_toss, '\n\tLow note: ', low_note, '\n\n');

    var new_note_clef = '';
    if (coin_toss) {
        new_note_clef = 'coin_toss'
    }
    else if (can_be_treble) {
        new_note_clef = TrebleClef;
    }
    else if (can_be_bass) {
        new_note_clef = BassClef;
    }
    else {
        console.warn('Not sure what to do with', _notes, ' - defaulting to shorter distance from last line on staff');

        var bottom_of_treble = new teoria.note('e4');
        var top_of_bass = new teoria.note('a3');

        var down_interval = new teoria.interval(bottom_of_treble, low_teoria);
        var up_interval = new teoria.interval(top_of_bass, high_teoria);

        var down_distance = (down_interval.direction() == 'down')?-down_interval.value():0;
        var up_distance = (up_interval.direction() == 'up')?up_interval.value():0;
        console.debug("Up: ", up_interval, " - ", up_distance);
        console.debug("Down: ", down_interval, " - ", down_distance);

        if(down_distance > up_distance) {
            new_note_clef = BassClef;
        } else if(down_distance < up_distance) {
            new_note_clef = TrebleClef;
        } else {
            new_note_clef = 'coin_toss';
        }
    }
    return new_note_clef;
}

function coerce_clef(_notes, _default) {
    var result = _coerce_clef_helper(_notes);
    if(result == 'coin_toss') {
       result = _default;
    }
    return result
}


try {
    var exports = module.exports = {};
    // from https://stackoverflow.com/a/11279639

    exports.Key = Key;
    exports.slice_array = slice_array;
    exports.shuffled_interval_slices = shuffled_interval_slices;
    exports.shuffled_intervals = shuffled_intervals;
    exports.shuffled_slice = shuffled_slice;
    exports.shuffle = shuffle;
    exports.random_major_minor = random_major_minor;
    exports.shuffled_clefs = shuffled_clefs;
    exports.random_clef = random_clef;
    exports.keys_to_note = keys_to_note;
    exports.teorian_note_to_key = teorian_note_to_key;
    exports.teorian_note_to_vexflow_note = teorian_note_to_vexflow_note;
    exports._coerce_clef_helper = _coerce_clef_helper;
    exports.coerce_clef = coerce_clef;
} catch (error) {
    // pass
}