 //set global variables
var dest="https://catalog.mainlib.org/PAPIService";
var counter=0;
var framehistory=[];
var framehistory2=[];
var thetally=[];
var page_counter=1;
var extend_id;
var block;
var ext_err_code;
var ext_err_desc;

if(page_counter<1){
page_counter=1;
}

var newtitle_list=0;

var today= new Date();
var today_epoch= today.getTime()-500;

var overdue=false;

var net_status=true;

var storage = window.localStorage;


var rem_pu_loc_id1
var rem_pu_loc_name1

var rem_libcard;
var rem_libpin;
var rem_count;

var pu_loc_id;
var pu_loc_name;

var branch_id;
var branch_name;

var latest_app_version;
var this_app_version='1.4.3';
var dev_platform;

//device ready event and subsequent routines
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
navigator.splashscreen.hide();

//check local storage and prepopulate login information
rem_libcard = window.localStorage.getItem("rem_libcard");
rem_libpin = window.localStorage.getItem("rem_libpin");

rem_pu_loc_id1 = window.localStorage.getItem("rem_pu_loc_id1");
rem_pu_loc_name1 = window.localStorage.getItem("rem_pu_loc_name1");

if (rem_libcard){
		$("#remember").prop('checked', true);
		$("#libcard").val(rem_libcard);
}else{
rem_libcard='';
}

if (rem_libpin){
		$("#remember").prop('checked', true);
		$("#libpin").val(rem_libpin);
}else{
rem_libpin='';
}

if (rem_pu_loc_id1){pu_loc_id=rem_pu_loc_id1;}else{pu_loc_id='';}
if (rem_pu_loc_name1){pu_loc_name=rem_pu_loc_name1;}else{pu_loc_name='';}

//check network connection	
function checkConnection() {
    var networkState = navigator.connection.type;
    var states = {};
	var Connection;
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

	if (networkState == Connection.NONE) {
	net_status=false;
	}
}
checkConnection();	

if(net_status==false){
	$("iframe").each(function() { 
        $(this).replaceWith("<h4 align='center'>This page needs Internet connection.<br>It appears you are offline or the server is currently not available.</h4>");
	});
}

var device;
//enable back button in ios9	
if(device.platform === "iOS" && parseInt(device.version) === 9){
       //$.mobile.hashListeningEnabled = false;
   }

var deviceType = (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : 'NULL';
//if iphone after 5 (large screen)
if(deviceType!='NULL'){
	$('.ui-btn').css({'margin-top':'2px', 'margin-bottom': '2px'}); 
}

var model = device.model;
//if iphone 4 or 5
if(model=='iPhone4,1' || model=='iPhone3,1'){
$('.ui-btn').css({'margin-top':'1px', 'margin-bottom': '1px'}); 
}

if(device.platform == "Android"){dev_platform='A';}
if(device.platform == "iOS"){dev_platform='I';}
if(device.platform == "WinCE" || device.platform === "Win32NT"){dev_platform='W';}

}//end device ready

//function media material conversion
function matconv(val2){
switch(val2){
case 1:	val2="Book"; break;
case 2: val2="Printed or Manuscript Music"; break;
case 3: val2="Cartographic Material"; break; 
case 4:	val2="Visual Materials"; break; 
case 5: val2="Sound Recording"; break; 
case 6:	val2="Electronic Resources"; break; 
case 7:	val2="Archival Mixed Materials"; break; 
case 8:	val2="Serial"; break; 
case 9:	val2="Printed Music"; break; 
case 10: val2="Manuscript Music"; break; 
case 11: val2="Printed Cartographic Material"; break; 
case 12: val2="Manuscript Cartographic Material"; break; 
case 13: val2="Map"; break; 
case 14: val2="Globe"; break; 
case 15: val2="Manuscript Material"; break; 
case 16: val2="Projected Medium"; break; 
case 17: val2="Motion Picture"; break; 
case 18: val2="Video Recording"; break; 
case 19: val2="Two Dimensional Non-projected Graphic"; break; 
case 20: val2="Three Dimensional Object"; break; 
case 21: val2="Musical Sound Recording"; break; 
case 22: val2="Nonmusical Sound Recording"; break; 
case 23: val2="Kit"; break; 
case 24: val2="Periodical"; break; 
case 25: val2="Newspaper"; break; 
case 26: val2="Microform"; break; 
case 27: val2="Large Print"; break; 
case 28: val2="Braille"; break; 
case 33: val2="DVD"; break; 
case 34: val2="Videotape"; break; 
case 35: val2="Music CD"; break; 
case 36: val2="eBook"; break; 
case 37: val2="Audio Book"; break;
case 40: val2="Blue-Ray DVD"; break;
default: val2="other media format"; break;
}
return val2;
}


//case2 - BARCODE SCANNER
function getData(barcode,referer){ 
var p_searchitem;
p_searchitem=barcode;
var thedate=(new Date()).toUTCString();
var reqstring="https://catalog.mainlib.org/PAPIService/REST/public/v1/1033/100/29/search/bibs/keyword/ISBN?q="+p_searchitem+"";
var p_method="GET";

$.ajax({
        type       : "POST",
		url: "http://www.jeffersonlibrary.net/MOPLI/INTERMED_short.php",
        crossDomain: true,
        data: {"uri": ""+reqstring+"", "rdate": ""+thedate+"", "method":""+p_method+""},
		timeout:60000,
		cache: false,
        success : function(response) {
		var p_response;
			//stop_spin();
			var code=response;
			p_response={"code": ""+code+"", "reqstring": ""+reqstring+"", "thedate": ""+thedate+""};
			getit_bc(p_response.code,p_response.reqstring,p_response.thedate,referer);
        },
        error      : function() {
            alert('No network connection or server currently not available.');                  
        }
});
}
//case 2 - get barcode detail
function getit_bc(code,reqstring,thedate,referer){
//if(referer=='nyt'){
//$.mobile.changePage("#bib_detail");
//}
var detlist_html='';
var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}

$.ajax(settings).done(function (response) {

var selection= ['Title', 'Author', 'PublicationDate', 'Description', 'ISBN', 'PrimaryTypeOfMaterial', 'LocalItemsTotal', 'LocalItemsIn', 'SystemItemsTotal','CurrentHoldRequests', 'Summary'];
$( "#bcode" ).empty();
$( "#bdetail" ).empty();

var detlist_html='';
  
$.each(response.BibSearchRows, function(key, value) {
var cont_no=value.ControlNumber;
var media=value.PrimaryTypeOfMaterial;
var ISBN=value.ISBN;

switch(media){
	case 35: detlist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/cd_icon.png" /></td ><td class="txtbox">'; break;
	case 40: detlist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/blueray_icon.png" /></td ><td class="txtbox">'; break;
	case 33: detlist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/dvd_icon.png" /></td ><td class="txtbox">'; break;
	default: if(ISBN==''){
		detlist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/Jacket.jpg" /></td ><td class="txtbox">';
	} else{
detlist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=S&Value='+ISBN+'&userID=MAIN37789&password=CC10073" /></td ><td class="txtbox">';
}
}

$.each(value, function(key2, value2) {
	
	if(jQuery.inArray( key2, selection )!== -1){
		switch(key2){
			case "PublicationDate":
			key2="Publication Date";
			break;
			case "LocalItemsTotal":
			key2="Local Items Total";
			break;
			case "LocalItemsIn":
			key2="Local Items In";
			break;
			case "CurrentHoldRequests":
			key2="Current Hold Requests";
			break;
			case "SystemItemsTotal":
			key2="System Items Total";
			break;
			case "PrimaryTypeOfMaterial":
			key2="Media Type";
			value2=matconv(value2);
			break;
		}
	detlist_html += key2 + ": " + value2 + "<br>";
	}

});
detlist_html +="<p class='hold_req'><a id=" + cont_no + " href='#login' data-role='button' data-inline='true' data-mini='true' data-icon='arrow-r' data-theme='a'>Put on Hold</a></p>";
detlist_html +="</td></tr></table>";
});
 
//if(referer=='nyt'){
//$( "#bdetail" ).append(detlist_html);
//} else{
$( "#bcode" ).append(detlist_html);
//}

$('.hold_req a').button();
});
}

