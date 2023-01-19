import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { HTMLTemplateResult } from 'lit/development';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as d3 from 'd3';
import styles from './biowc-barplot.css';
import '../../../download-button/dist/src/download-button.js';

// clean code
// support stacked bars
// support horizontal visualization
// support grouping
// add a legend

interface IContent {
  modelId: number;
  value: number;
  minValue: number;
  maxValue: number;
  label: string;
  tooltipText: string;
  color: string;
}

interface IData {
  attributeType: string;
  dataset: string;
  data: IContent[];
}

export class BiowcBarplot extends LitElement {
  static styles = styles;

  @property({ type: Number }) counter = 5;

  @property({ attribute: false })
  myTitle: string = '';

  @property({ attribute: false })
  minWidth: number = 200;

  @property({ attribute: false })
  minHeight: number = 300;

  @property({ attribute: false })
  barWidth: number = 11;

  @property({ attribute: false })
  data: IData = { attributeType: '', dataset: '', data: [] };

  // protein selected through Dropdown
  @property({ attribute: false })
  selectedModelIds: number[] = [];

  @property({ attribute: false })
  sSelectedModelIds: string = '';

  @property({ attribute: false })
  multiSelection: boolean = true;

  render(): HTMLTemplateResult {
    return html`
      <div>
        <div id="barplot" class="barplotClass"></div>
        <button
          id="clear-button"
          x-small
          className="barPlotClearSelectionButton"
          @click="${this.clearSelectedBars}"
          disabled
        >
          Clear selection
        </button>
        <download-button
          .svgComponent="${this}"
          style="margin-left: 20px;"
        ></download-button>
      </div>
    `;
  }

  private onSelect() {
    console.log(this.selectedModelIds);
    if (this.selectedModelIds && this.selectedModelIds.length > 0) {
      console.log('Prova-select');
      this._getButton().attr('disabled', null);
    } else {
      this._getButton().attr('disabled', 1);
    }

    const selectEvent = new CustomEvent('send-message', {
      detail: { sSelectedModelIds: this.selectedModelIds.join(';') },
    });
    this.dispatchEvent(selectEvent);
  }

  clearSelectedModelIds() {
    this.selectedModelIds = [];
  }

  // eslint-disable-next-line class-methods-use-this
  private getFullLabel(content: IContent): string[] {
    const label = [];
    if (content) {
      label.push(content.label);
      if (content.tooltipText)
        label.push(`<font size="-1">${content.tooltipText}</font>`);
      label.push(
        `<font size="-1" style="color:#00679e">Value: ${content.value}</font>`,
        `<font size="-1" style="color:#00679e">Error bar: [${content.minValue} ; ${content.maxValue}]</font>`
      );
    }
    return label;
  }

  // eslint-disable-next-line class-methods-use-this
  private getLabelSize(labels: string[]): number {
    if (labels.length === 0) return 0;
    const size =
      labels
        .map(d => d.length)
        .sort()
        .reverse()[0] * 8;
    if (size < 200) return 200;
    if (size > 350) return 350;
    return size;
  }

  clearSelectedBars() {
    this.clearSelectedModelIds();
    this._getMainDiv().selectAll('.Bar').attr('class', 'Bar');
    this._getMainDiv()
      .selectAll('.BackgroundBar')
      .attr('class', 'BackgroundBar');

    this.onSelect();
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3.select(this.shadowRoot).select('#barplot');
  }

