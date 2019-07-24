$(window).load(init);

const qType = 'qType';
const intervaltype = 'interval';
const mScalesKey = 'mScales';
const MScalesKey = 'MScales';

const scaleRaw = 'ScaleLable';
const intervalRaw = 'IntervalID';

const QuizID = 'ID';

const mStartingNotes = 'mPitches[]';
const MStartingNotes = 'MPitches[]';
const StartingNotes = 'BasePitches[]';
const StartingBassNotes = 'BassBasePitches[]';
const StartingTrebleNotes = 'TrebleBasePitches[]';
const NIntervals = 'NIntervals';
const Intervals = 'Intervals[]';
const BARNote = {}; // create an object

const STAVE_SIZE = 800;

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

    if (get_data[qType] == scaleRaw && MScalesKey in get_data && mScalesKey in get_data && (mStartingNotes in get_data || MStartingNotes in get_data)) {
        handle_lable_scale(get_data);
    }
    else if (get_data[qType] == intervalRaw && NIntervals in get_data && Intervals in get_data && (StartingBassNotes in get_data || StartingTrebleNotes in get_data)) {
        handle_lable_interval(get_data);
    }
    else {
        alert("Invalid request for quiz!");
        return;
    }
}

function handle_lable_interval(data) {
    title = 'Timed Interval Quiz, ID';
    prompt = 'Identify the following intervals (include number and quality)';

    var n_intervals = data[NIntervals];

    var bass_starting_notes = (StartingBassNotes in data)? data[StartingBassNotes]: [];
    var treble_starting_notes = (StartingTrebleNotes in data)? data[StartingTrebleNotes]: [];




    var intervals = data[Intervals];
    var n_rows = Math.ceil(n_intervals / 12);
    var bass_intervals = shuffled_interval_slices(Math.floor(n_intervals / 2), bass_starting_notes, intervals);
    var treble_intervals = shuffled_interval_slices(Math.ceil(n_intervals / 2), treble_starting_notes, intervals);
   

    staves = []

    var clef = null;
    
    console.log("n_rows: " + n_rows);

    for (var i = 0; i < n_rows*2; i++) { 
        stave = new_stave('Stave' + i);

        clef = (i%2)?BassClef:TrebleClef;
        console.log("new stave");
        
        var notes = []

        // var end_clef = false;
        var index = Math.floor(i/2);
        var row = (i%2)?bass_intervals[index]:treble_intervals[index];
        answer_row = gen_answer_row(row.length, STAVE_SIZE);


        for(var j = 0; j < row.length; j++) {
            var interval = row[j];

            var keys = gen_interval(interval.starting_note, interval.interval);
            console.log("interval: " + interval);
            console.log("Keys: " + JSON.stringify(keys));
            notes.push(keys_to_note(keys));

            // if(bass_starting_notes.length == 0 || treble_starting_notes.length == 0) {
            //     end_clef = true;
            //     continue;
            // }

            if(j < row.length-1) {
                notes.push(BARNote);
            }
            console.log("Notes: ")
            console.log(notes);
        }

        console.log("Stave: " + JSON.stringify(stave));
        console.log("Clef: " + clef);
        
        console.log("Notes: " + JSON.stringify(notes));
        Draw_stave(stave, clef, null, notes, 'w');
        
        
        question = new_stave("Stave" + i);
        question.classList.add("nosplit");

        var label = document.createElement('h3');
        label.innerHTML = '' + (i + 1) + ': ';
        question.appendChild(label);

        question.appendChild(stave);
        question.appendChild(answer_row);

        staves.push(question);
    }

    write_doc();
}

function scale_clef(starting_note, original_clef) {
    var note = teoria.note(starting_note);
    var index = note.key();

    if (index <= 32) {
        return BassClef;
    } else if(index >= 40) {
        return TrebleClef;
    } else {
        return original_clef;
    }
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

    if (mStartingNotes in data) {
        mNotes = shuffled_slice(mScales, data[mStartingNotes]);
    }
    if (MStartingNotes in data) {
        MNotes = shuffled_slice(MScales, data[MStartingNotes]);
    }

    var mMscales = random_major_minor(MNotes.length, mNotes.length);
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

        clef = scale_clef(starting_note, clef);

        scale = gen_scale(mMscales[i], starting_note);

        var notes = [];
        for (var j = 0; j < scale.length; j++) {
            var key = scale[j];
            notes.push(keys_to_note([key]))
        }
        // var notes = [keys_to_note(scale)];

        Draw_stave(stave, clef, null, notes, 'w', false);

        var question = new_stave('Q' + i,);
        question.classList.add('nosplit');

        var label = document.createElement('h3');
        label.innerHTML = '' + (i + 1) + ': ' + starting_note.substring(0, starting_note.length-1).toUpperCase() + ' ' + mMscales[i];
        
        question.appendChild(label)
        question.appendChild(stave);

        staves.push(question);
    }
    write_doc();
}

function gen_answer_row(n_answers, width) {
    var result = document.createElement('div');
    result.style.paddingLeft = '15px';

    var part_width = width / n_answers;
    var padding = 15;
    var answer_width = part_width - 2*padding;

    for(var i = 0; i < n_answers; i++) {
        for(var j = 0; j < 3; j++) {
            var part = document.createElement('div');
            result.appendChild(part);

            if(j == 1)  {
                part.classList.add("answer-inline");
                part.style.width = answer_width + 'px';
                // part.innerHTML = "<hr/>";
            } else {
                part.classList.add("blank-inline");
                part.innerHTML = '';
                part.style.width = padding + 'px';
            }
            
        }
    }
    
    return result;
}

function gen_interval(starting_note, interval) {
    var result = Array();
    var note = teoria.note(starting_note);

    result.push(teorian_note_to_key(String(note)));
    console.log(String(note));
    console.log("Interval: " + interval);

    var upper_note = note.interval(interval)
    console.log(String(upper_note))

    result.push(teorian_note_to_key(String(upper_note)));

    return result;
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

function new_stave(id = '') {
    result = document.createElement("div");
    result.id = id;
    return result;
}

function Draw_stave(target_div, clef, signature, notes, duration, show_accidentals = true) {
    var renderer = new VF.Renderer(target_div, VF.Renderer.Backends.SVG);
    renderer.resize(STAVE_SIZE + 200, 200);
    var context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    var stave = new VF.Stave(10, 40, STAVE_SIZE);
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

    var formatter = new VF.Formatter().joinVoices(voices).format(voices, STAVE_SIZE);

    voices.forEach(function (v) {
        v.draw(context, stave);
    })
}


function write_doc() {
    $(`<h1>${title}</h1>`).appendTo('body');

    $(`<p>${prompt}</p>`).appendTo('body');

    for (var i = 0; i < staves.length; i++) {
        var stave = staves[i];
        document.body.appendChild(stave);
    }

}
