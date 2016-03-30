'use strict';

//Vendor modules
import _ from 'lodash';

//Source modules
import message from './messages';

let validator = () => {};

//validator.<rule>(<data>, <callback>, <callback arguments>)
Object.assign(validator.prototype, {
  presenceFirstLine: (firstLine, callback, callbackArgs) => {

    if (!_.isNull(firstLine)) {
      callback.apply(null, callbackArgs);
    } else {
      message.error('Supplied template file has no content to generate.');
    }
  },
  properIndentLevel: (lineNum, content, firstIndentAmt, prevLineIndentAmt, currentIndentAmt,
  firstIndentType, currentIndentType, indentType) => {
    if(indentType === 'outdent') {
      console.log("outdented string");
      return;
    }
    //Scaling indent factor and firstIndent is the same
    if (!(Math.abs(currentIndentAmt - prevLineIndentAmt) ===
       firstIndentAmt)) {
      // console.log("on line", lineNum);
      // console.log("not allowed indenting factor");
      message.error(`Line #${lineNum}:
         '${content.trim()}', has an indent
         amount of ${Math.abs(currentIndentAmt - prevLineIndentAmt)} ${currentIndentType}(s) relative to parent folder,
         which is different from the
         first defined indent amount of ${firstIndentAmt} ${firstIndentType}(s).`);
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