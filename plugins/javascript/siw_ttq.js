var siw_ttq_version = "881.1"; //file version number
var siw_ttq_params = ""; //cache parameter values
var siw_ttq_flags = []; //array of validation flags (name=flag)
var responsivemodeTTQ = "" ;//responsive mode flag
var gdoauthToken
var odfiles
sits_attach_event(window,"load",ttq_onload);

function ttq_onload() {  
  ttq_apply_chosen();
  var ele = $("[data-webvalidation=on]"); //get all elements that require web validation
  if(ele.length>0) {
    ele.filter("input:checkbox,input:radio,input:text,input:password,textarea,select").blur(ttq_trigger); //attach appropriate events
    ele.filter("select").change(ttq_trigger);
    ele.filter("input:checkbox,input:radio,input:submit").click(ttq_trigger); 
    ele.each(function(i) {
      ttq_set_flag($(this),""); //reset validation status flag
      if($(this).attr("data-usechosen")=="Y") {
        ttqblurchosen(this.id);
      }
    });    
  }
  ttq_apply_cloud();  
  return true;
}

function ttqblurchosen(srcy) {
  var thediv = ""
  if(typeof $("#"+sits_do_get_object(srcy)).data("chosen")!="undefined") {
     thediv = $("#"+sits_do_get_object(srcy)).data("chosen").container;
  }else{
    setTimeout("ttqblurchosen('"+srcy+"')",500);
    return;
  }  
  thediv.find("input[type=text]").blur(function() {
    $("#"+sits_do_get_object(srcy)).trigger("blur"); 
  });
}
function ttq_trigger(evt) { 
  var trg = $(evt.target); //get answer field
  if(trg.length==1) {
    if(trg.hasClass("hasDatepicker") && $("#ui-datepicker-div:visible").length==1) { 
	    return false; //ignore fields with visible date pickers (will be validated by OnSelect event)
    }
    ttq_set_flag(trg,""); //reset validation status flag
    return ttq_validate(trg); //validate answer field
  }
  return false;
}

function ttq_validate(trg,ext){  
  if(trg.attr("data-webvalidation")=="on") { //check validation is still on
    var tid = trg.attr("id"); //get field ID            
    if(tid.indexOf("SPLITDATE")>-1) { //special case for split dates only validate if the other 2 are populated
      if(ext!="Y") {
        setTimeout(function() {
          ttq_validate(trg,"Y");
        },100);
        return;
      }    
      var occ2 = "";
      try {
        if($(":focus").attr("id").indexOf("SPLITDATE")>-1) {
          occ2 = $(":focus").attr("id").split(".").slice(-1).toString();
        }   
      }
      catch(err) {
      }     
      var tid1 = tid.split(".");
      var occ = tid1.slice(-1).toString();
      var num = 0;
      var y = $("#SPLITDATE_Y\\.TTQ\\.MENSYS\\."+occ).val();
      var d = $("#SPLITDATE_D\\.TTQ\\.MENSYS\\."+occ).val(); 
      var m = $("#SPLITDATE_M\\.TTQ\\.MENSYS\\."+occ).val(); 
      if(y=="" && d=="" && m=="") {
        num = 2;
      }
      if( y!="" && tid.indexOf("SPLITDATE_Y")<0) {
        num++;
      }
      if( m!="" && tid.indexOf("SPLITDATE_M")<0) {
        num++;
      }
      if( d!="" && tid.indexOf("SPLITDATE_D")<0) {
        num++;
      }
      if(occ==occ2 && num<2) {
        return;
      }
    }              
    var spn = ttq_get_span(trg); //get related error span
    if(spn.length==1) {
      var par = "mode=ONE&indx="+sits_escape_url(tid); //build parameters 
      par += "&valu="+sits_escape_url(ttq_get_value(tid)); 
      par += "&ttqs="+sits_escape_url(trg.attr("data-ttqseqn")); 
      if(!siw_ttq_params) {
        var frm = trg.closest("form"); //get form element
        siw_ttq_params = "&mhdc="+sits_escape_url(frm.children("input[name^='MHDC']:first").val());
        siw_ttq_params += "&seqn="+sits_escape_url(frm.children("input[name^='SEQN']:first").val());
        siw_ttq_params += "&nkey="+sits_escape_url(frm.children("input[name^='NKEY']:first").val());      
      }
      if(sits_send_query("POST","siw_ttq.validation",par+siw_ttq_params,true,"ttq_results")) { //send ajax post        
        spn.html("<img src=\"../images/working.gif\" alt=\"...\">"); //show whirlygig
      }
    }
  }
  return true;
}

