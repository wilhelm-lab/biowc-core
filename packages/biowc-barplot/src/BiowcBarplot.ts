import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { HTMLTemplateResult } from 'lit/development';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as d3 from 'd3';
import styles from './biowc-barplot.css';

// fix css
// make data more generic (and simpler)
// deal with interactivity
// add colors?
// clean code

interface IContent {
  modelId: number;
  drugId: number;
  cellLineId: number;
  value: number;
  minValue: number;
  maxValue: number;
  drug: string;
  cellLine: string;
  dataset: string;
}

interface IData {
  attributeType: string;
  dataset: string;
  data: IContent[];
}

export class BiowcBarplot extends LitElement {
  static styles = styles;

  // @property({ type: String }) title = 'Hey there';

  @property({ type: Number }) counter = 5;

  @property({ attribute: false })
  minWidth: number = 200;

  @property({ attribute: false })
  minHeight: number = 300;

  @property({ attribute: false })
  barWidth: number = 11;

  @property({ attribute: false })
  // data: any = undefined;
  data: IData = { attributeType: '', dataset: '', data: [] };

  // protein selected through Dropdown
  @property({ attribute: false })
  selectedModelIds: number[] = [];

  @property({ attribute: false })
  sSelectedModelIds: any = undefined;

  // @property({ attribute: false }) title: string = "";
  @property({ attribute: false })
  multiSelection: boolean = true;

  __increment() {
    this.counter += 1;
  }

  render(): HTMLTemplateResult {
    return html`
      <div>
        <div id="barplot" class="barplotClass"></div>
        <v-btn
          x-small
          class="barPlotClearSelectionButton"
          v-if="multiSelection"
          @click="clearSelectedBars"
          @keyup="clearSelectedBars"
          :disabled="
        !this.selectedModelIds || this.selectedModelIds.length == 0
      "
        >
          Clear selection
        </v-btn>
      </div>
    `;
  }

  private onModelSelected(obj: any) {
    const selectEvent = new CustomEvent('send-message', {
      detail: {
        selectedModelId: obj,
      },
    });
    this.dispatchEvent(selectEvent);
  }

  clearSelectedModelIds() {
    this.selectedModelIds = [];
  }

  clearSelectedBars() {
    this.clearSelectedModelIds();
    d3.selectAll('.Bar').attr('class', 'Bar');
    d3.selectAll('.BackgroundBar').attr('class', 'BackgroundBar');

    this.onModelSelected({
      AttributeType: this.data.attributeType,
      SelectedModelIds: this.selectedModelIds,
    });
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3.select(this.shadowRoot).select('#barplot');
  }

