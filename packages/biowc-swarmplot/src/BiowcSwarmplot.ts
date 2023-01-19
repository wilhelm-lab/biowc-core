import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { HTMLTemplateResult, PropertyValues } from 'lit/development';
import * as d3 from 'd3';
import styles from './biowc-swarmplot.css';
import '../../../download-button/dist/src/download-button.js';

type marginType = { top: number; right: number; bottom: number; left: number };
type swarmDataType = {
  'Z-score': number;
  'Sample name': string;
  colorID: string;
  sizeR: number;
};

export class BiowcSwarmplot extends LitElement {
  static styles = styles;

  @property({ type: String }) mytitle = 'Hey there';

  @property({ attribute: false })
  xLabel: string = '';

  @property({ attribute: false })
  valueKey: string = 'value';

  @property({ attribute: false })
  idKey: string = 'id';

  @property({ attribute: false })
  swarmData: swarmDataType[] = [];

  @property({ attribute: false })
  swarmId: string = 'SwarmPlot';

  @property({ attribute: false })
  swarmTitle: string = 'EGFR';

  @property({ attribute: false })
  swarmTitlePrefix: string = 'Intensity';

  @property({ attribute: false })
  drawBoxPlot: boolean = true;

  @property({ attribute: false })
  fieldName: string = 'Sample name';

  @property({ attribute: false })
  fieldValues: string = 'Z-score';

  @property({ attribute: false })
  colorCode: string = '';

  @property({ attribute: false })
  patientGroup: string = '';

  @property({ attribute: false })
  LegendY: number = 40;

  @property({ attribute: false })
  width: number = 400;

  @property({ attribute: false })
  height: number = 500;

