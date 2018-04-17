var siw_sel_version = "950.1"; //must only be used with jquery version  1.91+
var stopat1000 = false; //stop at x number of records ( default is 1000)
var gresp,selthenkey,seltheissc,selthefieldid,selthefieldval,selextraprofile,seltotalrecs;

function inc_sel(thefieldid,thebuttonid,theissc,thenkey,switches,extra_pars,selcallback) {
  if (typeof(extra_pars)=="undefined" )  {
    extra_pars = ""
  }
  selthenkey = sits_escape_url(thenkey);
  seltheissc = sits_escape_url(theissc);

  //451500 - mode parameter can now be a switches object (for client-side switches), so get the mode for backwards compatibility
  var mode;
  if(typeof switches==="object"){
  	mode = switches.mode;
  	delete switches.mode;
  }
  else{
  	mode = switches;
  	switches = {};
  }

  selthefieldid = thefieldid;
  //attach event to button
  // check id first
  if( $("#"+sits_do_get_object(thefieldid)).attr("readonly") == "readonly") {
    if ( $("#"+sits_do_get_object(thebuttonid)).length == 1 ){
      $("#"+sits_do_get_object(thebuttonid)).addClass("sv-disabled");
      return;
    }else{
      $(":submit[name="+sits_do_get_object(thebuttonid)+"]").addClass("sv-disabled");
      return;
    }
  }

  if ( $("#"+sits_do_get_object(thebuttonid)).length == 1 ){
    $("#"+sits_do_get_object(thebuttonid)).bind("click",function() {
  	  sits_do_selectionlist(thefieldid,theissc,mode,switches,"",extra_pars,selcallback); //451500 - include switches
	    return false;
    })
  }else{
      $(":submit[name="+sits_do_get_object(thebuttonid)+"]").bind("click",function() {
  	  sits_do_selectionlist(thefieldid,theissc,mode,switches,"",extra_pars,selcallback); //451500 - include switches
	    return false;
    });
  }
  return true;
}
function sits_do_selectionlist(thefieldid,issc,mode,switches,extraprofile,extra_pars,selcallback) {
  selextraprofile = extraprofile;
  sits_dialog_close(true,"sel_sits_dialog");
  seltheissc = issc; //capture the iss used for the selection list
  stopat1000 = false; //reinitialise
  seltotalrecs = 0;
  var id1 = "sel_sits_dialog";
  if(thefieldid!="" && mode!="MANUAL") {
    //get value from calling field ( ie the STU_CODE )
	  selthefieldval = $("#"+sits_do_get_object(thefieldid)).val();
  }
  else {
    //manual retrieve from clear screen - retrieve, so ignore calling field
    selthefieldval = "";
  }
  //create the dialog
  sits_dialog(sel_bp(1),sel_bp(42)+" <img src=\"../images/working.gif\" alt=\"...\">","",true,true,true,0,id1);
  //add context to the dialog ( which isscode, what mode, where to return data to )
  //REC=The selected record set when you click a row,
  //ISSC=SIW_SEL iss record
  //MODE= current mode (PROFILEONLY GETRECS GETNORECS)
  //OUTERSET= the set number. for large retrieves we only retrieve a group of xxxx records using next xxxx records button increments this
  $("#sel_sits_dialog").data("REC","").data("ISSC",issc).data("MODE","").data("RETURNFIELD",thefieldid).data("OUTERSET",1).data("EXTRAKEY",extra_pars).data("extraprofile",selextraprofile).data("SELSWITCHES",switches);
  if ( typeof(selcallback) == "function" || ( typeof(selcallback) == "string" && selcallback != "" ) ){
    $("#sel_sits_dialog").data("CALLBACK", selcallback);
  }else{
    $("#sel_sits_dialog").removeData("CALLBACK");
  }
  sits_dialog_resize(20,id1)  ;


  //run the ajax call
  if(mode=="PROFILEONLY") {
    return sel_send_query(1,"PROFILEONLY"); //profile already set on ISS
  }
  else {
    return sel_send_count(); //count records first
  }
  return true;
}

