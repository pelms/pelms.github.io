$(document).ready(function() {
	// Hypnenate ISBNs
	$('#hyphenate').click(function() {
		if ($(this).is(':checked')) {
			if ( $('#isbn_in').val() != '' ) {
				$('#isbn_in').val(hyphenate($('#isbn_in').val()));
			}
			if ( $('#isbn_out').val() != '' ) {
				$('#isbn_out').val(hyphenate($('#isbn_out').val()));
			}			
		}
		else {
			if ( $('#isbn_in').val() != '' ) {
				$('#isbn_in').val($('#isbn_in').val().replace(/-/img, ""));
			}
			if ( $('#isbn_out').val() != '' ) {
				$('#isbn_out').val($('#isbn_out').val().replace(/-/img, ""));
			}						
		}
	});					   
});

// Look up ISBN on Google Books
function lookupISBN(isbn_field) {  
	var isbn_val = document.getElementById(isbn_field).value;
	document.getElementById('as_isbn').value = isbn_val;
	document.getElementById('f').submit();
}


// Validation/conversion functions for ISBN numbers
// Code from Library of Congress ISBN converter 
// http://pcn.loc.gov/isbncnvt.html

var bAlert;

function convertISBN(form)
{
	// Set default variables and cleanup ISBN
	var form = document.isbncnvt;
	form.isbn_in.value = form.isbn_in.value.replace(/[-\s]/g,"").toUpperCase();
	var isbnnum = form.isbn_in.value;
	var isbn10exp = /^\d{9}[0-9X]$/;
	var isbn13exp = /^\d{13}$/;
	var isbnlen = isbnnum.length;
	var total = 0;

	// Preliminary validation
	if (isbnlen == 0) {
		alert("Please enter an ISBN to convert in the first box.");
        form.isbn_in.focus();
      	form.isbn_in.select();
       	return false;
   	}

	if ((form.isbn_out.value != "") && (isbnlen == 0)) {
		alert("Please enter the ISBN to convert in the first box.");
        form.isbn_in.focus();
        form.isbn_in.select();
        return false;
   	}

   	if (!(isbn10exp.test(isbnnum)) && !(isbn13exp.test(isbnnum))) {
		if ((isbnlen != 10) && (isbnlen != 13)) {
 			alert("This ISBN is invalid." + "\n" +
		   	      "It contains " + isbnlen + " characters.");
		}
		else {
 			alert("This ISBN is invalid." + "\n" +
		   	      "It contains invalid characters.");			
		}
          	form.isbn_in.focus();
          	form.isbn_in.select();
          	return false;
    	}

	// Validate & convert a 10-digit ISBN
	if (isbnlen == 10) {
		// Test for 10-digit ISBNs:
		// Formulated number must be divisible by 11
		// 0234567899 is a valid number
		for (var x=0; x<9; x++) { 
			total = total+(isbnnum.charAt(x)*(10-x));
		}
		// check digit
		z = isbnnum.charAt(9);
		if (z == "X") { z = 10; }

		// validate ISBN
		if ((total+z*1) % 11 != 0) {   // modulo function gives remainder
			z = (11 - (total % 11)) % 11;
			if (z == 10) { z = "X"; }
			alert("This 10-digit ISBN is invalid." + "\n" +
			      "The check digit should be " + z + ".");
			form.isbn_in.focus();
			form.isbn_in.select();
			return false;
		}
		else {
			// convert the 10-digit ISBN to a 13-digit ISBN
			isbnnum = "978"+isbnnum.substring(0,9);
			total = 0;
			for (var x=0; x<12; x++) {
				if ((x % 2) == 0) { y = 1; }
				else { y = 3; }
				total = total+(isbnnum.charAt(x)*y);
			}		
			z = (10 - (total % 10)) % 10;
		}		
	}

	// Validate & convert a 13-digit ISBN
	else { 
		// Test for 13-digit ISBNs
		// 9780234567890 is a valid number
		for (var x=0; x<12; x++) {
			if ((x % 2) == 0) { y = 1; }
			else { y = 3; }
			total = total+(isbnnum.charAt(x)*y);
		}

		// check digit
		z = isbnnum.charAt(12);

		// validate ISBN		
		if ((10 - (total % 10)) % 10 != z) {   // modulo function gives remainder
			z = (10 - (total % 10)) % 10; 
			alert("This 13-digit ISBN is invalid." + "\n" +
			      "The check digit should be " + z + ".");
			form.isbn_in.focus();
			form.isbn_in.select();
			return false;
		}
		else {
			// convert the 13-digit ISBN to a 10-digit ISBN
			if ((isbnnum.substring(0,3) != "978")) {
				alert("This 13-digit ISBN does not begin with \"978\"" + "\n" +
				      "It cannot be converted to a 10-digit ISBN.");
				form.isbn_in.focus();
				form.isbn_in.select();
				return false;
			}
			else {
				isbnnum = isbnnum.substring(3,12);
				total = 0;
				for (var x=0; x<9; x++) {
					total = total+(isbnnum.charAt(x)*(10-x));
				}
				z = (11 - (total % 11)) % 11;
				if (z == 10) { z = "X"; } 
			}
		}
	}
	if (form.hyphenate.checked == true) {
		bAlert = true;
		form.isbn_in.value = hyphenate(form.isbn_in.value);
		bAlert = false;
		form.isbn_out.value = hyphenate(isbnnum+z);
	}
	else { 	form.isbn_out.value = isbnnum+z; } 
	return true;

}//convertISBN(form)

