/**
 * Object containing constant values used throughout the program.
 */
const versionCheckerConsts = {
  MAX_FILES: 15,
  STARTING_COLUMN_NO: 1,
  CONTINUE_TOKEN_NAME: "CONT_TOKEN",
  MIME_TYPES_TO_EXCLUDE: [
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.spreadsheet",
    "application/vnd.google-apps.presentation"],
  PROGRAM_COMPLETE_MESSAGE: "Finished running through those Drive files!",
};

/**
 * Writes an array of strings on a row-per-row basis in the open sheet. In this 
   program, used to write the name and mime type of each multi-version file to the sheet.
 * @param {Array} itemArray 2D Array of strings to write to the active sheet.
 * @param {integer=} startingColumnNo Optional integer representing the column to begin with
  (i.e. column E would be 5). Default value is 1.
 */
function write2DArrayToSheet(itemArray, startingColumnNo = 1){  
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rowToWrite = activeSheet.getLastRow() + 1;

  for (let item in itemArray){
    let columnIterable = startingColumnNo;
    let i = itemArray[item];
    
    for (let j in i){
      // i[j] is the inner string
      activeSheet.getRange(rowToWrite, columnIterable).setValue(i[j]);
      columnIterable += 1;
    }
    rowToWrite += 1;
  };
};

/**
 * Checks the user's Drive files for any files with more than one version. Excludes files where
 * the user is not the owner, and where the Mime type is in the excluded list included in 
   versionCheckerConsts.
 * @param {File Iterator} driveFileIterator File Iterator containing the user's Drive files.
 * @return {Array} When the program has processed the number of files defined in the MAX_FILES
   value in versionCheckerConsts, returns an array of Google Files containing more than one version.
 */
function checkDriveForMultiVersionFiles(driveFileIterator){   
  var len;
  var myFile;
  var filesProcessed = 0;
  var activeUserEmail = Session.getActiveUser().getEmail();
  var multiVersionFileArray = [];

  while (driveFileIterator.hasNext()) {
    myFile = driveFileIterator.next();

    try {
      if (myFile.getOwner()){
        if (myFile.getOwner().getEmail() === activeUserEmail){
        len = Drive.Revisions.list(myFile.getId()).items.length;
        if (len > 1 && 
          !(versionCheckerConsts.MIME_TYPES_TO_EXCLUDE.includes(myFile.getMimeType()))){
          multiVersionFileArray.push(myFile);
          };
        }; 
      };        
    } catch (e){
      Logger.log(e);
      continue;
    };
    
    filesProcessed += 1;
    if (filesProcessed >= versionCheckerConsts.MAX_FILES) {
      return multiVersionFileArray;
    };
  };
};

/**
 * Give an array of Files, returns a 2D array of pairs of strings containing
   the file name and Mime type.
 * @param {Array} Array of Google Files.
 * @return {Array} 2D array containing paired strings of the name and Mime type
   for each file.
 */
function getNameAndMimeTypeFromFiles(fileArray){
  var outerArray = [];
  var innerArray;

  for (let file in fileArray){
    let i = fileArray[file];
    innerArray = [];
    innerArray.push(i.getName());
    innerArray.push(i.getMimeType());
    outerArray.push(innerArray);
  };

  return outerArray;
};

/**
 * Retrieves the File Iterator for the user's Drive, containing each of their
 * files. 
 * @param {string} contTokenArg Optional string acting as a key to continue
   a previously-started File Iterator. Used for repeat runs of the program when
   the user's files exceed the MAX_FILES value in versionCheckerConsts. Recommended
   to not go over a MAX_FILES of 20; user would run the risk of program exceeding
   max execution time.
 * @return {File Iterator} File Iterator containing each of the files in the user's Drive. 
 */
function getDriveFileIterator(continueTokenArg){   
  return (continueTokenArg ? allFiles = DriveApp.continueFileIterator(continueTokenArg) : 
    allFiles = DriveApp.getFiles());
};

/**
 * Executes the functions above to check all files in a user's Drive. The names
 * of these files, along with their Mime type, are then written to the active sheet
 * in the parent spreadsheet. 
 */
function versionCheckMain() {   
  var scriptProperties = PropertiesService.getScriptProperties(); 
  var continueToken = scriptProperties.getProperty(versionCheckerConsts.CONTINUE_TOKEN_NAME);
  var allFiles = getDriveFileIterator(continueToken);
  var multiVersionFiles;
  var nameAndMimeArray;

  try{
    multiVersionFiles = checkDriveForMultiVersionFiles(allFiles);
    nameAndMimeArray = getNameAndMimeTypeFromFiles(multiVersionFiles);    
    write2DArrayToSheet(nameAndMimeArray, versionCheckerConsts.STARTING_COLUMN_NO);   
    scriptProperties.setProperty(versionCheckerConsts.CONTINUE_TOKEN_NAME, allFiles.getContinuationToken());
  } catch(e){
    Logger.log(e);    
  };  

  if (allFiles.hasNext() === false){
    activeSheet.getRange(activeSheet.getLastRow() + 1, versionCheckerConsts.STARTING_COLUMN_NO).setValue(
      versionCheckerConsts.PROGRAM_COMPLETE_MESSAGE);    
  };
};
