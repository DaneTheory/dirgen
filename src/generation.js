'use strict';

//Native modules
import path from 'path';

//Vendor modules
import normalizePath from 'normalize-path';
import recursive from 'tail-call/core';
import {
  fs,
  existsAsync,
  mkdirAsync,
  writeFileAsync,
  removeAsync,
  statAsync
} from 'fs-extra-promise';
import co from 'co';

//Source modules
import Validations from './lines-validations';
import message from './validations-messages';
import logValidations from './log-validations';

const validator = Validations;
const tailCall = recursive.recur;

//Log the lines that are not generated due to repeats
const structureCreation = {
  generated: 0,
  notGenerated: 0,
  repeats: [],
  skipped: 0
};

const generationResolver = (structureCreation, contentLineCount, resolve) => {

  if (structureCreation.generated +
    structureCreation.notGenerated + structureCreation.skipped ===
    contentLineCount) {
    resolve(structureCreation);
  }
};

const logNonGenerated = tailCall((linesInfo, structureCreation,
  line, validationResults) => {
  structureCreation.notGenerated += 1;

  const isTopLine = line.isTopLine;

  //Log what is the originating first folder that was
  //not generated
  if (isTopLine) {
    line.firstNonGen = true;
    logValidations(validator.repeatedLines(linesInfo,
      structureCreation, line), validationResults);
  } else if ((line.childOfNonGen !== true &&
      line.parent.firstNonGen !== true)) {
    logValidations(validator.repeatedLines(linesInfo,
      structureCreation, line), validationResults);
  }

  //Repeated lines with further nesting also gets recorded
  if (line.children.length > 0) {
    const nonGeneratedChildren = line.children;
    nonGeneratedChildren.forEach((line) => {
      line.childOfNonGen = true;
      logNonGenerated(linesInfo, structureCreation,
        line, validationResults);
    });
  }
});

//Convert createStructure into a tail recursive function
let createStructureTC = null;
const createStructure = (linesInfo, lineInfo, rootPath,
  contentLineCount, validationResults, options, resolve, genFailures) => {

  const {
    structureName,
    inferType,
    nameDetails,
    isTopLine,
    childRepeatedLine,
    repeatedLine
  } = lineInfo;

  const name = nameDetails.sanitizedName ||
    structureName,
    structureRoughPath = path.join(rootPath, name),
    structureCreatePath = normalizePath(structureRoughPath);


  if (inferType === 'file') {
    if (!childRepeatedLine && !repeatedLine) {

      //Track the first of the line's repeats
      if (isTopLine) {
        linesInfo.topLevelIndex[structureName] = lineInfo.nameDetails.line;
      }

      //Create the file type
      const fileCreate = co.wrap(function* wrapFileCreate() {

        try {

          //File already exist situation mean it does not error out
          const fileStat = yield statAsync(structureCreatePath);

          //Overwrite existing files when the flag is provided
          if (options.forceOverwrite) {
            yield writeFileAsync(structureCreatePath, '');
            structureCreation.generated += 1;
          } else if (fileStat) {
            //Skip generating file
            structureCreation.skipped += 1;
          }

          generationResolver(structureCreation, contentLineCount, resolve);
        } catch (e) {

          //Create the file when there is a stat error
          //this means that the folder did not exists
          if (e.syscall === 'stat') {

            // console.log("write the file ", structureCreatePath);

            //Create the file when it does not exists
            yield writeFileAsync(structureCreatePath, '');
            structureCreation.generated += 1;

            //When all generated structures are created with the non-generated
            //structures ignored, signifies that the generation process comes to
            //an end
            generationResolver(structureCreation, contentLineCount, resolve);
          } else {

            //Any other error means besides stat means it is a serious error
            // message.error(`Generation error has occurred with file on
            //Line #${lineInfo.nameDetails.line}: ${structureName}.`);

            genFailures.push(`Generation error has occurred with file on Line
               #${lineInfo.nameDetails.line}: ${structureName}.`);

            //Failure to generate will be defined as a skip
            structureCreation.skipped += 1;
          }
        }
      });

      co(function* coFileCreate() {
        try {
          yield fileCreate();
        } catch (error) {
          console.log('File creation error:', error);
        }
      });

    } else {
      logNonGenerated(linesInfo, structureCreation,
        lineInfo, validationResults);
    }
  } else {
    const parentPath = path.join(rootPath,
      (nameDetails.sanitizedName || structureName));

    let genFolder = false;

    //Track the first of the line's repeats
    if (!repeatedLine && isTopLine) {
      linesInfo.topLevelIndex[structureName] = lineInfo.nameDetails.line;
    }

    //Only generate folder if it is not a repeat
    //Top level lines record repeats with only 'repeatedLine' while
    //child level lines repeats possess the 'repeatedLine' key
    if (!childRepeatedLine && !repeatedLine) {
      genFolder = true;

      //Create the folder
      const folderCreate = (function* genFolderCreate() {
        try {

          const fileStat = yield statAsync(parentPath);

          //Overwrite existing folder when the flag is provided
          if (options.forceOverwrite) {
            yield mkdirAsync(parentPath);
            structureCreation.generated += 1;
          } else if (fileStat) {
            // Skip folder generation
            structureCreation.skipped += 1;
          }

          //When all generated structures are created with the non-generated
          //structures ignored, signifies that the generation process comes to
          //an end
          generationResolver(structureCreation, contentLineCount, resolve);
        } catch (e) {

          if (e.syscall === 'stat') {

            //Create the file when it does not exists
            yield mkdirAsync(parentPath);
            structureCreation.generated += 1;

            //When all generated structures are created with the non-generated
            //structures ignored with skips accounted for, signifies
            //that the generation process comes to an end
            generationResolver(structureCreation, contentLineCount, resolve);
          } else {

            genFailures.push(`Generation error has occurred with folder on Line
               #${lineInfo.nameDetails.line}: ${structureName}.`);

            //Failure to generate will be defined as a skip
            structureCreation.skipped += 1;
          }

        }
      });

      co(function* coFolderCreate() {
        try {
          yield folderCreate();
        } catch (error) {
          console.log('Folder creation error:', error);
        }
      });


    }

    const nonGenFolder = !genFolder && (repeatedLine || childRepeatedLine);

    //Ungenerated folder means a repeated line, but still attempt
    //to record the nested child of the repeated line
    if (nonGenFolder) {
      logNonGenerated(linesInfo, structureCreation, lineInfo, validationResults);
    } else if (lineInfo.children.length > 0) {

      //Checks for non-repeated folder
      lineInfo.children.forEach((line) => {

        //Again check for repeated lines in the child level lines
        if (typeof lineInfo.childRepeatedLine === 'undefined' &&
        typeof line !== 'undefined') {
          createStructureTC(linesInfo, line, parentPath,
            contentLineCount, validationResults, options,
            resolve, genFailures);
        }
      });
    }

  }

};

