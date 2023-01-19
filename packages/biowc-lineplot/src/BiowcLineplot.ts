import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import * as d3v6 from 'd3';
import { ScaleLinear, ValueFn } from 'd3';
import styles from './biowc-lineplot.css';
// import * as scale from "d3-scale";

type CurveParameterList = {
  [key: string]: number;
};

export class BiowcLineplot extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  dataPoints: number[][][] = [];

  @property({ attribute: false })
  width: number = 400;

  @property({ attribute: false })
  height: number = 400;

  @property({ attribute: false })
  xAxisLabel: string = '';

  @property({ attribute: false })
  yAxisLabel: string = '';

  @property({ attribute: false })
  formulas: string[] = [];

  @property({ attribute: false })
  curveParameters: CurveParameterList[] = [];

  @property({ attribute: false })
  curveMinX: number = -3;

  @property({ attribute: false })
  curveMaxX: number = 3;

  @property({ attribute: false })
  curveMinY: number | null = null;

  @property({ attribute: false })
  curveMaxY: number | null = null;

  svgXAxis: ScaleLinear<any, any> = d3v6.scaleLinear();

  svgYAxis: ScaleLinear<any, any> = d3v6.scaleLinear();

  curveFunctions: Function[] = [];

  curvePoints: number[][][] = [];

  minX!: number;

  maxX!: number;

  minY!: number;

  maxY!: number;

  // The D3 axes will exceed the width & height a bit, so we define a hard-coded margin
  // https://gist.github.com/mbostock/3019563
  margin = { top: 20, right: 20, bottom: 20, left: 20, xAxis: 30, yAxis: 30 };

  // margin = { top: 0, right: 0, bottom: 0, left: 0 };

  render() {
    return html` <div id="lineplot"></div>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    for (let i = 0; i < this.formulas.length; i += 1) {
      const curveFunction = BiowcLineplot.createCurveFunction(
        this.formulas[i],
        this.curveParameters[i]
      );
      this.curveFunctions.push(curveFunction);
      this.curvePoints.push(this.calculateCurvePoints(curveFunction));
    }
    this.createAxes();
    this._initializeTooltip();
    this._initializeAuxiliaryLines();
    this._plotDots();
    this._plotCurves();

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
      this.width - this.margin.left - this.margin.right - this.margin.yAxis;
    const heightRelativeToMargin =
      this.height - this.margin.top - this.margin.bottom - this.margin.xAxis;

    const mainDiv = this._getMainDiv();

    // append the svg object to the body of the page
    const svg = mainDiv
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const svgGroup = svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.margin.left + this.margin.xAxis},${this.margin.top})`
      )
      .attr('id', 'svgGroupElement');

    const allXValues = [
      ...this.dataPoints
        .map(pointlist => pointlist.map(point => point[0]))
        .flat(),
      this.curveMinX,
      this.curveMaxX,
    ];

    if (!this.curveMinY) {
      this.curveMinY = Math.min(
        ...this.curvePoints
          .map(pointlist => pointlist.map(point => point[1]))
          .flat()
      );
    }

    if (!this.curveMaxY) {
      this.curveMaxY = Math.max(
        ...this.curvePoints
          .map(pointlist => pointlist.map(point => point[1]))
          .flat()
      );
    }

    const allYValues = [
      ...this.dataPoints
        .map(pointlist => pointlist.map(point => point[1]))
        .flat(),
      this.curveMinY,
      this.curveMaxY,
    ];

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
        (this.width -
          this.margin.yAxis -
          this.margin.right -
          this.margin.left) /
        2
      }, 
      ${this.height - this.margin.xAxis})`
      )
      .style('text-anchor', 'middle')
      .text(`${this.xAxisLabel}`);

    svgGroup
      .append('text')
      // .attr('transform', 'rotate(-90)')
      .attr(
        'transform',
        `translate(
      ${-this.margin.yAxis},
      ${
        (this.height -
          this.margin.xAxis -
          this.margin.bottom -
          this.margin.top) /
        2
      }) rotate(-90)`
      )
      .style('text-anchor', 'middle')
      .text(`${this.yAxisLabel}`);
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

    for (let i = 0; i < this.dataPoints.length; i += 1) {
      dotlistGroup
        .append('g')
        .selectAll('dot')
        .data(this.dataPoints[i])
        .join('circle')
        .attr('cx', point => this.svgXAxis((<Number[]>point)[0]))
        .attr('cy', point => this.svgYAxis((<Number[]>point)[1]))
        .attr('r', 4)
        // .style('fill', colors(i))
        .style('fill', d3v6.schemeSet2[i])
        .on('mousemove', (e, d) =>
          this._showTooltip(e, {
            x: d[0].toPrecision(4),
            y: d[1].toPrecision(4),
          })
        )
        .on('mouseout', this._hideTooltip);

      // Connect dots with a line
      dotlistGroup
        .append('path')
        .attr('class', 'dotconnector')
        // Sort ascending by x value
        .datum(this.dataPoints[i].sort((a, b) => a[0] - b[0]))
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
        // .style('stroke', colors(i))
        .style('stroke', d3v6.schemeSet2[i])
        .style('fill', 'none');
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
        .style('fill', 'none');

    for (let i = 0; i < this.curvePoints.length; i += 1) {
      // Add actual curve
      plotCurve(this.curvePoints[i], 1.5, d3v6.schemeSet2[i]);
      // Add thicker invisible curve - for better mouseover functionality
      const invisibleCurve = plotCurve(
        this.curvePoints[i],
        10,
        d3v6.schemeSet2[i]
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
          const yValue = this.curveFunctions[i](xValue);
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
    const curveStep = (this.curveMaxX - this.curveMinX) / 1000;
    const curvePoints: number[][] = [];

    for (let x = this.curveMinX; x <= this.curveMaxX; x += curveStep) {
      curvePoints.push([x, curveFunction(x)]);
    }
    return curvePoints;
  }
}
