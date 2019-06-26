$(window).load(init);

const qType = 'qType';
const intervaltype = 'interval';
const scaleRaw = 'ScaleLable';
const mScalesKey = 'mScales';
const MScalesKey = 'MScales';

const QuizID = 'ID';

const mStartingNotes = 'mPitches[]';
const MStartingNotes = 'MPitches[]';
const BARNote = {}; // create an object

title = '';
prompt = '';
VF = Vex.Flow;

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


function note_to_key(note) {
    letter = note[0];
    accidental = '';
    if(letter.length == 2) {
        number = Number(note[1]);
    } else {
        accidental = note[1];
        number = Number(note[2]);
    }

    return Key(letter, number, accidental);
}

function shuffled_starting_notes(n, notes) {
    result = shuffle(notes);
    if (n < notes.length) {
        result = result.slice(0, n);
    }
    else if (n == notes.length) {
        // NOOP
    }
    else { // n > notes.length
        multiplier = n / notes.length;
        multiplier_whole = Math.floor(multiplier);
        multiplier_remainder = n - (notes.length * multiplier_whole);

        for (i = 1; i < multiplier_whole; i++) {
            result.concat(shuffle(notes));
        }

        result.concat(shuffle(notes).slice(0, multiplier_remainder));
    }

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

    staves = [];

    mNotes = shuffled_starting_notes(mScales, data[mStartingNotes]);
    MNotes = shuffled_starting_notes(MScales, data[MStartingNotes]);

    mMscales = random_major_minor(MScales, mScales);
    for (i = 0; i < mMscales.length; i++) {
        clef = random_clef();
        console.log(`Clef: ${clef}`);
        console.log(mMscales[i]);

        stave = new_stave('Stave' + i);

        // pop starting note off of end of corresponding list
        if(mMscales[i] == Major) {
            starting_note = MNotes.pop();
        } else { // Minor
            starting_note = mNOtes.pop();
        }

        Draw_stave(stave, clef, null, gen_scale(mMscales[i], starting_note), 'w');

        staves.push(stave);
    }
    write_doc();
}

function gen_scale(mM, starting_note) {
    result = Array();
    var note = teoria.note(starting_note);

    if(mM == Major) {
        notes = note.scale('ionian').notes();    
    } else { // minor
        notes = note.scale('aeolian').notes();
    }

    for(i = 0; i < notes.length; i++)
    {
        result = result.concat(teorian_note_to_vexflow_note(String(notes[i])));
    }

    result.concat(teorian_note_to_vexflow_note(note.name() + note.accidental() + (note.octave() + 1)));

    return result;
}

function new_stave(id) {
    result = document.createElement("div");
    result.id = id;
    return result;
}

function Draw_stave(target_div, clef, signature, notes, duration) {
    var renderer = new VF.Renderer(target_div, VF.Renderer.Backends.SVG);
    renderer.resize(1000, 500);
    var context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    var stave = new VF.Stave(10, 40, 800);
    if (signature != null) { 
        stave.addTimeSignature(signature);
    }

    stave.setContext(context).draw();

    var stave_notes = []
    for(i = 0; i < notes.length; i++)
    {
        note = notes[i];

        if(note == BARNote) {
            stave_notes.push(new Vex.Flow.BarNote());
        }
        else {
            stave_note = new VF.StaveNote({
                clef: clef,
                key: note.keys,
                duration: duration,
            });

            if(note.accidentals != null) {
                for(j = 0; j < note.accidentals.length; j++)
                {
                    stave_note.addAccidental(note.accidentals[j].index, new VF.Accidental(note.accidentals[j].value))
                }
            }

            stave_notes.push(stave_note);
        }
    }

    voice = new VF.Voice({
        num_beats: 4, // TODO: make this a parameter
        beat_value: 4
    }).setStrict(false).addTickables(stave_notes);

    var voices = [voice];

    var formatter = new VF.Formatter().joinVoices(volices).format(voices, 800);

    voices.forEach(function(v) {
        v.draw(context, stave);
    })
}


function write_doc() {
    $(`<h1>${title}</h1>`).appendTo('body');

    $(`<p>${prompt}</p>`).appendTo('body');

    // staves.forEach(element => {
    //     console.log(element);
    //     element.appendTo('body');
    // });

    
}
