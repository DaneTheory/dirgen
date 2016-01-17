'use strict';

console.time('timer');

//Native Nodejs modules
import readline from 'readline';
let fs = require('fs');

//Vendor modules
let unlimited = require('unlimited');
unlimited(10000);
let PrettyError = require('pretty-error');

//Source modules
let AddLinesInfo = require('./lines-info.js');
let addLinesInfo = new AddLinesInfo();
let Lexer = require('./lexer.js');
console.log("lexer is ", Lexer);

const lexer = new Lexer();
let validator = require('./validations.js');

//Track the status of the lines
let linesInfo = {
    previousValue: null,
    currentValue: null,
    contentLineCount: 0,
    totalLineCount: 0,
    firstIndentationType: null,
    firstIndentationAmount: null
  },
  prevLineInfo = null;

//Read through all the lines of a supplied file
readline.createInterface({
    input: fs.createReadStream('/Users/williamhuey/Desktop/Coding/JavaScript/npm-modules/dirgen/src/test.txt')
  })
  .on('line', line => {

    //Accumulate general information lines
    addLinesInfo.setGeneralData(line, linesInfo);

    //Get properties from the current line in detail with
    //the lexer and use this object when performing checks
    //with subsequent lines
    let currentLine = {
      structureName: linesInfo.currentTrimmedValue,
      siblings: null,
      parent: null,
      children: null,
      nameDetails: lexer.lex(line)
    };

    // console.log("lexResults", currentLine.nameDetails);

    //Get the information from prior lines to determine
    //the siblings, parent, and children key values
    addLinesInfo.setLineData(currentLine, prevLineInfo);



    //Validate the recently set line data


    console.log("process the line");

    //Save the line data object reference for future comparison
    //by updating previous value with current


  })
  .on('close', function() {
    console.log('closing the file');
    //
    // console.log("validator ", validator);
    // console.log("linesInfo", linesInfo);
    //Start generating the folders based on the b-tree
  });

console.timeEnd('timer');