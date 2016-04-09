'use strict';

//Vendor modules
import _ from 'lodash';
import sanitize from 'sanitize-filename';

//Source modules
import message from './messages';

let validator = () => {};

//validator.<rule>(<data>, <callback>, <callback arguments>)
Object.assign(validator.prototype, {
  repeatedLines: (lineNum, children) => {
    let childStructureNames = new Map();
    let structureName = null;
    _(children).each((val) => {
      //Child structure name
      structureName = val.structureName;
      let childLineNum = val.nameDetails.line;
      //Push to the array of collected repeats
      if (childStructureNames.has(val.structureName)) {
        childStructureNames.set(childStructureNames.get(val.structureName).push(childLineNum));
        let repeatedEntries = childStructureNames.get(val.structureName);
        //Send the message after saving the repeated value
        message.warn(`Line #${repeatedEntries[0]}: '${structureName}', has repeated entries on
        line(s): ${repeatedEntries.slice(1)}.
        The last repeated value line overwritten all previous entries.`);
      } else {
        //Initialize the array for the first child found
        childStructureNames.set(val.structureName, [childLineNum]);
      }
    });
  },
  cleanFileName: (lineNum, content) => {
    let cleanedName = sanitize(content);
    if (cleanedName !== content) {
      message.warn(`Line #${lineNum}:
        '${content.trim()}', has illegal characters
        which has been replaced, resulting in '${cleanedName}'.`);
    }
  },
  sameIndentType: (lineNum, content,
  firstIndentType, currentIndentType) => {
    //Protect against null, which signifies no indent level
    if (!_.isNull(currentIndentType) &&
     currentIndentType !== firstIndentType) {
      throw (message.error(`Line #${lineNum}:
         '${content.trim()}',
         has indent type of '${currentIndentType}'
         which is inconsistent with the first defined outdent type of '${firstIndentType}'.`));
    }
  },
  presenceFirstLine: (firstLine, callback, callbackArgs) => {

    if (!_.isNull(firstLine)) {
      callback.apply(null, callbackArgs);
    } else {
      message.error('Supplied template file has no content to generate.');
    }
  },
  properIndentLevel: (lineNum, content, firstIndentAmt, prevLineIndentAmt, currentIndentAmt,
  firstIndentType, currentIndentType, indentType) => {
    //TODO: pretty error needs to stop execution outright
    if (indentType === 'outdent' &&
    !(currentIndentAmt % firstIndentAmt === 0) &&
    !(currentIndentAmt >= firstIndentAmt)) {
      // console.log(`Line num: ${lineNum}` + "outdented string");
      throw (message.error(`Line #${lineNum}:
         '${content.trim()}', has indent amount of ${currentIndentAmt} ${currentIndentType}(s) which is inconsistent with the
         first defined outdent of ${firstIndentAmt} ${firstIndentType}(s).`));
    }
    // console.log("lineNum", lineNum);
    // console.log("now currentIndentAmt", currentIndentAmt);
    //Scaling indent factor and firstIndent is the same
    if (indentType !== 'outdent' && !(Math.abs(currentIndentAmt - prevLineIndentAmt) ===
       firstIndentAmt)) {
      // console.log("on line", lineNum);
      // console.log("not allowed indenting factor");
      throw (message.error(`Line #${lineNum}:
         '${content.trim()}', has an indent
         amount of ${Math.abs(currentIndentAmt - prevLineIndentAmt)} ${currentIndentType}(s) relative to parent folder,
         which is different from the
         first defined indent amount of ${firstIndentAmt} ${firstIndentType}(s).`));
    }
  },
  charCountUnder255: (count, lineNum, content, inferType) => {
    if (count > 255) {
      message.warn(`Line #${lineNum}: '${content}', has a character
        count of ${count}, which exceeds 255. ${inferType.charAt(0).toUpperCase() +
        inferType.slice(1)} was not created.`);
    }
  }
});

export default validator;