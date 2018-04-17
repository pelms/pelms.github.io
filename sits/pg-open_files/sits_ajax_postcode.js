//Called to add postcode lookup to a button (PPL016548)
// SMIJ6, moved into new file from sits_ajax.js (314185)
// string   id : in  ;id of the button to hijack
// string   pcountry_field_id : in  ;id of the country field associated to the find address button passed in
// string   ppostcode_field_id : in  ;id of the postcode field associated to the find address button passed in
function sits_postcode_start(id, pcountry_field_id, ppostcode_field_id) { 
  if(typeof(id)=="string" && id.length>0) { //check parameter
    if(typeof($)!="function") {
      var par = "'"+id+"'";
      if(pcountry_field_id!="") {
        par += ",'"+pcountry_field_id+"'";
      }
      if(ppostcode_field_id!="") {
        par += ",'"+ppostcode_field_id+"'";
      }
      setTimeout("sits_postcode("+par+")",100); //jQuery not quite ready
      return false;
    }

    var obj = $(sits_nkey_selector);
    if(obj.length>0 && obj.val()!=""){ //check nkey exists
      // THOS1 - 11/09/2012 - PPL:024210 - Get country field id associated with button from data attribute of button
      if(typeof(pcountry_field_id)=="string" && pcountry_field_id.length>0) { // country field specified
        // Set country field id associated with button against data attribute of button
        $("input[id="+sits_do_get_object(id)+"]").data("associated_field_id", pcountry_field_id);
      }

      // THOS1 - 07/02/2014 - PPL:031596 - Passing through ID of postcode field
      if(typeof(ppostcode_field_id)=="string" && ppostcode_field_id.length>0) { // postcode field specified
        // Set postcode field id associated with button against data attribute of button
        $("input[id="+sits_do_get_object(id)+"]").data("associated_field_id2", ppostcode_field_id);
      }

      $("input[id="+sits_do_get_object(id)+"]").click(function(e) { //can be multiple
        sits_do_postcode1(e); //hijack button click
        return sits_cancel_event(e);
      });
      return true;
    }
  }
  return false;
}

//Internal function to create dialog and perform postcode lookup (PPL016548)
// string   evt : in  ;event object from button click
function sits_do_postcode1(evt) {
  var obj = evt.target;
  var responsiveMode;
  var con = "";
  if(obj) {
	// SMIJ6, 314385 new div for responsive mode
    if ($(obj).hasClass("sv-btn")){
		responsiveMode = true;
		con += "<img src=\"../images/working.gif\" alt=\"...\"></div>";
		}
	else{
		responsiveMode = false;
		con = "<div style=\"width:100%;margin-top:0px;margin-bottom:0px;height:100px\">";
		con += "<img src=\"../images/working.gif\" alt=\"...\"></div>";
		con += "<div id=\"sits_pcodia_responsive_mode\"></div>";
	}
	sits_dialog(obj.value,con,null,true,true,false,null,"sits_pcoddia"); //create dialog

    // THOS1 - 07/02/2014 - PPL:031596 - Passing through ID of postcode field
    var inp = "";
    var vpostcode_field_id = $("input[id="+sits_do_get_object(obj.id)+"]").data("associated_field_id2");

    if(typeof(vpostcode_field_id)=="string" && vpostcode_field_id.length>0) { // postcode field specified
      // Get postcode object
      inp = $("input[id="+sits_do_get_object(vpostcode_field_id)+"]");
    }

    // Postcode ID not passed in
    if(inp.length==0) {
      inp = $(obj).prev("input"); //get postcode input
    }
    if(inp.length==0) {
      inp = $(obj).prev().prev("input"); //tasking has a label inbetween
    }
    if(inp.length==0) {
      inp = $(obj).parent().prev("input");
      if( inp.attr("type") != "text" ) {
        inp = $(obj).parent().prev("input").prev("input");
	    if(inp.length==0) {
		  inp = $(obj).parent().prev("input").prev("").children("input");
		}
      }
    }

    $("#sits_pcoddia").data("targ",inp);
    $("#sits_pcoddia").data("butt",obj);
	$("#sits_pcoddia").data("responsive_mode",responsiveMode); // SMIJ6, 314385. new div for responsive mode, set the value

    var par = "nkey="+sits_escape_url($(sits_nkey_selector).val()); //build parameters
    par += "&mode=1&vers="+sits_ajax_version;
    par += "&pcod="+sits_escape_url(inp.val().toUpperCase());

    // THOS1 - 11/09/2012 - PPL:024210 - Get country field id associated with button from data attribute of button
    var vcountry_field_id = $("input[id="+sits_do_get_object(obj.id)+"]").data("associated_field_id");
    if(typeof(vcountry_field_id)=="string" && vcountry_field_id.length>0) { // country field specified
      // Get associated country field value
      if ( $("#"+sits_do_get_object(vcountry_field_id)).length < 1 ){
        var dot = vcountry_field_id.indexOf("."); // try country ID without . ie IPU_CODC rather than IPU_CODC.IPU.SRS
        if(dot>0) {
          vcountry_field_id = vcountry_field_id.substring(0,dot); //get ".ent.dct.occ"
        }                
      }          
      var vcountry_value = sits_get_value(vcountry_field_id);          
      par += "&cntr="+sits_escape_url(vcountry_value.toUpperCase());
    }          
    return sits_send_query("POST","siw_add_pick.ajax",par,true,"sits_do_postcode2"); //perform lookup
  }
  return false;
}

