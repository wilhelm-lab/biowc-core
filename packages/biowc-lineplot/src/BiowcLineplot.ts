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

  render() {
    return html`<div id="lineplot"></div>`;
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
    this._plotDots();
    this._plotCurves();

    super.firstUpdated(_changedProperties);
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3v6.select(this.shadowRoot).select('#lineplot');
  }

  private createAxes() {
    // The D3 axes will exceed the width & height a bit, so we define a hard-coded margin
    // https://gist.github.com/mbostock/3019563
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const widthRelativeToMargin = this.width - margin.left - margin.right;
    const heightRelativeToMargin = this.height - margin.top - margin.bottom;

    const mainDiv = this._getMainDiv();

    // append the svg object to the body of the page
    const svg = mainDiv
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
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
    const minX = Math.min(...allXValues);
    const maxX = Math.max(...allXValues);
    const minY = Math.min(...allYValues);
    const maxY = Math.max(...allYValues);

    this.svgXAxis = d3v6
      .scaleLinear()
      .domain([minX, maxX])
      .range([0, widthRelativeToMargin]);

    svg
      .append('g')
      .attr('transform', `translate(0,${heightRelativeToMargin})`)
      .call(d3v6.axisBottom(this.svgXAxis));

    this.svgYAxis = d3v6
      .scaleLinear()
      .domain([minY, maxY])
      .range([heightRelativeToMargin, 0]);

    svg.append('g').call(d3v6.axisLeft(this.svgYAxis));
  }

  private _plotDots() {
    const mainDiv = this._getMainDiv();

    const svg = mainDiv.select('#svgGroupElement');

    // Define tooltip
    const tooltip = mainDiv
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // Define tooltip event handlers
    const showTooltip = (e: MouseEvent, d: number[]) => {
      tooltip
        .html(`<p>x=${d[0]}, y=${d[1]}</p>`)
        .style('left', `${e.pageX + 10}px`)
        .style('top', `${e.pageY - 10}px`)
        .transition()
        .duration(100) // ms
        .style('opacity', 0.9); // started as 0!
    };
    const hideTooltip = () => {
      tooltip
        .transition()
        .duration(100) // ms
        .style('opacity', 0);
    };

    // Add dots
    const dotlistGroup = svg.append('g').attr('id', 'dotlistGroup');

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
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip);

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
    const svg = mainDiv.select('#svgGroupElement');

    const curveGroup = svg.append('g').attr('id', 'curveGroup');
    const line = d3v6
      .line()
      .curve(d3v6.curveLinear)
      .x(d => this.svgXAxis(d[0]))
      .y(d => this.svgYAxis(d[1]));

    for (let i = 0; i < this.curvePoints.length; i += 1) {
      curveGroup
        .append('path')
        .attr('class', 'curvePath')
        .datum(this.curvePoints[i])
        .attr('stroke-width', 1.5)
        .attr('d', line as ValueFn<SVGPathElement, number[][], null>)
        .style('stroke', d3v6.schemeSet2[i])
        .style('fill', 'none');
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
