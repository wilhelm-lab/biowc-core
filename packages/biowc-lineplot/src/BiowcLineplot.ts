import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import * as d3v6 from 'd3';
import { ValueFn } from 'd3';
import styles from './biowc-lineplot.css';
// import * as scale from "d3-scale";

export class BiowcLineplot extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  dataPoints: number[][][] = [];

  @property({ attribute: false })
  formulas: string[] = [];

  @property({ attribute: false })
  width: number = 400;

  @property({ attribute: false })
  height: number = 400;

  render() {
    return html`<div id="lineplot"></div>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this._plotDots();
    // this._plotCurves();

    super.firstUpdated(_changedProperties);
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3v6.select(this.shadowRoot).select('#lineplot');
  }

  private _plotDots() {
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
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add x and y axis
    const minX = Math.min(
      ...this.dataPoints
        .map(pointlist => pointlist.map(point => point[0]))
        .flat()
    );
    const maxX = Math.max(
      ...this.dataPoints
        .map(pointlist => pointlist.map(point => point[0]))
        .flat()
    );
    const minY = Math.min(
      ...this.dataPoints
        .map(pointlist => pointlist.map(point => point[1]))
        .flat()
    );
    const maxY = Math.max(
      ...this.dataPoints
        .map(pointlist => pointlist.map(point => point[1]))
        .flat()
    );

    const xAxis = d3v6
      .scaleLinear()
      .domain([minX, maxX])
      .range([0, widthRelativeToMargin]);

    svg
      .append('g')
      .attr('transform', `translate(0,${heightRelativeToMargin})`)
      .call(d3v6.axisBottom(xAxis));

    const yAxis = d3v6
      .scaleLinear()
      .domain([minY, maxY])
      .range([heightRelativeToMargin, 0]);

    svg.append('g').call(d3v6.axisLeft(yAxis));

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
        .attr('cx', point => xAxis((<Number[]>point)[0]))
        .attr('cy', point => yAxis((<Number[]>point)[1]))
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
            .x(d => xAxis(d[0]))
            .y(d => yAxis(d[1])) as ValueFn<SVGPathElement, number[][], null>
        )
        // .style('stroke', colors(i))
        .style('stroke', d3v6.schemeSet2[i])
        .style('fill', 'none');
    }
  }

  // private _plotCurves() {
  // console.log(this.formulas)
  // }
}
