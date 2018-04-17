var gNow = new Date();
var ggWinCal;

//LEWR1 20/02/2009 PPL011124 - Highlight current day not today
var gOrigD = gOrigM = gOrigY = null;

Calendar.Months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
Calendar.DOMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
Calendar.lDOMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
Calendar.get_month = Calendar_get_month;
Calendar.get_daysofmonth = Calendar_get_daysofmonth;
Calendar.calc_month_year = Calendar_calc_month_year;
Calendar.print = Calendar_print;

function Calendar(p_item, p_WinCal, p_day, p_month, p_year, p_format) {
  if ((p_month == null) && (p_year == null)) {
    return;
  }

  if (p_WinCal == null) {
    this.gWinCal = ggWinCal;
  }
  else {
    this.gWinCal = p_WinCal;
  }

  if (p_month == null) {
    this.gMonthName = null;
    this.gMonth = null;
    this.gYearly = true;
  } 
  else {
    this.gMonthName = Calendar.get_month(p_month);
    this.gMonth = new Number(p_month);
    this.gYearly = false;
  }
 
  this.gYear = String(p_year);
  this.gFormat = p_format;
  this.gReturnItem = p_item;
  
  //LEWR1 20/02/2009 PPL011124 - Add current day
  this.gDay = p_day;  
}


function Calendar_get_month(monthNo) {
  return Calendar.Months[monthNo];
}

function Calendar_get_daysofmonth(monthNo, p_year) {
  /*
  Check for leap year ..
  1.Years evenly divisible by four are normally leap years, except for...
  2.Years also evenly divisible by 100 are not leap years, except for...
  3.Years also evenly divisible by 400 are leap years.
  */
  if ((p_year % 4) == 0) {
    if ((p_year % 100) == 0 && (p_year % 400) != 0) {
      return Calendar.DOMonth[monthNo];
    }
    else {
      return Calendar.lDOMonth[monthNo];
    }
  } 
  else {
    return Calendar.DOMonth[monthNo];
  }
}

function Calendar_calc_month_year(p_Month, p_Year, incr) {
  /*
  Will return an 1-D array with 1st element being the calculated month
  and second being the calculated year
  after applying the month increment/decrement as specified by 'incr' parameter.
  'incr' will normally have 1/-1 to navigate thru the months.
  */
  var ret_arr = new Array();

  if (incr == -1) { //BACKWARD
    if (p_Month == 0) {
      ret_arr[0] = 11;
      ret_arr[1] = parseInt(p_Year) - 1;
    }
    else {
      ret_arr[0] = parseInt(p_Month) - 1;
      ret_arr[1] = parseInt(p_Year);
    }
  } 
  else if (incr == 1) { //FORWARD
    if (p_Month == 11) {
      ret_arr[0] = 0;
      ret_arr[1] = parseInt(p_Year) + 1;
    }
    else {
      ret_arr[0] = parseInt(p_Month) + 1;
      ret_arr[1] = parseInt(p_Year);
    }
  }

  return ret_arr;
}

function Calendar_print() {
  ggWinCal.print();
}

function Calendar_calc_month_year(p_Month, p_Year, incr) {
  /*
  Will return an 1-D array with 1st element being the calculated month
  and second being the calculated year
  after applying the month increment/decrement as specified by 'incr' parameter.
  'incr' will normally have 1/-1 to navigate thru the months.
  */
  var ret_arr = new Array();

  if (incr == -1) {//BACKWARD
    if (p_Month == 0) {
      ret_arr[0] = 11;
      ret_arr[1] = parseInt(p_Year) - 1;
    }
    else {
      ret_arr[0] = parseInt(p_Month) - 1;
      ret_arr[1] = parseInt(p_Year);
    }
  } 
  else if (incr == 1) {//FORWARD
    if (p_Month == 11) {
      ret_arr[0] = 0;
      ret_arr[1] = parseInt(p_Year) + 1;
    }
    else {
      ret_arr[0] = parseInt(p_Month) + 1;
      ret_arr[1] = parseInt(p_Year);
    }
  }

  return ret_arr;
}

// This is for compatibility with Navigator 3, we have to create and discard one object before the prototype object exists.
new Calendar();