function hyphenate(isbn) {

	var prefix;

	if (isbn.length == 13) { // for 13-digit ISBNs
		prefix = isbn.substring(0,3) + "-";
		isbn = isbn.substring(3,13);
	} else { 
		prefix = ''; 
	}

	var d = eval(isbn.substring(0,1));	// one digit
	var d2 = eval(isbn.substring(1,3));	// two digits
	var d4 = eval(isbn.substring(1,5));	// four digits
	var objRegExp = "";

	switch(d) {
		case 0:
	    case 3:
	    case 4:
	/*
	0 = English-speaking areas
	3 = German-speaking areas
	4 = Japan
	*/
		switch(true) {
			case (d2 < 20):
				objRegExp = /(\d)(\d{2})(\d{6})(\w)/;
		        break;
	        case (d2 < 70):
				objRegExp = /(\d)(\d{3})(\d{5})(\w)/;
			  	break;
	        case (d2 < 85):
				objRegExp = /(\d)(\d{4})(\d{4})(\w)/;
			  	break;
	        case (d2 < 90):
				objRegExp = /(\d)(\d{5})(\d{3})(\w)/;
			  	break;
	        case (d2 < 95):
				objRegExp = /(\d)(\d{6})(\d{2})(\w)/;
			  	break;
	        case (d2 <= 99):
				objRegExp = /(\d)(\d{7})(\d)(\w)/;
				break;
	        default:
		        break;
		}
		break;

		case 1:
	/*
	1 = English-speaking areas
	*/
		switch(true) {
			case (d4 < 1000):
				objRegExp = /(\d)(\d{2})(\d{6})(\w)/;
		        break;
	        case (d4 < 4000):
				objRegExp = /(\d)(\d{3})(\d{5})(\w)/;
				break;
	        case (d4 < 5500):
				objRegExp = /(\d)(\d{4})(\d{4})(\w)/;
			  	break;
	        case (d4 < 8698):
				objRegExp = /(\d)(\d{5})(\d{3})(\w)/;
			  	break;
	        case (d4 < 9990):
				objRegExp = /(\d)(\d{6})(\d{2})(\w)/;
			 	break;
	        case (d4 <= 9999):
				objRegExp = /(\d)(\d{7})(\d)(\w)/;
			  	break;
	        default:
		        break;
		}
		break;

	    case 2:
	/*
	2 = French-speaking areas
	*/
		switch(true) {
			case (d2 < 20):
				objRegExp = /(\d)(\d{2})(\d{6})(\w)/;
		        break;
	        case (d2 < 70):
				objRegExp = /(\d)(\d{3})(\d{5})(\w)/;
			  	break;
	        case (d2 < 84):
				objRegExp = /(\d)(\d{4})(\d{4})(\w)/;
				break;
	        case (d2 < 90):
				objRegExp = /(\d)(\d{5})(\d{3})(\w)/;
				break;
	        case (d2 < 95):
				objRegExp = /(\d)(\d{6})(\d{2})(\w)/;
			  	break;
	        case (d2 <= 99):
				objRegExp = /(\d)(\d{7})(\d)(\w)/;
				break;
	        default:
		        break;
		}
		break;
	  
	    case 9:
	/*
	90 = Dutch/Flemish-speaking
	*/ 
	  if (isbn.substring(1,2) == 0) {
		d2 = isbn.substring(2,4);
		switch(true) {
			case (d2 < 20):
				objRegExp = /(\d{2})(\d{2})(\d{5})(\w)/;
		        break;
	        case (d2 < 50):
				objRegExp = /(\d{2})(\d{3})(\d{4})(\w)/;
			  	break;
	        case (d2 < 70):
				objRegExp = /(\d{2})(\d{4})(\d{3})(\w)/;
			  	break;
	        case (d2 < 80):
				objRegExp = /(\d{2})(\d{5})(\d{2})(\w)/;
			  	break;
	        case (d2 <= 81):
				objRegExp = /(\d{2})(\d{6})(\d)(\w)/;
				break;
	        default:
		    	break;
		}
	}

	/*
	965 = Israel
	*/
	  if (isbn.substring(1,3) == 65) { 
		d2 = isbn.substring(3,5);
		switch(true) {
			case (d2 < 20):
				objRegExp = /(\d{3})(\d{2})(\d{4})(\w)/;
		        break;
	        case (d2 < 70):
				objRegExp = /(\d{3})(\d{3})(\d{3})(\w)/;
			  	break;
	        case (d2 < 90):
				objRegExp = /(\d{3})(\d{4})(\d{2})(\w)/;
			  	break;
	        case (d2 <= 95):
				objRegExp = /(\d{3})(\d{5})(\d)(\w)/;
			  	break;
	        default:
		        break;
		}
	  }  

	/*
	981 = Singapore
	*/ 
	  if (isbn.substring(1,3) == 81) {
		d2 = isbn.substring(3,5);
		switch(true) {
			case (d2 < 20):
				objRegExp = /(\d{3})(\d{2})(\d{4})(\w)/;
		        break;
	        case (d2 < 30):
				objRegExp = /(\d{3})(\d{3})(\d{3})(\w)/;
			  	break;
	        case (d2 <= 40):
				objRegExp = /(\d{3})(\d{4})(\d{2})(\w)/;
			  	break;
	        default:
		        break;
		}
	  }  
	  else { break; }

	        break;

		default:
	   		break;
	}

	if (objRegExp != "") {
	       isbn = prefix + isbn.replace(objRegExp, "$1-$2-$3-$4");
	}
	else { 
		if (bAlert == true) { alert("Unable to hyphenate this ISBN!"); }
		isbn = (prefix + isbn).replace(/[-]/g,"");
	}
	return isbn;

} //hyphenate(isbn)
