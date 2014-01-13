// listens for 'go' signal from extension background
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'goSignal') {
            console.log("Received message (background to content): 'go' signal.");
            LinkProgram();
        }
        sendResponse();
    }
);

function LinkProgram() {
    var node1,
        node2,
        nodeAncestor,
        commonPath,
        links;
    
    reset();
    prepPageLinks();

    // Disables all link clicks. Defers clicks to handleLinkClick.
    function prepPageLinks() {
        document.onclick = function(e) {
            var element = e.target;
            if (element.tagName === 'A') {
                handleLinkClick(element);
                return false; // disable redirect
            }
        }
    }
    
    // Stores linkNode as node1 or node2 if not already assigned.
    function handleLinkClick(linkNode) {
        if (node1 === undefined) {
            node1 = linkNode;
            console.log("First Node selected: " + node1);
        }
        else if (node2 === undefined) {
            node2 = linkNode;
            console.log("Second Node selected: " + node2);
            
            // algorithm functions...
            extractLinks();
            sendLinksToBackground(links);
            restoreAllLinks();
        }
        else {
            alert("You have already selected the links.");
        }
    }
    
    // Sends final array of links to extension background
    function sendLinksToBackground(linkArray) {
        chrome.runtime.sendMessage({
            type : 'contentToBackground',
            linksToOpen : linkArray
        },
        function (response) {
            console.log("Sent Message (content to background): array of links.");
        });
    }

    // Restores all links in document to previous state
    function restoreAllLinks() {
        document.onclick = function(e) {
            var element = e.target;
            if (element.tagName === 'A') {
                return true; // enable redirect
            }
        }
    }
    
    // Extracts links to 'links' array var.
    function extractLinks() {
        console.log("Extracting links.");
        findChildLinks(commonAncestor(node1, node2));
    }
    
    // Returns the nearest common ancestor node of node1 and node2.  Also saves the commonPath to ancestor.
    function commonAncestor(nodeA, nodeB) {
        if (nodeA === undefined || nodeB === undefined) {
            console.log("Error: null argument given for commonAncestor");
            return undefined;
        }
        var i = 0;
        var ancestorA = nodeA;
        var ancestorB = nodeB;
        while (ancestorA !== ancestorB) {
            ancestorA = ancestorA.parentNode;
            ancestorB = ancestorB.parentNode;
            commonPath[i] = ancestorA.tagName;
            i++;
        }
        nodeAncestor = ancestorA;
        return ancestorA; // parentA = parentB = common
    }
    
    // Recursively finds all links that are decendents of nodeX with commonPath.  Pushed href of links into 'links' array.
    function findChildLinks(nodeX) {
        if (nodeX === null) return;
        if (nodeX.nodeType === 3) return; // skip text nodes
        
        if (nodeX.tagName === 'A') {
            if (arraysEqual(commonPath, getTagPath(nodeX, nodeAncestor))) {
                console.log("Added " + nodeX + " to links array.");
                links.push(nodeX.getAttribute('href'));
            }
        }
        
        var list = nodeX.childNodes;
        // recursively cycle through node children
        for (var i = 0, len = list.length; i < len; i++) {
            findChildLinks(list[i]);
        }
    }
    
    // Returns tag path from nodeA to nodeB (ancestor of nodeA).
    function getTagPath(nodeA, nodeB) {
        if (nodeA === null || nodeB === null) {
            console.log("Error: null argument given for getTagPath");
            return;
        }
        var tagPath = [];
        var nodeX = nodeA;
        while (nodeX !== nodeB) {
            nodeX = nodeX.parentNode;
            if (nodeX === null) {
                console.log("Error:invalid arguments for getTagPath. nodeB is not ancestor of nodeA");
                return undefined;
            }
            tagPath.push(nodeX.tagName);
        }
        return tagPath;
    }
    
    // Resets vars.
    function reset() {
        console.log("Resetting Link Program");
        node1 = node2 = undefined;
        commonPath = [];
        links = [];
    }
    
    // checks if arrays contain equal values (position dependent)
    function arraysEqual(a, b) {
      if (a === b) return true;
      if (a === null || b === null) return false;
      if (a.length !== b.length) return false;
    
      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
}