Calendar.prototype.getMonthlyCalendarCode = function() {
  var vCode = "";
  var vHeader_Code = "";
  var vData_Code = "";

  // Begin Table Drawing code here..
  vCode = vCode + "<TABLE WIDTH=\"100%\" BORDER=\"0\" CELLPADDING=\"4\" CELLSPACING=\"1\">";

  vHeader_Code = this.cal_header();
  vData_Code = this.cal_data();
  vCode = vCode + vHeader_Code + vData_Code;

  vCode = vCode + "</TABLE>";

  return vCode;
}

Calendar.prototype.show = function() {
  var vCode = "";

  this.gWinCal.document.open();

  // Setup the page...
  this.wwrite("<HTML>");
  this.wwrite("<HEAD>");
  this.wwrite("<TITLE>E:Vision Calendar</TITLE>");
  this.wwrite("<link media=\"all\" href=\"../css/sits.css\" rel=\"stylesheet\" type=\"text/css\">");
  this.wwrite("</HEAD>");
  this.wwrite("<BODY"); // onContextMenu=\"return false;\">
  this.wwrite("  <TABLE WIDTH=\"250\" BORDER=\"0\" CELLSPACING=\"0\" CELLPADDING=\"1\" CLASS=\"bgborder\">");
  this.wwrite("    <TR>");
  this.wwrite("      <TD VALIGN=\"top\" ALIGN=\"left\">");
  this.wwrite("        <TABLE WIDTH=\"100%\" BORDER=\"0\" CELLSPACING=\"0\" CELLPADDING=\"4\">");
  this.wwrite("          <TR>");
  this.wwrite("            <TD CLASS=\"tabletitle1\" VALIGN=\"top\" ALIGN=\"center\">");
  this.wwrite("              <TABLE WIDTH=\"100%\" BORDER=\"0\" CELLSPACING=\"0\" CELLPADDING=\"0\">");
  this.wwrite("                <TR>");

  // Show navigation buttons
  var prevMMYYYY = Calendar.calc_month_year(this.gMonth, this.gYear, -1);
  var prevMM = prevMMYYYY[0];
  var prevYYYY = prevMMYYYY[1];
  var nextMMYYYY = Calendar.calc_month_year(this.gMonth, this.gYear, 1);
  var nextMM = nextMMYYYY[0];
  var nextYYYY = nextMMYYYY[1];

  this.wwrite("                  <TD WIDTH=\"20\">&nbsp;</TD>");
  this.wwrite("                  <TD CLASS=\"tabletitle1\" WIDTH=\"*/2\">");
  this.wwrite("<A ALIGN=\"center\" HREF=\"" +
    "javascript:window.opener.Build(" +
    "'" + this.gReturnItem + "', null, '" + prevMM + "', '" + prevYYYY + "', '" + this.gFormat + "'" +
    ");" +
    "\"><<<\/A>&nbsp;"+this.gMonthName+"&nbsp;<A ALIGN=\"center\" HREF=\"" +
    "javascript:window.opener.Build(" +
    "'" + this.gReturnItem + "', null, '" + nextMM + "', '" + nextYYYY + "', '" + this.gFormat + "'" +
    ");" +
    "\">>><\/A></TD>");
  this.wwrite("                  <TD WIDTH=\"20\">&nbsp;</TD>");
  this.wwrite("                  <TD CLASS=\"tabletitle1\" WIDTH=\"*/2\">");
  this.wwrite("<A ALIGN=\"center\" HREF=\"" +
    "javascript:window.opener.Build(" +
    "'" + this.gReturnItem + "', null, '" + this.gMonth + "', '" + (parseInt(this.gYear)-1) + "', '" + this.gFormat + "'" +
    ");" +
    "\"><<<\/A>&nbsp;"+this.gYear+"&nbsp;<A ALIGN=\"center\" HREF=\"" +
    "javascript:window.opener.Build(" +
    "'" + this.gReturnItem + "', null, '" + this.gMonth + "', '" + (parseInt(this.gYear)+1) + "', '" + this.gFormat + "'" +
    ");" +
    "\">>><\/A></TD>");
  this.wwrite("                  <TD WIDTH=\"20\">&nbsp;</TD>");
  this.wwrite("                </TR>");
  this.wwrite("              </TABLE>");
  this.wwrite("            </TD>");
  this.wwrite("          </TR>");
  this.wwrite("        </TABLE>");
  this.wwrite("      </TD>");
  this.wwrite("    </TR>");
  this.wwrite("    <TR>");
  this.wwrite("      <TD VALIGN=\"top\" ALIGN=\"left\">");
  this.wwrite("        <TABLE WIDTH=\"100%\" BORDER=\"0\" CELLSPACING=\"0\" CELLPADDING=\"0\" CLASS=\"bginside\">");
  this.wwrite("          <TR>");
  this.wwrite("            <TD VALIGN=\"top\" ALIGN=\"left\">");
    
  // Get the complete calendar code for the month..
  vCode = this.getMonthlyCalendarCode();
  this.wwrite(vCode);

  this.wwrite("              </TABLE>");
  this.wwrite("            </TD>");
  this.wwrite("          </TR>");
  this.wwrite("        </TABLE>");
  this.wwrite("      </TD>");
  this.wwrite("    </TR>");
  this.wwrite("  </TABLE>");
  this.wwrite("</BODY>");
  this.wwrite("</HTML>");

  this.gWinCal.document.close();
  if(this.gWinCal.document.focus) {
    this.gWinCal.document.focus();
  }
}

