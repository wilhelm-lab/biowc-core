import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import * as d3v6 from 'd3';
import { ScaleLinear, ValueFn } from 'd3';
import { HTMLTemplateResult } from 'lit/development';
import styles from './biowc-lineplot.css';
// import * as scale from "d3-scale";

type CurveParameterList = {
  [key: string]: number;
};

interface InputDataset {
  id: string;
  formula: string;
  curveParameters: CurveParameterList; // TODO: Why are you not throwing errors?
  dataPoints: number[][];
  color: string;
  curveFunction?: Function;
  curvePoints?: number[][];
  legendText?: string;
}

interface MetaDataAttributes {
  width?: number;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  curveMinX?: number;
  curveMaxX?: number;
  curveMinY?: number;
  curveMaxY?: number;
  curveOpacity?: number;
  connectDots?: boolean;
  dotSize?: number;
  dotOpacity?: number;
  showLegend?: boolean;
  legendPosition?: 'side' | 'bottom' | null;
}

export class BiowcLineplot extends LitElement {
  set metaDataAttr(value: MetaDataAttributes) {
    // Initialize everything in metaData with default values
    this._metaDataAttr = {
      width: 400,
      height: 400,
      curveMinX: -5,
      curveMaxX: 5,
      curveOpacity: 1,
      connectDots: true,
      dotSize: 4,
      dotOpacity: 0.1,
      showLegend: false,
      legendPosition: 'bottom',
      // This overwrites the default with the custom values, if defined
      ...value,
    };
  }

  static styles = styles;

  @property({ attribute: false })
  inputData: InputDataset[] = [];

  @property({ attribute: false })
  private _metaDataAttr!: MetaDataAttributes;

  svgXAxis: ScaleLinear<any, any> = d3v6.scaleLinear();

  svgYAxis: ScaleLinear<any, any> = d3v6.scaleLinear();

  minX!: number;

  maxX!: number;

  minY!: number;

  maxY!: number;

  // The D3 axes will exceed the width & height a bit, so we define a hard-coded margin
  // https://gist.github.com/mbostock/3019563
  margin = { top: 20, right: 20, bottom: 20, left: 20, xAxis: 30, yAxis: 30 };

  // margin = { top: 0, right: 0, bottom: 0, left: 0 };

  render(): HTMLTemplateResult {
    return html` <div
      id="container"
      class="${this._metaDataAttr.legendPosition === 'side'
        ? 'legend-horizontal'
        : 'legend-vertical'}"
      style="display: flex"
    >
      <div id="lineplot"></div>
      <export-button
        .svgComponent="${this}"
        style="margin-left: 20px;"
      ></export-button>
      <div id="legendContainer"></div>
    </div>`;
  }

  public exportSvg() {
    return this.shadowRoot?.querySelector('svg')?.outerHTML;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    for (let i = 0; i < this.inputData.length; i += 1) {
      if (this.inputData[i].formula && this.inputData[i].curveParameters) {
        this.inputData[i].curveFunction = BiowcLineplot.createCurveFunction(
          this.inputData[i].formula,
          this.inputData[i].curveParameters
        );
        this.inputData[i].curvePoints = this.calculateCurvePoints(
          <Function>this.inputData[i].curveFunction
        );
      }
    }

    this.createAxes();
    this._initializeTooltip();
    this._initializeAuxiliaryLines();
    this._plotDots();
    this._plotCurves();

    // Add the legend
    if (this._metaDataAttr.showLegend) {
      this._renderLegend();
    }

    super.firstUpdated(_changedProperties);
  }

  private _initializeTooltip() {
    this._getMainDiv()
      .append('div')
      .attr('id', 'tooltip')
      .attr('class', 'tooltip')
      .style('opacity', 0);
  }

  private _showTooltip(e: MouseEvent, coordinates: { x: string; y: string }) {
    this._getMainDiv()
      .select('#tooltip')
      .html(`<p>x=${coordinates.x}, y=${coordinates.y}</p>`)
      .style('left', `${e.pageX + 10}px`)
      .style('top', `${e.pageY - 10}px`)
      .transition()
      .duration(100) // ms
      .style('opacity', 0.9); // started as 0!
  }