function ttq_results(txt) {          
  if(txt.substr(0,4)=="<OK>") { //check response is ok
    var obj = sits_parse_json(txt.substr(4)); //get results object
    var ele = $("#"+sits_do_get_object(obj.indx)); //get answer field
    var spn = ttq_get_span(ele); //get related error span
    if(obj.stat==0) {
      if ( responsivemodeTTQ == "R" ){        
        $("#"+sits_do_get_object(obj.indx)+"transblock").html("");
        //  sits_inline_validation_message(0,obj.html,obj.indx,$(spn).attr("id"),{"showError":false});
        sits_inline_validation_message(0,obj.html,obj.indx,$(spn).attr("id"));  
        if ( typeof(auto_get_translations) == "function" ) {
          auto_get_translations(ele[0],"Y");
        }  
      }else{ 
        if ( typeof(auto_get_translations) == "function" ) {
          auto_get_translations(ele[0]);
        }  
        spn.html(""); //valid - hide whirlygig     
      }            
      if(ele.is("input:text:not(.dmu_enabled),input:password,textarea")) { //text inputs (but not dynamic listbox)
        sits_set_value(ele[0],obj.valu); //set formatted value
      }
      if(ele.is("input.dmu_enabled") && !ele.hasClass("dmu_input_icon")) { //dynamic listbox (code mode only)
        var val = ele.val();        
        if(val!=obj.valu && val.toUpperCase()==obj.valu.toUpperCase()) { //only case has changed
          sits_set_value(ele[0],obj.valu); //set formatted value
        }
      }
      var flg = ttq_get_flag(ele);    
      if(flg!="one" && flg!="two") {
        ttq_set_flag(ele,"one"); //reset validation status flag
      }
      if(siw_ttq_object && flg!="two") { //check if cross field validation is needed
        var ts1 = ele.attr("data-ttqseqn");
        var arr = siw_ttq_object[ts1]; //get array of cross validated fields

        if(arr) {
          var l = arr.length;
          if(l>0) {
            var boo = false; 
            var ids = sits_escape_url(obj.indx); //start list values
            var vls = sits_escape_url(obj.valu); 
            var tss = sits_escape_url(ts1);
            for(var i=0;i<l;i++) { //loop through items in array
              var ts2 = arr[i];   
              var el2 = $("[data-ttqseqn="+ts2+"]"); //get other answer field
              var flg = ttq_get_flag(el2);
              if(flg=="one" || flg=="two") { //check if valid value
                var id2 = el2.attr("id");
                var va2 = ttq_get_value(id2);
                ids += "~~~"+sits_escape_url(id2); //build list values
                vls += "~~~"+sits_escape_url(va2);
                tss += "~~~"+sits_escape_url(ts2);
                boo = true;
              }
            }
            if(boo) {
              var par = "mode=TWO&indx="+ids+"&valu="+vls+"&ttqs="+tss; //build parameters 
              if(sits_send_query("POST","siw_ttq.validation",par+siw_ttq_params,true,"ttq_results2")) { //send ajax post    
                spn.html("<img src=\"../images/working.gif\" alt=\"...\">"); //show whirlygig
              }          
            }
          }
        }
      }
    }else{
      // check responsive mode
      if ( responsivemodeTTQ == "R" ){
        //clear trans block 
        $("#"+sits_do_get_object(obj.indx)+"transblock").html("");
       // sits_inline_validation_message(-1,obj.html,obj.indx,$(spn).attr("id"),{"showError":false});
        sits_inline_validation_message(-1,obj.html,obj.indx,$(spn).attr("id"));
        ttq_set_flag(ele,"false"); //reset validation status flag
        return
      }       
      spn.html(obj.html); //invalid - show error message
      if ( typeof(auto_get_translations) == "function" ){
        auto_get_translations(ele[0]);
      }  
      ttq_set_flag(ele,"false"); //reset validation status flag
    }
  }
  return true;
}

