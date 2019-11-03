import $ from 'jquery';
import marked from 'marked';
import DEFAULTS from './defaults';

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        /**
         * 83 - s
         * 88 - x
         */
        const key = e.which || e.keyCode;
        if (e.ctrlKey && key == 83) {
            const markdown = document.getElementById('markdown');
            setStorageItem('content', markdown.value);
            $('#editor').addClass('hidden');
            e.preventDefault();
        } else if (e.ctrlKey && key == 88) {
            $('#editor').toggleClass('hidden');
            e.preventDefault();
        }
    });
}

/* Storage */
let syncTimer;
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

/* Marked */
function renderMarked(value) {
    const edit = '<button id="edit">edit</button>';
    return edit + marked(value);
}
function initMarked() {
    const markdown = document.getElementById('markdown');
    const content = document.getElementById('content');
    markdown.value = getStorageItem('content');
    if (!markdown.value) {
        markdown.value = DEFAULTS.markdown;
    }
    content.innerHTML = renderMarked(markdown.value);
    markdown.onkeyup = markdown.onkeypress = function() {
        setStorageItem('content', this.value);
        content.innerHTML = renderMarked(this.value);
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
        const url = new URL(bookmarkNode.url);
        bookmarkNode.title = url.hostname + (url.port ? ':'+url.port : '');
    }
    let item = $('<span>').html(bookmarkNode.title);
    if (bookmarkNode.url) {
        item = $('<a>');
        item.attr('href', bookmarkNode.url);
        item.text(bookmarkNode.title);
    }
    const li = $('<li class="item item-'+stage+'">').append(item);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        li.append(dumpTreeNodes(bookmarkNode.children, 'children'));
    }
    return li;
}

function init() {
    initMarked();
    initBookmarks();
    initKeyboardShortcuts();
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
