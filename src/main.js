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
            if (!$('#editor').hasClass('hidden')) {
                const markdown = document.getElementById('markdown');
                setStorageItem('content', markdown.value);
                switchEditorMode();
            }
            e.preventDefault();
        } else if (e.ctrlKey && key == 88) {
            switchEditorMode();
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
    return marked(value);
}
function initMarked() {
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang === 'spoiler') {
                return '<div class="spoiler">' + code + '</div>';
            }
            if (lang === 'copy') {
                return '<div class="copy">' + code + '</div>';
            }
        },
    });
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
    $(document).on('click', '.copy', function(e) {
        if (navigator.clipboard) {
            const text = $(e.target).html();
            navigator.clipboard.writeText(text);
        }
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

/* Editor */
function switchEditorMode() {
    const editBtn = document.getElementById('edit');
    const editorPanel = document.getElementById('editor');
    const markdownTextArea = document.getElementById('markdown');
    editorPanel.classList.toggle('hidden');
    if (editorPanel.classList.contains('hidden')) {
        editBtn.innerHTML = 'Edit <span>Ctrl+X</span>';
    } else {
        markdownTextArea.focus();
        editBtn.innerHTML = 'Save <span>Ctrl+S</span>';
    }
}
function initEditor() {
    const edit = document.getElementById('edit');
    edit.addEventListener('click', () => {
        switchEditorMode();
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
    let item = $('<span>').html(bookmarkNode.title);
    if (bookmarkNode.url) {
        item = $('<a>');
        item.attr('href', bookmarkNode.url);
        item.text(bookmarkNode.title);
        const url = new URL(bookmarkNode.url);
        if (['chrome:', 'chrome-extension:'].includes(url.protocol)) {
            if (chrome.tabs) {
                item.click(function(e) {
                    chrome.tabs.create({
                        url: bookmarkNode.url,
                    });
                    e.preventDefault();
                });
            }
        }
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
    initEditor();
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