function ttq_results2(txt) {
  if(txt.substr(0,4)=="<OK>") { //check response is ok
    var obj = sits_parse_json(txt.substr(4)); //get results object
    var ids = String(obj.indx).split("~~~"); //get array of field IDs
    var tid = ids[0]; 
    var ele = $("#"+sits_do_get_object(tid)); //get answer field
    var spn = ttq_get_span(ele); //get related error span
    if(obj.stat==0) {
      if(ttq_get_flag(ele)=="one") {
        if ( responsivemodeTTQ == "R" ){
          $("#"+sits_do_get_object(tid)+"transblock").html("");
          sits_inline_validation_message(0,"",tid,$(spn).attr("id"));
        }else{   
          spn.html(""); //valid - hide whirlygig
        }  
        ttq_set_flag(ele,"two"); //reset validation status flag        
        if(siw_ttq_object) {
          var ts1 = ele.attr("data-ttqseqn");
          var arr = siw_ttq_object[ts1]; //get array of cross validated fields
          if(arr) {
            var l = arr.length;
            for(var i=0;i<l;i++) { //loop through items in array
              var ts2 = arr[i];   
              var el2 = $("[data-ttqseqn="+ts2+"]"); //get other answer field
              var flg = ttq_get_flag(el2);
              if(flg=="one") { //check if valid value and trigger stored    
                ttq_validate(el2); //re-validate other answer field
              }         
            }
          }
        }
      }
    }else {
      var l = ids.length;
      if(l==1) {   // why here only 1 id, only one message???
        spn.html(obj.html); //invalid - show error message
      }else{
        var arr = String(obj.html).split("~~~"); //get array of messages
        if(arr && arr.length==l) {
          for(var i=0;i<l;i++) { //loop through items in array          
            var htm = arr[i] || "";
            var id2 = ids[i] || "";
            var el2 = $("#"+sits_do_get_object(id2)); //get other answer field            
            if ( responsivemodeTTQ == "R" ){
              $("#"+sits_do_get_object(id2)+"transblock").html("")
              if ( htm != " "){
                sits_inline_validation_message(-1,htm,id2,$(ttq_get_span(el2)).attr("id"));
              }else{
                sits_inline_validation_message(0,"",id2,$(ttq_get_span(el2)).attr("id"));
              }                              
            }else{            
              $(ttq_get_span(el2)).html(htm); //show error message            
            }            
            if(ttq_get_flag(el2)=="two") {
              ttq_set_flag(el2,"one"); //reset validation status flag
            }
          }
        }
      }
      if(ttq_get_flag(ele)=="two") {
        ttq_set_flag(ele,"one"); //reset validation status flag        
      }
    } 
  }
  return true;
}  

function ttq_set_flag(ele,flg) {
  var nam = ele.attr("name") || ""; //get field name
  if(nam.indexOf("RECPICKER")>-1) { //special case for record picker
    var arr = nam.split("-");
    var occ = sits_get_integer(arr[1]); //get TTQ occurrence number
    nam = "ANSWER.TTQ.MENSYS."+occ+"."; //calculate answer field
  }  
  if( nam.indexOf("SPLITDATE")>-1) {
    nam = "ANSWER"+nam.substr(11);
  }  
  siw_ttq_flags[nam] = flg; //store flag value
  return true;
}

function ttq_get_flag(ele) {
  var nam = ele.attr("name") || ""; //get field name
  if(nam.indexOf("RECPICKER")>-1) { //special case for record picker
    var arr = nam.split("-");
    var occ = sits_get_integer(arr[1]); //get TTQ occurrence number
    nam = "ANSWER.TTQ.MENSYS."+occ+"."; //calculate answer field
  }   
  if( nam.indexOf("SPLITDATE")>-1) {
    nam = "ANSWER"+nam.substr(11);
  }  
  return siw_ttq_flags[nam] || ""; //return flag value
}

function ttq_get_span(trg) {
  var nam = trg.attr("name") || ""; //get field name 
  var sid = trg.data("webvalspanid"); //get span ID 
  if(!sid) {
    if(nam.indexOf("RECPICKER")>-1) { //special case for record picker
      var arr = nam.split("-");
      var occ = sits_get_integer(arr[1]); //get TTQ occurrence number
      if ( responsivemodeTTQ == "R" ){
         sid = "ANSWER.TTQ.MENSYS."+occ+"errorblock";
      }else{
        sid = "error-for-ANSWER.TTQ.MENSYS."+occ; //calculate span ID      
      }  
    }else{ 
      if( nam.indexOf("SPLITDATE")>-1) {
        sid = "error-for-ANSWER"+nam.substr(11);
      }
      else {
        sid = "error-for-"+nam; //calculate span ID
      }
    }
    if ( $("#"+sits_do_get_object(sid)).length != 1 ){
      var nam = trg.attr("id");      
      if(nam.indexOf("RECPICKER")>-1) { //special case for record picker
        var arr = nam.split("-");
        var occ = sits_get_integer(arr[1]); //get TTQ occurrence number
        sid = "error-for-ANSWER.TTQ.MENSYS."+occ; //calculate span ID      
      }else{ 
        if( nam.indexOf("SPLITDATE")>-1) {
          sid = "ANSWER"+nam.substr(11)+"errorblock";
        }else{
          sid = nam+"errorblock"; //calculate span ID
        }
      }
    }
    if ( $("#"+sits_do_get_object(sid)).length != 1 ){ 
      if ( trg.attr("type") == "radio" ){
        nam = trg.attr("name")+"."
        sid = nam+"errorblock"; //calculate span ID
      }            
    }    
    sid = sits_do_get_object(sid); //encode selector characters
    trg.data("webvalspanid",sid); //cache for next time
  }
  return $("#"+sid); //return spen object
}