//Internal function to display results from postcode lookup (PPL016548)
// string res : in  ;the response string
function sits_do_postcode2(res) {
  if(res.substr(0,4)=="<OK>") {
    var con = ""; // rebuild container from scratch!
    var foc = "sits_pcodinp";
    var obj = sits_parse_json(res.substr(4)); //get data object
    var hit = sits_get_integer(obj.stat);
	var responsiveMode = "";
	var showplutype = "";
	var plutype = "";

	showplutype = sits_do_get_object(obj.showplutype);
	plutype = sits_do_get_object(obj.plutype);
	responsiveMode = $("#sits_pcoddia").data("responsive_mode");
	
    if (responsiveMode){
		con = "<div class=\"sv-container-fluid\">";
		con += "<div class=\"sv-form-container\">";
		con += "<div class=\"sv-form-horizontal\">";
		con += "<fieldset>";
	}

    if(hit>=0){
      if (responsiveMode){
		// The postcode you entered....
		con += "<div class=\"sv-col-sm-12\">";
		con += "<div class=\"sv-form-group\">";
		if(obj.pcod != ""){ // SMIJ6, 9.4.0, 354305
			// the search criteria you entered has 10 matches
			con += "<label for=\"pick1\" class=\"sv-form-label\">"+obj.bp002+obj.pcod+obj.bp003+hit+obj.bp004+"</label>";
			con += obj.mess;
		}
		else{
			// (nothing entered) Please enter some search criteria
			con += "<label for=\"pick1\" class=\"sv-form-label\">"+obj.bp031+"</label>";
		}
		con += "</div>";
		con += "</div>";
		
		// search button
		con += "<div class=\"sv-col-sm-12\">";
		con += "<div class=\"sv-form-group\">";
		con += "<label for=\"sits_pcodinp\" class=\"sv-col-sm-3 sv-control-label\">"+obj.bp007+"</label>";
		con += "<div class=\"sv-col-sm-4\">";
		con += "<div class=\"sv-input-group\">";
		con += "<input type=\"text\" class=\"sv-form-control\" id=\"sits_pcodinp\" size=\"40\" title=\""+obj.bp018+"\" value=\""+obj.pcod+"\" />";
		con += "<span class=\"sv-input-group-btn\">";
		con += "<input type=\"submit\" id=\"sits_pcodbut\" class=\"sv-btn sv-btn-default\" onclick=\"sits_do_postcode4();\" value=\""+sits_escape_attr(obj.bp103)+"\" />";
		con += "</span>";
		con += "</div>";
		con += "</div>";
		con += "</div>";
		con += "</div>";
		
		// PLUTYPE filter, SMIJ6, 337803
		if (showplutype=="Y"){
			con += "<div class=\"sv-col-sm-12\">";
			con += "<div class=\"sv-form-group\">"
			con += "<label class=\"sv-col-sm-3 sv-control-label\" for=\"plutype\">"+obj.bp019+"</label>";
			con += "<div class=\"sv-col-sm-4\">";
			con += "<select id=\"plutype\" class=\"sv-form-control\">";
			con += "<option value=\"\" selected=\"selected\">"+obj.bp020+"</option>";
			if (plutype=="S"){
				con += "<option value=\"S\" selected=\"selected\">"+obj.bp022+"</option>";
			}
			else{
				con += "<option value=\"S\">"+obj.bp022+"</option>";
			}
			if (plutype=="P"){
				con += "<option value=\"P\" selected=\"selected\">"+obj.bp021+"</option>";
			}
			else{
				con += "<option value=\"P\">"+obj.bp021+"</option>";
			}
			con += "</select>";
			con += "</div>";
			con += "</div>";
			con += "</div>";
		}

	}
	  else{
		if(obj.pcod != ""){ // SMIJ6, 9.4.0, 354305
			// The postcode you entered....
			con = obj.bp002+obj.pcod+obj.bp003+hit;
			con += obj.bp004+"<br /><br />"+obj.mess+"<br />"+obj.bp007; //select
		}
		else{
			// (nothing entered) Please enter some search criteria
			con = obj.bp031;
			con += "<br /><br />"+obj.mess+"<br />"+obj.bp007; //select
		}
	  }
      foc = "pick1";
    }

	if (responsiveMode){
		if(hit<0){
			//SMIJ6, 314385 error situation
			con += "<div class=\"sv-form-group sv-has-error sv-has-feedback\">"
			con += "<div class=\"sv-col-sm-4\">"
			con += "<div class=\"sv-input-group\">"
			con += "<div class=\"sv-has-feedback-in-input-group sv-input-group-wrapper\">"
			con += "<input type=\"text\" class=\"sv-form-control\" id=\"sits_pcodinp\" title=\""+obj.bp018+"\" value=\""+obj.pcod+"\" />";
			con += "<span class=\"glyphicon glyphicon-remove sv-form-control-feedback\" aria-hidden=\"true\"></span>";
			con += "</div>";
			con += "<span class=\"sv-input-group-btn\"><input type=\"submit\" id=\"sits_pcodbut\" class=\"sv-btn sv-btn-default\" onclick=\"sits_do_postcode4();\" value=\""+sits_escape_attr(obj.bp103)+"\" /></span>";
			con += "</div>";
			con += "</div>";
			con += "<span class=\"sv-col-sm-8 sv-help-block\"><span class=\"sv-trans-block\"><span class=\"PAGEHELPTEXT\">"+obj.mess+"</span></span><span class=\"sv-error-block\"/></span>";
			con += "</div>";
		}
	}
	else{ // non-responsive mode
		if(hit<0){
			con += "<img src=\"../images/cross.gif\" alt=\"[X]\">&nbsp;"+obj.mess+"<br />"; //error
		}
		con += "<br /><input type=\"text\" id=\"sits_pcodinp\" size=\"50\" title=\""+obj.bp018+"\" value=\""+obj.pcod;
		con += "\"> <input type=\"submit\" id=\"sits_pcodbut\" onclick=\"sits_do_postcode4();\" value=\""+sits_escape_attr(obj.bp103)+"\">";
	}
	if (responsiveMode){
		con += "</div>";
		con += "</div>";
		con += "</div>";
		con += "</fieldset>";
	}
	
    var btn = {}; //create buttons
    btn[obj.bp102] = function() {return sits_dialog_close(true,"sits_pcoddia");}; //add "cancel" button
    btn[obj.bp104] = function() {return sits_do_postcodeME(obj);}; //add "Manual Entry" button (New button 352391)
    btn[obj.bp101] = function() {return sits_do_postcode3();}; //add "select" button
    sits_dialog_update(con,btn,"sits_pcoddia"); //update dialog
    if($("#sits_pcoddiv").length==0) {
      var div = "<div id=\"sits_pcoddiv\" style=\"float:right;margin:14px 12px 0px 0px\">";
      $("#sits_pcoddia ~ div.ui-dialog-buttonpane").append(div); //add message div
    }
    $("#pick1").click(function(e) {sits_do_postcode6();}) //click shows map link
               .dblclick(function(e) {sits_do_postcode3();}); //double click selects item
    $("#sits_pcoddia").data("json",obj).dialog("enable");
    sits_set_value("pick1","000001"); //select only value
    if(hit==1) {
      sits_do_postcode6(); //show map link
    }
    else {
      sits_set_value("pick1",""); //un-select (scrolls list to top)
	  $("#sits_pcoddiv").html(""); //clear link
    }
    sits_set_focus(foc); //focus on input field
    return true;
  }
  alert(res); // error message to user
  return false;
}

