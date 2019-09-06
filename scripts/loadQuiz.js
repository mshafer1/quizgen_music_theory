$(window).load(init);

const qType = 'qType';
const TITLE = 'title';
const PROMPT = 'prompt';
const HEADER = 'quizHeader';
const intervaltype = 'interval';
const mScalesKey = 'mScales';
const MScalesKey = 'MScales';
const hmScalesKey = 'hmScales';
const mmScalesKey = 'mmScales';

const scaleRaw = 'ScaleLabel';
const intervalRaw = 'IntervalID';
const intervalConstructionRaw = 'IntervalConst';
const noteID = 'NoteID';
const triadIDRaw = 'TriadID';
const triadConstructionRaw = 'TriadConst';
const signatureIDRaw = 'KeySignatureID';

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


STAVE_HEIGHT = 150;
const DUAL_STAVE_HEIGHT = 75;

const NOTES_PER_LINE = 'NPerLine';

staveSize = 950;
rowSize = 6;
title = '';
prompt = '';
header = '';
VF = Vex.Flow;

function get_indeces(dict) {
    var indeces = dict['indexes']

    console.log(typeof (indeces));
    console.log("Indexes: " + indeces);

    if (typeof (indeces) != 'number' && indeces.indexOf(',') != -1) {
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
    return try_parse_quiz_data(get_data, out_data, intervalRaw, 'NIntervals', 'Interval');
}

function try_parse_triad_id_data(get_data, out_data) {
    return try_parse_quiz_data(get_data, out_data, triadIDRaw, 'NTriads', 'Triad');
}

function try_parse_triad_construction_data(get_data, out_data) {
    return try_parse_quiz_data(get_data, out_data, triadConstructionRaw, 'NTriads', 'Triad');
}

function try_parse_interval_construction_data(get_data, out_data) {
    return try_parse_quiz_data(get_data, out_data, intervalConstructionRaw, 'NIntervals', 'Interval');
}

function try_parse_quiz_data(get_data, out_data, quizTypeKey, NKey, dataLable) {
    var result = false;

    if (get_data[qType] != quizTypeKey) {
        return result;
    }

    if (!('indexes' in get_data)) {
        return result;
    }

    var indeces = get_indeces(get_data);

    for (var i = 0; i < indeces.length; i++) {
        var index = indeces[i]
        out_data[i] = {};
        data_keys = { N: `${NKey}${index}`, BasePitches: `BasePitches${index}[]`, Clef: `Clef${index}` };
        data_keys[dataLable] = `${dataLable}${index}`;
        for (var key in data_keys) {
            var key_ = data_keys[key];

            console.log("Looking for: " + key_);

            if (!(key_ in get_data)) {
                return result;
            }

            out_data[i][key] = get_data[key_];
        }
    }

    result = true;
    return result;
}

function try_parse_key_signature_quiz_data(get_data, out_data) {
    return try_parse_key_type_quiz_data(get_data, out_data, signatureIDRaw, 'NKeys', 'keys[]');
}

function try_parse_key_type_quiz_data(get_data, out_data, expectedQuizType, NKey, keysName) {
    var result = false;

    var quizType = get_data[qType];
    if (quizType != expectedQuizType) {
        return result;
    }

    if (!(NKey in get_data)) {
        return result;
    }

    out_data.N = get_data[NKey];

    if (!(keysName in get_data)) {
        return result;
    }

    out_data.Keys = get_data[keysName];

    result = true;

    return result;
}

function init() {
    staves = [];
    var get_data = load_get();
    console.log(get_data);

    out = {};

    if (!(qType in get_data)) {
        alert("Invalid request for quiz!");
        return;
    }

    if (NOTES_PER_LINE in get_data) {
        rowSize = Number(get_data[NOTES_PER_LINE]);
        staveSize = Math.max(staveSize, (rowSize > 0) ? (rowSize * 104) : 0);
    }
    if (QuizID in get_data) {
        Math.seedrandom(Number(get_data[QuizID]));
    }

    if (get_data[qType] == scaleRaw && (
        (mScalesKey in get_data && mStartingNotes in get_data) ||
        (MScalesKey in get_data && MStartingNotes in get_data) ||
        (hmScalesKey in get_data && hmStartingNotes in get_data) ||
        (mmScalesKey in get_data && mmStartingNotes in get_data))) {
        
        title = 'Timed Scale Quiz (Major and minor)';
        prompt = 'Create the requested scale by filling in the appropriate accidentals.';    
        
        handle_label_scale(get_data);
    }
    else if (try_parse_interval_data(get_data, out)) {
        title = 'Timed Interval Quiz, ID';
        prompt = 'Identify the following intervals (include number and quality)';

        handle_clef_grouped_data(out, 'Interval', gen_interval, show_question_label = false);
    }
    else if (get_data[qType] == noteID) {
        handle_note_id(get_data, show_question_label = false);
    }
    else if (try_parse_triad_id_data(get_data, out)) {
        title = "Timed Triad Quiz, ID";
        prompt = "Identify each triad with lead sheet symbols indicating root and quality.";

        handle_clef_grouped_data(out, 'Triad', get_triad, show_question_label = false);
    }
    else if (try_parse_key_signature_quiz_data(get_data, out)) {
        title = 'Timed Key Signature Quiz, ID';
        prompt = 'Write the correct key signatures (both major and minor) in the blanks below.';

        handle_label_key_signature(out, show_question_label = false);
    }
    else if (try_parse_triad_construction_data(get_data, out)) {
        title = 'Timed Triad Quiz, Construction';
        prompt = 'Write the requested triad in root position. Pay careful attention to clef signs.';

        STAVE_HEIGHT *= 1.1;
        
        handle_clef_grouped_construction(out, 'Triad', TriadConstructionAnswerGen, (_) => null, add_bars_between_parts=false, show_question_label = false, show_accidentals=false);
    }
    else if(try_parse_interval_construction_data(get_data, out)) {
        title = 'Timed Interval Quiz, Construction';
        prompt = 'Write the requested interval on the staff.';

        STAVE_HEIGHT *= 1.1;

        handle_clef_grouped_construction(out, 'Interval', IntervalConstructionAnswerGen, ReturnBaseNote, add_bars_between_parts=true, show_question_label = false, show_accidentals=true);
    }
    else {
        alert("Invalid request for quiz!");
        return;
    }

    // apply here so defaults can be stored above
    title = safe_load_variable(TITLE, get_data, title);
    prompt = safe_load_variable(PROMPT, get_data, prompt);
    header = safe_load_variable(HEADER, get_data, header);

    write_doc();
}

function safe_load_variable(key, data, _default=null) {
    if (key in data && ('' + data[key]).length > 0) {
        return safe(data[key]);
    }
    else {
        return _default;
    }
}

function safe(raw) {
    // in theory, encodURI works to, but this makes it display what they put, rather then a URL
    return raw.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
}


function handle_label_key_signature(data, show_question_label = true) {
    var total = shuffled_slice(data.N, data.Keys);
    var slices = slice_array(rowSize, total);

    slices.forEach(function (slice, index) {
        var stave = new_stave('Stave' + index);

        Draw_stave_with_key_sig(stave, null, slice);

        var MajorAnswers = gen_answer_row(slice.length, staveSize, 'Major:')
        var MinorAnswers = gen_answer_row(slice.length, staveSize, 'Minor:')

        stave.appendChild(MajorAnswers);
        stave.appendChild(document.createElement("br"));
        stave.appendChild(document.createElement("br"));
        stave.appendChild(MinorAnswers);

        stave.classList.add('nosplit');

        staves.push(stave);
    });
}

function handle_note_id(data, show_question_label = true, add_bars_between_parts = true) {
    var clefs = [TrebleClef, AltoClef, BassClef]
    var i = 0;

    clefs.forEach(function (clef) {
        console.log(clef);
        var clefLabel = clef.replace(/^\w/, c => c.toUpperCase());

        var n = data['N' + clefLabel] || 0;

        var raw_notes = data[clefLabel + 'Notes[]'] || [];

        // var notes = shuffled_slice(n, raw_notes);

        console.log("Notes: " + JSON.stringify(notes));

        var notes = shuffled_slice(n, raw_notes);

        var slices = slice_array(rowSize, notes);

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

                if (add_bars_between_parts && k != slice.length - 1) {
                    notes.push(BARNote);
                }
            }
            console.log(JSON.stringify(notes));

            Draw_stave(stave, clef, null, notes, 'w');

            // setup question
            var question = new_stave('Q' + i);
            question.classList.add('nosplit');

            if (show_question_label) {
                var label = document.createElement('h3');
                label.innerHTML = '' + (i + 1) + ': ';
                question.appendChild(label);
            }

            var answer_row = gen_answer_row(slice.length, staveSize);

            question.appendChild(stave);
            question.appendChild(answer_row);

            // add to staves
            staves.push(question);

            i++;
        }
    });
}

