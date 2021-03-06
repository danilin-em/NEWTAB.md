# NEWTAB.md

[![Build Status](https://github.com/danilin-em/NEWTAB.md/workflows/CI/badge.svg)](https://github.com/danilin-em/NEWTAB.md/actions?query=workflow%3ACI)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/61ca11b9447045a4952ec50c34afb0fe)](https://www.codacy.com/manual/danilin-em/NEWTAB.md?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=danilin-em/NEWTAB.md&amp;utm_campaign=Badge_Grade)

Use New tab page, as Markdown notepad.

![Preview](./doc/preview.gif)

## Extensions

### Spoiler

```markdown

    ```spoiler

    My Hidden Text

    ```

```

### Copy to clipboard

```markdown

    ```copy

    Click on me to copy this text!

    ```

```

## Development

### Prepare

```sh

# 0. Clone repo
git clone git@github.com:danilin-em/NEWTAB.md.git

# 1. Go to folder
cd NEWTAB.md

# 2. Install requirements
npm install

```

#### Way 1: Dev Server (Without instalation)

```sh

# Start Dev Server
npm run dev

```

See on: [http://localhost:3000/](http://localhost:3000/)

> Note: *Bookmarks bar* shows **example data**

#### Way 2: Load Extension

```sh

# Watch & Build changes
npm run watch

```

1. Go to `chrome://extensions`
2. Enable `Developer mode`
3. Use `Load Unpacked Extension` select the `dist/` in repository
