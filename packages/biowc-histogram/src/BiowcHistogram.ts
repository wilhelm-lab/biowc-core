import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class BiowcHistogram extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--biowc-histogram-text-color, #000);
    }
  `;

  @property({ type: String }) myTitle = 'Hey there';

  @property({ type: Number }) counter = 5;

  __increment() {
    this.counter += 1;
  }

  render() {
    return html`
      <h2>${this.myTitle} Nr. ${this.counter}!</h2>
      <button @click=${this.__increment}>increment</button>
    `;
  }
}
