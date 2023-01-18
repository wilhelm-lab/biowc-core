import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { HTMLTemplateResult, PropertyValues } from 'lit/development';
// import * as d3v6 from 'd3';
import * as d3 from 'd3';
import styles from './biowc-swarmplot.css';

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

  // @property({ attribute: false })
  // xValues: xValueType = [];

  @property({ attribute: false })
  xLabel: string = '';

  @property({ attribute: false })
  valueKey: string = 'value';

  @property({ attribute: false })
  idKey: string = 'id';

  @property({ attribute: false })
  swarmData: swarmDataType[] = [];

  // @property({attribute: false})
  // swarmSelIds: string[]

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

  // @property({attribute: false})
  // scatterPoints: number[];
  //
  // @property({attribute: false})
  // legendArray: string[];

  render(): HTMLTemplateResult {
    return html`
      <div id="swarmplot"></div>
    </p>`;
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
      const center: number = width - margin.left;

      svg
        .append('line')
        // .attr('x1', center) // - 3 * margin.left)
        // .attr('x2', center)
        .attr('x1', center - 3 * margin.left)
        .attr('x2', center - 3 * margin.left)
        .attr('y1', yScale(min))
        .attr('y2', yScale(max))
        .attr('stroke', 'black');

      svg
        .append('rect')
        .attr('x', center - (4 * margin.left + margin.right))
        .attr('y', yScale(q3))
        .attr('height', recHeigth)
        .attr('width', 2 * (margin.left + margin.right))
        .attr('stroke', 'black')
        .attr('opacity', 0.5)
        .style('fill', 'grey');
      svg
        .selectAll('toto')
        .data([min, median, max])
        .enter()
        .append('line')
        .attr('x1', center - (4 * margin.left + margin.right))
        .attr('x2', center - (2 * margin.left - margin.right))
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
      .force('x', d3.forceX(height / 2 - margin.bottom / 2))
      .force('collide', d3.forceCollide(4))
      // .force('center', d3.forceCenter(width / 2, height / 2))
      .stop();
    // console.log('test')
    const fakeFn = function fakeFn() {
      return simulation.tick(10);
    };

    dataSet.forEach(fakeFn);

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
    // const scatterData: number[] = []
    //
    // const elementList = this.shadowRoot!.querySelectorAll('.names') as NodeList
    //
    // // @ts-ignore
    // elementList.forEach( (element: SVGElement) => {
    //   console.log(element)   // getAttribute('fill')
    // })
    // // type PointType = {'colorID': string; 'x': number; 'y': number;}
    // // @ts-ignore
    // elementList.forEach((element: SVGElement) => {
    //   // const point: PointType = {}
    //   console.log(element.getAttributeNames())
    //   console.log(element.getAttribute('fill'))
    //   // console.log(element.getAttribute('fill'))
    //   console.log(element.getAttribute('cx'))
    //   console.log(element.getAttribute('cy'))
    // point[fieldOfTable] = element.__data__[fieldOfTable]
    // point[nominalField] = element.__data__[nominalField]
    // point.colorID = element.getAttribute('fill')
    //   point.sizeR = element.__data__.sizeR
    //   point.x = element.getAttribute('cx')
    // point.y = element.getAttribute('cy')
    // scatterData.push(point)
    // })
    // this.scatterPoints = scatterData
  }

  // manualLegendAdd (svg: any) {
  //   if (this.patientGroup.length > 0 & this.colorCode.length > 0) {
  //     const legend = {}
  //     legend.color = this.colorCode
  //     legend.group = this.patientGroup
  //     legend.Y = this.LegendY
  //     this.legendArray.push(legend)
  //     this.LegendY += 20
  //     this.legendArray.forEach(element => {
  //       svg.append('circle').attr('cx', 90).attr('cy', element.Y).attr('r', 6).style('fill', element.color)
  //       svg.append('text').attr('x', 100).attr('y', element.Y).text(element.group).style('font-size', '15px').attr('alignment-baseline', 'middle')
  //     })
  //   }
  // }

  mouseHover(
    fieldName: string,
    fieldOfTable: string,
    tooltip: any,
    xLine: any
  ) {
    const nominalField: string = fieldName;
    const svg = this._getMainDiv();
    console.log(xLine);
    svg
      .selectAll('.names')
      .on('mousemove', (event: any, circle: any) => {
        console.log('hoverMouse');
        console.log(circle);
        console.log(event);
        tooltip
          .html(
            `<strong>${circle[nominalField as keyof swarmDataType]}</strong>
      <br> ${circle[fieldOfTable as keyof swarmDataType]}`
          )
          .style('top', `${event.pageY - 50}px`)
          .style('left', `${event.pageX}px`)
          .style('opacity', 0.9);
        // xLine.attr('x1', event.target.attr('cx'))
        //   .attr('y1', event.target.attr('cy'))
        //   .attr('y2', event.target.attr('cy'))
        //   .attr('x2', 0)
        //   .attr('opacity', 1)
      })
      .on('mouseout', () => {
        // console.log(_.target.__data__[fieldOfTable])
        tooltip.style('opacity', 0);
        // xLine.attr('opacity', 0)
      });
  }

  prepFunc(svg: any, margin: marginType, yScale: any) {
    svg.append('g').attr('class', 'y axis');

    svg.append('g').attr('class', 'lines');
    svg.append('g').attr('class', 'selcirc');

    const titlePlot: string = `${this.swarmTitlePrefix} (${this.swarmTitle})`;
    svg
      .append('text')
      .attr('class', 'y label')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('x', -180)
      .attr('y', 15)
      .text(titlePlot);

    const xLine: any = svg
      .append('line')
      .attr('stroke', 'rgb(96,125,139)')
      .attr('stroke-dasharray', '1,2');

    const tooltip: any = this._getMainDiv()
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 1);

    const yAxis = d3.axisRight(yScale).ticks(10, '.1f').tickSizeOuter(0);

    // d3.transition(svg)
    svg
      .select('.y.axis')
      .attr('transform', `translate(${margin.left},01)`)
      // @ts-ignore
      .call(yAxis);
    // .attr('x', -10)

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
    // this.manualLegendAdd(svg) // adding element of the legends
    // console.log(dataSet);
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

  // reDrawPlot () {
  //   const resetPlot = false
  //   this.rePlot(resetPlot)
  // }

  // resetPlot () {
  //   const resetPlot = true
  //   this.rePlot(resetPlot)
  // }

  // private _rePlot (resetPlot) {
  //   const fieldOfTable = this.fieldValues // Data field for the y position values
  //   const nominalField = this.fieldName // Identifier of the data on the table
  //   const dataSet = this.scatterPoints
  //
  //   const selectedCells: CellSelectedEvent = new CustomEvent(
  //     'selectedCells',
  //     {
  //       detail: {
  //         colorCode: this.colorCode,
  //         selectedPatiens: this.swarmSelIds
  //       },
  //     }
  //   );
  //   this.dispatchEvent(selectedCells)
  //
  //
  //   if (this.swarmSelIds.length > 0) {
  //     this.swarmSelIds.forEach(element => {
  //       dataSet[element].colorID = this.colorCode
  //       dataSet[element].sizeR = 4
  //     })
  //   }
  //
  //   if (resetPlot) {
  //     this.disposeLabels()
  //     for (let i = 0; i < dataSet.length; i++) {
  //       dataSet[i].colorID = 'grey'
  //       dataSet[i].sizeR = 3
  //     }
  //   }
  //
  //   this.scatterPoints = dataSet // using scatter points instead of simulation
  //   const pltobj = this.initaxes(this.width, this.height, this.margin, dataSet, fieldOfTable)
  //   const svg = pltobj.svg
  //   const yScale = pltobj.yScale
  //   this.boxPlot(dataSet, fieldOfTable, this.width, yScale, this.margin, svg) // draw boxplot
  //   const plotObject = this.prepFunc(svg, this.margin, yScale)
  //   const tooltip = plotObject.tooltip
  //   const xLine = plotObject.xLine
  //
  //   // scatter plot
  //   const scatterPoints = this.scatterPoints
  //   svg.append('g')
  //     .selectAll('dot')
  //     .data(scatterPoints)
  //     .enter()
  //     .append('circle')
  //     .attr('class', 'names')
  //     .attr('cx', function (d) {
  //       return d.x
  //     })
  //     .attr('cy', function (d) {
  //       return d.y
  //     })
  //     .attr('r', function (d) {
  //       return d.sizeR
  //     })
  //     .style('fill', function (d) {
  //       return d.colorID
  //     })
  //
  //   this.mouseHover(nominalField, fieldOfTable, tooltip, xLine) // at mouse  hover
  //   this.patientGroup = ''
  // }

  private _plotSwarm() {
    // set the dimensions and margins of the graph
    const margin: marginType = { top: 50, right: 10, bottom: 100, left: 50 };
    const width: number = 400;
    const height: number = 500;

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
    console.log(tooltip);
    console.log(xLine);
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