function ttq_get_value(id) {
  var obj = null;
  if(typeof(id)=="string") {
    obj = sits_get_object(id); //get object from id
  }
  else {
    obj = id; //object was passed in
    id = $(obj).attr("id");
  }
  if(!obj) {
    return ""; //object not found
  }
  if(id.indexOf("RECPICKER")>-1) { //special case for record picker
    var arr = id.split("-");
    var occ = sits_get_integer(arr[1]); //get TTQ occurrence number    
    var ele = $("input:checked[name*=RECPICKER][name$=-"+occ+"]"); //get all checked checkboxes for this record picker
    var val = "";
    ele.each(function(i) {
      val += "|||"+$(this).val(); //build up list of values
    });
    return val.substr(3); //return list
  }
  if(id.indexOf("SPLITDATE")>-1) { //special case for record picker
    var tid1 = id.split(".");
    var occ = tid1.slice(-1).toString();   
    return ($("#SPLITDATE_Y\\.TTQ\\.MENSYS\\."+occ).val()+$("#SPLITDATE_M\\.TTQ\\.MENSYS\\."+occ).val()+ $("#SPLITDATE_D\\.TTQ\\.MENSYS\\."+occ).val())    
  }  
  return sits_get_value(obj); //return field value
}

function ttq_set_date(val,obj) {
  var trg = $(this); //get answer field
  if(trg) {
    ttq_set_flag(trg,""); //reset validation status flag
    return ttq_validate(trg); //validate answer field
  }
  return false;
}

function ttq_apply_chosen() {
  var opt = {};
  opt.inherit_select_classes = true;
  opt.search_contains = true;
  opt.allow_single_deselect = true;  
  return sits_chosen_widget("[data-usechosen=Y]",opt);
}

