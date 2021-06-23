### Check Google Drive for Multi-Version Files
There's a catchy title! This program is used to help a user see all of the files in their Google Drive that have multiple versions, a task which is currently impossible to perform in the vanilla UI without manually checking each file. This is intended to be used in Google Apps Script with a Google Sheet as a container. When the program has finished one loop, it will write all file names and their Mime types for any files that were found to have multiple versions (if any). By default, Google Docs, Google Sheets, and Google Slides are excluded (as they save versions for each change by design), but this behavior is easily edited. 

##### Instructions:
1. In a Google Sheets file, go to Tools --> Script Editor. 
2. Copy and paste the .gs file in this repository into the window that opens. Name the file whatever you would like. Click Save or hit CMD + S/CTRL + S upon completion. When ready, use the buttons in the tool bar of the Apps Script window to run "versionCheckMain". 
3. You will likely be prompted to allow the program to run, and may be given a warning. Note that this program only reads Drive files, and writes to the Sheet; it does not have the ability to delete or edit any Drive files, save for the Sheet that serves as the program's container. Allow the program to proceed if you're comfortable with the program taking these actions.
4. Note that the program will only process 15 files at a time by default. This is so the program can complete a successful run before the maximum run time is exceeded. This number can be increased at the user's risk by editing the MAX_FILES value in the versionCheckerConsts. If you would like this program to run on its own until completion, one option is to go to https://script.google.com/home, and by clicking the three dots next to the .gs file under "My Projects", you can set up a Trigger that runs every minute. Do this by doing the following:
  A.  Click Triggers.
  B.  Click Add a Trigger.
  C. Under "Choose which function to run", choose versionCheckMain. 
  D. Under "select event source", choose Time-driven.
  E. Select a timer and interval as you see fit (every minute recommended).
  F. Save! The program will now run repeatedly until you delete the trigger; your sign to do this will be when the spreadsheet begins writing "Finished running through those Drive files!".