function handle_clef_grouped_construction(data, data_key, gen_answer, gen_note, add_bars_between_parts = false, show_question_label = false, show_accidentals=true) {
    var compiled_data = [];
    for (var key in data) {
        var clef = data[key].Clef;
        var data_value = data[key][data_key];
        var base_pitches = data[key].BasePitches;

        var info = base_pitches.map(function (base_pitch) {
            return new IntervalInfo(base_pitch, data_value, clef);
        });

        var part = shuffled_slice(data[key].N, info);

        compiled_data = compiled_data.concat(part);
    }

    console.log("Compiled Data: ", compiled_data);

    var clef = null;

    var clef_order = [TrebleClef, AltoClef, BassClef];

    var i = 0;


    clef_order.forEach(function (clef) {
        console.log("Clef: ", clef);

        var clef_parts = shuffle(compiled_data.filter(function (item) { return item.clef == clef; }));

        var slices = slice_array(rowSize, clef_parts);

        for (var j = 0; j < slices.length; j++) {
            var slice = slices[j];

            stave = new_stave('Stave' + i);
            console.log("new stave");

            var notes = []

            console.log("Slice: ", slice);

            var answer_lables = [];

            slice.forEach(function (part, index) {
                console.log('Part: ', part);
                console.log("Part starting note: ", part.starting_note);
                console.log("Part info: ", part.interval);

                var answer = gen_answer(part);
                var _notes = gen_note(part);
                if (_notes != null) {
                    console.log("Receivede Notes: ", _notes);
                    _notes.forEach(function (note) {
                        notes.push(note);
                    });
                }

                answer_lables.push(answer);

                console.log("Keys: " + JSON.stringify(answer_lables));

                if (add_bars_between_parts && index != slice.length - 1) {
                    notes.push(BARNote);
                }
            });

            var answer_row = gen_answer_row(slice.length, staveSize, lable=null, answers=answer_lables);

            console.log("Notes: " + JSON.stringify(notes));
            Draw_stave(stave, clef, null, notes, 'w', show_accidentals, 15);

            question = new_stave("Stave" + i);
            question.classList.add("nosplit");

            if (show_question_label) {
                var label = document.createElement('h3');
                label.innerHTML = '' + (i + 1) + ': ';
                question.appendChild(label);
            }

            question.appendChild(stave);
            stave.classList.add('no-above-padding');

            question.appendChild(answer_row);
            question.appendChild(document.createElement('br'));
            question.appendChild(document.createElement('br'));

            staves.push(question);

            i++;
        }
    });
}