Calendar.prototype.wwrite = function(wtext) {
  this.gWinCal.document.writeln(wtext);
}

Calendar.prototype.wwriteA = function(wtext) {
  this.gWinCal.document.write(wtext);
}

Calendar.prototype.cal_header = function() {
  var vCode = "";

  vCode = vCode + "<TR>";
  vCode = vCode + "<TD ALIGN=\"center\" CLASS=\"colhead1\" WIDTH='14%'><B>Sun</B></TD>";
  vCode = vCode + "<TD ALIGN=\"center\" CLASS=\"colhead1\" WIDTH='14%'><B>Mon</B></TD>";
  vCode = vCode + "<TD ALIGN=\"center\" CLASS=\"colhead1\" WIDTH='14%'><B>Tue</B></TD>";
  vCode = vCode + "<TD ALIGN=\"center\" CLASS=\"colhead1\" WIDTH='14%'><B>Wed</B></TD>";
  vCode = vCode + "<TD ALIGN=\"center\" CLASS=\"colhead1\" WIDTH='14%'><B>Thu</B></TD>";
  vCode = vCode + "<TD ALIGN=\"center\" CLASS=\"colhead1\" WIDTH='14%'><B>Fri</B></TD>";
  vCode = vCode + "<TD ALIGN=\"center\" CLASS=\"colhead1\" WIDTH='14%'><B>Sat</B></TD>";
  vCode = vCode + "</TR>";

  return vCode;
}

Calendar.prototype.cal_data = function() {
  var vDate = new Date();
  vDate.setDate(1);
  vDate.setMonth(this.gMonth);
  vDate.setFullYear(this.gYear);

  var vFirstDay=vDate.getDay();
  var vDay=1;
  var vLastDay=Calendar.get_daysofmonth(this.gMonth, this.gYear);
  var vOnLastDay=0;
  var vCode = "";

  // Write as many blank cells before the 1st day of the month as necessary.
  vCode = vCode + "<tr class=\"data1\">";
  for (var i=0; i<vFirstDay; i++) {
    vCode = vCode + "<td width='14%'" + this.write_weekend_string(i) + ">&nbsp;</td>";
  }

  // Write rest of the 1st week
  for (var j=vFirstDay; j<7; j++) {
    vCode = vCode + "<td width='14%'" + this.write_weekend_string(j) + ">" + "<a href='#' onclick=\"var e=self.opener.document.f.elements['"+this.gReturnItem+"'].value='" + this.format_data(vDay) + "';window.close();\">" + this.format_day(vDay) + "</a></td>";
    vDay = vDay + 1;
  }
  vCode = vCode + "</tr>";

  // Write the rest of the weeks
  for (var k=2; k<7; k++) {
    vCode = vCode + "<tr class=\"data1\">";

    for (j=0; j<7; j++) {
      vCode = vCode + "<td width='14%'" + this.write_weekend_string(j) + ">" + "<a href='#' onclick=\"var e=self.opener.document.f.elements['"+this.gReturnItem+"'].value='" + this.format_data(vDay) + "';window.close();\">" + this.format_day(vDay) + "</a></td>";
      vDay = vDay + 1;
      if (vDay > vLastDay) {
        vOnLastDay = 1;
        break;
      }
    }

    if (j == 6) {
      vCode = vCode + "</TR>";
    }
    if (vOnLastDay == 1) {
      break;
    }
  }

  // Fill up the rest of last week with proper blanks, so that we get proper square blocks
  for (m=1; m<(7-j); m++) {
    vCode = vCode + "<td width='14%'" + this.write_weekend_string(j+m) + ">&nbsp;</td>";
  }

  return vCode;
}

