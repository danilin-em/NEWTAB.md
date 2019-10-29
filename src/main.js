import $ from 'jquery';
import marked from 'marked';

const DEFAULTS = {
    markdown: '# Marked in the browser\n\nRendered by **marked**.',
}

/* Marked */
function initMarked() {
    const markdown = document.getElementById('markdown');
    const content = document.getElementById('content');
    if (!markdown.value) {
        markdown.value = DEFAULTS.markdown;
    }
    content.innerHTML = marked(markdown.value);
    markdown.onkeyup = markdown.onkeypress = function() {
        content.innerHTML = marked(this.value);
    };
}

/* Bookmarks */
function initBookmarks() {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        console.log('bookmarkTreeNodes>>>', bookmarkTreeNodes);
        if (bookmarkTreeNodes) {
            const children = bookmarkTreeNodes[0].children;
            $('#bookmarks').append(dumpTreeNodes(children[0].children, 'root'));
        }
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
    if (!bookmarkNode.title) {
        bookmarkNode.title = '[X]';
        if (bookmarkNode.url) {
            const url = new URL(bookmarkNode.url);
            bookmarkNode.title = url.hostname + (url.port ? ':'+url.port : '');
        }
    }
    const anchor = $('<a>');
    anchor.attr('href', bookmarkNode.url);
    anchor.text(bookmarkNode.title);
    anchor.click(function() {
        chrome.tabs.create({url: bookmarkNode.url});
    });
    const span = $('<span>');
    span.append(anchor);
    const li = $('<li class="item item-'+stage+'">').append(span);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        li.append(dumpTreeNodes(bookmarkNode.children, 'children'));
    }
    return li;
}


function init() {
    initMarked();
    initBookmarks();
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(function(items) {
        if (!chrome.runtime.error) {
            for (const [key, value] of Object.entries(items)) {
                localStorage.setItem(key, value);
            }
            init();
        }
    });
});
