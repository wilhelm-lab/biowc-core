import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import * as d3v6 from 'd3';
import { HTMLTemplateResult, PropertyValues } from 'lit/development';
import { ScaleLinear } from 'd3';
import styles from './biowc-scatter.css';

export class BiowcScatter extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  width: number = 400;

  @property({ attribute: false })
  height: number = 400;

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
  xValueKey: string = 'xValue';

  @property({ attribute: false })
  yValueKey: string = 'yValue';

  @property({ attribute: false })
  xValues: { [key: string]: number | string }[] = [];

  @property({ attribute: false })
  yValues: { [key: string]: number | string }[] = [];

  @property({ attribute: false })
  xMin: number = Infinity;

  @property({ attribute: false })
  xMax: number = -Infinity;

  @property({ attribute: false })
  yMin: number = Infinity;

  @property({ attribute: false })
  yMax: number = -Infinity;

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

  @property({ attribute: false })
  legendFontSize?: number | string = 'medium';

  @property({ attribute: false })
  lines: {
    slope?: number; // For sloped lines
    intercept?: number; // For sloped lines
    xValue?: number; // For vertical lines
    color?: string;
    dashes?: string;
    width?: number;
  }[] = [];

  @property({ attribute: false })
  highlightedDots: string[] = [];

  @property({ attribute: false })
  highlightColor: string | undefined;

  @property({ attribute: false })
  highlightAddedSize: number = 2;

  @property({ attribute: false })
  dotOpacity: number | undefined;

  @property({ attribute: false })
  enlargeOnHover: boolean = false;

  // The D3 axes will exceed the width & height a bit, so we define a hard-coded margin
  // https://gist.github.com/mbostock/3019563
  margin = { top: 20, right: 20, bottom: 30, left: 30, xAxis: 30, yAxis: 45 };

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
        <div
          id="legendContainer"
          style="${this.legendPosition === 'bottom' ? 'margin-left: 20px' : ''}"
        ></div>
      </div>
    `;
  }

  public getSVG() {
    return this._getMainDiv().selectAll('svg').node();
  }

  // This is for the ExportButton component. Keeping it for legacy reasons
  public exportSvg() {
    return this.shadowRoot?.querySelector('svg')?.outerHTML;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    // Init colors if not defined
    if (!this._areColorsDefined()) this._initColors();

    // Optionally, add trendline to list of auxiliary lines
    if (this.showTrendline) {
      if (!this.lines) {
        this.lines = [];
      }
      this.lines.push(this._linearRegression());
    }

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
      ...this.xValues.map(x => ({ [x[this.idKey]]: x[this.xValueKey] }))
    );
    const yValuesById: valuesById = Object.assign(
      {},
      ...this.yValues.map(y => ({ [y[this.idKey]]: y[this.yValueKey] }))
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

  private _linearRegression(): { slope: number; intercept: number } {
    const x: number[] = [];
    const y: number[] = [];
    Object.entries(this.valuesInCommon).forEach(Element => {
      x.push(Element[1].xValue);
      y.push(Element[1].yValue);
    });

    const n = y.length;
    let sumX = 0;
    let sumY = 0;
    let sumXy = 0;
    let sumXx = 0;

    for (let i = 0; i < y.length; i += 1) {
      sumX += x[i];
      sumY += y[i];
      sumXy += x[i] * y[i];
      sumXx += x[i] * x[i];
    }

    const slope = (n * sumXy - sumX * sumY) / (n * sumXx - sumX * sumX);
    return {
      slope,
      intercept: (sumY - slope * sumX) / n,
    };
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
      .selectAll('.dot')
      .data(this.valuesInCommon)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.xValue))
      .attr('cy', d => y(d.yValue))
      .attr('r', this.dotSize)
      // .style('fill', '#69b3a2')
      .attr('fill', d => this.colors[d.category])
      .attr('opacity', this.dotOpacity || 1)
      .on('mousemove', tipMouseover)
      .on('mouseover', (event, d) => {
        if (this.enlargeOnHover) this._enlargeDotsOnHover(event, d);
      })
      .on('mouseout', event => {
        // Hide the tooltip
        tipMouseout();
        if (this.enlargeOnHover) this._revertenlargeDotsOnHover(event);
      })
      .on('click', (e, d) =>
        this.dispatchEvent(new CustomEvent('onDotClicked', { detail: d }))
      );
  }

  private _addHighlights(
    x: ScaleLinear<number, number>,
    y: ScaleLinear<number, number>,
    svg: d3v6.Selection<SVGGElement, unknown, HTMLElement, any>
  ) {
    svg
      .selectAll('.highlight-ring')
      .data(
        this.valuesInCommon.filter(dot => this.highlightedDots.includes(dot.id))
      )
      .join('circle')
      .attr('class', 'highlight-ring')
      .attr('cx', d => x(d.xValue))
      .attr('cy', d => y(d.yValue))
      .attr('r', this.dotSize + this.highlightAddedSize)
      .attr('fill', 'none')
      .attr('stroke', this.highlightColor || 'yellow')
      .attr('stroke-width', 5);
  }

  private _addLines(
    svg: d3v6.Selection<SVGGElement, unknown, HTMLElement, any>,
    xScale: ScaleLinear<number, number>,
    yScale: ScaleLinear<number, number>
  ) {
    // First, remove any previously created lines
    svg.selectAll('.auxiliary-line').remove();

    const xMin = xScale.domain()[0];
    const xMax = xScale.domain()[1];
    const yMin = yScale.domain()[0];
    const yMax = yScale.domain()[1];

    this.lines.forEach(line => {
      let x1;
      let x2;
      let y1;
      let y2;
      if (line.slope != null && line.intercept != null) {
        const equation = (x: number) => line.slope! * x + line.intercept!;

        x1 = xMin;
        x2 = xMax;
        y1 = equation(xMin);
        y2 = equation(xMax);

        // Ensure y values stay within the visible y-axis range
        if (y1 < yMin) {
          x1 = (yMin - equation(0)) / (equation(1) - equation(0));
          y1 = yMin;
        } else if (y1 > yMax) {
          x1 = (yMax - equation(0)) / (equation(1) - equation(0));
          y1 = yMax;
        }

        if (y2 < yMin) {
          x2 = (yMin - equation(0)) / (equation(1) - equation(0));
          y2 = yMin;
        } else if (y2 > yMax) {
          x2 = (yMax - equation(0)) / (equation(1) - equation(0));
          y2 = yMax;
        }
      } else if (line.xValue != null) {
        x1 = line.xValue;
        x2 = line.xValue;
        y1 = yMin;
        y2 = yMax;
      }

      if (x1 != null && x2 != null && y1 != null && y2 != null) {
        svg
          .append('line')
          .attr('class', 'auxiliary-line')
          .attr('x1', xScale(x1))
          .attr('x2', xScale(x2))
          .attr('y1', yScale(y1))
          .attr('y2', yScale(y2))
          .attr('stroke', line.color || '#000000')
          .attr('stroke-dasharray', line.dashes || '')
          .attr('stroke-width', line.width || 1);
      }
    });
  }

  private _plotScatter() {
    // set the dimensions and margins of the graph

    const widthRelativeToMargin =
      this.width! - this.margin.left - this.margin.right - this.margin.yAxis;

    const heightRelativeToMargin =
      this.height! - this.margin.top - this.margin.bottom - this.margin.xAxis;

    const mainDiv = this._getMainDiv();

    mainDiv.select('svg').remove();

    // append the svg object to the body of the page
    const svg = mainDiv
      .append('svg')
      .attr('width', this.width!)
      .attr('height', this.height);

    const svgGroup = svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.margin.left + this.margin.xAxis},${this.margin.top})`
      );

    // Add X axis
    const minValueX = Math.min(
      ...this.valuesInCommon.map(d => d.xValue),
      this.xMin
    );
    const maxValueX = Math.max(
      ...this.valuesInCommon.map(d => d.xValue),
      this.xMax
    );

    const x = d3v6
      .scaleLinear()
      .domain([minValueX, maxValueX])
      .range([0, widthRelativeToMargin]);
    svgGroup
      .append('g')
      .attr('transform', `translate(0,${heightRelativeToMargin})`)
      .call(d3v6.axisBottom(x));

    // Add Y axis
    const minValueY = Math.min(
      ...this.valuesInCommon.map(d => d.yValue),
      this.yMin
    );
    const maxValueY = Math.max(
      ...this.valuesInCommon.map(d => d.yValue),
      this.yMax
    );

    const y = d3v6
      .scaleLinear()
      .domain([minValueY, maxValueY])
      .range([heightRelativeToMargin, 0]);
    svgGroup.append('g').call(d3v6.axisLeft(y));

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
      const htmlElement = `<pre>${d.id}:
  ${this.xValueKey} = ${parseFloat(d.xValue.toFixed(3))},
  ${this.yValueKey} = ${parseFloat(d.yValue.toFixed(3))}</pre>`;
      tooltip
        .html(htmlElement)
        .style('left', `${e.offsetX + 45}px`)
        .style('top', `${e.offsetY + 25}px`)
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

    this._addLines(svgGroup, x, y);

    this._addHighlights(x, y, svgGroup);
    this._addDots(tipMouseover, tipMouseout, x, y, svgGroup);

    // add the x Axis Label
    svgGroup
      .append('text')
      .attr(
        'transform',
        `translate(${widthRelativeToMargin / 2} ,${
          this.height! - this.margin.xAxis
        })`
      )
      .style('text-anchor', 'middle')
      .text(`${this.xLabel}`);

    // add the y Axis Label
    svgGroup
      .append('text')
      .attr(
        'transform',
        `translate(
      ${-this.margin.yAxis},
      ${heightRelativeToMargin / 2}) rotate(-90)`
      )
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
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(10, ${i * 25})`);

    legend
      .append('circle')
      .attr('cx', this.dotSize)
      .attr('cy', 10 + this.dotSize)
      .attr('r', this.dotSize)
      .attr('fill', d => this.colors[d])
      .attr('opacity', this.dotOpacity || 1);

    legend
      .append('text')
      .attr('x', 20 + this.dotSize)
      .attr('y', 10 + this.dotSize)
      .attr('alignment-baseline', 'middle')
      .attr('font-size', this.legendFontSize!)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'central')
      .text(d => d);
  }

  private _enlargeDotsOnHover(
    hoverEvent: MouseEvent,
    dot: {
      id: string;
      xValue: number;
      yValue: number;
      category: number | string;
    }
  ) {
    // @ts-ignore
    d3v6.select(hoverEvent.currentTarget).attr('r', this.dotSize * 2);

    // Check if the dot has a highlightring and enlarge it
    this._getMainDiv()
      .selectAll<SVGCircleElement, { id: string }>('.highlight-ring')
      .attr('r', d =>
        d.id === dot.id
          ? (this.dotSize + this.highlightAddedSize) * 2
          : this.dotSize + this.highlightAddedSize
      );
  }

  private _revertenlargeDotsOnHover(hoverEvent: MouseEvent) {
    // @ts-ignore
    d3v6.select(hoverEvent.currentTarget).attr('r', this.dotSize);

    // Revert the enlargement of all highlight-rings (no need to check if this is actually necessary, doesn't make a difference)
    this._getMainDiv()
      .selectAll('.highlight-ring')
      .attr('r', this.dotSize + this.highlightAddedSize);
  }

  private _areColorsDefined() {
    if (!this.categories || this.categories.length === 0) {
      // We cannot yet handle colors when there are no categories, will be implemented soon
      return true;
    }

    if (!this.colors) return false;

    // If colors are defined, it might be that they are not yet defined for all categories. So check if there is a color for every category
    const allCategories = new Set(this.categories.map(cat => cat.category));
    const allCategoriesWithColors = new Set(Object.keys(this.colors));

    // Check for set equality
    return (
      allCategories.size === allCategoriesWithColors.size &&
      new Set([...allCategoriesWithColors, ...allCategoriesWithColors]).size ===
        allCategories.size
    );
  }

  private _initColors() {
    const allCategories = [
      ...new Set(this.categories.map(cat => cat.category)),
    ];

    this.colors = {};
    allCategories.forEach((cat: string | number, i: number) => {
      this.colors[cat] = d3v6.schemeCategory10[i];
    });
  }

  protected updated(_changedProperties: PropertyValues) {
    if (
      _changedProperties.has('xValues') ||
      _changedProperties.has('yValues') ||
      _changedProperties.has('highlightedDots')
    ) {
      if (!this._areColorsDefined()) this._initColors();
      this._plotScatter();
    }
  }
}
