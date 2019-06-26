const BaseClef = 'base';
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

function teorian_note_to_vexflow_note(note_str) {
    // console.log(note_str);
    result = note_str.substring(0, note_str.length-1);
    result += '/';
    result += note_str[note_str.length-1];

    return result;
}

function random_clef() {
    result = Math.floor(Math.random() * 2); // 0 or 1, 0 denotes Base Clef

    return (result) ? TrebleClef : BaseClef;
}

function random_major_minor(nMajor, nminor) {
    total = nMajor + nminor;
    pick = Array(total);
    for (i = 0; i < total; i++) {
        pick[i] = (i < nMajor) ? Major : Minor;
    }
    result = shuffle(pick);
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