# Overview:

Generate files and folders from a template file.

## Example:

Create a text file with the following contents and
give it a name of 'the-template-file.txt':

Template:
  gsdf
    afsd
  //sd,ss
  dfg
    jj
    ygvhg
      dsd
    ygvhg
  /fsfa
  /fsfa

Command Line Usage:

``` bash
dirgen g 'the-template-file.txt' '/where-you-want-output-folder'
```

'Require' Usage:

The following is an equivalent to the above but is
'require' as a module in a JavaScript file

``` js
import dirgen from 'dirgen';

dirgen({
  template: 'the-template-file.txt',
  output: '/where-you-want-output-folder'
  /*
  OPTIONAL
  (following two keys below are command options and
  are opposite of their default value)

  hideMessages: true,
  forceOverwrite: false

  */
});
```

Console output:

 Warning: Line #3: '//sd,ss', has illegal characters which has been
  replaced, resulting in 'sd,ss'.

 Warning: Line #8: 'ygvhg', of file type is a repeated line and was
 not generated. First appearance of sibling is on line #6.

 Warning: Line #10: '/fsfa', of folder type is a repeated line and
 was not generated . First appearance of sibling is on line #9.

 Template info: 10 total lines (10 content, 0 blanks)
 Template read: 0 errors and 3 warnings
 Creation count: 8 generated, 2 not generated, 0 skipped
 Generation failures: 0 write errors
 Write time: 35262057 nanoseconds

# Details:

## Template file:

Template files provide the heirarchy of structure which explains the
nesting of files and folders. Template files are plain textual files.

Indentation:
  Determines what file or folder types should be on the same folder level.
  Same indentation level between two lines means that the lines
  are siblings assuming that the two have the same parent.

  White space characters such as tabs or spaces define the indentations.
  However, only one type of white space character can be used at
  any one time in a single template file.

Lines:
  All non-blank lines will be counted towards the generation if the line
  is valid for generation.

Structure Type:
  File:
    A content line without a folder marker (forward slash) will be
    identified as a file line and if it has not been skipped.

    Example:
      a-file
      a-file-with-an-extension.someextension

  Folder:
    A content line with a folder marker (forward slash) at the
    beginning of the line will be identified as a folder type.
    A folder line can also be signified with having a later line
    with a greater indent than the folder line.

    Example:
      /a-folder

      or

      a-folder
        child-with-greater-indentation

# Terminologies:

  Template info:

    Content:
      Lines that have characters which are non-white space. These line
      may or may not be generated.

    Blanks:
      Lines that are white-space only characters or has not characters
      at all. These lines are never generated.

  Template read:

    Errors:
      Upon one or more error, there will be no
      generated file or folders.

    Warnings:
      Warning lines that are correctable such as having non-permissible
      characters can be sanitized and generated, but incorrect lines
      such as duplicated line content will be not be generated.

  Creation count:

    Generated:
      Lines that were read that were successfully created

    Not generated:
      Lines that produced a warning that may or may
      not have been generated.

    Skipped:
      Lines that were skipped because they already exists. By default
      existing files and folders are not overwritten to prevent data lost.

    Generated, Not generated, and Skipped counts total up to the
    total line count of the template file.

  Generation failures:
    Failures occurs when a valid line creation attempt did not go through.
    The generation failures counts towards the "Skipped" of
    "Creation count".

  Write time:
    The time taken to write all the files and folders. Will yield "0" when
    at least one error has occurred on reading the template file because
    nothing will be generated.

## Demo:

For a demo of Dirgen, run 'dirgen demo' on the command line
and look at the output in the 'demo/example-output' folder
under the root of the Dirgen module folder.

## CLI Usage:

dirgen [command] [command parameters] [options]

## Command:             Command Parameters:
(Alias below)        (in respective order)

 generate             <template> (required)
 (g | gen)             The text file provided for generation
                       Ex: "/some-directory/my-file-template.txt"

                      <output directory> (required)
                       The destination path for where the generated files
                       or folder should go.

 demo                 N/A
                       Shows an example of how a template file is used
                       to generate files and folder inside the /demo folder
                       of the Dirgen NPM module.

 version              N/A
 (v)                   Display what is the edition of this module.

## Options:

  -f                  Overwrite files and directory even if they already
                      exist. Default behavior without this option does not
                      forcibly overwrite content as a safety measure.

  -s                  Suppress the actual warnings and errors messages from
                      showing up on the console. The count of warnings and
                      errors will still be shown in the generation output
                      information.

