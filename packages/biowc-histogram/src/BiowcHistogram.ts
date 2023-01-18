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

  @property({ attribute: false })
  plotKDE: boolean = false;

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

  private _extractValues() {
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

  private _drawXaxis(
    data: number[],
    svg: d3v6.Selection<SVGGElement, unknown, HTMLElement, any>,
    plotWidth: number,
    plotHeight: number
  ) {
    // X axis: scale and draw:
    const x = d3v6
      .scaleLinear()
      .domain(d3v6.extent(data) as [number, number]) // can use this instead of 1000 to have the max of data: d3v6.max(data, function(d) { return +d.price })
      .range([0, plotWidth]);

    svg
      .append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3v6.axisBottom(x));

    // add the x Axis label
    svg
      .append('text')
      .attr(
        'transform',
        `translate(${plotWidth / 2} ,${plotHeight + this.margin.top + 30})`
      )
      .style('text-anchor', 'middle')
      .text(`${this.xLabel}`);

    return x;
  }

  private _drawYaxis(
    maxCount: number,
    svg: d3v6.Selection<SVGGElement, unknown, HTMLElement, any>,
    plotHeight: number
  ) {
    // Y axis: scale and draw:
    const y = d3v6.scaleLinear().range([plotHeight, 0]);
    y.domain([0, maxCount] as [number, number]); // d3v6.hist has to be called before the Y axis obviously
    svg.append('g').call(d3v6.axisLeft(y));

    // add the y Axis
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - this.margin.left)
      .attr('x', 0 - plotHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(`${this.yLabel}`);

    return y;
  }

  // Add the tooltip container to the vis container
  // it's invisible and its position/contents are defined during mouseover
  private _addTooltip(
    mainDiv: d3v6.Selection<d3v6.BaseType, unknown, HTMLElement, any>
  ) {
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

    return [tipMouseover, tipMouseout];
  }

  private static _kde(
    kernel: any,
    thresholds: number[],
    data: number[],
    bandwidth: number
  ): [number, number][] {
    const binWidth = thresholds[1] - thresholds[0];
    return thresholds.map(t => [
      t,
      d3v6.sum(data, d => kernel((t - d) / bandwidth) / bandwidth) * binWidth,
    ]);
  }

  private static _epanechnikov() {
    return (x: number) => (Math.abs(x) <= 1 ? 0.75 * (1 - x * x) : 0);
  }

  private static _plotKDE(
    svg: d3v6.Selection<SVGGElement, unknown, HTMLElement, any>,
    density: [number, number][],
    xAxis: d3v6.ScaleLinear<number, number, never>,
    yAxis: d3v6.ScaleLinear<number, number, never>,
    stroke = '#000',
    dasharray = '1 0'
  ) {
    const line = d3v6
      .line()
      .curve(d3v6.curveBasis)
      .x(d => xAxis(d[0]))
      .y(d => yAxis(d[1]));

    svg
      .append('path')
      .attr('class', 'kdePath')
      .datum(density)
      .attr('fill', 'none')
      .attr('stroke', stroke)
      .attr('stroke-dasharray', dasharray)
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', line);
  }

  private _plotHistogram() {
    // set the dimensions and margins of the graph
    const { margin } = this;
    const plotWidth = this.width - margin.left - margin.right;
    const plotHeight = this.height - margin.top - margin.bottom;

    const mainDiv = this._getMainDiv();

    mainDiv.select('svg').remove();

    // append the svg object to the body of the page
    const svg = mainDiv
      .append('svg')
      .attr('width', plotWidth + margin.left + margin.right)
      .attr('height', plotHeight + margin.top + margin.bottom + 30)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = this._extractValues();

    // count number of NaN to report in messagebox
    // const nanCount = data.filter(x => Number.isNaN(x)).length

    // X axis: scale and draw:
    const xAxis = this._drawXaxis(data, svg, plotWidth, plotHeight);

    const minX = d3v6.min(data) || 0;
    const maxX = d3v6.max(data) || 0;
    const binWidth = (maxX - minX) / this.numBins;
    const thresholds = d3v6.range(minX, maxX, binWidth);

    // set the parameters for the histogram
    const histogram = d3v6
      .bin()
      .domain(xAxis.domain() as [number, number]) // then the domain of the graphic
      .thresholds(thresholds);

    // And apply this function to data to get the bins
    const bins = histogram(data);

    const maxCount = d3v6.max(bins, d => d.length) || 0;

    // Y axis: scale and draw:
    const yAxis = this._drawYaxis(maxCount, svg, plotHeight);

    // tooltip mouseover event handler
    const [tipMouseover, tipMouseout] = this._addTooltip(mainDiv);

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
      .attr(
        'transform',
        d => `translate(${xAxis(d.x0 || 0)} , ${yAxis(d.length)})`
      )
      .attr('width', d => xAxis(d.x1 || 0) - xAxis(d.x0 || 0) - 1)
      .attr('height', d => plotHeight - yAxis(d.length))
      .style('fill', this.barColor)
      .on('mousemove', tipMouseover)
      .on('mouseout', tipMouseout);

    if (this.plotKDE) {
      // Kernel density estimate graph
      const bandwidth = binWidth * 2;
      const density = BiowcHistogram._kde(
        BiowcHistogram._epanechnikov(),
        thresholds.concat([maxX]), // add right hand side of last bin as extra evaluation point
        data,
        bandwidth
      );
      // Scale the range of the data in the y domain
      const maxDensity = d3v6.max(density.map(d => d[1])) || 0;
      yAxis.domain([0, maxDensity * 1.1]);

      BiowcHistogram._plotKDE(svg, density, xAxis, yAxis);
    }
  }
}