$(document).ready(function(){

//delete large cover picture when leaving the detail section
$(window).on("navigate", function (event, data) {
  var direction = data.state.direction;
  if (direction == 'back') {
   $('.pic_large').empty();
	$( "#bdetail" ).empty(); 
  }
  if (direction == 'forward') {
    return
  }
});


// pages to open in app browser
$('#events_main').on('pageshow', function () {
$("#the_latest_frame3").attr("src", "http://jeffersonlibrary.net/Events");
});


//google map
var map;
    $(document).on("pageshow", "#direction", function () {
var GMaps;
      map = new GMaps({
        div: '#map_canvas',
        lat: 41.0205399,
        lng: -74.5490396,
		width: '100%',
        height: '450px',
		zoom: 15,
        zoomControl: true,
        zoomControlOpt: {
            style: 'SMALL',
            position: 'TOP_LEFT'
        },
        panControl: false
      });

map.addMarker({
        lat: 41.0205399,
        lng: -74.5490396,
        title: 'JTPL',
        infoWindow: {
          content: '<p>Jefferson Township Public Library, 1031 Weldon Road, Oak Ridge, NJ 07438</p>'
        }
      });
});

//navigator
$('#dir_start').on ("tap", function () {
//start_spin();									   
launchnavigator.navigate(
  [41.0204913,-74.5491630],
  null,
  function(){
    //alert("Plugin success");
  },
  function(error){
    alert("Plugin error: "+ error);
  },
  {
    preferGoogleMaps: true,
    enableDebug: true,
    disableAutoGeolocation: true
});
});

//busy spinner
function start_spin(){
window.plugins.spinnerDialog.show();
}
function stop_spin(){
window.plugins.spinnerDialog.hide();
}

//clear searchfield
$(document).on("pagecreate", function () {
  $(".ui-input-clear").on("click", function() {
    counter=0;
  });
});

//Clean the hidden hold field upon entering main account page
$('#main_login').on('click', function () {
$('#cn_holdreq').val("");								   
});

//Home Button workaround for rem_cred to work with IOS 9 
$('.home').on('click', function () {
var rem_cred=$('#remember').is(':checked'); 
if (rem_cred){null}else{$("#libcard").val('');$("#libpin").val('');$('#cn_holdreq').val('');}
self.location.href = '#pageone';
});

//enhance the remember login credentials button with z-index for ios 9
$('#remember').css({"z-index":"20"});

//alternate selection in account logon collapsibles
$('#borrowed_box').on( "collapsibleexpand", function() {
$('#hold_box').collapsible( "collapse" );
$('#fees_box').collapsible( "collapse" );
});
$('#hold_box').on( "collapsibleexpand", function() {
$('#borrowed_box').collapsible( "collapse" );
$('#fees_box').collapsible( "collapse" );
});
$('#fees_box').on( "collapsibleexpand", function() {
$('#borrowed_box').collapsible( "collapse" );
$('#hold_box').collapsible( "collapse" );
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ENCRYPTION/VALIDATION
function p_validate(p_query, p_searchitem, p_pwd, p_cn, p_bc, p_method, p_type, p_holdID, p_i){
if(p_pwd ==='undefined') p_pwd ='';
if(p_cn ==='undefined') p_cn ='';
if(p_bc ==='undefined') p_bc ='';
if(p_type ==='undefined') p_type ='';
if(p_holdID ==='undefined') p_holdID ='';
if(p_searchitem ==='undefined') p_searchitem ='';
if(p_i ==='undefined') p_i ='';

var reqstring;

switch(p_query){
case 1:	reqstring=""+dest+"/REST/public/v1/1033/100/1/search/bibs/keyword/KW?q="+p_searchitem+"&bibsperpage=20&page="+p_holdID+""; break;
case 2: reqstring=""+dest+"/REST/public/v1/1033/100/1/search/bibs/keyword/ISBN?q="+p_searchitem+""; break;
case 3: reqstring=""+dest+"/REST/public/v1/1033/100/1/search/bibs/keyword/CN?q="+p_searchitem+""; break;
case 4: reqstring=""+dest+"/REST/public/v1/1033/100/1/search/bibs/boolean?q=CN=%7Blist%7D"+p_searchitem+"%7B/list%7D+sortby+PD/sort.descending&bibsperpage=40&page="+p_holdID+""; break;
case 5: reqstring=""+dest+"/REST/public/v1/1033/100/1/patron/"+p_bc+""; break;
case 6: reqstring=""+dest+"/REST/public/v1/1033/100/1/holdrequest"; break;
case 7: reqstring=""+dest+"/REST/public/v1/1033/100/1/patron/"+p_bc+"/holdrequests/"+p_holdID+"/cancelled?wsid=1&userid=1"; break;
case 8: reqstring=""+dest+"/REST/public/v1/1033/100/1/patron/"+p_bc+"/holdrequests/all"; break;
case 9: reqstring=""+dest+"/REST/public/v1/1033/100/1/patron/"+p_bc+"/itemsout/all"; break;
case 10: reqstring=""+dest+"/REST/public/v1/1033/100/1/patron/"+p_bc+"/itemsout/overdue"; break;
case 11: reqstring=""+dest+"/REST/public/v1/1033/100/1/patron/"+p_bc+"/itemsout/"+p_holdID+""; break;
case 12: reqstring=""+dest+"/REST/public/v1/1033/100/1/search/bibs/boolean?q=COL=7+sortby+MP/sort.descending&page="+p_holdID+"";break;
case 13: reqstring=""+dest+"/REST/public/v1/1033/100/1/search/bibs/keyword/ISBN?q="+p_searchitem+""; break;
case 14: reqstring=""+dest+"/REST/public/v1/1033/100/1/patron/"+p_bc+"/account/outstanding"; break;
case 15: reqstring=""+dest+"/REST/public/v1/1033/100/1/organizations/branch"; break;
case 16: reqstring=""+dest+"/REST/public/v1/1033/100/1/patron/"+p_bc+"/basicdata"; break;
case 17: reqstring=""+dest+"/REST/public/v1/1033/100/1/patron/"+p_bc+"/itemsout/all"; break;
}

var thedate=(new Date()).toUTCString();
if(p_searchitem){
	//start_spin();
}
$.ajax({
        type: "POST",
		async: true,
		url: "http://www.jeffersonlibrary.net/MOPLI/INTERMED_short.php",
        crossDomain: true,
        data: {"uri": ""+reqstring+"", "rdate": ""+thedate+"", "method":""+p_method+"", "patron_pin":""+p_pwd+"", "version":""+this_app_version+""},
		timeout:60000,
		cache: false,
        success : function(response) {
			//alert('ajax seems to work line 438');
			if(p_i!==''){
			var array_i = [];
			array_i.push(p_i);
			var largest = Math.max.apply(Math, array_i);
			if(p_i<largest){
			return false;
			}else{distribution();
			}}else{distribution();}
			function distribution(){
			//stop_spin();
			var code=response;
			var p_response={"code": ""+code+"", "reqstring": ""+reqstring+"", "thedate": ""+thedate+""};
			switch(p_query){
			case 1:	get_books(p_response.code,p_response.reqstring,p_response.thedate,p_i); break;
			case 2: getit_bc(p_response.code,p_response.reqstring,p_response.thedate); break;
			case 3: get_detail(p_response.code,p_response.reqstring,p_response.thedate); break;
			case 4: get_news(p_response.code,p_response.reqstring,p_response.thedate); break;
			case 5: checklogin(p_response.code,p_response.reqstring,p_response.thedate,p_type,p_cn); break;
			case 6: createhold(p_holdID,p_cn,p_response.code,p_response.reqstring,p_response.thedate,p_bc); break;
			case 7: cancelhold(reqstring,thedate,code); break;
			case 8: getholds(reqstring,thedate,code); break;
			case 9: items_out_all(reqstring,thedate,code); break;
			//case 10: items_out_over(reqstring,thedate,code); break;
			case 11: item_renew(reqstring,thedate,code,p_bc); break;
			case 12: most_popular(code,reqstring,thedate); break;
			case 13: get_det_nyt(p_response.code,p_response.reqstring,p_response.thedate); break;
			case 14: fees_outstanding(reqstring,thedate,code); break;
			case 15: lib_branches(reqstring,thedate,code); break;
			//case 16: pat_basics(reqstring,thedate,code); break;
			case 17: items_out_all2(reqstring,thedate,code,p_holdID); break;
}
}},
        error: function() {
            alert('No network connection or server currently not available.');                  
        }
});
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//case 1 - book search reqstring (get encryption data)
//reset counter if filed gets cleared
$(".ui-input-clear").on("click", function () {counter=0;});
var typingTimer;                //timer identifier
var doneTypingInterval = 600;  //time in ms, 5 second for example
var gen_words=['the ', 'The ', 'for ', 'For ', 'how ', 'How '];
$('#search_item').on('keyup',function () {
counter +=1;
  var searchitem=0;
  var trigger=$('#search_item').val();
	if($('#search_item').val()==''){counter=0;}
	if(counter>3){
	if(jQuery.inArray(trigger, gen_words )== -1){
	clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
	}
	}
});

function doneTyping () {
   window.p_validate=function(){return false;};
   window.get_books=function(){return false;};
   var searchitem= $('#search_item').val();
   var p_searchitem=searchitem.replace(/\s+/g,"+");
	$('#most_popular').empty();
	page_counter=1;
	var i=counter;
	p_validate(1,''+p_searchitem+'','','','','GET','',1,''+i+'');
}

//case 1 - get books
function get_books(code,reqstring,thedate,thei){
//alert('get books started');
var array = [];
array.push(thei);
var largest = Math.max.apply(Math, array);
if(thei<largest){
	return false;
}else{

$('#selection').collapsible( "collapse" );
var blist_html='';
var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}
//alert('ajax to start: ' +thedate);
$.ajax(settings).done(function (response) {
var selection= ['Title', 'Author', 'PublicationDate', 'PrimaryTypeOfMaterial'];

$( "#most_popular" ).empty();
$( "#news" ).empty();
$( "#blist" ).empty();
$( "#news_dvd" ).empty();
$( "#nyt" ).empty();

var blist_html='';
var next_batch='';
//alert('ajax done');
$.each(response.BibSearchRows, function(key, value) {
var cont_no=value.ControlNumber;
var media=value.PrimaryTypeOfMaterial;
var ISBN=value.ISBN;

switch(media){
	case 35: blist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/cd_icon.png" /></td ><td class="txtbox">'; break;
	case 40: blist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/blueray_icon.png" /></td ><td class="txtbox">'; break;
	case 33: blist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/dvd_icon.png" /></td ><td class="txtbox">'; break;
	default: if(ISBN==''){
		blist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/Jacket.jpg" /></td ><td class="txtbox">';
	} else{
		blist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=S&Value='+ISBN+'&userID=MAIN37789&password=CC10073" /></td ><td class="txtbox">';}
}

$.each(value, function(key2, value2) {
	
	if(jQuery.inArray( key2, selection )!== -1){
		
	switch(key2){
		case "PublicationDate":
		key2="Publication Date";
		break;
		case "PrimaryTypeOfMaterial":
		key2="Media Type";
		value2=matconv(value2);
		break;
	}
	
	blist_html += "<strong>" + key2 + "</strong>: " + value2 + "<br>";
	}

});
blist_html +="<p class='trail'><a id=" + cont_no + " href='#bib_detail' data-role='button' data-inline='true' data-mini='true' data-icon='arrow-r' data-theme='a'>Detail</a></p>";
blist_html +="</td></tr></table>";

$('.trail a[data-role=button]').button();
$('.trail a').button('refresh');
});

$( "#blist" ).append(blist_html);
$('.trail a').button();
$('html,body,#blist').animate({ scrollTop: 0 }, "fast");

if(page_counter==1){
next_batch +="<a href='#' id='fwd_btn' class='ui-btn ui-corner-all ui-icon-cloud ui-btn-icon-left'>...next 20 results</a>";
$( "#blist" ).append(next_batch);
}
if(page_counter>1){
next_batch +="<div data-role='controlgroup' data-type='horizontal' data-mini='true'><a href='#' id='rev_btn' class='ui-btn ui-corner-all ui-icon-carat-l ui-btn-icon-left'>show last 20</a><a href='#' id='fwd_btn' class='ui-btn ui-corner-all ui-icon-carat-r ui-btn-icon-left'>show next 20</a></div>";
$( "#blist" ).append(next_batch);
}
});
}//the if largest
}
//create the "next"/"previous" batch search buttons
//next batch general book search
$(document).on('click', '#fwd_btn', function () {
page_counter=page_counter+1;
next_search(page_counter);
});
$(document).on('click', '#rev_btn', function () {
page_counter=page_counter-1;
next_search(page_counter);
});

function next_search(next_page){
var searchitem= $('#search_item').val();
var p_searchitem=searchitem.replace(/\s+/g,"+");
	p_validate(1,''+p_searchitem+'','','','','GET','',''+next_page+'','');
}
//next batch most popular button
$(document).on('click', '#fwd_btn_mp', function () {
page_counter=page_counter+1;
next_mp_search(page_counter);
});
$(document).on('click', '#rev_btn_mp', function () {
page_counter=page_counter-1;
next_mp_search(page_counter);
});

function next_mp_search(next_page){
	p_validate(12,'','','','','GET','',''+next_page+'','');
}
//next batch new books and dvds
$(document).on('click', '#fwd_btn_news', function () {
page_counter=page_counter+1;
next_news_search(page_counter);
});
$(document).on('click', '#rev_btn_news', function () {
page_counter=page_counter-1;
next_news_search(page_counter);
});

function next_news_search(next_page){
var searchitem= newtitle_list;
p_validate(4,''+searchitem+'','','','','GET','',''+next_page+'','');
}

//case 3 - get book detail (get encryption data)
$(document).on('click', '.trail a', function () {
var p_searchitem=$(this).attr("id");
p_validate(3,''+p_searchitem+'','','','','GET','','','');
});
//case 3 - get detail
function get_detail(code,reqstring,thedate){
$('.pic_large').empty();
$( "#bdetail" ).empty();

var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}

$.ajax(settings).done(function (response) {

var selection= ['Title', 'Author', 'PublicationDate', 'Description', 'ISBN', 'PrimaryTypeOfMaterial', 'LocalItemsTotal', 'LocalItemsIn', 'SystemItemsTotal', 'CurrentHoldRequests', 'Summary', 'CallNumber', 'Contents'];

var detlist_html='';
var pic_large='';
//$('.pic_large').css({"opacity":"0"});

$.each(response.BibSearchRows, function(key, value) {
var cont_no=value.ControlNumber;
var media=value.PrimaryTypeOfMaterial;
var ISBN=value.ISBN;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var UPC=value.UPC;
var cover_no;
if(ISBN){cover_no=ISBN;}else{cover_no=UPC;}
if(UPC!=''){
selection= ['Title', 'Author', 'PublicationDate', 'Description', 'PrimaryTypeOfMaterial', 'LocalItemsTotal', 'LocalItemsIn', 'SystemItemsTotal', 'CurrentHoldRequests', 'Summary','CallNumber', 'Contents'];
}

if(cover_no==''){
var np_list_html='';
switch(media){
	case 35: np_list_html +='<table class="bibtbl"><tr><td class="picbox_dtl"><img src="img/cd_icon.png" /></td ><td class="txtbox">'; break;
	case 40: np_list_html +='<table class="bibtbl"><tr><td class="picbox_dtl"><img src="img/blueray_icon.png" /></td ><td class="txtbox">'; break;
	case 33: np_list_html +='<table class="bibtbl"><tr><td class="picbox_dtl"><img src="img/dvd_icon.png" /></td ><td class="txtbox">'; break;
	default: np_list_html +='<table class="bibtbl"><tr><td class="picbox_dtl"><img src="img/book_icon.png" /></td ><td class="txtbox">'; break;
}
}else{	
detlist_html +='<table class="bibtbl"><tr><td class="picbox_dtl"><img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=S&Value='+cover_no+'&userID=MAIN37789&password=CC10073" /><br /><img src="img/magglass.png" /></td><td class="txtbox">';
pic_large +='<img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=M&Value='+cover_no+'&userID=MAIN37789&password=CC10073" />';
}



$.each(value, function(key2, value2) {
	
	if(jQuery.inArray( key2, selection )!== -1){
		switch(key2){
			case "PublicationDate":
			key2="Publication Date";
			break;
			case "LocalItemsTotal":
			key2="Local Items Total";
			break;
			case "LocalItemsIn":
			key2="Local Items In";
			break;
			case "SystemItemsTotal":
			key2="System Items Total";
			break;
			case "CallNumber":
			key2="Call Number";
			break;
			case "CurrentHoldRequests":
			key2="Current Hold Requests";
			break;
			case "PrimaryTypeOfMaterial":
			key2="Media Type";
			value2=matconv(value2);
			break;
		}
	detlist_html += "<strong>" + key2 + "</strong>: " + value2 + "<br>";
	}

});
detlist_html +="<p class='hold_req'><a id=" + cont_no + " href='#login' data-role='button' data-inline='true' data-mini='true' data-icon='arrow-r' data-theme='a'>Put on Hold</a></p>";
detlist_html +="</td></tr></table>";
});
 
$( "#bdetail" ).append(detlist_html);
$('.hold_req a').button();

$(".picbox_dtl").on("tap",function(){
	if(pic_large){
		if($('.pic_large img').length){
			$("html, body").animate({ scrollTop: 0 }, "slow");
			$('.pic_large').empty();
		}else{
			$('.pic_large').append(pic_large);
			$('.pic_large').fadeIn();
			setTimeout(function(){
			$('html, body').animate({
			scrollTop: $(document).height()}, 
			700, "swing");
			},150);
		}
	}
});//end tap function
//erase large pic and scroll back to top on tap
$(".pic_large").on("tap",function(){
$("html, body").animate({ scrollTop: 0 }, "slow");
$('.pic_large').fadeOut(500, function() {
    $(this).empty();
});
});

});//end ajax?
}//end get_detail function

//case 4 - get new publications - book & dvd  (encrypt)
$(document).on('click', '#nb_btn', function () {
page_counter=1;										 
$('#selection').collapsible( "collapse" );
$( "#most_popular" ).empty();
$( "#news" ).empty();
$( "#blist" ).empty();
$( "#news_dvd" ).empty();
$( "#nyt" ).empty();

$.ajax({
        type: "GET",
		async: true,
		url: "http://www.jeffersonlibrary.net/MOPLI/newbook.php",
        crossDomain: true,
        success : function(response) {
			newtitle_list=response;
			//var new_qty=response.split(',').length;
			p_validate(4,''+response+'','','','','GET','',1,'');
			start_spin();
        },
        error: function() {
            alert('No network connection or server currently not available.');                  
        }
});
});

$(document).on('click', '#ndvd_btn', function () {
page_counter=1;	
$('#selection').collapsible( "collapse" );
$('#blist').empty();
$('#most_popular').empty();
$('#news').empty();
$.ajax({
        type: "GET",
		async: true,
		url: "http://www.jeffersonlibrary.net/MOPLI/newdvd.php",
        crossDomain: true,
        success : function(response) {
			newtitle_list=response;
			p_validate(4,''+response+'','','','','GET','',1,'');
			start_spin();
        },
        error      : function() {
            alert('No network connection or server currently not available.');                  
        }
});
});

//case 4 - get news list - book and dvd
function get_news(code,reqstring,thedate){
var np_list_html='';
var next_batch_news='';

var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}

$.ajax(settings).done(function (response) {
//alert('line 833 executed');
var selection= ['Title', 'Author', 'PublicationDate', 'Description', 'PrimaryTypeOfMaterial'];
$( "#news" ).empty();
var np_list_html='';
var next_batch_news='';

//alert(response);

$.each(response.BibSearchRows, function(key, value) {

var cont_no=value.ControlNumber;
var media=value.PrimaryTypeOfMaterial;
var ISBN=value.ISBN;
var UPC=value.UPC;
var cover_no;
//alert(cont_no);

if(ISBN){cover_no=ISBN;}else{cover_no=UPC;}

if(UPC!=''){
selection= ['Title', 'PublicationDate', 'Description', 'PrimaryTypeOfMaterial'];
}

if(cover_no==''){
switch(media){
	case 35: np_list_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/cd_icon.png" /></td ><td class="txtbox">'; break;
	case 40: np_list_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/blueray_icon.png" /></td ><td class="txtbox">'; break;
	case 33: np_list_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/dvd_icon.png" /></td ><td class="txtbox">'; break;
	default: np_list_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/book_icon.png" /></td ><td class="txtbox">'; break;
}
}else{	
np_list_html +='<table class="bibtbl"><tr><td class="picbox"><img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=S&Value='+cover_no+'&userID=MAIN37789&password=CC10073" /></td ><td class="txtbox">';
}

$.each(value, function(key2, value2) {
	
	if(jQuery.inArray( key2, selection )!== -1){
	switch(key2){
		case "PublicationDate":
		key2="Publication Date";
		break;
		case "PrimaryTypeOfMaterial":
		key2="Media Type";
		value2=matconv(value2);
		break;
	}
	np_list_html += key2 + ": " + value2 + "<br>";
	}

});
np_list_html +="<p class='trail'><a id=" + cont_no + " href='#bib_detail' data-role='button' data-inline='true' data-mini='true' data-icon='arrow-r' data-theme='a'>Detail</a></p>";
np_list_html +="</td></tr></table>";

$('.trail a[data-role=button]').button();
$('.trail a').button('refresh');

});
$( "#news" ).append(np_list_html);
$('.trail a').button();
$('html,body,#news').animate({ scrollTop: 0 }, "fast");
//$('html,body,#news').scrollTop(0);
stop_spin();
//determine qty of new titles in total
var qty_new=newtitle_list.split(',').length;
//calculate number of pages
var pagecount=qty_new/40;

if(page_counter==1){
next_batch_news +="<a href='#' id='fwd_btn_news' class='ui-btn ui-corner-all ui-icon-cloud ui-btn-icon-left'>...next 40 results</a>";
$( "#news" ).append(next_batch_news);
}
if(page_counter>1 && page_counter<pagecount+1){
next_batch_news +="<div data-role='controlgroup' data-type='horizontal' data-mini='true'><a href='#' id='rev_btn_news' class='ui-btn ui-corner-all ui-icon-carat-l ui-btn-icon-left'>show last 40</a><a href='#' id='fwd_btn_news' class='ui-btn ui-corner-all ui-icon-carat-r ui-btn-icon-left'>show next 40</a></div>";
$( "#news" ).append(next_batch_news);
}
if(page_counter>pagecount){
next_batch_news +="<a href='#' id='rev_btn_news' class='ui-btn ui-corner-all ui-icon-carat-l ui-btn-icon-left'>show last 40</a>";
$( "#news" ).append(next_batch_news);
}
});
}

// fct 15 populate the branches
function lib_branches(reqstring,thedate,code){
var pu_loc_list='';
pu_loc_list +='<label class="select">Pickup Location:<select name="pu_loc" id="pu_loc">';
//if stored variable for pickup location ->select the location id and name
if(pu_loc_id){
pu_loc_list +='<option value='+pu_loc_id+'>'+pu_loc_name+'</option>';
}else{
//if there is no stored pickup variable make patron pick one
pu_loc_list +='<option value=0>Choose a pickup location...</option>';
}

var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}
$.ajax(settings).done(function (response) {
	//alert(JSON.stringify(response));
$.each(response.OrganizationsGetRows, function(key, value) {
if(value.OrganizationCodeID==3 && value.OrganizationID != 42 ){
var org_id=value.OrganizationID;
var org_name=value.DisplayName;
pu_loc_list +='<option value='+org_id+'>'+org_name+'</option>';
}
});//end each
pu_loc_list +='</select></label>'; 
$(pu_loc_list).appendTo( '#pu_loc_cont').enhanceWithin();
});//end ajax
}//funtion lib_branches

//case 5 - Hold Request and/or LOGIN (get encryption)
$(document).on('click', '.hold_req a', function () {

var rem_loc_box='';

rem_count=$("#rem_pu_loc").length;
	//alert("rem_count is" +rem_count);
if (rem_count==0) {
///////////////////////
if (rem_pu_loc_id1){
rem_loc_box +='<label for="rem_pu_loc"><input type="checkbox" name="rem_pu_loc" id="rem_pu_loc" value="yes" checked />Remember pickup location</label>';
}else{
rem_loc_box +='<label for="rem_pu_loc"><input type="checkbox" name="rem_pu_loc" id="rem_pu_loc" value="yes" />Remember pickup location</label>';
}
$(rem_loc_box).appendTo( '#pu_loc_box').enhanceWithin();
$('#rem_pu_loc').css({"z-index":"20"}).enhanceWithin();
////////////////////////
p_validate(15,'','','','','GET','','','');//next: lib_branches
}

var cont_num;
cont_num=$(this).attr("id");
$('#cn_holdreq').val(cont_num);

});//on click hold_req_a

//Login
$('#loginsubmit').on ("click", function () {
var hold;
//store login credentials if checkbox is checked
var rem_cred=$('#remember').is(':checked'); 
  if(rem_cred==true){
  rem_libcard=$('#libcard').val();
  rem_libpin=$('#libpin').val();
  window.localStorage.setItem("rem_libcard",""+rem_libcard+"");  
  window.localStorage.setItem("rem_libpin",""+rem_libpin+"");
  }
  else{
  window.localStorage.removeItem('rem_libcard');
  window.localStorage.removeItem('rem_libpin');
  }
//if the selector is there
if( $('#pu_loc').length ){
	var pickup_loc_id=$("#pu_loc option:selected").val();
	var pickup_loc_name=$("#pu_loc option:selected" ).text();
	if( pickup_loc_id>0){
		pu_loc_id=pickup_loc_id;
		pu_loc_name=pickup_loc_name;
		//if it should be stored
		var rem_pu_loc=$('#rem_pu_loc').is(':checked'); 
		if(rem_pu_loc==true){
		window.localStorage.setItem("rem_pu_loc_id1",""+pu_loc_id+"");  
		window.localStorage.setItem("rem_pu_loc_name1",""+pu_loc_name+"");  
		}
		else{
		window.localStorage.removeItem("rem_pu_loc_id1",""+pu_loc_id+"");  
		window.localStorage.removeItem("rem_pu_loc_name1",""+pu_loc_name+"");
		}
	}
	else{
	alert('you need to set a pickup location');
	return false;
	}
}
var cont_num;

if($('#cn_holdreq').val()){hold=true;cont_num=$('#cn_holdreq').val();}else{	hold=false;cont_num='';}
var p_barcode=$("#libcard").val();
var p_pin=$("#libpin").val();
p_validate(5,'',''+p_pin+'',''+cont_num+'',''+p_barcode+'','GET',''+hold+'','','');
});
//case 5 - check login with indicator for hold or no hold (-> to putonhold or prepgetholds)
function checklogin(code,reqstring,thedate,hold,p_cn){
var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}
$.ajax(settings).done(function (response) {
var res_pat_id=response.PatronID;
var pat_barcode=response.PatronBarcode;
var valid_pat=response.ValidPatron;
branch_id=response.AssignedBranchID;
branch_name=response.AssignedBranchName;
//alert(''+pat_barcode+'');
if(valid_pat==true){
	if(hold=='true'){
	putonhold(res_pat_id, pat_barcode,p_cn);
	$('#cn_holdreq').val("");
	}else{
	prep_getholds(pat_barcode);
	}
	$('#patron_bc').val(pat_barcode);
} else{
alert('Login information not valid. Please try again');
}
//end ajax
}).fail(function() {
	alert ('Your login failed. Please try again');
});
//end checklogin
}

//case 6 - function putonhold (get encryption)
function putonhold(res_pat_id,pat_barcode,p_cn){
p_validate(6,'','',''+p_cn+'',''+pat_barcode+'','POST','',''+res_pat_id+'','');
}
//case 6 - function createhold & -> 8 prep getholds
function createhold(res_pat_id,cont_num,code,reqstring,thedate,pat_barcode){
	
var d = new Date();
var str_time = d.toISOString();

if(pu_loc_id){
var pickup_location=pu_loc_id;
var pickup_lib_name=pu_loc_name;
}else{
pickup_location=branch_id;
pickup_lib_name=branch_name;
}
//alert('res_pat_id:'+ res_pat_id + 'cont_num:'+ cont_num + 'pickup_location:' + pickup_location + 'str_time:'+ str_time + 'branch_id:'+ branch_id);

var settings = {
  "dataType": "XML",
  "url": ""+reqstring+"",
  "method": "POST",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"",
    "content-type": "application/xml"
  },
  "processData": false,
  
  "data": '<HoldRequestCreateData><PatronID>'+res_pat_id+'</PatronID><BibID>'+cont_num+'</BibID><ItemBarcode/><VolumeNumber/><Designation/><PickupOrgID>'+pickup_location+'</PickupOrgID><PatronNotes/><ActivationDate>'+str_time+'</ActivationDate><WorkstationID>1</WorkstationID><UserID>1</UserID><RequestingOrgID>'+branch_id+'</RequestingOrgID><TargetGUID></TargetGUID></HoldRequestCreateData>'
}

$.ajax(settings).done(function (response) {
var h_cont=false;
//parse the xml object
var the_status = response.getElementsByTagName("StatusType")[0].childNodes[0].nodeValue;
var the_value = response.getElementsByTagName("StatusValue")[0].childNodes[0].nodeValue;
var the_pos = response.getElementsByTagName("QueuePosition")[0].childNodes[0].nodeValue;
var the_queue = response.getElementsByTagName("QueueTotal")[0].childNodes[0].nodeValue;
var the_message = response.getElementsByTagName("Message")[0].childNodes[0].nodeValue;
the_message = the_message.replace(/<br\s*[\/]?>/gi, "\n");

	
	//alert ('status id:' + the_status + 'the_value:' + the_value + 'the_message:' + the_message);
//Status type
//1 - Error
//2 - Answer
//3 - Conditional

	if(the_status==1){
		h_cont=false;
			$.jAlert({
				'type': 'modal',
				'title': 'Error',
				'content': 'Hold can not be processed at this time',
				'theme': 'blue'
			});
		//alert('Can not process.\n'+the_message+'.');
		
	}
	if(the_status==2){
		h_cont=true;
		if(the_value==1){
			$.jAlert({
				'type': 'modal',
				'title': 'Hold Confirmation',
				'content': ''+the_message+'<br />You are #'+the_pos+' in the waiting queue of '+the_queue+'.<br />Pickup Library will be '+pickup_lib_name+'.',
				'theme': 'blue',
				'onClose':function(){ 
				prep_getholds (pat_barcode);
				return false; }
			});
		}else{
			$.jAlert({
				'type': 'modal',
				'title': 'Hold Confirmation',
				'content': ''+the_message+'',
				'theme': 'blue',
				'onClose':function(){ 
				prep_getholds (pat_barcode);
				return false; }
			});
		}
	}
	if(the_status==3){
			$.jAlert({
				'type': 'confirm',
				'title': 'Hold Request',
				'content': ''+the_message+'',
				'theme': 'blue',
				'onConfirm': 
				function(){
				prep_getholds (pat_barcode);
				return false;}
			});
	}

}).fail(function() {
	alert ('Sorry, your hold request failed.');
});
}

