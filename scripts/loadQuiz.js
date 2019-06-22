$(window).load(init);

const qType = 'qType';
const intervaltype = 'interval';
const scaleRaw = 'ScaleLable';
const mScalesKey = 'mScales';
const MScalesKey = 'MScales';
const BaseClef = 'base';
const TrebleClef = 'treble';
const QuizID = 'ID';
const Major = 'Major';
const Minor = 'Minor';

title = '';
prompt = '';

function init() {
    get_data = load_get();

    if (!(qType in get_data)) {
        alert("Invalid request for quiz!");
        return;
    }

    if (QuizID in get_data) {
        Math.seedrandom(Number(get_data[QuizID]));
    }

    if (get_data[qType] == scaleRaw) {
        handle_lable_scale(get_data);
    }
    else {
        alert("Invalid request for quiz!");
        return;
    }
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

// TODO: extend to include labling for extra options like "natural minor", "melodic minor", "harmonic minor"
function handle_lable_scale(data) {
    title = 'Timed Scale Quiz (Major and minor)';
    prompt = 'Create the requested scale by filling in the appropriate accidentals.';
    MScales = data[MScalesKey];
    mScales = data[mScalesKey];

    console.log(`MScales: ${MScales}`);
    console.log(`mScales: ${mScales}`);

    total = MScales + mScales;
    console.log(`Total: ${total}`);

    mMscales = random_major_minor(MScales, mScales);
    for(i =0; i < mMscales.length; i++) {
        clef = random_clef();
        console.log(`Clef: ${clef}`);
        console.log(mMscales[i]);
    }
    write_doc();
}


function write_doc() {
    $(`<h1>${title}</h1>`).appendTo('body');

    $(`<p>${prompt}</p>`).appendTo('body');

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