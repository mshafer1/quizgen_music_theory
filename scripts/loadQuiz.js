$(window).load(init);

const qType = 'qType';
const intervaltype = 'interval';
const mScalesKey = 'mScales';
const MScalesKey = 'MScales';
const hmScalesKey = 'hmScales';
const mmScalesKey = 'mmScales';

const scaleRaw = 'ScaleLabel';
const intervalRaw = 'IntervalID';
const noteID = 'NoteID';
const triadIDRaw = 'TriadID';

const QuizID = 'ID';

const mStartingNotes = 'mPitches[]';
const MStartingNotes = 'MPitches[]';
const hmStartingNotes = 'hmPitches[]';
const mmStartingNotes = 'mmPitches[]';

const StartingNotes = 'BasePitches[]';
const StartingBassNotes = 'BassBasePitches[]';
const StartingTrebleNotes = 'TrebleBasePitches[]';
const NIntervals = 'NIntervals';
const Intervals = 'Intervals[]';
const BARNote = {}; // create an object


const STAVE_HEIGHT = 150;

const NOTES_PER_LINE = 'NPerLine';

staveSize = 900;
rowSize = 6;
title = '';
prompt = '';
VF = Vex.Flow;

function get_indeces(dict) {
    var indeces = dict['indexes']

    console.log(typeof(indeces));
    console.log("Indexes: " + indeces);

    if (typeof(indeces) != 'number' && indeces.indexOf(',') != -1) {
        indeces = indeces.split(',');
    }
    else {
        indeces = [indeces];
    }

    console.log("Indeces: ");
    console.log(indeces);

    return indeces;
}

function try_parse_interval_data(get_data, out_data) {
    // NIntervals in get_data && Intervals in get_data && (StartingBassNotes in get_data || StartingTrebleNotes in get_data)
    var result = false;

    if(get_data[qType] != intervalRaw) {
        return result;
    }

    if (!('indexes' in get_data)) {
        return result;
    }

    var indeces = get_indeces(get_data);

    
    for(var i = 0; i < indeces.length; i++) {
        var index = indeces[i]
        out_data[i] = {};

        data_keys = {NIntervals: `NIntervals${index}`, BasePitches: `BasePitches${index}[]`, Interval: `Interval${index}`, Clef: `Clef${index}`};
        for (var key in data_keys) {
            var key_ = data_keys[key];
            
            console.log("Looking for: " + key_);

            if (!(key_ in get_data)) {
                return result;
            }

            out_data[i][key] = get_data[key_];
        }
    }

    console.log("Out Data: ")
    console.log(out_data);

    return true;
}

function try_parse_triad_id_data(get_data, out_data) {
    // NTriad in get_data && Intervals in get_data && (StartingBassNotes in get_data || StartingTrebleNotes in get_data)
    var result = false;

    if(get_data[qType] != triadIDRaw) {
        return result;
    }

    if (!('indexes' in get_data)) {
        return result;
    }

    var indeces = get_indeces(get_data);
    
    for(var i = 0; i < indeces.length; i++) {
        var index = indeces[i]
        out_data[i] = {};

        data_keys = {NTriads: `NTriads${index}`, BasePitches: `BasePitches${index}[]`, Triad: `Triad${index}`, Clef: `Clef${index}`};
        for (var key in data_keys) {
            var key_ = data_keys[key];
            
            console.log("Looking for: " + key_);

            if (!(key_ in get_data)) {
                return result;
            }

            out_data[i][key] = get_data[key_];
        }
    }

    console.log("Out Data: ")
    console.log(out_data);

    return true;
}

function init() {
    var get_data = load_get();
    console.log(get_data);

    out = {};

    if (!(qType in get_data)) {
        alert("Invalid request for quiz!");
        return;
    }

    if(NOTES_PER_LINE in get_data) {
        rowSize = Number(get_data[NOTES_PER_LINE]);
    }
    if (QuizID in get_data) {
        Math.seedrandom(Number(get_data[QuizID]));
    }

    if (get_data[qType] == scaleRaw && (
        (mScalesKey in get_data && mStartingNotes in get_data) ||
        (MScalesKey in get_data && MStartingNotes in get_data) ||
        (hmScalesKey in get_data && hmStartingNotes in get_data) ||
        (mmScalesKey in get_data && mmStartingNotes in get_data)) ) {
        handle_label_scale(get_data);
    }
    else if (try_parse_interval_data(get_data, out)) {
        handle_label_interval(out);
    }
    else if (get_data[qType] == noteID) {
        handle_note_id(get_data);
    }
    else if (try_parse_triad_id_data(get_data, out)) {
        handle_triad_id(out);
    }
    else {
        alert("Invalid request for quiz!");
        return;
    }
}