var hold_id;

//case 7 - Cancel Hold - take hold id, validate patron and -> cancelhold
$(document).on('click', '.hold_cancel a', function () {
hold_id=$(this).attr("id");	
});

//modal dialog
$("#cancel_hold_conf").on('click', function(){
var p_barcode=$("#patron_bc").val();
var p_pin=$("#libpin").val();
$( "#loginresponse" ).empty();
p_validate(7,'',''+p_pin+'','',''+p_barcode+'','PUT','',''+hold_id+'','');
});
//case 7 - cancelhold and -> prep_getholds
function cancelhold(reqstring, thedate, code){

var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "PUT",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}
$.ajax(settings).done(function (response) {
var cancel_confirm=response.PAPIErrorCode;
//if error code =0
if(cancel_confirm==0){
var pwd=$('#libpin').val();
var pat_barcode=$("#patron_bc").val();
p_validate(8,'',''+pwd+'','',''+pat_barcode+'','GET','','','');
}else{
alert('your hold cancel request failed');
}
//end ajax
});
//end cancelhold
}

//case 8 - prep_getholds and -> 8 getholds, 9 items out all, 14 fees due
function prep_getholds(pat_barcode){
var pwd=$('#libpin').val();
$('#fee_est_list').empty();
p_validate(8,'',''+pwd+'','',''+pat_barcode+'','GET','','','');
p_validate(9,'',''+pwd+'','',''+pat_barcode+'','GET','','','');
p_validate(14,'',''+pwd+'','',''+pat_barcode+'','GET','','','');
}
//case 8 getholds (list)
function getholds(reqstring,thedate,code){	
$.mobile.changePage("#inside");
////var response='';	
var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}

