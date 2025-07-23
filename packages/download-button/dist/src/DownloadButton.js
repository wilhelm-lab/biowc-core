import { __decorate } from "tslib";
import { property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import styles from './download-button.css';
export class DownloadButton extends LitElement {
    render() {
        return html `
      <button id='btn' @click='${this._download}'>Download SVG</button>`;
    }
    _download() {
        var _a;
        let svg = (_a = this.svgComponent) === null || _a === void 0 ? void 0 : _a.exportSvg();
        if (!svg.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
            svg = svg.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!svg.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
            svg = svg.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
        if (svg) {
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = 'download.svg';
            a.href = url;
            a.click();
        }
    }
}
DownloadButton.styles = styles;
__decorate([
    property({ attribute: false })
], DownloadButton.prototype, "svgComponent", void 0);
//# sourceMappingURL=DownloadButton.js.map