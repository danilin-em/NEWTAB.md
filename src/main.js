import marked from 'marked';
import DEFAULTS from './defaults';

/* Helpers */
function truncate(input, length) {
    if (input.length > length) {
        return input.substring(0, length) + '...';
    } else {
        return input;
    }
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        /**
         * 83 - s
         * 88 - x
         */
        const editorPanel = document.getElementById('editor');
        const key = e.which || e.keyCode;
        if (e.ctrlKey && key == 83) {
            if (!editorPanel.classList.contains('hidden')) {
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
function initMarked() {
    marked.setOptions({
        highlight: function(code, lang) {
            if (['spoiler', '?'].includes(lang)) {
                return '<div class="spoiler">' + code + '</div>';
            }
            if (['copy', '!'].includes(lang)) {
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
    content.innerHTML = marked(markdown.value);
    markdown.onkeyup = markdown.onkeypress = function() {
        setStorageItem('content', this.value);
        content.innerHTML = marked(this.value);
    };
    document.addEventListener('click', function(e) {
        if (!e.target.matches('.copy')) return;
        if (navigator.clipboard) {
            const text = e.target.innerHTML;
            navigator.clipboard.writeText(text);
        }
        e.preventDefault();
    }, false);
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
        if (bookmarkTreeNodes) {
            const children = bookmarkTreeNodes[0].children;
            const bookmarks = document.getElementById('bookmarks');
            bookmarks.appendChild(dumpTreeNodes(children[0].children, 'root'));
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
    const list = document.createElement('ul');
    list.classList.add('list');
    list.classList.add('list-'+stage);
    let i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        list.appendChild(dumpNode(bookmarkNodes[i], stage));
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
    const title = document.createTextNode(truncate(bookmarkNode.title, 20));
    let item = document.createElement('span');
    item.appendChild(title);
    if (bookmarkNode.url) {
        item = document.createElement('a');
        item.setAttribute('href', bookmarkNode.url);
        item.appendChild(title);
        const url = new URL(bookmarkNode.url);
        if (['chrome:', 'chrome-extension:'].includes(url.protocol)) {
            if (chrome.tabs) {
                item.addEventListener('click', function(e) {
                    chrome.tabs.create({
                        url: bookmarkNode.url,
                    });
                    e.preventDefault();
                });
            }
        }
    }
    item.setAttribute('title', bookmarkNode.title);
    const li = document.createElement('li');
    li.classList.add('item');
    li.classList.add('item-' + stage);
    li.appendChild(item);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        li.appendChild(dumpTreeNodes(bookmarkNode.children, 'children'));
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