$.ajax(settings).done(function (response) {
//alert(JSON.stringify(response));
response=JSON.stringify(response);
response= jQuery.parseJSON(response);


var hold_selection= ['Title', 'Author', 'StatusDescription', 'FormatDescription', 'PickupBranchName'];
//var hold_selection= ['Title', 'Author', 'StatusDescription', 'FormatDescription', 'PickupBranchName', 'QueuePosition'];

$( "#loginresponse" ).empty();

////sort by value.StatusID
response=response.PatronHoldRequestsGetRows;
response.sort(function(a, b){
return b.StatusID - a.StatusID;
});  

var my_holds='';

$.each(response, function(key, value) {

if(value.StatusDescription!="Cancelled"){

var media=value.FormatID;
switch(media){
	case 35: my_holds +='<table class="bibtbl"><tr><td class="picbox"><img src="img/cd_icon.png" /></td ><td class="txtbox">'; break;
	case 40: my_holds +='<table class="bibtbl"><tr><td class="picbox"><img src="img/blueray_icon.png" /></td ><td class="txtbox">'; break;
	case 33: my_holds +='<table class="bibtbl"><tr><td class="picbox"><img src="img/dvd_icon.png" /></td ><td class="txtbox">'; break;
	default: my_holds +='<table class="bibtbl"><tr><td class="picbox"><img src="img/book_icon.png" /></td ><td class="txtbox">'; break;
}
//check if item is in an change gradient of textbox
var is_in=value.StatusID;
if(is_in >= 6){
my_holds +="<div class='p_alert'>Please Pick-up</div>";
}
		$.each(value, function(key2, value2) {
				if(key2=="HoldRequestID"){
				var hold_req_id=value2;
				}				   
				if(value2!=''){
                  if(jQuery.inArray( key2, hold_selection )!== -1){
				
                    switch(key2){
                    case "StatusDescription":
                    key2="Status";
                    break;
                    case "PickupBranchName":
                    key2="Pickup Library";
                    break;
                    case "FormatDescription":
                    key2="Media Type";
                    break;
                    //case "QueuePosition":
                    //key2="Queue Position";
                    //break;
                    }
                      if(key2=="Title"){
                      my_holds += "<strong>" + key2 + ": " + value2 + "</strong><br>";
                      }else{
                      my_holds += key2 + ": " + value2 + "<br>";
                      }
				}
				}
		});

my_holds +="<p class='hold_cancel'><a id=" + hold_req_id + " href='#popupDialog_cancelhold' data-rel='popup' data-position-to='window' data-transition='pop' class='ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-delete ui-btn-icon-left ui-btn-b'>Cancel Hold...</a></p>";

my_holds +="</td></tr></table>";
}//end screen out cancelled
});
								
$( "#loginresponse" ).append(my_holds);

});//end ajax 
}//end getholds function

