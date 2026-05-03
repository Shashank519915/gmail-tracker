function doGet(e) {
  var id = e.parameter.id || "Unknown";
  var now = new Date();
  var locale = Session.getActiveUserLocale(); 
  var timeString = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd/MM HH:mm:ss");

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Log");
    var data = sheet.getDataRange().getValues();
    var found = false;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        var currentStatus = data[i][1];
        var firstCreated = new Date(data[i][3]);
        var secondsSinceStart = (now - firstCreated) / 1000;
        var openCount;
        var newTimeline;

        // --- RESET LOGIC (Handover from Bot to Human) ---
        if (currentStatus !== "OPENED" && secondsSinceStart > 60) {
          // 1. Reset Counter
          openCount = 1; 
          sheet.getRange(i + 1, 2).setValue("OPENED");
          sheet.getRange(i + 1, 1, 1, 7).setBackground("#d9ead3"); // Green
          
          // 2. RESET TIMELINE: Wipe the scanning pings and start fresh
          newTimeline = timeString;
        } 
        else {
          // --- NORMAL INCREMENT (Scanning or Subsequent Real Opens) ---
          openCount = (parseInt(data[i][2]) || 0) + 1;
          
          // --- EXISTING TIMELINE LOGIC ---
          var rawTimeline = sheet.getRange(i + 1, 7).getDisplayValue(); 
          var timelineArray = rawTimeline ? rawTimeline.split(" | ") : [];
          timelineArray.unshift(timeString); 
          newTimeline = timelineArray.slice(0, 5).join(" | ");
        }

        // Apply updates to the sheet
        sheet.getRange(i + 1, 3).setValue(openCount);
        sheet.getRange(i + 1, 5).setValue(now);
        sheet.getRange(i + 1, 7).setValue(newTimeline);
        
        found = true;
        break;
      }
    }

    if (!found) {
      // NEW ROW: Light Yellow for scanning phase
      sheet.appendRow([id, "Scanning...", 1, now, now, "Locale: " + locale, timeString]);
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 1, 1, 7).setBackground("#fff2cc");
    }
  } catch (err) {}

  return servePixel();
}

function servePixel() {
  var clearPixel = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  var decoded = Utilities.base64Decode(clearPixel);
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setContent(Utilities.newBlob(decoded, "image/gif").getDataAsString());
}
