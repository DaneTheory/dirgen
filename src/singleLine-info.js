import guard from 'guard-js';
import _ from 'lodash';

const structureMarker = {
  folder: 47,
  file: 46
};

let singleLineInfoFunctions = {
  setFirstPrev: (linesInfo, currentLine) => {
    if (linesInfo.prevLineInfo === null) {
      linesInfo.prevLineInfo = currentLine;
      //Also set the first actual content line encounter
      linesInfo.firstLine = currentLine;
    }
  },
  setStructureTypeByChar: (currentLine) => {
    //If the line has a slash in front than it is a folder,
    //regardless of whether or not it has periods in its name
    // console.log("currentLine", currentLine.structureName);

    if (_.hasIn(currentLine.nameDetails.specialCharacters, structureMarker.folder)) {
      currentLine.inferType = 'folder';
    } else if (_.hasIn(currentLine.nameDetails.specialCharacters, structureMarker.file)) {
      // console.log("period means a file");
      //if a one or more periods in the name than it is assumed to be a file
      currentLine.inferType = 'file';
    }
  },
  indentation: (linesInfo, currentLine) => {
    if (linesInfo.firstIndentationType === null && currentLine.nameDetails.indentType !== null) {
      linesInfo.firstIndentationType = currentLine.nameDetails.indentType;
      linesInfo.firstIndentationAmount = currentLine.nameDetails.indentAmount;
    }
  },
  compareIndent: guard()
    .when((prevLineIndent, currentLineIndent, linesInfo, currentLine, isFirstLine) => {
      return isFirstLine;
    }, (prevLineIndent, currentLineIndent, linesInfo, currentLine, isFirstLine) => {
      //Assume is file type unless new information comes up
      currentLine.inferType = 'file';
    })
    //Previous line indent is equal to the current line
    .when((prevLineIndent, currentLineIndent) => {
      return prevLineIndent === currentLineIndent;

    }, (prevLineIndent, currentLineIndent, linesInfo, currentLine) => {
      if (linesInfo.prevLineInfo.sibling.length === 0) {

        linesInfo.prevLineInfo.sibling.push(currentLine);
      }
      currentLine.parent = linesInfo.prevLineInfo.parent;
      if (currentLine.parent !== null) {
        currentLine.parent.children.push(currentLine);
      }

      //Set previous line and current line
      //as a file type if uncertain of file type
      //Assume that they are files until new
      //information comes out
      if (_.isUndefined(linesInfo.prevLineInfo.inferType)) {
        linesInfo.prevLineInfo.inferType = 'file';
      }

      if (_.isUndefined(currentLine.inferType)) {
        currentLine.inferType = 'file';
      }

    }).when((prevLineIndent, currentLineIndent) => {
      //Previous line indent is less than current
      return prevLineIndent < currentLineIndent;

    }, (prevLineIndent, currentLineIndent, linesInfo, currentLine) => {
      //Previous line is now known as a parent of the current line
      currentLine.parent = linesInfo.prevLineInfo;
      linesInfo.prevLineInfo.children.push(currentLine);

      currentLine.parent.inferType = 'folder';

      //Assume currentline to be a file, unless proven later on
      if (_.isUndefined(currentLine.inferType)) {
        currentLine.inferType = 'file';
      }

    }).when((prevLineIndent, currentLineIndent) => {
      return prevLineIndent > currentLineIndent;

    }, (prevLineIndent, currentLineIndent, linesInfo, currentLine) => {
      //Use the previous line and navigate back up the levels until the indent level is the same as the current line
      let prevLine = linesInfo.prevLineInfo;
      // console.log("here prevLine", prevLine);

      for (let i = 0; i < linesInfo.contentLineCount; i++) {
        if (prevLine.parent.nameDetails.indentAmount === currentLineIndent) {
          //Same prior level of indent means the prior is
          //a sibling to the current line
          if (prevLine.parent.sibling.length === 0) {
            // console.log("2>>>>>>>>>>> found prior sib from for line ", currentLine.structureName);

            prevLine.parent.sibling.push(currentLine);
            // console.log("prior sib is ", prevLine.parent);
          }
          currentLine.parent = prevLine.parent.parent;

          //Assume currentline to be a file, unless proven later on
          if (_.isUndefined(currentLine.inferType)) {
            currentLine.inferType = 'file';
          }

          break;
        } else {
          //Continue the search by going up the parents
          prevLine = prevLine.parent;
        }
      }
    }).any(() => {
      return;
    }),
  relations: (linesInfo, currentLine, isFirstLine) => {

    // console.log("isFirstLine", isFirstLine);
    //Determine the indentation level
    if (linesInfo.prevLineInfo &&
      linesInfo.contentLineCount > 1 &&
      currentLine.structureName.length > 0 &&
      linesInfo.prevLineInfo.structureName.length > 0) {

      //Check on the characters in the content line to make immediate
      //determination of the structure type
      //This will take care of the relationship
      //that is not determined by indentation
      singleLineInfoFunctions.setStructureTypeByChar(currentLine);

      //TODO: First line still needs its structuretype set

      // console.log("linesInfo.prevLineInfo", linesInfo.prevLineInfo);

      //Check indent level of current line and
      //ignore check for siblings on the first line and blank lines
      singleLineInfoFunctions
        .compareIndent(
          linesInfo.prevLineInfo.nameDetails.indentAmount,
          currentLine.nameDetails.indentAmount, linesInfo, currentLine);

      // prevLineIndent, currentLineIndent, linesInfo, currentLine, contentLineCount
    } else if (linesInfo.contentLineCount === 1 &&
      currentLine.structureName.length > 0 && isFirstLine) {
      //First content line
      singleLineInfoFunctions
        .compareIndent(
          linesInfo.prevLineInfo.nameDetails.indentAmount,
          currentLine.nameDetails.indentAmount, linesInfo, currentLine, isFirstLine);
    }
  },
  updatePrevLine: (linesInfo, currentLine) => {
    linesInfo.prevLineInfo = currentLine;
  }
};

export default singleLineInfoFunctions;