//Internal function to check selection and get formatted address (PPL016548)
function sits_do_postcode3() {
  var obj = $("#sits_pcoddia").data("json"); //get data object
  if(obj) {
    var val = sits_get_value("pick1");
    if(val!="") { //check for selection
      $("#sits_pcoddia").dialog("disable");
      $("#sits_pcoddia ~ div.ui-dialog-buttonpane button").prop("disabled",true);
      $("#sits_pcoddiv").html("<img src=\"../images/working.gif\" alt=\"...\">"); //add whirlygig
      var par = "nkey="+sits_escape_url($(sits_nkey_selector).val()); //build parameters
      par += "&mode=2&vers="+sits_ajax_version;
      par += "&pcod="+sits_escape_url(val);
      par += "&issc="+sits_escape_url(obj.issc);
      return sits_send_query("POST","siw_add_pick.ajax",par,true,"sits_do_postcode5"); //get formatted address
    }
	// show error (new dialog 352391)
    var btn = {};
    btn[obj.bp029] = function() {sits_dialog_close(true,"noPostCodeError");};
    sits_dialog(obj.bp007,obj.bp008,btn,true,true,false,0,"noPostCodeError");
    sits_dialog_resize(35,"noPostCodeError");
    return false;
  }
  return false;
}

//Internal function to perform lookup again (PPL016548)
function sits_do_postcode4() {
  var par = "nkey="+sits_escape_url($(sits_nkey_selector).val()); //build parameters
  par += "&mode=1&vers="+sits_ajax_version;
  par += "&pcod="+sits_escape_url($("#sits_pcodinp").val().toUpperCase());
  par += "&plutype="+sits_escape_url($("#plutype").val());

  // THOS1 - 11/09/2012 - PPL:024210 - Get country field id associated with button from data attribute of button
  var obj = $("#sits_pcoddia").data("butt");
  var vcountry_field_id = $("input[id="+sits_do_get_object(obj.id)+"]").data("associated_field_id");
  if(typeof(vcountry_field_id)=="string" && vcountry_field_id.length>0) { // country field specified
    // Get associated country field
    var vcountry_value = sits_get_value(vcountry_field_id);
    par += "&cntr="+sits_escape_url(vcountry_value.toUpperCase());
  }

  var con = "<div style=\"width:100%;margin-top:0px;margin-bottom:0px;height:100px\">";
  con += "<img src=\"../images/working.gif\" alt=\"...\"></div>";
  sits_dialog_update(con,null,"sits_pcoddia"); //update dialog
  sits_send_query("POST","siw_add_pick.ajax",par,true,"sits_do_postcode2"); //perform lookup
  return false; //don't submit form
}

