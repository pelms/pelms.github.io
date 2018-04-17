//INTERNAL variables - don't touch!
//For variables that you can change, see "settings.js" file
if(typeof(sits_ajax_version)=="undefined") {
  var sits_ajax_version = "940.2"; //file version number
  var sits_cache_query = ""; //query string to be cached
  var sits_cache_array = []; //array which holds the cache of querys
  var sits_queue_array = []; //array which holds the queue of querys to be processed
  var sits_queue_busy = false; //indicates whether the queue is currently being processed
  var sits_queue_func = ""; //name of local function that will be called to process the results
  var sits_valid_array = []; //array which holds the cache of validation querys
  var sits_progress_iss = ""; //ISS code for the progress bar
  var sits_progress_int = 0; //repeat interval for the progress bar polling
  var sits_progress_cur = 0; //counter for the progress bar polling
  var sits_progress_now = 0; //time the progress bar was created
  var sits_jquery_ready = false; //indicates whether jQuery has finished loading
  var sits_dom_ready = false; //indicates whether the DOM has finished loading
  var sits_onload = function() {}; //function to run once jQuery has loaded
  var sits_files_array = {}; //array which holds all the included files
  var sits_grids_array = []; //array which holds information about each grid widget
  var sits_param_array = []; //array which holds the parameters for callback functions
  var sits_current_menu = null; //holds the object representing the current context menu
  var sits_ydal_select = null; //holds an HTML element to be cloned in YDAL screen
  var sits_ydal_select_srt = null; //holds an HTML element to be cloned in YDAL screen
  var sits_show_alerts = false; //indicates whether alerts should be shown(only if no console)
  var sits_nkey_selector = "input[name^='NKEY']:first"; //jQuery selector for NKEY field
  var sits_loaded = false; //indicates whether the "load" events have finished running
  var sits_bar_busy = false; //indicates whether the progress bar is busy
  var sits_file_counter = 0; //used to create unique ids when including files
  var sits_jquery_loc = "../plugins/javascript/jquery.js"; //jQuery file location
  var sits_jquery_loc_orig = sits_jquery_loc; //back up original location
  var sits_jqueryui_loc = "../plugins/javascript/jquery-ui.js"; //jQuery UI file location
  var sits_jqueryui_loc_orig = sits_jqueryui_loc; //back up original location
  var sits_loading_again = false; //indicates the file is loading for a second time
  var sits_onload_tries = 100; //number of tries to call onload whilst waiting for jQuery
  var sits_widget_bp = {}; //object containing localisation for some standard e:Vision widgets
  var sits_current_break = ""; //used during dialog auto-resize to track the current breakpoint (prior to any resize or change in orientation)
  var sits_page_errors = {}; //object holding page errors
  var sits_events = {}; //object holding flags to indicate if events have been registered
  var sits_portal_object = {}; //object holding items for use with required portal processing(e.g. the loading of the sv-portal.css stylesheet)
  var sits_dates_cache = {}; //object which holds the cache of converted date values(improve performance of Tablesaw date sorting)
  var sits_gapi_loaded = false; //indicates if google api has loaded
  var sits_gapi_auth_loaded = false; //indicates if google auth api has loaded
  var sits_gapi_picker_loaded = false; //indicates if google picker api has loaded
  var sits_ie_version = null; //indicates the IE version after calling "sits_ie_supported"
  var sits_user_timeout = ""; //key used to perform user timeout checks
}
else {
  sits_loading_again = true; //indicates the file is loading for a second time
}

//Include a javascript or stylesheet file
// string  url   : in ;the url of the file to include
// function  fnc : in ;the function to be triggered after file has loaded
// object  attr  : in ;plain object containing attributes for new element
function sits_include_file(url,fnc,attr) {
  switch(sits_files_array[url]) { //check cache
    case "Y": //already loaded
      if(typeof(fnc)=="function") {
        fnc(true); //run function straight away
      }
      return true;
    case "N": //currently loading
      if(typeof(fnc)=="function") {
        setTimeout(function(){sits_include_file(url,fnc)},100); //try again shortly
      }else{
        setTimeout("sits_include_file('"+url+"')",100); //try again shortly
      }
      return false;
    default:
      sits_files_array[url] = "N"; //store file as loading
  }
  if(typeof(fnc)!="function") {
    fnc = function(boo) {}; //create empty function
  }
  var href = url;
  if(href.indexOf("../")==0) {
    href += "?v="+sits_ajax_version; //add version to local files for caching
  }
  var extn = url.substr(url.lastIndexOf(".")+1).toUpperCase(); //extract extension
  var elem = null;
  switch(extn) {
    case "JS":
      elem = document.createElement("script"); //include javascript file
      elem.type = "text/javascript";
      elem.src = href;
      break;
    case "CSS":
      elem = document.createElement("link"); //include stylesheet file
      elem.type = "text/css";
      elem.rel = "stylesheet";
      elem.href = href;
      elem.media = "all";
      break;
  }
  if(elem) {
    elem.id = "sits"+sits_left_pad(++sits_file_counter,6,"0"); //create unique ID
    var boo = false;
    if(typeof(fnc)=="function") { //register onload event
      if(typeof(elem.onreadystatechange)!="undefined" && typeof(window.event)=="object" && !window.opera) { //IE
        elem.onreadystatechange = function() {
          if(this.readyState=="loaded" || this.readyState=="complete") {
            elem.onreadystatechange = null; //fix memory leak
            sits_do_include_file(url); //store file as loaded
            fnc(true); //run callback function (no way to catch error in IE)
          }
        };
      }
      else {
        elem.removeAttribute("onreadystatechange"); //remove test attribute
          elem.setAttribute("onload",""); //check for onload event
          if(typeof(elem.onload)!="undefined") { //Non-IE
            elem.removeAttribute("onload"); //remove test attribute
            elem.onload = function() {
              sits_do_include_file(url); //store file as loaded
              fnc(true); //run callback function
            };
            elem.onerror = function() {
              fnc(false); //run callback function (file not loaded)
            };
          }
          else {
            elem.removeAttribute("onload"); //remove test attribute
            boo = true; //couldn't register event...
          }
      }
    }
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(elem);
    if(boo) { //...so try script blocking
      elem = document.createElement("script");
      elem.appendChild(document.createTextNode("sits_do_include_file('"+url+"');")); //store file as loaded
      elem.appendChild(document.createTextNode(fnc.toString())); //run callback function
      head.appendChild(elem);
    }
    if ( typeof(attr) == "object" ){
      for ( var x in attr){
        if (attr.hasOwnProperty(x) ){
          elem.setAttribute(x, attr[x]);
        }
      }
    }
    return true;
  }
  return false;
}

//Internal function to mark file as included
// string url   : in ;the url of the file to include
function sits_do_include_file(url) {
  sits_files_array[url] = "Y";
  var arr = sits_param_array; //store array locally
  var l = arr.length;
  for(var i=0;i<l;i++) { //loop through items in array
    var par = arr[i];
    if(par.url==url) { //check function relates to this file
      var fnc = par.fnc;
      if(typeof(fnc)=="function") { //call function
        fnc(par.p01,par.p02,par.p03,par.p04,par.p05,par.p06,par.p07,par.p08,par.p09);
      }
      sits_param_array.splice(i,1); //delete from array
      i--;
      l--;
    }
  }
  //if we're including a CSS file then we may need to reparse the styles in IE8(when respond.js is in use)
  if(typeof respond==="object" && typeof respond.update==="function") {
    var extn = url.substr(url.lastIndexOf(".")+1).toUpperCase(); //extract extension
    if(extn==="CSS") { //reparse the document
      respond.update();
    }
  }
  return true;
}

//Internal function used for DOM check(IE only)
// - based on trick by Diego Perini - http://javascript.nwbox.com/IEContentLoaded/
function sits_ie_dom_check() {
  if(!sits_dom_ready) {
    try {
      document.documentElement.doScroll("left"); //try to scroll the document...
    }
    catch(err) {
      setTimeout("sits_ie_dom_check()",0); //...which fails if the DOM is not ready
      return false;
    }
    sits_dom_ready = true;
    sits_do_onload(); //attempt to run onload events
  }
  return true;
}

//Check when DOM is ready to be manipulated
if(!sits_loading_again) {
  if(document.addEventListener) { //Mozilla(and newest Webkit)
    document.addEventListener("DOMContentLoaded",function() {
      if(!sits_dom_ready) {
        sits_dom_ready = true;
        sits_do_onload(); //attempt to run onload events
      }
    },false);
  }
  else if(document.attachEvent) { //IE(fail safe - fires late)
    document.attachEvent("onreadystatechange",function() {
      if(document.readyState=="complete") {
        document.onreadystatechange = null; //fix memory leak
        if(!sits_dom_ready) {
          sits_dom_ready = true;
          sits_do_onload(); //attempt to run onload events
        }
      }
    });
    if(document.documentElement.doScroll && window==window.top) { //IE(trick - fires first)
      sits_ie_dom_check();
    }
  }
  sits_do_attach_event(window,"load",function() { //fail safe
    if(!sits_dom_ready) {
      sits_dom_ready = true;
      sits_do_onload(); //attempt to run onload events
    }
  });
}

//Include other required files
if(!sits_loading_again) {
	if(typeof sits_jquery_cdn!=="undefined") {
		sits_include_settings(); //already loaded, so skip the step
	}
	else {
    sits_include_file("../javascript/settings.js",sits_include_settings); //load the settings file
  }
  if(typeof(JSON)!="object") {
    sits_include_file("../javascript/json2.min.js"); //add json parsing(if not supported natively)
  }
}

//Called after including settings file
function sits_include_settings(setStatus) {
  if(typeof(sits_anim_speed)!=="number" || sits_anim_speed<1 || sits_anim_speed>1000) {
    sits_anim_speed = 100; //default 100ms
  }
  if(typeof(sits_century_break)!=="number" || sits_century_break<1 || sits_century_break>99) {
    sits_century_break = 20; //default 2019 and 1920
  }
  if(typeof(sits_jquery_cdn)!=="number" || sits_jquery_cdn<0 || sits_jquery_cdn>5) {
    sits_jquery_cdn = 0; //default local files
  }
  if(typeof(sits_native_widgets)!=="number" || sits_native_widgets<0 || sits_native_widgets>2) {
    sits_native_widgets = 0; //default jQuery UI
  }
  if(typeof(sits_date_format)!=="string" || sits_date_format=="") {
    sits_date_format = "dd/M/yy"; //default 01/Jan/2001
  }
  if(typeof(sits_time_format)!=="string" || sits_time_format=="") {
    sits_time_format = "H2:N2"; //default 09:30
  }
  if(typeof(sits_button_text)!=="string") {
    sits_button_text = "..."; //default "..." (can be blank)
  }
  if(typeof(sits_year_range)!=="string" || sits_year_range=="") {
    sits_year_range = "-100:+50"; //default 100 years before and 50 years after current year
  }
  if(typeof(sits_breakpoints)!=="object") {
  	sits_breakpoints = {"lg": Infinity, "md": 1199, "sm": 991, "xs": 767}; //defaults required for large, medium, small and extra-small(max width for each)
  }
  if(typeof(sits_auto_table_widgets)!=="boolean" || sits_auto_table_widgets!==false) {
  	sits_auto_table_widgets = true; //table widgets initialise automatically by default
  }
  if(typeof(sits_datatable_responsive)!=="boolean" || sits_datatable_responsive!==false) {
  	sits_datatable_responsive = true; //datatables are responsive by default(if the responsive plugin is available)
  }
  if(typeof(sits_dialog_scaling)!=="object") {
  	sits_dialog_scaling = {"lg": 1, "md": 1.1, "sm": 1.5, "xs": 3}; //default scaling factors required for large, medium, small and extra-small
  }
  if(typeof(sits_dialog_height)!=="object") {
  	sits_dialog_height = {"lg": 0.95, "md": 0.95, "sm": "", "xs": ""}; //default maximum height ratios(1 would be 100% of the current window)
  }
  if(typeof(sits_auto_resize)!=="boolean") {
  	sits_auto_resize = true; //auto processing during resizing
  }

	if(typeof(sits_use_portal_css)!=="boolean") {
		sits_use_portal_css = true; //use portal CSS when needed by default
	}
  if(typeof(sits_min_tab_width)!=="number") {
    sits_min_tab_width = 150; //default 150 pixels for minimum tab width
  }

  switch(sits_jquery_cdn) {
    case 1: //jQuery CDN
      sits_jquery_loc = "//code.jquery.com/jquery-1.11.3.min.js";
      sits_jqueryui_loc = "//code.jquery.com/ui/1.11.4/jquery-ui.min.js";
      break;
    case 2: //Google API CDN
      sits_jquery_loc = "//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js";
      sits_jqueryui_loc = "//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js";
      break;
    case 3: //Microsoft Ajax CDN
      sits_jquery_loc = "//ajax.aspnetcdn.com/ajax/jQuery/jquery-1.11.3.min.js";
      sits_jqueryui_loc = "//ajax.aspnetcdn.com/ajax/jquery.ui/1.11.4/jquery-ui.min.js";
      break;
    case 4: //Cloud Flare CDN
      sits_jquery_loc = "//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js";
      sits_jqueryui_loc = "//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js";
      break;
    case 5: //for testing only
      sits_jquery_loc = "//www.mysits.com/should-fail-then-fall-back-to-local/jquery.js";
      sits_jqueryui_loc = "//www.mysits.com/should-fail-then-fall-back-to-local/jqueryui.js";
      break;
  }
  if(typeof(sits_use_minified)!="boolean") {
    sits_use_minified = true;
  }
  if(typeof($)=="function") {
    sits_include_jquery(); //already included, so skip to the next step
  }
  else {
    sits_include_file(sits_jquery_loc,sits_include_jquery); //include jQuery files
  }
}

//Called to include jQuery files
function sits_include_jquery(jqStatus) {
  if(typeof($)=="function") {
  	if(typeof($)=="function" && typeof($.ui)=="object") { //already included, so skip to the next step
  		sits_include_jqueryui();
  	}
  	else {
      sits_include_file(sits_jqueryui_loc,sits_include_jqueryui);
      sits_include_file("../plugins/css/ui/sits-ui.css"); //include jQuery UI styles
    }
  }
  else {
    if(sits_jquery_loc!=sits_jquery_loc_orig) { //if using CDN...
      sits_jquery_loc = sits_jquery_loc_orig; //...then try local files
      sits_jqueryui_loc = sits_jqueryui_loc_orig;
      sits_include_file(sits_jquery_loc,sits_include_jquery);
    }
    else {
      sits_putmess("Error: jQuery has failed to load, this page may not appear correctly.");
      return false;
    }
  }
  return true;
}

//Called to include jQuery files
function sits_include_jqueryui(uiStatus) {
  if(typeof($)=="function" && typeof($.ui)=="object") {
    sits_jquery_ready = true;
    sits_do_onload(); //attempt to run onload events
  }
  else {
    if(sits_jqueryui_loc!=sits_jqueryui_loc_orig) { //if using CDN...
      sits_jqueryui_loc = sits_jqueryui_loc_orig; //...then try local file
      sits_include_file(sits_jqueryui_loc,sits_include_jqueryui);
    }
    else {
      sits_putmess("Error: jQuery UI has failed to load, this page may not appear correctly.");
      return false;
    }
  }
  return true;
}

//Called to run any function registered as onload event
function sits_do_onload() {
  if(!sits_jquery_ready || !sits_dom_ready) { //check readiness
    return false;
  }
  if(typeof($)!="function" || typeof($.ui)!="object") { //jQuery(or UI) not parsed yet
    if(--sits_onload_tries>0) {
      setTimeout("sits_do_onload()",150-sits_onload_tries); //retry 100 times
    }
    else {
      sits_jquery_ready = false; //failed to parse the files
      if(typeof($)!="function") {
        sits_putmess("Error: jQuery has failed to parse, this page may not appear correctly.");
      }
      else {
        sits_putmess("Error: jQuery UI has failed to parse, this page may not appear correctly.");
      }
    }
    return false;
  }

  //if any scripts have been loaded inline then we need to include them in the file array so sits_include_file doesn't try and include them again
  sits_do_onload_scripts();

  //perform any portal initialisation (when in the portal)
  sits_do_portal_checks();

  //perform any table widget initilisation (for datatables and tablesaw)
  sits_do_onload_tables();

  //check for financial totals which need to be kept in line
  sits_financial_totals();

  //check for user timeout warnings
  sits_user_timeouts();

  //check for any page errors and display
  if(typeof(sits_page_errors)=="object") {
    sits_process_inline_errors(sits_page_errors);
  }

  //attach the resize event used by any automatic resizing (if enabled)
  if(sits_auto_resize) {
  	$(window).on("resize",sits_debounce_event(sits_do_auto_resize1,250));
		sits_do_auto_resize2(); //make initial call to perform setup
  }

  //finally, run any registered function
  var fnc = sits_onload;
  sits_onload = null; //tells "sits_attach_event" that onload has fired
  if(typeof(fnc)=="function") {
    fnc(); //run function
  }

  sits_loaded = true; //indicate initial loading finished
  return true;
}

//Update the file array with any pre-loaded scripts
function sits_do_onload_scripts() {
	$("script[src]").each(function() {
    var src = $(this).attr("src"); //access the non-translated src value
    if(src.indexOf("?")>-1) src = src.substring(0,src.lastIndexOf("?")); //strip any versioning from query string

    sits_files_array[src] = "Y"; //include in the array of files loaded
	});
}

//check to see if we're in the portal and whether the portal stylesheet and processing may be necessary
function sits_do_portal_checks(breakpoint) {
	//make quick check to see if we're in the portal(uses global variable set by siw_portal HTS)
	if(typeof(sits_portal_object.inPortal)==="undefined") {
		if(typeof(sits_in_portal)!=="boolean"||!sits_in_portal) {
			sits_portal_object.inPortal = false;
			sits_portal_object.hasAffected = false;

			return; //we're not in the portal, so don't need to perform any further checks
		}
		else {
			sits_portal_object.inPortal = true;
		}
	}
	if(sits_portal_object.inPortal!==true) return; //not in the portal, so no further checks

	//see if the inclusion of the additional stylesheet is disabled(if so, no further checks)
	if(!sits_use_portal_css) return;

	//see if there are any containers that might benefit from the additional processing
	if(typeof(sits_portal_object.hasAffected)!=="boolean") {
		//we look for specific classes to denote that multiple columns are showing
		sits_portal_object.hasAffected =($(".sv-portal-2-col").length>0)?true:false;
	}
	if(!sits_portal_object.hasAffected) return; //no affected containers, so no further checks

	//see if the current breakpoint is affected(smaller screensizes fallback to single column so don't need the processing)
	breakpoint =(typeof(breakpoint)!=="undefined"&&breakpoint!=="")? breakpoint : sits_get_breakpoint();

	if(breakpoint==="xs"||breakpoint==="sm") { //xs and sm fall back to single column, so processing isn't required
		sits_portal_object.isDisabled = true;
	}
	else {
		sits_portal_object.isDisabled = false;
	}

	//load the additional stylesheet(if necessary)
	if(!sits_portal_object.isDisabled) {
		if(!sits_portal_object.cssLoaded) {
			sits_portal_object.cssLoaded = true;
			sits_portal_object.cssDisabled = false;

			sits_include_file("../css/sv-portal.css",function(success){
				if(!success){ //stylesheet didn't load, so no further processing needed
					return;
				}

				//now that the stylesheet has loaded, we may need to re-check any tablesaw tables to see if their mode needs to change
				if(sits_portal_object.hasAffected&&!sits_portal_object.isDisabled) {
					sits_do_auto_resize3(breakpoint,true);
					sits_financial_totals(); //also reset any financial totals (as the we might have changed the xs breakpoint for two-column layouts)
				}
			});
		}
		else {
			//stylesheet loaded previously, so enable it if it's currently disabled
			if(sits_portal_object.cssDisabled) {
				sits_portal_object.cssDisabled = false;
				sits_stylesheet_enable("sv-portal.css",true);
				sits_financial_totals(); //also reset any financial totals
			}
		}
	}
	else {
		//if stylesheet is enabled then we need to disable it(to disable the styles)
		if(sits_portal_object.cssLoaded&&!sits_portal_object.cssDisabled) {
			sits_portal_object.cssDisabled = true;
			sits_stylesheet_enable("sv-portal.css",false);
			sits_financial_totals(); //also reset any financial totals
		}
	}
}

//perform any table widget processing upon page load(for DataTables and Tablesaw)
function sits_do_onload_tables() {
	//see if either tablesaw or datatables are available(i.e. has the JS been loaded)
	var tablesaw_loaded =(typeof Tablesaw==="object")?true:false, datatables_loaded =(typeof $.fn.DataTable==="function")?true:false;
	if(!tablesaw_loaded&&!datatables_loaded) return;

	//initialise the default Tablesaw boilerplates prior to any initialising of the widget(so we have them even if auto-initialise is disabled)
	if(tablesaw_loaded&&typeof sits_widget_bp==="object"&&typeof sits_widget_bp.ts==="object") {
		Tablesaw.i18n = $.extend(true,{},sits_widget_bp.ts);
	}

	//see if we've disabled the automatic initialisation of tables
	if(!sits_auto_table_widgets) return;

  //find all the tables on the page and decide what to do for each
  var table, dt_breakpoints, breakpoint, tablesaw_mode;
  $("table").each(function() {
  	table = $(this);

    //if this table is using the tablesaw widget initialise it
    tablesaw_mode = table.data("tablesaw-mode");
    if(tablesaw_loaded&&tablesaw_mode) { //initialise tablesaw
    	if(typeof breakpoint==="undefined") breakpoint = sits_get_breakpoint();

    	sits_tablesaw_widget(table,tablesaw_mode,breakpoint);
    }
    else {
    	if(datatables_loaded&&table.data("sv-dt")==="Y") { //initialise datatables
    		if(typeof dt_breakpoints==="undefined") dt_breakpoints = sits_get_dt_breakpoints(); //get the breakpoints for responsive DT

        table.parent().removeClass("sv-table-responsive");

        //get the options for the datatable(attributes can be used to control this)
        var opt = sits_datatable_params(table,{},dt_breakpoints);

        //set up the responsive datatable?
        table.DataTable(opt);
    	}
    }
  })
}

//Internal function to check and see if we need to trigger an auto-resize
function sits_do_auto_resize1(event) {
	//jQuery resize events(like resizing the dialog) bubble so make sure it's the resize event we want(the one on the window)
	//An IE8 issue means we can't easily determine whether the target is the window or not, so we check nodeType to confirm
	if((typeof window.event==="undefined"&&event.target!==window)||(typeof window.event!=="undefined"&&event.target.nodeType!==undefined&&event.target.nodeType!==9)) return;

	//trigger the auto-resize calculations
	sits_do_auto_resize2();
}

//Internal function to actually perform the automatic resizing of dialogs and some widgets
function sits_do_auto_resize2() {
	var winsiz = sits_window_size();

	//see if we've previously determined the breakpoint - if we haven't then do so now then stop(as we can't have called this before)
	if(typeof(sits_current_break)==="undefined"||sits_current_break==="") {
		sits_is_resized("SitsAr",winsiz); //initialise "old" window width and height whilst we're on
		sits_current_break = sits_get_breakpoint();
		return;
	}

	//Safari IOS triggers resize events at unusual times(such as when scrolling) so we need to check whether a screen resize has actually happened
	var resizemode = sits_is_resized("SitsAr",winsiz); //returns none, both, height, or width
	if(resizemode==="none") return; //no screen resize has actually happened

	var breakpoint = sits_get_breakpoint(); //get the current breakpoint
	var isdisabled = sits_portal_object.isDisabled; //get the current "disabled" value

	//if we're showing the portal then we need to perform some additional checks
	sits_do_portal_checks(breakpoint);

	var triggerresize = false;

	//if we're permitting tablesaw (or an editor) to switch to/from stack at the mobile breakpoint then see if we need to do anything
	var tablesaw_check = false, tablesaw_portal_check = false;
	if(sits_portal_object.hasAffected&&(!sits_portal_object.isDisabled||(sits_portal_object.isDisabled&&typeof(isdisabled)==="boolean"&&!isdisabled))) {
		//we're in the portal and additional processing is enabled(i.e. there are multiple columns in use) or was previously, so we need to check table by table
		tablesaw_check = true;
		tablesaw_portal_check = true;
	}
	else {
		//if we're not in the portal then we only need to process if we've switched to or from the mobile breakpoint
		if(breakpoint!==sits_current_break&&(sits_current_break==="xs"||breakpoint==="xs")) {
			tablesaw_check = true;
		}
	}

	if(tablesaw_check) {
		//switch mode on any tablesaw tables or editors that need it (returns true if a table or editor has been changed)
		triggerresize = sits_do_auto_resize3(breakpoint,tablesaw_portal_check);
	}

	sits_current_break = breakpoint;

	//work through each dialog currently visible on screen and adjust to take the relevant scaling factor in to account
	if(resizemode!=="height") { //skip if we've only amended the height so that showing/hiding software keyboard on some touch screens doesn't cause excessive movement
    //check search input (should be hidden unless in use)
    var ssi = $("#sits_search_input_sm:visible");
    if(ssi.length>0) {
      if(ssi.is(":focus")) {
        $("#sits_search_button_sm").focus(); //shift focus from input to button
      }
      sits_hide(ssi); //hide input field
    }

		var dlg, wid;
		$(".ui-dialog-content").each(function() {
			dlg = $(this);

			//if the dialog is currently visible then we need to resize it
			if(dlg.is(":visible")) {
				wid = dlg.data("sv-dialog-width"); //get the original width(%age) for the dialog
				if(typeof(wid)==="number") {
					var sizobj = sits_do_dialog_size(wid);
	        var newwid = false;

	        if(dlg.dialog("option","width")!==sizobj.calc) { //adjust width if it needs to change(works around IE8 issue)
	          dlg.dialog("option","width",sizobj.calc); //adjust width of dialog
	          newwid = true;
	        }

	    		//try to reposition or close some of the standard widgets(datepicker, timepicker, etc)
 	   			if($("#ui-datepicker-div").is(":visible")) { //datepicker is currently showing
 	        	if(!newwid) {
 	          	return; //don't resize this dialog if the width is the same
 	         	}
 	         	var lastInput = $($.datepicker._lastInput).datepicker("hide"); //hide last input - uses *internal* variable(not ideal)
 	         	setTimeout(function() {
 	          	lastInput.datepicker("show"); //show again after delay
 	         	},100);
 	   			}

					//set the height of the dialog
  				sits_do_dialog_height(dlg,sizobj.maxhgt);

					//re-centre the dialog
					//dlg.dialog("option","position",{"my":"center","at":"center","of":window,"collision":"fit"});

        	//try repositioning dynamic listbox if it is open(as auto-resize of dialog doesn't trigger normal resize)
					if(typeof(dmu_on_resize)==="function") {
						dmu_on_resize();
					}

 	   			//trigger a resize event to let the dialog know it might need to do something
    			dlg.trigger("dialogresize");
				}
			}
		});
	}

	//trigger a window resize event if something has changed that might affect the overall display (like switching from or to stack mode)
	if(triggerresize) {
		$(window).trigger("resize");
	}
}

//Internal function to deal with auto-resizing of tablesaw and editors
function sits_do_auto_resize3(bp,por) {
	//see if we have any tables that permit mode switching
	var table, mode, new_mode, changed = false;
	$("table[data-tablesaw-allow-stack]").each(function() {
		table = $(this);

		if(table.attr("data-tablesaw-allow-stack")==="Y"&&table.hasClass("tablesaw")) {
			mode = table.attr("data-tablesaw-mode");
			new_mode = "";

			//if we're in the right portal content mode then we need to perform table-specific processing(as element/container breakpoints might be in use)
			if(typeof(por)==="boolean"&&por) {
				if(sits_do_get_portal_breakpoint(table)==="xs") {
					if(mode!=="stack") {
						new_mode = "stack"; //swap to stack
					}
				}
				else {
					if(mode==="stack") {
						new_mode = table.attr("data-tablesaw-orig-mode"); //swap to the non-mobile mode(whatever that is)
					}
				}
			}
			else {
				//not in portal content mode, so just use the normal breakpoints
				if(bp==="xs"&&mode!=="stack") {
					new_mode = "stack"; //swap to stack as we're moving in to the mobile breakpoint
				}
				else if(sits_current_break==="xs"&&mode==="stack") {
					new_mode = table.attr("data-tablesaw-orig-mode"); //swap to the non-mobile mode(whatever that is)
				}
			}

			if(typeof(new_mode)!=="undefined"&&new_mode!=="") {
				//reset the table
				table.data("table").destroy();

				//update the tablesaw mode
				table.attr("data-tablesaw-mode",new_mode);

				//initialise the plugin again
				table.table();

				//we have changed at least one table
				changed = true;
			}
		}
	});

	//now see if we have any editors that need refreshing (Note: we only adjust those editors that are using the default config files so we don't hide required functionality)
	var ele, needs_change, orig_config, is_mobile;
	$("textarea[data-sv-editor-def-config='Y']").each(function(){
		ele = this;
		is_mobile = "";

		//get the original config info for this editor
		orig_config = $(ele).data("sv-editor-options");
		if(typeof orig_config=="object"){
			is_mobile = orig_config.isMobile;
		}

		//this is an editor using a default config, so if we've switched either to or from the "xs" breakpoint then refresh it
		var needs_change = false;

		if(typeof is_mobile=="boolean"){
			if(typeof(por)==="boolean"&&por) {
				//if the portal checks are needed then the relevant breakpoint needs to be determined
				if(sits_do_get_portal_breakpoint(ele)==="xs") {
					if(!is_mobile) {
						needs_change = true; //switch to mobile
					}
				}
				else {
					if(is_mobile) {
						needs_change = true; //switch to non-mobile
					}
				}

			}
			else{
				//not in portal content mode, so just use the normal breakpoints
				if(bp==="xs"&&!is_mobile) {
					needs_change = true; //switch to mobile config as we're moving in to the mobile breakpoint
				}
				else if(sits_current_break==="xs"&&is_mobile) {
					needs_change = true; //swap to the non-mobile config
				}
			}
		}

		//if the editor needs changing then refresh it
		if(needs_change){
			changed = true;

			//refresh the editor - uses the original options from the last initialisation
			sits_editor(ele.id,"","","",true);
		}
	});

	return changed;
}

//determine whether a screen resize affects width, height, both, or none (none is used if there has been no change since the function was last called)
// string id :in ;the identifier to use in determining whether the screen has resized since the last call to this function with that same unique id
// object  winsiz  : in ;object containing the window size (x and y) in the format returned by sits_window_size
// string mode :out ;resized in width/height/both/none
function sits_is_resized(id,winsiz) {
	if(typeof(id)!=="string"||id===""){
		return "none"; //unable to run without an id
	}
	if(typeof(winsiz)!=="object") {
		winsiz = sits_window_size();
	}

	var resizemode = "none"; //assume no change by default

	var win = $(window), oldh, oldw = win.data("old"+id+"Width"), newh, neww;
	if(typeof oldw!=="undefined") {
		neww = winsiz.x;
		if(oldw==neww) {
			//if width is the same then we check the height
			oldh = win.data("old"+id+"Height");
			newh = winsiz.y;

			if(oldh!=newh) {
				resizemode = "height"; //only height is different
			}
			else {
				return resizemode; //no change
			}
		}
		else {
			oldh = win.data("old"+id+"Height");
			newh = winsiz.y;
			if(oldh!=newh) {
				resizemode = "both"; //height and width are both different
			}
			else {
				resizemode = "width";
			}
		}
	}
	else {
		neww = winsiz.x;
		newh = winsiz.y; //we assume no change if we've made it here(as it means the function hasn't been run before)
	}

	//update the previous height and width values ready for the next check
	win.data("old"+id+"Width",neww);
	win.data("old"+id+"Height",newh);

	return resizemode;
}

