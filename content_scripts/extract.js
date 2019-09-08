/*
 * NEWS CHECKER WEB EXTENSION
 * Author: Annabelle Lew
 * Year: 2019
 * File: content_scripts/extract.js
 * A lot of this code uses aspects of the Mozilla Developer tutorials for web extensions, which can be found here:
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
 * ----------
 * This code is inserted directly into the webpage to extract the article text.
 */
(function() {
    // Stores the different class names that article text is stored in on websites. Can be added on to as needed.
    let article_classes = [];
    article_classes.push("content-list-component yr-content-list-text text"); // huffpost
    article_classes.push("zn-body__paragraph"); // cnn
    article_classes.push("entry-content entry-content-read-more"); // nypost
    article_classes.push("collection collection-cards"); // chicago tribune
    article_classes.push("zn-body__paragraph speakable"); // cnn

    // The main extraction function. (may need debugging)
    function extractText() {
        // Get all the elements that could potentially be the article, and complies it into one <div> element.
        p_elements = document.getElementsByTagName("p"); // Gets all <p> elements since many articles are stored in <p> elements.
        var div_elements = [];
        var div = document.createElement("div");
        for (i in p_elements) {
            div.innerHTML += p_elements[i].textContent;
        }
        // Gets all the elements that have the class names that article text is stored in on websites.
        for (i in article_classes) {
            div_elements = document.getElementsByClassName(article_classes[i]);
            for (j in div_elements) {
                div.innerHTML += div_elements[j].textContent;
            }
        }
        data = div.textContent || div.innerText || "";
        // Sends the extension a message that the webpage has no article if no article is found.
        if (p_elements.length == 0 && div_elements.length == 0) {
            window.postMessage({ type: "FROM_PAGE_TO_CONTENT_SCRIPT",
                command: "empty" }, "*"
            );
        }
        // Sends the extension the article text if an article is found, as well as the article link (keeps track of individual articles).
        window.postMessage({ type: "FROM_PAGE_TO_CONTENT_SCRIPT",
            text: data, command: "insert", url: window.location.href }, "*"
        );
    }

    extractText(); // Run the extraction function when the page loads.

    // Send the extracted text when the extension requests it.
    window.addEventListener("message", function(event) {
        // We only accept messages from this window to itself [i.e. not from any iframes]
        if (event.source != window) {
            return;
        }

        if (event.data.type && (event.data.type == "FROM_PAGE_TO_CONTENT_SCRIPT")) {
            browser.runtime.sendMessage(event.data); // broadcasts it to rest of extension
        } // else ignore messages seemingly not sent to yourself
    }, false);
})();