//CHECK IF INDIVIDUAL COPY IS ON HOLD SOMEWHERE (to be added)/////////////
//////////////////////////////////////////////////////////////////////////
//CHECK if total of holds exceeds total of currenlty available copies
//case 9b hold_all_sys
function hold_all_sys(bib_id, bib_bc,cnt,pwd,pat_barcode){
var reqstring=""+dest+"/REST/public/v1/1033/100/29/search/bibs/keyword/cn?q="+bib_id+"";
var thedate=(new Date()).toUTCString();

var p_method="GET";
var p_pwd ='';

$.ajax({
        type: "POST",
		url: "http://www.jeffersonlibrary.net/MOPLI/INTERMED_short.php",
        //async: false,
		crossDomain: true,
        data: {"uri": ""+reqstring+"", "rdate": ""+thedate+"", "method":""+p_method+"", "patron_pin":""+p_pwd+""},
        success : function(response) {
			var code=response;
			var p_response;
			p_response={"code": ""+code+"", "reqstring": ""+reqstring+"", "thedate": ""+thedate+""};
			filter_holds1(p_response.code,p_response.reqstring,p_response.thedate,bib_id,cnt,pwd,pat_barcode);	
        },
        error      : function() {
            alert('No network connection or server currently not available.');                  
        }	
});
	
//see if #holds>#items in
//case 9c
function filter_holds1 (code,reqstring,thedate,bib_id,cnt,pwd,pat_barcode){

var settings = {
	//"async":"false",
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}
$.ajax(settings).done(function (response) {
	
$.each(response.BibSearchRows, function(key, value) {	
var hold_ind2=false;
var title=value.Title;
var sys_items_in=value.SystemItemsIn;
var cur_hold_req=value.CurrentHoldRequests;

if(cur_hold_req>sys_items_in){
hold_ind2=true;
}
handover(hold_ind2, title,bib_id,cnt,pwd,pat_barcode);
});//each loop
});//ajax	
	
	function handover(status2, title2,bib_id2,cnt,pwd,pat_barcode){
		//var status2; 
		//var title2; 
		//var bib_id2; 
		//alert('title2: ' + title2 + 'status2: ' + status2);
			handover2(status2, title2, bib_id2,cnt,pwd,pat_barcode);
	}	
}//filter_holds1

	function handover2(status3, title3,bib_id3,cnt,pwd,pat_barcode){	
		//create counter
		iter++;
		//var thetally=[];
		var status4=status3; 
	if(status4==true){	
	thetally.push(bib_id3);	
	}
		if (iter==cnt){
			letgo(pwd,pat_barcode,thetally);
		}
	}	
}//hold_all_sys

var iter=0;
var cnt=0;
//case 9 - items out all (list)
function items_out_all(reqstring,thedate,code){
	thetally.length=0;
	thetally=[];	
window.plugins.spinnerDialog.show(null,"...processing");
//alert('items out all started 1357');
var settings = {
	//"async":"false",
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}

$.ajax(settings).done(function (response) {
	
lets_start(response);
});//end ajax
	
function lets_start(response){	
//thetally.length=0;
	var my_outs='';
var list_est='';
var out_selection= ['FormatDescription', 'AssignedBranchName', 'Title', 'Author', 'CheckOutDate', 'DueDate', 'RenewalCount'];
var pwd=$('#libpin').val();
var pat_barcode=$("#patron_bc").val();
$( "#borrowed" ).empty();
var cnt=response.PatronItemsOutGetRows.length;
//alert(cnt);	
$.each(response.PatronItemsOutGetRows, function(key, value) {
var bib_id=value.BibID;
var bib_bc=value.Barcode;
hold_all_sys(bib_id,bib_bc,cnt,pwd,pat_barcode);
});//end each


}//end lets_start
}//end items out all

