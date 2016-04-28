'use strict';

console.time('Command Line Execution Time');

//Native modules
import fs from 'fs';

//Vendor modules
import nash from 'nash';
import path from 'path';
import isTextPath from 'is-text-path';

//Execution directory gives the proper path for the demo examle
const rootModulePath = path.resolve(__dirname, '../');
const cli = nash();
const cliArgs = process.argv;

const helpText = `
  \x1B[1m Description: \x1B[22m

    Generate files and folders from a template file.

  \x1B[1m Usage: \x1B[22m

    dirgen [command] [command parameters] [options]

  \x1B[1m Command: \x1B[22m           \x1B[1m Command Parameters: \x1B[22m
   (Alias)

    generate             <template> (required)
    (g | gen)             The text file provided for generation
                          Ex: "/some-directory/my-file-template.txt"

                         <output directory> (required)
                          The destination location where the generated files
                          or folder should go.

    demo                 N/A
                          Shows an example of how a template file is used
                          to generate files and folder inside the /demo folder
                          of the Dirgen NPM module.

    version              N/A
    (v)                   Display what is the edition of this module.
                        `;

//Timer End for cli execution
const timeEnd = function(done) {
  done(console.timeEnd('Command Line Execution Time'));
};

//Create files or folders
cli
  .command('generate')
  .name('g', 'gen')
  .handler(function (data, flags, done) {

    //Quit early when not enough arguments are provided
    const commandArgsLen = data.length;
    if (commandArgsLen === 0) {
      console.error('No file template nor folder destination given.');
      return;
    } else if (commandArgsLen === 1) {
      console.error('No folder destination given.');
      return;
    }

    Promise.all([
      //Check for file template
      new Promise(function(resolve, reject){
        fs.stat(data[0], function(error){
          if (error) {
            console.error("Not a valid file.");
            return reject({ file: false });
          } else {

            //Check for text file
            if (!isTextPath(data[0])) {
              timeEnd(done);
              console.error("Not a valid template file.");
              return;
            }
            return resolve({ file: true });
          }
        });
      }),

      //Check for folder
      new Promise(function(resolve, reject){
        fs.stat(data[1], function(error){
          if (error) {
            console.error("Not a valid folder.");
            return reject({ folder: false });
          } else {
            return resolve({ folder: true });
          }
        });
      })
    ]).then(function(values) {
      eval(1 + 1);
      require('../src/dirgen').default('generate',
      { template: data[0], output: data[1] });
      timeEnd(done);
    }, function() {});
  });

//Show an example of how the module is used
cli
  .command('demo')
  .handler(function (data, flags, done) {
    require('../src/dirgen').default('demo');
    timeEnd(done);
  });

//Get assistance on the command use of this module
cli
  .command('help')
  .name('h')
  .handler(function (data, flags, done) {
    console.log(helpText);
    done(console.timeEnd('Command Line Execution Time'));
  });

//Option --help is an alias for command 'help'
if(cliArgs[2] === '--help' || cliArgs.length === 2) {
  cli.run(['', '', 'help'], function () {});
}

//Get the version from the package.json file
let packageJson = null;
cli
  .command('version')
  .name('v')
  .handler(function (data, flags, done) {
    console.log(`Dirgen v${packageJson.version}`);
    done(console.timeEnd('Command Line Execution Time'));
  });

//Read the version from package.json
fs.readFile(`${rootModulePath}/package.json`, "utf-8", function (err, data) {
  try {

    packageJson = JSON.parse(data);

    if(cliArgs[2] === '--version') {
      cli.run(['', '', 'version'], function () {});
    }
  } catch (e) {
    console.error('Read error on JSON file:', e);
  }
});

const commands = ['generate', 'g', 'gen',
                  'demo', 'version', 'v', 'help', 'h' ];

//Non-matching commands will trigger the help doc
if(commands.indexOf(cliArgs[2]) < 0 && cliArgs.length > 2) {
  console.log(`Dirgen: '${cliArgs[2]}' is not a recognized command. Type 'dirgen --help' for a list of commands.`);
}

//Need this line for the commands to work
cli.run(cliArgs, function () {});