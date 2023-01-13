import { property } from 'lit/decorators.js';
import { html, LitElement, PropertyValues } from 'lit';
import { HTMLTemplateResult } from 'lit/development';
import styles from './download-button.css'
import { ExportSvgComponent } from './ExportSvgComponent';


export class DownloadButton extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  svgComponent: ExportSvgComponent | undefined;

  render(): HTMLTemplateResult {
    return html`
      <button id='btn' @click='${this._download}'>Download SVG</button>`;
  }

  private _download() {
    let svg = this.svgComponent?.exportSvg();

    if (
      !svg!.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
    ) {
      svg = svg!.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!svg!.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      svg = svg!.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
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
