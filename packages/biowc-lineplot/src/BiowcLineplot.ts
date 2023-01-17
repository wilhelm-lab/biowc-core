import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import * as d3v6 from 'd3';
import { ValueFn } from 'd3';

export class BiowcLineplot extends LitElement {
  @property({ type: String }) mytitle = 'Hey there';

  @property({ attribute: false })
  dataPoints: number[][][] = [];

  render() {
    return html`<div id="lineplot"></div>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this._plotDots();

    super.firstUpdated(_changedProperties);
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3v6.select(this.shadowRoot).select('#lineplot');
  }

  private _plotDots() {
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const mainDiv = this._getMainDiv();

    // append the svg object to the body of the page
    const svg = mainDiv
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 30)
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

    const xAxis = d3v6.scaleLinear().domain([minX, maxX]).range([0, width]);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3v6.axisBottom(xAxis));

    const yAxis = d3v6.scaleLinear().domain([minY, maxY]).range([height, 0]);

    svg.append('g').call(d3v6.axisLeft(yAxis));

    // Add dots
    const dotlistGroup = svg.append('g').attr('id', 'dotlistGroup');

    for (let i = 0; i < this.dataPoints.length; i += 1) {
      dotlistGroup
        .append('g')
        .selectAll('dot')
        .data(this.dataPoints[i])
        .join('circle')
        .attr('cx', point => xAxis((<Number[]>point)[0]))
        .attr('cy', point => yAxis((<Number[]>point)[1]))
        .attr('r', 4)
        .style('fill', d3v6.schemeSet2[i]);

      // Connect dots with a line
      dotlistGroup
        .append('path')
        // Sort ascending by x value
        .datum(this.dataPoints[i].sort((a, b) => a[0] - b[0]))
        .attr('stroke-width', 1.5)
        // .attr('d', <ValueFn<SVGPathElement, number[][], number>><unknown>d3v6.line()
        .attr(
          'd',
          <ValueFn<SVGPathElement, number[][], null>>d3v6
            .line()
            .x(d => xAxis(d[0]))
            .y(d => yAxis(d[1]))
        )
        .style('stroke', d3v6.schemeSet2[i])
        .style('fill', 'none');
    }
  }
}
