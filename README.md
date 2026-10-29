# CoCreate-web-share

Declarative access to the browser Web Share API.

## Install

```sh
yarn add @cocreate/web-share
```

Or load the browser bundle from `https://cdn.cocreate.app/web-share/latest/CoCreate-web-share.min.js`.

## Usage

Use the share attribute or the share action to open the browser or device share sheet. It must be called from a user gesture and is available only where the browser supports it.

```html
<button share share-title="A page" share-text="Take a look" share-url="https://example.com">Share</button>
```

See [`demo/index.html`](demo/index.html) and the [documentation](docs/index.html).
