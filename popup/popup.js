/*
 * NEWS CHECKER WEB EXTENSION
 * Author: Annabelle Lew
 * Year: 2019
 * File: popup/popup.js
 * A lot of this code uses aspects of the Mozilla Developer tutorials for web extensions, which can be found here:
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
 * ----------
 * This code is used in the web extension popup, and handles sending the data to the News Checker website.
 */

// There was an error executing the script. Display the popup's error message, and hide the normal UI.
function reportExecuteScriptError(error) {
    document.getElementById("error-content").classList.remove("hidden");
    document.getElementById("submit").classList.add("hidden");
    console.error(`Failed to execute article extraction script: ${error.message}`);
}

// When the popup loads, inject a content script into the active tab. If we couldn't inject the script, handle the error.
browser.tabs.executeScript({file: "/content_scripts/extract.js"})
.catch(reportExecuteScriptError);

let text_element = document.getElementById("text");
let url_element = document.getElementById("url");
var username = ""

// Handles the extract.js messages.
var page_url = window.location.href;
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "insert") {
        // Store the article text in a <p> element in the code.
        if (message.text != "") {
            text_element.textContent = message.text.replace(/ /g,"_").replace(/"/g,"'").replace(/“/g,"'").replace(/”/g,"'").replace(/[\/#!$%\^&\*;:{}=\-_`~()]/g,"_");
            url_element.urlContent = page_url;
        }
        page_url = message.url;
    } else if (message.command === "empty") {
        // Edits the extension so that you cannot submit non-articles to the database.
        document.getElementById("error-content").classList.remove("hidden");
        document.getElementById("submit").classList.add("hidden");
    }
});

// Ensures the user is logged in before using the extension.
var username_display = document.getElementById("username");
// Checks for the website username cookie.
var gettingCookies = browser.cookies.getAll({
	domain: "www.newschecker.org",
    name: "news_checker_username"
});
// If the cookie if found, insert the username in the extension page.
gettingCookies.then((cookie) => {
    if (cookie) {
    	console.log(cookie[0]);
        username_display.textContent = "Username: "+cookie[0].value;
        username = cookie[0].value;
        document.getElementById("submit").classList.remove("hidden");
    }
});
//If no username is found, make the extension unusable.
if (username_display.textContent == "") {
    username_display.textContent = "Please log in to use this extension.";
    document.getElementById("submit").classList.add("hidden");
}

// Handles the slider input.
var slider = document.getElementById("range");
var output = document.getElementById("output");
output.textContent = "Unbiased"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    switch (this.value.toString()) {
        case "-5":
            output.textContent = "Very strong left bias";
            break;
        case "-4":
            output.textContent = "Strong left bias";
            break;
        case "-3":
            output.textContent = "Left bias";
            break;
        case "-2":
            output.textContent = "Weak left bias";
            break;
        case "-1":
            output.textContent = "Very weak left bias";
            break;
        case "0":
            output.textContent = "Unbiased";
            break;
        case "1":
            output.textContent = "Very weak right bias";
            break;
        case "2":
            output.textContent = "Weak right bias";
            break;
        case "3":
            output.textContent = "Right bias";
            break;
        case "4":
            output.textContent = "Strong right bias";
            break;
        case "5":
            output.textContent = "Very strong right bias";
            break;
        default:
            output.textContent = "Slider is broken. Please try again later. Value = " + this.value.toString()
    }
}

let submitButton = document.getElementById("submit");
var xhttp = new XMLHttpRequest();
submitButton.onclick = function(){
	browser.tabs.executeScript({file: "/content_scripts/extract.js"})
	.catch(reportExecuteScriptError);
	var bias = slider.value.toString();
	var data = new FormData();
	console.log(page_url);
	data.append("url", page_url);
	console.log(text_element.textContent.replace(/\W/g, ''));
	data.append("text", text_element.textContent.replace(/\W/g, ''));
	console.log(bias);
	data.append("bias", bias);
	data.append("username", username);
	xhttp.open("POST", "http://www.newschecker.org/catalog/add/", true);
	xhttp.send(data);
	xhttp.onreadystatechange = function() {
		console.log(xhttp.readyState === xhttp.DONE);
		console.log(xhttp.status);
		if (xhttp.readyState === xhttp.DONE) {
			console.log(xhttp.responseText);
       		if (xhttp.status === 200) {
				console.log('testing');
				console.log(xhttp.responseText);
       			var data = JSON.parse(xhttp.responseText);
       			var uploadResult = data['message'];
        		console.log('uploadResult=',uploadResult);
				if (uploadResult=='failure'){
					console.log('failed to upload data');
        			displayError('failed to upload');
        		} else if (uploadResult=='success'){
        			console.log('successfully uploaded file');
        			location.href = "added.html";
        		}
        	}
        }
    }
};