function sel_send_count() { //count number of records
  var extraprofile =  $("#sel_sits_dialog").data("extraprofile");
  var theval = sits_escape_url(selthefieldval);
  var extrakey = sits_escape_url($("#sel_sits_dialog").data("EXTRAKEY"));
  var pars = "NKEY="+selthenkey+"&EXTRAKEY="+extrakey+"&MODE=COUNT&ISSC="+seltheissc+"&FIELDVAL="+theval+extraprofile;
  return sits_send_query("POST","SIW_SEL.ajax_in",pars,false,"sel_ret_count");
}

function sel_ret_count(response) {
  var sub = response.substr(0,4);
  response = response.substr(4);
  if(sub=="TOT=") { //more results than the maximum have been specified controlled by logical SELECTION_LIST_MAX
    var pos = response.indexOf("{");
    var list = sub + response.substr(0,pos); //416882 - may now return a list including options

    seltotalrecs = sits_get_integer(sits_get_item(list,"TOT",";")); //store total records
    var nosets = sits_get_item(list,"NOSETS",";"); //are we allowed to use sets
    response = response.substr(pos);
    sits_dialog_resize(50,"sel_sits_dialog")  ;

    sel_show_busy(false);
    var obj = sits_parse_json(response);
    var btn = {};
    btn[obj.BUTTON] = function() { //cancel button
      sits_dialog_close(true,"sel_sits_dialog"); //add "close" button  may want to call from end of other functions
	  };
	  if(nosets!=="Y"){ //416882 - don't show button if sets are disabled
    	btn[sel_bp(105)] = function() { //first xxxx records button
      	sel_disable_btns();
	    	stopat1000 = true;
	    	sel_show_busy(true);
      	sel_send_query(1,"GET_RECS");
	  	};
	  }
    btn[sel_bp(100)] = function() { //add criteria button
      sel_disable_btns();
      sel_send_query(1,"GET_NORECS");
	  };
	  sits_dialog_update(obj.TEXT,btn,"sel_sits_dialog");
    $("#sel_sits_dialog").dialog("option","title",obj.TITLE);
	  return true;
  }
  if(sub!="~OK~") {
    sel_show_busy(false);
    sel_error_box(response,sub);
    return true;
  }
  return sel_send_query(1,"GET_RECS");
}

function sel_disable_btns() {
  $("#sel_sits_dialog ~ div.ui-dialog-buttonpane").find("button").button("disable");
  return true;
}

function sel_send_query(set,mode) {
  var extraprofile =  $("#sel_sits_dialog").data("extraprofile");
  var theval = selthefieldval;
  var outerset = $("#sel_sits_dialog").data("OUTERSET");
  var extrakey = sits_escape_url($("#sel_sits_dialog").data("EXTRAKEY"));
  var pars = "NKEY="+selthenkey+"&EXTRAKEY="+extrakey+"&MODE="+mode+"&ISSC="+seltheissc+"&FIELDVAL="+theval+"&SET="+set+"&OUTERSET="+outerset+extraprofile;
  return sits_send_query("POST","SIW_SEL.ajax_in",pars,false,"sel_ret_func");
}