//Internal function to return formatted address to screen (PPL016548)
// string res : in  ;the response string
function sits_do_postcode5(res) {
  var str = "";
  if(res.substr(0,4)=="<OK>") {
    var obj = sits_parse_json(res.substr(4)); //get data object
    var hit = sits_get_integer(obj.stat);
    if(hit==1) {
      var inp = $("#sits_pcoddia").data("targ"); //get postcode input
      var nam = inp.attr("name");
      var dot = nam.indexOf(".");
      if(dot>-1) {
        nam = nam.substr(dot); //get ".ent.dct.occ"
      }
      else {
        nam = ""; //not in an entity
      }
      var btn = $("#sits_pcoddia").data("butt"); //get postcode button
      var pre = btn.id;
      if(pre.indexOf("_")>0) {
        pre = pre.substr(pre.indexOf("_")+1); //get "HA" or "CA"
      }
      else {
        pre = ""; //no prefix
      }
      var add = obj.mess;
      inp.val(add.pcod).change(); //populate address fields
      // THOS1 - 01/11/2016 - PPL:0354306 - Mod To Update Postcode field
      if($("input[addf]").length > 0 ) {
        $("input[addf=1]:first").val(add.add1).change(); //if marked with "addf" attribute...
        $("input[addf=2]:first").val(add.add2).change();
        $("input[addf=3]:first").val(add.add3).change();
        $("input[addf=4]:first").val(add.add4).change();
        $("input[addf=5]:first").val(add.add5).change();
        $("input[addf=P]:first").val(add.pcod).change();
      }
      else {
        if($("input[data-addf]").length>0) {
          $("input[data-addf=1]:first").val(add.add1).change(); //if marked with "addf" attribute...
          $("input[data-addf=2]:first").val(add.add2).change();
          $("input[data-addf=3]:first").val(add.add3).change();
          $("input[data-addf=4]:first").val(add.add4).change();
          $("input[data-addf=5]:first").val(add.add5).change();
          $("input[data-addf=P]:first").val(add.pcod).change();
        }
        else {
          $("input[name$='"+pre+"D1"+nam+"']:first").val(add.add1).change(); //...else assume naming convention
          $("input[name$='"+pre+"D2"+nam+"']:first").val(add.add2).change();
          $("input[name$='"+pre+"D3"+nam+"']:first").val(add.add3).change();
          $("input[name$='"+pre+"D4"+nam+"']:first").val(add.add4).change();
          $("input[name$='"+pre+"D5"+nam+"']:first").val(add.add5).change();
          // THOS1 - 28/03/2017 - PPL:381719 - Changes for SIW_YCLR to work
          if ( $("input[name$='"+pre+"PCOD"+nam+"']:first").length > 0 ) {
            $("input[name$='"+pre+"PCOD"+nam+"']:first").val(add.pcod).change();
          } else if ( $("input[name$='"+pre+"PC"+nam+"']:first").length > 0 ) {
            $("input[name$='"+pre+"PC"+nam+"']:first").val(add.pcod).change();
          } else {
            $("input[name$='PCOD"+nam+"']:first").val(add.pcod).change();          
          }
        }
      }
      $("input[name$='LATI"+nam+"']").val(add.lati).change(); //include latitude/longitude
      $("input[name$='LONG"+nam+"']").val(add.lngi).change();
      return sits_dialog_close(true,"sits_pcoddia");
    }
    else {
      str = obj.mess; //show error message
    }
  }
  else {
    str = sits_html_encode(res); //show response
  }
  $("#sits_pcoddia").dialog("enable");
  $("#sits_pcoddia ~ div.ui-dialog-buttonpane button").prop("disabled",false);
  $("#sits_pcoddiv").html(str); //show error message
  return false;
}

