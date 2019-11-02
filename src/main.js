import $ from 'jquery';
import marked from 'marked';
import DEFAULTS from './defaults';

let syncTimer;

/* Storage */
function setStorageItem(key, value) {
    localStorage.setItem(key, value);
    const data = {};
    data[key] = value;
    clearTimeout(syncTimer);
    if (chrome.storage) {
        syncTimer = setTimeout(function() {
            chrome.storage.sync.set(data);
        }, DEFAULTS.syncTimer);
    }
}
function getStorageItem(key) {
    const value = localStorage.getItem(key);
    return value;
}

window.setStorageItem = setStorageItem;
window.getStorageItem = getStorageItem;

/* Marked */
function initMarked() {
    const edit = '<button id="edit">edit</button>';
    const markdown = document.getElementById('markdown');
    const content = document.getElementById('content');
    markdown.value = getStorageItem('content');
    if (!markdown.value) {
        markdown.value = DEFAULTS.markdown;
    }
    content.innerHTML = edit + marked(markdown.value);
    markdown.onkeyup = markdown.onkeypress = function() {
        setStorageItem('content', this.value);
        content.innerHTML = marked(this.value);
    };
    $('#edit').on('click', function() {
        $('#editor').toggleClass('hidden');
    });
}

/* Bookmarks */
function getBookmarksTree(callback) {
    if (!chrome.bookmarks) {
        return callback(DEFAULTS.bookmarks);
    }
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        callback(bookmarkTreeNodes);
    });
}
function initBookmarks() {
    getBookmarksTree(function(bookmarkTreeNodes) {
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
    init();
    if (chrome.storage) {
        chrome.storage.sync.get(function(items) {
            if (!chrome.runtime.error) {
                for (const [key, value] of Object.entries(items)) {
                    localStorage.setItem(key, value);
                }
            }
        });
    }
});