// CLOUD STUFF
function ttq_apply_cloud() {
  $("input[data-file-field]").each(function(i){
    var forttq = sits_do_get_object($(this).attr("data-file-field"));   
    sits_hide("#"+forttq);  // hide upload
  });   
  
  // OPEN DROPBOX BUTTON
  $("body").on("click",".sv-dropbox-chooser",function(e){
    var fixt = $(this).attr("data-fixt-field");// get fixt field
    var button = $(this)
    var options = {linkType:"direct",success:function(files){
      // store file information for later
      $("#sits_dialog_ttq_cloud").data("db-file-link",files[0].link).data("db-fnam",files[0].name);
      $("#ttqdbchooserfilename").html(files[0].name);
      $("#ttqdbremover").removeClass("sv-disabled").prop("disabled",false);
    }};
    Dropbox.choose(options);        
  });
  //REMOVE DROPBOX BUTTON
  $("body").on("click",".sv-dropbox-deleter",function(e){ 
    $("#ttqdbchooserfilename").html(ttq_bp(211));
    $("#ttqdbremover").addClass("sv-disabled").prop("disabled",true);
    $("#sits_dialog_ttq_cloud").removeData("db-file-link");
    $("#sits_dialog_ttq_cloud").removeData("db-fnam");    
  })

  // OPEN ONEDRIVE BUTTON
  $("body").on("click",".sv-onedrive-chooser",function(e){
    var fixt = $(this).attr("data-fixt-field");// get fixt field
    var button = $(this);
    var clientID = $("#onedrivejs").attr("data-app-key");
    var redirectURI = $("#onedrivejs").attr("data-app-uri");
    var odOptions ={
      clientId: clientID,
      action: "download",
      multiSelect: false,
      openInNewWindow: true,
      advanced: {
        redirectUri:   redirectURI
      },
      success: function(files) { 
        odfiles = files;
        // store file information for later
        $("#sits_dialog_ttq_cloud").data("od-file-link",files.value[0]["@microsoft.graph.downloadUrl"]).data("od-fnam",files.value[0].name);
        $("#ttqodchooserfilename").html(files.value[0].name);
        $("#ttqodremover").removeClass("sv-disabled").prop("disabled",false);
      },
      cancel: function() {  },
      error: function(e) {  }
    }  
    OneDrive.open(odOptions);   
  });  
  //REMOVE ONEDRIVE BUTTON
  $("body").on("click",".sv-onedrive-deleter",function(e){ 
    $("#ttqodchooserfilename").html(ttq_bp(211));
    $("#ttqodremover").addClass("sv-disabled").prop("disabled",true);
    $("#sits_dialog_ttq_cloud").removeData("od-file-link");
    $("#sits_dialog_ttq_cloud").removeData("od-fnam");    
  })
  
  //REMOVE Google BUTTON
  $("body").on("click",".sv-googledrive-deleter",function(e){ 
    $("#ttqgdchooserfilename").html(ttq_bp(211));
    $("#ttqgdremover").addClass("sv-disabled").prop("disabled",true);
    $("#sits_dialog_ttq_cloud").removeData("gd-file-link").removeData("gd-fnam").removeData("gd-token").removeData("gd-id").removeData("gd-mime");
  })       
  //CHOOSE FILE 
  $("body").on("change","#ttqfileupload .sv-form-control-file",function(e){ 
    $("#ttqfileremover").removeClass("sv-disabled").prop("disabled",false);
  })
  
  //REMOVE FILE BUTTON
  $("body").on("click",".sv-ttqfile-deleter",function(e){ 
    $("#ttqfileupload")[0].reset();
    $("#ttqfileremover").addClass("sv-disabled").prop("disabled",true);
  })   

  // UPLOAD BUTTON ON SIW_TTQ - top to open dialog
  $("body").on("click",".sitscloud",function(e){    
  
    var ieversion = 3;
	  var div = document.createElement('div');
	  var all = div.getElementsByTagName('i');
  	//Try conditional statements to work out ie version (only works up to and including IE 9)
  	while(div.innerHTML = "<!--[if gt IE "+(++ieversion)+"]><i></i><![endif]-->", all[0]) {};
  
  
    //create dialog
    var theform = $(this).closest("form");
    var btn = {};
    var forttq = sits_do_get_object($(this).attr("data-file-field")); // original file upload field   
    var forttqid = $("#"+forttq).attr("id");
    var fixttq = $(this).attr("data-fixt-field");  // FIXT field to write cloud docs to.           
    var html = "<div class=\"sv-container-fluid\"><div class=\"sv-row\"><div class=\"sv-col-md-12\"><div class=\"sv-form-container\"><div class=\"sv-form-horizontal\"><fieldset><legend class=\"sv-sr-only\">"+ttq_bp(200)+"</legend>"    
    html += "<div id=\"ttqUploadTabs\"><ul>";
    html += "<li><a href=\"#ttqMyComputer\">"+ttq_bp(201)+"</a></li>";
    if ( $(this).hasClass("sitscloud_gd")  && sits_ie_supported() != "IE_8") {
      html += "<li><a href=\"#ttqGoogleDrive\" class=\"ttqGoogleDrive\" ><img src=\"../images/icons/googledrivesmall.png\" alt=\"google drive\"> "+ttq_bp(208)+"</a></li>";    
    }     

    if ( $(this).hasClass("sitscloud_db") && Dropbox.isBrowserSupported() ) {
      html += "<li><a href=\"#ttqDropBox\" class=\"ttqDropBox\" ><img src=\"../images/icons/dbx-icon-small.png\" alt=\"dropbox\"> "+ttq_bp(202)+"</a></li>";    
    }  
    if ( $(this).hasClass("sitscloud_od") && sits_ie_supported() != "IE_8"  && ieversion != 9  ) {
      html += "<li><a href=\"#ttqOneDrive\" class=\"ttqOneDrive\" ><img src=\"../images/icons/onedrivesmall.png\" alt=\"onedrive\"> "+ttq_bp(212)+"</a></li>";    
    }  
    html += "</ul>"        
    // my computer section
    var upclass = " sv-disabled";
    var disab = " disabled=\"disabled\" ";    
    html += "<div class=\"sv-form-group\" id=\"ttqMyComputer\"><p class=\"sv-col-sm-3 sv-static-text\">"+ttq_bp(201)+"</p>";
    if ( $("#"+forttq).val() != "" ){
      upclass = "";
      disab = "";
    }    
    html += "<div class=\"sv-col-sm-7\"><form id=\"ttqfileupload\"></form></div><div class=\"sv-col-sm-1\"></div>";
    html += "<div class=\"sv-col-sm-2\"><input "+disab+" id=\"ttqfileremover\" class=\"sv-btn sv-btn-primary sv-ttqfile-deleter"+upclass+"\" type=\"button\" value=\""+ttq_bp(206)+"\"></div>";
    html += "</div>"; //close form group    
    
    var cloudtype = $("input[name="+sits_do_get_object(fixttq)+"]").attr("data-cloudtype")    
    //build dropbox section
    if ( $(this).hasClass("sitscloud_db") && Dropbox.isBrowserSupported() ) {    
      var fnam = ttq_bp(211) ; // get filename from dum_fixt
      var btnclass = " sv-disabled";
      var disab = " disabled=\"disabled\" ";
      if ( cloudtype == "DROPBOX" ){
        fnam = $("input[name="+sits_do_get_object(fixttq)+"]").attr("data-fnam"); 
        var val = $("input[name="+sits_do_get_object(fixttq)+"]").val(); 
        val = val.slice(8);
        $("#sits_dialog_ttq_cloud").data("db-file-link",val);
        $("#sits_dialog_ttq_cloud").data("db-fnam",fnam);
        disab = "";     
        btnclass  = "" ;
      }
      html += "<div class=\"sv-form-group\" id=\"ttqDropBox\"><label for=\"ttqdbchooser\" class=\"sv-col-sm-3 sv-control-label\">"+ttq_bp(202)+"</label>";
      html += "<div class=\"sv-col-sm-3\"><input id=\"ttqdbchooser\" data-fixt-field=\""+fixttq+"\" type=\"button\" class=\"sv-btn sv-btn-primary sv-dropbox-chooser\" value=\""+ttq_bp(205)+"\"></div>";
      html += "<div class=\"sv-col-sm-4\" ><p id=\"ttqdbchooserfilename\" class=\"sv-form-control-static\">"+fnam+"</p></div>";
      html += "<div class=\"sv-col-sm-2\"><input "+disab+" id=\"ttqdbremover\" class=\"sv-btn sv-btn-primary sv-dropbox-deleter"+btnclass+"\" type=\"button\" value=\""+ttq_bp(206)+"\"></div>";
      html += "</div>"; //close form group
    }      

    // build onedrive section
    if ( $(this).hasClass("sitscloud_od") && sits_ie_supported() != "IE_8" ) {    
      var fnam = ttq_bp(211) ; // get filename from dum_fixt
      var btnclass = " sv-disabled";
      var disab = " disabled=\"disabled\" ";
      if ( cloudtype == "ONEDRIVE" ){
        fnam = $("input[name="+sits_do_get_object(fixttq)+"]").attr("data-fnam"); 
        var val = $("input[name="+sits_do_get_object(fixttq)+"]").val(); 
        val = val.slice(8);
        $("#sits_dialog_ttq_cloud").data("od-file-link",val);
        $("#sits_dialog_ttq_cloud").data("od-fnam",fnam);
        disab = "";     
        btnclass  = "" ;
      }
      html += "<div class=\"sv-form-group\" id=\"ttqOneDrive\"><label for=\"ttqodchooser\" class=\"sv-col-sm-3 sv-control-label\">"+ttq_bp(212)+"</label>";
      html += "<div class=\"sv-col-sm-3\"><input id=\"ttqodchooser\" data-fixt-field=\""+fixttq+"\" type=\"button\" class=\"sv-btn sv-btn-primary sv-onedrive-chooser\" value=\""+ttq_bp(213)+"\"></div>";
      html += "<div class=\"sv-col-sm-4\" ><p id=\"ttqodchooserfilename\" class=\"sv-form-control-static\">"+fnam+"</p></div>";
      html += "<div class=\"sv-col-sm-2\"><input "+disab+" id=\"ttqodremover\" class=\"sv-btn sv-btn-primary sv-onedrive-deleter"+btnclass+"\" type=\"button\" value=\""+ttq_bp(206)+"\"></div>";
      html += "</div>"; //close form group
    }   
    
    //build google section
    if ( $(this).hasClass("sitscloud_gd") && sits_ie_supported() != "IE_8" ) {    // need browser check?
      var fnam = ttq_bp(211) ; // get filename from dum_fixt
      var btnclass = " sv-disabled";
      var disab = " disabled=\"disabled\" ";     
      if (  cloudtype == "GOOGLE" ){
        fnam = $("input[name="+sits_do_get_object(fixttq)+"]").attr("data-fnam"); 
        var val = $("input[name="+sits_do_get_object(fixttq)+"]").val(); 
        val = val.slice(7);
        $("#sits_dialog_ttq_cloud").data("gd-file-link",val);
        $("#sits_dialog_ttq_cloud").data("gd-fnam",fnam);     
        btnclass  = ""     ;   
        disab = "";   
      }
      html += "<div class=\"sv-form-group\" id=\"ttqGoogleDrive\"><label for=\"ttqgdchooser\" class=\"sv-col-sm-3 sv-control-label\">"+ttq_bp(208)+"</label>";
      var inlink = "<input class=\"sv-btn sv-btn-primary sv-googledrive-chooser\" type=\"button\" id=\"ttqgdchooser\" data-fixt-field=\""+fixttq+"\" onclick=\"javascript:ttqloadpicker();\" value=\""+ttq_bp(209)+"\">";//</a>";     
      var inhtml = "<div role=\"group\" class=\"sv-dropdown\">";
      inhtml += "<button id=\"\"  aria-haspopup=\"true\" aria-expanded=\"false\" type=\"button\" class=\"sv-cloudfiles sv-btn sv-btn-block sv-btn-primary sv-dropdown-toggle\" data-sv-toggle=\"sv-dropdown\">heeeee <span class=\"sv-caret\"></span></button>";
      inhtml += "<ul class=\"sv-dropdown-menu\" ><li>"+inlink+"</li>";
      inhtml += "</ul></div>";
    
      html += "<div class=\"sv-col-sm-3\">"+inlink+"</div>";          
      html += "<div class=\"sv-col-sm-4\" ><p id=\"ttqgdchooserfilename\" class=\"sv-form-control-static\">"+fnam+"</p></div>";
      html += "<div class=\"sv-col-sm-2\" ><input id=\"ttqgdremover\" "+disab+" class=\"sv-btn sv-btn-primary sv-googledrive-deleter"+btnclass+"\" type=\"button\" value=\""+ttq_bp(206)+"\"></div>";
      html += "</div>"; //close form group      
    }          
    html += "</div></fieldset></div></div></div></div></div>";        

    // Cancel Button
    btn[ttq_bp(210)] = function() {
      sits_hide("#"+forttq);  // hide upload
     // $(theform).append($("#"+forttq));
      sits_dialog_close(true,"sits_dialog_ttq_cloud"); //add "close" button  may want to call from end of other functions  
      $("#sits_dialog_ttq_cloud").removeData("gd-file-link").removeData("gd-fnam").removeData("gd-token").removeData("gd-id").removeData("gd-mime").removeData("db-file-link").removeData("db-fnam");  

      }    
    // OK BUTTON - 
    btn[ttq_bp(203)] = function() {
    //check only 1 file defined  // all cloud will write to the same field
      var fixt =  $("#sits_dialog_ttq_cloud").data("fixt"); 
      $("input[name="+sits_do_get_object(fixt)+"]").val("").attr("data-fnam","").attr("data-cloudtype","");// write filename to fixt
      var cnt = 0 ;
      var dblink = $("#sits_dialog_ttq_cloud").data("db-file-link");
      var dbfnam = $("#sits_dialog_ttq_cloud").data("db-fnam");
      if ( typeof(dblink) == "string" && dblink != "" ){
        cnt++
      }   
      
      var odlink = $("#sits_dialog_ttq_cloud").data("od-file-link");
      var odfnam = $("#sits_dialog_ttq_cloud").data("od-fnam");
      if ( typeof(odlink) == "string" && odlink != "" ){
        cnt++
      }       
      
      var gdlink = $("#sits_dialog_ttq_cloud").data("gd-file-link");
      if ( typeof(gdlink) == "string" && gdlink != "" ){
        cnt++;
      }    
      if ( $("#"+forttq+"clone").val() != "" ){
        cnt++;
      }  
         
      if ( cnt > 1 ) {
        ttq_error_box(ttq_bp(204),ttq_bp(207));
        return ;
      }
      // is dropbox file specified??
      if (  typeof(dblink) != "undefined" ){ //update fixt field
        $("input[name="+sits_do_get_object(fixt)+"]").val("DROPBOX:"+dblink).attr("data-fnam",dbfnam).attr("data-cloudtype","DROPBOX");// write filename to fixt
      }
      // is onedrive file specified??
      if (  typeof(odlink) != "undefined" ){ //update fixt field
        var odfnam  =  $("#sits_dialog_ttq_cloud").data("od-fnam");
        var odobject = {};
        odobject.LINK = odlink;
        odobject.FNAM = odfnam;
        var odstring = JSON.stringify(odobject)  ;           
        $("input[name="+sits_do_get_object(fixt)+"]").val("ONEDRIVE:"+odstring).attr("data-fnam",odfnam).attr("data-cloudtype","ONEDRIVE");// write filename to fixt
      }      

      // is google file specified??      
      if (  typeof(gdlink) != "undefined" ){ //update fixt field
        var gdobject = {};
        var gdstring = "";
        var gdfnam = $("#sits_dialog_ttq_cloud").data("gd-fnam");
        var gdtoken = $("#sits_dialog_ttq_cloud").data("gd-token");
        var gdid = $("#sits_dialog_ttq_cloud").data("gd-id");
        var mime = $("#sits_dialog_ttq_cloud").data("gd-mime");
        gdobject.ID = gdid;
        gdobject.LINK = gdlink;
        gdobject.FNAM = gdfnam;
        gdobject.TOKEN = gdtoken;   
        gdobject.MIME = mime;   
        var gdstring = JSON.stringify(gdobject)  ;      
        $("input[name="+sits_do_get_object(fixt)+"]").val("GOOGLE:"+gdstring).attr("data-fnam",gdfnam).attr("data-cloudtype","GOOGLE");// write filename to fixt
      }               
      // delete original input and replace with new
      $("#"+forttq).remove();
      $("#"+forttq+"clone").attr("id",forttqid);
      sits_hide("#"+forttq);  // hide upload
      $(theform).append($("#"+forttq));
      $("#sits_dialog_ttq_cloud").removeData("gd-file-link").removeData("gd-fnam").removeData("gd-token").removeData("gd-id").removeData("gd-mime").removeData("db-file-link").removeData("db-fnam");       
      sits_dialog_close(true,"sits_dialog_ttq_cloud"); //add "close" button  may want to call from end of other functions
    }      
   
    sits_dialog(ttq_bp(200),html,btn,true,true,false,999,"sits_dialog_ttq_cloud",false); //show dialog message   
    $("#sits_dialog_ttq_cloud").data("fixt",fixttq); 
    // handle file upload field
    sits_show("#"+forttq);  // show upload
    var theclone = $("#"+forttq).clone(); //duplicate and amend id
    theclone.attr("id",forttqid+"clone").attr("title",ttq_bp(201));
    $("#ttqfileupload").append(theclone); // add clone
    sits_hide("#"+forttq); // hide original
    sits_tabs("#ttqUploadTabs","");//,true,false); //use new SITS function          
    sits_dialog_resize(90,"sits_dialog_ttq_cloud");
    sits_dialog_update(false,false,"sits_dialog_ttq_cloud");   
  });   
  return; 
}

