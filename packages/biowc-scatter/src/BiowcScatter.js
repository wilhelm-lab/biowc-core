import { html, css, LitElement } from 'lit';

import * as d3 from 'd3';

export class BiowcScatter extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--biowc-scatter-text-color, #000);
      }
      .tooltip {
        position: absolute;
        font-size: 12px;
        width: auto;
        height: auto;
        pointer-events: none;
        background-color: white;
      }
    `;
  }

  static get properties() {
    return {
      idKey: {
        type: String,
        default: 'id',
      },
      valueKey: {
        type: String,
        default: 'value',
      },
      xLabel: {
        type: String,
        default: '',
      },
      yLabel: {
        type: String,
        default: '',
      },
      xValues: {
        type: Array,
        default: () => [],
      },
      yValues: {
        type: Array,
        default: () => [],
      },
    };
  }

  render() {
    return html` <div id="scatterplot"></div> `;
  }

  updated() {
    this.updateScatterPlot();
  }

  updateScatterPlot() {
    this.valuesInCommon = this.getValuesInCommon();
    this.plotScatter();
  }

  getValuesInCommon() {
    const xValuesById = Object.assign(
      {},
      ...this.xValues.map(x => ({ [x[this.idKey]]: x[this.valueKey] }))
    );
    const yValuesById = Object.assign(
      {},
      ...this.yValues.map(x => ({ [x[this.idKey]]: x[this.valueKey] }))
    );
    const valuesInCommon = [];
    for (const [key, value] of Object.entries(xValuesById)) {
      if (key in yValuesById) {
        valuesInCommon.push({
          id: key,
          xValue: value,
          yValue: yValuesById[key],
        });
      }
    }
    return valuesInCommon;
  }

  static linearRegression(y, x) {
    const lr = {};
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

  getMainDiv() {
    return d3.select(this.shadowRoot).select('#scatterplot');
  }

  plotScatter() {
    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const mainDiv = this.getMainDiv();

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
    const x = d3.scaleLinear().domain([minValueX, maxValueX]).range([0, width]);
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    const minValueY = Math.min(
      -3.0,
      Math.min(...this.valuesInCommon.map(d => d.yValue))
    );
    const maxValueY = Math.max(
      3.0,
      Math.max(...this.valuesInCommon.map(d => d.yValue))
    );

    // trendline parameters
    const XaxisData = [];
    const YaxisData = [];
    Object.entries(this.valuesInCommon).forEach(Element => {
      XaxisData.push(Element[1].xValue);
      YaxisData.push(Element[1].yValue);
    });
    let x1 = minValueX;
    const x2 = maxValueX;
    const equation = BiowcScatter.linearRegression(YaxisData, XaxisData);
    let y1 = equation.slope * x1 + equation.intercept;
    const y2 = equation.slope * x2 + equation.intercept;

    if (y1 < minValueY) {
      // if overflow it updates the two vlaues
      y1 = minValueY;
      x1 = (y1 - equation.intercept) / equation.slope;
    }

    const y = d3
      .scaleLinear()
      .domain([minValueY, maxValueY])
      .range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    const tooltip = mainDiv
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // tooltip mouseover event handler
    const tipMouseover = (e, d) => {
      const htmlElement = d.id;
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

    // Add dots
    svg
      .append('g')
      .selectAll('dot')
      .data(this.valuesInCommon)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.xValue))
      .attr('cy', d => y(d.yValue))
      .attr('r', 4)
      .style('fill', '#69b3a2')
      .on('mousemove', tipMouseover)
      .on('mouseout', tipMouseout);

    // adding trendline to the plot
    svg
      .append('line')
      .attr('x1', x(x1))
      .attr('x2', x(x2))
      .attr('y1', y(y1))
      .attr('y2', y(y2))
      .attr('stroke', 'black');

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
  }
}