function letgo(pwd,pat_barcode,thetally){
	iter=0;
	cnt=0;
p_validate(17,'',''+pwd+'','',''+pat_barcode+'','GET','',''+thetally+'','');
}
//case17
function items_out_all2(reqstring,thedate,code,thetally){

var settings = {
	//"async":"false",
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}

$.ajax(settings).done(function (response) {
var my_outs='';
var list_est='';
var out_selection= ['FormatDescription', 'AssignedBranchName', 'Title', 'Author', 'CheckOutDate', 'DueDate', 'RenewalCount'];
var thetally2=thetally.split(',');

$( "#borrowed" ).empty();

$.each(response.PatronItemsOutGetRows, function(key, value) {
var hold_ind=false;
overdue=false;
var media=value.FormatID;
var ISBN=value.ISBN;
var title=value.Title;
var RENCT=value.RenewalCount;
var RENLIM=value.RenewalLimit;
var RENLEFT=RENLIM-RENCT;
var bib_id1=value.BibID;
var bib_bc=value.Barcode;

if(RENLEFT<=0){
hold_ind=true;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
switch(media){
	case 35: my_outs +='<table class="bibtbl"><tr><td class="picbox"><img src="img/cd_icon.png" /></td ><td class="txtbox">'; break;
	case 40: my_outs +='<table class="bibtbl"><tr><td class="picbox"><img src="img/blueray_icon.png" /></td ><td class="txtbox">';hold_ind=true; break;
	case 33: my_outs +='<table class="bibtbl"><tr><td class="picbox"><img src="img/dvd_icon.png" /></td ><td class="txtbox">'; hold_ind=true; break;
	default: if(ISBN==''){
		my_outs +='<table class="bibtbl"><tr><td class="picbox"><img src="img/Jacket.jpg" /></td ><td class="txtbox">';
	} else{
	my_outs +='<table class="bibtbl"><tr><td class="picbox"><img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=S&Value='+ISBN+'&userID=MAIN37789&password=CC10073" /></td ><td class="txtbox">';}
}
	
	$.each(thetally2, function(key, value) {
		if(value==bib_id1){
			hold_ind=true; 
		}	
	});	
	
			$.each(value, function(key2, value2) {
	
				if(key2=="ItemID"){
				var out_req_id=value2;
				}
				if($.inArray( key2, out_selection )!== -1){
				switch(key2){
				case "AssignedBranchName":
				key2="Assigned Library";
				break;					
				case "FormatDescription":
				key2="Media";
				break;
				case "RenewalCount":
				key2="Renewals Left";

					if(hold_ind==true ){
						value2="not renewable";
					}else{
						value2=""+RENLEFT+"";
					}
				break;
				case "DueDate":
				var cod_epoch= parseFloat(value2.substr(6 ));
				if(cod_epoch<today_epoch){overdue=true;}
				/*var differ=today_epoch-cod_epoch;
				var det_days_overdue=Math.floor(differ/(86400*1000));
				if(value.Title!==''){var late_title=value.Title;}else{var late_title="n/a";}
				if(value.Author!==''){var late_author=value.Author;}else{var late_author="n/a";}
				if(media!==''){var media_cat=media;}else{var media_cat="n/a";}
				var amount_due=est_fees(media_cat, det_days_overdue);
				list_est +="<hr><p>Title: "+late_title+" ("+late_author+")<br>Days overdue: "+det_days_overdue+"<br>Estimated late fee as per today: $"+amount_due+"</p>";*/
				
				var DDate= new Date( parseFloat(value2.substr(6 )));
				value2=DDate.toDateString();
				key2="Due Date";
				break;
				case "CheckOutDate":
				var CODate= new Date( parseFloat(value2.substr(6 )));
				value2=CODate.toDateString();
				key2="Check Out Date";
				break;
				}
								
				if(key2=="Title"){
				my_outs += "<strong>" + key2 + ": " + value2 + "</strong><br>";
				}else{
				my_outs += key2 + ": " + value2 + "<br>";
				}
				}//end inarray
			});//end each loop
	
if(overdue==true){my_outs +="<div class='p_duealert'>Item Due</div>";}
if(hold_ind==false){
my_outs +="<p class='out_extend'><a id=" + out_req_id + " href='#popupDialog_extend' data-rel='popup' data-position-to='window' data-transition='pop' class='ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-carat-r ui-btn-icon-left ui-btn-b'>Renew Item...</a></p>";
}else{
my_outs +="<br><br>";}			
my_outs +="</td></tr></table>";
});//end outer each
$( "#borrowed" ).append(my_outs);

window.plugins.spinnerDialog.hide();
});//end ajax 
}//end items_out_all2 function

/*function est_fees(media_cat, det_days_overdue){
var per_item_value=0;
//alert('overdue days:'+det_days_overdue+'');
switch(media_cat){
		case 33:
		per_item_value=100;
		break;
		case 40:
		per_item_value=100;
		break;
		default:
		per_item_value=15;
}
var the_amount=det_days_overdue*per_item_value;
if(the_amount<100){the_amount=""+the_amount+" cents";}else{the_amount="$"+(the_amount/100)+"";}
return the_amount;
}*/

//case 14 - outstanding fees(list)
function fees_outstanding(reqstring,thedate,code){

var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}

$.ajax(settings).done(function (response) {
var fees_due=0;
var my_fees='';
var fees_selection= ['BranchName','FeeDescription','TransactionAmount','OutstandingAmount','FormatDescription','Title','Author','CheckOutDate','DueDate'];

$( "#fees" ).empty();

$.each(response.PatronAccountGetRows, function(key, value) {

var media=value.FormatID;
var fees=value.OutstandingAmount;
fees_due+= fees;

switch(media){
	case 35: my_fees +='<table class="bibtbl"><tr><td class="picbox"><img src="img/cd_icon.png" /></td ><td class="txtbox">'; break;
	case 40: my_fees +='<table class="bibtbl"><tr><td class="picbox"><img src="img/blueray_icon.png" /></td ><td class="txtbox">'; break;
	case 33: my_fees +='<table class="bibtbl"><tr><td class="picbox"><img src="img/dvd_icon.png" /></td ><td class="txtbox">'; break;
	default: my_fees +='<table class="bibtbl"><tr><td class="picbox"><img src="img/book_icon.png" /></td ><td class="txtbox">';
}

	$.each(value, function(key2, value2) {
			
				if(value2!=''){
				if(jQuery.inArray( key2, fees_selection )!== -1){
				
				switch(key2){
				case "FeeDescription":
				key2="Fee Description";
				break;
				
				case "FormatDescription":
				key2="Media Type";
				break;
				
				case "TransactionAmount":
				key2="Transaction Amount";
				value2='$'+value2.toFixed(2);
				//value2='$'+value2+'';
				break;
				
				case "OutstandingAmount":
				key2="Outstanding Amount";
				value2='$'+value2.toFixed(2);
				//value2='$'+value2+'';
				break;

				case "CheckOutDate":
				key2="Check Out Date";
				var CODate= new Date( parseFloat(value2.substr(6 )));
				value2=CODate.toDateString();
				break;
				
				case "DueDate":
				key2="Due Date";
				var DDate= new Date( parseFloat(value2.substr(6 )));
				value2=DDate.toDateString();
				break;
				}	
					
				if(key2=="Title" || key2=='Outstanding Amount'){
				my_fees += "<strong>" + key2 + ": " + value2 + "</strong><br>";
				}else{
				my_fees += key2 + ": " + value2 + "<br>";
				}
								
				}
				}
	});
my_fees +="</td></tr></table>";
});
if(fees_due>0){
$( "#fees" ).append(my_fees);
}else{
$( "#fees" ).append("No current fees on file");
}
});//end ajax 
}//end fees function

//case 11 - extend (encrypt) - take: out_extend id, p_bc, p_pin
$(document).on('click', '.out_extend a', function () {
extend_id=$(this).attr("id");
});
//modal dialog
$("#extend_out_conf").on('click', function(){
var p_barcode=$("#patron_bc").val();
var p_pin=$("#libpin").val();
//alert('ready to extend'+extend_id+'');
$("#borrowed" ).empty();

	//alert('this is ppin:'+p_pin+' - pbarcode:'+p_barcode+' - extendid:'+extend_id+'');

	p_validate(11,'',''+p_pin+'','',''+p_barcode+'','PUT','',''+extend_id+'','');
});
//case 11 - extend (ajax & go to prep_getholds)
function item_renew(reqstring,thedate,code,pat_barcode){
//alert('here:'+reqstring+','+thedate+','+code+','+pat_barcode+'');
var settings = {
"dataType": "json",
"url": ""+reqstring+"",
"method": "PUT",
"headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"",
	"content-type": "application/json",
},
"processData": false,
"data": '{"Action": "renew","LogonBranchID": "29","LogonUserID": "1","LogonWorkstationID": "1","RenewData": { "IgnoreOverrideErrors": true }}'
}