function ttq_bp(num) {
  num = num - 199;
  return sits_get_bptext(ttqbparray,num);
}  
function ttq_error_box(title,message,tid) {
  if(typeof(tid)=="undefined" || tid=="") {
    tid = "ttq_error_dialog";
  }
  var btn = {}
  btn["OK"] = function() { 
    sits_dialog_close(true,tid); //add "close" button  may want to call from end of other functions 
  }; 
  sits_dialog(title,"<img src=\"../images/cross.gif\" alt=\"ERROR: \" /> "+message,btn,true,true,false,999,tid,true); //show dialog message
}  

function ttqonAuthApiLoad(){   
  var clientID = $("#googledrivejs").attr("data-app-key");
  window.gapi.auth.authorize({
    'client_id': clientID,
    'scope' : ['https://www.googleapis.com/auth/drive.readonly'],
    immediate: false
  },ttqhandleAuthResult);
}

function ttqhandleAuthResult(authResult){
  if ( authResult && !authResult.error){
    gdoauthToken = authResult.access_token;
    //createpicker
    ttqcreatePicker();
  }
}
function ttqloadpicker(){
  if ( sits_gapi_auth_loaded && sits_gapi_picker_loaded ){
    ttqonAuthApiLoad();
  }else{
   // setTimeout(ttqloadpicker,0) 
   //not loaded yet
  }    
  return    
};

function ttqcreatePicker(){
  var picker = new google.picker.PickerBuilder()
    .addView(new google.picker.DocsView())
    .setOAuthToken(gdoauthToken)
    .setCallback(ttqpickerCallback)
    .build();
  picker.setVisible(true);
}  

function ttqpickerCallback(data){
  var url = 'nothing';
  if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) { 
    var doc = data[google.picker.Response.DOCUMENTS][0];
    url = doc[google.picker.Document.URL];
    var fnam = doc[google.picker.Document.NAME];
    var id = doc[google.picker.Document.ID];
    var mime = doc[google.picker.Document.MIME_TYPE];
    // store file information for later
    $("#sits_dialog_ttq_cloud").data("gd-file-link",url).data("gd-fnam",fnam).data("gd-token",""+gdoauthToken+"").data("gd-id",id).data("gd-mime",mime);
    $("#ttqgdchooserfilename").html(fnam);
    $("#ttqgdremover").removeClass("sv-disabled").prop("disabled",false);
  }
}
