import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import * as d3v6 from 'd3';
import { HTMLTemplateResult, PropertyValues } from 'lit/development';
import styles from './biowc-histogram.css';
import '../../../download-button/dist/src/download-button.js';

export class BiowcHistogram extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  idKey: string = 'id';

  @property({ attribute: false })
  valueKey: string = 'value';

  @property({ attribute: false })
  xValues: { [key: string]: number | string | null }[] = [];

  @property({ attribute: false })
  xLabel: string = '';

  @property({ attribute: false })
  yLabel: string = '';

  @property({ attribute: false })
  numBins: number = 25;

  @property({ attribute: false })
  barColor: string = '#69b3a2';

  @property({ attribute: false })
  width = 460;

  @property({ attribute: false })
  height = 400;

  @property({ attribute: false })
  margin = { top: 10, right: 30, bottom: 30, left: 60 };

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

  protected _extractValues() {
    return this.xValues.map(entry => {
      const value = entry[this.valueKey];
      switch (typeof value) {
        case 'number':
          return value;
        default:
          return NaN;
      }
    });
  }

  private _plotHistogram() {
    // set the dimensions and margins of the graph
    const { margin } = this;
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    const mainDiv = this._getMainDiv();

    mainDiv.select('svg').remove();

    // append the svg object to the body of the page
    const svg = mainDiv
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 30)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = this._extractValues();

    // count number of NaN to report in messagebox
    // const nanCount = data.filter(x => Number.isNaN(x)).length

    // X axis: scale and draw:
    const x = d3v6
      .scaleLinear()
      .domain(d3v6.extent(data) as [number, number]) // can use this instead of 1000 to have the max of data: d3v6.max(data, function(d) { return +d.price })
      .range([0, width]);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3v6.axisBottom(x));

    // add the x Axis label
    svg
      .append('text')
      .attr('transform', `translate(${width / 2} ,${height + margin.top + 30})`)
      .style('text-anchor', 'middle')
      .text(`${this.xLabel}`);

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

    // add the y Axis
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(`${this.yLabel}`);

    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    const tooltip = mainDiv
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('background-color', 'black')
      .style('color', 'white')
      .style('border-radius', '5px')
      .style('padding', '10px');

    // tooltip mouseover event handler
    const tipMouseover = (
      e: MouseEvent,
      d: { length: any; x0: any; x1: any }
    ) => {
      const htmlElement = `${this.yLabel}: ${
        d.length
      }<br>range: ${d.x0.toPrecision(3)} to ${d.x1.toPrecision(3)}`;
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

    /*

    // Add the modalBox container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    const modalBox = mainDiv
      .append('div')
      .attr('class', 'modalBox')
      .style('opacity', 0)
      .style('background-color', 'black')
      .style('color', 'white')
      .style('border-radius', '5px')
      .style('padding', '10px');


    if(nanCount > 0) {
      const htmlElement = `<br><br>${nanCount} NaN entries found in dataset`
      modalBox
        .html(htmlElement)
        .style('opacity', 0.9); // started as 0
    }

    const boxMouseclick = () => {
      modalBox
        .transition()
        .duration(300) // ms
        .style('opacity', 0); // don't care about position!
    };

    modalBox
      .append('rect')
      .text('X')
      // .attr("y", 100)
      // .attr("fill", "red")
      .on('click', boxMouseclick)

*/

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