$.ajax(settings).done(function (response) {
response=JSON.stringify(response);
response= jQuery.parseJSON(response);

$.each(response.ItemRenewResult, function(key, value) {
$.each(value, function(key2, value2) {
if(value2.PAPIErrorType){
ext_err_code=value2.PAPIErrorType;
ext_err_desc=value2.ErrorDesc;
block=true;}else{block=false;}
});
});

var pbc=pat_barcode;
var pwd=$('#libpin').val();

if(block==true){
	$.jAlert({
    'title': 'Please note',
    'content': 'Sorry, this item can not renew. '+ext_err_desc+'',
    'theme': 'red',
	'btns': {'text':'ok', 'theme': 'blue', 'onClick': function(e, btn){
	e.preventDefault();
	allitemsout(pbc,pwd);
	return false;
	}}
	});
}
else{
allitemsout(pbc,pwd);
}

});//ajax
}//item_renew

//function allitemsout (pinting to sequence 9
function allitemsout (pbc, pwd){
p_validate(9,'',''+pwd+'','',''+pbc+'','GET','','','');
}

//case 12 - get most popular (encrypt)
$(document).on('click', '#mp_btn', function () {
page_counter=1;
$( "#most_popular" ).empty();
$( "#news" ).empty();
$( "#blist" ).empty();
$( "#news_dvd" ).empty();
$( "#nyt" ).empty();
$('#selection').collapsible( "collapse" );
p_validate(12,'','','','','GET','',1,'');
start_spin();
});
//case 12 - list most popular
function most_popular(code,reqstring,thedate){

var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}

$.ajax(settings).done(function (response) {
//alert('line 1754');
var selection= ['Title', 'Author', 'PublicationDate', 'PrimaryTypeOfMaterial', 'LocalItemsTotal','LocalItemsIn', 'SystemItemsTotal', 'SystemItemsIn'];
$( "#most_popular" ).empty();
var mplist_html='';
var next_mplist_html='';

$.each(response.BibSearchRows, function(key, value) {
var cont_no=value.ControlNumber;
var media=value.PrimaryTypeOfMaterial;
var ISBN=value.ISBN;

switch(media){
	case 35: mplist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/cd_icon.png" /></td ><td class="txtbox">'; break;
	case 40: mplist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/blueray_icon.png" /></td ><td class="txtbox">'; break;
	case 33: mplist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/dvd_icon.png" /></td ><td class="txtbox">'; break;
	default: if(ISBN==''){
		mplist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/Jacket.jpg" /></td ><td class="txtbox">';
	} else{
		mplist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=S&Value='+ISBN+'&userID=MAIN37789&password=CC10073" /></td ><td class="txtbox">';}
}

$.each(value, function(key2, value2) {
	
	if(jQuery.inArray( key2, selection )!== -1){
		
	switch(key2){
		case "PublicationDate":
		key2="Publication Date";
		break;
		case "PrimaryTypeOfMaterial":
		key2="Media Type";
		value2=matconv(value2);
		break;
	}
	
	mplist_html += "<strong>" + key2 + "</strong>: " + value2 + "<br>";
	}

});
mplist_html +="<p class='trail'><a id=" + cont_no + " href='#bib_detail' data-role='button' data-inline='true' data-mini='true' data-icon='arrow-r' data-theme='a'>Detail</a></p>";
mplist_html +="</td></tr></table>";

$('.trail a[data-role=button]').button();
$('.trail a').button('refresh');
});

$( "#most_popular" ).append(mplist_html);
stop_spin();
$('.trail a').button();
$('html,body,#most_popular').animate({ scrollTop: 0 }, "fast");
if(page_counter==1){
next_mplist_html +="<a href='#' id='fwd_btn_mp' class='ui-btn ui-corner-all ui-icon-cloud ui-btn-icon-left'>...next 20 results</a>";
$( "#most_popular" ).append(next_mplist_html);
}
if(page_counter>1){
next_mplist_html +="<div data-role='controlgroup' data-type='horizontal' data-mini='true'><a href='#' id='rev_btn_mp' class='ui-btn ui-corner-all ui-icon-carat-l ui-btn-icon-left'>show last 20</a><a href='#' id='fwd_btn_mp' class='ui-btn ui-corner-all ui-icon-carat-r ui-btn-icon-left'>show next 20</a></div>";
$( "#most_popular" ).append(next_mplist_html);

}
});
}

//case 13 take the ISBN to the library
$(document).on('click', '.bc a', function () {
var the_isbn=$(this).attr("id");
//$.mobile.changePage("#scanner");
start_spin();
p_validate(13,''+the_isbn+'','','','','GET','','','');
});
//case 13 Get NYT Detail in the Detail Page
function get_det_nyt(code,reqstring,thedate){

$('.pic_large').empty();
var detlist_html='';

var det_nyt_html='';
var settings = {
"content-type": "application/json",
	"dataType": "json",
  "url": ""+reqstring+"",
  "type": "GET",
  "headers": {
    "polarisdate": ""+thedate+"",
    "authorization": ""+code+"" 
  }
}

$.ajax(settings).done(function (response) {

var selection= ['Title', 'Author', 'PublicationDate', 'Description', 'ISBN', 'PrimaryTypeOfMaterial', 'LocalItemsTotal', 'LocalItemsIn', 'SystemItemsTotal','CurrentHoldRequests', 'Summary'];
$( "#bdetail" ).empty();

var det_nyt_html='';
var pic_large_nyt='';



$.each(response.BibSearchRows, function(key, value) {
var cont_no=value.ControlNumber;
var media=value.PrimaryTypeOfMaterial;
var ISBN=value.ISBN;

switch(media){
	case 35: detlist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/cd_icon.png" /></td ><td class="txtbox">'; break;
	case 40: detlist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/blueray_icon.png" /></td ><td class="txtbox">'; break;
	case 33: detlist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/dvd_icon.png" /></td ><td class="txtbox">'; break;
	default: if(ISBN==''){
		detlist_html +='<table class="bibtbl"><tr><td class="picbox"><img src="img/Jacket.jpg" /></td ><td class="txtbox">';
	} else{
det_nyt_html +='<table class="bibtbl"><tr><td class="picbox_dtl"><img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=S&Value='+ISBN+'&userID=MAIN37789&password=CC10073" /><br /><img src="img/magglass.png" /></td ><td class="txtbox">';
pic_large_nyt +='<img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=M&Value='+ISBN+'&userID=MAIN37789&password=CC10073" />';
}
}

$.each(value, function(key2, value2) {
	
	if(jQuery.inArray( key2, selection )!== -1){
		switch(key2){
			case "PublicationDate":
			key2="Publication Date";
			break;
			case "LocalItemsTotal":
			key2="Local Items Total";
			break;
			case "LocalItemsIn":
			key2="Local Items In";
			break;
			case "CurrentHoldRequests":
			key2="Current Hold Requests";
			break;
			case "SystemItemsTotal":
			key2="System Items Total";
			break;
			case "PrimaryTypeOfMaterial":
			key2="Media Type";
			value2=matconv(value2);
			break;
		}
	det_nyt_html += "<strong>" + key2 + "</strong>: " + value2 + "<br>";
	}

});
det_nyt_html +="<p class='hold_req'><a id=" + cont_no + " href='#login' data-role='button' data-inline='true' data-mini='true' data-icon='arrow-r' data-theme='a'>Put on Hold</a></p>";
det_nyt_html +="</td></tr></table>";
});

$( "#bdetail" ).append(det_nyt_html);
stop_spin();
$('.hold_req a').button();

$(".picbox_dtl").on("tap",function(){
	if(pic_large_nyt){
		if($('.pic_large img').length){
			$("html, body").animate({ scrollTop: 0 }, "slow");
			$('.pic_large').empty();
		}else{
			$('.pic_large').append(pic_large_nyt);
			$('.pic_large').fadeIn();
			setTimeout(function(){
			$('html, body').animate({ 
			scrollTop: $(document).height()}, 
			700, "swing");
			},150);
		}
	}
});//end tap function
//erase large pic and scroll back to top on tap
$(".pic_large").on("tap",function(){
$("html, body").animate({ scrollTop: 0 }, "slow");
$('.pic_large').fadeOut(500, function() {
    $(this).empty();
});
});

});
}

