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
  properIndentLevel: (lineNum, content, firstIndent, prevLineIndent, currentIndent, requireIndentFactor) => {
    if (!requireIndentFactor) {
      console.log("prevLineIndent", prevLineIndent);
      console.log("currentIndent", currentIndent);
      console.log("firstIndent",firstIndent);
      if (currentIndent - prevLineIndent === firstIndent) {
        console.log("appropriate indenting factor");
      } else {
        console.log("not allowed indenting factor");
      }
      //validator needs to be here
    }

  },
  charCountUnder255: (count, lineNum, content, inferType) => {
    if (count > 255) {
      message.warn(`Line #${lineNum}: ${content}, has a character
        count of ${count}, which exceeds 255. ${inferType.charAt(0).toUpperCase() +
        inferType.slice(1)} was not created.`);
    }
  }
});

export default validator;