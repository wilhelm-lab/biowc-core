import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class BiowcLineplot extends LitElement {
  @property({ type: String }) mytitle = 'Hey there';

  @property({ attribute: false })
  dataPoints: number[][][] = [];

  render() {
    return html` <p>${JSON.stringify(this.dataPoints)}</p> `;
  }
}