  render(): HTMLTemplateResult {
    return html` <div style="display: flex">
      <div id="swarmplot"></div>
      <download-button
        .svgComponent="${this}"
        style="margin-left: 20px;"
      ></download-button>
    </div>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this._plotSwarm();
    super.firstUpdated(_changedProperties);
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3.select(this.shadowRoot).select('#swarmplot');
  }

  public exportSvg() {
    return this.shadowRoot?.querySelector('svg')?.outerHTML;
  }

  boxPlot(
    dataSet: swarmDataType[],
    fieldOfTable: string,
    width: number,
    yScale: any,
    margin: marginType,
    svg: any
  ) {
    // Box plot display on the background
    if (this.drawBoxPlot) {
      const dataBoxplot = dataSet.map(
        entry => entry[fieldOfTable as keyof swarmDataType] as number
      );

      const dataSorted: number[] = dataBoxplot.sort(d3.ascending);
      const q1: any = d3.quantile(dataSorted, 0.25); // might be a function
      const median: any = d3.quantile(dataSorted, 0.5);
      // Using IQR for the outliars
      const q3: any = d3.quantile(dataSorted, 0.75);
      const interQuantileRange: any = q3 - q1;
      const min: number | undefined = q1 - 1.5 * interQuantileRange;
      const max: number | undefined = q1 + 1.5 * interQuantileRange;
      const recHeigth: number = yScale(q1) - yScale(q3);

      const widthRelativeToMargin: number = width - margin.left - margin.right;

      const center: number = widthRelativeToMargin / 2 + margin.left + 50;

      svg
        .append('line')
        // .attr('x1', center) // - 3 * margin.left)
        // .attr('x2', center)
        .attr('x1', center)
        .attr('x2', center)
        .attr('y1', yScale(min))
        .attr('y2', yScale(max))
        .attr('stroke', 'black');

      const halfLineWidth: number = widthRelativeToMargin / 3;
      svg
        .append('rect')
        .attr('x', center - halfLineWidth)
        .attr('y', yScale(q3))
        .attr('height', recHeigth)
        .attr('width', halfLineWidth * 2)
        .attr('stroke', 'black')
        .attr('opacity', 0.5)
        .style('fill', 'grey');
      svg
        .selectAll('toto')
        .data([min, median, max])
        .enter()
        .append('line')
        .attr('x1', center - halfLineWidth)
        .attr('x2', center + halfLineWidth)
        .attr('y1', (d: any) => yScale(d))
        .attr('y2', (d: any) => yScale(d))
        .attr('stroke', 'black');
    }
  }

  static simulationSwarm(
    dataSet: swarmDataType[],
    width: number,
    height: number,
    margin: marginType,
    svg: any,
    fieldOfTable: string,
    yScale: any,
    fieldName: string
  ) {
    const nominalField: string = fieldName;

    const widthRelativeToMargin = width - margin.left - margin.right;
    const centerX = widthRelativeToMargin / 2 + margin.left + 50;

    const simulation = d3
      // @ts-ignore
      .forceSimulation(dataSet)
      .force(
        'y',
        d3
          .forceY(d =>
            // @ts-ignore
            yScale(d[fieldOfTable as keyof swarmDataType] as number)
          )
          .strength(1)
      ) // Increase velocity
      .force('x', d3.forceX(centerX))
      .force('collide', d3.forceCollide(4))
      .stop();

    const applySimulation = function fakeFn() {
      return simulation.tick(10);
    };

    dataSet.forEach(applySimulation);

    const namesCircles = svg
      .selectAll('.names')
      .data(dataSet, (d: any) => d[nominalField]);
    namesCircles
      .enter()
      .append('circle')
      .attr('class', 'names')
      .attr('r', (d: any) => d.sizeR)
      .attr('fill', (d: any) => d.colorID)
      .merge(namesCircles)
      .transition()
      .duration(1)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y);
  }

  mouseHover(
    fieldName: string,
    fieldOfTable: string,
    tooltip: any,
    xLine: any
  ) {
    const nominalField: string = fieldName;
    const svg = this._getMainDiv();
    svg
      .selectAll('.names')
      .on('mousemove', (event: any, circle: any) => {
        tooltip
          .html(
            `<strong>${circle[nominalField as keyof swarmDataType]}</strong>
      <br> ${circle[fieldOfTable as keyof swarmDataType]}`
          )
          .style('top', `${event.pageY - 50}px`)
          .style('left', `${event.pageX}px`)
          .style('opacity', 0.9);
        xLine
          .attr('x1', circle.x)
          .attr('y1', circle.y)
          .attr('y2', circle.y)
          .attr('x2', 0)
          .attr('opacity', 1);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
        xLine.attr('opacity', 0);
      });
  }

  prepFunc(svg: any, margin: marginType, yScale: any) {
    svg.append('g').attr('class', 'y axis');

    svg.append('g').attr('class', 'lines');
    svg.append('g').attr('class', 'selcirc');

    const heightRelativeToMargin: number =
      this.height - margin.top - margin.bottom;

    const titlePlot: string = `${this.swarmTitlePrefix} (${this.swarmTitle})`;
    svg
      .append('text')
      .attr('class', 'y label')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('x', -margin.top - heightRelativeToMargin / 2)
      .attr('y', margin.left - 10)
      .text(titlePlot);

    const xLine: any = svg
      .append('line')
      .attr('stroke', 'rgb(96,125,139)')
      .attr('stroke-dasharray', '1,2');

    const tooltip: any = this._getMainDiv()
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const yAxis = d3.axisRight(yScale).ticks(10, '.1f').tickSizeOuter(0);

    // d3.transition(svg)
    svg
      .select('.y.axis')
      .attr('transform', `translate(${margin.left},01)`)
      // @ts-ignore
      .call(yAxis);

    return { tooltip, xLine };
  }

  initaxes(
    width: number,
    height: number,
    margin: marginType,
    dataSet: swarmDataType[],
    fieldOfTable: string
  ) {
    this._getMainDiv().selectAll('svg').remove();
    // TODO: Does the entire SVG need to be remove or could we remove its toplevel child?
    const svg = this._getMainDiv()
      .append('svg')
      .attr('class', 'd3')
      .attr('width', width)
      .attr('height', height);

    const yScale = d3
      .scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain(
        d3.extent(
          dataSet,
          d => d[fieldOfTable as keyof swarmDataType] as number
        ) as [number, number]
      );
    return { yScale, svg };
  }

  private _plotSwarm() {
    // set the dimensions and margins of the graph
    const { width } = this;
    const { height } = this;

    // The D3 axes will exceed the width & height a bit, so we define a hard-coded margin
    // https://gist.github.com/mbostock/3019563
    const margin: marginType = { top: 50, right: 30, bottom: 50, left: 30 };

    const pltobj: any = this.initaxes(
      width,
      height,
      margin,
      this.swarmData,
      this.fieldValues
    );
    this.boxPlot(
      this.swarmData,
      this.fieldValues,
      width,
      pltobj.yScale,
      margin,
      pltobj.svg
    );

    const plotObject = this.prepFunc(pltobj.svg, margin, pltobj.yScale); // {tooltip, xline}
    const { tooltip } = plotObject;
    const { xLine } = plotObject;
    BiowcSwarmplot.simulationSwarm(
      this.swarmData,
      width,
      height,
      margin,
      pltobj.svg,
      this.fieldValues,
      pltobj.yScale,
      this.fieldName
    ); // 1st simulation of the data on the plot
    this.mouseHover(this.fieldName, this.fieldValues, tooltip, xLine); // at mouse hover
  }
}