//GET NYT Bestseller JSON
$(document).on('click', '#nyt_f_btn', function () {
var type="fiction";
nyt_bestseller(type);											
});
$(document).on('click', '#nyt_nf_btn', function () {
var type="nonfiction";
nyt_bestseller(type);											
});
$(document).on('click', '#nyt_yah_btn', function () {
var type="young_adult";
nyt_bestseller(type);											
});
//source Bestseller data
function nyt_bestseller(type){
start_spin();
$('#selection').collapsible( "collapse" );
if(type=='fiction'){
var the_url="http://www.wolfsworld1.com/NYT_HCF.php";
}
if(type=='nonfiction'){
the_url="http://www.wolfsworld1.com/NYT_HCNF.php";
}
if(type=='young_adult'){
the_url="http://www.wolfsworld1.com/NYT_YAH.php";
}

$.ajax({
        type: "GET",
		dataType: "json",
		async: true,
		url: ""+the_url+"",
        crossDomain: true,
        success : function(response) {
		//alert(response);
		NYT_HC_FIC(response);
		},
        error      : function() {
            alert('No network connection or server currently not available.');                  
        }
});
}
//populate Bestseller Field
function NYT_HC_FIC (response){
	//alert(response);
		//var response=JSON.stringify(response);
		//var response= jQuery.parseJSON(response);
//alert(response);
var selection= ['title', 'author', 'publisher', 'description', 'primary_isbn13'];

$( "#most_popular" ).empty();
$( "#news" ).empty();
$( "#blist" ).empty();
$( "#news_dvd" ).empty();
$( "#nyt" ).empty();

var nyt_link='';

$.each(response.results.books, function(key, value) {
var nyt1_html='';
var rank=key+1;

var the_isbn=value.primary_isbn13;
var the_cover=value.book_image;

//nyt1_html +='<table class="bibtbl"><tr><td class="picbox">'+the_cover+'<img src="'+the_cover+'" width="90px" /></td ><td class="txtbox">';
nyt1_html +='<table class="bibtbl"><tr><td class="picbox"><img src="http://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=T&Type=S&Value='+the_isbn+'&userID=MAIN37789&password=CC10073" /></td ><td class="txtbox">';
nyt1_html += "<strong>Rank: " + rank + "</strong><br>";

$.each(value, function(key2, value2) {
//alert('this is rank: '+key+' key2: '+ key2 +' and value2: '+ value2 +'');

	if(jQuery.inArray( key2, selection )!== -1){
	
		switch(key2){
		case "title":
		key2="Title";
		break;
		case "author":
		key2="Author";
		break;
		case "publisher":
		key2="Publisher";
		break;
		case "description":
		key2="Summary";
		break;
		case "primary_isbn13":
		key2="ISBN";
		break;
	}
	
	
	nyt1_html += "<strong>" + key2 + "</strong>: " + value2 + "<br>";
	}
});
nyt1_html +="<p class='bc'><a id='"+the_isbn+"' href='#bib_detail' data-role='button' data-inline='true' data-mini='true' data-icon='arrow-r' data-theme='a'>Detail</a></p>";
nyt1_html +="</td></tr></table>";

$('.bc a[data-role=button]').button();
$('.bc a').button('refresh');

$( "#nyt" ).append(nyt1_html);
$('.bc a').button();
stop_spin();
});

nyt_link +='<div align="center"><a href="#" onclick="window.open(encodeURI(\'http://developer.nytimes.com\'), \'_blank\', \'location=yes\')"><img src="img/NYT2.png"></a></div>';
$( "#nyt" ).append(nyt_link);
}

//prepare static pages for version, alerts, hours, holidays and contacts
pop_gen('hours',1);
pop_gen('holidays',2);
pop_gen('contacts',3 );
pop_gen('version',4 );
pop_gen('alert',5 );
//}
//general ajax
function pop_gen(page_categ,fctn){
var categ=page_categ;

$.ajax({
        type: "GET",
		async: true,
		url: "http://www.jeffersonlibrary.net/MOPLI/"+categ+".php",
        crossDomain: true,
		dataType: "json",
        success : function(response) {
		switch(fctn){
		case 1:	populate_hours(response,1); break;
		case 2: populate_holidays(response,1); break;
		case 3: populate_contacts(response,1); break;
		case 4: get_version(response,1); break;
		case 5: get_alert(response,1); break;
		}
        },
        error : function() {
        switch(fctn){
		case 1:	populate_hours('',2); break;
		case 2: populate_holidays('',2); break;
		case 3: populate_contacts('',2); break;
		case 4: get_version('',2); break;
		case 5: get_alert('',2); break;
		}
			//alert('Could not process.You might have no network connection.');                  
        }
});
}

//alert from the library
function get_alert(response, status){
$.each(response, function(key, value) {	
var the_alert=response.the_alert;
if(the_alert){
	$.jAlert({
    'title': 'Important Message',
    'content': ''+the_alert+'',
    'theme': 'red'
	});
}
});
}

//version check
function get_version(response, status){
$.each(response, function(key, value) {	
latest_app_version=response.version;
if(this_app_version<latest_app_version){
setTimeout(function(){
new_vers_alert(this_app_version, latest_app_version);
},4000);
}
});
}
//new version available alert
function new_vers_alert(this_app_version, latest_app_version){
	$.jAlert({
    'title': 'Important Message',
    'content': 'Please upgrade this app to the latest version '+latest_app_version+'',
    'theme': 'red'
	});
$('#v_update').empty();
var btn_group;
		switch(dev_platform){
		case 'A': btn_group='A'; break;
		case 'I': btn_group='I'; break;
		case 'W': btn_group='W'; break;
		default: btn_group='N'; break;
		}
$('#v_update').append("<p class='new_version'><a id=" + btn_group + " href='#' data-role='button' data-inline='true' data-mini='true' data-icon='action' data-theme='a'>New Version " + latest_app_version + " Available</a></p>");
$('.new_version a').button();

}


$(document).on('click', '.new_version a', function () {
var pf_no;
pf_no=$(this).attr("id");
//alert(pf_no);
switch(pf_no){
case 'A': window.open('https://play.google.com/store/search?q=Mopli%20JTPL&c=apps&hl=en', '_blank', 'location=yes'); break;
case 'I': window.open('https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1043389097&mt=8', '_blank', 'location=yes'); break;
case 'W': window.open('https://www.microsoft.com/en-us/store/apps/mopli-jtpl/9nblggh5f37p', '_blank', 'location=yes'); break;
default: ''; break;
}
});

//populate static pages
function populate_holidays(response, status){
var holidays_html='';
if(status==1){
holidays_html +="<table class='bibtbl'>";
	$.each(response, function(key, value) {
			var hol_name=key;
				$.each(value, function(key1, value1) {
				var hol_date2;
				var hol_com;
						var hol_date1=key1;
							$.each(value1, function(key2, value2) {
								if(!key2){hol_date2='';}else{hol_date2=' - '+key2+'';}
								if(!value2){hol_com='';}else{hol_com=''+value2+'';}										
holidays_html +='<tr><td class="txtbox" width="143" valign="top">'+hol_name+'</td><td class="txtbox" width=212>'+hol_date1+''+hol_date2+'<br>'+hol_com+'</td></tr>';
}); }); });
holidays_html +="</table>";	
}
else{
holidays_html +="<div>This section requires an internet connection to populate data.<br>It appears you are currently offline or the server is currently not available.</div>";
}
$('#holiday_block').append(holidays_html);
}

function populate_hours(response, status){
var hours_html='';
if(status==1){
hours_html +="<table>";	
	$.each(response, function(key, value) {
			var hour_day=key;
				$.each(value, function(key1, value1) {
						var hour_from=key1;
						var hour_to;
						var hour_com;
							$.each(value1, function(key2, value2) {
								if(!key2){hour_to='';}else{hour_to=''+key2+'';}
								if(!value2){hour_com='';}else{hour_com=''+value2+'';}										

hours_html +="<tr><td width=143>"+hour_day+"</td><td width=212>"+hour_from+"-"+hour_to+"</td></tr>";
}); }); });
hours_html +="</table>";
}
else{
hours_html +="<div>This section requires an internet connection to populate data.<br>It appears you are currently offline or the server is currently not available.</div>";
}
$('#hour_block').append(hours_html);
}

function populate_contacts(response, status){
var contact_html='';
if(status==1){
contact_html +="<table>";
	$.each(response, function(key, value) {
			var con_title=key;
				$.each(value, function(key1, value1) {
						var con_name=key1;
						var con_phone;
						var con_email;
						var con_pic;
								$.each(value1, function(key2, value2) {
								if(!key2){con_phone='';}else{con_phone=''+key2+'';}
								$.each(value2, function(key3, value3) {
								if(!key3){con_email='';}else{con_email=''+key3+'';}
								if(!value3){con_pic='';}else{con_pic=''+value3+'';}		
										contact_html +='<div class="contacts"><div class="portrait"><img src="'+con_pic+'" align="center"  /></div>'+con_title+':<br />'+con_name+'<br />Phone: '+con_phone+'<br /><a href="mailto:'+con_email+'">'+con_email+'</a></div>';
}); }); }); });
contact_html +="</table>";
}
else{
contact_html +="<div>This section requires an internet connection to populate data.<br>It appears you are offline or the server is currently not available.</div>";
}
$('#contact_block').append(contact_html);
}

//fastclick
window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

//Flashlight
$('#flashlight').on('click', function () {
//alert('clicky');
$('.ui-grid-solo .flash .ui-btn').css({'background-color': '#FF0', 'background': '-webkit-radial-gradient(white 15%, yellow 85%)','background': '-o-radial-gradient(white 15%, yellow 85%)','background':' -moz-radial-gradient(white 15%, yellow 85%)',' background': 'radial-gradient(white 15%, yellow 85%)'});
window.plugins.flashlight.available(function(isAvailable) {
  if (isAvailable) {

    // switch on
    window.plugins.flashlight.switchOn(); // success/error callbacks may be passed

    // switch off after 5 seconds
    setTimeout(function() {
     window.plugins.flashlight.switchOff(); // success/error callbacks may be passed
   $('.ui-grid-solo .flash .ui-btn').css({'background-color': '#FC3', 'background': '-webkit-radial-gradient(white 0%, yellow 0%)','background': '-o-radial-gradient(white 0%, yellow 0%)','background':' -moz-radial-gradient(white 0%, yellow 0%)',' background': 'radial-gradient(white 0%, yellow 0%)'});
	}, 8000);
	//$('.ui-grid-solo .flash .ui-btn').css({'background-color': '#FFF7B7'});
  } 
 else {
 $('.ui-grid-solo .flash .ui-btn').css({'background-color': '#FC3', 'background': '-webkit-radial-gradient(white 0%, yellow 0%)','background': '-o-radial-gradient(white 0%, yellow 0%)','background':' -moz-radial-gradient(white 0%, yellow 0%)',' background': 'radial-gradient(white 0%, yellow 0%)'}); 
    alert("Flashlight not available on this device");
  }
});
});

});