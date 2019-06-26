var vm = require("vm");
var fs = require("fs");

var data = fs.readFileSync(__dirname + '/../conversionMethods.js');
// const script = new vm.Script(data);
// utils = script.runInThisContext();
eval(data+'');

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


test('Test randomMm returns right counts (0,1)', () => {
  data = random_major_minor(0,1);
  expect(data).toContain('Minor');
  expect(data).not.toContain('Major');
})

test('Test randomMm returns right counts (1,0)', () => {
  data = random_major_minor(1, 0);
  expect(data).not.toContain('Minor');
  expect(data).toContain('Major');
})

test('Test randomMm returns right counts (2,3)', () => {
  expected_minor = ['Minor', 'Minor'];
  expcected_major = ['Major', 'Major', 'Major'];

  data = random_major_minor(2, 3)
  expect(data).toEqual(expect.arrayContaining(expected_minor));

  expect(data).toEqual(expect.arrayContaining(expcected_major));
})

// describe('teorian_note_to_key converts from', () => {
//   it('', () => {});
// });

describe('teorian_note_to_key converts from', () => {
  it('a5 to {a, _, 5}', () => {
    expected = {'letter': 'a', 'accidental': '', 'octave': 5}
    expect(teorian_note_to_key("a5")).toEqual(expected);
  });
  
  it('a#5 to {a, #, 5}', () => {
    expected = {'letter': 'a', 'accidental': '#', 'octave': 5}
    expect(teorian_note_to_key("a#5")).toEqual(expected);
  });
})