  private _getButton() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3.select(this.shadowRoot).select('#clear-button');
  }

  drawPlot(oData: IData) {
    console.log(this.data.attributeType);
    const that = this;

    this.clearSelectedModelIds();

    const margin = {
      top: 60,
      right: 230,
      bottom: 120,
      left: 50,
    };

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

    //  legend
    svg.append('g');

    const content = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Y-AXIS
    const minY = Number(
      d3.min(oData.data, d => (d.minValue > 0 ? 0 : d.minValue))
    );

    const maxY = Number(
      d3.max(oData.data, d => (d.maxValue < 0 ? 0 : d.maxValue))
    );

    const y = d3.scaleLinear().domain([minY, maxY]).range([height, 0]).nice();

    const yAxis = d3.axisLeft(y);

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
      .text(oData.attributeType); // y axis that is empty

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
      .attr('modelId', d => d.modelId);

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
      .attr('modelId', d => d.modelId);

    bar
      .append('a')
      .attr('target', '_blank')
      .append('text')
      .attr('x', 2)
      .attr('y', height + 3)
      .attr('dy', '.75em')
      .attr('class', 'Label')
      .attr('transform', `rotate(-65 0,${height + 3})`)
      .text(d => d.label);

    // create a tooltip
    const tooltip = that
      ._getMainDiv()
      .append('div')
      .attr('class', 'tooltip')
      .style('font-family', 'Arial,Helvetica,sans-serif')
      .style('opacity', 0)
      .style('background-color', 'white')
      .style('border-radius', '5px')
      .style('padding', '10px')
      .style('color', 'black')
      .style('position', 'absolute')
      .style('border', '2px solid black');

    // clickBar
    const barRect = bar
      .append('rect')
      .attr('class', () => 'ClickBar')
      .attr('id', (d, i) => `ClickTipsy-${i}`)
      .attr('height', height)
      .attr('width', this.barWidth - 1)
      .attr('modelId', d => d.modelId)
      .on('mouseover', () => tooltip.style('opacity', 0.9))
      .on('mousemove', (event, d: IContent) => {
        const labels = that.getFullLabel(d);
        tooltip
          .html(labels.join('<br />'))
          .style('width', `${that.getLabelSize(labels)}px`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    function onBarClick(f: IContent) {
      const div = that._getMainDiv();
      if (that.selectedModelIds) {
        if (that.selectedModelIds.some((id: number) => id === f.modelId)) {
          div
            .selectAll('.Bar')
            .filter((e: any) => e.modelId === f.modelId)
            .attr('class', 'Bar');
          div
            .selectAll('.BackgroundBar')
            .filter((e: any) => e.modelId === f.modelId)
            .attr('class', 'BackgroundBar');
          that.selectedModelIds = that.selectedModelIds.filter(
            e => e !== f.modelId
          );
        } else if (that.multiSelection) {
          div
            .selectAll('.Bar')
            .filter((e: any) => e.modelId === f.modelId)
            .attr('class', 'Bar BetterValue');
          div
            .selectAll('.BackgroundBar')
            .filter((e: any) => e.modelId === f.modelId)
            .attr('class', 'BackgroundBar Highlight');
          that.selectedModelIds.push(f.modelId);
        } else {
          // first deselect
          div.selectAll('.Bar').attr('class', 'Bar');
          div.selectAll('.BackgroundBar').attr('class', 'BackgroundBar');
          // then select the new one and set it as single element array
          div
            .selectAll('.Bar')
            .filter((e: any) => e.modelId === f.modelId)
            .attr('class', 'Bar BetterValue');
          div
            .selectAll('.BackgroundBar')
            .filter((e: any) => e.modelId === f.modelId)
            .attr('class', 'BackgroundBar Highlight');
          that.selectedModelIds = [f.modelId];
        }
      } else {
        div
          .selectAll('.Bar')
          .filter((e: any) => e.modelId === f.modelId)
          .attr('class', 'Bar BetterValue');
        div
          .selectAll('.BackgroundBar')
          .filter((e: any) => e.modelId === f.modelId)
          .attr('class', 'BackgroundBar Highlight');
        that.selectedModelIds = [f.modelId];
      }

      that.onSelect();
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
      .text(this.myTitle);

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
  */

  deletePlot() {
    this._getMainDiv().selectAll('svg').remove();
  }

  /*
  getLegendHeight() {
    return 75;
  }
  */

  public exportSvg() {
    const head = `<svg class='BarContainer' title="${this.myTitle}" xmlns="http://www.w3.org/2000/svg">`;
    const data = this.shadowRoot?.querySelector('svg')?.innerHTML;
    return `${head} <style>${styles.toString()}</style> ${data} </svg>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    const oData = this.data;
    if (!oData || !oData.data) {
      return;
    }
    this.drawPlot(this.data);
    super.firstUpdated(_changedProperties);
  }

  protected updated(_changedProperties: PropertyValues) {
    _changedProperties.forEach((oldValue, propName) => {
      if (propName === 'data') {
        this.drawPlot(this.data);
      } else if (propName === 'selectedModelIds') {
        // this.sSelectedModelIds = oldValue;
      }
    });
  }
}
