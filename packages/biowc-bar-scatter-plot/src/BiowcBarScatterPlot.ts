import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { HTMLTemplateResult } from 'lit/development';
import styles from './biowc-bar-scatter-plot.css';

import '../../../biowc-scatter/dist/src/biowc-scatter.js';
import '../../../biowc-barplot/dist/src/biowc-barplot.js';

// eslint-disable-next-line lit/no-native-attributes
export class BiowcBarScatterPlot extends LitElement {
  static styles = styles;

  @property({ type: String }) title = 'Hey there';

  @property({ type: Number }) counter = 5;

  @property({ attribute: false })
  barplotProperties: any = [];

  @property({ attribute: false })
  scatterProperties: any = [];

  @property({ attribute: false })
  selectedIds: string = '';

  @property({ attribute: false })
  xValues: { [key: string]: number | string }[] = [];

  @property({ attribute: false })
  yValues: { [key: string]: number | string }[] = [];

  @property({ attribute: false })
  xValuesSel: any[] = [];

  @property({ attribute: false })
  yValuesSel: any[] = [];

  @property({ attribute: false })
  selIndeces: any[] = [];

  __increment() {
    this.counter += 1;
  }

  render(): HTMLTemplateResult {
    this.initScatterValues();
    return html`
      <biowc-barplot
        .minWidth="${this.barplotProperties.minWidth}"
        .minHeight="${this.barplotProperties.minHeight}"
        .barWidth="${this.barplotProperties.barWidth}"
        .myTitle="${this.barplotProperties.myTitle}"
        .multiSelection="${this.barplotProperties.multiSelection}"
        .data="${this.barplotProperties.data}"
        .sSelectedModelIds="${this.barplotProperties.sSelectedModelIds}"
        @model-selected="${this.inputChanged}"
      >
      </biowc-barplot>
      <biowc-scatter
        .idKey="${this.scatterProperties.idKey}"
        .valueKey="${this.scatterProperties.valueKey}"
        .xLabel="${this.scatterProperties.xLabel}"
        .yLabel="${this.scatterProperties.yLabel}"
        .xValues="${this.xValuesSel}"
        .yValues="${this.yValuesSel}"
      >
      </biowc-scatter>
    `;
  }

  initScatterValues() {
    this.xValues = this.scatterProperties.xValues;
    this.yValues = this.scatterProperties.yValues;
    this.selectedIds = this.barplotProperties.sSelectedModelIds;
  }

  inputChanged(event: any) {
    this.selectedIds = event.detail.sSelectedModelIds;
    if (this.selectedIds.length > 0) {
      this.selIndeces = this.selectedIds.split(';').map(Number);
    } else {
      this.selIndeces = [];
    }
    this.xValuesSel = this.selIndeces.map(x => this.xValues[x]);
    this.yValuesSel = this.selIndeces.map(x => this.yValues[x]);
  }

  /* protected updated(_changedProperties: PropertyValues) {
    _changedProperties.forEach((oldValue, propName) => {
      if (propName === 'xValuesSel' || propName === 'yValuesSel') {
        this._getScatterPlot().attr('xValues', this.xValuesSel);
        this._getScatterPlot().attr('yValues', this.yValuesSel);
      }
    });
  } */
}
