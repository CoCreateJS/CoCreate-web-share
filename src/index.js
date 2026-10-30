/********************************************************************************
 * Copyright (C) 2023 CoCreate and Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ********************************************************************************/

/**
 * Commercial Licensing Information:
 * For commercial use of this software without the copyleft provisions of the AGPLv3,
 * you must obtain a commercial license from CoCreate LLC.
 * For details, visit <https://cocreate.app/licenses/> or contact us at sales@cocreate.app.
 */

import Actions from "@cocreate/actions";
import { queryElements } from "@cocreate/utils";
import Observer from "@cocreate/observer";

const selector = "[share]";
const initializedElements = new WeakSet();

function collectShareElements(root, elements = new Set()) {
	if (!root) return elements;

	if (root.matches?.(selector)) elements.add(root);
	if (root.querySelectorAll) {
		for (const element of root.querySelectorAll(selector)) elements.add(element);
		return elements;
	}

	if (root[Symbol.iterator]) {
		for (const item of root) collectShareElements(item, elements);
	}
	return elements;
}

function init(root = document) {
	for (const element of collectShareElements(root)) {
		if (initializedElements.has(element)) continue;
		initializedElements.add(element);
		element.addEventListener("click", (event) => {
			const shareElement = event.currentTarget;
			event.preventDefault();
			share(shareElement).catch((error) =>
				handleShareError(shareElement, error)
			);
		});
	}
}

function getShareData(element) {
	const data = {
		title: element.getAttribute("share-title") || document.title,
		text:
			element.getAttribute("share-text") ||
			document.querySelector('meta[name="description"]')?.content ||
			"",
		url:
			element.getAttribute("share-url") ||
			element.href ||
			window.location.href
	};

	const fileTargets = queryElements({ element, prefix: "share-files" });
	const files = fileTargets.flatMap((target) => Array.from(target.files || []));
	if (files.length) data.files = files;
	else if (element.hasAttribute("share-files-query")) {
		throw new Error("Select at least one file to share.");
	}
	return data;
}

async function share(element) {
	if (!element) throw new Error("A share element is required.");
	if (typeof navigator.share !== "function") {
		throw new Error("The Web Share API is not supported in this browser.");
	}

	const data = getShareData(element);
	if (
		data.files &&
		typeof navigator.canShare === "function" &&
		!navigator.canShare({ files: data.files })
	) {
		throw new Error("This browser or device cannot share the selected files.");
	}
	return navigator.share(data);
}

function handleShareError(element, error) {
	// Dismissing the native share sheet is a normal user choice.
	if (error?.name === "AbortError") return;

	element?.dispatchEvent(
		new CustomEvent("shareError", {
			bubbles: true,
			detail: { error }
		})
	);
	console.error("Web Share failed:", error);
}

Observer.init({
	name: "webshare",
	types: ["addedNodes"],
	selector,
	callback: (mutation) => init(mutation.target)
});

Actions.init({
	name: "share",
	callback: async ({ element, end, abort }) => {
		try {
			await share(element);
			end();
		} catch (error) {
			if (error?.name === "AbortError") end({ cancelled: true });
			else abort(error);
		}
	}
});

init();

export { init, share };
export default { init, share };