function sel_ret_func(response) {
  try {
    if($("#sel_sits_dialog").data("MODE")=="CLEAR") {
	    return true; //ignore response clear has been pressed
	  }
	  $("#sel_sits_dialog").data("MODE","");
	  if($("#sel_sits_dialog:visible").length<1) {
      return true; //assume dialog closed
    }
    var sub = response.substr(0,4);
    response = response.substr(4);
    if(sub!="~OK~") {
      sel_show_busy(false);
      sel_error_box(response,sub);
      return true;
    }
  	var obj = sits_parse_json(response);
	  gresp = obj;
  	var opmode = gresp.MODE;
    var dlg = $("#sel_sits_dialog");
    dlg.data("MODE",opmode);
    //need to check that returned results match issc
  	if(gresp.ISSC!=dlg.data("ISSC")) {
     return true; //return issc value didnt equal last passed in value
  	}

	  var set = gresp.SET;
    /*if(gresp.RECORDS=="" && set>1) {
      sel_show_busy(false);
  	  return true;
	  }	*/

    if(set==1) {
      var htm = "<div class=\"sv-container-fluid\"><div class=\"sv-col-md-12\"><div class=\"sv-table-container\"><table class=\"display sv-table sv-table-striped\" id=\"siwseldataresults\" title=\""+gresp.ENT_NAME+sel_bp(43)+"\"></table></div></div></div>";
  	  dlg.html(htm);
      var btn = sel_buttons(opmode);
      sits_dialog_resize(90,"sel_sits_dialog")  ;
	    dlg.dialog("option",{"buttons":btn,"title":gresp.ENT_NAME+sel_bp(43)}); //set size buttons to dialog
      //add processing html
	    if($("#sel_sits_dialog_msg").length<1) {
        var htm2 = "<span id=\"sel_sits_dialog_msg\" style=\"float:right;margin:12px 12px 0px 0px\"> "+sel_bp(42)+" <img src=\"../images/working.gif\" alt=\"...\" /></span>";
        $("#sel_sits_dialog ~ div.ui-dialog-buttonpane").append(htm2); //add message div
	    }
      var len = dlg.data("LENGTH") || "10"; //entries per page
      var lng = {}; //build up localisation
      lng.sUrl = "";
      lng.sInfo = sel_bp(46);
      lng.sInfoEmpty = sel_bp(47);
      lng.sInfoFiltered = sel_bp(48);
      lng.sEmptyTable = sel_bp(49);
      lng.sInfoPostFix = sel_bp(50);
      lng.sInfoThousands = sel_bp(51);
      lng.sLengthMenu = sel_bp(52);
      lng.sLoadingRecords = sel_bp(53);
      lng.sProcessing = sel_bp(54);
      lng.sSearch = sel_bp(55);
      lng.sZeroRecords = sel_bp(56);
      var pag = {};
      pag.sFirst = sel_bp(57);
      pag.sLast = sel_bp(58);
      pag.sNext = sel_bp(59);
      pag.sPrevious = sel_bp(60);
      lng.oPaginate = pag;
      var ari = {};
      ari.sSortAscending = sel_bp(61);
      ari.sSortDescending = sel_bp(62);
      lng.oAria = ari;

      var opt = {}; //build up options
      //opt.bLengthChange = true;
      opt.bFilter = true;
      if ( gresp.SRTORDR == "Y" ){
         opt.aaSorting = [];
      }
      opt.aaData = gresp.RECORDS;
      opt.aoColumns = gresp.HEADERS;

      opt.sPaginationType = "full_numbers";
      opt.iDisplayLength = sits_get_integer(len);
      opt.oLanguage = lng;
      opt.aoColumnDefs =  [{"bSortable":false,"aTargets":[-1]}]
      //opt.autoWidth = false;

   		//PPL38292 - include any additional/default parameters
		  var m_table = $("#siwseldataresults")
  		//initialise results using DataTable widget
      sits_datatables_widget("#siwseldataresults",opt,"");


      sits_datatables_recalc("#siwseldataresults")
      //$("#siwseldataresults").dataTable().fnAdjustColumnSizing(); // headers redraw on page resize
      $("#siwseldataresults_info").wrap("<div id=\"siwseldataresults_outerinfo\" class=\"dataTables_outerinfo\" />");
      $("#siwseldataresults_outerinfo").append("<div id=\"siwseldataresults_setinfo\" class=\"dataTables_info\" />");


	    //select row
      $("#siwseldataresults").on("click","td",function(event) {
        var oTable = $("#siwseldataresults").dataTable();
        if ( $(event.target).hasClass("dataTables_empty")){return false;}
        var therow = $(event.target).closest("tr");
        var data = oTable.fnGetData(therow[0])[0];
        var dlg = $("#sel_sits_dialog");
        dlg.data("REC",data);
        var sett = oTable.fnSettings();
        if(sett && sett.aoData) {
    	    $(sett.aoData).each(function() {
  	        $(this.nTr).removeClass("row_selected");
  	      });
        }
	      $(therow).addClass("row_selected");
      });

		  //double click row
      $("#siwseldataresults").on("click",".sel_selector",selectrow);
      $("#siwseldataresults tbody").dblclick(selectrow);


	  }
	  if(set>1) {
	    if($("#sel_sits_dialog:visible").length<1 || $("#siwseldataresults:visible").length<1) {
  	    return true; //assume dialog closed
	    }
      var oTable = $("#siwseldataresults").dataTable();
      //var pag = $("#siwseldataresults_paginate ul li.svactive a").html()*1; //hack to get current page 1.10 new styles
      //var pag = $("#siwseldataresults_paginate a.paginate_active").html()*1; //hack to get current page 1.10
      //var pag = $("#siwseldataresults_paginate").find(".current").html()*1; //hack to get current page 1.9
      if ( gresp.RECORDS != "" ) {
        oTable.fnAddData(gresp.RECORDS);
      }
      //oTable.fnPageChange(pag-1); //reset page after adding data
	  }
    //dlg.dialog("option","position","center"); //reposition dialog
    sits_dialog_resize(90,"sel_sits_dialog")  ;

	  if(opmode=="PROFILEONLY") {
      return sel_show_busy(false);
	  }
    if(gresp.RECORDS!="" && gresp.FINISHED!="Y") {
  	  set++;
      return sel_send_query(set,"GET_RECS");
  	}
    else {
      if(opmode=="GET_NORECS") {
	      clear_mode("");
	    }
  	  if(stopat1000) {
		    var data = dlg.data("OUTERSET");
        var btn = $("#sel_sits_dialog").dialog("option","buttons");
        var npmode = "";
		    if(data>1) {
          npmode = "P";
 	      }
        if(gresp.FINISHED!="Y") {
          npmode += "N";
        }
        if ( npmode != "" ){
          btn =  sel_buttons(npmode);
        }
        sits_dialog_update(false,btn,"sel_sits_dialog")

        var info = " "+sel_bp(45);
        info = sits_replace(info,"{0}",gresp.OUTERSET);
        info = sits_replace(info,"{1}",Math.ceil(seltotalrecs/gresp.MAXRECS));
        info = sits_replace(info,"{2}",seltotalrecs);
        $("#siwseldataresults_setinfo").html(info);
	    }
    }
    sel_show_busy(false);
    $("[name=siwseldataresults_length]").focus();
	}
  catch(err) {
    sits_putmess(err.message);
  }
  return true;
}
function selectrow(event){

  if ( $(event.target).hasClass("dataTables_empty")){return false;}
  var dlg = $("#sel_sits_dialog");
  var selcallback = $("#sel_sits_dialog").data("CALLBACK")
	if(dlg.data("MODE")=="CLEAR") {
	  return true;
	}
  if (typeof($(event.target).attr("data-code")) != "string") {
    var oTable = $("#siwseldataresults").dataTable();
    var therow = $(event.target).closest("tr");
	  var data = oTable.fnGetData(therow[0])[0];
    var sett = oTable.fnSettings();
    if(sett && sett.aoData) {
      $(sett.aoData).each(function() {
        $(this.nTr).removeClass("row_selected");
	    });
    }
  }else{
    var data = $(event.target).attr("data-code");
  }
  sits_dialog_close(true,"sel_sits_dialog");

  //update the field with the selected value
	var thefieldid = dlg.data("RETURNFIELD");
	var fld = $("#"+sits_do_get_object(thefieldid));
	fld.val(data);

	var switches = dlg.data("SELSWITCHES"); //451500
	if(typeof switches==="object"&&switches.triggerchange==="Y"){
		//manually trigger any change events associated with the field
		fld.trigger("change");
	}

  var t = setTimeout(function(){sits_set_focus(thefieldid)},100);
  if ( typeof(selcallback) == "function"){
    selcallback(true,thefieldid);
  }
  if ( typeof(selcallback) == "string" ){
    sits_execute_function(selcallback, window, true, thefieldid)
  };
  return false;
}

