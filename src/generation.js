'use strict';

//Native Nodejs modules
import fs from 'fs';
import path from 'path';

//Vendor modules
import _ from 'lodash';
import normalizePath from 'normalize-path';
import trampa from 'trampa';
import {
  existsAsync,
  mkdirAsync,
  writeFileAsync,
  removeAsync} from 'fs-extra-promise';

import Validations from './validations';

const validator = new Validations();

const createStructure = async function (lineInfo, rootPath, firstContentLineIndentAmount) {
  //lineInfo is a single line

  //Join the path safely by converting all backward
  //slashes to forward slashes
  let structureName = lineInfo.structureName,
    structureRoughPath = path.join(rootPath, structureName),
    structureCreatePath = normalizePath(structureRoughPath);

    validator.repeatedLines(
      lineInfo.structureName,
      lineInfo.sibling);

  if (lineInfo.inferType === 'file') {
    writeFileAsync(structureCreatePath);
  } else {
    //Folder will be the only other structure type
    let parentPath = path.join(rootPath, lineInfo.structureName);

    await mkdirAsync(parentPath);

    //Create children structures if folder has children
    if (lineInfo.children.length > 0) {
      _.each(lineInfo.children, (line) => {
        createStructure(line, parentPath, firstContentLineIndentAmount);
      });
    }
  }

  //Only the top-most level need the siblings generation
  if (!_.isUndefined(lineInfo.sibling) && lineInfo.sibling.length > 0 && firstContentLineIndentAmount === lineInfo.nameDetails.indentAmount) {
    _.each(lineInfo.sibling, (line) => {
      createStructure(line, rootPath, firstContentLineIndentAmount);
    });
  }
};

export
default(linesInfo, rootPath) => {

  (async function dirGen() {
    //Check for root folder
    const hasRootDirAsync = await existsAsync(rootPath);
    if (hasRootDirAsync) {
      //Root folder exists and is to be removed
      await removeAsync(rootPath);
      await mkdirAsync(rootPath);
      createStructure(linesInfo.firstLine, rootPath, linesInfo.firstContentLineIndentAmount);
    } else {
      //No root folder found
      await mkdirAsync(rootPath);
      createStructure(linesInfo.firstLine, rootPath, linesInfo.firstContentLineIndentAmount);
    }
  })();
};