//Internal function to show map link for selected address (PPL016548)
function sits_do_postcode6() {
  var sel = sits_get_object("pick1");
  if(sel) {
    var opt = sel.options[sel.selectedIndex]; //get selected option
    if(opt) {
      var val = opt.getAttribute("data-link"); //get link
      if(val!="") {
        var obj = $("#sits_pcoddia").data("json"); //get data object
        if(obj) {
          $("#sits_pcoddiv").html("<a href=\""+sits_escape_attr(val)+"\" target=\"_blank\">"+obj.bp016+"</a>"); //show link
          return true;
        }
      }
    }
  }
  $("#sits_pcoddiv").html(""); //clear link
  return false;
}

//Internal function to create Manual Address Entry dialog and allow user to enter address (352391)
function sits_do_postcodeME(obj) {
  var con = "";
  con = "<div class=\"sv-container-fluid\">";
  con += "<div class=\"sv-row\">";
  con += "<div class=\"sv-col-md-12\">";
  con += "<div class=\"sv-form-container\">";
  con += "<div class=\"sv-form-horizontal\">";
  con += "<fieldset>";
  con += "<legend class=\"sv-sr-only\">Manual Address Entry</legend>";
  // fields and lablessss
  con += "<span class=\"sv-form-additional-info sv-help-block sv-small\">"+obj.bp030+"</span>";
  con += "<div class=\"sv-form-group\">";
  con += "<label for=\"add1\" class=\"sv-col-sm-3 sv-control-label\">"+obj.bp024+"</label>";
  con += "<div class=\"sv-col-sm-4\"><input type=\"text\" class=\"sv-form-control\" id=\"add1\" maxlength=\"50\"></div>";
  con += "<span class=\"sv-col-sm-4  sv-help-block\"><span class=\"sv-trans-block\"/><span class=\"sv-error-block\"/></span>";
  con += "</div>";
  con += "<div class=\"sv-form-group\">";
  con += "<label for=\"add2\" class=\"sv-col-sm-3 sv-control-label\">"+obj.bp025+"</label>";
  con += "<div class=\"sv-col-sm-4\"><input type=\"text\" class=\"sv-form-control\" id=\"add2\" maxlength=\"50\"></div>";
  con += "<span class=\"sv-col-sm-4  sv-help-block\"><span class=\"sv-trans-block\"/><span class=\"sv-error-block\"/></span>";
  con += "</div>";
  con += "<div class=\"sv-form-group\">";
  con += "<label for=\"add3\" class=\"sv-col-sm-3 sv-control-label\">"+obj.bp026+"</label>";
  con += "<div class=\"sv-col-sm-4\"><input type=\"text\" class=\"sv-form-control\" id=\"add3\" maxlength=\"50\"></div>";
  con += "<span class=\"sv-col-sm-4  sv-help-block\"><span class=\"sv-trans-block\"/><span class=\"sv-error-block\"/></span>";
  con += "</div>";
  con += "<div class=\"sv-form-group\">";
  con += "<label for=\"add4\" class=\"sv-col-sm-3 sv-control-label\">"+obj.bp027+"</label>";
  con += "<div class=\"sv-col-sm-4\"><input type=\"text\" class=\"sv-form-control\" id=\"add4\" maxlength=\"50\"></div>";
  con += "<span class=\"sv-col-sm-4  sv-help-block\"><span class=\"sv-trans-block\"/><span class=\"sv-error-block\"/></span>";
  con += "</div>";
  con += "<div class=\"sv-form-group\">";
  con += "<label for=\"add5\" class=\"sv-col-sm-3 sv-control-label\">"+obj.bp028+"</label>";
  con += "<div class=\"sv-col-sm-4\"><input type=\"text\" class=\"sv-form-control\" id=\"add5\" maxlength=\"50\"></div>";
  con += "<span class=\"sv-col-sm-4  sv-help-block\"><span class=\"sv-trans-block\"/><span class=\"sv-error-block\"/></span>";
  con += "</div>";
  con += "<div class=\"sv-form-group\">";
  con += "<label for=\"pcodME\" class=\"sv-col-sm-3 sv-control-label\">"+obj.bp023+"</label>";
  con += "<div class=\"sv-col-sm-4\"><input type=\"text\" class=\"sv-form-control\" id=\"pcodME\" maxlength=\"12\"></div>";
  con += "<span class=\"sv-col-sm-4  sv-help-block\"><span class=\"sv-trans-block\"/><span class=\"sv-error-block\"/></span>";
  con += "</div>";
  
  con += "</fieldset>";
  con += "</div>";
  con += "</div>";
  con += "</div>";
  con += "</div>";
  con += "</div>";

  var btn = {}; //create buttons
  btn[obj.bp102] = function() {return sits_dialog_close(true,"sits_pcoddiaME");}; //add "cancel" button
  btn[obj.bp101] = function() {return sits_do_postcodeMEAccept();}; //add "select" button

  sits_dialog(sits_escape_attr(obj.bp104),con,btn,true,true,false,null,"sits_pcoddiaME"); //create dialog

  hidebutton(); // hide select button by default
  $("#sits_pcoddiaME").on("keyup","input",hidebutton); // on keyup, check if the Select button should be disabled
}

