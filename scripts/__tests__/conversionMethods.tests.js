var vm = require("vm");
var fs = require("fs");
require(__dirname + '/../conversionMethods.js');

var data = fs.readFileSync(__dirname + '/../conversionMethods.js');
// const script = new vm.Script(data);
// utils = script.runInThisContext();
eval(data + '');

test('Test teorian_note_to_vexflow_note a4 => a/4', () => {
  expect(teorian_note_to_vexflow_note('a4')).toEqual('a/4');
});


test('Test teorian_note_to_vexflow_note a5 => a/5', () => {
  expect(teorian_note_to_vexflow_note('a5')).toEqual('a/5');
});

test('Test teorian_note_to_vexflow_note ab5 => ab/5', () => {
  expect(teorian_note_to_vexflow_note('ab5')).toEqual('ab/5');
});

test('Test teorian_note_to_vexflow_note a#5 => a#/5', () => {
  expect(teorian_note_to_vexflow_note('a#5')).toEqual('a#/5');
});

describe('Test randomMm', () => {
  it('Test randomMm returns right counts (1,0,0,0)', () => {
    data = random_major_minor(1, 0, 0, 0);
    expect(data).not.toContain('Minor');
    expect(data).toContain('Major');
  })

  it('Test randomMm returns right counts (0,1,0,0)', () => {
    data = random_major_minor(0, 1, 0, 0);
    expect(data).toContain('Minor');
    expect(data).not.toContain('Major');
  })

  it('Test randomMm returns right counts (0,0,1,0)', () => {
    data = random_major_minor(0, 0, 1, 0);
    expect(data).not.toContain('Major');
    expect(data).not.toContain('Minor');
    expect(data).toContain('Harmonic Minor');
  })

  it('Test randomMm returns right counts (0,0,0,1)', () => {
    data = random_major_minor(0, 0, 0, 1);
    expect(data).not.toContain('Major');
    expect(data).not.toContain('Minor');
    expect(data).not.toContain('Harmonic Minor');
    expect(data).toContain('Melodic Minor');
  })


  it('Test randomMm returns right counts (2,3,4,5)', () => {
    expected_minor = ['Minor', 'Minor'];
    expected_major = ['Major', 'Major', 'Major'];
    expected_harmonic = Array(4).fill('Harmonic Minor');
    expected_melodic = Array(5).fill('Melodic Minor');

    data = random_major_minor(2, 3, 4, 5)
    expect(data).toEqual(expect.arrayContaining(expected_major));
    expect(data).toEqual(expect.arrayContaining(expected_minor));
    expect(data).toEqual(expect.arrayContaining(expected_harmonic));
    expect(data).toEqual(expect.arrayContaining(expected_melodic));
  })
});

describe('teorian_note_to_key converts from', () => {
  it('a5 to {a, _, 5}', () => {
    expected = { 'letter': 'a', 'accidental': '', 'octave': 5 }
    expect(teorian_note_to_key("a5")).toEqual(expected);
  });

  it('a#5 to {a, #, 5}', () => {
    expected = { 'letter': 'a', 'accidental': '#', 'octave': 5 }
    expect(teorian_note_to_key("a#5")).toEqual(expected);
  });
})

describe('Shuffle starting notes', () => {
  const input = ['a', 'b', 'c', 'd'];

  it('returns starting slice if n < options.length', () => {
    var n = 3;
    var expected_size = n;
    var result = shuffled_slice(n, input);

    expect(result.length).toEqual(expected_size);
  });

  it('returns full slice if n = options.length', () => {
    var n = input.length;
    var expected_size = n;
    var result = shuffled_slice(n, input);

    expect(result.length).toEqual(expected_size);
    expect(result).toEqual(expect.arrayContaining(input));
  });

  it('returns multiplex if n > options.length', () => {
    var n = input.length * 2;
    var expected_size = n;
    var expected_result = input.concat(input);
    var result = shuffled_slice(n, input);

    expect(result.length).toEqual(expected_size);
    expect(result).toEqual(expect.arrayContaining(expected_result));
  });

  it('returns empty if options.length == 0', done => {
    var n = 5;
    var expected_size = 0;
    var result = []

    var result = shuffled_slice(n, []);

    expect(result.length).toEqual(expected_size);
    done()
  });
})

