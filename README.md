# CoCreate-web-share

Declarative access to the browser Web Share API.

## Install

```sh
yarn add @cocreate/web-share
```

Or load the browser bundle from `https://cdn.cocreate.app/web-share/latest/CoCreate-web-share.min.js`.

## Usage

The module opens the native share sheet with a URL and text. The user chooses an available destination, such as a messaging app, email client, or social app. The site cannot select the destination.

The share sheet must be opened directly by a user action, such as a click. Support depends on the browser and device, and requires a secure context (usually HTTPS). If the user closes the sheet, sharing is simply cancelled.

### Share a page

```html
<button share share-title="A page" share-text="Take a look" share-url="https://example.com">Share</button>
```

`share-title`, `share-text`, and `share-url` are optional. They default to the document title, description meta content, and URL in this order: explicit `share-url`, the element's `href` if it is a link, then the current page URL. CoCreate render placeholders can provide dynamic values. The `share` attribute handles the click; no separate click query is needed.

### Use the CoCreate action

Use either the `share` attribute or the `share` action on a control, not both. Use `actions="share"` when sharing should run as part of an action chain. Add the `share-*` attributes to the action element as needed. A link's default navigation is prevented when it is used as a share trigger.

```html
<button actions="share" share-title="A page" share-url="https://example.com">
	Share
</button>
```

The action continues when the share promise resolves or when the user cancels. The API does not report the selected destination or confirm delivery. Unsupported APIs and other failures abort the action chain. Keep `share` as the first action so it remains within the browser's user-activation window. Direct `[share]` failures dispatch a bubbling `shareError` event; user cancellation is not treated as an error.

### Share selected files

Keep the file input separate from the share button. The button's `share-files-query` selects one or more file inputs and shares their current selection; clicking the button does not open the file picker.

```html
<input id="files-to-share" type="file" accept="image/*" multiple />
<button
	type="button"
	share
	share-title="Selected images"
	share-text="Images from this page"
	share-files-query="$document #files-to-share">
	Share selected files
</button>
```

The selected file types must be supported by the browser and device. If the query is present but no files are selected, the share request fails instead of opening a text-only share sheet.

See [`demo/index.html`](demo/index.html) and the [documentation](docs/index.html).
