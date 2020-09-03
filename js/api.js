$(document).ready(function(){
var thedate=(new Date()).toUTCString();
var searchitem="http://plato-r2.polarislibrary.com/PAPIService/REST/public/v1/1033/100/1/search/bibs/boolean?q=B";
//alert('beginning');
$.ajax({
        type       : "POST",
		//headers: {'PolarisDate': thedate, 'Authorization': 'code', 'Content-Type':'application/json', 'Accept': 'application/json'  },
	    url: "http://www.jeffersonlibrary.net/INTERMED_short.php",
        crossDomain: true,
        data: {uri: searchitem, rdate: thedate},
		error: function(jqXHR,text_status,strError){
			alert("no connection");},
		timeout:60000,
		cache: false,
        success : function(response) {
			var code=response;
			
		getit(code,searchitem,thedate);
        },
        error      : function() {
            console.error("error");
            alert('Not working1!');                  
        }
    });


function getit(code,searchitem,thedate){

alert(thedate);
alert(code);
alert(searchitem);

$.ajax({
        type: 'GET',
		//url: "http://plato-r2.polarislibrary.com/PAPIService/REST/public/v1/1033/100/1/search/bibs/boolean?q=B",
		headers: {'PolarisDate': thedate,'Authorization': 'PWS ' +code,'Content-Type':'application/json','Accept': 'application/json'},
		//headers: {'Access-Control-Allow-Origin': '*','PolarisDate':''+thedate+'','Authorization':'PWS '+code+'','Content-Type':'application/json', 'Accept': 'application/json'},
       url: searchitem,
	   crossDomain: true,
		//data: 'B',
		dataType   : 'json',
        //processData: false,
		error: function(jqXHR,text_status,strError){
			alert("no connection");},
		timeout:60000,
		cache: false,
                success : function(response) {
					
            console.error(JSON.stringify(response));
			var response= jQuery.parseJSONP(response);
		alert(response);
				$( "#showme" ).append(response);
			//stop_spin();
        },
        error      : function() {
            console.error("error");
            alert('Not working!');                  
        }
    });
}


});