function ReturnBaseNote(part) {
    var note = keys_to_note([teorian_note_to_key(part.starting_note)]);
    note.padding = 30;
    var result = [note];

    return result;
}

function IntervalConstructionAnswerGen(part) {
    var note = teorian_note_to_key(part.interval);
    
    var result = note.letter + note.octave + " ";
    if(note.accidental == "u") {
        result += "up";
    } else if(note.accidental == "d") {
        result += "down";
    } else {
        console.error("Unknownd interval direction: ", note);
    }
    return result;
}

function TriadConstructionAnswerGen(part) {
    var note = teorian_note_to_key(part.starting_note);
    var answer = note.letter;
    if (note.accidental == 'b') {
        answer += '&#9837;';
    }
    else {
        answer += note.accidental;
    }
    if (part.interval == 'dim') {
        answer += '&deg;';
    }
    else if (part.interval == 'augmented') {
        answer += '+';
    }
    else if (part.interval == 'm' || part.interval == 'M') {
        answer += part.interval;
    }
    return answer;
}

function handle_clef_grouped_data(data, data_key, get_part, show_question_label = true, add_bars_between_parts = true) {
    var compiled_data = [];
    for (var key in data) {
        var clef = data[key].Clef;
        var data_value = data[key][data_key];
        var base_pitches = data[key].BasePitches;

        var info = base_pitches.map(function (base_pitch) {
            return new IntervalInfo(base_pitch, data_value, clef);
        });

        var part = shuffled_slice(data[key].N, info);

        compiled_data = compiled_data.concat(part);
    }

    console.log("Compile Data: ", compiled_data);


    var clef = null;

    var clef_order = [TrebleClef, AltoClef, BassClef];

    var i = 0;

    clef_order.forEach(function (clef) {
        console.log("Clef: ", clef);

        var clef_parts = shuffle(compiled_data.filter(function (item) { return item.clef == clef; }));

        var slices = slice_array(rowSize, clef_parts);

        for (var j = 0; j < slices.length; j++) {
            var slice = slices[j];

            stave = new_stave('Stave' + i);
            console.log("new stave");

            var notes = []

            answer_row = gen_answer_row(slice.length, staveSize);

            console.log("Slice: ", slice);

            slice.forEach(function (part, index) {
                console.log('Part: ', part);
                console.log("Part starting note: ", part.starting_note);
                console.log("Part info: ", part.interval);

                var keys = get_part(part.starting_note, part.interval);

                console.log("Keys: ", keys);

                console.log("Keys: " + JSON.stringify(keys));
                notes.push(keys_to_note(keys));

                if (add_bars_between_parts && index != slice.length - 1) {
                    notes.push(BARNote);
                }
            });

            console.log("Notes: " + JSON.stringify(notes));
            Draw_stave(stave, clef, null, notes, 'w');

            question = new_stave("Stave" + i);
            question.classList.add("nosplit");

            if (show_question_label) {
                var label = document.createElement('h3');
                label.innerHTML = '' + (i + 1) + ': ';
                question.appendChild(label);
            }

            question.appendChild(stave);
            stave.classList.add('no-above-padding');

            question.appendChild(answer_row);
            question.appendChild(document.createElement('br'));
            question.appendChild(document.createElement('br'));

            staves.push(question);

            i++;
        }
    });
}

