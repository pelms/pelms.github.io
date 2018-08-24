// PE, 2007

var elib_prefix = 'http://elibrary.uwe.ac.uk/V/?force_login=y&amp;';

function resourceUrl(type) {
	var res_string = 'func=find-db-4&amp;mode=advanced&amp;resource='
	var select_list = document.getElementById('resource');
	var selected_value = select_list.value;
	var pasted_url = document.getElementById('pastedURL').value;
	var selected_text, resource_link;
	if ((selected_value != '') || (pasted_url != '')) {
		if (type == 'resource') {
			pasted_url = '';
			selected_text = select_list[select_list.selectedIndex].innerHTML;
			resource_link = elib_prefix + res_string + selected_value;
		} else {
			if (pasted_url == '') {
				return false;
			} else {
				if (/^https:\/\/elibrary\.uwe\.ac\.uk\/V\/\w{50}-\d{5}\?func=native-link&resource=(UWE\d{5})$/i.test(pasted_url)) {
					// Successful match
					document.getElementById('resource').options[0].selected = true; // Set dropdown to index [0];
					selected_text = 'Link';
					selected_value = pasted_url.replace(/^https:\/\/elibrary\.uwe\.ac\.uk\/V\/\w{50}-\d{5}\?func=native-link&resource=(UWE\d{5})$/g, "$1");
					resource_link = elib_prefix + res_string + selected_value;
				} else {
					// Match attempt failed
					selected_text = '';
					alert("Incorrect format for the URL\n\nRight-click the link and select:\n'Copy Shortcut' (Internet Explorer), or\n'Copy Link Location' (Firefox)");
					return false;
				}
			}
		}
	} else {
		var selected_text = '';
		resource_link = '';
	}
	document.getElementById('pastedURL').value = pasted_url;
	document.getElementById('resourceURL').value = resource_link;
	document.getElementById('resourceURL2').value = resource_link.replace(/&amp;/ig, "&");
	document.getElementById('resourceLink').innerHTML = selected_text;
	document.getElementById('resourceLink').href = decodeAmps(resource_link); // Replace '&amp;' with '&'
}

function searchResUrl(type) {
	var search_string = 'func=find-db-1-title&amp;mode=titles&amp;search_type=exact&amp;restricted=all&amp;format=001&amp;scan_start='
	var select_list = document.getElementById('searchRes');
	var selected_value = select_list.value;
	var pasted_title = document.getElementById('pastedTitle').value;
	var selected_text, resource_link;
	if ((selected_value != '') || (pasted_title != '')) {
		if (type == 'resource') {
			pasted_title = '';
			selected_text = select_list[select_list.selectedIndex].innerHTML;
			resource_link = elib_prefix + search_string + selected_value;
		} else {
			if (pasted_title == '') {
				return false;
			} else {
				document.getElementById('searchRes').options[0].selected = true; // Set dropdown to index [0];
				selected_text = 'Link';
				pasted_title = pasted_title.replace(/^[ \t]+/ig, ""); // strip leading spaces
				pasted_title = pasted_title.replace(/[ \t]+$/ig, ""); // strip trailing spaces
				resource_link = elib_prefix + search_string + pasted_title;
			}
		}
	} else {
		var selected_text = '';
		resource_link = '';
	}
	document.getElementById('pastedTitle').value = pasted_title;
	document.getElementById('searchResURL').value = resource_link;
	document.getElementById('searchResURL2').value = resource_link.replace(/&amp;/ig, "&");
	document.getElementById('searchResLink').innerHTML = selected_text;
	document.getElementById('searchResLink').href = decodeAmps(resource_link); // Replace '&amp;' with '&'
} 

function categoryUrl(type) {
//var cat_string = 'func=find-db-1&amp;mode=category&amp;category=';
	var cat_string = 'func=meta-1&amp;Init_type=CategoryList&amp;category=';
	category1_val = document.getElementById('category1').value;
	if ((category1_val != '&nbsp;Enter Category name...') && (category1_val != ' Enter Category name...') && (category1_val != '')) {
		category1_val = encodeChars(category1_val);
		category1_val = elib_prefix + cat_string + category1_val;
		document.getElementById('categoryURL1').value = category1_val;
		document.getElementById('categoryLlink1').href = decodeAmps(category1_val); // Replace '&amp;' with '&'
		// Sub-catorgory
		var category2_val = document.getElementById('category2').value;
		if (category2_val == '') {
			document.getElementById('categoryURL2').value = '';
			document.getElementById('categoryLlink2').href = '';
			} else {
			category2_val = encodeChars(category2_val);
			category2_val = category1_val + '&amp;sub_cat=' + category2_val;
			document.getElementById('categoryURL2').value = category2_val;
			document.getElementById('categoryLlink2').href = decodeAmps(category2_val); // Replace '&amp;' with '&'
		}
	}
}
function encodeChars(string_val) {
	string_val = string_val.replace(/\+/gi,"%2B");
	string_val = string_val.replace(/ /gi,"%20");
	return string_val;
}
function decodeAmps(in_string) {
	var url_string = in_string.replace(/&amp;/g,"&");
	return url_string;
}
function resetResourceLink() {
	document.getElementById('resourceLink').innerHTML = '';
}
function resetSearchResLink() {
	document.getElementById('searchResLink').innerHTML = '';
}
