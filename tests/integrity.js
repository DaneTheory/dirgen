'use strict'

//Native modules
var childProcess = require('child_process'),
  path = require('path');

//Vendor modules
var fs = require('fs-extra-promise'),
  lab = exports.lab = require('lab').script(),
  __ = require('hamjest'),
  _ = require('lodash');

//Path definitions
var cliEntryFile = 'node ' + __dirname +  '/../bin/dirgen-cli-entry.js';

lab.experiment('Cli commands when input is "dirgen" and', function() {

  var exec = childProcess.exec;

  lab.experiment.skip('with no commands or options', function() {
    lab.test('will display the help message', function(done) {
      exec(cliEntryFile, function(error, stdout, stderr) {
        __.assertThat(stdout, __.containsString('Description'));
        done(error);
      });
    });
  });

  lab.experiment.skip('and with the generate command', function() {

    lab.test('and no arguments displays an error message', function(done) {
      exec(cliEntryFile + ' generate', function(error, stdout, stderr) {
        __.assertThat(stdout,
          __.containsString('No file template nor folder destination given.'));
        done(error);
      });
    });

    lab.test('and no arguments, will display the error message', function(done) {
      exec(cliEntryFile + ' generate', function(error, stdout, stderr) {
        __.assertThat(stdout,
          __.containsString('No file template nor folder destination given.'));
        done(error);
      });
    });

    lab.test('using alias command, "g", and no arguments, will display the error message', function(done) {
      exec(cliEntryFile + ' g', function(error, stdout, stderr) {
        __.assertThat(stdout,
          __.containsString('No file template nor folder destination given.'));
        done(error);
      });
    });

    lab.test('using alias command, "gen", and with no arguments will display an error message', function(done) {
      exec(cliEntryFile + ' gen', function(error, stdout, stderr) {
        __.assertThat(stdout,
          __.containsString('No file template nor folder destination given.'));
        done(error);
      });
    });

    lab.test('and invalid template file but no destination folder will display error message', function(done) {
      exec(cliEntryFile + ' generate //', function(error, stdout, stderr) {
        __.assertThat(stdout,
          __.containsString('No folder destination given in second command input.'));
        done(error);
      });
    });

    lab.test('and invalid template file but valid destination folder will display error message', function(done) {
      exec(cliEntryFile + ' generate /zzz ../demo', function(error, stdout, stderr) {
        __.assertThat(stdout,
          __.containsString('Not a valid file. Need a plain text file format in the first'));
        done(error);
      });
    });

    lab.test('and invalid template file and invalid destination folder will display error message', function(done) {
      exec(cliEntryFile + ' generate /zzz ../adsf', function(error, stdout, stderr) {
        __.assertThat(stdout,
          __.containsString('Not a valid file. Need a plain text file format in the first'));
        done(error);
      });
    });

    lab.test('and valid template file but no destination folder will display error message', function(done) {
      exec(cliEntryFile + ' generate ../demo/example.txt', function(error, stdout, stderr) {
        __.assertThat(stdout,
          __.containsString('No folder destination given in second command input.'));
        done(error);
      });
    });

    lab.test('and valid template file but invalid destination folder will display error message', function(done) {
      exec(cliEntryFile + ' generate ' + __dirname + '/../demo/example.txt ../adscd', function(error, stdout, stderr) {
        __.assertThat(stdout,
          __.containsString('Not a valid folder.'));
        done(error);
      });
    });

  });


  /*
    //use the demo test to verify the workings of an actual successful generation
    'and valid template file and valid destination folder will display no error message'

  */

  lab.experiment.skip('and with the information commands', function() {

    lab.test('with help command will display the help message', function(done) {
      exec(cliEntryFile + ' help', function(error, stdout, stderr) {
        __.assertThat(stdout, __.containsString('Description'));
        done(error);
      });
    });

    lab.test('with help alias command, "h", will display the help message', function(done) {
      exec(cliEntryFile + ' h', function(error, stdout, stderr) {
        __.assertThat(stdout, __.containsString('Description'));
        done(error);
      });
    });

    lab.test('with help alias option , "--help" will display the help message', function(done) {
      exec(cliEntryFile + ' --help', function(error, stdout, stderr) {
        __.assertThat(stdout, __.containsString('Description'));
        done(error);
      });
    });

    lab.test('with help alias option , "-h" will display the help message', function(done) {
      exec(cliEntryFile + ' -h', function(error, stdout, stderr) {
        __.assertThat(stdout, __.containsString('Description'));
        done(error);
      });
    });

    lab.test('with version command produces the same version number as in the package.json file', function(done) {
      exec(cliEntryFile + ' version', function(error, stdout, stderr) {

        var packageJsonPath = path.resolve(__dirname, '../package.json'),
          versionNumber = require(packageJsonPath).version
                            .replace(/version /i, '');

        __.assertThat(stdout, __.containsString(versionNumber));
        done(error);
      });
    });

    lab.test('with version command will display the module information message', function(done) {
      exec(cliEntryFile + ' version', function(error, stdout, stderr) {
        __.assertThat(stdout, __.containsString('Dirgen v'));
        done(error);
      });
    });

    lab.test('with version alias command, "v", will display the module information message', function(done) {
      exec(cliEntryFile + ' v', function(error, stdout, stderr) {
        __.assertThat(stdout, __.containsString('Dirgen v'));
        done(error);
      });
    });

    lab.test('with version alias option , "--version" will display the module information message', function(done) {
      exec(cliEntryFile + ' --version', function(error, stdout, stderr) {
        __.assertThat(stdout, __.containsString('Dirgen v'));
        done(error);
      });
    });

    lab.test('with version alias option , "-v" will display the module information message', function(done) {
      exec(cliEntryFile + ' -v', function(error, stdout, stderr) {
        __.assertThat(stdout, __.containsString('Dirgen v'));
        done(error);
      });
    });
  });

lab.experiment.skip('and with the demo command', function() {
  lab.test('with "demo" command will create the example folder', function(done) {
    exec(cliEntryFile + ' demo', function(error, stdout, stderr) {

      fs.isDirectoryAsync(__dirname + '/../demo/example-output').then(function(resolve, error) {
        __.assertThat(error, __.is( __.undefined()));
        done(error);
      }, function(error) {
        __.assertThat(error, __.is( __.not(__.defined())));
        done(error);
      });

    });
  });

  lab.test('with "demo" command after successfully created files and folders, will log out the generation time', function(done) {
    exec(cliEntryFile + ' demo', function(error, stdout, stderr) {
      __.assertThat(stdout, __.containsString('Generation Time'));
      done(error);
    });
  });

  lab.test('with "demo" command will create the files and folders that will match the demo template file', function(done) {
    exec(cliEntryFile + ' demo', function(error, stdout, stderr) {
      var readType = {
        file: 'existsAsync',
        folder: 'isDirectoryAsync'
      }

      var expectedDemoPaths = require(path.resolve(__dirname +  '/fixtures/demo-structure-output.js'));

      var keyCount = _.keys(expectedDemoPaths).length;
      var structureCheckCount = 0;
      var doneCheck = function(keyCount, structureCheckCount, done, error) {
        if(keyCount === structureCheckCount) {
          done(error);
        }
      }

      for (var key in expectedDemoPaths) {

        //File defined in fixture sanity check
        __.assertThat(expectedDemoPaths[key], __.is( __.not(__.undefined())));

        //Check the file type of the structure
        fs[readType[expectedDemoPaths[key]]](__dirname + '/../demo' + key ).then(function(resolve, error) {
          structureCheckCount++;
          __.assertThat(error, __.is( __.undefined()));
          doneCheck(keyCount, structureCheckCount, done, error);
        }, function(error) {
          structureCheckCount++;
          __.assertThat(error, __.is( __.not(__.defined())));
          doneCheck(keyCount, structureCheckCount, done, error)
        })
      }

    });
  });

});


  /*

  file generate
  file integrity checks
    -number of file and folder count is the same as the number of items in the file
    -name and type should reflect the file after sanitization
    -nesting checks

  */
  lab.experiment('and with the generate command scenarios', function() {

    lab.test('basic nesting with parent and child', function(done) {
      done();
    });

    lab.test('and file sanitizing replacing only one slash will display a warning message', function(done) {
      done();
    });

    lab.test('and file sanitizing with additional slashes will prevent creation and will display a warning message', function(done) {
      done();
    });

    lab.test('and file sanitizing with problematic names for oses will display a warning message', function(done) {
      done();
    });

    lab.test('and with repeated lines in the same level will display a warning message', function(done) {
      done();
    });

    lab.test('and with mixing indent type of spaces and tabs will display an error message', function(done) {
      done();
    });

    lab.test('and with inconsistent indent scaling factor will display an error message', function(done) {
      done();
    });

    lab.test('and with length of name of file or folder exceeding 255 characters will display an error message', function(done) {
      done();
    });

    lab.test('and with nothing in a template file will display an error message', function(done) {
      done();
    });

  });


});

