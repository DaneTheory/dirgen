

// require('lab').script();
// var __ = require('hamjest');

var childProcess = require('child_process'),
  path = require('path');

var bin = path.resolve(__dirname, '../bin/'),
  cliEntry = bin + '/dirgen-cli-entry.js';

var exec = childProcess.exec;
var cli = exec('node ../dirgen/bin/dirgen-cli-entry.js' );

cli.stdout.on('data', (data) => {
  console.log('stdout:', data);
});

cli.stderr.on('data', (data) => {
  console.log('stderr:', data);
});

cli.once('close', (data) => {
  console.log('close: ', data);
});