function handle_note_id(data) {
    title = "Timed Note Quiz, ID";
    prompt = "Identify the following notes";

    var clefs = [TrebleClef, AltoClef, BassClef]
    var i = 0;
    staves = [];

    clefs.forEach(function (clef) {
        console.log(clef);
        var clefLabel = clef.replace(/^\w/, c => c.toUpperCase());

        var n = data['N' + clefLabel] || 0;

        var raw_notes = data[clefLabel + 'Notes[]'] || [];

        // var notes = shuffled_slice(n, raw_notes);

        console.log("Notes: " + JSON.stringify(notes));

        var notes = shuffled_slice(n, raw_notes);

        var slices = slice_array(rowSize, notes);

        staveSize = Math.max(staveSize, (slices.length > 0)?(slices[0].length * 100):0);
        console.log("StaveSize: ", staveSize);

        var nStaff = slices.length

        for (var j = 0; j < nStaff; j++) {
            var slice = slices[j];
            console.log(JSON.stringify(slice));

            // create stave
            var stave = new_stave('Stave' + i + ':' + (j * rowSize + k));
            console.log("new stave");
            // add notes
            var notes = [];
            for (var k = 0; k < slice.length; k++) {
                var key = slice[k];
                console.log(JSON.stringify(key));
                notes.push(keys_to_note([teorian_note_to_key(key)]))
            }
            console.log(JSON.stringify(notes));

            Draw_stave(stave, clef, null, notes, 'w');

            // setup question
            var question = new_stave('Q' + i);
            question.classList.add('nosplit');

            var label = document.createElement('h3');
            label.innerHTML = '' + (i + 1) + ': ';

            var answer_row = gen_answer_row(slice.length, staveSize);

            question.appendChild(label)
            question.appendChild(stave);
            question.appendChild(answer_row);

            // add to staves
            staves.push(question);

            i++;
        }
    })
    write_doc()
}

function handle_triad_id(data) {
    title = "Timed Triad Quiz, ID";
    prompt = "Identify each triad with lead sheet symbols indicating root and quality.";

    var compiled_data = [];
    for (var key in data) {
        // console.log("Data: ", data);
        var clef = data[key].Clef;
        var triad = data[key].Triad;
        var base_pitches = data[key].BasePitches;

        var info = base_pitches.map(function(base_pitch){
            return new IntervalInfo(base_pitch, triad, clef);
        });

        var part = shuffled_slice(data[key].NTriads, info);
        compiled_data = compiled_data.concat(part);
    }

    // console.log("Compiled data: ", compiled_data)

    staves = []

    var clef = null;

    var clef_order = [TrebleClef, AltoClef, BassClef];

    var i = 0;

    clef_order.forEach(function (clef) {
        console.log(clef);
        var clef_triads = shuffle(compiled_data.filter(function (item) { return item.clef == clef }));
        console.log(clef + " Triads: ", clef_triads);

        var slices = slice_array(rowSize, clef_triads);
        staveSize = Math.max(staveSize, (slices.length > 0)?(slices[0].length * 100):0);

        
    });
}

function handle_label_interval(data) {
    title = 'Timed Interval Quiz, ID';
    prompt = 'Identify the following intervals (include number and quality)';

    var compiled_data = [];
    for (var key in data) {
        var clef = data[key].Clef;
        var interval = data[key].Interval;
        var base_pitches = data[key].BasePitches;

        var info = base_pitches.map(function(base_pitch){
            return new IntervalInfo(base_pitch, interval, clef);
        });

        var part = shuffled_slice(data[key].NIntervals, info);
        compiled_data = compiled_data.concat(part);
    }

    console.log("Compiled data: ", compiled_data)

    staves = []

    var clef = null;

    var clef_order = [TrebleClef, AltoClef, BassClef];

    var i = 0;

    clef_order.forEach(function (clef) {
        console.log(clef);
        var clef_intervals = shuffle(compiled_data.filter(function (item) { return item.clef == clef }));
        console.log(clef + " Intervals: ", clef_intervals);

        var slices = slice_array(rowSize, clef_intervals);

        console.log("Slices: ", slices);

        for(var j = 0; j < slices.length; j++) {
            var slice = slices[j];
       
            stave = new_stave('Stave' + i);
            console.log("new stave");

            var notes = []

            answer_row = gen_answer_row(slice.length, staveSize);

            console.log("Slice: ", slice);

            slice.forEach(function (interval) {
                console.log('Interval: ', interval);
                console.log("Interval starting note: ", interval.starting_note);
                console.log("Interval interval: ", interval.interval);
                var keys = gen_interval(interval.starting_note, interval.interval);
                console.log("Keys: " , keys);
                
                console.log("Keys: " + JSON.stringify(keys));
                notes.push(keys_to_note(keys));
            });

            console.log("Notes: " + JSON.stringify(notes));
            Draw_stave(stave, clef, null, notes, 'w');

            question = new_stave("Stave" + i);
            question.classList.add("nosplit");

            var label = document.createElement('h3');
            label.innerHTML = '' + (i + 1) + ': ';
            question.appendChild(label);

            question.appendChild(stave);
            stave.classList.add('no-above-padding');

            question.appendChild(answer_row);
            question.appendChild(document.createElement('br'));
            question.appendChild(document.createElement('br'));

            staves.push(question);

            i++;
        }
    });
    write_doc();
}