  private _hideTooltip() {
    this._getMainDiv()
      .select('#tooltip')
      .transition()
      .duration(100) // ms
      .style('opacity', 0);
  }

  private _initializeAuxiliaryLines() {
    const auxiliaryLines = this._getMainDiv()
      .select('#svgGroupElement')
      .append('g');

    auxiliaryLines
      .append('line')
      .attr('id', 'auxiliaryHorizontalLine')
      .attr('x1', this.svgXAxis(this.minX))
      .attr('stroke', 'black')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 2')
      .style('opacity', 0);

    auxiliaryLines
      .append('line')
      .attr('id', 'auxiliaryVerticalLine')
      .attr('y1', this.svgYAxis(this.minY))
      .attr('stroke', 'black')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 2')
      .style('opacity', 0);
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3v6.select(this.shadowRoot).select('#lineplot');
  }

  private createAxes() {
    const widthRelativeToMargin =
      this._metaDataAttr.width! -
      this.margin.left -
      this.margin.right -
      this.margin.yAxis;
    const heightRelativeToMargin =
      this._metaDataAttr.height! -
      this.margin.top -
      this.margin.bottom -
      this.margin.xAxis;

    const mainDiv = this._getMainDiv();

    // append the svg object to the body of the page
    const svg = mainDiv
      .append('svg')
      .attr('width', this._metaDataAttr.width!)
      .attr('height', this._metaDataAttr.height!);

    const svgGroup = svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.margin.left + this.margin.xAxis},${this.margin.top})`
      )
      .attr('id', 'svgGroupElement');

    const allXValues = [
      ...this.inputData
        .filter(dataset => dataset.dataPoints)
        .map(dataset => dataset.dataPoints.map(point => point[0]))
        .flat(),
      this._metaDataAttr.curveMinX!,
      this._metaDataAttr.curveMaxX!,
    ];

    const allCurveYValues = this.inputData
      .filter(dataset => dataset.curvePoints)
      .map(dataset => (<number[][]>dataset.curvePoints).map(point => point[1]))
      .flat();
    if (!this._metaDataAttr.curveMinY && allCurveYValues.length > 0) {
      this._metaDataAttr.curveMinY = Math.min(...allCurveYValues);
    }

    if (!this._metaDataAttr.curveMaxY && allCurveYValues.length > 0) {
      this._metaDataAttr.curveMaxY = Math.max(...allCurveYValues);
    }

    const allYValues = [
      ...this.inputData
        .filter(dataset => dataset.dataPoints)
        .map(dataset => dataset.dataPoints.map(point => point[1]))
        .flat(),
    ];
    if (this._metaDataAttr.curveMinY) {
      allYValues.push(this._metaDataAttr.curveMinY);
    }

    if (this._metaDataAttr.curveMaxY) {
      allYValues.push(this._metaDataAttr.curveMaxY);
    }

    // Add x and y axis
    this.minX = Math.min(...allXValues);
    this.maxX = Math.max(...allXValues);
    this.minY = Math.min(...allYValues);
    this.maxY = Math.max(...allYValues);

    this.svgXAxis = d3v6
      .scaleLinear()
      .domain([this.minX, this.maxX])
      .range([0, widthRelativeToMargin]);

    svgGroup
      .append('g')
      .attr('transform', `translate(0,${heightRelativeToMargin})`)
      .call(d3v6.axisBottom(this.svgXAxis));

    this.svgYAxis = d3v6
      .scaleLinear()
      .domain([this.minY, this.maxY])
      .range([heightRelativeToMargin, 0]);

    svgGroup.append('g').call(d3v6.axisLeft(this.svgYAxis));

    // Add x axis label

    svgGroup
      .append('text')
      .attr(
        'transform',
        `translate(
      ${
        (this._metaDataAttr.width! -
          this.margin.yAxis -
          this.margin.right -
          this.margin.left) /
        2
      },
      ${this._metaDataAttr.height! - this.margin.xAxis})`
      )
      .style('text-anchor', 'middle')
      .text(`${this._metaDataAttr.xAxisLabel}`);

    svgGroup
      .append('text')
      // .attr('transform', 'rotate(-90)')
      .attr(
        'transform',
        `translate(
      ${-this.margin.yAxis},
      ${
        (this._metaDataAttr.height! -
          this.margin.xAxis -
          this.margin.bottom -
          this.margin.top) /
        2
      }) rotate(-90)`
      )
      .style('text-anchor', 'middle')
      .text(`${this._metaDataAttr.yAxisLabel}`);
  }

  private _plotDots() {
    const mainDiv = this._getMainDiv();

    const svgGroup = mainDiv.select('#svgGroupElement');

    // Add dots
    const dotlistGroup = svgGroup.append('g').attr('id', 'dotlistGroup');

    // const colors = scale
    // .scaleLinear<string>()
    // .domain([0, this.dataPoints.length])
    // .range(["#f44336", "#3b73b4"]);

    for (let i = 0; i < this.inputData.length; i += 1) {
      if (this.inputData[i].dataPoints) {
        dotlistGroup
          .append('g')
          .selectAll('dot')
          .data(this.inputData[i].dataPoints)
          .join('circle')
          .attr('cx', point => this.svgXAxis((<Number[]>point)[0]))
          .attr('cy', point => this.svgYAxis((<Number[]>point)[1]))
          .attr('r', this._metaDataAttr.dotSize!)
          .style('fill', this.inputData[i].color || d3v6.schemeSet2[i])
          .attr('opacity', this._metaDataAttr.dotOpacity || 1)
          .on('mousemove', (e, d) =>
            this._showTooltip(e, {
              x: d[0].toPrecision(4),
              y: d[1].toPrecision(4),
            })
          )
          .on('mouseout', () => this._hideTooltip());

        // Connect dots with a line

        if (this._metaDataAttr.connectDots) {
          dotlistGroup
            .append('path')
            .attr('class', 'dotconnector')
            // Sort ascending by x value
            .datum(this.inputData[i].dataPoints.sort((a, b) => a[0] - b[0]))
            .attr('stroke-width', 1.5)
            .attr(
              'd',
              d3v6
                .line()
                .x(d => this.svgXAxis(d[0]))
                .y(d => this.svgYAxis(d[1])) as ValueFn<
                SVGPathElement,
                number[][],
                null
              >
            )
            .style('stroke', this.inputData[i].color || d3v6.schemeSet2[i])
            .style('fill', 'none')
            .attr('opacity', this._metaDataAttr.dotOpacity || 1);
        }
      }
    }
  }

  private _plotCurves() {
    const mainDiv = this._getMainDiv();
    const svgGroup = mainDiv.select('#svgGroupElement');

    const curveGroup = svgGroup.append('g').attr('id', 'curveGroup');
    const line = d3v6
      .line()
      .curve(d3v6.curveLinear)
      .x(d => this.svgXAxis(d[0]))
      .y(d => this.svgYAxis(d[1]));

    const plotCurve = (
      datum: number[][],
      strokeWidth: number,
      strokeColor: string
    ) =>
      curveGroup
        .append('path')
        .attr('class', 'curvePath')
        .datum(datum)
        .attr('stroke-width', strokeWidth)
        .attr('d', line as ValueFn<SVGPathElement, number[][], null>)
        .style('stroke', strokeColor)
        .style('fill', 'none')
        .attr('opacity', this._metaDataAttr.curveOpacity || 1);

    for (let i = 0; i < this.inputData.length; i += 1) {
      if (this.inputData[i].curvePoints) {
        // Add actual curve
        plotCurve(
          <number[][]>this.inputData[i].curvePoints,
          1.5,
          this.inputData[i].color || d3v6.schemeSet2[i]
        );
        // Add thicker invisible curve - for better mouseover functionality
        const invisibleCurve = plotCurve(
          <number[][]>this.inputData[i].curvePoints,
          10,
          this.inputData[i].color || d3v6.schemeSet2[i]
        );
        invisibleCurve
          .style('opacity', 0)
          // Add mouseevent to invisible curve
          .on('mousemove', e => {
            // Get mouse event position relative to the svg object
            // Copied from here: https://stackoverflow.com/questions/10298658/mouse-position-inside-autoscaled-svg
            const svg = this._getMainDiv().select('svg');
            const svgPoint = (<SVGSVGElement>svg.node())!.createSVGPoint();

            function cursorPoint(event: MouseEvent) {
              svgPoint.x = event.clientX;
              svgPoint.y = event.clientY;
              return svgPoint.matrixTransform(
                (<SVGGraphicsElement>svg.node())!.getScreenCTM()!.inverse()
              );
            }

            const loc = cursorPoint(e);
            // We need the original xValue in our data domain. So we call the inverse function of the xAxis
            const xValue = this.svgXAxis.invert(
              loc.x - this.margin.left - this.margin.xAxis
            );
            // Then we calculate the y position by feeding the x value into the function
            const yValue = (<Function>this.inputData[i].curveFunction)(xValue);
            // Get auxiliary lines, update their positions, and make them visible
            this._getMainDiv()
              .select('#auxiliaryHorizontalLine')
              .attr('x2', this.svgXAxis(xValue))
              .attr('y1', this.svgYAxis(yValue))
              .attr('y2', this.svgYAxis(yValue))
              .style('opacity', 1);

            this._getMainDiv()
              .select('#auxiliaryVerticalLine')
              .attr('x1', this.svgXAxis(xValue))
              .attr('x2', this.svgXAxis(xValue))
              .attr('y2', this.svgYAxis(yValue))
              .style('opacity', 1);

            this._showTooltip(e, {
              x: xValue.toPrecision(4),
              y: yValue.toPrecision(4),
            });
          })
          .on('mouseout', () => {
            this._getMainDiv()
              .select('#auxiliaryHorizontalLine')
              .style('opacity', 0);

            this._getMainDiv()
              .select('#auxiliaryVerticalLine')
              .style('opacity', 0);

            this._hideTooltip();
          });
      }
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
      .data(this.inputData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(10, ${(i + 1) * 25})`);

    legend
      .append('circle')
      .attr('cx', this._metaDataAttr.dotSize!)
      .attr('cy', 10 + this._metaDataAttr.dotSize!)
      .attr('r', this._metaDataAttr.dotSize!)
      .attr('fill', d => d.color || 'black')
      .attr('opacity', this._metaDataAttr.dotOpacity || 1);

    legend
      .append('text')
      .attr('x', 20 + this._metaDataAttr.dotSize!)
      .attr('y', 20 + this._metaDataAttr.dotSize! / 2)
      .attr('alignment-baseline', 'middle')
      .text(d => d.legendText || '');
  }

  static createCurveFunction(
    formula: string,
    curveParameterList: CurveParameterList
  ) {
    let replacedFormula = formula;
    Object.keys(curveParameterList).forEach(key => {
      // returns -1 if no seach result in string
      while (replacedFormula.search(key) !== -1) {
        replacedFormula = replacedFormula.replace(
          key,
          curveParameterList[key].toString()
        );
      }
    });
    // TODO Fix entry point of Function call
    // eslint-disable-next-line no-new-func
    return Function('x', replacedFormula);
  }

  calculateCurvePoints(curveFunction: Function) {
    const curveStep =
      (this._metaDataAttr.curveMaxX! - this._metaDataAttr.curveMinX!) / 1000;
    const curvePoints: number[][] = [];

    for (
      let x = this._metaDataAttr.curveMinX!;
      x <= this._metaDataAttr.curveMaxX!;
      x += curveStep
    ) {
      curvePoints.push([x, curveFunction(x)]);
    }
    return curvePoints;
  }
}