describe('Shuffled interval', () => {
  it('returns 4 pairs for n=4 of starting_notes with intervals', () => {
    var n = 4;
    var expected_size = n;
    var starting_notes = ['A4', 'B2'];
    var intervals = ['m7'];
    var mock_interval = function (starting_note, interval) { return { interval: interval, starting_note: starting_note }; }

    var expected_result_sorted = [mock_interval('A4', 'm7'), mock_interval('B2', 'm7'), mock_interval('A4', 'm7'), mock_interval('B2', 'm7')]

    var result = shuffled_intervals(n, starting_notes, intervals);

    expect(result.length).toEqual(expected_size);
    expect(result).toEqual(expect.arrayContaining(expected_result_sorted));
  });

  it('returns 6 pairs for n=6 starting_notes with intervals', () => {
    var n = 6;
    var expected_size = n;
    var starting_notes = ['A4', 'B2'];
    var intervals = ['m7'];
    var mock_interval = function (starting_note, interval) { return { interval: interval, starting_note: starting_note }; }

    var expected_result_sorted = [mock_interval('A4', 'm7'), mock_interval('B2', 'm7'), mock_interval('A4', 'm7'), mock_interval('B2', 'm7')]

    var result = shuffled_intervals(n, starting_notes, intervals);

    expect(result.length).toEqual(expected_size);
    expect(result).toEqual(expect.arrayContaining(expected_result_sorted));
  })
})

describe('Shuffled interval slice', () => {
  it('returns 1 slice for < 6 pairs of starting_notes with intervals', () => {
    var n = 5;
    var expected_size = 1;
    var starting_notes = ['A4', 'B2'];
    var intervals = ['m7'];

    var result = shuffled_interval_slices(n, starting_notes, intervals);

    expect(result.length).toEqual(expected_size);
  });
  it('returns 1 slice for =6 pairs of starting_notes with intervals', () => {
    var n = 6;
    var expected_size = 1;
    var starting_notes = ['A4', 'B2'];
    var intervals = ['m7'];

    var result = shuffled_interval_slices(n, starting_notes, intervals);

    expect(result.length).toEqual(expected_size);
  });
  it('returns 2 slices for >6 pairs of starting_notes with intervals', () => {
    var n = 7;
    var expected_size = 2;
    var starting_notes = ['A4', 'B2'];
    var intervals = ['m7'];

    var result = shuffled_interval_slices(n, starting_notes, intervals);

    expect(result.length).toEqual(expected_size);
  });

  it('returns 2 slices for <12 pairs of starting_notes with intervals', () => {
    var n = 11;
    var expected_size = 2;
    var starting_notes = ['A4', 'B2'];
    var intervals = ['m7'];

    var result = shuffled_interval_slices(n, starting_notes, intervals);

    expect(result.length).toEqual(expected_size);
  });

  it('returns 2 slices for =12 pairs of starting_notes with intervals', () => {
    var n = 12;
    var expected_size = 2;
    var starting_notes = ['A4', 'B2'];
    var intervals = ['m7'];

    var result = shuffled_interval_slices(n, starting_notes, intervals);

    expect(result.length).toEqual(expected_size);
  });

  it('returns 3 slices for >12 pairs of starting_notes with intervals', () => {
    var n = 13;
    var expected_size = 3;
    var starting_notes = ['A4', 'B2'];
    var intervals = ['m7'];

    var result = shuffled_interval_slices(n, starting_notes, intervals);

    expect(result.length).toEqual(expected_size);
  });
})

describe('slice_array', () => {
  it('Returns 1 slice for array < size', () => {
    var array = [1, 2, 3];
    var size = 6;
    var expected_size = 1;

    var slices = slice_array(size, array);

    expect(slices.length).toEqual(expected_size);
  });

  it('Returns 1 slice for array = size', () => {
    var array = [1, 2, 3, 4, 5, 6];
    var size = 6;
    var expected_size = 1;

    var slices = slice_array(size, array);

    expect(slices.length).toEqual(expected_size);
  });

  it('Returns 2 slices for array > size', () => {
    var array = [1, 2, 3, 4, 5, 6, 7];
    var size = 6;
    var expected_size = 2;

    var slices = slice_array(size, array);

    expect(slices.length).toEqual(expected_size);
  });

  it('Returns a first slice of size {size} if array > size', () => {
    var array = [1, 2, 3, 4, 5, 6, 7];
    var size = 6;
    var expected_size = 6;

    var slices = slice_array(size, array);

    expect(slices[0].length).toEqual(expected_size);
  });

  it('Returns a second slice of size 1 if array > size (by one)', () => {
    var array = [1, 2, 3, 4, 5, 6, 7];
    var size = 6;
    var expected_size = 1;

    var slices = slice_array(size, array);

    expect(slices[1].length).toEqual(expected_size);
  });
})