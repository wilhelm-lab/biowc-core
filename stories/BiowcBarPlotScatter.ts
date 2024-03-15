import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { HTMLTemplateResult } from 'lit/development';
import '../packages/biowc-scatter/dist/src/biowc-scatter.js';
import '../packages/biowc-barplot/dist/src/biowc-barplot.js';

// eslint-disable-next-line lit/no-native-attributes
class BiowcBarScatterPlot extends LitElement {
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

  inputChanged(event: CustomEvent) {
    this.selectedIds = event.detail.sSelectedModelIds;
    if (this.selectedIds.length > 0) {
      this.selIndeces = this.selectedIds.split(';').map(Number);
    } else {
      this.selIndeces = [];
    }
    this.xValuesSel = this.selIndeces.map(x => this.xValues[x]);
    this.yValuesSel = this.selIndeces.map(x => this.yValues[x]);

    // need to explicitly request update for this to work in storybook:
    // https://stackoverflow.com/questions/70768243/lit-components-do-not-automatically-request-an-update-on-property-change-proble
    // this can be removed when not running in storybook
    this.requestUpdate();
  }
}

window.customElements.define('biowc-bar-scatter-plot', BiowcBarScatterPlot);