//Debounce events(such as resize)
// function func :in ;function normally called when event fires that you want to throttle/debounce
// numeric wait :in ;minimum time to wait(in ms) before triggering the function again (if the event continues firing)
// boolean immediate :in ;trigger the function immediately (on the leading rather than trailing edge)
function sits_debounce_event(func,wait,immediate) {
  var timeout;
	return function() { //based on function from Underscore.js library
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if(!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if(callNow) func.apply(context, args);
	};
}

//Get the breakpoints to use for a responsive instance of DataTables
function sits_get_dt_breakpoints() {
	//we use sits_breakpoints(from settings.js) as the basis, so just convert them in to the format required by datatables
	var breakpoints = [];
	breakpoints[0] = {"name":"sv-dt-lg","width":sits_breakpoints.lg};
  breakpoints[1] = {"name":"sv-dt-md","width":sits_breakpoints.md};
  breakpoints[2] = {"name":"sv-dt-sm","width":sits_breakpoints.sm};
  breakpoints[3] = {"name":"sv-dt-xs","width":sits_breakpoints.xs};

	return breakpoints;
}

//Set the page opacity for an object
//  element  obj   : in ;the object to set the opacity for
//  numeric  val   : in ;the value of the opacity between 0(clear) and 100(solid)
function sits_set_opacity(obj,val) {
  if(typeof(obj)=="undefined" || val<0 || val>100) { //check parameters
    return false;
  }
  if(val>1) {
    val = val/100; //convert percentage in ratio
  }
  $(obj).fadeTo(sits_anim_speed,val); //use jQuery function
  return true;
}

//Position an object in the middle of the screen
// element  obj  : in ;the object to center
// numeric  val  : in ;the value of the width between 0 and 100(percent)
function sits_screen_center(obj,val) {
  if(typeof(obj)=="undefined") { //check parameters
    return false;
  }
  if(val<1 || val>100) {
    val = null; //default to use objects actual width
  }
  var mol = 0;
  var mot = 0;
  var mow = obj.offsetWidth;
  var moh = obj.offsetHeight;
  var mso = sits_scroll_offset();
  var mws = sits_window_size();
  if(mow==null || mow==0 || mow>=mws.x) { //calculate left position using the screen width
    mol = mso.x;
    mow = null; //don't set the width of the object - just leave it as it is
  }
  else {
    if(val==null) { //width not specified so use calculated width of object
      mol = mso.x+((mws.x*(mow/mws.x))/2);
      mow =(mws.x*(mow/mws.x));
    }
    else {
      mol = mso.x+((val!=100)?((mws.x*((100-val)/100))/2):0);
      mow =((val!=100)?(mws.x*(val/100)):mws.x);
    }
  }
  if(moh==null || moh==0 || moh>=mws.y) { //calculate top position using the screen height
    mot = mso.y;
  }
  else {
    mot = mso.y+((mws.y-moh)/2);
  }
  obj.style.left = mol+"px"; //set object position
  obj.style.top = mot+"px";
  if(mow!=null) {
    obj.style.width = mow+"px";
  }
  return true;
}

//Get an object with x and y values related to the offset of the current page(i.e. how far it has scrolled)
function sits_scroll_offset() {
  var mos = {};
  if(window.pageYOffset || window.pageXOffset) { //Non-IE
    mos.x = window.pageXOffset;
    mos.y = window.pageYOffset;
  }
  else if(document.documentElement &&(document.documentElement.scrollLeft || document.documentElement.scrollTop)) { //IE 6+ Strict
    mos.x = document.documentElement.scrollLeft;
    mos.y = document.documentElement.scrollTop;
  }
  else { //IE 5 or quirks
    mos.x = document.body.scrollLeft || 0;
    mos.y = document.body.scrollTop || 0;
  }
  return mos;
}

//Get the current style of an object
// element  obj  : in ;the object to get style of
// string  nam  : in ;the style property to get(hypenated)
function sits_get_style(obj,nam) {
  if(typeof(obj)=="undefined" || nam=="") { //check parameters
    return "";
  }
  var val = "";
  if(typeof($)!="function") {
    if(document.defaultView && document.defaultView.getComputedStyle) {
      nam = nam.replace(/[A-Z]/g,function(str) { //convert name into hypenated
        return "-"+str.toLowerCase();
      });
      val = document.defaultView.getComputedStyle(obj,"").getPropertyValue(nam); //get current style
    }
    else if(obj.currentStyle) {
      nam = nam.replace(/\-(\w)/g,function(str,p1) { //convert name into camel case
        return p1.toUpperCase();
      });
      val = obj.currentStyle[nam]; //get current style
    }
  }
  else {
    val = $(obj).css(nam); //use jQuery
  }
  return val;
}

//Register an event
// element  obj  : in ;the object to attach the event to
// string  evt  : in ;the name of the event to attach
// function  fnc  : in ;the function to be triggered by the event
function sits_attach_event(obj,evt,fnc) {
  if(typeof(obj)=="undefined" || evt=="" || typeof(fnc)!="function") { //check parameters
    return false;
  }
  if(evt=="load") { //custom event
    if(typeof(sits_onload)!="function") { //onload has already fired...
      setTimeout(fnc,10); //...so run the function now
    }
    else {
      var old = sits_onload;
      sits_onload = function() { //add new function to existing function
        old();
        fnc();
      };
    }
    return true;
  }
  if(evt.substr(0,2)=="on") {
    evt = evt.substr(2); //trim "on" just in case
  }
  if(evt=="load") {
    obj = window; //attach load to window
  }
  if(typeof($)!="function") { //check if jQuery ready
    return sits_do_attach_event(obj,evt,fnc);
  }
  else {
    $(obj).bind(evt,fnc); //use jQuery to register event
  }
  return true;
}

//Internal function to register an event pre-jQuery
// element  obj : in ;the object to attach the event to
// string evt : in ;the name of the event to attach
// function fnc : in ;the function to be triggered by the event
function sits_do_attach_event(obj,evt,fnc) {
  if(obj.addEventListener) { //Mozilla
    obj.addEventListener(evt,fnc,false);
    return true;
  }
  else {
    if(obj.attachEvent) { //IE
      obj.attachEvent("on"+evt,fnc);
      return true;
    }
  }
  return false; //could not be registered
}

//Unregister an event
// element  obj  : in ;the object to detach the event from
// string  evt  : in ;the name of the event to detach
// function  fnc  : in ;the function that was triggered by the event
function sits_detach_event(obj,evt,fnc) {
  if(typeof(obj)=="undefined" || evt=="" || typeof(fnc)!="function") { //check parameters
    return false;
  }
  if(evt.substr(0,2)=="on") {
    evt = evt.substr(2); //trim "on"
  }
  if(evt!="load") { //can't unregister "onload" events
    $(obj).unbind(evt,fnc); //use jQuery to unregister event
  }
  return true;
}

//Get the current mouse position
// event  e  : in ;the event which has just fired
function sits_mouse_offset(e) {
  e = e || window.event;
  var m = sits_scroll_offset(); //get current scroll position
  m.x += e.clientX; //add coordinates
  m.y += e.clientY;
  return m; //return coordinates {x,y}
}

//Get the position of the specified object
// element  o  : in ;the object to get the position of
// boolean  b  : in ;indicates whether this is relative to the whole page or not
function sits_object_offset(o,b) {
  if(typeof(b)=="undefined") {
    b = false; //default is relative to screen(not page)
  }
  var curleft =(o.offsetLeft-o.scrollLeft); //get coordinates
  var curtop =(o.offsetTop-o.scrollTop);
  while(o=o.offsetParent) { //loop through parents adding their coordinates
    if(o.tagName=="BODY" || o.tagName=="HTML") { //some browsers apply scroll to body/html others to document...
      if(b) { //(relative to page)
        var s = sits_scroll_offset(); //...so find the scroll values the hard way...
        curleft +=(o.offsetLeft-s.x);
        curtop +=(o.offsetTop-s.y);
      }
      else { //(relative to screen)
        curleft += o.offsetLeft;
        curtop += o.offsetTop;
      }
    }
    else {
      curleft +=(o.offsetLeft-o.scrollLeft); //...otherwise use the easy way
      curtop +=(o.offsetTop-o.scrollTop);
    }
  }
  return {x:curleft,y:curtop}; //return coordinates {x,y}
}

//Get the dimensions of the specified object
// element  o  : in ;the object to get the dimensions of
function sits_object_size(o) {
  return {x:o.offsetWidth,y:o.offsetHeight}; //return dimenions {x,y}
}

//Get the dimensions of the window
function sits_window_size() {
  var msw = 0;
  var msh = 0;
  if(typeof($)!="function") {
    msw = document.compatMode=="CSS1Compat" && document.documentElement.clientWidth || document.body.clientWidth;
    msh = document.compatMode=="CSS1Compat" && document.documentElement.clientHeight || document.body.clientHeight;
  }
  else {
    msw = $(window).width(); //use jQuery
    msh = $(window).height();
  }
  return {x:msw,y:msh}; //return dimenions {x,y}
}

//Set the focus to the specified object id
// string  id  : in ;the id of the object to set focus to
function sits_set_focus(id) {
  var obj = sits_get_object(id);
  if(!obj){
    return false; //object not found
  }
  //check if its a chosen widget
  if ( $("#"+sits_do_get_object(id)+"_chosen").length == 1){
    $("#"+sits_do_get_object(id)+"_chosen").children("a:first").focus();
    return true;
  }
  obj.focus(); //set focus
  return true;
}


//Get the value of the specified object id
// string  id  : in ;the id of the object to get the value of
function sits_get_value(id) {
  var obj = null;
  if(typeof(id)=="string") {
    obj = sits_get_object(id); //get object from id
  }
  else {
    obj = id; //object was passed in
  }
  if(!obj) {
    return ""; //object not found
  }
  switch(obj.tagName) {
    case "INPUT":
      var typ = obj.getAttribute("type").toUpperCase();
      if(typ=="RADIO") { //radiogroup
        var rad = document.getElementsByName(obj.name);
        for(var i=0;i<rad.length;i++) {
          if(rad[i].checked) {
            return rad[i].value; //return checked value
          }
        }
        return "";
      }
      if(typ=="CHECKBOX") { //checkbox
        if(obj.checked) {
          return "Y";
        }
        return "N";
      }
      if(typ=="DATE") { //date
        return sits_atom_to_date(obj.value);
      }
      if(typeof($)=="function") { //dynamic listbox
        var fld_jq = $(obj);
        if(fld_jq.hasClass("dmu_enabled")) {
          var valu = fld_jq.data("dmu-curr");
          if(typeof(valu)=="string" && valu!="") {
            return valu;
          }
        }
      }
      return obj.value; //textbox
    case "SELECT":
      if(obj.selectedIndex>-1) {
        if(obj.multiple==true) { // added by PPL025893 to handle multi select widgets
          var vValues = "";
          for(var i=0;i<obj.options.length;i++) {
            if(obj.options[i].selected) {
              if(vValues=="") {
                vValues = obj.options[i].value;
              }
              else {
                vValues = vValues+","+obj.options[i].value; // "," will be the separator between values
              }
            }
          }
          return vValues; // return all the multi selected values in the list
        }
        else {
          return obj.options[obj.selectedIndex].value; //dropdown
        }
      }
      return "";
    case "TEXTAREA":
      return obj.value; //textarea
  }
  return ""; //value not found
}

//Set the value of the specified object id
// string  id  : in ;the id of the object to set the value of
// string  val  : in ;the value to be set
// boolean clr : in ;reset translation/error
function sits_set_value(id,val,clr) {
  var obj = null;
  if(typeof(id)=="string") {
    obj = sits_get_object(id); //get object from id
  }
  else {
    obj = id; //object was passed in
  }
  if(!obj) {
    return false; //object not found
  }
  if(!clr) {
  	clr = true; //reset the translation/error by default
  }

  var c,i,l,found = false,changed = false;
  switch(obj.tagName) {
    case "INPUT":
      var typ = obj.getAttribute("type").toUpperCase();
      if(typ=="RADIO") { //radiogroup
        c = document.getElementsByName(obj.name);
        l = c.length;
        for(i=0;i<l;i++) { //loop through options
          if(c[i].value==val) { //until value found
          	if(!c[i].checked) {
          		changed = true;
          	}
            c[i].checked = true; //select value
            found = true;
          }
          else {
            c[i].checked = false; //unselect other values
          }
        }
      }
      else {
	      if(typ=="CHECKBOX") { //checkbox
  	      if(val=="Y") {
  	      	if(!obj.checked) {
  	      		changed = true;
  	      	}
    	      obj.checked = true;
      	  }
        	else {
        		if(obj.checked) {
        			changed = true;
        		}
          	obj.checked = false;
        	}
					found = true;
      	}
      	else {
      		if(typ=="DATE") { //date
      			var newval = sits_date_to_atom(val);
      			if(obj.value!=newval) {
      				changed = true;
      			}
        		obj.value = newval;
						found = true;
      		}
      		else {
      			if(typeof($)=="function") {
        			var fld_jq = $(obj);
        			if(fld_jq.hasClass("dmu_enabled")) { //dynamic listbox
        				var curval = fld_jq.data("dmu-curr");
        				if(typeof(curval)=="undefined") {
        					curval = obj.value; //field probably not yet focussed on, so take value directly from input instead
        				}
        				if(curval!=val) {
        					sits_do_set_value(fld_jq,clr);
        				}
	          		return dmu_set_value(obj,val);
  	      		}
    	  		}

   	  			if(obj.value!=val) {
   	  				changed = true;
   	  			}
     				obj.value = val; //textbox
     				found = true;
      		}
      	}
      }
      break;
    case "SELECT":
      c = obj.options; //dropdown
      l = c.length;
      for(i=0;!found&&i<l;i++) { //loop through options
        if(c[i].value==val) { //until value found
        	if(!c[i].selected) {
        		changed = true;
        	}
          c[i].selected = true; //select value
          found = true;
        }
        else {
          c[i].selected = false; //un-select value
        }
      }
      break;
    case "TEXTAREA":
    	if(obj.value!=val) {
    		changed = true;
    	}
      obj.value = val; //textarea
      found = true;
      break;
  }

  //perform cleanup tasks (like blank out the translation/error fields when appropriate)
  if(found && changed) {
  	sits_do_set_value(obj,clr);
  }
  return found; //return whether field found
}

//Internal function to perform cleanup tasks during sits_set_value
// element obj :in ;the element we're setting the value in
// boolean clr : in ;reset translation/error
function sits_do_set_value(obj,clr) {
	if(!clr) {
		return; //clearing is currently the only function, so if it's disabled then we don't continue
	}
	if(typeof($)!="function") {
		return; //no jQuery, so we don't continue
	}

	obj = $(obj);

	//if we're using dynamic listbox or translation, then we need to clear the translation/error fields (if present)
	var rsp = obj.hasClass("sv-form-control");
	if(rsp) { //responsive layout
		if(obj.hasClass("dmu_enabled")||obj.hasClass("hasTranslation")) {
			//if we're in a table then we shouldn't have a translation to worry about, so we're only interested when we're in a form group
			var ele = obj.closest(".sv-form-group,td");
			if(ele.is(".sv-form-group")) { //we're not in a table
				//empty the translation block (assuming standard structure)
				ele.children(".sv-help-block").find(".sv-trans-block").html("");

				//reset the error block and styling
				sits_inline_validation_message(0,"",obj);
			}
		}
	}
	else{ //not responsive
		var fldId = obj.attr("id");

		if(typeof(fldId)!="undefined"&&fldId!="") {
			if(obj.hasClass("dmu_enabled")) { //dynamic listbox
				if(typeof(dmu_trans)!="undefined" && typeof(dmu_trans[fldId])!="undefined") {
					$("#"+sits_do_get_object(dmu_trans[fldId])).html(""); //empty translation
				}
			}
			if(obj.hasClass("hasTranslation")) { //AJAX translate
				var transFld = $("#"+sits_do_get_object(fldId+"trans"));
				if(transFld.length>0) {
					transFld.html(""); //empty translation

					//remove any error styling from field and translation parents
					var ele = obj.parent();
					if(ele.hasClass("dmu_wrapper")) {
						ele = ele.parent(); //when using listbox there may be a wrapper div in place that we ignore
					}
					ele.removeClass("wys_error");

					transFld.parent().removeClass("wys_error");
				}
			}
		}
	}

	//if the field could be part of an AJAX Translation then reset the associated cache
	if(typeof(aTVals)!="undefined"&&obj.hasClass("hasTranslation")) {
		var nam = obj.attr("name");
		if(typeof(nam)!="undefined"&&nam!="") {
			delete aTVals[nam]; //remove the "previous value" used for comparison to see if the value changed
		}
	}
}

//Get an integer value from a size property
// string  val  : in ;the value of the size property
function sits_get_integer(val) {
  switch(sits_type_of(val)) {
    case "number":
      return parseInt(val,10); //return decimal integer
    case "undefined":
    case "null":
      return 0;
    default:
      var str = val.toString(); //convert to a string
      str = str.replace(/px/gi,""); //remove "px"
      str = str.replace(/em/gi,""); //remove "em"
      return parseInt(str,10); //return decimal integer
  }
}

//Log debug messages to the console
// string  str  : in ;the debug message to log
function sits_putmess(str) {
  if(str=="") { //check parameters
    return false;
  }
  if(typeof(window.unifaceTriggers)=="function") {  //Uniface
    window.unifaceTriggers("html5_putmess","UNIFACE: "+str);
  }
  else if(window.console) { //Safari and Firefox with Firebug
    window.console.log(str);
  }
  else {
    if(window.opera) { //Opera
      window.opera.postError(str);
    }
    else { //other browsers
      if(sits_show_alerts) {
        str += "\n\n(Click 'Cancel' to suppress debug alerts on this page)";
        sits_show_alerts = confirm(str);
      }
    }
  }
  return true;
}

//Send a query to the server
// string  met  : in ;the method("POST" or "GET")
// string  ope  : in ;the form name and operation(eg. "siw_dmu.get")
// string  par  : in ;the parameters to be sent(eg. "fld1=val1&fld2=val2")
// boolean  cac  : in ;indicates whether the response should be cached or not
// string   fnc  : in ;the name of the local results function(default is "local_process_results")
function sits_send_query(met,ope,par,cac,fnc) {
  if((met!="GET" && met!="POST") || ope=="" || par=="") { //check parameters
    return false;
  }
  var arr = new Array(4); //setup queue item
  arr[0] = met;
  arr[1] = ope;
  arr[2] = par;
  if(cac) { //checked caching mode
    arr[3] = "Y";
  }
  else {
    arr[3] = "N";
  }
  if(typeof(fnc)=="string" && fnc.length>0) { //check if local function overridden
    arr[4] = fnc;
  }
  else {
    arr[4] = "local_process_results";
  }
  sits_queue_array.push(arr); //add item to the queue
  if(!sits_queue_busy) {
    setTimeout("sits_do_process_queue();",10); //process queue if not already processing
    sits_queue_busy = true; //indicate that queue is processing
  }
  return true;
}

//Internal function to process the queue
function sits_do_process_queue() {
  sits_queue_func = ""; //clear the local function
  sits_cache_query = ""; //clear the cache query
  if(sits_queue_array.length==0) { //check if the queue is empty
    sits_queue_busy = false;
    return;
  }
  var arr = sits_queue_array[0]; //get the next query item
  sits_queue_array = sits_queue_array.slice(1); //remove from the queue
  var str = arr.slice(0,3).join("~"); //add method, operation and parameters together
  if(arr[3]=="Y") { //if using cache...
    if(sits_cache_array[str]) { //check for cached value
      var txt = sits_cache_array[str];
      sits_execute_function(arr[4],window,txt); //process the returned results
      setTimeout("sits_do_process_queue();",10); //continue processing queue
      return true;
    }
    sits_cache_query = str; //set the cache query
  }
  else { //...else not using cache
    if(sits_cache_array[str]) { //check for cached value
      delete sits_cache_array[str]; //delete cached value if it exists
    }
  }
  sits_queue_func = arr[4]; //set the local function
  var opt = {type:arr[0],url:arr[1],data:arr[2],dataType:"html",complete:sits_do_process_results}; //create ajax options object
  $.ajax(opt); //send ajax query
}

//Function to execute function by name
// string  nam  : in ;name of the function
// object  con  : in ;original context(default is window)
//(anything else passed in will be used as the arguments for the function called)
function sits_execute_function(nam,con/*,arg*/) {
  if(typeof(nam)=="string") { //check first parameter
    con = con || window; //default context is window
    var arg = Array.prototype.slice.call(arguments,2); //get arguments
    var nsp = nam.split("."); //split namespaces from function name
    var fnc = nsp.pop(); //get the function name
    var len = nsp.length;
    for(var i=0;i<len;i++) { //loop through namespaces
      con = con[nsp[i]]; //traverse namespace
    }
    return con[fnc].apply(con,arg); //call function with arguments and return
  }
  return false;
}

//Internal function to process the results from the ajax call
// object  xml  : in ;the XmlHttpRequest object from the ajax call
// string  sts  : in ;the status of the request
function sits_do_process_results(xml,sts) {
  var txt = xml.responseText; //get response text
  if(sits_cache_query!="" && txt.substr(0,4)=="<OK>") { //check value can and should be cached
    sits_cache_array[sits_cache_query] = txt; //add to cache
  }
  sits_execute_function(sits_queue_func,window,txt); //process the returned results
  setTimeout("sits_do_process_queue();",10); //continue processing queue
}

//Get an object with the specified ID
// string  id  : in ;the ID of the object you want
// string attr : in ;the attribute to use(default is "id")
function sits_get_object(id,attr) {
  if(id=="") { //check parameters
    return null;
  }
  if(typeof(attr)=="string" && attr!="") {
    attr = attr.toLowerCase();
  }
  else {
    attr = "id"; //default to id
  }
  var arr = null;
  switch(attr) { //return object by attribute
    case "id":
      if(typeof($)!="function") {
        return document.getElementById(id); //jQuery not quite ready
      }
      arr = $("#"+sits_do_get_object(id)); //escape jQuery selector
      if(arr.length==1) {
        return arr[0]; //return object
      }
      break;
    case "name":
      if(typeof($)!="function") {
        arr = document.getElementsByName(id); //jQuery not quite ready
        if(arr.length==1) {
          return arr[0]; //return object
        }
      }
      arr = $("input[name="+sits_do_get_object(id)+"]"); //escape jQuery selector
      if(arr.length==1) {
        return arr[0]; //return object
      }
      break;
  }
  return null;
}

//Internal function to escape jQuery selector characters
// string id  : in ;the selector to escape
function sits_do_get_object(id) {
  if(typeof(id)!="string" || id.length<1) { //check selector
    return "";
  }
  return id.replace(/(\#|\;|\&|\,|\.|\+|\~|\'|\:|\"|\!|\^|\$|\[|\]|\(|\)|\=|\>|\||\/|\ )/g,"\\$1"); //return selector
}

//Function to escape jQuery selector characters
// string sel  : in ;the selector to escape
function sits_escape_selector(sel) {
  return sits_do_get_object(sel);
}

//Replace all instances of a string within another
// string  orig  : in ;the original string
// string  strA  : in ;the search string
// string  strB  : in ;the replace string
function sits_replace_all(orig,strA,strB) {
  if(typeof(orig)!="string" || orig.length<1) { //check original string
    //return ""; // SMIJ6, 377963, 9.4.0 if not a string, just pass back the original value
    return orig;
  }
  var i = 0; //break infinite loop
  var str = orig;
  while(str.indexOf(strA)>=0 && i<10000) { //search for string A...
    str = str.replace(strA,strB); //...and replace with string B
    i++;
  }
  if(i==10000) { //if infinite loop...
    str = orig; //...return original string
  }
  return str; //return string
}

//Open a new dialog message
// string  ttl  : in ;the dialog title
// string  con  : in ;the html contents of the dialog
// object  btn  : in ;object containing buttons(eg. {"Ok":function() {$(this).dialog("close");}});
// boolean  drg  : in ;is the dialog draggable?(default is true)
// boolean  mdl  : in ;is the dialog modal?(default is false)
// boolean  rsz  : in ;is the dialog resizable?(default is true)
// numeric  znd  : in ;the z-index of the dialog - IGNORED!
// string  tid  : in ;the index of the div(default is "sits_dialog")
// boolean  opn : in ;should the dialog open immediately?(default is true)
// numeric  wid : in ;the width of dialog as a percentage of the screen(default is 60)
// numeric  hgt : in ;the minimum height of the dialog, in pixels(no default)
function sits_dialog(ttl,con,btn,drg,mdl,rsz,znd,tid,opn,wid,hgt) {
  if(typeof(tid)!="string" || tid.length<1) {
    tid = "sits_dialog";
  }
  var div = sits_get_object(tid); //check for existing div
  if(!div) {
    div = $("<div>").appendTo("body").attr("id",tid)[0]; //create new div
  }
  $(div).attr("title",ttl).html(con); //set title and contents
  var sizobj = sits_do_dialog_size(wid); //calculate width
  var opt = {};
  opt.autoOpen = false;
  opt.closeOnEscape = false;
  opt.width = sizobj.calc; //calculate width
  if(btn) {
    opt.buttons = btn; //add buttons to dialog (default is none)
  }
  if(typeof(drg)=="boolean") {
    opt.draggable = drg; //set draggable (default is true)
  }
  if(typeof(mdl)=="boolean") {
    opt.modal = mdl; //set modality (default is false)
  }
  if(typeof(rsz)=="boolean") {
    opt.resizable = rsz; //set resizable (default is true)
  }
  if(typeof(hgt)=="number" && hgt>0) {
    if(hgt>sizobj.maxhgt) {
      hgt = sizobj.maxhgt; //minimum height can't be bigger than maximum height
    }
    opt.minHeight = hgt; //set minimum height
  }
  var dlg = $("#"+tid);
  dlg.dialog(opt); //create dialog but don't open yet
  sits_hide(".ui-dialog-titlebar-close"); //hide close icon
  if(typeof(rsz)!="boolean" || rsz) {
    dlg.on("dialogresize",function(evt,ui) { //when resizing dialog... (default is true)
      sits_debounce_event(sits_tabs_resize,250); //...resize tabs in dialog
    });
  }
  if(typeof(opn)!="boolean" || opn) {
    dlg.dialog("open"); //open the dialog now (default is true)
  }
  sits_do_dialog_height(dlg,sizobj.maxhgt); //set the height of the dialog
  dlg.dialog("option","position",{"my":"center","at":"center","of":window,"collision":"fit"}); //re-centre the dialog
  dlg.data("sv-dialog-width",sizobj.orig); //track the original dialog width for use in auto re-sizing
  return true;
}

//Updates the contents of the dialog message
// string  con  : in ;the html contents of the dialog(false to leave as is)
// object  btn  : in ;object containing buttons(eg. {"Ok":function() {$(this).dialog("close");}})(false to leave as is);
// string  tid  : in ;the index of the div(default is "sits_dialog")
function sits_dialog_update(con,btn,tid) {
  if(typeof(tid)!="string" || tid.length<1) {
    tid = "sits_dialog";
  }
  var dlg = $("#"+tid); //get dialog object
  if(dlg.hasClass("ui-dialog-content")) {
    if(typeof(con)!="boolean") {
      dlg.html(con); //set the contents
    }
    if(typeof(btn)=="object") {
      dlg.dialog("option","buttons",btn); //add buttons to dialog(default is none)
    }
    if(!dlg.dialog("isOpen")) { //open the dialog if it isn't already
    	dlg.dialog("open");
      $("ul.ui-tabs-nav").children("li").css("list-style","none"); //fix IE bug
    }
    var sizobj = sits_do_dialog_size(""); //calculate width
  	sits_do_dialog_height(dlg,sizobj.maxhgt); //set the height of the dialog
    return true;
  }
  return false;
}

//Closes the dialog message and optionally destroys it
// boolean  dst  : in ;destroy the dialog?(default is true)
// string  tid  : in ;the index of the div(default is "sits_dialog")
function sits_dialog_close(dst,tid) {
  if(typeof(tid)!="string" || tid.length<1) {
    tid = "sits_dialog";
  }
  var dlg = $("#"+tid); //get dialog object
  if(dlg.hasClass("ui-dialog-content")) {
    dlg.dialog("close"); //close the dialog
    if(dst || typeof(dst)=="undefined") {
      dlg.dialog("destroy").empty(); //destroy the dialog
    }
    return true;
  }
  return false;
}

//Resizes the dialog message and also re-positions it
// numeric  wid : in ;the width of dialog as a percentage of the screen(default is 60)
// string  tid  : in ;the index of the div(default is "sits_dialog")
function sits_dialog_resize(wid,tid) {
  if(typeof(tid)!="string" || tid.length<1) {
    tid = "sits_dialog";
  }
  var dlg = $("#"+tid); //get dialog object
  if(dlg.hasClass("ui-dialog-content")) {
  	var sizobj = sits_do_dialog_size(wid);
		if(wid!=="") { //"" means we just centre using the current size
    	dlg.dialog("option","width",sizobj.calc); //adjust width of dialog
    	dlg.data("sv-dialog-width",sizobj.orig); //track the original dialog width for use in auto re-sizing
   	}
  	sits_do_dialog_height(dlg,sizobj.maxhgt); //set the height of the dialog
    dlg.dialog("option","position",{"my":"center","at":"center","of":window,"collision":"fit"}); //re-centre the dialog
    return true;
  }
  return false;
}

//Internal function used by sits_dialog and sits_dialog_resize to determine the screen width and maxheight to use(varies from breakpoint to breakpoint)
// numeric wid :in;the width of dialog as a percentage of the screen(default is 60)
// object obj :out;object containing "orig" item(the original width as a ratio of screensize), "calc"(the calculated pixel width) and "maxhgt"(the calculated max height)
function sits_do_dialog_size(wid) {
	var siz = sits_window_size(); //x and y sizes for width and height
	var xsiz = siz.x; //current screen width
	var ysiz = siz.y; //current screen height

  if(typeof(wid)!=="number" || wid<=0) { //check width percentage
    wid = 0.6; //60%
  }
  else if(wid>1&&wid<=100) {
    wid = wid/100; //convert percentage into decimal
  }
  else if(wid>100) {
  	wid = wid/xsiz; //convert fixed width in to percentage of screen width
  }
	if(wid>1) {
		wid = 1; //width shouldn't be greater than the available screen width
	}

	var newwid = wid, fact;

	//determine which breakpoint we're currently in
	var bp = sits_get_breakpoint();

  //if scaling factors available then use them
  if(typeof(sits_dialog_scaling)==="object") {
		if(typeof(bp)==="string") {
			//look up the scaling factor for this breakpoint and use it to update the width
			fact = sits_dialog_scaling[bp];
			if(typeof(fact)==="number") {
				newwid = newwid * fact;
			}
		}
	}

	if(newwid>1) {
		newwid = 1; //factor pushed us over the available screen width, so reset it
	}
	newwid = sits_get_integer(newwid*xsiz);

	var maxhgt = 0.95; //assume a max height of 95% of screen height

	//if maximum height ratios available then use them
	if(typeof(sits_dialog_height)==="object") {
		if(typeof(bp)==="string") {
			var ratio = sits_dialog_height[bp];
			if(typeof(ratio)==="number"||ratio==="") { //"" means no max height ratio
				maxhgt = ratio;
			}
		}
	}

	//convert ratio in to actual height
	if(maxhgt!=="") {
		maxhgt = sits_get_integer(maxhgt*ysiz);
	}

	var obj = {};
	obj.orig = wid; //original width as ratio of screensize
	obj.fact = fact; //factor for the current breakpoint
	obj.calc = newwid; //the calculated pixel width
	obj.maxhgt = maxhgt; //the maximum height
	return obj;
}

//Internal function to calculate and set the height of a dialog as a percentage of screen height
// object dlg :in;jQuery dialog object
// numeric maxhgt :in;maximum height of the dialog(will be set only if the content is larger than this currently)
function sits_do_dialog_height(dlg,maxhgt) {
	if(typeof(dlg)!=="object"||typeof(maxhgt)!="number") { //if no dialog or height passed in then we use automatic calculation
		dlg.height("");
		return;
	}
  var out = dlg.closest(".ui-dialog").height(); //calculate outer height of the dialog
  if(out>maxhgt) {
    var inn = maxhgt+dlg.height()-out;
    dlg.height(inn); //resize dialog to fit on the screen
  }
}

//Determines which breakpoint the current screen-size falls within(returns lg, md, sm or xs)
// string breakpoint :out;the breakpoint for the current screen
function sits_get_breakpoint() {
	return sits_do_get_breakpoint("sits_bp_element","");
}

//Internal function to determine the current breakpoint - uses known dummy elements to work out which ones are hidden
function sits_do_get_breakpoint(con,cla) {
	var bp = ["xs","sm","md"]; //list of possible breakpoints(apart from the largest which is assumed if no others are hidden)

	//get the container element as we need to unhide that first
	var conele = $("#"+con);
	if(conele.length===0) {
		//add the container element for later
		conele = $("<span id=\""+con+"\" class=\""+cla+"\"></span>");

		//include it in the document
		$("body").append(conele);
	}
	else {
    sits_show(conele);
	}

	var ele, conele;
	for(var i=0;i<bp.length;i++) {
		//find the element
		ele = $("#"+con+"_"+bp[i]);

		if(ele.length===0) { //if the element is missing then we need to add it
			//create the element we check(we need content in it or some browsers consider it to be hidden still)
			ele = $("<span id=\""+con+"_"+bp[i]+"\" class=\"sv-hidden-"+bp[i]+"\">&#160;</span>");

			//add it to the container
			conele.append(ele);
		}

		//is the element hidden - if so then we assume we're in that breakpoint(as the classes associated with each are only hidden in that breakpoint)
		if(ele.is(":hidden")) {
      sits_hide(conele); //hide container so it doesn't affect display
			return bp[i];
		}
	}
  sits_hide(conele); //hide container so it doesn't affect the display

	//if we made it this far then we assume it's the largest breakpoint
	return "lg";
}

//Internal function to determine a portal breakpoint multiplier and return the associated breakpoint(for use when you have an element within a screen in portal content mode). Returns lg, md, sm or xs
// string ele :in;the element to use as the basis for the check
// string breakpoint :out; the breakpoint for the element and container
function sits_do_get_portal_breakpoint(sel) {
	//the portal multiplier is associated with the container, so look for the relevant parent element(if one exists - if not then there is no multiplier)
	var multiplier = $(sel).parents("[data-sv-portal-multiplier]").attr("data-sv-portal-multiplier");
	multiplier =(isNaN(multiplier))? 1 : parseInt(multiplier,10);

	//if we've found a multiplier then use it
	if(typeof(multiplier)==="number"&&multiplier>1) {
		return sits_do_get_breakpoint("sits_bp_element"+multiplier,"sv-portal-"+multiplier+"-col");
	}

	//if no multiplier then return the standard breakpoint
	return sits_do_get_breakpoint("sits_bp_element","");
}

//Get the target object of specified the event
// event  e  : in ;the event object
function sits_get_target(e) {
  e = e || window.event;
  var t = e.target || e.srcElement; //get target depending on browser
  if(t.nodeType==3) {
    t = t.parentNode; //fix for Safari which returns text node
  }
  return t; //return target object
}

//Check if the mouse is within the bounds of an element
// object  m  : in ;the coordinates of the mouse {x,y}
// element  d  : in ;the element to check
function sits_mouse_isin(m,d) {
  var n = sits_object_offset(d); //get north-west corner of object
  if(m.x>=n.x && m.y>=n.y) {
    var o = sits_object_size(d); //get object dimensions
    n.x = o.x+n.x; //calculate south-east corner of object
    n.y = o.y+n.y;
    if(m.x<n.x && m.y<n.y) { //check if mouse is between NW and SE corners
      return true;
    }
  }
  return false;
}

//Get a specific boilerplate text
// array  arr  : in ;the array of boilerplate(built using INC_AJAX:get_bp_array)
// numeric  num  : in ;the number of the boilerplate field
function sits_get_bptext(arr,num) {
  var str = "";
  if(num>0 && num<=arr.length) {
    str = arr[num-1]; //get string from array(zero indexed)
  }
  else { //default string if not in array
    str = "{BP"+sits_left_pad(num,3,"0")+"}";
  }
  return str; //return string
}

//Removes all instances of the second string from the first which appear at the beginning
// string  str  : in ;the original string
// string  pat  : in ;the substr to be found and removed
function sits_left_trim(str,pat) {
  str = ""+str; //cast as string
  while(str.substr(0,pat.length)==pat) { //check for occurrence at the beginning
    str = str.substr(pat.length); //remove the occurrence
  }
  return str; //return string
}

//Removes all instances of the second string from the first which appear at the end
// string  str  : in ;the original string
// string  pat  : in ;the substr to be found and removed
function sits_right_trim(str,pat) {
  str = ""+str; //cast as string
  while(str.substr(str.length-pat.length)==pat) { //check for occurrence at the end
    str = str.substr(0,str.length-pat.length); //remove the occurrence
  }
  return str; //return string
}

//Remove all whitespace from the beginning and end of the string
// string  str  : in ;the original string
function sits_white_trim(str) {
  return $.trim(""+str); //return string
}

//Get the current date as a string
// string  fmt  : in ;the date format
function sits_current_date(fmt) {
  var now = new Date(); //get current date/time
  return sits_date_to_string(now,(fmt || sits_date_format)); //return string
}

//Get the current time as a string
// string  fmt :in;the time format string
function sits_current_time(fmt) {
  var now = new Date(); //get current date/time
  return sits_time_to_string(now,(fmt || sits_time_format)); //return string
}

//Get the current datetime as a string
// string  fmt :in;the datetime format string
function sits_current_datetime(fmt) {
  var now = new Date(); //get current date/time
  return sits_datetime_to_string(now,(fmt || sits_date_format+" "+sits_time_format)); //return string
}

//Get array containing start and end year using year range
// string  rng : in ;the year range - https://api.jqueryui.com/datepicker/#option-yearRange
// numeric cur : in ;the current year - only needed if using the "c" style year range
function sits_year_range_values(rng,cur) {
  rng = rng || sits_year_range; //use default value
  var now = new Date().getFullYear();
  var fnc = function(val) { //function to convert relative value into actual value
    var year =(val.match(/c[+\-].*/) ?(cur || now)+parseInt(val.substring(1),10) :(val.match(/[+\-].*/) ? now+parseInt(val,10) : parseInt(val,10)));
    return(isNaN(year) ? now : year);
  };
  var arr = rng.split(":"); //split range
  var beg = fnc(arr[0]);
  var end = Math.max(beg,fnc(arr[1] || ""));
  return [beg,end]; //return values
}

//Validate a date within a range
// string  dat  : in ;the date string
// string  rmn  : in ;the minimum value
// string  rmx  : in ;the maximum value
// boolean frm  : in ;return formatted value?
// string frmi  : in ;format of date values (see http://api.jqueryui.com/datepicker/#utility-formatDate)
function sits_validate_date(dat,rmn,rmx,frm,frmi) {
  if(typeof(rmn)=="undefined") {
    rmn = "";
  }
  if(typeof(rmx)=="undefined") {
    rmx = "";
  }
  if(typeof(frm)=="boolean" && frm) {
    frm = "Y";
  }
  else {
    frm = "N";
  }
  if(typeof(frmi)=="undefined") {
    frmi = "";
  }
  var res = "";
  var par = "type=D&valu="+dat+"&rmin="+rmn+"&rmax="+rmx+"&frmt="+frm+"&frmi="+frmi; //build parameter list
  if(sits_valid_array[par]) {
    res = sits_valid_array[par]; //check cache
  }
  else {
    res = "<OK>FALSE";
    if(typeof(dat)=="string" && dat!="" && dat.length>5) {
      var atom = (frmi ? sits_date_convert(frmi,"yy-mm-dd",dat) : sits_date_to_atom(dat));
      var tdat = sits_to_date(atom,"yy-mm-dd");
      if(typeof(tdat)!="undefined") {
        res = "<OK>TRUE"; //date value is valid
        if(rmn!="") {
          var armn = (frmi ? sits_date_convert(frmi,"yy-mm-dd",rmn) : sits_date_to_atom(rmn));
          var trmn = sits_to_date(armn,"yy-mm-dd");
          if(typeof(trmn)!="undefined") {
            if(atom<armn) {
              res = "<OK>FALSE"; //date is below minimum
            }
          }
        }
        if(res=="<OK>TRUE" && rmx!="") {
          var armx = (frmi ? sits_date_convert(frmi,"yy-mm-dd",rmx) : sits_date_to_atom(rmx));
          var trmx = sits_to_date(armx,"yy-mm-dd");
          if(typeof(trmx)!="undefined") {
            if(atom>armx) {
              res = "<OK>FALSE"; //date is above maximum
            }
          }
        }
        if(res=="<OK>TRUE" && frm=="Y") {
          res += "="+sits_atom_to_date(atom); //return formatted value
        }
      }
    }
    sits_valid_array[par] = res; //add to cache
  }
  if(res=="<OK>TRUE") {
    return true;
  }
  if(frm=="Y" && res.substr(0,9)=="<OK>TRUE=") { //return formatted value
    return res.substr(9);
  }
  return false;
}

//Validate a time within a range
// string  tim  : in ;the time string
// string  rmn  : in ;the minimum value
// string  rmx  : in ;the maximum value
// boolean frm  : in ;return formatted value?
// string frmi  : in ;format of time values (use &D notation H2:N2:S2.T2 p)
function sits_validate_time(tim,rmn,rmx,frm,frmi) {
  if(typeof(rmn)=="undefined") {
    rmn = "";
  }
  if(typeof(rmx)=="undefined") {
    rmx = "";
  }
  if(typeof(frm)=="boolean" && frm) {
    frm = "Y";
  }
  else {
    frm = "N";
  }
  if(typeof(frmi)=="undefined") {
    frmi = "";
  }
  var res = "";
  var par = "type=T&valu="+tim+"&rmin="+rmn+"&rmax="+rmx+"&frmt="+frm+"&frmi="+frmi; //build parameter list
  if(sits_valid_array[par]) {
    res = sits_valid_array[par]; //check cache
  }
  else {
    res = "<OK>FALSE";
    var time = sits_to_time(tim,frmi);
    if(typeof(time)!="undefined") {
      res = "<OK>TRUE"; //time is valid value
      if(rmn!="") {
        var trmn = sits_to_time(rmn,frmi);
        if(typeof(trmn)!="undefined" && time<trmn) {
          res = "<OK>FALSE"; //time is less than minimum
        }
      }
      if(res=="<OK>TRUE" && rmx!="") {
        var trmx = sits_to_time(rmx,frmi);
        if(typeof(trmx)!="undefined" && time>trmx) {
          res = "<OK>FALSE"; //time is more than maximum
        }
      }
      if(res=="<OK>TRUE" && frm=="Y") {
        res += "="+sits_time_to_string(time); //return formatted value
      }
    }
    sits_valid_array[par] = res; //add to cache
  }
  if(res=="<OK>TRUE") {
    return true;
  }
  if(frm=="Y" && res.substr(0,9)=="<OK>TRUE=") { //return formatted value
    return res.substr(9);
  }
  return false;
}

//Validate a number is within an inclusive range
// string  num  : in ;the number string
// boolean  boo  : in ;integer value?
// numeric  rmn  : in ;the minimum value
// numeric  rmx  : in ;the maximum value
function sits_validate_number(num,boo,rmn,rmx) {
  if(num) {
    if(isNaN(num)) { //check is an number
      return false;
    }
    var val = 0;
    if(boo) {
      val = parseInt(num,10);
    }
    else {
      val = parseFloat(num);
    }
    if(boo && num!=val) { //check is an integer
      return false;
    }
    if(typeof(rmn)=="number" && val<rmn) { //check min value
      return false;
    }
    if(typeof(rmx)=="number" && val>rmx) { //check max value
      return false;
    }
  }
  return true;
}

//Validate a string to see if is an email address
// string  str  : in ;the email string
function sits_validate_email(str) {
  if(str) {
    var p1 = str.indexOf("<"); //check for "name <email>" format
    if(p1>-1) {
      var temp = str.substr(p1+1);
      var p2 = temp.indexOf(">");
      if(p2>-1) {
        str = temp.substr(0,p2); //extract email address
      }
    }
    if(!(/^\w([\.\-\_\'\+]?\w)*@\w([\.\-]?\w)*\.\w([\.]?\w)+$/.test(str))) { //test regular expression
      return false;
    }
  }
  return true;
}

//Convert certain characters that cannot be used in URL's(e.g. <, &, etc)
// string  str  : in ;the url string
function sits_escape_url(str) {
  if(encodeURIComponent) {
    return encodeURIComponent(str);
  }
  else if(escape) {
    return escape(str);
  }
  return str; //return escaped string
}

//Add characters to the beginning of a string to force length
// string  str  : in ;the string to add leading characters to
// numeric  len  : in ;the length the string should be
// string   pad  : in ;the character to pad with
function sits_left_pad(str,len,pad) {
  str = ""+str; //cast as string
  while(str.length<len) {
    str = pad+str; //prepend pad character
  }
  return str; //return fixed string
}

//Add characters to the end of a string to force length
// string  str  : in ;the string to add leading characters to
// numeric  len  : in ;the length the string should be
// string   pad  : in ;the character to pad with
function sits_right_pad(str,len,pad) {
  str = ""+str; //cast as string
  while(str.length<len) {
    str += pad; //append pad character
  }
  return str; //return fixed string
}

//Replace each instance of a string within another(will not loop)
// string  orig  : in ;the original string
// string  strA  : in ;the search string
// string  strB  : in ;the replace string
// numeric   maxr  : in ;the maximum number of replacements to make
function sits_replace(orig,strA,strB,maxr) {
  if(typeof(orig)!="string" || orig.length<1) { //check original string
    return "";
  }
  if(typeof(maxr)!="number" || maxr<0) { //check limit
    maxr = 10000;
  }
  var str = orig; //copy string
  var ret = "";
  var len = strA.length;
  var pos = str.indexOf(strA); //search for string A...
  var cur = 0;
  while(pos>=0 && cur<maxr) {
    cur++;
    ret += str.substr(0,pos)+strB; //...and replace with string B
    str = str.substr(pos+len);
    pos = str.indexOf(strA); //search in reminder of string
  }
  return ret+str; //return string
}

//Convert certain characters that cannot be used in javascript string's(e.g. ', ", etc)
// string  str  : in ;the javascript string
function sits_escape_string(str) {
  var ret = sits_replace(str,"\\","\\\\");
  ret = sits_replace(ret,"\/","\\\/");
  ret = sits_replace(ret,"\"","\\\"");
  ret = sits_replace(ret,"\'","\\\'");
  ret = sits_replace(ret,"\&","\\\&");
  return ret; //return escaped string
}

//Truncate a string at a certain length and add an ellipsis if necessary
// string  str  : in ;the string to be truncated
// numeric  num  : in ;the maximum length of the string
function sits_create_ellipsis(str,num) {
  if(str.length>num) {
    str = str.substr(0,num-3)+"..."; //truncate and add ellipsis
  }
  return str;
}

//Creates right click context menu
// string   sel  : in ;jQuery selector to apply the context menu to
// object   obj  : in ;object containing the text and the callback functions for each option in the menu
// object   opt  : in ;object containing any options to extend or override the defaults(optional)
function sits_context_menu(sel,obj,opt) {
  var loc = sits_minified_path("../plugins/javascript/menu/","jquery.ui-contextmenu.js","jquery.ui-contextmenu.min.js");
  if(sits_files_array[loc]=="Y") { //already loaded...
    sits_do_context_menu(sel,obj,opt); //...so call straight away
  }
  else { //not loaded yet
    var par = {}; //create an object of parameters
    par.url = loc;
    par.fnc = sits_do_context_menu;
    par.p01 = sel;
    par.p02 = obj;
    par.p03 = opt;
    var len = sits_param_array.push(par); //save for later
    sits_include_file(sits_minified_path("../plugins/javascript/taphold/","taphold.js","taphold.min.js"),function(boo) {
      sits_include_file(sits_minified_path("../plugins/javascript/menu/","jquery.ui-contextmenu.js","jquery.ui-contextmenu.min.js"));
    });
  }
  return true;
}

//Internal function to install context menu
// string   sel : in ;jQuery selector to apply the context menu to
// object   obj : in ;object containing the text and the callback functions for each option in the menu
// object   opt : in ;object containing any options to extend or override the defaults(optional)
function sits_do_context_menu(sel,obj,opt) {
  if((typeof(sel)=="string" && sel.length>0) || typeof(sel)=="object") { //check first parameter
    if((typeof(obj)=="string" && obj.length>0) || typeof(obj)=="object" || typeof(obj)=="function") { //check second parameter
      var context_opt = {
        preventContextMenuForPopup: true,
		    preventSelect: true,
		    taphold: false,
        hide: {
          effect: "fadeOut",
          duration: sits_anim_speed
        },
        show: {
          effect: "slideDown",
          duration: sits_anim_speed
        },
        open: function(event,ui) {
          sits_current_menu = document.activeElement; //store active element
          var v_menu = $(ui.menu);
          v_menu.css("z-index",2147483647); //hack to make sure menu is always at the front
          v_menu.find("li.ui-menu-divider").attr("role","separator"); //add separator roles
          v_menu.find("ul").addBack().each(function(i) { //add aria attributes
            var obj = $(this);
            if(!obj.hasClass("ui-contextmenu")) {
              var pid = obj.prev("a").attr("id");
              if(pid) {
                obj.attr("aria-labelledby",pid); //add "labelledby" to sub-menus
              }
            }
            var lis = obj.children("li.ui-menu-item");
            var tot = lis.length;
            lis.each(function(i) { //add "posinset" and "setsize" for menu items(browser counts sub-menus incorrectly)
              $(this).children("a").attr("aria-posinset",i+1).attr("aria-setsize",tot);
            });
          });
          v_menu.focus(); //focus on menu(which focuses on first item)
        },
        close: function(event) {
          if(sits_current_menu) { //original active element stored
            var v_elem = document.activeElement; //current active element
            if(v_elem && v_elem.tagName=="UL" && v_elem.style.zIndex=="2147483647") { //still focused on menu
              sits_current_menu.focus(); //focus on original active element
            }
          }
          sits_current_menu = null;
        }
      };
      if(typeof(opt)=="object") { //PPL36653 - implement opt parameter(was "for future use" before)
      	context_opt = $.extend(context_opt,opt,true);
      }
      if(typeof(obj)=="function") { //function
        context_opt.menu = [];
        context_opt.beforeOpen = function(event, ui) {
          var newmenu = obj.call(this, event, ui);
          if(newmenu==null) {
            return false;
          }
          $(this).contextmenu("replaceMenu",newmenu);
          return true;
        };
      }
      else { //must be object or string
        context_opt.menu = obj;
      }
      var v_sel = sel;
      var v_cont = null;
      if(typeof(sel)=="object") {
        if(typeof(sel.selector)=="string" || typeof(sel.selector)=="object") {
          v_sel = sel.selector;
        }
        if(typeof(sel.context)=="object") {
          v_cont = sel.context;
        }
        if(typeof(sel.delegate)=="string") {
          context_opt.delegate = sel.delegate;
        }
      }
      if(v_sel.length==0) {
        return false; //PPL36653 - use correct selector(was sel)
      }
      if(v_cont!=null) {
        $(v_sel,v_cont).contextmenu(context_opt); //create context menu
      }
      else {
        $(v_sel).contextmenu(context_opt); //create context menu
      }
      return true;
    }
  }
  return false;
}

//Executes all of the script tags within a div after its innerHTML has been set
// string  id  : in ;the id of the div
function sits_execute_script(id) {
  var d = null;
  if(d=sits_get_object(id)) { //get div object
    var a = d.getElementsByTagName("script"); //get script objects
    var l = a.length;
    for(var i=0;i<l;i++) {
      var s = a[i].innerHTML; //get contents of script object
      if(s!="") {
        if(window.execScript) {
          window.execScript(s); //execute script(IE)
        }
        else {
          window.setTimeout(s,0); //execute script(other)
        }
      }
    }
    return true;
  }
  return false;
}

//Creates a progress bar and displays it on the screen(PPL011770)
// string  mes  : in ;the message text displayed in the progress bar
// string  iss  : in ;the ISS code - leave blank to use standard mode
// numeric  sec  : in ;the interval between updates(in seconds)
// string  rem  : in ;the message text displayed prior to the remaining time
// function  fnc  : in ;call back function called after progress is complete
function sits_progress(mes,iss,sec,rem,fnc) {
  if(typeof(iss)!="string") { //check ISS code
    iss = "";
  }
  if(typeof(sec)!="number" || sec<1 || sec>60) { //check interval
    sec = 1;
  }
  if(typeof(rem)!="string") { //"remaining" text
    rem = "";
  }
  sits_progress_iss = iss; //store ISS code
  sits_progress_int = sec*1000; //store interval
  sits_progress_cur = 0; //reset counter
  sits_progress_now = new Date(); //store start time
  var h = []; //build dialog contents
  h[0] = "<div class=\"sv-container-fluid\"><div class=\"sv-row\">";
  if(iss) {
    h[h.length] = "<div class=\"sv-col-md-12 sv-text-center\"><p id=\"sits_prognum\" data-maxv=\"\">&nbsp;</p></div>";
  }
  else {
    h[h.length] = "<div class=\"sv-col-md-12 sv-text-center\" id=\"sits_prognum\" data-maxv=\"\">&nbsp;</div>";
  }
  h[h.length] = "</div><div class=\"sv-row\"><div class=\"sv-col-md-12\"><div id=\"sits_progbar\"></div></div></div>";
  h[h.length] = "<div class=\"sv-row\"><div class=\"sv-col-md-12\">&nbsp;</div></div>";
  if(iss && rem) {
    h[h.length] = "<div class=\"sv-row\"><div id=\"sits_progsumm\" class=\"sv-col-md-12 sv-text-center\">";
    h[h.length] = "<p><span id=\"sits_proglab\" class=\"sv-hide\">"+rem+"</span>&nbsp;<span id=\"sits_progrem\"></span></p></div></div>";
  }
  h[h.length] = "<div class=\"sv-row\"><div id=\"sits_progmore\" class=\"sv-panel sv-panel-default sv-hide\">";
  h[h.length] = "<div class=\"sv-panel-heading\"><h2 class=\"sv-panel-title\">";
  h[h.length] =(sits_widget_bp.ui && sits_widget_bp.ui.moreDetails || "More Details")+"</h2></div><div class=\"sv-panel-body\">";
  h[h.length] = "<div class=\"sv-row\"><div class=\"sv-col-md-12 sv-text-center\"><p id=\"sits_prognum2\">&nbsp;</p></div></div>";
  h[h.length] = "<div class=\"sv-row\"><div class=\"sv-col-md-12\"><div id=\"sits_progbar2\"></div></div>";
  h[h.length] = "</div></div></div>";
  sits_dialog(mes,h.join(""),null,true,true,true,null,"sits_progdia",true,400); //show dialog message
  sits_collapsible_panel("#sits_progmore",false); //collapse more details panel
  sits_do_progress_val("sits_progbar",false); //create progress bar(start indeterminate)
  if(iss && sits_progress_int>0) {
    sits_bar_busy = true;
    setTimeout("sits_do_progress1();",sits_progress_int);
  }
  if(typeof(fnc)!="function") { //check for callback function
    fnc = null;
  }
  $("#sits_progdia").data("callback",fnc); //store callback function
  return true;
}

//Internal function to poll the database
function sits_do_progress1() {
  if(sits_bar_busy) {
    var d = null;
    if(d=sits_get_object("sits_progbar")) { //get progress bar object
      var pars = sits_progress_iss+"&"+sits_ajax_version+"&"+(++sits_progress_cur); //increase counter
      var opt = {type:"GET",url:"siw_dmu.bar_get",data:pars,dataType:"html",complete:sits_do_progress2}; //create ajax options object
      $.ajax(opt); //send ajax query
    }
  }
  return false;
}

//Internal function to update the progress bar
// object xml : in ;the XmlHttpRequest object from the ajax call
// string sts : in ;the status of the request
function sits_do_progress2(xml,sts) {
  var txt = xml.responseText; //get response text
  var tag = txt.substr(0,4);
  var val = txt.substr(4);
  var d = null;
  if(d=sits_get_object("sits_prognum")) { //check for existing div
    if(tag=="<OK>") {
      var beg = val.substr(0,4).toUpperCase(); //uppercase first four characters
      var beg2 = val.substr(0,7).toUpperCase();
      if(val.substr(0,1)=="#" || beg2=="NEWSIW_" ||beg=="SIW_" || beg=="HTTP" || beg=="@SIW" || beg=="@LNK") { //HEPD1 PPL21233 - provide an option of forwarding to a link created by MEN_YURL
        var maxv = d.getAttribute("data-maxv");
        if(maxv) {
          d.innerHTML = maxv+" / "+maxv+" - 100%"; //update numbers
        }
        else {
          d.innerHTML = "100%"; //update numbers
        }
        if(d=sits_get_object("sits_progrem")) {
          d.innerHTML = "0:00"; //update remaining
        }
        sits_do_progress_val("sits_progbar",100); //update progress bar
        sits_bar_busy = false;
        var btn = {};
        var vbar_bpok = sits_widget_bp.ui && sits_widget_bp.ui.dialogOk || "Ok";
        var vbar_bp017 = "";
        var vbar_bp018 = "";
        var vbar_bp016 = "";
        var vbar_bp256 = "";
        try {
          vbar_bp016 = bar_bp016;
          vbar_bp017 = bar_bp017;
          vbar_bp018 = bar_bp018;
        }
        catch(err) {
          vbar_bp017 = vbar_bpok;
          vbar_bp018 = sits_widget_bp.ui && sits_widget_bp.ui.dialogClose || "Close";
          vbar_bp016 = "A file has been produced and is ready to be downloaded";
        }
        try {
          vbar_bp256 = bar_bp256;
        }
        catch(err) {
          vbar_bp256 = "The content has been produced and is ready to be viewed in a new tab or window";
        }
        if(val.substr(0,1)=="#") {
          var fnc = $("#sits_progdia").data("callback"); //get callback function
          sits_dialog_close(true,"sits_progdia"); //close progress bar
          if(typeof(fnc)=="function") {
            fnc(true,val.substr(1)); //fire callback function
          }
        }
        else if(beg=="@SIW") { //special case for siw_pod
          btn[vbar_bp018] = function() { //add "cancel" button
            sits_dialog_close(true,"sits_progdia");
            bar_hide();
            bar_dele(val.substr(1));
          };
          btn[vbar_bp017] = function() { //add "download" button
            sits_navigate(val.substr(1)); //redirect to url
            sits_dialog_close(true,"sits_progdia");
            bar_hide();
          };
          sits_dialog_update("<p role=\"alert\">"+vbar_bp016+"</p>",btn,"sits_progdia"); //update dialog message
        }
        else if(beg=="@LNK") { //Case for URL built by MEN_YURL
          sits_navigate(val.substr(4)); //redirect to url
        }
        else {
          if(beg2=="NEWSIW_") {
            val = val.substr(3);
            btn[vbar_bp018] = function() { //add "cancel" button
              sits_dialog_close(true,"sits_progdia");
              bar_hide();
              bar_dele(val);
            };
            btn[vbar_bpok] = function() { //add "ok" button
              window.open(val,"_blank"); //open url in new window/tab
              sits_dialog_close(true,"sits_progdia");
              bar_hide();
            };
            sits_dialog_update("<p role=\"alert\">"+vbar_bp256+"</p>",btn,"sits_progdia");
          }
          else {
            sits_navigate(val); //redirect to url
          }
        }
        return true;
      }
      else {
        var boo = true;
        if(val) { //result returned
          if(val.substr(0,1)=="{") {
            boo = sits_do_progress4(d,val); //process JSON result
          }
          else {
            boo = sits_do_progress3(d,val); //process simple result
          }
        }
        if(boo) { //continue polling
          setTimeout("sits_do_progress1();",sits_progress_int);
          return true;
        }
      }
    }
  }
  var err = "";
  var did = "sits_prognum";
  if(tag=="<NO>" && val.substr(0,20)!="<!-- message box -->") {
    err = "<div class=\"sv-panel sv-panel-danger sv-text-left\" role=\"alert\">"; //create message box
    err += "<div class=\"sv-panel-heading\">&nbsp;</div><div class=\"sv-panel-body\">"+val+"</div></div>";
  }
  else {
    var io1 = txt.indexOf("<!-- message box -->"); //MEC or MES
    if(io1>-1) {
      io1 = io1+20;
      var io2 = txt.indexOf("<!-- end of message box-->");
      err = txt.substr(io1,io2-io1); //show message box
      did = "sits_progdia";
    }
    else {
      io1 = txt.indexOf("<H2>Result:</H2>"); //YSOD
      if(io1>0) {
        var reg = new RegExp("</body></html>","gi");
        err = txt.substr(io1+16).replace(reg,""); //show YSOD
        did = "sits_progdia";
      }
    }
  }
  if(d=sits_get_object(did)) { //get message object
    if(did=="sits_prognum") {
      sits_hide("#sits_progbar,#sits_progsumm");
    }
    d.innerHTML = err; //show error message
  }
  var btn = {}; //create button
  var lab = sits_widget_bp.ui && sits_widget_bp.ui.dialogOk || "Ok"; //button label
  btn[lab] = function() {
    sits_dialog_close(true,"sits_progdia");
    if(typeof(bar_hide)=="function") {
      bar_hide();
    }
  };
  sits_dialog_update(false,btn,"sits_progdia"); //add "Ok" button
  sits_dialog_resize(60,"sits_progdia"); //resize dialog
  sits_bar_busy = false;
  var fnc = $("#sits_progdia").data("callback"); //get callback function
  if(typeof(fnc)=="function") {
    fnc(false); //fire callback function
  }
  return false;
}

//Internal function to calculate value from simple result
// element d  : in ;the progress bar text wrapper
// string val : in ;the progress value(eg. "1/100")
function sits_do_progress3(d,val) {
  if($("#sits_progmore:visible").length>0) { //hide second progress bar (in case switching mode)
    sits_hide("#sits_progmore:visible");
    sits_do_progress_val("sits_progbar",0); //reset progress bar
  }
  if(val.indexOf("*")==0) {
    return sits_do_progress_val("sits_progbar",false); //indeterminate progress bar
  }
  var arr = val.split("/"); //value is set
  if(arr.length==2) {
    var cur = parseInt(arr[0],10);
    var tot = parseInt(arr[1],10);
    var per = parseInt(cur*100/tot,10); //calculate percentage
    d.setAttribute("data-maxv",arr[1]); //update maximum value
    d.innerHTML = arr[0]+" / "+arr[1]+" - "+per+"%"; //update numbers
    if(cur>0) {
      if(d=sits_get_object("sits_progrem")) {
        var dif =((new Date())-sits_progress_now)/1000; //calculate total seconds
        var rem = parseInt((dif*tot/cur)-dif,10); //calculate remaining seconds
        var pre = d.innerHTML; //get previous value
        if(pre.indexOf(":")>0) {
          arr = pre.split(":");
          pre =(arr[0]*60)+(arr[1]*1); //calculate previous seconds
          rem =((rem*0.55)+(pre*0.45)); //calculate running average
        }
        var m = Math.max(Math.floor(rem/60),0); //separate minutes and seconds
        var s = Math.max(parseInt(rem%60,10),0);
        d.innerHTML = m+":"+sits_left_pad(s,2,"0"); //update remaining time
        sits_show("#sits_proglab"); //show label
      }
    }
    sits_do_progress_val("sits_progbar",per); //update progress bar
    return true;
  }
  return false;
}

//Internal function to calculate value from JSON result
// element d  : in ;the progress bar text wrapper
// string val : in ;the progress value as a JSON string
function sits_do_progress4(d,val) {
  var obj = sits_parse_json(val);
  if(obj && obj.data) {
    var onecur = 0;
    var onetot = 0;
    var allcur = 0;
    var alltot = 0;
    var per = 0;
    var onetxt = "";
    var alltxt = obj.text || "";
    var arr = obj.data;
    var stacur = arr.length; //number of stages
    var statot = arr.length;
    for(var i=0;i<statot;i++) {
      obj = arr[i];
      var cur = parseInt(obj.cur,10);
      var tot = parseInt(obj.tot,10);
      if(onetot==0 && cur<tot) { //current stage
        onecur = cur;
        onetot = tot;
        onetxt = obj.txt || "";
        stacur = i+1;
      }
      allcur += cur; //all stages
      alltot += tot;
    }
    $(d).attr("data-maxv","").html(alltxt); //update status text
    if(allcur>0) {
      if(d=sits_get_object("sits_progrem")) {
        var dif =((new Date())-sits_progress_now)/1000; //calculate total seconds
        var rem = parseInt((dif*alltot/allcur)-dif,10); //calculate remaining seconds
        var pre = d.innerHTML; //get previous value
        if(pre.indexOf(":")>0) {
          arr = pre.split(":");
          pre =(arr[0]*60)+(arr[1]*1); //calculate previous seconds
          rem =((rem*0.55)+(pre*0.45)); //calculate running average
        }
        var m = Math.max(Math.floor(rem/60),0); //separate minutes and seconds
        var s = Math.max(parseInt(rem%60,10),0);
        d.innerHTML = m+":"+sits_left_pad(s,2,"0"); //update remaining time
        sits_show("#sits_proglab"); //show label
      }
    }
    per = parseInt(allcur*100/alltot,10); //calculate percentage
    sits_do_progress_val("sits_progbar",per); //update progress bar
    d = $("#sits_progmore"); //second progress bar
    if(d.length==1) {
      if(d.hasClass("sv-hide")) { //currently hidden
        sits_do_progress_val("sits_progbar2",0); //create progress bar
        d.slideDown(sits_anim_speed); //display minimised
      }
      $("#sits_prognum2").html(onetxt); //update stage text
      per = parseInt(onecur*100/onetot,10); //calculate percentage
      sits_do_progress_val("sits_progbar2",per); //update progress bar
    }
    return true;
  }
  return false;
}

//Internal function to set progress bar value
// string id : in ;the ID of the progress bar
// any val : in ;the progress value
function sits_do_progress_val(id,val) {
  var obj = $("#"+sits_escape_selector(id));
  if(obj.length!==1) {
    return false; //only handle one progress bar
  }
  var tra = ""; //no transition by default
  if(val===false) { //indeterminate progress bar
    if(id=="sits_progbar" && obj.data("ui-progressbar") && obj.progressbar("value")!==false) {
      $("#sits_prognum,#sits_progsumm").html(""); //hide other bits
    }
  }
  else { //proper progress bar
    if(val<100) {
      if(obj.data("ui-progressbar") && obj.progressbar("value")===false) {
        obj.progressbar({value:0}); //reset to zero
        obj.find("img").remove();
      }
      tra = "width 1s"; //slow transition
    }
    else {
      val = 100; //100% maximum
    }
  }
  obj.find(".ui-progressbar-value").css("transition",tra); //set transition
  obj.progressbar({value:val}); //create progress bar
  return true;
}

//Navigates to a particular url, after a delay
// string url : in ;the url to navigate to
function sits_navigate(url) {
  if(typeof(url)=="string" && url.length>5) {
    setTimeout("window.location = '"+url+"';",100); //redirect to url
    return true;
  }
  return false;
}

//Returns all the post data from the first form on the page
// string  fid  : in ;the id of the form you want to submit
// string  bid  : in ;the id of the button press you are simulating
function sits_form_data(fid,bid) {
  var d = "";
  var m = "";
  var f = null;
  if(typeof(fid)=="string" && fid.length>0) {
    f = sits_get_object(fid); //get specified form object
  }
   if(typeof(fid)=="object" && fid.tagName=="FORM") {
    f = fid; //get specified form object
  }
  if(!f) {
    f = document.forms[0]; //get first form object
    if(!f) {
      return null;
    }
  }
  var a = f.elements; //get all elements on the form
  var l = a.length;
  for(var i=0;i<l;i++) { //loop through elements
    var t = a[i];
    if(t.tagName!="SUBMIT" && !(t.tagName=="INPUT" && t.type=="submit")) { //ignore buttons
      var n = t.name || "" ;
      if(n!=m  && n != "") { //check for duplicate names
        d += "&"+sits_escape_url(n)+"="+sits_escape_url(sits_get_value(t)); //build data string
        m = n; //store previous name(for duplicate check)
      }
    }
  }
  if(d) { //data and button id specified
    if(bid) {
      var b = sits_get_object(bid); //get button object
      if(b) {
        d = b.name+"="+b.value+d; //prefix button value to data string
      }
    }
    else {
      d = d.substr(1); //remove leading ampersand
    }
    return d;
  }
  return null;
}

//Add a date picker to an input field(PPL013994/028633)
// string   sel  : in ;jQuery selector to apply the date picker to
// boolean  ico  : in ;show icon next to field(default is true)
// string  mind  : in ;minimum date(ie: "-1y -1m") - can also be numeric number of days(-7)
// string  maxd  : in ;maximum date(ie: "+1y +1m") - can also be numeric number of days(+7)
// function fnc  : in ;callback function when date selected
function sits_date_picker(sel,ico,mind,maxd,fnc) {
  var loc = sits_minified_path("../plugins/javascript/","modernizr.js","modernizr.min.js");
  if(sits_native_widgets<1 || sits_files_array[loc]=="Y") { //already loaded...
    sits_do_date_picker(sel,ico,mind,maxd,fnc); //...so call straight away
  }
  else { //not loaded yet...
    var par = {}; //create an object of parameters
    par.url = loc;
    par.fnc = sits_do_date_picker;
    par.p01 = sel;
    par.p02 = ico;
    par.p03 = mind;
    par.p04 = maxd;
    par.p05 = fnc;
    var len = sits_param_array.push(par); //save for later
    sits_include_file(loc);
  }
  return true;
}

//Internal function to add a date picker to an input field(PPL028633)
// string   sel  : in ;jQuery selector to apply the date picker to
// boolean  ico  : in ;show icon next to field(default is true)
// string  mind  : in ;minimum date(ie: "-1y -1m") - can also be numeric number of days(-7)
// string  maxd  : in ;maximum date(ie: "+1y +1m") - can also be numeric number of days(+7)
// function fnc  : in ;callback function when date selected
function sits_do_date_picker(sel,ico,mind,maxd,fnc) {
  if((typeof(sel)=="string" && sel.length>0) || typeof(sel)=="object") { //check first parameter
    var boo = false;
    switch(sits_native_widgets) {
      case 1:
        if(typeof(Modernizr)=="object" && Modernizr.inputtypes.date && Modernizr.touch) {
          boo = true; //use native widget if available and touch device
        }
        break;
      case 2:
        if(typeof(Modernizr)=="object" && Modernizr.inputtypes.date) {
          boo = true; //use native widget if available
        }
        break;
    }
    if(boo) { //use native widget
      var obj = $(sel); //get object array
      if(obj.length>0) {
        obj.each(function(i) {
          if(this.value!="") {
            this.value = sits_date_to_atom(this.value) //convert value
          }
          this.type = "date"; //change input type
          if(typeof(mind)=="string" && mind!="") {
            this.min = sits_date_to_atom(mind); //minimum date
          }
          if(typeof(maxd)=="string" && maxd!="") {
            this.max = sits_date_to_atom(maxd); //maximum date
          }
        });
        if(typeof(fnc)=="function") {
          obj.change(fnc); //register on change event
        }
        return true;
      }
      return false;
    }
    return sits_ui_date_picker(sel,ico,mind,maxd,fnc); //fall back to jQuery UI
  }
  return false;
}

//Function to convert a localised date string into ISO-8601 date format(PPL028633)
function sits_date_to_atom(valu) {
  if(typeof(valu)=="string" && valu!="" && valu.length>5) {
    if(valu.substr(4,1)!="-" || valu.substr(6,1)!="-") {
      if(sits_dates_cache[valu]) { //check cache for converted value
        return sits_dates_cache[valu];
      }
      var orig = valu; //store original value
      valu = sits_date_convert(sits_date_format,"yy-mm-dd",valu) || orig; //convert date format
      if(valu==orig) { //failed to convert date
        valu = sits_date_to_string(valu,"yy-mm-dd") || orig; //try converting Uniface date string into date
      }
      if(valu==orig) { //failed to convert date
        var arr = [];
        valu = sits_replace(valu," ","/"); //fix other delimiters
        valu = sits_replace(valu,"-","/");
        valu = sits_replace(valu,".","/");
        valu = sits_replace(valu,"//","/");
        var back = valu; //store backup value
        switch(sits_date_format.substr(0,1).toUpperCase()) { //try other formats based on region and length
          case "D": //day first - British?
            switch(orig.length) {
              case 6:
                arr = ["d/m/y","m/d/y","y/m/d"];
                break;
              case 7:
                arr = ["d/m/y","dd/m/y","d/mm/y","m/d/y","m/dd/y","mm/d/y","y/m/d","y/m/dd","y/mm/d"];
                break;
              case 8:
                arr = ["d/m/y","dd/m/y","d/mm/y","dd/mm/y","d/m/yy","d/M/y","d/MM/y","m/d/y","m/dd/y","mm/d/y","mm/dd/y","m/d/yy","M/d/y","MM/d/y","y/m/d","y/m/dd","y/mm/d","y/mm/dd","yy/m/d","y/M/d","y/MM/d"];
                break;
              case 9:
                arr = ["d/m/yy","dd/m/yy","d/mm/yy","d/M/y","dd/M/y","d/MM/y","dd/MM/y","m/d/yy","m/dd/yy","mm/d/yy","M/d/y","M/dd/y","MM/d/y","MM/dd/y","yy/m/d","yy/m/dd","yy/mm/d","y/M/d","y/M/dd","y/MM/d","y/MM/dd"];
                break;
              case 10:
                arr = ["d/m/yy","dd/m/yy","d/mm/yy","dd/mm/yy","d/MM/y","dd/MM/y","d/M/yy","d/MM/yy","m/d/yy","m/dd/yy","mm/d/yy","mm/dd/yy","MM/d/y","MM/dd/y","M/d/yy","MM/d/yy","yy/m/d","yy/m/dd","yy/mm/d","yy/mm/dd","y/MM/d","y/MM/dd","yy/M/d","yy/MM/d"];
                break;
              default:
                if(orig.length>10) {
                  arr = ["d/MM/y","dd/MM/y","d/M/yy","dd/M/yy","d/MM/yy","dd/MM/yy","MM/d/y","MM/dd/y","M/d/yy","M/dd/yy","MM/d/yy","MM/dd/yy","y/MM/d","y/MM/dd","yy/M/d","yy/MM/d","yy/MM/dd"];
                }
            }
            break;
          case "M": //month first - American?
            switch(orig.length) {
              case 6:
                arr = ["m/d/y","d/m/y","y/m/d"];
                break;
              case 7:
                arr = ["m/d/y","m/dd/y","mm/d/y","d/m/y","dd/m/y","d/mm/y","y/m/d","y/m/dd","y/mm/d"];
                break;
              case 8:
                arr = ["m/d/y","m/dd/y","mm/d/y","mm/dd/y","m/d/yy","M/d/y","MM/d/y","d/m/y","dd/m/y","d/mm/y","dd/mm/y","d/m/yy","d/M/y","d/MM/y","y/m/d","y/m/dd","y/mm/d","y/mm/dd","yy/m/d","y/M/d","y/MM/d"];
                break;
              case 9:
                arr = ["m/d/yy","m/dd/yy","mm/d/yy","M/d/y","M/dd/y","MM/d/y","MM/dd/y","d/m/yy","dd/m/yy","d/mm/yy","d/M/y","dd/M/y","d/MM/y","dd/MM/y","yy/m/d","yy/m/dd","yy/mm/d","y/M/d","y/M/dd","y/MM/d","y/MM/dd"];
                break;
              case 10:
                arr = ["m/d/yy","m/dd/yy","mm/d/yy","mm/dd/yy","MM/d/y","MM/dd/y","M/d/yy","MM/d/yy","d/m/yy","dd/m/yy","d/mm/yy","dd/mm/yy","d/MM/y","dd/MM/y","d/M/yy","d/MM/yy","yy/m/d","yy/m/dd","yy/mm/d","yy/mm/dd","y/MM/d","y/MM/dd","yy/M/d","yy/MM/d"];
                break;
              default:
                if(orig.length>10) {
                  arr = ["MM/d/y","MM/dd/y","M/d/yy","M/dd/yy","MM/d/yy","MM/dd/yy","d/MM/y","dd/MM/y","d/M/yy","dd/M/yy","d/MM/yy","dd/MM/yy","y/MM/d","y/MM/dd","yy/M/d","yy/MM/d","yy/MM/dd"];
                }
            }
            break;
          case "Y": //year first - Canadian?
            switch(orig.length) {
              case 6:
                arr = ["y/m/d","d/m/y","m/d/y"];
                break;
              case 7:
                arr = ["y/m/d","y/m/dd","y/mm/d","d/m/y","dd/m/y","d/mm/y","m/d/y","m/dd/y","mm/d/y"];
                break;
              case 8:
                arr = ["y/m/d","y/m/dd","y/mm/d","y/mm/dd","yy/m/d","y/M/d","y/MM/d","d/m/y","dd/m/y","d/mm/y","dd/mm/y","d/m/yy","d/M/y","d/MM/y","m/d/y","m/dd/y","mm/d/y","mm/dd/y","m/d/yy","M/d/y","MM/d/y"];
                break;
              case 9:
                arr = ["yy/m/d","yy/m/dd","yy/mm/d","y/M/d","y/M/dd","y/MM/d","y/MM/dd","d/m/yy","dd/m/yy","d/mm/yy","d/M/y","dd/M/y","d/MM/y","dd/MM/y","m/d/yy","m/dd/yy","mm/d/yy","M/d/y","M/dd/y","MM/d/y","MM/dd/y"];
                break;
              case 10:
                arr = ["yy/m/d","yy/m/dd","yy/mm/d","yy/mm/dd","d/m/yy","dd/m/yy","d/mm/yy","dd/mm/yy","d/MM/y","dd/MM/y","d/M/yy","d/MM/yy","m/d/yy","m/dd/yy","mm/d/yy","mm/dd/yy","MM/d/y","MM/dd/y","M/d/yy","MM/d/yy","y/MM/d","y/MM/dd","yy/M/d","yy/MM/d"];
                break;
              default:
                if(orig.length>10) {
                  arr = ["y/MM/d","y/MM/dd","yy/M/d","yy/MM/d","yy/MM/dd","d/MM/y","dd/MM/y","d/M/yy","dd/M/yy","d/MM/yy","dd/MM/yy","MM/d/y","MM/dd/y","M/d/yy","M/dd/yy","MM/d/yy","MM/dd/yy"];
                }
            }
            break;
        }
        var l = arr.length;
        for(var i=0;i<l;i++) { //loop through other formats
          var frm = arr[i];
          if(frm!=sits_date_format) {
            valu = sits_date_convert(frm,"yy-mm-dd",valu); //convert date format
            if(valu!=back) {
              i = l+1; //break out of loop
            }
          }
        }
        if(valu==back) { //date has not been converted...
          valu = orig; //...so restore to original
        }
      }
      sits_dates_cache[orig] = valu; //cache converted value
    }
  }
  return valu; //return converted value(or original value if invalid parameters)
}

//Function to convert an ISO-8601 date string into localised date format(PPL028633)
function sits_atom_to_date(valu) {
  if(typeof(valu)=="string" && valu!="" && valu.length>5) {
    if(valu.substr(4,1)=="-" || valu.substr(6,1)=="-") {
      valu = sits_date_convert("yy-mm-dd",sits_date_format,valu); //convert date format
    }
  }
  return valu; //return converted value(or original value if invalid parameters)
}

//Function to convert a string date value into another date format(PPL028633)
// string frmi  : in ;format of date value (see http://api.jqueryui.com/datepicker/#utility-formatDate)
// string frmo  : in ;format of date required (see above)
// string valu  : in ;date value
function sits_date_convert(frmi,frmo,valu) {
  if(typeof(frmi)=="string" && frmi!="" && typeof(frmo)=="string" && frmo!="" && typeof(valu)=="string" && valu!="" && valu.length>5) {
    var orig = valu; //store original value
    try {
      var opt = {}; //define options
      opt.shortYearCutoff = sits_century_break;
      var dat = $.datepicker.parseDate(frmi,valu,opt); //convert from original format into date
      valu = $.datepicker.formatDate(frmo,dat,opt); //convert from date into new format
    }
    catch(e) {
      return orig; //return original value is error
    }
  }
  return valu; //return converted value(or original value if invalid parameters)
}

//Function to convert a Uniface date/datetime numeric string to date
// string valu  : in ;date/datetime value as a string
function sits_uniface_to_date(valu) {
  if(typeof(valu)!="string" || valu.length<8 || isNaN(valu)) {
    return undefined;
  }
  var newdate = new Date();
  var year = 0;
  var month = 0;
  var day = 0;
  switch(valu.length) {
    case 8: //date
		  year = sits_get_integer(valu.substr(0,4));
			month = sits_get_integer(valu.substr(4,2));
			day = sits_get_integer(valu.substr(6,2));
			newdate.setFullYear(year,month-1,day);
			newdate.setHours(0,0,0,0);
		  return newdate;
    case 16: //datetime
		  year = sits_get_integer(valu.substr(0,4));
			month = sits_get_integer(valu.substr(4,2));
			day = sits_get_integer(valu.substr(6,2));
		  var hours = sits_get_integer(valu.substr(8,2));
			var mins = sits_get_integer(valu.substr(10,2));
			var secs = sits_get_integer(valu.substr(12,2));
			var tics = sits_get_integer(valu.substr(14,2));
			newdate.setFullYear(year,month-1,day);
			newdate.setHours(hours,mins,secs,tics*10);
		  return newdate;
    default:
      return undefined;
  }
}

//Function to convert a string date value into a date object
// string valu  : in ;date value as a string
// string frmi  : in ;format of date value (see http://api.jqueryui.com/datepicker/#utility-formatDate)
function sits_to_date(valu,frmi) {
  if(typeof(frmi)!="string" || frmi.length<1) {
    frmi = sits_date_format;
  }
  var dat = undefined;
  if(typeof(valu)=="string" && valu!="" && valu.length>5) {
    dat = sits_uniface_to_date(valu);
    if(dat instanceof Date && !isNaN(dat.valueOf())) { //make sure we have a date
      return dat;
    }
    try {
      var opt = {}; //define options
      opt.shortYearCutoff = sits_century_break;
      dat = $.datepicker.parseDate(frmi,valu,opt); //convert from original format into date
    }
    catch(e) {
      return undefined; //return undefined if invalid
    }
  }
	if(dat instanceof Date && !isNaN(dat.valueOf())) { //make sure we have a date
	  return dat;
	}
  return undefined; //return undefined if invalid
}

//Turn a time string to a Date object
// string  tim  : in ;the time string
// string frmi	: in	;the format of the time (use &D notation H2:N2:S2.T2 p)
function sits_to_time(tim,frmi) {
  if(typeof(tim)!="string" || tim.length<3) {
    return undefined;
  }
  if(typeof(frmi)!="string" || frmi.length<1) {
    frmi = "";
  }
	var stringval = "";
  var itemval = "";
  var hour = "";
  var mins = "";
  var secs = "";
  var tick = "";
  var am_pm = "";
  var time_delim = "~";
  var reg = new RegExp('^[0-9]+$');
  if(frmi=="" && reg.test(tim)) {	// If no format and only digits provided?
    if(tim.length==16) {		// If a 16 digit number - then already in
		  tim = tim.substring(8);
    }
    if(tim.length==8)	{	// If a 8 digit number - then already in
		  hour = sits_get_integer(tim.substr(0,2));
			mins = sits_get_integer(tim.substr(2,2));
			secs = sits_get_integer(tim.substr(4,2));
			tics = sits_get_integer(tim.substr(6,2));
	    var newdate = new Date();
			newdate.setFullYear(1,0,1);
	    newdate.setHours(hour,mins,secs,tics*10);
      return newdate;
    }
  }
  if(tim.length==frmi.length) {		// If length of format is exactly the same as the time - then assume
    while(frmi!="") {											// format is something like HH:NN - and extract parts in that order
      switch(frmi.toUpperCase().substr(0,1)) {
        case "H":
          hour += tim.substr(0,1);
					break;
        case "N":
				case "M":	// Must use "N" for Minutes - as M can be Month or AM/PM
          mins += tim.substr(0,1);
					break;
        case "S":
          secs += tim.substr(0,1);
					break;
        case "T":
          tick += tim.substr(0,1);
					break;
        default:
          if(frmi.toUpperCase().substr(0,2)=="AM" || frmi.toUpperCase().substr(0,2)=="PM") {
            am_pm = tim.toUpperCase().substr(0,2);
            frmi = frmi.substr(1);		// remove first character of AM/PM - second character
            tim = tim.substr(1);		// ... removed as normal after endselectcase
          }
      }
      frmi = frmi.substr(1);
      tim = tim.substr(1);
    }
		hour = sits_get_integer(hour);
		mins = sits_get_integer(mins);
		secs = sits_get_integer(secs);
		tick = sits_get_integer(tick);
		if(typeof hour !== "number" || isNaN(hour) || hour<0) {
			hour = 0;
		}
		if(am_pm=="PM" && hour<12) {
			hour = 12+hour;
		}
		if(hour>23) {
			return undefined;
		}
		if(typeof mins !== "number" || isNaN(mins) || mins<0) {
			mins = 0;
		}
		if(mins>59) {
			return undefined;
		}
		if(typeof secs !== "number" || isNaN(secs) || secs<0) {
			secs = 0;
		}
		if(secs>59) {
			return undefined;
		}
		if(typeof tick !== "number" || isNaN(tick) || tick<0) {
			tick = 0;
		}
		if(tick>999) {
			return undefined;
		}
	  var newdate = new Date();
	  newdate.setFullYear(1,0,1);
	  newdate.setHours(hour,mins,secs,tick*10);
    return newdate;
  }
	var order = new Array();
	var delimiters = new Array();
  while(frmi!="") {					// If time format give - decode for order and delimiters ...
    switch(frmi.substr(0,1).toUpperCase()) {
      case "H":
        order.push("H");
        frmi = sits_replace(frmi, 'h', "");		// Remove all other H's(as may enter HH)
				frmi = sits_replace(frmi, 'H', "");		// Remove all other H's(as may enter HH)
				break;
      case "N":
			case "M":
        order.push("N");
        frmi = sits_replace(frmi, 'n', "");		// Remove all other N's(as may enter NN)
				frmi = sits_replace(frmi, 'N', "");		// Remove all other N's(as may enter NN)
				frmi = sits_replace(frmi, 'm', "");		// Remove all other M's(as may enter MM)
				frmi = sits_replace(frmi, 'M', "");		// Remove all other M's(as may enter MM)
				break;
      case "S":
        order.push("S");
        frmi = sits_replace(frmi, 's', "");		// Remove all other s's(as may enter SS)
				frmi = sits_replace(frmi, 'S', "");		// Remove all other s's(as may enter SS)
				break;
      case "T":
        order.push("T");
        frmi = sits_replace(frmi, 't', "");		// Remove all other T's(as may enter TT)
				frmi = sits_replace(frmi, 'T', "");		// Remove all other T's(as may enter TT)
				break;
      default:
        if(frmi.toUpperCase().substr(0,2)=="AM" || frmi.toUpperCase().substr(0,2)=="PM") {
					order.push("AM_PM");
          frmi = frmi.substr(2);
        }
        else {
					delimiters.push(frmi.substr(0,1)); //anything else must be a delimiter
          frmi = frmi.substr(1);
        }
    }
  }
  if(order=="") {
    order = ["H", "N", "S", "T"];
  }
  if(delimiters=="")	{				// Standard time delimiters include space, -, / \ . , and :
		delimiters = [" ", "/", "\\", "-", ".", ",", ":"];
  }
  am_pm = "AM";
  stringval = tim;
  if(stringval.substr(stringval.length,1)=="Z") {				// If XML standard time(ends in Z) - remove Z
    stringval = stringval.substring(0,stringval.length);
  }
	for(var arrayid in delimiters) {
    stringval = sits_replace(stringval,delimiters[arrayid],time_delim);
  }
	stringval = sits_replace(stringval,time_delim+time_delim,time_delim); //Some times use double delimiter such as ". " !
  stringval = sits_right_trim(sits_left_trim(stringval,time_delim),time_delim);		// Remove any leading/trailing gold semicolons
  if(stringval.split(time_delim).length==1) {					// If still only one item - try some other delimiters ...
    stringval = sits_replace(stringval," ",time_delim);
    stringval = sits_replace(stringval,"\\",time_delim);
    stringval = sits_replace(stringval,",",time_delim);
    stringval = sits_replace(stringval,".",time_delim);
    stringval = sits_replace(stringval,"-",time_delim);
    stringval = sits_replace(stringval,":",time_delim);
    stringval = sits_replace(stringval,time_delim+time_delim,time_delim);		// Some times use double delimiter such as ". " !
    stringval = sits_right_trim(sits_left_trim(stringval,time_delim),time_delim)	;	// Remove any leading/trailing gold semicolons
  }
	stringval = stringval.split(time_delim);
  if(stringval.length==1) {				// If still only one segment?
    if(tim.length==6 && reg.test(tim)) {		// if 6 digits - split into three sections(xx;xx;xx)
      stringval = [tim.substr(0,2), tim.substr(2,2), tim.substr(4,2)];
    }
    else {
		  if(tim.length==8 && reg.test(tim)) {	// if 8 digits - split into four section ...
        stringval = [tim.substr(0,2), tim.substr(2,2), tim.substr(4,2), tim.substr(6,2)];
			}
    }
  }
  else {
    if(stringval.length>5) {		// Five sections are allowed as we might have HH NN SS TT AM
      return undefined;
    }
  }
  // StringVal now contains gold semi colon delimited hour minutes seconds ticks and AM/PM(in some order - so extract each item)
  for(var arrayid in stringval) {				// loop though each item Hour, miNute, Second, Tick, AM/PM
	  if(typeof(stringval[arrayid])=="string") {
			if(stringval[arrayid].toUpperCase()=="AM" || stringval[arrayid].toUpperCase()=="PM") {
				am_pm = stringval[arrayid].toUpperCase();
			}
      else {
				switch(order[arrayid]) {	// Convert item number into item type(day/month/year)?
					case "H":
						hour = sits_get_integer(stringval[arrayid]);
						break;
					case "N":
						mins = sits_get_integer(stringval[arrayid]);
						break;
					case "S":
						secs = sits_get_integer(stringval[arrayid]);
						break;
					case "T":
						tick = sits_get_integer(stringval[arrayid]);
						break;
				}
			}
		}
  }
  if(typeof(hour)!=="number" || isNaN(hour) || hour<0) {
    hour = 0;
  }
  if(am_pm=="PM" && hour<12) {
    hour = 12+hour;
  }
  if(hour>23) {
    return undefined;
  }
  if(typeof(mins)!=="number" || isNaN(mins) || mins<0) {
    mins = 0;
  }
  if(mins>59) {
    return undefined;
  }
  if(typeof(secs)!=="number" || isNaN(secs) || secs<0) {
    secs = 0;
  }
  if(secs>59) {
    return undefined;
  }
  if(typeof(tick)!=="number" || isNaN(tick) || tick<0) {
    tick = 0;
  }
  if(tick>999) {
    return undefined;
  }
	var newdate = new Date();
	newdate.setFullYear(1,0,1);
	newdate.setHours(hour,mins,secs,tick*10);
  return newdate;
}

//Turn a datetime string to a Date object
// string  dtim  : in ;the time string
// string  frmi	: in	;the format of the datetime
//              DATE FORMAT = see http://api.jqueryui.com/datepicker/#utility-formatDate
//              TIME FORMAT = use &D notation H2:N2:S2.T2 p
function sits_to_datetime(dtim,frmi) {
  if(typeof(frmi)!="string" || frmi.length<1) {
    frmi = "";
  }
  var dat = undefined;
  if(typeof(dtim)=="string" && dtim!="" && dtim.length>3) {
    dat = sits_uniface_to_date(dtim); //try uniface format first
    if(typeof(dat)=="undefined") {
      var dstr = "";
      var tstr = "";
      var pos = dtim.indexOf(":")-1; //time delimiter is always colon
      if(pos>=0) {
        while(pos>=0 && $.isNumeric(dtim.charAt(pos))) { //loop back to find non-numeric
          pos--;
        }
        if(pos>=0) {
          dstr = sits_white_trim(dtim.substring(0,pos)); //split date and time
          tstr = sits_white_trim(dtim.substr(pos+1));
        }
        else {
          tstr = dtim; //time only
        }
      }
      else {
        dstr = dtim; //date only
      }
      var dfrm = "";
      var tfrm = "";
      if(frmi!="") {
        var hfrm = "H";
        pos = frmi.indexOf(hfrm);
        if(pos<0) {
          hfrm = "h";
          pos = frmi.indexOf(hfrm);
        }
        if(pos==0) {
          tfrm = frmi; //time format only
        }
        else if(pos<0) {
          dfrm = frmi; //date format only
        }
        else {
          var arr = frmi.split(hfrm); //split date and time
          dfrm = sits_white_trim(arr.splice(0,1));
          tfrm = sits_white_trim(hfrm+arr.join(hfrm));
        }
      }
      var tdat = sits_to_date(dstr,dfrm); //convert both parts
      var ttim = sits_to_time(tstr,tfrm);
      if(typeof(tdat)!="undefined") {
        if(typeof(ttim)!="undefined") {
          var str = sits_date_to_string(tdat,"yy-mm-dd")+"T"+sits_time_to_string(ttim,"H2:N2:S2.T2");
          dat = new Date(str); //combine date and time
        }
        else {
          dat = tdat; //date only
        }
      }
      else {
        if(typeof(ttim)!="undefined") {
          dat = ttim; //time only
        }
      }
    }
  }
  return dat;
}

//Function to convert a date object to a string
// date valu  : in ;date object
// string frmi  : in ;format of date required (see http://api.jqueryui.com/datepicker/#utility-formatDate)
function sits_date_to_string(valu,frmi) {
  if(typeof(valu)=="string") {
    valu = sits_uniface_to_date(valu); //try converting Uniface date string into date
  }
  if(typeof(frmi)!="string" || frmi.length<1) {
    frmi = sits_date_format;
  }
  if(valu instanceof Date && !isNaN(valu.valueOf())) {
    try {
      var opt = {}; //define options
      opt.shortYearCutoff = sits_century_break;
      return $.datepicker.formatDate(frmi,valu,opt); //convert from original format into date
    }
    catch(e) {
      return ""; //return blank if invalid
    }
  }
  return ""; //return blank if invalid
}

//Turns the time part of a Date object into a string
// date valu  : in ;date object
// string frmi  : in ;format of time required (use &D notation H2:N2:S2.T2 p)
function sits_time_to_string(valu,frmi) {
  if(typeof(frmi)!="string" || frmi.length<1) {
    frmi = sits_time_format;
  }
  if(valu instanceof Date && !isNaN(valu.valueOf())) {
	  var am_pm = "AM";
		var hours = valu.getHours();
		if(hours>12) {
		  am_pm = "PM";
		}
		if(hours>12 &&(frmi.search("p")>0 || frmi.search("P")>0)) {
		  hours -= 12;
		}
		var hours2 = "00"+hours;
		hours2 = hours2.substring(hours2.length-2);
		var mins = valu.getMinutes();
		var mins2 = "00"+mins;
		mins2 = mins2.substring(mins2.length-2);
		var secs = valu.getSeconds();
		var secs2 = "00"+secs;
		secs2 = secs2.substring(secs2.length-2);

		//Ticks can be 3 digits so we need to turn it into 2 digits
		var ticks = valu.getMilliseconds();
		if(ticks <= 9) {
		  ticks = Math.round(("0.0"+valu.getMilliseconds())*100);
		}
    else {
		  ticks = Math.round(("0."+valu.getMilliseconds())*100);
		}
		var ticks2 = "00"+ticks;
		ticks2 = ticks2.substring(ticks2.length-2);
		frmi = sits_replace(frmi,"H2",hours2);
		frmi = sits_replace(frmi,"h2",hours2);
		frmi = sits_replace(frmi,"H",hours);
		frmi = sits_replace(frmi,"h",hours);
		frmi = sits_replace(frmi,"N2",mins2);
		frmi = sits_replace(frmi,"n2",mins2);
		frmi = sits_replace(frmi,"N",mins);
		frmi = sits_replace(frmi,"n",mins);
		frmi = sits_replace(frmi,"S2",secs2);
		frmi = sits_replace(frmi,"s2",secs2);
		frmi = sits_replace(frmi,"S",secs);
		frmi = sits_replace(frmi,"s",secs);
		frmi = sits_replace(frmi,"T2",ticks2);
		frmi = sits_replace(frmi,"t2",ticks2);
		frmi = sits_replace(frmi,"T",ticks);
		frmi = sits_replace(frmi,"t",ticks);
		frmi = sits_replace(frmi,"p",am_pm.toLowerCase());
		frmi = sits_replace(frmi,"P",am_pm);
		return frmi;
	}
	return "";
}

//Turns a Date object into a string
// date valu  : in ;date object
// string frmi  : in ;format of datetime required
//              DATE FORMAT = see http://api.jqueryui.com/datepicker/#utility-formatDate
//              TIME FORMAT = use &D notation H2:N2:S2.T2 p
function sits_datetime_to_string(valu,frmi) {
  if(typeof(valu)=="string") {
    valu = sits_uniface_to_date(valu); //try converting Uniface date string into date
  }
  if(typeof(frmi)!="string" || frmi.length<1) {
    frmi = sits_date_format+" "+sits_time_format;
  }
  var frmi1 = "";
	var frmi2 = "";
	var char_to_split = frmi.toUpperCase().search("H");
	if(char_to_split<0) char_to_split = frmi.toUpperCase().search("N");
	if(char_to_split<0) char_to_split = frmi.toUpperCase().search("S");
	if(char_to_split<0) char_to_split = frmi.toUpperCase().search("T");
	if(char_to_split<0) char_to_split = frmi.toUpperCase().search("P");
	if(char_to_split>=0) {
	  frmi1 = frmi.substring(0,char_to_split);
	  frmi2 = frmi.substring(char_to_split);
	}
  else {
	  frmi1 = frmi;
	}
  var datepart = sits_date_to_string(valu,frmi1);
	var timepart = sits_time_to_string(valu,frmi2);
	if(datepart!="" && timepart!="") {
	  return datepart+timepart;
  }
	return "";
}

//Function to convert a date object(date part only) to uniface datetime format
// date valu  : in ;date object
function sits_date_to_uniface(valu) {
  var datepart = sits_date_to_string(valu,"yymmdd");
	if(datepart!="") {
	  return datepart+"00000000";
  }
	return "";
}

//Function to convert a date object(time part only) to uniface datetime format
// date valu  : in ;date object
function sits_time_to_uniface(valu) {
  var timepart = sits_time_to_string(valu,"H2N2S2T2");
	if(timepart!="") {
	  return "00000000"+timepart;
  }
	return "";
}

//Function to convert a date object to uniface datetime format
// date valu  : in ;date object
function sits_datetime_to_uniface(valu) {
	return sits_datetime_to_string(valu,"yymmddH2N2S2T2");
}

//Internal function to add a date picker to an input field(PPL028633)
// string    sel  : in ;jQuery selector to apply the date picker to
// boolean   ico  : in ;show icon next to field(default is true)
// string   mind  : in ;minimum date(ie: "-1y -1m") - can also be numeric number of days(-7)
// string   maxd  : in ;maximum date(ie: "+1y +1m") - can also be numeric number of days(+7)
// function  fnc  : in ;callback function when date selected
// numeric  mode  : in ;0=date, 1=time, 2=datetime(default is 0)
function sits_ui_date_picker(sel,ico,mind,maxd,fnc,mode) {
  if((typeof(sel)=="string" && sel.length>0) || typeof(sel)=="object") { //check first parameter
    if(typeof(ico)!="boolean") {
      ico = true; //check second parameter
    }
    if(typeof(mind)=="undefined") {
      mind = null; //check third parameter
    }
    if(typeof(maxd)=="undefined") {
      maxd = null; //check fourth parameter
    }
    if(typeof(mode)!="number") {
      mode = 0; //check sixth parameter
    }
    var obj = $(sel); //get object array
    if(obj.length>0) {
      var img = "";
      var opt = {};
      opt.firstDay = 1;
      opt.yearRange = sits_year_range; //set year range, ie: "-100:+50"
      opt.dateFormat = sits_date_format; //set format, ie: "01/Jan/2001"
      opt.timeFormat = sits_time_format.replace(/H2/g,"HH").replace(/N2/g,"mm").replace(/N/g,"m"); //convert format
      opt.changeMonth = true;
      opt.changeYear = true;
      opt.duration = sits_anim_speed;
      opt.shortYearCutoff = sits_century_break;
      switch(mode) {
        case 1: //time
          img = "../images/si_clock.gif";
          opt.buttonText = sits_widget_bp.ui && sits_widget_bp.ui.datePickerTime || sits_button_text; //set button tooltip, ie: "..."
          opt.minTime = mind || null; //set minimum time
          opt.maxTime = maxd || null; //set maximum time
          opt.timeOnly = true;
          opt.afterInject = function() {
            var div = $("div.ui-timepicker-div");
            div.find("div.ui-widget-header").addClass("ui-datepicker-header"); //fix header style
            sits_hide("button.ui-datepicker-current");
            var cls = $("#ui-datepicker-div").data("dd-active");
            if(cls) {
              $("div."+cls,div).find("span.ui-slider-handle").addClass("ui-state-focus"); //focus on slider
            }
          };
          opt.addSliderAccess = true; //requires "jquery-ui-sliderAccess.js"
          opt.sliderAccessArgs = {};
          opt = $.extend(opt,sits_widget_bp.tp || {}); //use boilerplates
          break;
        case 2: //datetime
          img = "../images/si_cal_clock.gif";
          opt.buttonText = sits_widget_bp.ui && sits_widget_bp.ui.datePickerDateTime || sits_button_text; //set button tooltip, ie: "..."
          opt.minDateTime =(sits_type_of(mind)=="date" ? mind : null); //set minimum datetime
          opt.maxDateTime =(sits_type_of(maxd)=="date" ? maxd : null); //set maximum datetime
          opt.timeOnly = false;
          opt.afterInject = function() {
            var div = $("div.ui-timepicker-div");
            div.find("div.ui-widget-header").addClass("ui-datepicker-header"); //fix header style
            sits_hide("button.ui-datepicker-current");
            var cls = $("#ui-datepicker-div").data("dd-active");
            if(cls) {
              $("div."+cls,div).find("span.ui-slider-handle").addClass("ui-state-focus"); //focus on slider
            }
          };
          opt.addSliderAccess = true; //requires "jquery-ui-sliderAccess.js"
          opt.sliderAccessArgs = {};
          opt = $.extend(opt,sits_widget_bp.tp || {}); //use boilerplates
          break;
        default: //date
          img = "../images/si_calendar.gif";
          opt.buttonText = sits_widget_bp.ui && sits_widget_bp.ui.datePickerDate || sits_button_text; //set button tooltip, ie: "..."
          opt.minDate = mind; //set minimum date
          opt.maxDate = maxd; //set maximum date
      }
      if(ico) {
        opt.showOn = "button"; //display icon next to field
        opt.buttonImageOnly = true;
        opt.buttonImage = img;
      }
      else {
        opt.showOn = "focus"; //no icon so fire on focus
      }
      if(typeof(fnc)=="function") {
        opt.onSelect = fnc; //callback function when value selected
      }
      opt.beforeShow = function(inp,obj) { //stacking fix
        var jq_inp = $(inp);
        if(jq_inp.is(":disabled,[readonly]")) {
          jq_inp.datepicker("disable"); //don't show popup if field is disabled or readonly
          return false;
        }
        if(typeof(dmx_tooltip_version)=="string") {
          $("body").tooltip("disable"); //disable tooltips to avoid conflict
        }
        var mrg = 0;
        var lft = 0;
        var par = jq_inp.closest("div.sv-input-group");
        if(par.length==1) {
          mrg = par.outerWidth()-obj.dpDiv.outerWidth(); //align to input group
          lft = par.offset().left;
        }
        else {
          mrg = jq_inp.outerWidth()-obj.dpDiv.outerWidth(); //align to input field
          lft = jq_inp.offset().left;
        }
        if(lft+mrg>0) {
          obj.dpDiv.css({marginLeft:mrg+"px"}); //right align popup
        }
        else {
          obj.dpDiv.css({marginLeft:""}); //reset margin
        }
        if(jq_inp.hasClass("hasTimepicker") && jq_inp.val()=="") { //check for blank time value
          var tpo = obj.settings.timepicker;
          tpo.hour = 0;
          tpo.minute = 0;
          tpo.second = 0;
          tpo.millisec = 0;
          tpo.microsec = 0;
        }
        setTimeout(function() {
          var div = $("#ui-datepicker-div"); //get popup
          var min = (jq_inp.css("zIndex")*1 || 0); //minimum order in stack
          var par = jq_inp.closest("div.ui-dialog"); //get dialog div
          if(par.length==1) {
            min = Math.max((par.css("zIndex")*1 || 0),min); //check if dialog is higher
          }
          if(!isNaN(min) && min>0) {
            var cur = div.css("zIndex"); //current order in stack
            if(isNaN(cur) || cur*1<=min*1) {
              div.css("zIndex",min*1+1); //set to minimum order if current is less
            }
          }
          var mth = sits_widget_bp.ui && sits_widget_bp.ui.datePickerMonth || "Select a month";
          var yea = sits_widget_bp.ui && sits_widget_bp.ui.datePickerYear || "Select a year";
          div.find("select.ui-datepicker-month").attr("title",mth); //add titles for accessibility
          div.find("select.ui-datepicker-year").attr("title",yea);
          if(opt.buttonText!=sits_button_text) {
            var cap = $("<caption>").addClass("sv-sr-only").text(opt.buttonText); //add caption
            div.find("table.ui-datepicker-calendar").prepend(cap);
          }
          div.find("[class^=' ']").each(function(i) {
            $(this).attr("class",$.trim(this.className)); //remove whitespace from class
          });
        },10);
      };
      opt.onClose = function(str,obj) {
        if(typeof(dmx_tooltip_version)=="string") {
          $("body").tooltip("enable"); //re-enable tooltips on close
        }
        if($(document.activeElement).parents("#ui-datepicker-div").length>0) {
          this.focus(); //focus back on the input
        }
      };
      switch(mode) {
        case 1: //time
          obj.timepicker(opt).addClass("hasTimepicker"); //create time picker
          break;
        case 2: //datetime
          obj.datetimepicker(opt).addClass("hasTimepicker"); //create datetime picker
          break;
        default: //date
          obj.datepicker(opt); //create date picker
      }
      obj.each(function() {
        var inp = $(this);
        var par = inp.closest("div.sv-input-group"); //get parent div
        if(inp.hasClass("hasDatepicker") && inp.length==1) {
          var img = inp.next("img.ui-datepicker-trigger"); //get trigger image
          par.find("span.sv-input-group-addon").append(img); //move image into input group
        }
      });
      if(obj.attr("data-webvalidation")!="on") { //hide the calendar to start with
        obj.blur(); //this is needed to that values are not reset - something to do with caching maybe?
      }
      else {
        obj.attr("data-webvalidation","off").blur().attr("data-webvalidation","on"); //hide but don't do web validation
      }
      $("#ui-datepicker-div").addClass("ui-front").css("display","none"); //hide initially
      $("img.ui-datepicker-trigger").filter(":not([tabindex])").each(function(i) {
        var ico = $(this).attr("role","button"); //get trigger icon and make it a button
        var inp = ico.prev("input"); //get input object
        if(inp.length<1) {
          inp = ico.parent("span").prev("input"); //handle input group
        }
        if(inp.is(":disabled,[readonly]")) {
          inp.datepicker("disable"); //don't show popup if field is disabled or readonly
          return true;
        }
        var tip = inp.attr("data-ttip") || inp.attr("ttip"); //get tooltip from input
        if(tip) {
          ico.attr("data-ttip",tip); //copy tooltip from input to icon
        }
        ico.keydown(function(evt) { //show date picker on key down
          var tab = evt.DOM_VK_TAB || 9;
          var shf = evt.DOM_VK_SHIFT || 16;
          var key = evt.which; //get key code
          if(key!=tab && key!=shf) { //check not(back)tabbing
            $(this).click(); //fire click
            return false;
          }
        });
        ico.prop("tabindex","0"); //make icon promptable
      });
      if(mode>0 && !sits_events.timepickerKeydown) {
        $(document).on("keydown",".hasTimepicker",sits_time_picker_keydown);
        sits_events.timepickerKeydown = true;
      }
      return true;
    }
  }
  return false;
}

//Add a datetime picker to an input field
// string   sel  : in ;jQuery selector to apply the time picker to
// boolean  ico  : in ;show icon next to field(default is true)
// date     mind  : in ;minimum datetime
// date     maxd  : in ;maximum datetime
// function  fnc  : in ;callback function when datetime selected
function sits_datetime_picker(sel,ico,mind,maxd,fnc) {
  return sits_time_picker(sel,ico,null,mind,maxd,fnc,true);
}

//Add a time picker to an input field
// string   sel  : in ;jQuery selector to apply the time picker to
// boolean  ico  : in ;show icon next to field(default is true)
// boolean  sec  : in ;show seconds(IGNORED - comes from sits_time_format in settings.js)
// string   mind  : in ;minimum time(same format as sits_time_format in settings.js)
// string   maxd  : in ;maximum time(same format as sits_time_format in settings.js)
// function  fnc  : in ;callback function when datetime selected
// boolean  dat  : in ;show date(default is false)
function sits_time_picker(sel,ico,sec,mind,maxd,fnc,dat) {
  var mode = (dat===true ? 2 : 1); //0=date, 1=time, 2=datetime
  var loc = sits_minified_path("../plugins/javascript/timepicker/","timepicker.js","timepicker.min.js");
  if(sits_files_array[loc]=="Y") { //already loaded...
    sits_ui_date_picker(sel,ico,mind,maxd,fnc,mode); //...so call straight away
  }
  else { //not loaded yet...
    var par = {}; //create an object of parameters
    par.url = loc;
    par.fnc = sits_ui_date_picker;
    par.p01 = sel;
    par.p02 = ico;
    par.p03 = mind;
    par.p04 = maxd;
    par.p05 = fnc;
    par.p06 = mode;
    var len = sits_param_array.push(par); //save for later
    sits_include_file(sits_minified_path("../plugins/javascript/timepicker/","jquery-ui-sliderAccess.js","jquery-ui-sliderAccess.min.js"),function(boo) {
      sits_include_file(sits_minified_path("../plugins/javascript/timepicker/","timepicker.js","timepicker.min.js"));
    });
  }
  return true;
}

//Internal function to handle keyboard navigation for time picker
function sits_time_picker_keydown(evt) {
  if(evt.shiftKey && evt.which>=37 && evt.which<=40) { //shift key must be pressed with an arrow key
    var div = $("#ui-datepicker-div");
    if(div.is(":visible")) {
      var dds = div.find("dd:not(.ui_tpicker_unit_hide):not(.ui_tpicker_time)"); //find time sliders
      if(dds.length>1) {
        var dda = $("span.ui-state-focus",dds).closest("dd"); //find currently focused time slider
        switch(evt.which) { //handle key presses
          case 37: //left
            sits_time_picker_move_hor(dds,dda,-1); //shift slider left
            break;
          case 38: //up
            sits_time_picker_move_ver(dds,dda,-1) //move to previous slider
            break;
          case 39: //right
            sits_time_picker_move_hor(dds,dda,1); //shift slider right
            break;
          case 40: //down
            sits_time_picker_move_ver(dds,dda,1) //move to next slider
            break;
        }
        var cls = "";
        var dva = $("span.ui-state-focus",dds).closest("div"); //get active slider
        if(dva.length==1) {
          cls = sits_replace(dva.get(0).className," ","."); //store active slider class selector
        }
        div.data("dd-active",cls);
        return sits_cancel_event(evt); //handled so cancel event
      }
    }
  }
  return true;
}

//Internal function to handle keyboard navigation for time picker(vertical)
function sits_time_picker_move_ver(dds,dda,dir) {
  if(dda.length==1) {
    var sel = "dd:not(.ui_tpicker_unit_hide):not(.ui_tpicker_time):first"; //selector for time sliders
    var ddo =(dir==1 ? dda.nextAll(sel) : dda.prevAll(sel)); //get next/previous slider
    if(ddo.length==1) {
      dda.find("span.ui-slider-handle").removeClass("ui-state-focus"); //un-focus other sliders
      ddo.find("span.ui-slider-handle").addClass("ui-state-focus"); //focus on slider
    }
  }
  else {
    dda.find("span.ui-slider-handle").removeClass("ui-state-focus"); //un-focus other sliders
    dds.filter((dir==1?":first":":last")).find("span.ui-slider-handle").addClass("ui-state-focus"); //focus on slider
  }
  return true;
}

//Internal function to handle keyboard navigation for time picker(horizontal)
function sits_time_picker_move_hor(dds,dda,dir) {
  if(dda.length==1) {
    var obj = dda.find("div"); //get slider object
    var value = obj.slider("value");
    var step = obj.slider("option","step");
    var minval = obj.slider("option","min");
    var maxval = obj.slider("option","max");
    var slidee = obj.slider("option", "slide") || function() {};
    var stope = obj.slider("option", "stop") || function() {};
    var newval = value+(step*1*dir); //calculate new value
    if(newval>=minval && newval<=maxval) { //check new value is in range
      obj.slider("value",newval); //set new value
      slidee.call(obj,null,{value:newval}); //trigger events manually
      stope.call(obj,null,{value:newval});
    }
  }
  return true;
}

//Convert an empty table into a grid widget(PPL013994)
// string   id  : in ;id of the table object
// string  nkey  : in ;valid session key
// string  gkey  : in ;valid grid key
// string  capt  : in ;table caption(default is "Entname(ENTC) records")
// boolean   mult   : in ;select multiple rows(default is false)
// function  fnc  : in ;call back function called after grid has loaded
function sits_grid_widget(id,nkey,gkey,capt,mult,fnc) {
  if(sits_files_array["../plugins/javascript/jqgrid/jquery.jqgrid.min.js"]=="Y") { //already loaded...
    sits_do_grid_widget(id,nkey,gkey,capt,mult,fnc); //...so call straight away
  }
  else { //not loaded yet
    var par = {}; //create an object of parameters
    par.url = "../plugins/javascript/jqgrid/jquery.jqgrid.min.js";
    par.fnc = sits_do_grid_widget;
    par.p01 = id;
    par.p02 = nkey;
    par.p03 = gkey;
    par.p04 = capt;
    par.p05 = mult;
    par.p06 = fnc;
    var len = sits_param_array.push(par); //save for later
    sits_include_file("../javascript/sits_grid.js",function(boo) {
      sits_include_file("../plugins/css/jqgrid/ui.jqgrid.css",function(boo) {
        sits_include_file("../plugins/javascript/jqgrid/grid.locale-en.js",function(boo) {
          sits_include_file("../plugins/javascript/jqgrid/jquery.jqgrid.min.js",function(boo) {
            $.jgrid.formatter.integer = {thousandsSeparator:","};
          });
        });
      });
    });
  }
  return true;
}

//Internal function to add grid widget(PPL013994)
// string   id  : in ;id of the table object
// string nkey  : in ;valid session key
// string gkey  : in ;valid grid key
// string capt  : in ;table caption(default is "Entname(ENTC) records")
// boolean  mult  : in ;select multiple rows(default is false)
// function fnc : in ;call back function called after grid has loaded
function sits_do_grid_widget(id,nkey,gkey,capt,mult,fnc) {
  return sits_do_grid_widget1(id,nkey,gkey,capt,mult,fnc) || false; //in "sits_grid.js"
}

//Returns the type of variable that was specified
// any  obj :in;variable to assess
function sits_type_of(obj) {
  if(obj===null) { //check for null
    return "null";
  }
  var typ = typeof(obj);
  if(typ=="object") { //try to determine object sub-type
    if(obj.constructor==(new Array).constructor) {
      return "array";
    }
    if(obj.constructor==(new Date).constructor) {
      return "date";
    }
    if(obj.constructor==(new RegExp).constructor) {
      return "regex";
    }
    if(obj.nodeType && obj.nodeType>0 && obj.nodeType<13) {
      if(obj.nodeType==9) {
        return "document";
      }
      return "element";
    }
    if(obj.setInterval && obj.setTimeout) {
      return "window";
    }
    if(obj.jquery && obj.jquery==$.fn.jquery) {
      return "jquery";
    }
    if(obj.type) {
      var evt = ",blur,change,click,dblclick,error,focus,keydown,keypress,keyup,load,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,resize,scroll,select,submit,unload,touchstart,touchend,touchcancel,touchmove,";
      if(evt.indexOf(","+obj.type.toLowerCase()+",")>-1) {
        return "event";
      }
    }
  }
  return typ; //return standard type
}

//Returns the string representation of the variable that was specified
// any  obj : in ;variable to represent
// boolean rec : in ;INTERAL - indicates whether this is a recursive call
function sits_to_string(obj,rec) {
  var cap = 11; //cap for "for each" loops
  var arr = [];
  if(typeof(rec)!="boolean") {
    rec = false; //first call is not recursive
  }
  switch(sits_type_of(obj)) { //get type of variable
    case "null":
      return "{null}"; //return null as object string
    case "array":
      var str = obj.toString(); //try basic function
      if(str=="" || str.indexOf("object Object")>-1) {
        for(var k in obj) {
          arr.push(k+"="+sits_to_string(obj[k],true)); //list all items in array
          if(--cap<1) {
            break; //break out of loop
          }
        }
        str = arr.join(",")+(cap<1?"...":"");
      }
      return "["+str+"]"; //return as array string
    case "date":
      return "{"+obj.toString()+"}"; //return date as object string
    case "number":
      return ""+obj; //return as numeric string
    case "object": case "regex":
      var l = obj.length;
      if(typeof(l)!="undefined") { //check for indexed object
        for(var i=0;i<l;i++) {
          arr.push(i+":"+sits_to_string(obj[i],true)); //index all properties of object
          if(--cap<1) {
            break; //break out of loop
          }
        }
      }
      else {
        for(var j in obj) {
          arr.push(j+":"+sits_to_string(obj[j],true)); //list all properties of object
          if(--cap<1) {
            break; //break out of loop
          }
        }
      }
      return "{"+arr.join(",")+(cap<1?"...":"")+"}"; //return property list as object string
    case "function":
      return obj.toString(); //return as function string
    case "element":
      switch(obj.nodeType) {
        case 1:
          var tag = obj.tagName.toLowerCase();
          if(tag=="input") {
            tag += ":"+obj.type.toLowerCase();
          }
          if(obj.id) {
            tag += "#"+obj.id;
          }
          if(obj.className) {
            tag += "."+obj.className;
          }
          return "<"+tag+">"; //return as element string
        case 9:
          return "<document>"; //return as document string
        default:
          return "<NODE:"+obj.nodeType+">"; //return as other node string
      }
    case "event":
      var str = obj.type;
      if(str.indexOf("key")>-1) { //keyboard
        var key = obj.keyCode || obj.which;
        str += ":"+key;
        if(obj.shiftKey) {
          str += "+shift";
        }
        if(obj.ctrlKey) {
          str += "+ctrl";
        }
        if(obj.altKey) {
          str += "+alt";
        }
      }
      else if(str.indexOf("mouse")>-1 || str.indexOf("click")>-1) { //mouse
        var pos = sits_mouse_offset(obj);
        str += ":"+sits_mouse_button(obj)+"-"+pos.x+","+pos.y;
      }
      return "{"+sits_to_string(sits_get_target(obj),true)+" on"+str+"}"; //return as event string
    case "document":
      return "{document}"; //return as document string
    case "window":
      return "{window}"; //return as window string
    case "jquery":
      var str = "";
      if(obj.length==1) {
        str = sits_to_string(obj[0],true); //show element string if single
      }
      else {
        obj.each(function(i) {
          if(--cap>0) {
            str += ","+this.tagName.toLowerCase(); //just list tag names if multiple
          }
        });
        str = str.substr(1)+(cap<1?"..."+obj.length:""); //add count if capped
      }
      return "$("+str+")"; //return as jquery string
  }
  return ""+obj; //return as string
}

//Cancels the current event and prevents default action(PPL013583)
// object evt : in ;event object
function sits_cancel_event(evt) {
  evt = evt || window.event;
  if(evt.stopPropagation) { //prevent bubbling
    evt.stopPropagation();
  }
  else {
    evt.cancelBubble = true;
  }
  if(evt.preventDefault) { //prevent default action
    evt.preventDefault();
  }
  else {
    evt.returnValue = false;
  }
  return false; //cancel event
}

//Parses a JSON string to create an object(PPL013583)
// string str : in ;the JSON string
function sits_parse_json(str) {
  str = sits_white_trim(str); //remove white space
  if(str=="") { //check for empty string
    sits_putmess("JSON.PARSE: Empty string");
    return null;
  }
  if(str.indexOf(String.fromCharCode(9))>-1) {
    sits_putmess("JSON.PARSE: String contains tab characters");
  }
  try {
    if(typeof(JSON)=="object" && typeof(JSON.parse)=="function") {
      return JSON.parse(str); //use native parser if available
    }
    else {
      return eval("("+str+")"); //otherwise evaluate
    }
  }
  catch(err) {
    sits_putmess("JSON.PARSE: String could not be parsed");
    return null; //string could not be parsed
  }
}

//Returns the string representation of the variable that was specified(PPL013583)
// object  obj : in ;the object to notate
function sits_to_json(obj) {
  var arr = [];
  for(var j in obj) {
    var val = obj[j]; //get property value
    switch(sits_type_of(val)) {
      case "null":
        val = "null";
        break;
      case "string":
        val = "\""+sits_escape_string(val)+"\"";
        break;
      case "object":
        val = sits_to_json(val);
        break;
      default: //boolean,number,etc
        val = sits_to_string(val);
        break;
    }
    arr.push("\""+j+"\":"+val); //list all properties of object
  }
  return "{"+arr.join(",")+"}"; //return property list as object string
}

//Find and return an item from a list(PPL013583)
// string list : in ;the list string
// string item : in ;the item string
// string del : in ;the list delimiter
function sits_get_item(list,item,del) {
  if(typeof(list)=="string" && list.length>0) { //check first parameter
    if(typeof(item)=="string" && item.length>0) { //check second parameter
      if(typeof(del)=="string" && del.length>0) { //check third parameter
        var arr = list.split(del);
        var l = arr.length;
        for(var i=0;i<l;i++) { //loop through list items
          var temp = arr[i];
          var idpart = temp.substr(0,item.length+1); //get id part of item
          if(idpart==item+"=") {
            return temp.substr(item.length+1); //return value part of item
          }
        }
      }
    }
  }
  return ""; //item not found so return blank string
}

//Find and remove an item from a list(PPL013583)
// string list : in ;the list string
// string item : in ;the item string
// string del : in ;the list delimiter
function sits_del_item(list,item,del) {
  if(typeof(list)=="string" && list.length>0) { //check first parameter
    if(typeof(item)=="string" && item.length>0) { //check second parameter
      if(typeof(del)=="string" && del.length>0) { //check third parameter
        var arr = list.split(del);
        var l = arr.length;
        for(var i=0;i<l;i++) { //loop through list items
          var temp = arr[i];
          var idpart = temp.substr(0,item.length+1); //get id part of item
          if(idpart==item+"=") {
            arr.splice(i,1); //remove this item from the list
            i--;
            l--;
          }
        }
        return arr.join(del); //return modified list string
      }
    }
  }
  return list; //return original list string
}

//Find and replace an item from a list(PPL013583)
// string list : in ;the list string
// string item : in ;the item string
// string newv : in ;the new value
// string del : in ;the list delimiter
function sits_put_item(list,item,newv,del) {
  if(typeof(list)=="string") { //check first parameter
    if(typeof(item)=="string" && item.length>0) { //check second parameter
      if(typeof(del)=="string" && del.length>0) { //check third parameter
        if(list.length>0) {
          var boo = false;
          var arr = list.split(del);
          var l = arr.length;
          for(var i=0;i<l;i++) { //loop through list items
            var temp = arr[i];
            var idpart = temp.substr(0,item.length+1); //get id part of item
            if(idpart==item+"=") {
              arr[i] = item+"="+newv; //replace this item in the list
              boo = true;
            }
          }
          if(boo) {
            list = arr.join(del); //update modified list string
          }
          else {
            list += del+item+"="+newv; //append new value to list string
          }
        }
        else {
          list = item+"="+newv; //create new list string
        }
      }
    }
  }
  return list; //return modified list string
}

//Get the button clicked regardless of browser(PPL011542)
// object evt : in ;event object
function sits_mouse_button(evt) {
  evt = evt || window.event;
  var num = evt.button;
  if(!$.support.cssFloat) { //check for IE
    switch(num) {
      case 1: return "L";
      case 2: return "R";
      case 4: return "M";
    }
  }
  else {
    switch(num) {
      case 0: return "L";
      case 1: return "M";
      case 2: return "R";
    }
  }
  return ""; //button not recognised
}

//Re-build the options in a dropdown list(PPL011542)
// string id  : in ;the id of the object to get the value of
// object opt : in ;object containing options
function sits_build_select(id,opt) {
  var obj = null;
  if(typeof(id)=="string") {
    obj = sits_get_object(id); //get object from id
  }
  else {
    obj = id; //object was passed in
  }
  if(!obj) {
    return false; //object not found
  }
  if(obj.tagName!="SELECT") {
    return false; //object not a dropdown list
  }
  var i = 0;
  obj.options.length = 0; //clear existing options
  for(var val in opt) {
    obj.options[i++] = new Option(opt[val],val); //build options
  }
  return true;
}

//Show a dialog similar to YDAL in client(IREL1 PPL014121)
// string dct : in ;dictionary(DCT) code
// string ent : in ;entity(ENT) code
// string ttl : in ;the dialog title
// string txt : in ;no longer used
// string tid : in ;the id of the target field
// string mod : in ;the mode(FIELDVAL or SORT) - default is "FIELDVAL"
// string udfsonly :in only retrieve the UDFS for the entity
function sits_ydal_lst(dct,ent,ttl,txt,tid,mod,udfsonly) {
  sits_ydal_select = null; //global variable holding the field
  sits_ydal_select_srt = null; //global variable holding the field
  if(typeof(dct)=="string" && dct.length>0) { //check first parameter
    if(typeof(ent)=="string" && ent.length>0) { //check second parameter
      if(typeof(tid)=="string" && tid.length>0) { //check fifth parameter
        if(sits_get_object(tid)!=null) { //check target field exists
          dct = sits_escape_url(dct.toUpperCase());
          ent = sits_escape_url(ent.toUpperCase());
          ttl = ttl || "";
          if(mod!="SORT") {
            mod = "FIELDVAL"; //default
          }
          sits_dialog_loading(true,"LOAD","sits_ydaldia_loading"); //create loading dialog
          $("#sits_ydaldia_loading").data("title",ttl);
          var par = "DCT="+dct+"&ENT="+ent+"&DIA=sits_ydaldia&TARGET="+tid+"&YMODE="+mod+"&UDFS="+udfsonly; //build parameters
          return sits_send_query("POST","siw_dmu.ydal",par,true,"sits_do_ydal_return"); //get field list
        }
      }
    }
  }
  return false;
}

//Called to process status returned from "ydal" queries(IREL1 PPL014121)
// string res : in ;the response string
function sits_do_ydal_return(res) {
  var sub = res.substr(0,4);
  res = res.substr(4);
  if(sub!="<OK>") {
    return false; //error
  }
  var fldListObj = sits_parse_json(res); //create object
  var thebox = fldListObj.DIA;
  delete fldListObj.DIA;
  var bps = fldListObj.BOILERS;
  delete fldListObj.BOILERS;
  var ymode = fldListObj.YMODE;
  delete fldListObj.YMODE;
  var targetfld = sits_get_object(fldListObj.TARGET);
  delete fldListObj.TARGET;
  var vals = targetfld.value;
  if(vals!="") {
    vals = vals.split(";"); //creates indexed array
  }

  var option = null;
  if(ymode=="SORT") { //sort mode
    sits_ydal_select_srt = "<option value=\"\"></option>";
    sits_ydal_select_srt += "<option value=\"D\">"+bps["BP024"]+"</option>";
    sits_ydal_select_srt += "<option value=\"A\">"+bps["BP023"]+"</option>";
  }
  var ttl = $("#sits_ydaldia_loading").data("title");
  sits_ydal_select = "<option value=\"\"></option>";//<select class=\"sv-form-control\">";
  $.each(fldListObj,function(i,k) {
    sits_ydal_select+= "<option value=\""+i+"\">"+k+"</option>";
  });
  var ydalhtml = "<div class=\"sv-container-fluid ydaldiv\" data-ymode=\""+ymode+"\" data-target=\""+targetfld.id+"\"><div class=\"sv-row\"><div class=\"sv-col-md-12\"><div class=\"sv-form-container\"><div class=\"sv-form-horizontal\"><fieldset id=\"ydalfset\"><legend class=\"sv-sr-only\">"+ttl+"</legend>";
  ydalhtml += "</fieldset></div></div></div></div></div>";

  var btn = {};
  btn[bps["BP022"]] = function() { $("#sits_ydaldia").off();sits_dialog_close(true,"sits_ydaldia")}; //add "close" button
  btn[bps["BP021"]] = sits_do_ydal_accept; //add function accept
	sits_dialog_loading(false,"","sits_ydaldia_loading");
  sits_dialog(ttl,ydalhtml,btn,true,true,true,"","sits_ydaldia",true,60); //create dialog
  $("#sits_ydaldia").on("change","select.ydalfldselect",function() {
    if(sits_do_ydal_change()) {
      sits_do_ydal_append("",bps); //add blank row
    }
  });
  $("#sits_ydaldia").on("click",".ydaldelete", sits_do_ydal_delete);
  if(vals!="") {
    $.each(vals,function(i,k) {
      sits_do_ydal_append(k,bps); //loop through vals and build row for each
    })
  }
  sits_do_ydal_append("",bps); //add blank row
  $("#sits_ydaldia").find("select:first").focus();
  return true;
}
//Called from "sits_do_ydal_results" to append a new row(IREL1 PPL014121)
// string val : in ;the row value
function sits_do_ydal_append(val,bps) {
  var nTab = sits_get_object("ydalfset"); //get table object
  var ymode = $(".ydaldiv").attr("data-ymode");
  var ydalid = sits_uuid();
  var fSelect = "<select class=\"sv-form-control ydalfldselect\" id=\"selfld"+ydalid+"\">"+sits_ydal_select+"</select>"; //clone select object
  var nInput = null; //create input field
  if(ymode!="SORT") {
    nInput = "<input type=\"text\" id=\"valfld"+ydalid+"\" class=\"sv-form-control\">";
  }else {
    nInput = "<select class=\"sv-form-control\" id=\"valfld"+ydalid+"\">"+sits_ydal_select_srt+"</select>";
  }
  var remicon = "<span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\" ></span>";
  var nImage  = "<button class=\"ydaldelete sv-btn sv-btn-default\" title=\""+bps["BP096"]+"\">"+remicon+"</button>";


  var formgrouphtml = "<div class=\"sv-form-group\"><label class=\"sv-col-sm-2 sv-control-label\" for=\"selfld"+ydalid+"\">"+bps["BP018"]+"</label><div class=\"sv-col-sm-4\">"+fSelect+"</div>";
  formgrouphtml+= "<label class=\"sv-col-sm-2 sv-control-label\" for=\"valfld"+ydalid+"\">"+bps["BP019"]+"</label><div class=\"sv-col-sm-3\">"+nInput+"</div><div class=\"sv-col-sm-1\">"+nImage+"</div></div>";
  $(nTab).append(formgrouphtml);


//  $("button.ydaldelete").button({ icons: { primary: "ui-icon-closethick" },text:false});
  if($(".ydaldelete").length>1) {
    $(".ydaldelete").prop("disabled","");
  }else {
    $(".ydaldelete").prop("disabled","disabled");
  }
  if(typeof(val)=="string" && val.indexOf("=")>-1) { //if value passed through set it
    sits_set_value("selfld"+ydalid,val.substr(0,val.indexOf("=")));
    if(ymode!="SORT") {
      sits_set_value("valfld"+ydalid,val.substr(val.indexOf("=")+1));
    }else {
      sits_set_value("valfld"+ydalid,val.substr(val.indexOf("=")+1));
    }
  }else {
    sits_set_value("selfld"+ydalid,"");
    if(ymode!="SORT") {
      sits_set_value("valfld"+ydalid,"");
    }
    else {
      sits_set_value("valfld"+ydalid,"");
    }
  }
  return true;
}

//Called when changing field code to add a new row(PPL014121)
// object evt : in ;the event object
function sits_do_ydal_change() {
  var nTab = sits_get_object("ydalfset"); //get table object
  var ymode = $(nTab).closest("div.ydaldiv").attr("data-ymode");
  var selects = null;
  if(ymode=="SORT") {
    selects = $(nTab).find("select:even");
  }else {
    selects = $(nTab).find("select");
  }
  var val = sits_get_value(selects[selects.length-1]);
  if(val!="") { //check if last select is blank
     return true;
  }
  return false;
}

//Called when clicking on delete icon to delete a row(PPL014121)
// object evt : in ;the event object
function sits_do_ydal_delete(evt) {
  evt = sits_get_target(evt);
  if($(".ydaldelete").length>1) {
    var parent = $(evt).closest("div.sv-form-group");
    if(parent.prev("div.sv-form-group").length>0) {
      parent.prev("div.sv-form-group").find("select:first").focus();
    }else {
      parent.next("div.sv-form-group").find("select:first").focus();
   }
    parent.remove();
  }
  if($(".ydaldelete").length>1) {
    $(".ydaldelete").prop("disabled","");
  }else {
    $(".ydaldelete").prop("disabled","disabled");
  }

  return;
}

//Called from "ok" button on YDAL screen to populate target field(IREL1 PPL014121)
function sits_do_ydal_accept() {
  var nTab = $(".ydaldiv"); //get table object
  var ymode = nTab.attr("data-ymode");
  var selects = null;
  var inputs = null;
  if(ymode=="SORT") {
    selects = nTab.find("select:even");
    inputs =  nTab.find("select:odd");
  }else {
    selects = nTab.find("select");
    inputs = nTab.find("input");
  }
  var lgth = selects.length;
  var d = {};
  for(var i=0;i<lgth;i++) { //loop through all selects and build array
    var val = sits_get_value(selects[i]);
    if(val!="") {
      d[val] = sits_get_value(inputs[i]); //this overwrites duplicate fields
    }
  }
  var thevalue = "";
  for(var k in d) {
    thevalue += ";"+k+"="+d[k]; //build field=value list
  }
  thevalue = thevalue.substr(1);  //strip off first; character
  var thetarg = $(nTab).attr("data-target");
  if(thevalue=="=") {
    thevalue = ""; //check for blank string
  }
  sits_set_value(thetarg,thevalue); //must update before closing!
  $("#sits_ydaldia").off()
  sits_dialog_close(true,"sits_ydaldia");
  return true;
}

//Called to html encode characters(PPL011542)
// string str : in ;string to be encoded
function sits_html_encode(str) {
  str = sits_replace(str,"&","&amp;");
  str = sits_replace(str," ","&nbsp;");
  str = sits_replace(str,"\"","&quot;");
  str = sits_replace(str,"£","&pound;");
  str = sits_replace(str,"<","&lt;");
  str = sits_replace(str,">","&gt;");
  return str;
}

//Called to decode html characters(PPL011542)
// string str : in ;string to be decoded
function sits_html_decode(str) {
  str = sits_replace(str,"&gt;",">");
  str = sits_replace(str,"&lt;","<");
  str = sits_replace(str,"&pound;","£");
  str = sits_replace(str,"&quot;","\"");
  str = sits_replace(str,"&nbsp;"," ");
  str = sits_replace(str,"&amp;","&");
  return str;
}

//Called to float the header of a table(PPL013255)
// string   id : in ;id of the table to apply the floating to
function sits_float_header(id) {
  if(sits_files_array["../plugins/javascript/floatheader.js"]=="Y") { //already loaded...
    sits_do_float_header(id); //...so call straight away
  }
  else { //not loaded yet
    var par = {}; //create an object of parameters
    par.url = "../plugins/javascript/floatheader.js";
    par.fnc = sits_do_float_header;
    par.p01 = id;
    var len = sits_param_array.push(par); //save for later
    sits_include_file(sits_minified_path("../plugins/javascript/","jquery-migrate.js","jquery-migrate.min.js"),function(boo) {
      sits_include_file("../plugins/javascript/floatheader.js");
    });
  }
  return true;
}

//Internal function to float the header of a table(PPL013255)
// string   id : in ;id of the table to apply the floating to
function sits_do_float_header(id) {
  if(typeof(id)=="string" && id.length>0) { //check parameter
    id = sits_do_get_object(id);
    var tab = $("#"+id+"_float");
    if(tab.length>0) { //check if already done
      var floatRow = tab.find("tr.sits_float").empty(); //delete clone cells
      $("#"+id+" tr.sits_float").children().each(function() {
        var cell = $(this);
        var floatCell = cell.clone(); //re-clone cell
        if(!$.support.cssFloat) { //check for IE
          floatCell.css("width",cell.outerWidth());
          floatCell.css("padding","0 0 0 0");
        }
        else {
          floatCell.css("width",cell.width());
        }
        floatRow.append(floatCell); //append to clone row
      });
      $("#"+id+"_float *[id]").attr("id",""); //remove duplicated ids
      return true;
    }
    else {
      var opt = {}; //define options
      opt.faceIn = 0;
      opt.fadeOut = 0;
      opt.forceClass = true;
      opt.markerClass = "sits_float";
      $("#"+id).floatHeader(opt); //create floating headers
      $("div.floatHeader #"+id).find("*[id]").attr("id","").end().attr("id",id+"_float"); //remove duplicated ids
      return true;
    }
  }
  return false;
}

//Called to add postcode lookup to a button(PPL016548)
// SMIJ6, 20/10/2015 moved all postode functions into new file, 314185
// string   id : in ;id of the button to hijack
// string   pcountry_field_id : in ;id of the country field associated to the find address button passed in
// string   ppostcode_field_id : in ;id of the postcode field associated to the find address button passed in
function sits_postcode(id,pcountry_field_id,ppostcode_field_id) {
  if(sits_files_array["../javascript/sits_ajax_postcode.js"]=="Y") { //already loaded...
    sits_do_postcode(id, pcountry_field_id, ppostcode_field_id); //...so call straight away
  }
  else { //not loaded yet...
    var par = {}; //create an object of parameters
    par.url = "../javascript/sits_ajax_postcode.js";
    par.fnc = sits_do_postcode;
    par.p01 = id;
    par.p02 = pcountry_field_id;
    par.p03 = ppostcode_field_id;
    var len = sits_param_array.push(par); //save for later
    sits_include_file("../javascript/sits_ajax_postcode.js");
  }
  return true;
}

function sits_do_postcode(id,pcountry_field_id,ppostcode_field_id) {
  if(typeof(sits_postcode_start)=="function") {
    return sits_postcode_start(id,pcountry_field_id,ppostcode_field_id); // in sits_ajax_postcode.js(314185)
  }
  return false;
}

//Move cursor to the end of the text in a field
// element  fld : in ;the field
function sits_selection_end(fld) {
  if(fld.createTextRange) { //IE
    var temp = fld.createTextRange();
    temp.moveStart("character",fld.value.length);
    temp.select();
    return true;
  }
  else if(fld.setSelectionRange) { //Other
    fld.setSelectionRange(fld.value.length,fld.value.length);
    return true;
  }
  return false;
}

//Count the number of characters selected in a field
// element  fld : in ;the field
function sits_selection_len(fld) {
  var out = -1;
  if(fld.createTextRange) { //IE
    var temp = document.selection.createRange().duplicate();
    out = temp.text.length;
  }
  else if(fld.setSelectionRange) { //Other
    try {
      out = fld.selectionEnd-fld.selectionStart;
    }
    catch(e) {
      out = -1;
    }
  }
  return out; //return count
}

//Calculate the position of the first selected character
// element  fld : in ;the field
function sits_selection_pos(fld) {
  var out = -1;
  if(fld.createTextRange) { //IE
    var temp = document.selection.createRange().duplicate();
    temp.moveEnd("textedit",1);
    out = fld.value.length-temp.text.length;
  }
  else if(fld.setSelectionRange) { //Other
    try {
      out = fld.selectionStart;
    }
    catch(e) {
      out = -1;
    }
  }
  return out; //return position
}

//Returns true if unicode chars exist in any of the text fields matched by the selector
// string   sel  : in ;jQuery selector to apply the context menu to
// string   cls  : in ;class to apply to fields with unicode(defaults to "wys_nouni")
// boolean  ext  : in ;except UCAS unicode range
function sits_non_unicode(sel,cls,ext) {
  if(typeof(sel)!="string" || sel=="") { //check selector
    sel = "input[type=text], textarea";
  }
  if(typeof(cls)!="string") { //check class
    cls = "wys_nouni";
  }
  if(typeof(ext)!="boolean") { //check UCAS
    ext = false;
  }
  var boo = false;
  var inp = $(sel); //get all fields for selector
  if(sel!="input[type=text], textarea" && sel!="input[type=text]" && sel!="textarea") {
    inp.filter("input[type=text], textarea"); //filter inputs and textareas only
  }
  if(cls!="") {
    inp.removeClass(cls); //remove class
  }
  inp.each(function(i) {
    var yes = false;
    if(ext && /[^\u0020-\u007f|^\u00a0-\u024f|^\u1e00-\u1eff]/.test(this.value)) { //check for UCAS allowed characters
      yes = true;
    }
    else if(!ext && /[^\u0000-\u00ff]/.test(this.value)) { //check for unicode characters
      yes = true;
    }
    if(yes) {
      boo = true;
      if(cls!="") {
        $(this).addClass(cls); //add class to highlight error
      }
    }
  });
  return boo; //return whether unicode characters found
}

//Check if a value is an integer value or not
// anything val : in ;value to check
function sits_is_int(val) {
  var num = parseInt(val,10); //parse integer
  if(isNaN(num)) {
    return false; //not even a number
  }
  return val==num && val.toString()==num.toString(); //check values match
}

//Add a character count to a textarea field(PPL018935)
// string   sel  : in ;jQuery selector to apply the counter to
// numeric  lim  : in ;character limit
function sits_character_count(sel,lim) {
  if(sits_files_array["../plugins/javascript/charcount/charcount.js"]=="Y") { //already loaded...
    sits_do_character_count(sel,lim); //...so call straight away
  }
  else { //not loaded yet...
    var par = {}; //create an object of parameters
    par.url = "../plugins/javascript/charcount/charcount.js";
    par.fnc = sits_do_character_count;
    par.p01 = sel;
    par.p02 = lim;
    var len = sits_param_array.push(par); //save for later
    sits_include_file("../plugins/css/charcount/charcount.css",function(boo) {
      sits_include_file("../plugins/javascript/charcount/charcount.js");
    });
  }
  return true;
}

//Internal function to add a character count(PPL018935)
// string   sel  : in ;jQuery selector to apply the counter to
// numeric  lim  : in ;character limit
function sits_do_character_count(sel,lim) {
  if((typeof(sel)=="string" && sel.length>0) || typeof(sel)=="object") { //check first parameter
    if(typeof(lim)=="number" && lim>0) { //check second parameter
      $(sel).charCount(lim); //show character count
      return true;
    }
  }
  return false;
}

//Add a zoom button to a textarea field(PPL018935)
// string   sel  : in ;jQuery selector to apply the button to
// string   val  : in ;value of the zoom button(defaults to "Zoom")
// string   bok  : in ;value of the ok button(defaults to "Ok")
// string   bca  : in ;value of the cancel button(defaults to "Cancel")
function sits_zoom_field(sel,val,bok,bca) {
  if(typeof(sel)!="string" || sel=="") { //check selector
    sel = "input[type=text], textarea";
  }
  if(typeof(val)!="string") { //check "zoom" value
    val = sits_widget_bp.ui && sits_widget_bp.ui.zoomText || "Zoom";
  }
  if(typeof(bok)!="string") { //check "ok" value
    bok = sits_widget_bp.ui && sits_widget_bp.ui.dialogOk || "Ok";
  }
  if(typeof(bca)!="string") { //check "cancel" value
    bca = sits_widget_bp.ui && sits_widget_bp.ui.dialogCancel || "Cancel";
  }
  var boo = false;
  var inp = $(sel); //get all fields for selector
  if(sel!="input[type=text], textarea" && sel!="input[type=text]" && sel!="textarea") {
    inp.filter("input[type=text], textarea"); //filter inputs and textareas only
  }
  inp.each(function(i) {
    var btn = $("<input type=\"button\" value=\""+sits_escape_attr(val)+"\">"); //create button
    btn.click(function(e) { //attach click event
      var inp = $(this).prev(); //get input field
      var btn = {};
      btn[bca] = function() { //add "cancel" button
        sits_dialog_close(true,"sits_zoomdia");
      };
      btn[bok] = function() { //add "ok" button
        inp.val($("#sits_zoomdia").find("textarea").val()); //copy value back to field
        sits_dialog_close(true,"sits_zoomdia");
      };
      var att = "";
      if(inp.is(":disabled,[readonly]")) { //check editability
        att = " disabled=\"disabled\"";
      }
      var con = "<div style=\"width:100%;text-align:center;margin-top:12px\">";
      var hgt = sits_get_integer(((sits_window_size()).y)*0.8);
      con += "<textarea style=\"width:100%;height:"+hgt+"px\""+att+">"+inp.val()+"</textarea></div>";
      sits_dialog(this.value,con,btn,true,true,true,2000,"sits_zoomdia",true,0.8);
    });
    $(this).after(btn); //insert button next to field
    boo = true;
  });
  return boo; //return whether buttons were added
}

//fix attribute strings to remove quotes
// string  orig  : in ;the original string
function sits_escape_attr(orig) {
  return sits_replace_all(orig,'"',"&quot;");
}

//Add a multi select drop down as an input field(PPL022811)
// string   sel  : in ;jQuery selector to apply the multiselect picker to
// numeric  itm  : in ;number of items to display, before amalgamation ocurrs(default is 3)
// string  txt  : in ;text to display in header(default is Select)
// boolean  fil  : in ;display filter box(default is false)
// boolean  multi  : in ;display filter box(default is false)
// boolean dep : in ; controls whether the field has others dependent on it(default is false)
// boolean dis : in ; Controls if the field is disabled or not (ppl311595)
function sits_multiselect(sel,itm,txt,fil,multi,dep,dis) {
  var loc = sits_minified_path("../plugins/javascript/multiselect/","jquery.multiselect.js","jquery.multiselect.min.js");
  if(sits_files_array[loc]=="Y") { //already loaded...
    sits_do_multiselect(sel,itm,txt,fil,multi,dep,dis); //...so call straight away
  }
  else { //not loaded yet...
    var par = {}; //create an object of parameters
    par.url = loc
    par.fnc = sits_do_multiselect;
    par.p01 = sel;
    par.p02 = itm;
    par.p03 = txt;
    par.p04 = fil;
    par.p05 = multi;
    par.p06 = dep;
	par.p07 = dis;
    var len = sits_param_array.push(par); //save for later
    sits_include_file(sits_minified_path("../plugins/javascript/multiselect/","jquery.multiselect.filter.js","jquery.multiselect.filter.min.js"),function(boo) {
      sits_include_file(sits_minified_path("../plugins/javascript/multiselect/","jquery.multiselect.js","jquery.multiselect.min.js"),function(boo) {
        sits_include_file("../plugins/css/multiselect/jquery.multiselect.css",function(boo) {
          sits_include_file("../plugins/css/multiselect/jquery.multiselect.filter.css");
        });
      });
    });
  }
  return true;
}

//Internal function to multi select drop down as an input field(PPL022811)
// string   sel  : in ;jQuery selector to apply the multiselect picker to
// numeric  itm  : in ;number of items to display, before amalgamation ocurrs(default is 3)
// string  txt  : in ;text to display in header(default is Select)
// boolean  fil  : in ;display filter box(default is false)
// boolean  multi  : in ;display filter box(default is false)
// boolean dep : in ; controls whether the field has others dependent on it(default is false)
// boolean dis : in ; Controls if the field is disabled or not (ppl311595)
function sits_do_multiselect(sel,itm,txt,fil,multi,dep,dis) {
  if((typeof(sel)=="string" && sel.length>0) || typeof(sel)=="object") { //check first parameter
    if(itm<0 || itm>10) {
      itm = 3; //default the numeric of items to display option
    }
    if(typeof(txt)!="string" || txt=="") {
      txt = "Select"; //default the text
    }
    if(fil) {
      if(multi) {
        $(sel).multiselect({
          selectedList:itm, noneSelectedText: txt, multiple: true,
          create: function(event, ui) { sits_multi_created(this); }  //Use of new create event from JQuery Upgrade
        }).multiselectfilter();
      } else {
        $(sel).multiselect({
          selectedList:itm, noneSelectedText: txt, multiple: false,
          create: function(event, ui) { sits_multi_created(this); }  //Use of new create event from JQuery Upgrade
        }).multiselectfilter();
      }
    }
    else {
      if(multi) {
        $(sel).multiselect({
          selectedList:itm, noneSelectedText: txt, multiple: true,
          create: function(event, ui) { sits_multi_created(this); }  //Use of new create event from JQuery Upgrade
        });
      } else {
        $(sel).multiselect({
          selectedList:itm, noneSelectedText: txt, multiple: false,
          create: function(event, ui) { sits_multi_created(this); }  //Use of new create event from JQuery Upgrade
        });
      }
    }

    if(dep) {
      $(sel).bind("multiselectclose", function(event, ui) { sits_get_and_post_field_vals_pod_ms(this); });
    }

	if(dis) {
	  $(sel).multiselect("disable"); //ability to disable the field
    }

    $(sel).bind("multiselectuncheckall", function(event, ui) { sits_multi_uncheck_all(this); });
    $(sel).bind("multiselectcheckall", function(event, ui) { sits_multi_check_all(this); });
  }
  return false;
}

//Internal function to get values from screen(SIW_POD_MS) and post back to usp(PPL022811/ PPL025893)
function sits_get_and_post_field_vals_pod_ms(obj) {
    var vValue_list = "";
    var vVal = "";
    var vWhirlyId = "";
    var e = document.getElementById("form");
    for(var i=0; i<e.elements.length; i++) {
      if(e.elements[i].id!="") {
      vVal = sits_get_value(e.elements[i].id);
      if(e.elements[i].type=="checkbox") { // default the ceheck box to False is null
        if(vVal=="Y") {
          vVal = "True";
        }
        else {
          vVal = "False";
        }
      }
      if(vValue_list=="") {
        vValue_list = e.elements[i].id+"="+sits_escape_url(vVal);
      }
      else {
        vValue_list = vValue_list+"~"+e.elements[i].id+"="+sits_escape_url(vVal);
      }
    }
  }
  vWhirlyId = obj.id+"-Whirly";
  document.getElementById(vWhirlyId).style.display = "inline";
  sits_send_query("POST","siw_pod_ms.amendParams",vValue_list,false,"sits_process_report_params"); //send field list, the process results
}

// Function called when AJAX response returns from SIW_POD_MS
function sits_process_report_params(response) {
  var pos = 0;
  var id = "";
  var val = "";
  var obj = "";
  var e = "";
  var vWhirlyId = "";
  if(response.substr(0,4)=="<OK>") {
    query = response.substr(4);
	if(query!="") {
      var arr = query.split("~");
      for(var i=0; i<arr.length; i++) {
        pos = arr[i].indexOf("=");
        id = arr[i].substring(0, pos);
        val = arr[i].substring(pos+1, arr[i].length);
        e = document.getElementById(id);
        if(e.type=="select-one" || e.type=="select-multiple") { // only reset multi-select widgets
          $(e).html(val);
          obj = sits_get_object(id);
          $(obj).multiselect("refresh");
          vWhirlyId = e.id+"-Whirly";
          document.getElementById(vWhirlyId).style.display = "none";
        }
		if(e.type=="text")
		{
          vWhirlyId = e.id+"-Whirly";
          var vWhirly = document.getElementById(vWhirlyId);
          if(vWhirly) {
            vWhirly.style.display = "none";
          }
		}
      }
    }
  }
  else {
    if(response.substr(0,4)=="<NO>") {
      alert(response.substr(4));
    }
    else {
      if(response!="") {
        alert("For security reasons, you have been automatically logged out of the system, please re-login."); // error decrypting NKEY
      }
    }
  }
  sits_multi_state();
}

// Function to fix uncheck all function on multiselect widgets - was previously toggling
function sits_multi_uncheck_all(obj) {
  var e = document.getElementById(obj.id);
  for(var i=0;i<e.options.length;i++) {
    e.options[i].selected = false;
  }
  $(obj).multiselect("refresh");
}

// Function to fix check all function on multiselect widgets - was previously toggling
function sits_multi_check_all(obj) {
  var e = document.getElementById(obj.id);
  for(var i=0;i<e.options.length;i++) {
    e.options[i].selected = true;
  }
  $(obj).multiselect("refresh");
}

// Function for initialising multi-select state
function sits_multi_created(obj) {
  var e = document.getElementById(obj.id);
  if(e.options.length==0) {
    $(e).multiselect("disable");
  } else {
    $(e).multiselect("enable");
  }
}

// Function to enable/disable multi-selects based on whether they have options available
function sits_multi_state() {
  var e = document.getElementById("form");
  for(var i=0; i<e.elements.length; i++) {
    if(e.elements[i].id!="" && e.elements[i].id!="REPORT_LIST.DUMMY.MENSYS") {
      if(e.elements[i].type=="select-one" || e.elements[i].type=="select-multiple") { // only reset multi-select widgets
        if(e.elements[i].options.length==0) {
          $(e.elements[i]).multiselect("disable");
        }
        else {
          $(e.elements[i]).multiselect("enable");
        }
      }
    }
  }
}

// http://www.ietf.org/rfc/rfc4122.txt
function sits_uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for(var i=0;i<36;i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10),1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  return s.join("");
}

//Returns the full filepath of the minified or non-minified file
function sits_minified_path(filepath,unminified,minfiled) {
  if(sits_use_minified) {
    return filepath+minfiled;
  }
  else {
    return filepath+unminified;
  }
}

//Convert an empty div into a timetable widget
// string    id         : in ;id of the table object
// string    action    : in ;action for timetable
// object    options    : in ;options for timetable setup
// object    eventdata  : in ;The event data
function sits_timetable_widget(id,action,opts,edat) {
  var loc = sits_minified_path("../plugins/javascript/sitsjqtimetable/","sitsjqtimetable.js","sitsjqtimetable.min.js");
  if(sits_files_array[loc]=="Y") { //already loaded...
    sits_do_timetable_widget1(id,action,opts,edat); //...so call straight away
  }
  else { //not loaded yet
    var par = {}; //create an object of parameters
    par.url = loc;
    par.fnc = sits_do_timetable_widget1;
    par.p01 = id;
		par.p02 = action;
    par.p03 = opts;
    par.p04 = edat;
    var len = sits_param_array.push(par); //save for later
    sits_include_file("../plugins/css/sitsjqtimetable/css/sitsjqtimetable.css",function(boo) {
      sits_include_file("../javascript/dmx_tooltip.js",function(boo) {
        sits_include_file(sits_minified_path("../plugins/javascript/sitsjqtimetable/","jquery.ba-resize.js","jquery.ba-resize.min.js"),function(boo) {
          sits_include_file(sits_minified_path("../plugins/javascript/sitsjqtimetable/","sitsjqtimetable.js","sitsjqtimetable.min.js"));
        });
      });
    });
  }
  return true;
}

//Internal function to add timetable widget
// string    id         : in ;id of the table object
// string    action    : in ;action for timetable
// object    options    : in ;options for timetable setup
// object    eventdata  : in ;The event data
function sits_do_timetable_widget1(id,action,opts,edat) {
  if(typeof(id)=="string" && id.length>0) { //check first parameter
    $(id).sitsjqtimetable(action,opts,edat);
    return true;
  }
  return false;
}

// Check if the current browser is IE and that its a supported version, return values are:
// UNSUPPORTED_IE - IE version 7 or lower
// IE_8 - IE version 8
// IE - IE version 9 or greater
// NOT_IE - Not an IE browser
function sits_ie_supported() {
  //Once we drop IE8 we can just check to see if document.head exists
	//Only our supported browsers (with IE8 the exception) support document.head
  if(sits_ie_version) {
    return sits_ie_version; //cached from first runfnc
  }

	var ieversion = 3;
	var div = document.createElement('div');
	var all = div.getElementsByTagName('i');

	//Try conditional statements to work out ie version (only works up to and including IE 9)
	while(div.innerHTML = "<!--[if gt IE "+(++ieversion)+"]><i></i><![endif]-->", all[0]) {};

	//If the version is IE7 or less, its unsupported
	if(ieversion>4 && ieversion <= 7) {
		sits_ie_version = "IE_UNSUPPORTED";
    return sits_ie_version;
	}
  else if(ieversion==8) { //or the version is IE8 which is supported but has quirks!
	  sits_ie_version = "IE_8";
    return sits_ie_version;
	}
	//Else must be supported but make sure this is at least an IE browser
	if(window.ActiveXObject || "ActiveXObject" in window) {
		sits_ie_version = "IE";
    return sits_ie_version;
	}
	sits_ie_version = "NOT_IE";
  return sits_ie_version;
}

// Start the JQuery tooltip up
// string   sel  : in ;jQuery selector to apply the tooltip to
// string		cont : in	;Content of the tooltip(BLANK to destroy)
function sits_tooltip(sel,cont) {
  if((typeof(sel)=="string" && sel.length>0) || typeof(sel)=="object") { //check first parameter
	  if(cont=="") {
		  $(sel).filter(".sv-tooltip-filter").tooltip("destroy");
		}
    else {
			$(sel).filter(":not(.sv-disabled,[disabled],[readonly])").tooltip({
        items: ":not(.sv-disabled,[disabled],[readonly])", //disabled elements have inconsistent behavior across browsers(#8661)
				track: true,
				show: {delay:500}, //sits_anim_speed makes the tooltip appear too fast
				hide: sits_anim_speed,
				tooltipClass: "sv-tooltip",
				content: function() {
          $("div.ui-tooltip").each(function(i) { //lingering tooltips
            var tid = $(this).attr("id"); //get tooltip id
            var ele = $("[aria-describedby="+tid+"]"); //get related element
            if(ele.data("ui-tooltip")) {
              ele.tooltip("close"); //close tooltip
            }
          });
          return cont;
        }
			}).addClass("sv-tooltip-filter");
    }
	}
  return true;
}

//Create an absolute URL to the specified program
// string prac : in ;the program to link to
function sits_build_url(prac) {
  var url = window.location.href;
  if(typeof(prac)!="string") { //prac not specified
    return url;
  }
  var ques = url.indexOf("?"); //remove query string
  if(ques>-1) {
    url = url.substring(0,ques);
  }
  if(url.charAt(url.length-1)=="/") { //if last character is slash remove
    url.slice(0,-1);
  }
  var lastslash = url.lastIndexOf("/"); //remove chars after last slash - the previous program name
  if(lastslash>-1) {
    url = url.substring(0,lastslash);
  }
  return url+"/"+prac;
}

//Convert a table element into a datatables widget(PPL033413)
// string   sel : in ;jQuery selector to apply the datatables widget to
// object   opt : in ;object containing options for datatables widget
// string   parcssfile : in ;string containing css file name, must be in the  ../plugins/css/datatables/css/ path
function sits_datatables_widget(sel,opt,parcssfile) {
  var loc = "../plugins/javascript/datatables/media/js/jquery.dataTables.min.js";
  if(typeof $.fn.DataTable==="function") { //already loaded...
    sits_do_datatables_widget(sel,opt); //...so call straight away
  }
  else { //not loaded yet...
    var par = {}; //create an object of parameters
    par.url = loc;
    par.fnc = sits_do_datatables_widget;
    par.p01 = sel;
    par.p02 = opt;
    var len = sits_param_array.push(par); //save for later
    if(parcssfile!="") {
      sits_include_file("../plugins/css/datatables/css/"+parcssfile);
    }
    sits_include_file(loc);
  }
  return true;
}

//Get datatable parameters based on HTML5 data attributes and an object parameter
//object obj : in ;DOM element or jQuery object representing the table to get parameters for
//object opt : in ;(optional) object containing options for this datatable
//object dt_breakpoints :in;(optional) any breakpoints to use with responsive plugin(defaulted from sits_get_dt_breakpoints if not passed in)
function sits_datatable_params(obj,opt,dt_breakpoints) {
	if(typeof obj!=="object") return opt;

	if(typeof opt!=="object") opt = {};
	if(typeof dt_breakpoints!=="object") dt_breakpoints = sits_get_dt_breakpoints();

	//jQuery UI styling interferes with Bootstrap styling, so disable it(it will be deprecated by the plugin in 1.11 anyway)
	if(opt.jQueryUI===true) delete opt.jQueryUI;
	else if(opt.bJQueryUI===true) delete opt.bJQueryUI;

	obj = $(obj); //ensure it is a jQuery object
	if(obj.length!==1) return opt;

	//merge any HTML5 data attributes on the table with both options passed in and any defaults
	if(typeof opt.responsive==="undefined") opt.responsive =(!sits_datatable_responsive||obj.data("sv-dt-responsive")==="N")?false:{"breakpoints": dt_breakpoints}; //sits_datatable_responsive setting controls default
	else if(opt.responsive===true) opt.responsive = {"breakpoints": dt_breakpoints}; //replace with known breakpoints(so we override DT defaults)

	if(opt.responsive!==false) { //scrollY option doesn't work with responsive, so disable it
		if(typeof opt.scrollY!=="undefined") delete opt.scrollY;
		else if(typeof opt.sScrollY!=="undefined") delete opt.sScrollY;

		//we also need to work through the column settings and process any that are not supposed to be visible(as bVisible is overridden by responsive)
		var colObj =(typeof opt.columnDefs==="object")?opt.columnDefs:opt.columns;
		if(typeof colObj!=="object") {
			colObj =(typeof opt.aoColumnDefs==="object")?opt.aoColumnDefs:opt.aoColumns;
		}
		if(typeof colObj==="object") {
			var col;
			for(var idx=0;idx<colObj.length;idx++) {
				col = colObj[idx];
				if(col.className!=="never"&&(col.bVisible===false||col.visible===false)) col.className = "never"; //"never" class is the responsive equivalent of bVisible
			}
		}
	}

	if(typeof opt.paging==="undefined"&&typeof opt.bPaginate==="undefined") opt.paging = (obj.data("sv-dt-paging")!=="N")?true:false; //paging enabled by default (could affect form submission though)
	if(typeof opt.pagingType==="undefined"&&typeof opt.sPaginationType==="undefined") opt.pagingType = "full_numbers"; //set record bar type to "full" (i.e. including First/Last buttons)
  if(typeof opt.lengthChange==="undefined"&&typeof opt.bLengthChange==="undefined") opt.lengthChange = false; //disable changing of page size (could affect form submission otherwise)
  if(typeof opt.searching==="undefined"&&typeof opt.bFilter==="undefined") opt.searching = (obj.data("sv-dt-searching")!=="Y")?false:true; //filtering disabled by default (specific code might be needed - if the table contains editable fields)
  if(typeof opt.ordering==="undefined"&&typeof opt.bSort==="undefined") opt.ordering = (obj.data("sv-dt-ordering")==="N")?false:true; //ordering enabled by default
  if(typeof opt.info==="undefined"&&typeof opt.bInfo==="undefined") opt.info = (obj.data("sv-dt-info")!=="N")?true:false; //info display enabled by default

	//include any default language information(if it is available)
	if(typeof sits_widget_bp==="object"&&typeof sits_widget_bp.dt==="object") {
		var language = opt.language || opt.oLanguage;
		if(typeof language==="object"&&typeof language.url==="undefined"&&typeof language.sUrl==="undefined") { //we ignore the sUrl parameter now, as defaults should be available on each page so we don't need the AJAX call
			//language information already provided, so merge it with the defaults
			opt.language = $.extend(true,{},sits_widget_bp.dt,language);
		}
		else {
			//use the default language
			opt.language = $.extend(true,{},sits_widget_bp.dt);
		}
		delete opt.oLanguage;
	}
	return opt;
}

//Recalculate column widths and responsive display for a datatable(after a resize, or showing/hiding the parent container, for example)
// string   sel : in ;jQuery selector to apply the datatables recalculation to
function sits_datatables_recalc(sel) {
	if((typeof(sel)==="string" && sel.length>0) || typeof(sel)==="object") { //check first parameter
		var datatable;

		//get a reference to each DataTable(using the API) and perform the adjustments
		$(sel).each(function() {
			datatable = $(this).DataTable();
			if(typeof datatable==="object") {
				datatable.columns.adjust(); //adjust column widths
				if(typeof datatable.responsive!=="undefined") {
					datatable.responsive.recalc(); //if responsive is available then recalculate the column display
				}
			}
		});
	}
}

//Internal function to convert a select element into a datatables widget(PPL033194)
// string   sel : in ;jQuery selector to apply the datatables widget to
// object   opt : in ;object containing options for datatables widget
function sits_do_datatables_widget(sel,opt) {
  if((typeof(sel)=="string" && sel.length>0) || typeof(sel)=="object") { //check first parameter
    $(sel).each(function(i) {
      var thisobj = $(this);
      var thisopt = sits_datatable_params(thisobj,opt); //build local options with text from field attributes
      thisobj.dataTable(thisopt);
    });
    return true;
  }
  return false;
}

//Convert an existing table using the tablesaw widget - uses HTML5 data attributes to control options
// string   sel : in ;jQuery selector to apply the tablesaw widget to
// string		mode :in;the Tablesaw mode to use for the table(swipe, stack, or coltoggle) - defaulted from data-tablesaw-mode if undefined or blank
// object		breakpoint :in;the breakpoint object(in the format returned by sits_get_breakpoint) to use - defaulted from sits_get_breakpoint if undefined or blank
// boolean  overridedefer :in;should we override the defer-init option(i.e. where the tablesaw-defer-init data attribute is Y)
function sits_tablesaw_widget(sel,mode,breakpoint,overridedefer) {
	//see if tablesaw is available(i.e. has the JS been loaded)
	if(typeof Tablesaw!=="object") return false;

	//see if selector is specified
	if((typeof(sel)!=="string"||sel.length===0) && typeof(sel)!=="object") return false;

	//are we using the tablesaw-defer-init data attribute, or just ignoring it
	if(typeof(overridedefer)!=="boolean") overridedefer = false;

	//if we're in the portal then we may need to perform additional processing
	var tablesaw_portal_check = false;
	if(sits_portal_object.hasAffected&&!sits_portal_object.isDisabled) {
		//we're in the portal and additional processing is enabled(i.e. there are multiple columns in use), so we need to check table by table
		tablesaw_portal_check = true;
	}

  //find all the tables on the page and decide what to do for each
  var table, tablesaw_mode, table_converted = false, init_table, perform_stack;
  $(sel).each(function() {
  	table = $(this);

    //if this table is using the tablesaw widget initialise it
    tablesaw_mode =(typeof mode!=="undefined"&&mode!="")?mode:table.data("tablesaw-mode")
    if(tablesaw_mode&&!table.hasClass("tablesaw")) { //initialise tablesaw
    	init_table = true;

    	//if the table initialisation is deferred, and we're not overriding it, then see if we should initialise(as "stack" mode ignores the attribute for better mobile experience)
			if(!overridedefer&&tablesaw_mode!=="stack") {
				if(table.attr("data-tablesaw-defer-init")==="Y") {
					init_table = false;
				}
			}

      //if the table is normally an alternative mode but does allow stack then see if we're in a stacking breakpoint(allows us to use stack for mobile but other modes for larger screens)
			if(tablesaw_mode!=="stack"&&table.attr("data-tablesaw-allow-stack")==="Y") {
				//keep a copy of the starting mode, so we can use it if the screensize changes
				table.attr("data-tablesaw-orig-mode",tablesaw_mode);

				//determine whether to force stack mode(in the mobile phone screensize)
				perform_stack = false;

				if(tablesaw_portal_check) {
					//in portal content mode with more than one column, so use any defined multiplier to adjust the breakpoint min and max values
					if(sits_do_get_portal_breakpoint(table)==="xs") {
						perform_stack = true;
					}
				}
				else {
					if(typeof(breakpoint)==="undefined"||breakpoint==="") breakpoint = sits_get_breakpoint();

					//not in portal content mode(or only single column), so stack only in the normal xs breakpoint
					if(breakpoint==="xs") {
						perform_stack = true;
					}
				}

				//if we're in an affected screensize then swap to stack as a starting point
				if(perform_stack) {
					init_table = true; //override any deferred init as stack ignores it
					table.attr("data-tablesaw-mode","stack");
				}
			}

			if(init_table) {
				table_converted = true; //we've converted at least one table

    		//remove the default/fallback class(as it affects table width)
      	table.parent().removeClass("sv-table-responsive");

      	//remove the defer attribute as it isn't required after the table is initialised the first time
      	table.removeAttr("data-tablesaw-defer-init");

        //apply custom sorting
        table.find("th[data-sortable-date]").data("tablesaw-sort",function(asc) {
          return function(a,b) {
            if(a.cell==b.cell) {
              return 0;
            }
            var av = sits_date_to_atom(a.cell);
            var bv = sits_date_to_atom(b.cell);
            if(av==bv) {
              return 0;
            }
            if(asc) {
              return(av>bv ? 1 : -1);
            }
            else {
              return(av<bv ? 1 : -1);
            }
          };
        });

				//initialise the widget
      	table.table();
			}
    }
  });

	return table_converted;
}

//Return an instance of the Tablesaw widget for a table(providing the widget has been instantiated on that table)
// string   sel : in ;jQuery selector or object to return the instance for
function sits_tablesaw_instance(sel) {
	//see if tablesaw is available(i.e. has the JS been loaded)
	if(typeof Tablesaw!=="object") return;

	//see if selector is specified
	if((typeof(sel)!=="string"||sel.length===0) && typeof(sel)!=="object") return;

	//return the instance(or undefined if there isn't one)
	return $(sel).data("table");
}

//refresh a tablesaw instance - after amending content for example
// string   sel : in ;jQuery selector for the table(s) to refresh
// boolean  rst : in ;reset the column display (i.e. reset any swiping the user has done)
// array collist :in ;visible column list (optional) - in the format returned by the tablesaw tribalGetVisible function
function sits_tablesaw_refresh(sel,rst,collist){
	var table = $(sel);

	if(typeof rst!=="boolean"){ //should we reset the columns
		rst = true; //yes, by default
	}

	//get the current instance of tablesaw (if there is one)
	var inst = sits_tablesaw_instance(table);
	if(typeof inst!=="undefined"){
		//get the current displayed column list - so we can restore it (if requested)
		if(!rst&&typeof collist!=="object"){
			collist = inst.tribalGetVisible();
		}

		//destroy the current instance of the table
		inst.destroy();
	}

	//initialise tablesaw
	sits_tablesaw_widget(table,"","",true);

	//reset the column display (if necessary)
	if(!rst&&typeof collist!=="undefined"){
		inst = sits_tablesaw_instance(table);
		if(typeof inst!=="undefined"){
			inst.tribalSetVisible(collist);
		}
	}
}

//Convert a select element into a chosen widget(PPL033194)
// string   sel : in ;jQuery selector to apply the chosen widget to
// object   opt : in ;object containing options for chosen widget
function sits_chosen_widget(sel,opt) {
  var loc = sits_minified_path("../plugins/javascript/chosen/","chosen.jquery.js","chosen.jquery.min.js");
  if(sits_files_array[loc]=="Y") { //already loaded...
    sits_do_chosen_widget(sel,opt); //...so call straight away
  }
  else { //not loaded yet...
    var par = {}; //create an object of parameters
    par.url = loc;
    par.fnc = sits_do_chosen_widget;
    par.p01 = sel;
    par.p02 = opt;
    var len = sits_param_array.push(par); //save for later
    sits_include_file("../plugins/css/chosen/chosen.css");
    sits_include_file(loc);
  }
  return true;
}

//Internal function to convert a select element into a chosen widget(PPL033194)
// string   sel : in ;jQuery selector to apply the chosen widget to
// object   opt : in ;object containing options for chosen widget
function sits_do_chosen_widget(sel,opt) {
  if((typeof(sel)=="string" && sel.length>0) || typeof(sel)=="object") { //check first parameter
    if(typeof(opt)=="object") { //check second parameter
      $(sel).each(function(i) {
        var thisobj = $(this);
        var thisopt = opt; //build local options with text from field attributes
        if(thisobj.attr("data-chosennotext") && thisobj.attr("data-chosennotext")!="") {
          thisopt.no_results_text = thisobj.attr("data-chosennotext");
        }
        if(thisobj.attr("data-placeholdera") && thisobj.attr("data-placeholdera")!="") {
          thisopt.placeholder_text_single = thisobj.attr("data-placeholdera");
          thisopt.placeholder_text_multiple = thisobj.attr("data-placeholdera");
        }
        if(thisobj.hasClass("sv-form-control")) {
          thisobj.removeClass("sv-form-control");
	        thisopt.width = "100%";
        }
        thisopt.search_contains = true;
        thisopt.single_backstroke_delete = false;
        thisobj.chosen(thisopt);
        var labelfor = thisobj.attr("id");
        var labeltext  = "";
        if(typeof(labelfor)=="string" && labelfor.length>0) {
          labelfor = sits_do_get_object(labelfor);
          labeltext = $("label[for="+labelfor+"]").html();
          $("#"+labelfor+"_chosen").find("input").attr("title",labeltext);
          $("#"+labelfor+"_chosen").css("min-width","150px");  // workaround for safari bug
        }
        sits_do_chosen_widget_accessibility(thisobj,labeltext);
        sits_do_chosen_widget_accessibility_events(thisobj);
        if(!thisobj.next("div").hasClass("chosen-container")) {
          thisobj.addClass("sv-form-control");
        }
      });
      return true;
    }
  }
  return false;
}
function sits_do_chosen_widget_accessibility_events(thisobj) {
  thisobj.on('chosen:showing_dropdown',function(a,b) {
    thisobj = $(a.target)
    var thisid = thisobj.attr("id")
    thisobj.next("div.chosen-container").find("ul.chosen-results li").each(function(i) {
      $(this).attr({"id":thisid+i,"role":"option","tabindex":-1});
    });
  });
  thisobj.on('chosen:hiding_dropdown',function(a,b) {
    thisobj = $(a.target)
    var thisid = thisobj.attr("id")
    $(thisobj).next("div.chosen-container").find("input").removeAttr("aria-activedescendant");
    thisobj.next("div.chosen-container").find("ul.chosen-results li").each(function(i) {
      $(this).attr({"id":thisid+i,"role":"option","tabindex":-1});
    });
    var singleDivId = thisobj.next("div.chosen-container-single").attr("id");
    if(typeof(singleDivId)=="string") {
      thisobj.next("div.chosen-container-single").attr("tabindex","-1").find("span:first").attr("id",singleDivId+"span")
    }
    thisobj.next("div.chosen-container-single").find("input:first").attr("title",$("#"+singleDivId+"span").html());
  });
  thisobj.on('change', function(a, b) {
    thisobj = $(a.target);
    var singleDivId = thisobj.next("div.chosen-container-single").attr("id");
    if(typeof(singleDivId)=="string") {
      thisobj.next("div.chosen-container-single").attr("tabindex","-1").find("span:first").attr("id",singleDivId+"span");
    }
    thisobj.next("div.chosen-container-single").find("input:first").attr("title",$("#"+singleDivId+"span").html());
  });
}
function sits_do_chosen_widget_accessibility_desc(thisobj) {
  var thisid = thisobj.attr("id");
  $(thisobj).next("div.chosen-container").find("input").removeAttr("aria-activedescendant");
    thisobj.next("div.chosen-container").find("ul.chosen-results li").each(function(i) {
    $(this).attr({"id":thisid+i,"role":"option","tabindex":-1});
    if($(this).hasClass("highlighted")) {
      $("#"+sits_do_get_object(thisid)).next("div.chosen-container").find("input").attr("aria-activedescendant",thisid+i);
    }
  });
}
function sits_do_chosen_widget_accessibility(thisobj,labeltext) {
  var thisid = thisobj.attr("id");
  var datattip = thisobj.attr("data-ttip") || "";
  var chosencontainer = thisobj.next("div.chosen-container");
  //accessibility code
  var ulId = thisobj.attr("id")+"_ul";
  var attrs = {
    "aria-owns":ulId,
    //"aria-autocomplete":"list",
    "role":"combobox",
    // "aria-labelledby":,
    "tabindex":"0",
    //"aria-readonly":"true",
    "aria-activedescendant":""
  };
  var attrs2 = {
    "role":"combobox",
    "tabindex":"-1",
    "aria-expanded":"false",
    "id":ulId
  }
  if(datattip!="") {
    chosencontainer.attr("data-ttip",datattip);
  }
  chosencontainer.find("div.chosen-search input").attr(attrs);
  chosencontainer.find("ul.chosen-results").attr(attrs2);
  sits_do_chosen_widget_accessibility_desc(thisobj);
  thisobj.next("div.chosen-container-multi").attr("tabindex","0");
  if(typeof(labeltext)=="string") {
    thisobj.next("div.chosen-container-multi").attr("aria-label",labeltext);
  }
  // focus on single select get screen reader to read out value
  var singleDivId = thisobj.next("div.chosen-container-single").attr("id");
  if(typeof(singleDivId)=="string") {
    thisobj.next("div.chosen-container-single").attr("tabindex","-1").find("span:first").attr("id",singleDivId+"span");
  }
  thisobj.next("div.chosen-container-single").find("input:first").attr("title",$("#"+singleDivId+"span").html());
}
//Creates a tab set with auto-sizing tabs
// string   sel : in ;jQuery selector to apply the tabs to (or element)
// object   opt : in ;object containing options for tabs
// boolean  cls : in ;allow tabs to be closed? (default is false)
// boolean  rsz : in ;auto-resize tabs? (default is true)
function sits_tabs(sel,opt,cls,rsz) {
  var obj = $(sel);
  if(obj.length<1) {
    return false; //no objects found
  }
  if(!opt) {
    opt = {};
  }
  if(!opt.active) {
    opt.active = 0; //load first tab first
  }
  var tab = obj.tabs(opt); //convert to tab set
  var nav = tab.children("ul.ui-tabs-nav"); // find the list
  if(nav.length<1) { // if already got scrolling on navigate further to find the list
    nav = tab.children("div.ui-tabs-scroll-tabs").children("div.ui-tabs-scroll-wrap").children("ul.ui-tabs-nav");
  }
  var anc = nav.children("li").children("a.ui-tabs-anchor"); //only children in case of nested tabs
  anc.each(function() { //loop the a tags to set this title from the li title
    var oli = $(this).parent();
    if(!oli.attr("title") || oli.attr("title")=="") {
      oli.attr("title",$(this).text()); //set anchor title if blank
    }
  });
  if(typeof(cls)=="boolean" && cls) { //allow tabs to be closed (default false)
    tab.addClass("ui-tabs-canclose");
    if(anc.length>1) {
      var txt = sits_widget_bp.ui && sits_widget_bp.ui.tabsClose || "Close"; //build close icon
      var htm = "<span class=\"ui-icon ui-icon-close\" role=\"button\" tabindex=\"0\">"+txt+"</span>";
      anc.addClass("ui-tabs-canclose").append(htm); //add close icons
    }
    tab.on("mousedown keydown","span.ui-icon-close",function(evt) { //handle click on close icon
      if(evt.type=="keydown" && evt.which!=13 && evt.which!=32) { //check for return or space key
        return true;
      }
      if(evt.type=="mousedown" && evt.which!=1) { //check for left click
        return true;
      }
      var ths = $(this);
      var lis = ths.closest("ul").children("li"); //get tabs
      var spn = lis.children("a").children("span.ui-icon-close"); //get remaining close icons
      var ind = spn.index(ths)+1;
      var tid = ths.closest("li").remove().attr("aria-controls"); //remove tab and get id
      $("#"+tid).remove(); //remove the tab contents
      if(spn.length<3) {
        spn.closest("a.ui-tabs-anchor").removeClass("ui-tabs-canclose");
        spn.remove(); //hide cross if only one tab left
      }
      tab.tabs("refresh"); //refresh the tab set
      sits_tabs_resize(); //resize after tab removed
      setTimeout(function() {
        lis.filter(".ui-tabs-active").focus(); //focus on active tab (after event)
      },0);
      if(evt.type=="keydown") {
        return sits_cancel_event(evt);
      }
    });
    tab.on("tabsbeforeactivate",function(evt,ui) {
      var spn = ui.newTab.children("a").children("span");
      if(spn.length==1 && spn.get(0)==document.activeElement) {
        return false; //cancel activate is tab is closing
      }
    });
    if(!sits_events.tabsCloseFocus) {
      $(document).on("focus","span.ui-icon-close",function(evt) {
        var trg = evt.target;
        setTimeout(function() {
          sits_do_tabs_scroll(trg); //check chevrons (after focus, not during)
        },0);
      });
      sits_events.tabsCloseFocus = true;
    }
  }
  if(typeof(rsz)!="boolean" || rsz) { //auto-resize (default true)
    tab.addClass("ui-tabs-autosize");  // add class to outerdiv
    anc.addClass("ui-tabs-autosize"); // add class to each a tag
    if(!sits_events.tabsResize) { // have tabs already been resized
    	sits_is_resized("SitsTabs"); //initialise auto-resize width
      $(window).on("resize",sits_debounce_event(sits_do_tabs_resize,250));
      sits_events.tabsResize = true;
    }
    setTimeout("sits_tabs_resize()",250); //resize after crosses drawn
  }
  return true;
}

//Internal function to deal with window resizing and tabs
function sits_do_tabs_resize() {
	//determine whether the window size has actually changed - deal with issues in IOS and IE8 where resize can be triggered even if the window size hasn't changed
	if(sits_is_resized("SitsTabs")==="none"){
		return;
	}
	//resize the tabs
	sits_tabs_resize();
}

//Captures screen resize for tabs
function sits_tabs_resize(scrollit) {
  //return
  $("div.ui-tabs-autosize").each(function() { //loop through tab sets
    var tab = $(this);
    tab.data("twidth", $(this).width()); 

    var nav = tab.children("ul.ui-tabs-nav"); //only children in case of nested tabs
    if(nav.length<1) {
      nav = tab.children("div.ui-tabs-scroll-tabs").children("div.ui-tabs-scroll-wrap").children("ul.ui-tabs-nav");
    }
    var lis = nav.children("li");
    var act = lis.filter(".ui-tabs-active"); //remember active tab
    var len = lis.length; //number of tabs
    var big = 0;
    var tot = 0;
    var max = tab.innerWidth(); //calculate maximum width available
    if(max==0) {
      return; //can't calculate if maximum width is zero
    }
    var inw = max;
    max -= sits_get_integer(tab.css("padding-right"));
    max -= sits_get_integer(tab.css("padding-left"));
    max -= sits_get_integer(nav.css("padding-right"));
    max -= sits_get_integer(nav.css("padding-left"));

    lis.each(function(i) {
      var oli = $(this);
      var wdt = oli.data("orig-width"); //get stored tab width
      if(typeof(wdt)=="undefined" || wdt=="" || wdt<sits_min_tab_width) {
        oli.children("a.ui-tabs-anchor").css("width",""); //clear anchor fixed width
        wdt = sits_get_integer(oli.outerWidth(true)) + 4; //calculate tab width     
        oli.data("orig-width",wdt); //store for next time
      }
      if(wdt>big) {
        big = wdt //calculate biggest tab width
      }
      tot += wdt; //calculate total tab width
      max -= sits_get_integer(oli.css("margin-right")); //account for margins
      max -= sits_get_integer(oli.css("margin-left"));
    });
    var wrp = nav.parent("div.ui-tabs-scroll-wrap"); //get scroll wrapper (may not exist)
    var wdt = big;
    if(len*big>max) {
      wdt = Math.max(sits_get_integer(max/len),sits_min_tab_width); //fill space with equally sized tabs
      tot = len*wdt//+len; //update total (controls scrolling)
    }
    lis.each(function(i) { //resize tabs
      var oli = $(this);
      var anc = oli.children("a.ui-tabs-anchor"); //get anchor object
      var cur = sits_get_integer(anc.width()); //get current width
      var dif = sits_get_integer(oli.outerWidth(true))-wdt; //calculate difference
      var now = Math.max(cur-dif-1,0); //calculate new width
      anc.width(now+"px"); //resize anchor
    });
    if(tot>max) { //needs to scroll
      var iev = sits_ie_supported();
      if(iev!="IE_8" && iev!="IE_UNSUPPORTED") { //don't scroll for old IE
        if(wrp.length==0) {
          nav.wrap("<div class=\"ui-tabs-scroll-wrap\">"); //add wrapper and chevrons
          wrp = nav.parent("div.ui-tabs-scroll-wrap");
          wrp.wrap("<div class=\"ui-tabs-scroll-tabs\">");
          var lft = sits_widget_bp.ui && sits_widget_bp.ui.tabsScrollLeft || "Scroll left";
          var rgt = sits_widget_bp.ui && sits_widget_bp.ui.tabsScrollRight || "Scroll right";
          wrp.prepend("<span class=\"ui-tabs-scroll-left glyphicon glyphicon-chevron-left sv-disabled\" role=\"button\" aria-disabled=\"true\" title=\""+lft+"\" tabindex=\"0\">");
          wrp.append("<span class=\"ui-tabs-scroll-right glyphicon glyphicon-chevron-right\" role=\"button\" title=\""+rgt+"\" tabindex=\"0\">");
        }
        nav.width(tot); //ensure all tabs fit on one line
        inw -= sits_get_integer(wrp.css("margin-right"));
        inw -= sits_get_integer(wrp.css("margin-left"));
        wrp.width(inw); //fix for Firefox not working with tabs in dialogs
        var scr = 0;
        if(act.length==1) {
          scr = Math.max(act.offset().left-lis.filter(":first").offset().left,0); //make active tab visible
        }
        if (typeof scrollit != "boolean" ) {
        wrp.animate({"scrollLeft":scr+"px"},sits_anim_speed,"swing",function() { //scroll to far left or active tab
          sits_do_tabs_scroll(wrp); //check scroll arrows
        });
      }
        if(!sits_events.tabsScrollClick) {
          $(document).on("mousedown keydown",".ui-tabs-scroll-left,.ui-tabs-scroll-right",function(evt) { //handle scrolling
            if(evt.type=="keydown" && evt.which!=13 && evt.which!=32) { //check for return or space key
              return true;
            }
            if(evt.type=="mousedown" && evt.which!=1) { //check for left click
              return true;
            }
            sits_do_tabs_scroll(evt.target); //scroll tabs
            if(evt.type=="keydown") {
              return sits_cancel_event(evt); //cancel event
            }
          });
          sits_events.tabsScrollClick = true;
        }
      }
    }
    else { //remove scrolling
      if(wrp.length==1) {
        wrp.scrollLeft(0).children(".ui-tabs-scroll-left,.ui-tabs-scroll-right").remove(); //remove chevrons
        var tmp = nav.css("width","").unwrap().unwrap(); //remove wrapper
      }
    }
  });
  return true;
}

//Internal function to scroll tabs left/right
// element  obj : in ;element which was clicked (.ui-tabs-scroll-left or -right)
function sits_do_tabs_scroll(obj){  // id of tab, direction of scroll L R
  var spn = $(obj);
  var direction = "" ;
  if(spn.length!=1) {
    return false;
  }
  if(spn.hasClass("ui-tabs-scroll-left")) {
    direction = "L";
  }
  if(spn.hasClass("ui-tabs-scroll-right")) {
    direction = "R";
  }
  var $tab = spn.closest(".ui-tabs"); //get tab element
  if( $tab.width != $tab.data("twidth")){
    sits_tabs_resize(false);
  }
  var tabid = $tab.attr("id");
  //var $tab = $("#"+sits_do_get_object(tabid));
  var $wrp = $tab.children("div.ui-tabs-scroll-tabs:first").children("div.ui-tabs-scroll-wrap"); //get the scroll wrap div
  var $nav = $wrp.children("ul.ui-tabs-nav");   
  var $anchor = $nav.children("li").children("a");
  var padding = sits_get_integer($anchor.css("padding-left"));
  padding += sits_get_integer($anchor.css("padding-right"));
  var tabLeft = $tab.offset().left;   // left position of tab
  var tabRight = tabLeft + $tab.outerWidth(true);  //right position of tab
  var offLeftTabs = [];  // tabs that are scolled to the left of the viewport
  var offRightTabs = [];  // tabs that are to the right 
  var visibleTabs = [];  // tabs that are currently visible!!
  $nav.children("li").each(function(){   // work out where each tab is a tab that is only partly displayed is classed as not displayed
  var itemLeft = $(this).offset().left;
    var itemRight = itemLeft + $(this).outerWidth(true) - padding;
    var aTag = $(this).children("a");
    if( itemLeft < tabLeft ){       
      offLeftTabs.push(aTag.attr("id"));
    }else{
      if( itemRight > tabRight ){
       offRightTabs.push(aTag.attr("id"));
      }else{
        visibleTabs.push(aTag.attr("id"));
      }
    }   
  });
  if ( direction == "L" ){ // scrolling left - get last tab thats scrolled to the left
    var lastLeft = offLeftTabs.pop() || ""
    if  ( lastLeft == ""  ){
      return 0;
    }
    var itemLeft = $("#"+lastLeft).offset().left;  // work out where the tab is  and how far left of the div it is
    var pos =   tabLeft- itemLeft ;
    var currentPos =  $wrp.scrollLeft();
    var newPos = currentPos - pos - padding;
    if ( newPos < 0 ) { newPos = 0 }
      $wrp.animate({"scrollLeft":newPos+"px"},sits_anim_speed); //move to new scroll position
    }
   if ( direction == "R" ){ // scrolling right get first one scrolled to the right
    var firstRight = offRightTabs.shift() || "";
    if  (firstRight  == ""  ){
      return 0;
    }
    var itemLeft = $("#"+firstRight).offset().left;
    var itemRight = itemLeft + $("#"+firstRight).outerWidth(true);  // work out where the right edge is of the tab we want to bring in 
    var amnt = itemRight - tabRight; // work out how far past the end the right edge is
    var currentPos =  $wrp.scrollLeft();  // current scroll position
    var newPos = currentPos  + amnt + padding;
    $wrp.animate({"scrollLeft": newPos+"px"},sits_anim_speed); //move to new scroll position
  }
}

function sits_do_tabs_scroll_old(obj) {
  sits_putmess("scrolly");
  var spn = $(obj);
  if(spn.length!=1) {
    return false;
  }
  var tab = spn.closest(".ui-tabs"); //get tab element
  var wrp = tab.children("div.ui-tabs-scroll-tabs").children("div.ui-tabs-scroll-wrap"); //only children in case of nested tabs
  var nav = wrp.children("ul.ui-tabs-nav");
  var wdt = wrp.width();
  var gap = sits_get_integer(wdt/4); //25% of the width
  var end = nav.width()-wdt; //furthest position
  var lft = sits_get_integer(wrp.scrollLeft() || 0); //get current scroll position
  var org = lft;
  if(spn.hasClass("ui-tabs-scroll-left")) {
    lft = Math.max(lft-gap,0); //scroll left (but not beyond start position)
  }
  if(spn.hasClass("ui-tabs-scroll-right")) {
    lft = Math.min(lft+gap,end); //scroll right (but not beyond end position)
  }
  if(lft!=org) {
    wrp.animate({"scrollLeft":lft+"px"},sits_anim_speed); //move to new scroll position
  }
  if(lft==0) {
    wrp.children(".ui-tabs-scroll-left").addClass("sv-disabled").attr("aria-disabled",true);
  }
  else {
    wrp.children(".ui-tabs-scroll-left").removeClass("sv-disabled").removeAttr("aria-disabled");
  }
  if(lft==end) {
    wrp.children(".ui-tabs-scroll-right").addClass("sv-disabled").attr("aria-disabled",true);
  }
  else {
    wrp.children(".ui-tabs-scroll-right").removeClass("sv-disabled").removeAttr("aria-disabled");
  }
  return true;
}

//Refresh the tabs from the source
// string   sel : in ;jQuery selector to refresh the tabs of (or element)
function sits_tabs_refresh(sel) {
  var obj = $(sel).filter(".ui-tabs");
  if(obj.length<1) {
    return false; //no objects found
  }
  var rsz = false;
  obj.each(function(i) {
    var tab = $(this).tabs("refresh"); //refresh the tab set
    var nav = tab.children("ul.ui-tabs-nav");
    if(nav.length<1) {
      nav = tab.children("div.ui-tabs-scroll-tabs").children("div.ui-tabs-scroll-wrap").children("ul.ui-tabs-nav");
    }
    var anc = nav.children("li").children("a.ui-tabs-anchor"); //only children in case of nested tabs
    anc.each(function() {
      var oli = $(this).parent();
      if(!oli.attr("title") || oli.attr("title")=="") {
        oli.attr("title",$(this).text()); //set anchor title if blank
      }
    });
    if(tab.hasClass("ui-tabs-canclose") && anc.length>1) { //allow tabs to be closed
      var txt = sits_widget_bp.ui && sits_widget_bp.ui.tabsClose || "Close"; //build close icon
      var htm = "<span class=\"ui-icon ui-icon-close\" role=\"presentation\" tabindex=\"0\">"+txt+"</span>";
      anc.addClass("ui-tabs-canclose").append(htm); //add close icons
    }
    if(tab.hasClass("ui-tabs-autosize")) { //auto-resize
      anc.addClass("ui-tabs-autosize");
      rsz = true;
    }
  });
  if(rsz) {
    setTimeout("sits_tabs_resize()",250); //resize after crosses drawn
  }
  return true;
}

//Creates an accordion
// string   sel : in ;jQuery selector to apply the tabs to
// object   opt : in ;object containing options for accordion
function sits_accordion(sel,opt) {
  var obj = $(sel);
  if(obj.length<1) {
    return false; //no objects found
  }
  if(!opt) {
    opt = {};
  }
  if(!opt.active) {
    opt.active = 0; //load first section first
  }
  if(!opt.animate) {
    opt.animate = sits_anim_speed; //animate at standard speed
  }
  var acc = obj.accordion(opt); //convert to accordion
  return true;
}

//Makes a panel collapsible
// string   sel : in ;jQuery selector to apply the collapsible functionality to
// boolean  exp : in ;expand panel initially?(default is true)
// function fnc : in ;callback function - called when panel is expanded or collapsed
function sits_collapsible_panel(sel,exp,fnc) {
  var obj = $(sel).filter(".sv-panel:not(.sv-panel-collapsible)"); //check for panel(not already collapsible)
  if(obj.length<1) {
    return false; //no panel found
  }
  if(typeof(exp)!="boolean") {
    exp = true; //expanded by default
  }
  obj.each(function(i) {
    var pan = $(this).addClass("sv-panel-collapsible"); //get panel object
    var hdr = pan.children(".sv-panel-heading").attr("role","heading").attr("tabindex","0") //get panel header and make tabbable
    var ttl = hdr.find(".sv-panel-title"); //get panel title object // changed to .find  was .children
    var act = ttl.children(".sv-panel-action-container");
    if(act.length==0){
    	ttl.append("<span class=\"ui-icon sv-panel-icon\">"); //if no action container then append to the end of the header
    }
    else{
    	act.before("<span class=\"ui-icon sv-panel-icon\">"); //otherwise append before the container (so it floats in the right order)
    }
    var bdy = hdr.next(); //get panel body
    var hid = hdr.attr("id") || "sv-ph-"+sits_uuid(); //get or create header id
    var bid = bdy.attr("id") || "sv-pb-"+sits_uuid(); //get or create body id
    hdr.attr("id",hid).attr("aria-controls",bid); //link header to body
    bdy.attr("id",bid).attr("aria-labelledby",hid); //link body to header
    if(typeof(fnc)=="function") {
      pan.data("callback",fnc); //store callback function
    }
    sits_do_collapsible_panel(hdr,exp,true); //expand or collapse panel
  });
  if(!sits_events.panelHeadingClick) {
    $(document).on("click",".sv-panel-collapsible .sv-panel-heading",function(evt) {
      if(evt.which==1 || evt.which==0) { //check for left click (  PYPB1 - 0 in IE8)
    	  if($(evt.target).parents(".sv-panel-action-container").length==0){
    		  sits_do_collapsible_panel(this,null,true); //toggle panel
    	  }
      }
    });
    $(document).on("keydown",".sv-panel-collapsible .sv-panel-heading",function(evt) {
      if(evt.which==13 || evt.which==32) { //check for return or space key
      	if($(evt.target).parents(".sv-panel-action-container").length==0){
      		sits_do_collapsible_panel(this,null,true); //toggle panel
          return sits_cancel_event(evt); //cancel event
      	}
      }
    });
    sits_events.panelHeadingClick = true;
  }
  return true;
}

//Internal function to expand/collapse a panel
// element  ele : in ;element - must be collapsible panel header
// boolean  exp : in ;expand panel initially? (optional - undefined will toggle)
// boolean callback :in;run the callback function? (optional)
function sits_do_collapsible_panel(ele,exp,callback) {
  var hdr = $(ele); //object should be panel header
  var pan = hdr.parent(".sv-panel-collapsible"); //check for collapsible panel
  if(pan.length!=1) {
    return false; //no panel found
  }
  if(pan.hasClass("sv-disabled")) {
    return false; //panel disabled
  }
  var ico = hdr.find(".sv-panel-icon"); //get icon object
  var kid = pan.children(":not(.sv-panel-heading)"); //get panel contents and footer
  var boo = (typeof(exp)=="boolean" ? exp : pan.hasClass("sv-panel-collapsed")); //expand or collapse?
  if(boo) { //expand panel
    ico.removeClass("ui-icon-triangle-1-n").addClass("ui-icon-triangle-1-s"); //swap arrows
    pan.removeClass("sv-panel-collapsed").addClass("sv-panel-expanded"); //swap classes
    sits_show(kid); //show panel (except heading)
    kid.attr("aria-hidden","false");
    hdr.attr("aria-expanded","true");
  }
  else { //collapse panel
    ico.removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-n"); //swap arrows
    pan.removeClass("sv-panel-expanded").addClass("sv-panel-collapsed"); //swap classes
    sits_hide(kid); //hide panel (except heading)
    kid.attr("aria-hidden","true");
    hdr.attr("aria-expanded","false");
  }
  if(typeof callback !== "boolean" || callback !== false) callback = true; //HEPD1 288525
  if(callback) {
    var fnc = pan.data("callback"); //get callback function
    if(typeof(fnc)=="function") {
      fnc(pan,boo); //trigger callback
    }
  }
  return true;
}

//Function to toggle the collapsible panel
// element  ele : in ;element - must be collapsible panel
// boolean  exp : in ;expand/collapse the panel
// boolean  callback : in ;whether the callback should be run or not
function sits_toggle_collapsible_panel(ele,exp,callback) {
	var hdr = $(ele).children(".sv-panel-heading");
	sits_do_collapsible_panel(hdr,exp,callback);
	return true;
}

//Function to enable or disable the collapsible panel
// element  ele : in ;element - must be collapsible panel
// boolean  enb : in ;enable/disable the panel
function sits_enable_collapsible_panel(ele,enb) {
  var pan = $(ele).filter(".sv-panel-collapsible"); //check for collapsible panel
  if(pan.length!=1) {
    return false; //no panel found
  }
  if(typeof(enb)!="boolean" || enb) { //enabled by default
    pan.removeClass("sv-disabled").removeAttr("aria-disabled");
  }
  else {
    pan.addClass("sv-disabled").attr("aria-disabled",true);
  }
  return true;
}

// function to build an inline message based on e:Vision Web UI standards
// applies aria tags and classes to field and err
// stat: -1 = error, 0 = neutral, 1 = positive/valid
// message only valid for error+positive state
// field id
// Extra options - extra switches for messaging
//        showError - show error in form mode boolean default is true, if this is false will use a tooltip instead.
// message span id not used in table mode, in form mode try and work out if not passed in.
function sits_inline_validation_message(stat,msg,fldId,msgId,extraOptions) {

  //sits_putmess("in validation fldid = "+fldId);
  if(fldId=="" || typeof(fldId)=="undefined") {
    return;
  }
  var erroricon = "";
  var okicon = "";
  var warnicon = "";
  var errorspan = "";
  var tablemode = "N";
  var themsgspan = "";
  var feedback = "";
  var thediv = "";
  var icon = "";
  var showerror = true;

  if(typeof(extraOptions)=="object" && typeof(extraOptions.showError)=="boolean") {
    showerror = extraOptions.showError;
  }

  var thefld = $(); //get fld object
  if(typeof(fldId)=="object") {
    thefld = $(fldId);
  }
  else if(typeof(fldId)=="string") {
    thefld = $("#"+sits_do_get_object(fldId)); //try "id"
    if(thefld.length!=1) {
      thefld = $("[name="+sits_do_get_object(fldId)+"]"); //try "name"
      if(thefld.length!=1) {
        thefld = $("input[id^="+sits_do_get_object(fldId)+"]:first"); //for radio group
        if(thefld.length!=1) {
          thefld = $("input[name="+sits_do_get_object(fldId)+"]"); //for record picker
        }
      }
    }
  }
  if(thefld.length==1) {
    fldId = thefld.attr("id");
  }


  // check the input really is a field so we dont wrap trs etc
  if( !thefld.is("input,textarea,select") && thefld.get(0).tagName!="FIELDSET"){
    return;
  }


  if(thefld.closest("table").hasClass("sv-table")) { //in table mode
    tablemode = "Y";
  }
  var isinfocus = (thefld.get(0)==document.activeElement); //check if field is focused
  var closestdiv = thefld.closest("div");


  if(tablemode=="Y") { // add a font icon next to field for table mode
    thediv = thefld.closest("td").removeClass("sv-has-error sv-has-feedback sv-table-has-feedback sv-has-success sv-has-warning");
    thediv.find(".sv-inline-error").remove();
    if(closestdiv.hasClass("sv-input-group-wrapper")) {
      closestdiv.removeClass("sv-has-feedback-in-input-group sv-form-group");
    }
  }

  if(tablemode=="N" && showerror==true) {
    if(msgId!="" && msgId!="undefined" && typeof(msgId)!="undefined") { // find the message span using ID or DOM
    	if(typeof(msgId)=="object") {
    		themsgspan = $(msgId);
    	}
    	else {
      	themsgspan = $("#"+sits_do_get_object(msgId));
      }
    }
    else {
      themsgspan = thefld.closest("div.sv-form-group").find("span.sv-error-block");
      msgId = themsgspan.attr("id");
      if(typeof(msgId)!="string") {
        msgId = "SV"+sits_uuid();
        themsgspan.attr("id",msgId);
      }
    }
    themsgspan.html("");
  }

  //don't show error icon for a few input types
  if(thefld.length>0 && !thefld.is("select,:button,:submit,:file,:radio,:checkbox,input[type='hidden']") && thefld.get(0).tagName!="FIELDSET") {
    var inline = (tablemode=="Y" ? "sv-inline-error " : "");
    erroricon = "<span class=\""+inline+"glyphicon glyphicon-remove sv-form-control-feedback\" aria-hidden=\"true\"></span>";
    okicon = "<span class=\""+inline+"glyphicon glyphicon-ok sv-form-control-feedback\" aria-hidden=\"true\"></span>";
    warnicon = "<span class=\""+inline+"glyphicon glyphicon-warning-sign sv-form-control-feedback\" aria-hidden=\"true\"></span>";
  }
  //add wrapper if required
  if(tablemode=="N") {

    thediv = thefld.closest("div.sv-form-group");
    if(closestdiv.hasClass("sv-input-group-wrapper")) {
      closestdiv.addClass("sv-has-feedback-in-input-group");
    }
    else if(closestdiv.hasClass("sv-input-group")) {
      thefld.wrap("<div class=\"sv-has-feedback-in-input-group sv-input-group-wrapper\"></div>");////////////
    }
  }
  else {
    if(!closestdiv.hasClass("sv-radio")) {
      if(closestdiv.hasClass("sv-input-group-wrapper")) {
        closestdiv.addClass("sv-has-feedback-in-input-group sv-form-group");
      }
      else {
        thefld.wrap("<div class=\"sv-has-feedback-in-input-group sv-input-group-wrapper sv-form-group\"></div>");
        closestdiv = thefld.closest("div");
      }
    }
  }


  //remove message styling and icon
  thediv.removeClass("sv-has-error sv-has-feedback sv-has-success sv-has-warning").find("span.sv-form-control-feedback").remove();
  if(!thefld.is("select,:button,:submit,:file,:radio,:checkbox,input[type='hidden']")) {
    if(tablemode=="Y") {
      feedback = "sv-has-feedback sv-table-has-feedback";
    }
    else {
      feedback = "sv-has-feedback";
    }
  }
  else {
    erroricon = "";
    okicon = "";
    warnicon = "";
  }

  if(stat!="") {
    stat = stat*1;
  }
  switch(stat) {
  case -1:
    icon = erroricon;
    thefld.attr("aria-invalid","true");
    thediv.addClass("sv-has-error "+feedback);
    break;
  case 1:
    icon = okicon;
    thediv.addClass("sv-has-success "+feedback);
    thefld.attr("aria-invalid","false");
    break;
  case 2:
    icon = warnicon;
    thefld.attr("aria-invalid","true");
    thediv.addClass("sv-has-warning "+feedback);
    break;
  default:
    if(stat!==0) {
      msg = "";
    }
    if(closestdiv.hasClass("sv-input-group-wrapper")) {
      closestdiv.removeClass("sv-has-feedback-in-input-group sv-form-group");
    }
    thefld.attr("aria-invalid","false").removeAttr("aria-describedby");
    break;
  }
  if(icon!="") {
    thefld.after(icon);
  }
  if(tablemode=="N" && msg!="" && showerror==true) {
    if(stat!==0) {
      themsgspan.attr("role","alert").html(msg);
    }
    else {
      themsgspan.html(msg);
    }
    thefld.attr("aria-describedby",msgId);
  }

  // add tooltips in table mode as can't see message
  if(tablemode=="Y" || showerror==false) {
    var tempfldidarray = [];
    if(typeof(fldId)!="undefined" && fldId.indexOf("SPLITDATE")>-1) {
      var src = fldId.substring(11)
      tempfldidarray = [$("#"+sits_do_get_object("SPLITDATE_Y"+src)),$("#"+sits_do_get_object("SPLITDATE_M"+src)),$("#"+sits_do_get_object("SPLITDATE_D"+src))];
    }
    else {
      tempfldidarray = [thefld];
    }
    $.each(tempfldidarray,function(i,tempfldid) {
      var tempfld = {};
      tempfld = tempfldid;
      var msg1 = ""
      if(msg!="") msg1=msg;
      var hasttip = thefld.data("hasttip") || "";
      if(hasttip=="") {
        if(tempfld.hasClass("ui-sits-tooltip") || tempfld.hasClass("sv-tooltip-filter")) {
          tempfld.data("hasttip","Y");
          var ttip1 = tempfld.tooltip("option", "content");
          tempfld.data("ttip",ttip1);
          //concat tooltip and message ??
        }else{
          tempfld.data("hasttip","N");
          if ( thefld.attr("title")!= "" & msg != "" ){
            msg1 =  "<span class=\"sv-sr-only\">"+thefld.attr("title")+"</span> "+msg; //concat title and message
          }
        }
      }else{
        if ( thefld.attr("title")!= "" & msg != "" ){
          msg1 =  "<span class=\"sv-sr-only\">"+thefld.attr("title")+"</span> "+msg; //concat title and message
        }
      }
      if(msg=="") { // set tooltip back
        if(tempfld.data("hasttip")=="Y") {
          msg = tempfld.data("ttip") || "";
          msg1 = msg
        }
      }
      if(tempfld.hasClass("ui-sits-tooltip") || tempfld.hasClass("sv-tooltip-filter")) {
        sits_tooltip(tempfld,"");
        tempfld.removeClass("ui-sits-tooltip");
        tempfld.removeClass("sv-tooltip-filter");
      }
      if(msg1!="") {
        sits_tooltip(tempfld,msg1);
      }
    });
  }
  if(isinfocus && thefld.get(0)!=document.activeElement) {
    thefld.focus(); //re-focus field if it has lost focus (caused by .wrap)
  }

}

// Function to process errorobject
function sits_process_inline_errors(pPageErrors) {
  //single record mode errors
  if(typeof(pPageErrors)=="object") {
    $.each(pPageErrors,function(i,error) {
      if(error.MSGID=="NONE") {
        sits_inline_validation_message(error.STAT,error.ERROR,error.FLDID,"",{"showError":false});
      }
      else {
        sits_inline_validation_message(error.STAT,error.ERROR,error.FLDID,error.MSGID);
      }
    });
  }
}

//Internal function to add debug messaging for events
function sits_debug_events(sel,mouse,touch) {
  var str = "blur change click dblclick error focus keydown keypress keyup load resize scroll select submit unload";
  if(typeof(mouse)!="boolean" || mouse) {
    str += " mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup";
  }
  if(typeof(touch)!="boolean" || touch) {
    str += " touchstart touchend touchcancel touchmove";
  }
  return ($(sel).on(str,function(evt) {
    sits_putmess(sits_to_string(evt));
  }).length>0);
}

// function to build a select all button
// string/element - element or selector  - target for the HTML
// string - callback function for when a value is selected
// string - button text(optional) will use defaults if not specified
// options  array - list of option texts(optional) will use defaults if not specified
// returns numeric - selection of a value calls callback function passing in array index 0,1,2 etc....
function sits_add_select_all(sel,callback,btntext,options,extraOptions) {
  var pullright = true;
  if(typeof(extraOptions)=="object" && typeof(extraOptions.pullRight)=="boolean") {
    pullright = extraOptions.pullRight;
  }
  else {
    pullright = true;
  }
  if(btntext=="" || typeof(btntext)=="undefined") {
    btntext = sits_widget_bp.ui.selectAllTitle;
  }
  if(options=="" || typeof(options)=="undefined") { // use default;select all, select none, invert
    options = [sits_widget_bp.ui.selectAll,sits_widget_bp.ui.selectNone, sits_widget_bp.ui.invertAll];
  }
  var thelist = "";
  var divid = "sv-"+sits_uuid();

  $.each(options,function(i,n) {
    thelist += "<li><a href=\"javascript:\" onclick=\"javascript:"+callback+"("+i+",'"+divid+"')\" >"+n+"</a></li>";
  });
  var html = "";
  if(pullright) {
    html =  "<div role=\"group\" class=\"sv-dropdown sv-pull-right\">";
  }
  else {
    html =  "<div role=\"group\" class=\"sv-dropdown\">";
  }
  html += "<button id=\""+divid+"\" aria-haspopup=\"true\" aria-expanded=\"false\" type=\"button\" class=\"sv-btn sv-btn-default\" data-sv-toggle=\"sv-dropdown\" class=\"sv-btn sv-dropdown-toggle\">"+btntext+" <span class=\"sv-caret\"></button>";
  html += "<ul class=\"sv-dropdown-menu\" aria-labelledby=\""+divid+"\">"+thelist;
  html += "</ul></div>";
  $(sel).html(html);
}

// Enable/disable a stylesheet(thereby turning on/off those styles)
// string file :in;stylesheet filename to enable/disable(not including the path)
// boolean enable :in;true to enable the stylesheet, false to disable
function sits_stylesheet_enable(file,enable) {
	if(typeof(file)!=="string"||file==="") return false; 	//filename must be specified
	if(typeof(enable)!=="boolean") enable = true; //enable by default

	//strip any versioning from the filename
	if(file.indexOf("?")>-1) file = file.substring(0,file.lastIndexOf("?"));

	//loop through the stylesheets object looking for a match
  var stylesheets = document.styleSheets, sheet, disabled, href;
	for(var i=0;i<stylesheets.length;i++) {
		sheet = stylesheets[i];

		//see if the filename matches
		href = sheet.href || "";
		if(href.indexOf("/")>-1) href = href.substring(href.lastIndexOf("/") + 1); //strip the path
		if(href.indexOf("?")>-1) href = href.substring(0,href.lastIndexOf("?")); //strip the versioning

		if(href.indexOf(file)===0) {
			//match found, so see if we need to enable/disable
			disabled = sheet.disabled;

			if((disabled&&enable)||(!disabled&&!enable)) { //if we're changing state, then do so
				sheet.disabled = !enable;
			}

			return true; //stylesheet found
		}
	}

	return false; //if we've made it here then no match found
}

//build a record bar
// sel - selector to convert in to a record bar
// cur - current page to use
// tot - total pages
// recs - number of records per page (only used in display - optionally, leave blank to skip)
// fnc - callback function (called when the page changes - with the new page passed in as a parameter)
function sits_record_bar(sel,cur,tot,recs,fnc){
	//check selector is specified
	if((typeof(sel)!=="string"||sel.length===0) && typeof(sel)!=="object") return false;
	if(typeof(tot)!=="number") return false; //no total pages, so no idea what to build

	if(typeof(cur)!=="number") cur = 1; //assume first page by default

	//build the main structure
	var html = "<nav class=\"sv-form-pagination-btn\">";
	html += "<p class=\"sv-form-pagination-rec-count\"></p>";

	html += "<ul class=\"sv-pagination\">";
	html += "<li data-action=\"FIRST\"><input type=\"submit\" aria-label=\""+sits_escape_attr(sits_do_record_bar_bp("firstBtnAriaText"))+"\" value=\""+sits_escape_attr(sits_do_record_bar_bp("firstBtnText"))+"\">";
	html += "<li data-action=\"PREV\"><input type=\"submit\" aria-label=\""+sits_escape_attr(sits_do_record_bar_bp("prevBtnAriaText"))+"\" value=\""+sits_escape_attr(sits_do_record_bar_bp("prevBtnText"))+"\">";
	html += "<li data-action=\"NEXT\"><input type=\"submit\" aria-label=\""+sits_escape_attr(sits_do_record_bar_bp("nextBtnAriaText"))+"\" value=\""+sits_escape_attr(sits_do_record_bar_bp("nextBtnText"))+"\">";
	html += "<li data-action=\"LAST\"><input type=\"submit\" aria-label=\""+sits_escape_attr(sits_do_record_bar_bp("lastBtnAriaText"))+"\" value=\""+sits_escape_attr(sits_do_record_bar_bp("lastBtnText"))+"\">";
	html += "</ul>";

	html += "</nav>";

	//insert in to the DOM
	$(sel).html(html);

	//find the element we just built
	var nav = $(sel).find("nav");

	//ensure callback function and other data is available for use later
	nav.data("rec-bar-callback",fnc); //callback function
	nav.data("rec-bar-cur",cur); //current page
	nav.data("rec-bar-tot",tot); //total pages
	nav.data("rec-bar-recs",recs); //records per page

	//attach events
	nav.on("click",":submit",function(event){
		sits_do_record_bar_click(event);
	});

	//build pages and update buttons
	sits_do_record_bar_build(nav,"GOTO",cur);

	//trigger the callback function (if specified)
	if(typeof(fnc)==="function"){
		fnc(nav.data("rec-bar-cur")); //call function, passing in current page as the only parameter
	}

	return true;
}

//update an existing record bar programmatically
function sits_record_bar_update(sel,cur,tot,recs,runfnc){
	//check selector is specified
	if((typeof(sel)!=="string"||sel.length===0) && typeof(sel)!=="object") return false;

	//do we need to trigger the callback function after updating
	if(typeof runfnc!=="boolean"){
		runfnc = true;
	}

	//find the record bar element
	var nav = $(sel).find("nav");
	if(nav.length===0) return false;

	//update the information we need to - if cur, tot, recs, etc are not numbers then we use the existing value instead (so we can partially update)
	if(typeof cur==="number"){
		nav.data("rec-bar-cur",cur); //current page
	}
	if(typeof tot==="number"){
		nav.data("rec-bar-tot",tot); //total pages
	}
	if(typeof recs==="number"){
		nav.data("rec-bar-recs",recs); //records per page
	}

	//build pages and update buttons
	sits_do_record_bar_build(nav,"GOTO",nav.data("rec-bar-cur"));

	//trigger the callback function
	if(runfnc){
		var fnc = nav.data("rec-bar-callback");
		if(typeof fnc==="function"){
			fnc(nav.data("rec-bar-cur")); //call function, passing in current page as the only parameter
		}
	}

	return true;
}

//Internal function to build a message for the record bar
function sits_do_record_bar_bp(bpid,bpparams){
	var bplist = sits_widget_bp.pg;
	if(typeof(bplist)!=="object") return "";

	var bp = bplist[bpid];
	if(typeof(bp)!=="string") return "";

	//build up the message string by replacing {0}, {1}, etc with corresponding params
	if(typeof(bpparams)==="object"){
		for(var i=0;i<bpparams.length;i++){
			bp = sits_replace_all(bp,"{"+i+"}",bpparams[i]);
		}
	}
	return bp;
}

//Internal function to update the record bar (page changes for example)
function sits_do_record_bar_build(nav,mode,page){
	//get the total pages and records per page
	var cur = nav.data("rec-bar-cur");
	var tot = nav.data("rec-bar-tot");
	var recs = nav.data("rec-bar-recs");

	var newpage = cur;

	//work out what the next page is to show (based on the mode)
	switch(mode){
	case "FIRST":
		newpage = 1;
		break;
	case "PREV":
		newpage = cur - 1;
		break;
	case "NEXT":
		newpage = cur + 1;
		break;
	case "LAST":
		newpage = tot;
		break;
	case "GOTO":
		if(typeof(page)==="number"){
			newpage = page
		}
		break;
	}

	//if there is only one page then we add a class to the NAV for styling (so it can be hidden)
	if(tot<=1){
		nav.addClass("sv-form-pagination-single-page");
	}
	else{
		nav.removeClass("sv-form-pagination-single-page");
	}

	//check the page is actually valid
	if(newpage < 1){
		newpage = 1;
	}
	else{
		if(newpage > tot){
			newpage = tot;
		}
	}

	//update the record bar structure
	var action, li, btn, prevli;
	nav.find("ul.sv-pagination > li").each(function(){
		li = $(this);
		btn = li.find(":submit");
		action = li.data("action"); //what does the current li/button do

		switch(action){
		case "PREV":
			prevli = $(this); //keep a reference to the Previous LI as we attach page numbers after this //Note: there is no "break" here on purpose
		case "FIRST":
			if(newpage===1){
				li.addClass("sv-disabled");
				btn.addClass("sv-disabled").attr("aria-disabled",true);
			}
			else{
				li.removeClass("sv-disabled");
				btn.removeClass("sv-disabled").attr("aria-disabled",false);
			}
			break;
		case "NEXT":
		case "LAST":
			if(newpage===tot){
				li.addClass("sv-disabled");
				btn.addClass("sv-disabled").attr("aria-disabled",true);
			}
			else{
				li.removeClass("sv-disabled");
				btn.removeClass("sv-disabled").attr("aria-disabled",false);
			}
			break;
		case "GOTO":
			li.remove(); //remove any page numbers - we rebuild below
			break;
		}
	});

	//work out what pages we need to show
	var pages = sits_do_record_bar_pages(newpage,tot);

	//now include the new pages
	if(typeof prevli==="object"&&prevli.length>0){
		var page, html, active;
		for(var i=pages.length-1;i>=0;i--){ //we loop backwards so we always add to the right place
			page = pages[i];

			if(page===newpage){ //current button
				active = true;
			}
			else{
				active = false;
			}
			html = "<li data-action=\"GOTO\" data-page-num=\""+page+"\" class=\"sv-pagination-page"+(active?" sv-active":"")+"\"><input type=\"submit\""+(active?" aria-disabled=\"true\"":"")+" aria-label=\""+sits_escape_attr(sits_do_record_bar_bp("pageBtnAriaText",[page]))+"\" value=\""+sits_escape_attr(""+page)+"\">";

			prevli.after(html);
		}
	}

	//update the record display
	if(typeof(recs)==="number"){
		nav.find(".sv-form-pagination-rec-count").html(sits_do_record_bar_bp("infoWithRecsText",[newpage,tot,recs]));
	}
	else{
		nav.find(".sv-form-pagination-rec-count").html(sits_do_record_bar_bp("infoText",[newpage,tot]));
	}

	//update the current page
	nav.data("rec-bar-cur",newpage);
}

//Internal function to build a list of pages to show in the record bar
function sits_do_record_bar_pages(cur,tot){
	var btns = 5; //we aim to show 5 buttons maximum
	var half = Math.floor(btns/2);

	var pages = [], start, end;

	if(tot <= btns){ //less pages than required, so show what's available
		start = 1;
		end = tot;
	}
	else{
		if(cur >= (tot - half)){ //towards the end of the list, so display the last set of buttons
			start = tot - btns + 1;
			end = tot;
		}
		else{ //ensure the selected button is centred in the displayed page numbers (where possible)
			start = cur - 2;
			end = cur + 2;

			//if the start or end is outside of the available range then adjust (whilst trying to show the required number of buttons)
			if(start < 1){
				start = 1;
				end = start + btns - 1;
			}
			if(end > tot){
				end = tot;
			}
		}
	}

	if (start > end){
		end = start; //avoid infinite loop if something went wrong
	}

	//build the page list
	while(start <= end){
		pages.push(start);
		start++;
	}

	return pages;
}

//Internal function called when the record bar is clicked
function sits_do_record_bar_click(event){
	//work out what action was clicked - it's attached to the LI
	var ele = $(sits_get_target(event)).closest("li");

	var action = ele.data("action"), page;
	if(!ele.is(".sv-disabled,.sv-active") && typeof(action)!=="undefined"){
		//find the record bar element associated with it
		var nav = ele.closest("nav");

		//if the user clicked on a specific page number then we need to track which page (as we may need to reset focus later after rebuilding)
		if(action==="GOTO"){
			page = ele.data("page-num");
		}
		else{
			page = "";
		}

		//update the record bar
		sits_do_record_bar_build(nav,action,page);

		//reset focus (if we need to)
		var li;
		nav.find("ul.sv-pagination > li").each(function(){
			li = $(this);

			if(li.data("action")===action){
				if(action!=="GOTO"||li.data("page-num")===page){
					li.find(":submit").focus(); //focus on the associated button element, as it was focussed on before
					return false;
				}
			}
		});

		//run the callback function (if there is one)
		var fnc = nav.data("rec-bar-callback");
		if(typeof(fnc)==="function"){
			fnc(nav.data("rec-bar-cur")); //call function, passing in current page as the only parameter
		}
	}

	return sits_cancel_event(event);
}

//Announce information to a screenreader - used only when screen changes are not automatically announced
// string mes :in ;the message to announce
function sits_announce(mes){
	if(typeof(mes)!=="string"){
		return false;
	}

	//see if the required element is available, and create if not
	var ele = $("#sits_announce_element");
	if(ele.length===0){
		//create the element
		ele = $("<span id=\"sits_announce_element\" aria-live=\"polite\" class=\"sv-sr-only\"></span>");

		//insert it in to the document
		$("body").append(ele);
	}

	//update the element (should be read out by the screenreader) - needs to be in a timeout or the screenreader can ignore the initial call
	setTimeout(function(){
		ele.html(mes);
	},0);

	return true;
}

//show one or more elements (ready for jQuery 3)
//string sel : in ;jQuery selector to apply the tabs to (or element)
//function fnc : in ;callback function - optional
//string/number dur : in ;duration in ms (or "fast" or "slow" etc) - optional
//string eas : in ;easing function to use for the transition (e.g. "swing") - optional
function sits_show(sel,fnc,dur,eas){
  var obj = $(sel);
  if(obj.length<1) {
    return false; //no objects found
  }
  obj.removeClass("sv-hide");
  if(typeof(fnc) == "function"){
    obj.each(function(i){
      fnc.call(this); //call callback func
    });
  }
  return true;
}

//hide one or more elements (ready for jQuery 3)
//string sel : in ;jQuery selector to apply the tabs to (or element)
//function fnc : in ;callback function - optional
//string/number dur : in ;duration in ms (or "fast" or "slow" etc) - optional
//string eas : in ;easing function to use for the transition (e.g. "swing") - optional
function sits_hide(sel,fnc,dur,eas){
  var obj = $(sel);
  if(obj.length<1) {
    return false; //no objects found
  }
  obj.addClass("sv-hide");
  if(typeof(fnc) == "function"){
    obj.each(function(i){
      fnc.call(this); //call callback func
    });
  }
  return true;
}

//called when google api is loaded ( this should be the callback function for sits_attach_file )
function sits_gapi_loaded_fnc(){
  if (typeof(gapi) != "object"){
    setTimeout(sits_gapi_loaded_fnc,100);
    return false;
  }
  gapi.load('auth',  {'callback': sits_gapi_auth_loaded_fnc});
  gapi.load('picker',{'callback': sits_gapi_picker_loaded_fnc});
}
function sits_gapi_auth_loaded_fnc(){
  sits_gapi_auth_loaded = true;
}
function sits_gapi_picker_loaded_fnc(){
  sits_gapi_picker_loaded = true;
}

//Show or hide a loading/processing/saving dialog
//boolean opn :in ;open (true) or close (false) the dialog
//string mod :in ;is this a LOAD, PROCESS, or SAVE dialog
//string tid :in ;id for the dialog (if not specified, sits_loading_dialog will be used)
function sits_dialog_loading(opn,mod,tid){
	if(typeof opn!=="boolean") opn = true; //opening a dialog by default
	if(typeof mod!=="string"||mod==="") mod = "LOAD"; //loading dialog is the default
	if(typeof tid!=="string"||tid==="") tid = "sits_loading_dialog";

	//always try and close the dialog first (in case it's already open)
	sits_dialog_close(true,tid);

	//if we're just closing the dialog then we're done
	if(!opn){
		return true;
	}

	//initialise the loading of the image
	var img = new Image();
	img.src = "../images/working.gif"; //this should start loading the image in most browsers

	//get the boilerplate object
	var bp = {};
	if(typeof sits_widget_bp==="object"&&typeof sits_widget_bp.ld==="object"){
		bp = sits_widget_bp.ld;
	}

	//determine what text to use for this dialog (based on the mode)
	var ttl = "", cont = "";
	switch(mod){
	case "LOAD":
		ttl = (typeof bp.loadTitle==="string")?bp.loadTitle:"Loading";
		cont = (typeof bp.loadContent==="string")?bp.loadContent:"Loading, please wait...";
		break;
	case "PROCESS":
		ttl = (typeof bp.processTitle==="string")?bp.processTitle:"Processing";
		cont = (typeof bp.processContent==="string")?bp.processContent:"Processing, please wait...";
		break;
	case "SAVE":
		ttl = (typeof bp.saveTitle==="string")?bp.saveTitle:"Saving";
		cont = (typeof bp.saveContent==="string")?bp.saveContent:"Saving, please wait...";
		break;
	default:
		return false; //invalid mode
	}

	//prefix the content with the image
	cont = "<img src=\"../images/working.gif\" alt=\""+sits_escape_attr(ttl)+"\" title=\""+sits_escape_attr(cont)+"\"> " + cont;

	//show the dialog
	sits_dialog(ttl,cont,{},false,true,false,9999,tid,true,35);
	return true;
}

//Used to keep financial totals inline with data values
function sits_financial_totals() {
  var tot = $(".sv-financial-total");
  if(tot.length<1) {
    return true; //no totals visible
  }
  if(!sits_events.financialTotalsResize) {
    $(window).on("resize",sits_debounce_event(sits_financial_totals,250)); //register resize event
    sits_events.financialTotalsResize = true;
  }
  if(!sits_events.financialTotalsColChange) {
    $(document).on("tablesawcolchange",".tablesaw-swipe,.tablesaw-columntoggle",sits_financial_totals); //register event for tablesaw column change (e.g. swipe)
    sits_events.financialTotalsColChange = true;
  }

  //if the financial totals section is affected by sv-portal.css then we need to calculate the current breakpoint differently
  var bp, calcbp = false;
  if(sits_portal_object.hasAffected&&!sits_portal_object.isDisabled) {
		calcbp = true; //calculate the breakpoint individually for each totals block
  }
  else{
  	bp = sits_get_breakpoint(); //use the overall page breakpoint
  }

  tot.each(function () { //loop through totals and re-position
    var ele = $(this);

		//if the totals are in the xs breakpoint then we reset so that totals are shown normally
		if(calcbp){
			bp = sits_do_get_portal_breakpoint(ele);
		}

		if(bp==="xs"){ //reset on mobiles
			ele.removeAttr("style").removeClass("sv-hide").children(".sv-financial-label").removeClass("sv-sr-only");
		}
		else{ //line up totals with columns
    	ele.children(".sv-financial-label").addClass("sv-sr-only"); //hide labels

    	var headObj = $("th[data-financial-heading='"+ele.attr("data-financial-total")+"']");
    	if(headObj.length==1) {
	      if(headObj.is(":visible")) {
  	      ele.removeClass("sv-hide").position({ //show total
    	      my: "right top",
      	    at: "right bottom",
        	  of: headObj,
          	within: ".sv-financial-container",
          	collision: "none"
        	}).css("top","0");
      	}
      	else {
	        ele.addClass("sv-hide"); //hide total
  	    }
    	}
    }
  });
  return true;
}

//Scroll a particular element in to view
//String/Element - jQuery selector/object to scroll in to view
//Function - callback function, run on completion
function sits_scroll_to(sel,fnc){
  var obj = $(sel);
  if(obj.length<1) {
    return false; //no objects found
  }

	//scroll the top of the element in to view and run the callback function (if defined)
	$("html,body").animate({
		scrollTop: $(obj).offset().top
	},"slow","swing",fnc);

	return true;
}

//Check to see if the user has page or session timeouts
function sits_user_timeouts() {
  if(typeof(sits_user_timeout)=="string" && sits_user_timeout) { //check for key
    setTimeout(function() {
      if(typeof(sits_user_timeout)=="string" && sits_user_timeout) {
        var par = "MOD=INIT&KEY="+sits_user_timeout; //build parameters
        sits_send_query("POST","siw_dmu.timeout",par,false,"sits_do_user_timeouts"); //check for timeout
      }
    },30000); //wait for 30 seconds of inactivity */
  }
  return true;
}

//Internal function to see if the user has page or session timeouts
function sits_do_user_timeouts(res) {
  if(res=="<OK>") {
    return true; //no timeouts
  }
  if(res.substr(0,4)!="<OK>") {
    return false; //error
  }
  var obj = sits_parse_json(res.substr(4)); //create data object
  if(!obj || !obj.MODE) {
    return false; //invalid data object
  }
  var wrn = sits_to_datetime(obj.WARN); //get date/times
  var exp = sits_to_datetime(obj.EXPR);
  var now = sits_to_datetime(obj.DTIM);
  if(exp-now<1) { //expired already
    if(typeof(sits_user_timeout)=="string" && sits_user_timeout) {
      sits_navigate("SIW_LGN_LOGOUT.autologout?"+sits_user_timeout); //auto-logout
    }
    return true;
  }
  if(obj.MODE=="CHCK" && wrn-now<1) { //need to show warning dialog
    var ttl = "";
    var con = "";
    var bt1 = sits_widget_bp.to && sits_widget_bp.to.buttonContinue || "Continue";
    var bt2 = sits_widget_bp.ui && sits_widget_bp.ui.dialogClose || "Close";
    var btn = {};
    btn[bt2] = function() { //add "close" button
      sits_dialog_close(true,"sits_timeout_dia");
    };
    btn[bt1] = function () { //add "continue" button
      if(typeof(sits_user_timeout)=="string" && sits_user_timeout) {
        var par = "MOD=CONT&POS="+obj.PORS+"&KEY="+sits_user_timeout; //build parameters
        sits_send_query("POST","siw_dmu.timeout",par,false,"sits_do_user_timeouts"); //check for timeout
      }
      sits_dialog_close(true,"sits_timeout_dia");
    };
    if(obj.PORS=="P") {
      ttl = sits_widget_bp.to && sits_widget_bp.to.pageTitle || "Page Expiry";
      con = sits_widget_bp.to && sits_widget_bp.to.pageContent || "This page is due to expire in approximately {0} minute(s). If you would like to continue using this page, please click \"Continue\".";
    }
    else {
      ttl = sits_widget_bp.to && sits_widget_bp.to.sessionTitle || "Session Expiry";
      con = sits_widget_bp.to && sits_widget_bp.to.sessionContent || "Your session is due to expire in approximately {0} minute(s). If you would like to continue using this session, please click \"Continue\".";
    }
    con = sits_replace(con,"{0}",String((exp-wrn)/60000)); //minutes from warning to expiry
    sits_dialog(ttl,con,btn,true,true,false,null,"sits_timeout_dia"); //show dialog (return out!)
    setTimeout(function () {
      if(typeof(sits_user_timeout)=="string" && sits_user_timeout) {
        var par = "MOD=CHCK&KEY="+sits_user_timeout; //build parameters
        sits_send_query("POST","siw_dmu.timeout",par,false,"sits_do_user_timeouts"); //check for timeout
      }
    },exp-now); //wait till expiration
    return true;
  }
  setTimeout(function () {
    if(typeof(sits_user_timeout)=="string" && sits_user_timeout) {
      var par = "MOD=CHCK&KEY="+sits_user_timeout; //build parameters
      sits_send_query("POST","siw_dmu.timeout",par,false,"sits_do_user_timeouts"); //check for timeout
    }
  },wrn-now); //wait till warning
  return true;
}
// if postcode button hidden stop field being an input group
function sits_postcode_hide(postcodeid){
  var pcod = $("#"+sits_do_get_object(postcodeid));
  if ( pcod.parent().is("div.sv-input-group")){
    pcod.unwrap();
    pcod.next(".sv-input-group-btn").remove();
  }
}

//Convert a textarea in to a WYSIWYG editor (e.g. CKEditor)
//id - the id of the element to convert into an editor (must be a TEXTAREA)
//cfg - the name of any config file to use for defaults (leave blank to use config-sits.js or config-sits-mobile.js on smaller devices)
//hgt - the height of the editor after initialisation
//opt - any additional options (as a JSON object)
//ref - refresh the existing editor if it is already initialised
//fnc - callback function that is run once initialisation is complete
function sits_editor(id,cfg,hgt,opt,ref,fnc){
	if(typeof id!="string" || id=="") return false;

	//initialisation of the editor can take some time, so show a loading dialog if possible
	var showdlg = false;
	if(typeof $=="function"){
		showdlg = true;
		sits_dialog_loading(true,"","sits_loading_dialog_editor");
	}

	//functionality is provided by the sits_editor JS file, so this needs to be loaded
	sits_include_file("../javascript/sits_editor.js",function(success){
		if(!success) return;

		//run the initialisation function contained in the sits_editor JS file
		sits_do_editor1(id,cfg,hgt,opt,ref,function(success){
			if(showdlg){ //loading dialog was opened during init so close it on completion
				sits_dialog_loading(false,"","sits_loading_dialog_editor");
			}

			//callback function triggered when editor completes initialisation (or fails to)
			if(typeof fnc=="function"){
				fnc(success);
			}
		});
	});

	return true;
}

//return an instance of the WYSYWIG editor for a particular textarea
//id - the id of the element
function sits_editor_instance(id){
	if(typeof sits_do_editor_instance=="function"){
		return sits_do_editor_instance(id);
	}
	return null;
}

//return the value from a textarea that uses a WYSIWYG editor
//id - the id of the element
function sits_editor_get_value(id){
	if(typeof sits_do_editor_get_value=="function"){
		return sits_do_editor_get_value(id);
	}
	return "";
}

//set the value of a textarea that uses a WYSIWYG editor
//id - the id of the element (must already have been initialised)
//val - the value to update the editor display with
//fnc - callback function called when the editor has been updated (as the update can be asynchronous)
function sits_editor_set_value(id,val,fnc){
	if(typeof sits_do_editor_set_value=="function"){
		sits_do_editor_set_value(id,val,fnc);
		return;
	}

	//unable to update the field, so call the callback function with a failure status
	if(typeof fnc=="function") fnc(false);
}

//resize a textarea that uses a WYSIWYG editor
//id - the id of the element
//hgt - the height of the editor in px
function sits_editor_resize(id,hgt){
	if(typeof sits_do_editor_resize=="function"){
		return sits_do_editor_resize(id,hgt);
	}

	return false;
}

//refresh a WYSIWYG editor (e.g. to change the config options)
//id - the id of the element to convert into an editor
//cfg - the name of any config file to use for defaults (leave blank to use config-sits.js or config-sits-mobile.js on smaller devices)
//hgt - the height of the editor after initialisation
//opt - any additional options (as a JSON object)
//fnc - callback function that is run once initialisation is complete
function sits_editor_refresh(id,cfg,hgt,opt,fnc){
	//trigger the standard editor function with refresh mode enabled
	return sits_editor(id,cfg,hgt,opt,true,fnc);
}