//Tail call wrapper
createStructureTC = tailCall(createStructure);

//Top level lines kick off and for later child structure creation
function startCreatingAtTopLevel(linesInfo, rootPath,
  validationResults, actionParams, contentLineCount, options,
  resolve, genFailures) {
  //Take the outer-most level of elements which
  //serves as the initial generation set
  for (let i = 0; i < contentLineCount; i++) {
    const topLevelLine = linesInfo.topLevel[i];
    if (typeof topLevelLine !== 'undefined') {
      createStructureTC(linesInfo, topLevelLine, rootPath,
        contentLineCount, validationResults, options, resolve, genFailures);
    }
  }
}

export default (linesInfo, rootPath, validationResults,
  actionParams, genFailures) => {

  //Flag definition to allow for changing the defaults values such
  //as allowing for overwriting existing files or folders
  const options = actionParams ? actionParams.options : {};

  //The total number of lines that are possible to generate
  const contentLineCount = linesInfo.contentLineCount;
  return new Promise((resolve, reject) => {

    const startGen = co.wrap(function* coStartGen() {

      //Remove all folders and files in the top level
      //of the template file
      //This will ensure that all generated files are new leading
      //to "overwriting"
      if (options && options.forceOverwrite) {
        let stat;
        try {
          for (let i = 0; i < contentLineCount; i++) {
            const topLevelLine = linesInfo.topLevel[i];

            if (typeof topLevelLine !== 'undefined') {
              const {
                nameDetails,
                structureName
              } = topLevelLine;

              const parentPath = path.join(rootPath,
                (nameDetails.sanitizedName || structureName));

              stat = yield statAsync(parentPath);

              if (stat.isDirectory() || stat.isFile()) {
                yield removeAsync(parentPath);
              }
            }
          }

          startCreatingAtTopLevel(linesInfo, rootPath, validationResults,
             actionParams, contentLineCount, options, resolve, genFailures);
        } catch (e) {
          const statUndefined = typeof stat === 'undefined';

          //when stat is "undefined", create the structure,
          //because it does not exists
          if (statUndefined || !statUndefined) {

            //When stat is undefined means it does not exist so create it
            //When it is not undefined, stat is reading the first copy
            startCreatingAtTopLevel(linesInfo, rootPath, validationResults,
               actionParams, contentLineCount, options, resolve, genFailures);
          }

        }
      } else {

        //Go ahead with the writing of files and folders

        //Take the outer-most level of elements which
        //serves as the initial generation set
        startCreatingAtTopLevel(linesInfo, rootPath, validationResults,
           actionParams, contentLineCount, options, resolve, genFailures);
      }
    });

    co(function* coStartGen() {
      try {
        yield startGen();
      } catch (error) {
        console.log('Start generation error:', error);
      }
    });
  });
};