//Internal function to accept entered Manual Address from dialog and close dialog (352391)
function sits_do_postcodeMEAccept() {
  var inp = $("#sits_pcoddia").data("targ"); //get postcode input
  var nam = inp.attr("name");
  var dot = nam.indexOf(".");
  if(dot>-1) {
    nam = nam.substr(dot); //get ".ent.dct.occ"
  }
  else {
    nam = ""; //not in an entity
  }
  var btn = $("#sits_pcoddia").data("butt"); //get postcode button
  var pre = btn.id;
  if(pre.indexOf("_")>0) {
    pre = pre.substr(pre.indexOf("_")+1); //get "HA" or "CA"
  }
  else {
    pre = ""; //no prefix
  }

  var obj = sits_get_object("sits_pcoddiaME");

  //scrape the fields
  var add = {};
  $("#sits_pcoddiaME fieldset").find("input").each(function(i){
    add[this.id] = $(this).val();
	})

  //inp.val(add.pcodME).change(); SMIJ6, remove this as the address input might not be the post code field
  //populate address fields
  // THOS1 - 01/11/2016 - PPL:0354306 - Mod To Update Postcode field
  if($("input[addf]").length > 0 ) {
    $("input[addf=1]:first").val(add.add1).change(); //if marked with "addf" attribute...
    $("input[addf=2]:first").val(add.add2).change();
    $("input[addf=3]:first").val(add.add3).change();
    $("input[addf=4]:first").val(add.add4).change();
    $("input[addf=5]:first").val(add.add5).change();
    $("input[addf=P]:first").val(add.pcodME).change();
  }
  else {
    if($("input[data-addf]").length>0) {
      $("input[data-addf=1]:first").val(add.add1).change(); //if marked with "addf" attribute...
      $("input[data-addf=2]:first").val(add.add2).change();
      $("input[data-addf=3]:first").val(add.add3).change();
      $("input[data-addf=4]:first").val(add.add4).change();
      $("input[data-addf=5]:first").val(add.add5).change();
      $("input[data-addf=P]:first").val(add.pcodME).change();
    }
    else {
      $("input[name$='"+pre+"D1"+nam+"']:first").val(add.add1).change(); //...else assume naming convention
      $("input[name$='"+pre+"D2"+nam+"']:first").val(add.add2).change();
      $("input[name$='"+pre+"D3"+nam+"']:first").val(add.add3).change();
      $("input[name$='"+pre+"D4"+nam+"']:first").val(add.add4).change();
      $("input[name$='"+pre+"D5"+nam+"']:first").val(add.add5).change();
      // THOS1 - 28/03/2017 - PPL:381719 - Changes for SIW_YCLR to work
      if ( $("input[name$='"+pre+"PCOD"+nam+"']:first").length > 0 ) {
        $("input[name$='"+pre+"PCOD"+nam+"']:first").val(add.pcodME).change();
      } else if ( $("input[name$='"+pre+"PC"+nam+"']:first").length > 0 ) {
        $("input[name$='"+pre+"PC"+nam+"']:first").val(add.pcodME).change();
      } else {
        $("input[name$='PCOD"+nam+"']:first").val(add.pcodME).change();
      }
    }
  }
  $("input[name$='LATI"+nam+"']").val(add.lati).change(); //include latitude/longitude
  $("input[name$='LONG"+nam+"']").val(add.lngi).change();
  sits_dialog_close(true,"sits_pcoddia");
  return sits_dialog_close(true,"sits_pcoddiaME");
}

function hidebutton(){
  var anydata = false;
  $("#sits_pcoddiaME").find("input.sv-form-control").each(function(i){
    if( $(this).val() != "" ){
      anydata = true;
    }
  })
  if( anydata == false ) {//hide button 
    $("#sits_pcoddiaME").next("div.ui-dialog-buttonpane").find("button.ui-button:nth(1)").prop("disabled","disabled").addClass("ui-state-disabled").removeClass("ui-state-default");
  }else{  // show button
    $("#sits_pcoddiaME").next("div.ui-dialog-buttonpane").find("button.ui-button:nth(1)").prop("disabled","").removeClass("ui-state-disabled").addClass("ui-state-default");
  }
}
