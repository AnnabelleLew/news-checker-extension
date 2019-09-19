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

// Handles the extract.js messages.
var page_url = window.location.href;
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "insert") {
        // Store the article text in a <p> element in the code.
        if (message.text != "") {
            p.textContent = message.text;
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
var gettingCookies = browser.cookies.get({
    url: "http://127.0.0.1:8000/",
    name: "news_checker_username"
});
// If the cookie if found, insert the username in the extension page.
gettingCookies.then((cookie) => {
    if (cookie) {
        username_display.textContent = "Username: "+cookie.value;
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

// Handle the submit button.
let submitButton = document.getElementById("submit");
let p = document.createElement("p");
submitButton.onclick = function(){
    // Reruns the script to ensure the article data is recieved by the extension.
    browser.tabs.executeScript({file: "/content_scripts/extract.js"})
    .catch(reportExecuteScriptError);

    // Stores the article to be sent.
    var article = p.textContent.replace(/ /g,"_").replace(/"/g,"'").replace(/“/g,"'").replace(/”/g,"'").replace(/[\/#!$%\^&\*;:{}=\-_`~()]/g,"_");
    var bias = slider.value.toString();

    // Sends the article data to the News Checker website.
    location.href = "http://127.0.0.1:8000/catalog/add?url="+page_url+"&text="+article+"&bias="+bias;
};
