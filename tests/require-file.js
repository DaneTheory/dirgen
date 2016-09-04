module.exports = function(__, lab, cliEntryFile, exec, path) {

  var proxyquire = require('proxyquire');

  lab.test('will not error out with valid template file and output directory', function(done) {

    // var dirgen =  proxyquire('../node_modules/dirgen/bin/dirgen-cli-entry', {});
    // dirgen.generate({
    //   template: '',
    //   output: '',
    //   options: { hideMessages: true }
    // });

    done();
  });

  lab.test('will error out with invalid template file',
  function(done) {
    done();
  });

  lab.test('will error out with invalid output directory',
  function(done) {
    done();
  });

  lab.test('will not error out without any "options" defined ', function(done) {
    done();
  });

  lab.test('will not error out with valid option "force"', function(done) {
    done();
  });

  lab.test('will not error out with valid boolean value for "force"', function(done) {
    done();
  });

  lab.test('will error out with invalid non-boolean value for "force"', function(done) {
    done();
  });

  lab.test('will not error with valid option "silent"',
  function(done) {
    done();
  });

  lab.test('will error out with invalid non-boolean value for "silent"', function(done) {
    done();
  });



};