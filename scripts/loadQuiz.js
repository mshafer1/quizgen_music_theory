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
    var get_data = load_get();

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

    var mNotes = [];
    var MNotes = [];

    if(mStartingNotes in data) {
        mNotes = shuffled_starting_notes(mScales, data[mStartingNotes]);
    }
    if(MStartingNotes in data) {
        MNotes = shuffled_starting_notes(MScales, data[MStartingNotes]);
    }

    var mMscales = random_major_minor(MScales, mScales);
    for (var i = 0; i < mMscales.length; i++) {
        clef = random_clef();
        console.log(`Clef: ${clef}`);
        console.log(mMscales[i]);

        stave = new_stave('Stave' + i);

        // pop starting note off of end of corresponding list
        if (mMscales[i] == Major) {
            starting_note = MNotes.pop();
        } else { // Minor
            starting_note = mNotes.pop();
        }


        scale = gen_scale(mMscales[i], starting_note);

        var notes = [];
        for(var j = 0; j < scale.length; j++) {
            var key = scale[j];
            notes.push(keys_to_note([key]))
        }
        // var notes = [keys_to_note(scale)];

        Draw_stave(stave, clef, null, notes, 'w', false);

        var question = new_stave('Q' + i);
        var label = document.createElement('h3');
        label.innerHTML = '' + (i+1) + ': ' + starting_note.toUpperCase() + ' ' + mMscales[i];
        question.appendChild(label)
        question.appendChild(stave);

        // document.body.appendChild(stave);

        staves.push(question);
    }
    write_doc();
}

function gen_scale(mM, starting_note) {
    var result = Array();
    var note = teoria.note(starting_note);

    if (mM == Major) {
        notes = note.scale('ionian').notes();
    } else { // minor
        notes = note.scale('aeolian').notes();
    }

    for (var i = 0; i < notes.length; i++) {
        result.push(teorian_note_to_key(String(notes[i])));
    }

    result.push(teorian_note_to_key(note.name() + note.accidental() + (note.octave() + 1)));

    return result;
}

function new_stave(id) {
    result = document.createElement("div");
    result.id = id;
    return result;
}

function Draw_stave(target_div, clef, signature, notes, duration, show_accidentals=true) {
    var renderer = new VF.Renderer(target_div, VF.Renderer.Backends.SVG);
    renderer.resize(1000, 200);
    var context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    var stave = new VF.Stave(10, 40, 800);
    if (signature != null) {
        stave.addTimeSignature(signature);
    }

    stave.addClef(clef);

    stave.setContext(context).draw();

    var stave_notes = []
    for (var i = 0; i < notes.length; i++) {
        note = notes[i];

        if (note == BARNote) {
            stave_notes.push(new Vex.Flow.BarNote());
        }
        else {
            stave_note = new VF.StaveNote({
                clef: clef,
                keys: note.keys,
                duration: duration,
            });

            if (show_accidentals && note.accidentals != null) {
                for (j = 0; j < note.accidentals.length; j++) {
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

    var formatter = new VF.Formatter().joinVoices(voices).format(voices, 800);

    voices.forEach(function (v) {
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

    for(var i = 0; i < staves.length; i++) {
        var stave = staves[i];
        document.body.appendChild(stave);
    }

}
