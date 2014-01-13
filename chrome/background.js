// Create context menu item.
chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		"title": "Link Carver",
		"contexts": ["page"],
		"id": "context-page"
	});
});

// Register listeners for browserAction and contextMenu.
chrome.browserAction.onClicked.addListener(initLinkProgram);
chrome.contextMenus.onClicked.addListener(initLinkProgram);

// Send 'go' signal to content page.
function initLinkProgram(info, tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {type: 'goSignal'}, function(response) {
            console.log("Sent message (background to content): 'go' signal.");
        });
    });
}

// Receives message from content page (links) and opens all links in new window.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'contentToBackground') {
        console.log("Received message (content to background): array of links.");
        var links = request.linksToOpen;
        chrome.windows.create({"url": links}); // opens links in new window
    }
    sendResponse();
});