Calendar.prototype.format_day = function(vday) {
//LEWR1 20/02/2009 PPL011124 - Highlight current day not today

  if(parseInt(vday)==parseInt(gOrigD) && parseInt(this.gMonth)==parseInt(gOrigM) && parseInt(this.gYear)==parseInt(gOrigY)) {
    return "<strong>"+vday+"</strong>";
/*  var vNowDay = gNow.getDate();
  var vNowMonth = gNow.getMonth();
  var vNowYear = gNow.getFullYear();  
  if (vday == vNowDay && this.gMonth == vNowMonth && this.gYear == vNowYear) {
    return ("<b>&nbsp;" + vday + "&nbsp;</b>");
*/
  }
  else {
    return (vday);
  }
}

Calendar.prototype.write_weekend_string = function(vday) {
  // Return special formatting for the weekend day.
  if (vday==0 || vday==6) {
    return (" class=\"data1over\" align=\"center\" onmouseover=\"this.className='data1';\" onmouseout=\"this.className='data1over';\"");
  }
  else {
    return (" class=\"data1\" align=\"center\" onmouseover=\"this.className='data1over';\" onmouseout=\"this.className='data1';\"");  
  }
}

Calendar.prototype.format_data = function(p_day) {
  var vData;
  var vMonth = 1 + this.gMonth;
  vMonth = (vMonth.toString().length < 2) ? "0" + vMonth : vMonth;
  var vMon = Calendar.get_month(this.gMonth).substr(0,3).toUpperCase();
  var vFMon = Calendar.get_month(this.gMonth).toUpperCase();
  var vY4 = new String(this.gYear);
  var vY2 = new String(this.gYear.substr(2,2));
  var vDD = (p_day.toString().length < 2) ? "0" + p_day : p_day;

  switch (this.gFormat) {
    case "MM\/DD\/YYYY" :
      vData = vMonth + "\/" + vDD + "\/" + vY4;
      break;
    case "MM\/DD\/YY" :
      vData = vMonth + "\/" + vDD + "\/" + vY2;
      break;
    case "MM-DD-YYYY" :
      vData = vMonth + "-" + vDD + "-" + vY4;
      break;
    case "MM-DD-YY" :
      vData = vMonth + "-" + vDD + "-" + vY2;
      break;
    case "DD\/MON\/YYYY" :
      vData = vDD + "\/" + vMon + "\/" + vY4;
      break;
    case "DD\/MON\/YY" :
      vData = vDD + "\/" + vMon + "\/" + vY2;
      break;
    case "DD-MON-YYYY" :
      vData = vDD + "-" + vMon + "-" + vY4;
      break;
    case "DD-MON-YY" :
      vData = vDD + "-" + vMon + "-" + vY2;
      break;
    case "DD\/MONTH\/YYYY" :
      vData = vDD + "\/" + vFMon + "\/" + vY4;
      break;
    case "DD\/MONTH\/YY" :
      vData = vDD + "\/" + vFMon + "\/" + vY2;
      break;
    case "DD-MONTH-YYYY" :
      vData = vDD + "-" + vFMon + "-" + vY4;
      break;
    case "DD-MONTH-YY" :
      vData = vDD + "-" + vFMon + "-" + vY2;
      break;
    case "DD\/MM\/YYYY" :
      vData = vDD + "\/" + vMonth + "\/" + vY4;
      break;
    case "DD\/MM\/YY" :
      vData = vDD + "\/" + vMonth + "\/" + vY2;
      break;
    case "DD-MM-YYYY" :
      vData = vDD + "-" + vMonth + "-" + vY4;
      break;
    case "DD-MM-YY" :
      vData = vDD + "-" + vMonth + "-" + vY2;
      break;
    default :
      vData = vMonth + "\/" + vDD + "\/" + vY4;
  }

  return vData;
}

function Build(p_item, p_day, p_month, p_year, p_format) {
  var p_WinCal = ggWinCal;
  var gCal = new Calendar(p_item, p_WinCal, p_day, p_month, p_year, p_format);
  gCal.show();
}

