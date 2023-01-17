import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { HTMLTemplateResult, PropertyValues } from 'lit/development';
import * as d3v6 from 'd3';
import styles from './biowc-swarmplot.css';

export class BiowcSwarmplot extends LitElement {
  static styles = styles;

  @property({ type: String }) mytitle = 'Hey there';

  @property({ attribute: false })
  xValues: { [key: string]: number | string }[] = [];

  @property({ attribute: false })
  xLabel: string = '';

  render(): HTMLTemplateResult {
    return html` <div style="display: flex">
      <div id="swarmplot"></div>
      <download-button
        .svgComponent="${this}"
        style="margin-left: 20px;"
      ></download-button>
    </div>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this._plotSwarmplot();

    super.firstUpdated(_changedProperties);
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3v6.select(this.shadowRoot).select('#swarmplot');
  }

  private _plotSwarmplot() {
    // set the dimensions and margins of the graph
    // const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    // const width = 460 - margin.left - margin.right;
    // const height = 400 - margin.top - margin.bottom;

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const mainDiv = this._getMainDiv();
  }
}
