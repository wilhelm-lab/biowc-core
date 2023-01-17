import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import * as d3v6 from 'd3';
import { HTMLTemplateResult, PropertyValues } from 'lit/development';
import styles from './biowc-histogram.css';
import '../../../download-button/dist/src/download-button.js';

export namespace Types {
  export type Data = { [key: string]: number | string };
  export type BarsNode = {
    x0: number;
    x1: number;
    length: number;
  };
}

export class BiowcHistogram extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  idKey: string = 'id';

  @property({ attribute: false })
  valueKey: string = 'value';

  @property({ attribute: false })
  xValues: { [key: string]: number | string }[] = [];

  @property({ attribute: false })
  xLabel: string = '';

  @property({ attribute: false })
  yLabel: string = '';

  @property({ attribute: false })
  numBins: number = 25;

  @property({ attribute: false })
  barColor: string = '#69b3a2';

  render(): HTMLTemplateResult {
    return html` <div style="display: flex">
      <div id="histogram"></div>
      <download-button
        .svgComponent="${this}"
        style="margin-left: 20px;"
      ></download-button>
    </div>`;
  }

  public exportSvg() {
    return this.shadowRoot?.querySelector('svg')?.outerHTML;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this._plotHistogram();

    super.firstUpdated(_changedProperties);
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3v6.select(this.shadowRoot).select('#histogram');
  }

  private _plotHistogram() {
    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const mainDiv = this._getMainDiv();

    mainDiv.select('svg').remove();

    // append the svg object to the body of the page
    const svg = mainDiv
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 30)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = this.xValues.map(
      entry => entry[this.valueKey] as unknown as number
    );

    // X axis: scale and draw:
    const x = d3v6
      .scaleLinear()
      .domain([Math.min(...data), d3v6.max(data) as number]) // can use this instead of 1000 to have the max of data: d3v6.max(data, function(d) { return +d.price })
      .range([0, width]);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3v6.axisBottom(x));

    // set the parameters for the histogram
    const histogram = d3v6
      .bin()
      .domain(x.domain() as [number, number]) // then the domain of the graphic
      .thresholds(
        d3v6.range(
          d3v6.min(data) || 0,
          d3v6.max(data) || 0,
          ((d3v6.max(data) || 0) - (d3v6.min(data) || 0)) / this.numBins
        )
      ); // then the numbers of bins

    // And apply this function to data to get the bins
    const bins = histogram(data);

    // Y axis: scale and draw:
    const y = d3v6.scaleLinear().range([height, 0]);
    y.domain([0, d3v6.max(bins, d => d.length)] as [number, number]); // d3v6.hist has to be called before the Y axis obviously
    svg.append('g').call(d3v6.axisLeft(y));

    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    const tooltip = mainDiv
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // tooltip mouseover event handler
    const tipMouseover = (e: MouseEvent, d: { length: any }) => {
      const htmlElement = d.length;
      tooltip
        .html(htmlElement)
        .style('left', `${e.pageX + 10}px`)
        .style('top', `${e.pageY - 10}px`)
        .transition()
        .duration(200) // ms
        .style('opacity', 0.9); // started as 0!
    };
    // tooltip mouseout event handler
    const tipMouseout = () => {
      tooltip
        .transition()
        .duration(300) // ms
        .style('opacity', 0); // don't care about position!
    };
    // append the bar rectangles to the svg element
    svg
      .selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('x', 1)
      .attr('transform', d => `translate(${x(d.x0 || 0)} , ${y(d.length)})`)
      .attr('width', d => x(d.x1 || 0) - x(d.x0 || 0) - 1)
      .attr('height', d => height - y(d.length))
      .style('fill', this.barColor)
      .on('mousemove', tipMouseover)
      .on('mouseout', tipMouseout);
  }
}
