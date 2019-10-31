
const DEFAULTS = {
    syncTimer: 700,
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

export default DEFAULTS;
