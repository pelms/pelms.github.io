//dmx_tooltip.js - Load Tooltips for Page
var dmx_tooltip_version = "910.1"; //file version number

//Check for the existence of sits_ajax.js 
if(typeof(sits_ajax_version)=="string") {
	//sits_ajax.js loaded, Attach the tooltip startup event
	sits_attach_event(window,"load",tooltip_startup);
} 
else {
	//sits_ajax.js not loaded, Add the file to the page
	var imported = document.createElement("script");
	imported.src = "../javascript/sits_ajax.js";
  if(typeof(document.head)!="undefined") {
	  document.head.appendChild(imported);
  }
  else {
    document.getElementsByTagName("head")[0].appendChild(imported);
  }
	
	//Now check that the file is loaded
	sits_ajax_load();
}

//Function to include sits_ajax where not fully loaded 
function sits_ajax_load() {
	//Check the sits_loaded variable exists
	if(typeof(sits_loaded)=="boolean" && sits_loaded) {
    //sits_loaded is true, Attach the tooltip startup event 
    sits_attach_event(window, "load", tooltip_startup);
  }
  else {
    //sits_loaded is false, Trigger a waiting period then recheck
    setTimeout("sits_ajax_load()",100); //wait for body
    return false;
  }
  return true;
}

//Function called on startup to convert old style tooltips to attach tootltip functionality to all
function tooltip_startup() {
  //Create selector for data-ttip property
  (function($) {
    $.expr[':'].hasDataTTip = function(element) {
      return !(typeof $(element).data('ttip') === "undefined");
    };
  }(window.jQuery));

	//Scan for all mouseover events to catch manually added tooltips 
  $("[onMouseOver]").each(function(index) {
		var jsCatch = $(this).attr("onMouseOver");	    
    if(jsCatch.substr(0,8)=="tooltip(") {
      if(jsCatch.substr(0,13)!="tooltip(this)") {		
			  var tTip = eval(jsCatch);
        if(tTip!="") {
			    $(this).data("ttip",tTip);
        }
		  }
    }
	});
	
	//Attach tooltip function to any element with the attribute ttip, displaying the value of ttip
  var not = ":not(.sv-disabled,[disabled],[readonly])";
  var sel = ":hasDataTTip"+not+",[data-ttip]"+not+",[ttip]"+not; 
  var bdy = $("body");
	bdy.tooltip({
    items: sel,
	  track: true,
    show: {delay:500}, //sits_anim_speed makes the tooltip appear to fast
    hide: sits_anim_speed,
    tooltipClass: "sv-tooltip",
    content: function() {
      var element = $(this);      
      var v_ttip = "";
      if(element.is(":hasDataTTip")) {
        return element.data("ttip");
			}
      if(element.is("[data-ttip]")) {
			  v_ttip = element.attr("data-ttip");
        element.data("ttip",v_ttip);
				return v_ttip;
      }      
      if(element.is("[ttip]")) {
			  v_ttip = element.attr("ttip");
        element.data("ttip",v_ttip);
				return v_ttip;
      }      
    }
  });
  
  //Safari Mobile (iOS8) is firing "onmouseover" for some reason!
  if(("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    if(navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
      bdy.on("mouseover",sel,function(evt) {
        $(evt.target).focus(); //try to focus on field instead
        return false;
      });
    }
  }
  return true;
}

//Function required to evaluate manually added tooltips
function tooltip(mess,icon) {
	return mess;
}