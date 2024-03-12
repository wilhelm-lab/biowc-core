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
    const xScale = d3v6
      .scaleLinear()
      .domain(d3v6.extent(data) as [number, number]) // can use this instead of 1000 to have the max of data: d3v6.max(data, function(d) { return +d.price })
      .range([0, plotWidth]);

    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3v6.axisBottom(xScale));

    // add the x Axis label
    svg
      .append('text')
      .attr(
        'transform',
        `translate(${plotWidth / 2} ,${plotHeight + this.margin.top + 30})`
      )
      .style('text-anchor', 'middle')
      .text(`${this.xLabel}`);

    return [xScale, xAxis] as [
      d3v6.ScaleLinear<number, number, never>,
      d3v6.Selection<SVGGElement, unknown, HTMLElement, any>
    ];
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
    xScale: d3v6.ScaleLinear<number, number, never>,
    yScale: d3v6.ScaleLinear<number, number, never>,
    stroke = '#000',
    dasharray = '1 0'
  ) {
    const line = d3v6
      .line()
      .curve(d3v6.curveBasis)
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]));

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

  private _addModalBox(
    htmlElement: string,
    mainDiv: d3v6.Selection<d3v6.BaseType, unknown, HTMLElement, any>
  ) {
    // Add the modalBox container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    const modalBox = mainDiv
      .append('div')
      .attr('class', 'modalBox')
      .html(htmlElement)
      .style('opacity', 0.9)
      .style('background-color', 'black')
      .style('color', 'white')
      .style('border-radius', '5px')
      .style('padding', '10px')
      .style('margin-left', `${this.margin.left + 10}px`)
      .style('margin-top', `${this.margin.top}px`);

    const closeButtonMouseClick = () => {
      modalBox
        .transition()
        .duration(300) // ms
        .style('opacity', 0); // don't care about position!
    };

    // add close button
    modalBox
      .append('rect')
      .style('background-color', 'red')
      .style('border-radius', '2px')
      .style('padding', '2px')
      .text('X')
      .style('margin-left', '8px')
      .attr('font-family', 'sans-serif')
      .style('cursor', 'pointer')
      .on('click', closeButtonMouseClick);
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
    const nanCount = data.filter(x => Number.isNaN(x)).length;
    if (nanCount > 0) {
      const message = `${nanCount} NaN entries found in dataset`;
      this._addModalBox(message, mainDiv);
    }

    // X axis: scale and draw:
    const [xScale, xAxis] = this._drawXaxis(data, svg, plotWidth, plotHeight);

    const minX = d3v6.min(data) || 0;
    const maxX = d3v6.max(data) || 0;
    const binWidth = (maxX - minX) / this.numBins;
    const thresholds = d3v6.range(minX, maxX, binWidth);

    // set the parameters for the histogram
    const histogram = d3v6
      .bin()
      .domain(xScale.domain() as [number, number]) // then the domain of the graphic
      .thresholds(thresholds);

    // And apply this function to data to get the bins
    const bins = histogram(data);

    const maxCount = d3v6.max(bins, d => d.length) || 0;

    // Y axis: scale and draw:
    const yScale = this._drawYaxis(maxCount, svg, plotHeight);

    // tooltip mouseover event handler
    const [tipMouseover, tipMouseout] = this._addTooltip(mainDiv);

    const brushElement = svg.append('g').attr('class', 'brush');

    // append the bar rectangles to the svg element
    const clippedArea = svg.append('g').attr('clip-path', 'url(#clip)');

    clippedArea
      .selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('class', 'histogramBar')
      .attr('x', 1)
      .attr(
        'transform',
        d => `translate(${xScale(d.x0 || 0)} , ${yScale(d.length)})`
      )
      .attr('width', d => xScale(d.x1 || 0) - xScale(d.x0 || 0) - 1)
      .attr('height', d => plotHeight - yScale(d.length))
      .style('fill', this.barColor)
      .on('mousemove', tipMouseover)
      .on('mouseout', tipMouseout);
    // starting brushzoom on top of bars does not work yet...
    // .on('mousedown', (e: MouseEvent) => {
    //   const brushEl = svg.select<SVGGElement>(".brush").node();
    //   const newClickEvent = new MouseEvent('mousedown', {screenX: e.pageX, screenY: e.pageY, clientX: e.clientX, clientY: e.clientY});
    //   brushEl!.dispatchEvent(newClickEvent);
    // });

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
      yScale.domain([0, maxDensity * 1.1]);

      BiowcHistogram._plotKDE(svg, density, xScale, yScale);
    }
    // brushZoom implementation
    // Add a clipPath: everything out of this area won't be drawn.
    svg
      .append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', plotWidth)
      .attr('height', plotHeight)
      .attr('x', 0)
      .attr('y', 0);

    // A function that set idleTimeOut to null
    let idleTimeout: any;
    function idled() {
      idleTimeout = null;
    }

    const brush = d3v6.brushX(); // Add the brush feature using the d3.brush function

    // A function that update the chart for given boundaries
    function updateChart(event: d3v6.D3BrushEvent<[number, number]>) {
      const extent = event.selection;
      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if (!extent) {
        if (!idleTimeout) {
          idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
          return;
        }
        xScale.domain([minX, maxX]);
      } else {
        xScale.domain([
          xScale.invert(extent[0] as number),
          xScale.invert(extent[1] as number),
        ]);
        svg.select<SVGGElement>('.brush').call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and circle position
      xAxis.transition().duration(1000).call(d3v6.axisBottom(xScale));
      svg
        .selectAll<SVGGElement, { length: any; x0: any; x1: any }>(
          'rect.histogramBar'
        )
        .transition()
        .duration(1000)
        .attr(
          'transform',
          d => `translate(${xScale(d.x0 || 0)} , ${yScale(d.length)})`
        )
        .attr('width', d => xScale(d.x1 || 0) - xScale(d.x0 || 0) - 1);
    }
    // Add brushing
    brush
      .extent([
        [0, 0],
        [plotWidth, plotHeight],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on('end', updateChart); // Each time the brush selection changes, trigger the 'updateChart' function

    // Add the brushing
    brushElement.call(brush);
  }
}
