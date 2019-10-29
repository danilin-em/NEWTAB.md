import $ from 'jquery';
import marked from 'marked';

const DEFAULTS = {
    markdown: '# Marked in the browser\n\nRendered by **marked**.',
    bookmarks: [
        // "Bookmarks bar"
        {
            title: '',
            children: [
                {
                    title: '',
                    children: [
                        {
                            title: 'Home',
                            children: [
                                {
                                    title: 'YouTube',
                                    url: 'https://www.youtube.com/feed/subscriptions',
                                },
                                {
                                    title: 'Music',
                                    url: 'https://music.yandex.ru/artist/3095130',
                                },
                            ],
                        },
                        {
                            title: 'Office',
                            children: [
                                {
                                    title: 'Editors',
                                    children: [
                                        {
                                            title: 'Google',
                                            children: [
                                                {
                                                    title: 'Drive',
                                                    url: 'https://drive.google.com/drive/u/0/my-drive',
                                                },
                                                {
                                                    title: 'Sheets',
                                                    url: 'https://docs.google.com/spreadsheets/u/0/',
                                                },
                                                {
                                                    title: 'Docs',
                                                    url: 'https://docs.google.com/document/u/0/',
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    title: 'Mail',
                                    url: 'https://mail.google.com/mail/u/0/#inbox',
                                },
                            ],
                        },
                        {
                            title: 'Fun',
                            children: [
                                {
                                    title: 'PornHub',
                                    url: 'https://www.pornhub.com/',
                                },
                                {
                                    title: 'Reddit',
                                    url: 'https://www.reddit.com/',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

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
    if (chrome.tabs) {
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