  drawPlot(oData: IData) {
    const that = this;

    this.clearSelectedModelIds();

    // eslint-disable-next-line no-param-reassign
    oData.data = oData.data.sort((a, b) => b.value - a.value);

    const margin = {
      top: 60,
      right: 230,
      bottom: 120,
      left: 50,
    };

    /*
    oData.data
      .map((e) =>
        e.modelId.toString().split(';')
      )
      .reduce((prev, next) => prev.concat(next), []);
*/

    const bSameDrug = true;

    const bSameCellLine = true;

    const height = this.minHeight - margin.top - margin.bottom;
    const width = Math.max(
      oData.data.length * this.barWidth,
      Number(this._getMainDiv().attr('width'))
    );
    this._getMainDiv().selectAll('svg').remove();

    const svg = this._getMainDiv()
      .append('svg')
      .attr('class', 'BarContainer')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    //    this.svg = svg;

    //  legend
    svg.append('g');

    const content = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Y-AXIS
    const minY = Number(
      d3.min(oData.data, d => (d.minValue > 0 && d.value > 0 ? 0 : d.minValue))
    );

    const maxY = Number(
      d3.max(oData.data, d => (d.maxValue < 0 ? 0 : d.maxValue))
    );

    const y = d3.scaleLinear().domain([minY, maxY]).range([height, 0]).nice();

    const yAxis = d3.axisLeft(y);
    // .orient('left')

    content
      .append('g')
      .attr('class', 'y axis')
      .attr('height', height)
      .call(yAxis)
      .selectAll('text')
      .attr('y', 4)
      .attr('x', -10)
      .style('font-family', 'Arial,Helvetica,sans-serif')
      .style('font-size', '12px')
      .style('text-anchor', 'end');

    content
      .append('text')
      .attr('class', 'AxisTitle')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .text(oData.attributeType);

    // DATA BARS
    const bars = content.append('g');
    const bar = bars
      .selectAll('g')
      .data(oData.data)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${i * this.barWidth + 1}, 0)`);

    // clickBar
    bar
      .append('rect')
      .attr('class', () => 'BackgroundBar')
      .attr('height', height)
      .attr('width', this.barWidth - 1)
      .attr('ModelId', d => d.modelId);

    // store bars in chartObjects
    bar
      .append('rect')
      .attr('class', () => 'Bar')
      .attr('height', d => {
        const startingPoint = minY < 0 ? y(0) : y(minY);
        if (d.value < 0) {
          return y(d.value) - startingPoint;
        }
        return startingPoint - y(d.value);
      })
      .attr('width', this.barWidth - 1)
      .attr('y', d => {
        if (d.value < 0) {
          return y(0);
        }
        return y(d.value);
      })
      .attr('ModelId', d => d.modelId);

    bar
      .append('a')
      .attr('target', '_blank')
      .append('text')
      .attr('x', 2)
      .attr('y', height + 3)
      .attr('dy', '.75em')
      .attr('class', 'Label')
      .attr('transform', `rotate(-65 0,${height + 3})`)
      .text(d => {
        if (d.dataset) {
          return d.dataset; // FIXME
        }
        let labelText = !bSameDrug ? d.drug : '';
        labelText += !bSameDrug && !bSameCellLine ? ' : ' : '';
        labelText += !bSameCellLine ? d.cellLine : '';
        return labelText;
      });
    // clickBar
    const barRect = bar
      .append('rect')
      .attr('class', () => 'ClickBar')
      .attr('id', (d, i) => `ClickTipsy-${i}`)
      .attr('height', height)
      .attr('width', this.barWidth - 1)
      .attr('ModelId', d => d.modelId)
      .on('mouseover', function () {
        d3.select(this).style('cursor', 'pointer');
        d3.select(this).attr('class', 'ClickBar Highlight');
      })
      .on('mouseout', function () {
        d3.select(this).style('cursor', 'default');
        d3.select(this).attr('class', 'ClickBar');
      });

    function onBarClick(f: IContent) {
      const oSelectedModelIds = that.selectedModelIds;
      if (oSelectedModelIds) {
        let aSelectedModelIds = oSelectedModelIds;
        if (
          aSelectedModelIds.some(
            (modelIdsEntry: number) => modelIdsEntry === f.modelId
          )
        ) {
          d3.selectAll('.Bar')
            .filter((e: any) => e.ModelId === f.modelId)
            .attr('class', 'Bar');

          d3.selectAll('.BackgroundBar')
            .filter((e: any) => e.ModelId === f.modelId)
            .attr('class', 'BackgroundBar');

          that.selectedModelIds.filter(e => e !== f.modelId);
        } else {
          if (that.multiSelection) {
            d3.selectAll('.Bar')
              .filter((e: any) => e.ModelId === f.modelId)
              .attr('class', 'Bar BetterValue');

            d3.selectAll('.BackgroundBar')
              .filter((e: any) => e.ModelId === f.modelId)
              .attr('class', 'BackgroundBar Highlight');

            aSelectedModelIds.push(f.modelId);
          } else {
            // first deselect
            d3.selectAll('.Bar').attr('class', 'Bar');
            d3.selectAll('.BackgroundBar').attr('class', 'BackgroundBar');
            // then select the new one and set it as single element array
            d3.selectAll('.Bar')
              .filter((e: any) => e.modelId === f.modelId)
              .attr('class', 'Bar BetterValue');
            d3.selectAll('.BackgroundBar')
              .filter((e: any) => e.modelId === f.modelId)
              .attr('class', 'BackgroundBar Highlight');
            aSelectedModelIds = [f.modelId];
          }
          that.selectedModelIds = aSelectedModelIds;
        }
      } else {
        d3.selectAll('.Bar')
          .filter((e: any) => e.ModelId === f.modelId)
          .attr('class', 'Bar BetterValue');
        d3.selectAll('.BackgroundBar')
          .filter((e: any) => e.ModelId === f.modelId)
          .attr('class', 'BackgroundBar Highlight');
        that.selectedModelIds = [f.modelId];
      }

      that.onModelSelected({
        AttributeType: oData.attributeType,
        SelectedModelIds: that.selectedModelIds,
      });
    }

    // TPS Explorer uses d3v6, ProteomicsDB uses D3v5. This if/else makes the component compatible with both
    if (d3.version.startsWith(String(6))) {
      barRect.on('click', (clickEvent, f) => onBarClick(f));
    } else {
      barRect.on('click', f => onBarClick(f));
    }

    bar.append('line').attr('class', 'pointer');
    bar.append('line').attr('class', 'end_left');
    bar.append('line').attr('class', 'end_right');

    bar
      .selectAll('line.pointer')
      .attr('x1', (d: any) => {
        if (d.minValue < d.maxValue) {
          return 6;
        }
        return null;
      })
      .attr('y1', (d: any) => {
        if (d.minValue < d.maxValue) {
          return y(d.minValue);
        }
        return null;
      }) // 6 is middle of 11 (height of bars)
      .attr('x2', (d: any) => {
        if (d.minValue < d.maxValue) {
          return 6;
        }
        return null;
      })
      .attr('y2', (d: any) => {
        if (d.minValue < d.maxValue) {
          return y(d.maxValue);
        }
        return null;
      })
      .style('stroke', 'black')
      .style('stroke-width', '1px');

    bar
      .selectAll('line.end_left')
      .attr('x1', (d: any) => {
        if (d.minValue < d.maxValue) {
          return 0;
        }
        return null;
      })
      .attr('y1', (d: any) => {
        if (d.minValue < d.maxValue) {
          return y(d.minValue);
        }
        return null;
      })
      .attr('x2', (d: any) => {
        if (d.minValue < d.maxValue) {
          return 11;
        }
        return null;
      })
      .attr('y2', (d: any) => {
        if (d.minValue < d.maxValue) {
          return y(d.minValue);
        }
        return null;
      })
      .style('stroke', 'black')
      .style('stroke-width', '1px');

    bar
      .selectAll('line.end_right')
      .attr('x1', (d: any) => {
        if (d.minValue < d.maxValue) {
          return 0;
        }
        return null;
      })
      .attr('y1', (d: any) => {
        if (d.minValue < d.maxValue) {
          return y(d.maxValue);
        }
        return null;
      })
      .attr('x2', (d: any) => {
        if (d.minValue < d.maxValue) {
          return 11;
        }
        return null;
      })
      .attr('y2', (d: any) => {
        if (d.minValue < d.maxValue) {
          return y(d.maxValue);
        }
        return null;
      })
      .style('stroke', 'black')
      .style('stroke-width', '1px');

    const title = svg
      .append('text')
      .attr('class', 'Title')
      .attr('x', margin.left)
      .attr('y', 28)
      .attr('text-anchor', 'start')
      .text(this.title);

    /* TODO: convert this to Vue.js
    for (i = 0; i < oData.data.length; i++) {
        $('#ClickTipsy-' + i).tipsy({
            gravity: 's',
            html: true,
            title: function() {
                return 'cell line: ' + this.__data__.CellLine + '<br>' + 'drug: ' + this.__data__.Drug + '<br>'; // .value.toFixed(2) + " " + aProperties[0]["doseUnit"];+ '<br>';
            }
        });
    } */

    BiowcBarplot.expandChartSizeToTitle(svg, title, width, margin);
  }

  static expandChartSizeToTitle(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    d3Title: d3.Selection<SVGTextElement, unknown, HTMLElement, any>,
    width: number,
    margin: { top: number; right: number; bottom: number; left: number }
  ) {
    // @ts-ignore
    const titleWidth = d3Title.node().getBBox().width;
    const titlePadding = 10;
    if (titleWidth > width) {
      const newWidth = Math.max(
        titleWidth + margin.left + titlePadding,
        width + margin.left + margin.right
      );
      svg.attr('width', newWidth);
      d3Title.attr('x', margin.left).attr('text-anchor', 'left');
    }
  }

  /*
  getBarStyleClasses() {
    const sClasses = 'Bar';
    return sClasses;
  }

  getLegendStyleClass(i) {
    const aClass = [
      'BetterValue',
      'SelectedModelIds',
      'AtMostTenfold',
      'MoreThanTenfold'
    ];
    return aClass[i];
  }

  getLegendText(i) {
    const aTexts = ['< 1', '= 1 (target protein)', '1 - 10', '> 10'];
    return aTexts[i];
  }

  getLegendTransformation(i) {
    const aTransformation = [15, 30, 45, 60];
    return aTransformation[i];
  }

  deletePlot() {
    d3.select(this.$el).selectAll('svg').remove();
  }

  getLegendHeight() {
    return 75;
  }
   */

  protected firstUpdated(_changedProperties: PropertyValues) {
    _changedProperties.forEach((oldValue, propName) => {
      if (propName === 'data') {
        this.drawPlot(this.data);
      } else if (propName === 'selectedModelIds') {
        this.sSelectedModelIds = oldValue;
      }
    });
  }
}