function sel_nextlot(nextorprev) {
  $("#siwseldataresults_paginate").css("visibility","hidden"); //hide navigation links
  var dlg = $("#sel_sits_dialog");
  var data = dlg.data("OUTERSET");

//  if($(this).hasClass("prevlot")) { //check if previous or next button
  if ( nextorprev == "P" ){
    data--; //decrement
  }else{
    data++; //increment
  }
  dlg.data("OUTERSET",data);
  var len = $("#siwseldataresults_length option:selected").val() || ""; //get entries per page
  dlg.data("LENGTH",len);
  stopat1000 = true;
  sel_show_busy(true);
  sel_send_query(1,"GET_RECS"); //fetch results
  return false; //cancel click
}
function sel_buttons(opmode) {
  var btn = {};
  btn[sel_bp(101)] = function() { //CANCEL BUTTON
    var selcallback = $("#sel_sits_dialog").data("CALLBACK");
    var thefieldid = $("#sel_sits_dialog").data("RETURNFIELD");
    sits_dialog_close(true,"sel_sits_dialog");
    var t = setTimeout(function() {sits_set_focus(thefieldid)},100);
    seltotalrecs = 0;
    if ( typeof(selcallback) == "function" ){
      selcallback(false,thefieldid);
    };
    if ( typeof(selcallback) == "string" ){
      sits_execute_function(selcallback, window, false, thefieldid)
    };

  };
  if(opmode!="PROFILEONLY") {
    btn[sel_bp(102)] = function() { //CLEAR BUTTON if clear allowed
      sel_disable_btns();
      clear_mode("");
	  };
  }
  if  (opmode == "P" || opmode == "PN"  ) {
    btn[sel_bp(107)] = function(){
      sel_nextlot("P");
    };
  }
  if  (opmode == "PN" || opmode == "N"  ) {
    btn[sel_bp(106)] = function(){
      sel_nextlot("N");
    };
  }
 /*
  btn[sel_bp(104)] = function() { //SELECT BUTTON
    var selcallback = $("#sel_sits_dialog").data("CALLBACK")
    var mode = $("#sel_sits_dialog").data("MODE");
    var data = $("#sel_sits_dialog").data("REC");
    if (data!="" && mode!="CLEAR") {
      sits_dialog_close(true,"sel_sits_dialog");
      var thefieldid = $("#sel_sits_dialog").data("RETURNFIELD");
	    $("#"+sits_do_get_object(thefieldid)).val(data);
	    var t = setTimeout(function() {sits_set_focus(thefieldid)},100);
      seltotalrecs = 0;
      if ( typeof(selcallback) == "function" ){
        selcallback(true,thefieldid);
      }
	  }
  };
  */
  return btn;
}
function clear_mode(flds) {
  selextraprofile = flds;
  flds = flds.substr(1); //remove leading "&"
  //clear scren and give fields for retrieval
  if($("#sel_sits_dialog").data("MODE")=="CLEAR") {
    return true;
  }
  //only show cancel button
  var btn = {};
  btn[sel_bp(101)] = function() { //CANCEL BUTTON
    sits_dialog_close(true,"sel_sits_dialog");
    var thefieldid = $("#sel_sits_dialog").data("RETURNFIELD");
    var t = setTimeout(function() {sits_set_focus(thefieldid)},100);
  };
  btn[sel_bp(103)] = function() { //Retrieve
    //need to scrape responses and post back as a search
    //need to reset mode as well
	  var extraflds = "";
    $("#siwseldataresults").find("input[id^=ncol]").each(function(i) {
	   extraflds+="&FIELD"+(i+1)+"="+sits_get_value(this);
    });
    var dlg = $("#sel_sits_dialog");
    var selcallback = dlg.data("CALLBACK");
  	sits_dialog_close(true,"sel_sits_dialog");
	  sits_do_selectionlist(dlg.data("RETURNFIELD"),dlg.data("ISSC"),"MANUAL",dlg.data("SELSWITCHES"),extraflds,"",selcallback); //451500 - include switches
  };

  sits_dialog_update(false,btn,"sel_sits_dialog")
  sel_show_busy(false);
  var oTable = $("#siwseldataresults").dataTable();
  oTable.fnFilter("");
  oTable.fnClearTable();
  var oSettings = oTable.fnSettings();
  var ncols = oSettings.aoColumns.length;
  var cells = oSettings.aoHeader[0];
  var thedata = [];
  //for(var i=1;i<=ncols;i++) {
  for(var i=1;i<=ncols;i++) {
    var valu = sits_get_item(flds,"FIELD"+i,"&"); //get previous value
    var cell = cells[i-1]; //get respective heading cell
    var title = cell.cell.textContent
    if ( i == ncols ){
      thedata[i-1] = "";
    }else{
   // if ( i == 1 ){
    //thedata[i-1] = "  <div class=\"sv-input-group-table\">   <div class=\"sv-input-group\"> <input class = \"sv-form-control\" type=\"text\" id=\"ncol"+i+"\" value=\""+valu+"\" title= \""+title+"\" /> <span class=\"sv-input-group-addon\">   <img class=\"ui-datepicker-trigger\" src=\"../images/si_calendar.gif\" alt=\"Select a date\" title=\"Select a date\" tabindex=\"0\">   </span></div></div>"
   //}else{
      thedata[i-1] = "<input class = \"sv-form-control\" type=\"text\" id=\"ncol"+i+"\" name=\"ncolname"+i+"\" value=\""+valu+"\" title= \""+title+"\" />";
   //}
    //  $(cell.cell).wrapInner("<label for=\"ncol"+i+"\" />"); //wrap label around heading for accessibility
    }
  }
  oTable.fnAddData(thedata);
  $("#sel_sits_dialog").data("MODE","CLEAR");
  //var oPage = $("#siwseldataresults_paginate ul");
  //oPage.find("a").css("display","none");
  $("#siwseldataresults_filter").css("display","none");

  //correct boilerplates
  clear_mode_bp();
  $("select[name=siwseldataresults_length]").on("change",clear_mode_bp);

  /*
  $("#ncol1").bind("blur",function(){
    if ( $(this).val() != "44" ){
      sits_inline_validation_message($(this).val(),"invalid value message"+$(this).val(),this,"")  ;
      return true;
    }
  })
  $("#ncol2").bind("blur",function(){
    if ( $(this).val() != "44" ){
      sits_inline_validation_message($(this).val(),"invalid value message"+$(this).val(),"ncolname2","")  ;
      return true;
    }
  })*/

  sits_set_focus("ncol1");

  return true;
}
function clear_mode_bp() {
  var txt = sel_bp(46);
  txt = sits_replace(txt,"_START_","1");
  txt = sits_replace(txt,"_END_","1");
  txt = sits_replace(txt,"_TOTAL_","0");
  $("#siwseldataresults_info").html(txt);
  $("#siwseldataresults_setinfo").html("");
//  $("#siwseldataresults_paginate span").hide();
  $("#siwseldataresults_paginate,#siwseldataresults_info,#siwseldataresults_length").hide();

  return true;
}
function sel_error_box(response,sub,tid) {
  if(typeof(tid)=="undefined" || tid=="") {
    tid = "sel_sits_dialog";
  }
  var obj = null;
  var btn = {};
  if(sub=="~NO~" || sub=="NO") {
    obj = sits_parse_json(response);
    btn[obj.BUTTON] = function() {
      sits_dialog_close(true,tid); //add "close" button  may want to call from end of other functions
	  };
    sits_dialog_update("<img src=\"../images/cross.gif\" alt=\"ERROR: \" /> "+obj.TEXT,btn,tid);
    $("#"+tid).dialog("option","title",obj.TITLE);
  }
  else {
    btn[sel_bp(44)] = function() {
      sits_dialog_close(true,tid); //add "close" button  may want to call from end of other functions
	  };
    sits_dialog_update("<img src=\"../images/cross.gif\" alt=\"ERROR: \" /> Error running selection list",btn,tid);
    $("#"+tid).dialog("option","title","Error");
  }
}
function sel_bp(num) {
  return sits_get_bptext(selbparray,num);
}
function sel_show_busy(boo) {
  if(boo) {
    $("#sel_sits_dialog_msg").css("display",""); //show whirlygig
    $("#siwseldataresults_filter input").val("").prop("disabled",true); //disable filter
  }
  else {
    $("#sel_sits_dialog_msg").css("display","none"); //hide whirlygig
    $("#siwseldataresults_filter input").prop("disabled",false); //enable filter
  }
  return true;
}

