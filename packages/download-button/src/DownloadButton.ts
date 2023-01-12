import { property } from 'lit/decorators.js';
import { html, LitElement, PropertyValues } from 'lit';
import { HTMLTemplateResult } from 'lit/development';

import styles from './download-button.css';


export class DownloadButton extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  downloadablesvgid: string = '';

  render(): HTMLTemplateResult {
    return html`
      <button id='downloadbutton'>Download</button>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.addEventListener('click', () => {
      console.log('Clicked')
      const svgNodes = document.getElementById(this.downloadablesvgid)
      console.log(svgNodes)
      const svgNodes2 = this.shadowRoot!.getElementById(this.downloadablesvgid)
      console.log(this.downloadablesvgid)
    })
    super.firstUpdated(_changedProperties);
  }
}
