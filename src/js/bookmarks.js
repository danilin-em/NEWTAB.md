const $ = require('jquery');

function dumpBookmarks() {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        console.log('bookmarkTreeNodes>>>', bookmarkTreeNodes);
        $('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes[0].children, 'root'));
    });
}

function dumpTreeNodes(bookmarkNodes, stage) {
    const list = $('<ul class="list list-'+stage+'">');
    let i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        list.append(dumpNode(bookmarkNodes[i], stage));
    }
    return list;
}

function dumpNode(bookmarkNode, stage) {
    let anchor = $('<span>').text('X');
    if (bookmarkNode.title) {
        anchor = $('<a>');
        anchor.attr('href', bookmarkNode.url);
        anchor.text(bookmarkNode.title);
        anchor.click(function() {
            chrome.tabs.create({url: bookmarkNode.url});
        });
    }
    const span = $('<span>');
    span.append(anchor);
    const li = $('<li class="item item-'+stage+'">').append(span);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        li.append(dumpTreeNodes(bookmarkNode.children, 'children'));
    }
    return li;
}

module.exports = {
    dumpBookmarks: dumpBookmarks,
};