function scale_clef(starting_note, original_clef) {
    var note = teoria.note(starting_note);
    var index = note.key();

    var ab3 = teoria.note("Ab3").key();
    var g2 = teoria.note("G2").key();

    if (index <= g2) {
        return BassClef;
    } else if (index >= ab3) {
        return TrebleClef;
    } else {
        return original_clef;
    }
}

function handle_label_scale(data) {
    title = 'Timed Scale Quiz (Major and minor)';
    prompt = 'Create the requested scale by filling in the appropriate accidentals.';
    MScales = data[MScalesKey] || 0;
    mScales = data[mScalesKey] || 0;
    hmScales = data[hmScalesKey] || 0;
    mmScales = data[mmScalesKey] || 0;

    console.log(`MScales: ${MScales}`);
    console.log(`mScales: ${mScales}`);

    total = MScales + mScales;
    console.log(`Total: ${total}`);

    staves = [];

    var mNotes = data[mStartingNotes] || [];
    mNotes = shuffled_slice(mScales, mNotes);

    var MNotes = data[MStartingNotes] || [];
    MNotes = shuffled_slice(MScales, MNotes);

    var hmNotes = data[hmStartingNotes] || [];
    hmNotes = shuffled_slice(hmScales, hmNotes);

    var mmNotes = data[mmStartingNotes] || [];
    mmNotes = shuffled_slice(mmScales, mmNotes);

    var mMscales = random_major_minor(MNotes.length, mNotes.length, hmNotes.length, mmNotes.length);
    for (var i = 0; i < mMscales.length; i++) {
        clef = random_clef();
        console.log(`Clef: ${clef}`);
        var mMscale = mMscales[i];
        console.log(mMscale);

        stave = new_stave('Stave' + i);

        // pop starting note off of end of corresponding list
        if (mMscale == Major) {
            starting_note = MNotes.pop();
        } else if (mMscale == HarmonicMinor) {
            starting_note = hmNotes.pop();
        } else if (mMscale == MelodicMinor) {
            starting_note = mmNotes.pop();
        } else { // Minor
            starting_note = mNotes.pop();
        }

        clef = scale_clef(starting_note, clef);

        scale = gen_scale(mMscale, starting_note);

        var notes = [];
        for (var j = 0; j < scale.length; j++) {
            var key = scale[j];
            notes.push(keys_to_note([key]))
        }
        // var notes = [keys_to_note(scale)];

        Draw_stave(stave, clef, null, notes, 'w', true);

        var question = new_stave('Q' + i);
        question.classList.add('nosplit');

        var label = document.createElement('h3');

        var teoira_note = new teoria.note(starting_note);
        console.log('Teoria Note: ', teoira_note);
        var start_note = teorian_note_to_key(String(teoira_note));
        console.log('Start Note: ', start_note);
        var accidental = '';
        if (start_note.accidental == 'b') {
            accidental = '&#9837;';
        } else if(start_note.accidental == '#') {
            accidental = '#';
        }
        console.log('Start_Note: ', start_note);
        console.log('Start_Note.letter: ', start_note.letter);

        label.innerHTML = '' + (i + 1) + ': ' + start_note.letter.toUpperCase() + accidental + ' ' + mMscales[i];

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
    var answer_width = part_width - 2 * padding;

    for (var i = 0; i < n_answers; i++) {
        for (var j = 0; j < 3; j++) {
            var part = document.createElement('div');
            result.appendChild(part);

            if (j == 1) {
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
        var notes = note.scale('ionian').notes();
    } else { // minor
        var notes = note.scale('aeolian').notes();
    }

    for (var i = 0; i < notes.length; i++) {
        result.push(teorian_note_to_key(String(notes[i]), keep_accidental=i==0));
    }

    result.push(teorian_note_to_key(note.name() + note.accidental() + (note.octave() + 1), keep_accidental=true));

    if (mM == MelodicMinor) {
        var reversed = notes.reverse();
        for(var i = 0; i < reversed.length; i++) {
            result.push(teorian_note_to_key(String(reversed[i]), keep_accidental=i+1==reversed.length));
        }
    }

    return result;
}

function new_stave(id = '') {
    result = document.createElement("div");
    result.id = id;
    return result;
}

function Draw_stave(target_div, clef, signature, notes, duration, show_accidentals = true) {
    var renderer = new VF.Renderer(target_div, VF.Renderer.Backends.SVG);
    renderer.resize(staveSize + 200, STAVE_HEIGHT);
    var context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    var stave = new VF.Stave(10, 40, staveSize);
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

    var formatter = new VF.Formatter().joinVoices(voices).format(voices, staveSize);

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