function scale_clef(starting_note, original_clef) {
    var note = teoria.note(starting_note);
    var index = note.key();

    var ab3 = teoria.note("Ab3").key();
    var b3 = teoria.note("B3").key();

    if (index <= b3) {
        return BassClef;
    } else if (index >= ab3) {
        return TrebleClef;
    } else {
        return original_clef;
    }
}

function handle_label_scale(data) {
    MScales = data[MScalesKey] || 0;
    mScales = data[mScalesKey] || 0;
    hmScales = data[hmScalesKey] || 0;
    mmScales = data[mmScalesKey] || 0;

    console.log(`MScales: ${MScales}`);
    console.log(`mScales: ${mScales}`);

    total = MScales + mScales;
    console.log(`Total: ${total}`);


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
        } else if (mMscale == NaturalMinor) { // Minor
            starting_note = mNotes.pop();
        } else {
            console.error("Unknown scale type: ", mMscale);
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
        } else if (start_note.accidental == '#') {
            accidental = '#';
        }
        console.log('Start_Note: ', start_note);
        console.log('Start_Note.letter: ', start_note.letter);

        label.innerHTML = '' + (i + 1) + ': ' + start_note.letter.toUpperCase() + accidental + ' ' + mMscales[i];

        question.appendChild(label)
        question.appendChild(stave);

        staves.push(question);
    }
}

