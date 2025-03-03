import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import * as d3v6 from 'd3';
import { HTMLTemplateResult, PropertyValues } from 'lit/development';
import { ScaleLinear } from 'd3';
import styles from './biowc-scatter.css';

export class BiowcScatter extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  valuesInCommon: {
    id: string;
    xValue: number;
    yValue: number;
    category: number | string;
  }[] = [];

  @property({ attribute: false })
  idKey: string = 'id';

  @property({ attribute: false })
  valueKey: string = 'value';

  @property({ attribute: false })
  xValues: { [key: string]: number | string }[] = [];

  @property({ attribute: false })
  yValues: { [key: string]: number | string }[] = [];

  @property({ attribute: false })
  categories: { [key: string | 'category']: number | string }[] = [];

  @property({ attribute: false })
  colors: { [key: string | number]: string } = {};

  @property({ attribute: false })
  xLabel: string = '';

  @property({ attribute: false })
  yLabel: string = '';

  @property({ attribute: false })
  showTrendline: boolean = false;

  @property({ attribute: false })
  showLegend: boolean = false;

  @property({ attribute: false })
  dotSize: number = 4;

  @property({ attribute: false })
  legendPosition: 'side' | 'bottom' | null = 'bottom';

  render(): HTMLTemplateResult {
    this.valuesInCommon = this._getValuesInCommon();
    return html`
      <div
        id="container"
        class="${this.legendPosition === 'side'
          ? 'legend-horizontal'
          : 'legend-vertical'}"
        style="display: flex"
      >
        <div id="scatterplot"></div>
        <export-button
          .svgComponent="${this}"
          style="margin-left: 20px;"
        ></export-button>
        <div id="legendContainer"></div>
      </div>
    `;
  }

  public exportSvg() {
    return this.shadowRoot?.querySelector('svg')?.outerHTML;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this._plotScatter();

    super.firstUpdated(_changedProperties);
  }

  private _getValuesInCommon(): {
    id: string;
    xValue: number;
    yValue: number;
    category: number | string;
  }[] {
    interface valuesById {
      [key: string]: number;
    }

    const xValuesById: valuesById = Object.assign(
      {},
      ...this.xValues.map(x => ({ [x[this.idKey]]: x[this.valueKey] }))
    );
    const yValuesById: valuesById = Object.assign(
      {},
      ...this.yValues.map(x => ({ [x[this.idKey]]: x[this.valueKey] }))
    );

    const categoriesById: valuesById = Object.assign(
      {},
      ...this.categories.map(x => ({ [x[this.idKey]]: x.category }))
    );

    const valuesInCommon = [];
    for (const [key, value] of Object.entries(xValuesById)) {
      if (key in yValuesById) {
        valuesInCommon.push({
          id: key,
          xValue: value,
          yValue: yValuesById[key],
          category: categoriesById[key],
        });
      }
    }
    return valuesInCommon;
  }

  private static _linearRegression(
    y: number[],
    x: number[]
  ): { slope: number; intercept: number; correlation: number } {
    const lr: { slope: number; intercept: number; correlation: number } = {
      slope: 0,
      intercept: 0,
      correlation: 0,
    };
    const n = y.length;
    let sumX = 0;
    let sumY = 0;
    let sumXy = 0;
    let sumXx = 0;
    let sumYy = 0;

    for (let i = 0; i < y.length; i += 1) {
      sumX += x[i];
      sumY += y[i];
      sumXy += x[i] * y[i];
      sumXx += x[i] * x[i];
      sumYy += y[i] * y[i];
    }

    lr.slope = (n * sumXy - sumX * sumY) / (n * sumXx - sumX * sumX);
    lr.intercept = (sumY - lr.slope * sumX) / n;
    let r2 =
      ((n * sumXy - sumX * sumY) /
        Math.sqrt((n * sumXx - sumX * sumX) * (n * sumYy - sumY * sumY))) **
      2;
    r2 = Math.sqrt(r2);
    lr.correlation = Math.round(r2 * 100) / 100;
    return lr;
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3v6.select(this.shadowRoot).select('#scatterplot');
  }

  private _addDots(
    tipMouseover: (e: MouseEvent, d: any) => void,
    tipMouseout: () => void,
    x: ScaleLinear<number, number>,
    y: ScaleLinear<number, number>,
    svg: d3v6.Selection<SVGGElement, unknown, HTMLElement, any>
  ) {
    // Add dots
    svg
      .append('g')
      .selectAll('dot')
      .data(this.valuesInCommon)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.xValue))
      .attr('cy', d => y(d.yValue))
      .attr('r', this.dotSize)
      // .style('fill', '#69b3a2')
      .style('fill', d => this.colors[d.category])
      .on('mousemove', tipMouseover)
      .on('mouseout', tipMouseout);
  }

  private _addTrendline(
    minValueX: number,
    maxValueX: number,
    minValueY: number,
    maxValueY: number,
    x: ScaleLinear<number, number>,
    y: ScaleLinear<number, number>,
    svg: d3v6.Selection<SVGGElement, unknown, HTMLElement, any>
  ) {
    // Calculate Trendline parameters
    const XaxisData: number[] = [];
    const YaxisData: number[] = [];
    Object.entries(this.valuesInCommon).forEach(Element => {
      XaxisData.push(Element[1].xValue);
      YaxisData.push(Element[1].yValue);
    });
    const equation = BiowcScatter._linearRegression(YaxisData, XaxisData);
    let y1 = equation.slope * minValueX + equation.intercept;
    let y2 = equation.slope * maxValueX + equation.intercept;

    y1 = Math.min(Math.max(y1, minValueY), maxValueY);
    const x1 = (y1 - equation.intercept) / equation.slope;

    y2 = Math.min(Math.max(y2, minValueY), maxValueY);
    const x2 = (y2 - equation.intercept) / equation.slope;

    // adding trendline to the plot
    svg
      .append('line')
      .attr('class', 'regression-line')
      .attr('x1', x(x1))
      .attr('x2', x(x2))
      .attr('y1', y(y1))
      .attr('y2', y(y2))
      .attr('stroke', 'black');
  }

  private _plotScatter() {
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

    // Add X axis
    const minValueX = Math.min(
      -3.0,
      Math.min(...this.valuesInCommon.map(d => d.xValue))
    );
    const maxValueX = Math.max(
      3.0,
      Math.max(...this.valuesInCommon.map(d => d.xValue))
    );
    const x = d3v6
      .scaleLinear()
      .domain([minValueX, maxValueX])
      .range([0, width]);
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3v6.axisBottom(x));

    // Add Y axis
    const minValueY = Math.min(
      -3.0,
      Math.min(...this.valuesInCommon.map(d => d.yValue))
    );
    const maxValueY = Math.max(
      3.0,
      Math.max(...this.valuesInCommon.map(d => d.yValue))
    );

    const y = d3v6
      .scaleLinear()
      .domain([minValueY, maxValueY])
      .range([height, 0]);
    svg.append('g').call(d3v6.axisLeft(y));

    // remove tooltip if it exists from a previous render
    mainDiv.select('div.tooltip').remove();

    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    const tooltip = mainDiv
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // tooltip mouseover event handler
    const tipMouseover = (
      e: MouseEvent,
      d: { id: string; xValue: number; yValue: number }
    ) => {
      const htmlElement = `${d.id} (x=${parseFloat(
        d.xValue.toFixed(3)
      )} y=${parseFloat(d.yValue.toFixed(3))})`;
      tooltip
        .html(htmlElement)
        .style('left', `${e.offsetX + 10}px`)
        .style('top', `${e.offsetY + 10}px`)
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

    this._addDots(tipMouseover, tipMouseout, x, y, svg);

    // Optionally, add trendline
    if (this.showTrendline) {
      this._addTrendline(minValueX, maxValueX, minValueY, maxValueY, x, y, svg);
    }
    // add the x Axis
    svg
      .append('text')
      .attr('transform', `translate(${width / 2} ,${height + margin.top + 30})`)
      .style('text-anchor', 'middle')
      .text(`${this.xLabel}`);

    // add the y Axis
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(`${this.yLabel}`);

    // Add the legend
    if (this.showLegend) {
      this._renderLegend();
    }
  }

  private _renderLegend() {
    const legendContainer = d3v6
      // @ts-ignore
      .select(this.shadowRoot)
      .select('#legendContainer');

    // Remove previous legend
    legendContainer.select('svg').remove();

    const legend = legendContainer
      .append('svg')
      .selectAll('.legend-item')
      .data(Object.keys(this.colors))
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(10, ${i * 25})`);

    legend
      .append('circle')
      .attr('cx', this.dotSize)
      .attr('cy', 10 + this.dotSize)
      .attr('r', this.dotSize)
      .attr('fill', d => this.colors[d]);

    legend
      .append('text')
      .attr('x', 20 + this.dotSize)
      .attr('y', 20 + this.dotSize / 2)
      .attr('alignment-baseline', 'middle')
      .text(d => d);
  }

  protected updated(_changedProperties: PropertyValues) {
    if (
      _changedProperties.has('xValues') ||
      _changedProperties.has('yValues')
    ) {
      this._plotScatter();
    }
  }
}