function show_calendar() {
  /*
    p_month : 0-11 for Jan-Dec; 12 for All Months.
    p_year  : 4-digit year
    p_format: Date format (mm/dd/yyyy, dd/mm/yy, ...)
    p_item  : Return Item.
  */

  var p_item = arguments[0];
  
  //LEWR1 18/02/2009 PPL011124 - Get field and form objects
  var e = document.getElementById(p_item); //get field object
  var f = document.f;
  if(!e) {
    if(e=document.getElementById(p_item.slice(0,-1))) { //try again without trailing fullstop
      p_item = p_item.slice(0,-1);
    }
  }
  if(!f) { //check for form object
    if(e) {
      f = e.form;
    }
    else {
      var c = document.getElementsByTagName("form");
      if(c && c.length>0) {
          f = c[0];  //use the first form on the page
        }
          }    
    if(f && f.id=="") {
      f.id = "f"; //set form to be used
    }
  }
  if(f && !e) {
    if(e=document.f.elements[p_item]) { //try again through form
      //ok
    }
    else {
      if(e=document.f.elements[p_item.slice(0,-1)]) { //try again without trailing fullstop
        p_item = p_item.slice(0,-1);
      }
    }
  }  
  
//LEWR1 18/02/2009 PPL011124 - Get current date value
  var p_day = new String(gNow.getDate());
  var p_month = new String(gNow.getMonth());
  var p_year = new String(gNow.getFullYear().toString());
  var p_format = "DD/MM/YYYY";
  
  if(arguments.length==1) {
    if(e && e.value) { //check there's a current value
      var arr = e.value.split("/");      
      if(arr.length==3) {
        if(get_current(arr)) {
          p_day = arr[0];
          p_month = arr[1];
          p_year = arr[2];
        }
      }
      else {
        arr = e.value.split("-");
        if(arr.length==3) {
          if(get_current(arr)) {
            p_day = arr[0];
            p_month = arr[1];
            p_year = arr[2];
          }
        }      
      }           
    }   
  }
  else { //use specified values  
    if(arguments[1]) {
      p_month = arguments[1];
    }
    if(arguments[2]) {
      p_year = arguments[2];
    }
    if(arguments[3]) {
      p_format = arguments[3];
    }    
  }
  gOrigD = p_day;
  gOrigM = p_month;
  gOrigY = p_year;
/*
  if (arguments[1] == null) {
    p_month = new String(gNow.getMonth());
  }
  else {
    p_month = arguments[1];
  }
  if (arguments[2] == "" || arguments[2] == null) {
    p_year = new String(gNow.getFullYear().toString());
  }
  else {
    p_year = arguments[2];
  }
  if (arguments[3] == null) {
    p_format = "DD/MM/YYYY";
  }
  else {
    p_format = arguments[3];
  }
*/

  var vWinCal = window.open("","Calendar","width=269,height=200,status=no,resizable=no,top=200,left=200");
  vWinCal.opener = self;
  ggWinCal = vWinCal;

//LEWR1 18/02/2009 PPL011124 - Use specified format
  Build(p_item,p_day,p_month,p_year,p_format);
/*  Build(p_item, p_month, p_year, "DD/MM/YYYY");
*/
}

//LEWR1 18/02/2009 PPL011124 - Get current date value
function get_current(arr) {
  //translate day
  var d = parseInt(arr[0]);
  if(isNaN(d)) {
    return false;
  }
  else {
    arr[0] = d;
  }  
  
  //translate month
  var s = arr[1];
  while(s.substr(0,1)=="0") {
    s = s.substr(1); //trim leading zeros else "parseInt" thinks it's octal not decimal
  }
  var m = parseInt(s); 
  if(isNaN(m)) {
    s = arr[1];
    if(s.length > 2) { //check length
      switch(s.substr(0,3).toUpperCase()) { //translate value
        case "JAN":
          arr[1] = 0;
          break;
        case "FEB":
          arr[1] = 1;
          break;
        case "MAR":
          arr[1] = 2;
          break;
        case "APR":
          arr[1] = 3;
          break;
        case "MAY":
          arr[1] = 4;
          break;
        case "JUN":
          arr[1] = 5;
          break;
        case "JUL":
          arr[1] = 6;
          break;
        case "AUG":
          arr[1] = 7;
          break;
        case "SEP":
          arr[1] = 8;
          break;
        case "OCT":
          arr[1] = 9;
          break;
        case "NOV":
          arr[1] = 10;
          break;
        case "DEC":
          arr[1] = 11;
          break;
        default:
          return false;
      }
    }
  }
  else {
    if(m>0 && m<13) {
      arr[1] = m-1;
    }
    else {
      return false;
    }
  }  
  
  //translate year
  var y = parseInt(arr[2]);
  if(isNaN(y)) {
    return false;
  }
  else {
    arr[2] = y;
  }  
  
  return true;
}