function gen_answer_row(n_answers, width, lable = null, answers = null) {

    var result = document.createElement('div');
    var lable_span = '';

    if (lable != null) {
        lable_span = document.createElement('span');
        lable_span.innerHTML = lable;
        result.appendChild(lable_span);
    }
    else {
        result.style.paddingLeft = '25px';
    }

    var part_width = width / n_answers;
    var padding = 15;
    var answer_width = part_width - 2 * padding;

    for (var i = 0; i < n_answers; i++) {
        for (var j = 0; j < 3; j++) {
            var part = document.createElement('div');
            result.appendChild(part);

            if (j == 1) {
                if (answers != null) {
                    var answer = answers[i];
                    part.innerHTML = answer;
                }
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

function get_triad(starting_note, triad) {
    var result = Array();
    var note = teoria.note(starting_note);

    var chord = note.chord(triad).notes();

    chord.forEach(function (note) {
        result.push(teorian_note_to_key(String(note)));
    });

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
        result.push(teorian_note_to_key(String(notes[i]), keep_accidental = i == 0));
    }

    result.push(teorian_note_to_key(note.name() + note.accidental() + (note.octave() + 1), keep_accidental = true));

    if (mM == MelodicMinor) {
        var reversed = notes.reverse();
        for (var i = 0; i < reversed.length; i++) {
            result.push(teorian_note_to_key(String(reversed[i]), keep_accidental = i + 1 == reversed.length));
        }
    }

    return result;
}

function new_stave(id = '') {
    result = document.createElement("div");
    result.id = id;
    return result;
}

function Draw_stave_with_key_sig(target_div, time_signature, keys, add_bars_between_parts = true) {
    var renderer = new VF.Renderer(target_div, VF.Renderer.Backends.SVG);
    renderer.resize(staveSize + 200, STAVE_HEIGHT * 1.2);

    var context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    // Create the staves
    var topStaff = new VF.Stave(15, 0, staveSize + 30);
    var bottomStaff = new VF.Stave(15, DUAL_STAVE_HEIGHT, staveSize + 30);

    topStaff.addClef('treble');
    bottomStaff.addClef('bass');

    if (time_signature != null) {
        topStaff.addTimeSignature(time_signature);
        bottomStaff.addTimeSignature(time_signature);
    }

    var stave_width = topStaff.getWidth();
    var left_padding = topStaff.getNoteStartX();
    var width_per = (stave_width - left_padding) / (keys.length);

    // TODO (mshafer) use the enum names
    var brace = new Vex.Flow.StaveConnector(topStaff, bottomStaff).setType(3);
    var lineLeft = new Vex.Flow.StaveConnector(topStaff, bottomStaff).setType(1);
    var lineRight = new Vex.Flow.StaveConnector(topStaff, bottomStaff).setType(6);


    topStaff.setContext(context);
    bottomStaff.setContext(context);

    var next_padding = 0;
    keys.forEach(function (key, index) {
        console.log(key);
        var signature = new VF.KeySignature(key);

        signature.addToStave(topStaff);
        var width = signature.getWidth();

        var padding = left_padding;
        if (index > 0) {
            padding = next_padding;
        }
        signature.padding = padding;

        next_padding = width_per - width;
        if (index == 0 && width == 0) {
            next_padding += left_padding;
        } else if (width == 0) {
            next_padding += padding;
        }

        var signature = new VF.KeySignature(key);

        signature.padding = padding;

        signature.addToStave(bottomStaff);
    });

    topStaff.draw();
    bottomStaff.draw();

    brace.setContext(context).draw();
    lineLeft.setContext(context).draw();
    lineRight.setContext(context).draw();
}

function Draw_stave(target_div, clef, time_signature, notes, duration, show_accidentals = true, spacing=10) {
    var renderer = new VF.Renderer(target_div, VF.Renderer.Backends.SVG);
    renderer.resize(staveSize + 200, STAVE_HEIGHT);
    var context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    var stave = new VF.Stave(10, 10, staveSize);
    stave.options.spacing_between_lines_px = spacing;
    if (time_signature != null) {
        stave.addTimeSignature(time_signature);
    }

    stave.addClef(clef);

    stave.setContext(context).draw();

    var stave_width = stave.getWidth();
    var left_padding = stave.getNoteStartX();
    var width_per = (stave_width - left_padding) / (notes.length);

    var stave_notes = []
    for (var i = 0; i < notes.length; i++) {
        note = notes[i];

        if (note == BARNote) {
            var bar_note = new Vex.Flow.BarNote();
            // bar_note.padding = 3;
            stave_notes.push(bar_note);
        }
        else {
            stave_note = new VF.StaveNote({
                clef: clef,
                keys: note.keys,
                duration: duration,
            });

            if(note.padding != undefined) {
                stave_note.extraLeftPx = note.padding;
            }

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

    // used in VexFlow;
    var formatter = new VF.Formatter().joinVoices(voices).format(voices, staveSize);

    voices.forEach(function (v) {
        v.draw(context, stave);
    })
}


function write_doc() {
    $(`<h1>${title}</h1>`).appendTo('body');

    $(`<p>${prompt}</p>`).appendTo('body');

    $(`<p>${header}</p>`).appendTo('body');

    for (var i = 0; i < staves.length; i++) {
        var stave = staves[i];
        document.body.appendChild(stave);
    }

}
