import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import * as d3v6 from 'd3';
import { ScaleContinuousNumeric, ValueFn } from 'd3';
import { HTMLTemplateResult } from 'lit/development';
import styles from './biowc-lineplot.css';

type CurveParameterList = {
  [key: string]: number;
};

// The input is a list of InputDataset objects, and one MetaDataAttributes object
interface InputDataset {
  id: string;
  formula: string;
  escapeCharacter: string;
  curveParameters: CurveParameterList;
  curveHighlights?: number[];
  curveHighlightErrorBarEndpoints?: [[number, number]];
  dataPoints: [[number, number]];
  color: string;
  curveFunction?: Function;
  curvePoints?: number[][];
  legendText?: string;
  tooltipTextHTML?: string;
}

interface MetaDataAttributes {
  width?: number;
  height?: number;
  xScale?: 'linear' | 'logarithmic';
  yScale?: 'linear' | 'logarithmic';
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
  legendFontSize?: number;
}

export class BiowcLineplot extends LitElement {
  set metaDataAttr(value: MetaDataAttributes) {
    // Initialize everything in metaData with default values
    this._metaDataAttr = {
      width: 400,
      height: 400,
      xScale: 'linear',
      yScale: 'linear',
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

  svgXAxis!: ScaleContinuousNumeric<any, any>;

  svgYAxis!: ScaleContinuousNumeric<any, any>;

  minX!: number;

  maxX!: number;

  minY!: number;

  maxY!: number;

  // The D3 axes will exceed the width & height a bit, so we define a hard-coded margin
  // https://gist.github.com/mbostock/3019563
  margin = { top: 20, right: 20, bottom: 30, left: 30, xAxis: 30, yAxis: 45 };

  // margin = { top: 0, right: 0, bottom: 0, left: 0 };

  private tooltip:
    | d3v6.Selection<HTMLDivElement, unknown, HTMLElement, any>
    | undefined;

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
      <div
        id="legendContainer"
        style="${this._metaDataAttr.legendPosition === 'bottom'
          ? 'margin-left: 20px'
          : ''}"
      ></div>
    </div>`;
  }

  public getSVG() {
    return this._getMainDiv().selectAll('svg').node();
  }

  // This is for the ExportButton component. Keeping it for legacy reasons
  public exportSvg() {
    return this.shadowRoot?.querySelector('svg')?.outerHTML;
  }

  private _initLineplot() {
    for (let i = 0; i < this.inputData.length; i += 1) {
      if (this.inputData[i].formula && this.inputData[i].curveParameters) {
        this.inputData[i].curveFunction = BiowcLineplot.createCurveFunction(
          this.inputData[i].formula,
          this.inputData[i].escapeCharacter,
          this.inputData[i].curveParameters
        );
        this.inputData[i].curvePoints = this.calculateCurvePoints(
          <Function>this.inputData[i].curveFunction,
          this.inputData[i].dataPoints
        );
      }
      // Add default color if it was not supplied
      if (!this.inputData[i].color) {
        this.inputData[i].color = d3v6.schemeCategory10[i];
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
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this._initLineplot();
    super.firstUpdated(_changedProperties);
  }

  protected updated() {
    this._initLineplot();
  }

  private _initializeTooltip() {
    // remove tooltip if it exists from a previous render
    this.tooltip?.remove();

    const mainDiv = this._getMainDiv();
    this.tooltip = mainDiv
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
  }

  private _showTooltip(e: MouseEvent, tooltipText: String) {
    this.tooltip!.html(`<p>${tooltipText}</p>`)
      .style('left', `${e.offsetX + 45}px`)
      .style('top', `${e.offsetY + 35}px`)
      .transition()
      .duration(200) // ms
      .style('opacity', 0.9); // started as 0!
  }

  private _hideTooltip() {
    this.tooltip!.transition()
      .duration(200) // ms
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

    // Remove previous axes, if they exist
    mainDiv.select('svg').remove();

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

    // If the user did not provide limits for the y axis, the min/max of the function values are used
    // Limits for the x axis are guaranteed at this point
    const allCurveYValues = this.inputData
      .filter(dataset => dataset.curvePoints)
      .map(dataset => (<number[][]>dataset.curvePoints).map(point => point[1]))
      .flat();

    const minY =
      !this._metaDataAttr.curveMinY && allCurveYValues.length > 0
        ? Math.min(...allCurveYValues)
        : this._metaDataAttr.curveMinY;

    const maxY =
      !this._metaDataAttr.curveMaxY && allCurveYValues.length > 0
        ? Math.max(...allCurveYValues)
        : this._metaDataAttr.curveMaxY;

    const allYValues = [
      ...this.inputData
        .filter(dataset => dataset.dataPoints)
        .map(dataset => dataset.dataPoints.map(point => point[1]))
        .flat(),
    ];

    allYValues.push(...[minY!, maxY!]);

    // Add x and y axis
    this.minX = Math.min(...allXValues);
    this.maxX = Math.max(...allXValues);
    this.minY = Math.min(...allYValues);
    this.maxY = Math.max(...allYValues);

    const xScale =
      this._metaDataAttr.xScale === 'linear'
        ? d3v6.scaleLinear()
        : d3v6.scaleLog();

    this.svgXAxis = xScale
      .domain([this.minX, this.maxX])
      .range([0, widthRelativeToMargin]);

    svgGroup
      .append('g')
      .attr('transform', `translate(0,${heightRelativeToMargin})`)
      .call(d3v6.axisBottom(this.svgXAxis));

    const yScale =
      this._metaDataAttr.yScale === 'linear'
        ? d3v6.scaleLinear()
        : d3v6.scaleLog();

    this.svgYAxis = yScale
      .domain([this.minY, this.maxY])
      .range([heightRelativeToMargin, 0]);

    svgGroup.append('g').call(d3v6.axisLeft(this.svgYAxis));

    // Add x axis label

    svgGroup
      .append('text')
      .attr(
        'transform',
        `translate(
      ${widthRelativeToMargin / 2},
      ${this._metaDataAttr.height! - this.margin.xAxis})`
      )
      .style('text-anchor', 'middle')
      .text(`${this._metaDataAttr.xAxisLabel}`);

    // Add y axis label
    svgGroup
      .append('text')
      .attr(
        'transform',
        `translate(
      ${-this.margin.yAxis},
      ${heightRelativeToMargin / 2}) rotate(-90)`
      )
      .style('text-anchor', 'middle')
      .text(`${this._metaDataAttr.yAxisLabel}`);
  }

  private _plotDots() {
    const mainDiv = this._getMainDiv();

    const svgGroup = mainDiv.select('#svgGroupElement');

    // Add dots
    const dotlistGroup = svgGroup.append('g').attr('id', 'dotlistGroup');

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
          .style('fill', this.inputData[i].color)
          .attr('opacity', this._metaDataAttr.dotOpacity || 1)
          .on('mousemove', (e, d) =>
            this._showTooltip(
              e,
              `${
                this.inputData[i].tooltipTextHTML || ''
              }<i>x=${d[0].toPrecision(4)}, y=${d[1].toPrecision(4)}</i>`
            )
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
            .style('stroke', this.inputData[i].color)
            .style('fill', 'none')
            .attr('opacity', this._metaDataAttr.dotOpacity || 1)
            .on('mousemove', e =>
              this._showTooltip(e, this.inputData[i].tooltipTextHTML || '')
            )
            .on('mouseout', () => this._hideTooltip());
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
          this.inputData[i].color
        );
        // Add thicker invisible curve - for better mouseover functionality
        const invisibleCurve = plotCurve(
          <number[][]>this.inputData[i].curvePoints,
          10,
          this.inputData[i].color
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

            this._showTooltip(
              e,
              `${
                this.inputData[i].tooltipTextHTML || ''
              }<i>x=${xValue.toPrecision(4)}, y=${yValue.toPrecision(4)}</i>`
            );
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

      // If supplied, add curve highlight points
      if (this.inputData[i].curveHighlights) {
        curveGroup
          .append('g')
          .selectAll('curveHighlightDot')
          .data(this.inputData[i].curveHighlights!)
          .join('circle')
          .attr('class', 'curveHighlightDot')
          .attr('cx', x => this.svgXAxis(x))
          .attr('cy', x =>
            this.svgYAxis((<Function>this.inputData[i].curveFunction)(x))
          )
          .attr('r', this._metaDataAttr.dotSize! + 2)
          .style('fill', 'white')
          .style('stroke-width', 3)
          .style('stroke', this.inputData[i].color)
          .on('mousemove', (e, x) => {
            this._showTooltip(
              e,
              `${this.inputData[i].tooltipTextHTML || ''}<i>x=${x.toPrecision(
                4
              )}, y=${(<Function>this.inputData[i].curveFunction)(
                x
              ).toPrecision(4)}</i>`
            );
          })
          .on('mouseout', () => {
            this._hideTooltip();
          });
        // If additionally supplied, add error bars
        // Only if list of highlights has same length as list of error bars
        if (
          this.inputData[i].curveHighlightErrorBarEndpoints &&
          this.inputData[i].curveHighlightErrorBarEndpoints!.length ===
            this.inputData[i].curveHighlights!.length
        ) {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          curveGroup
            .selectAll('curveHighlightDotErrorBar')
            // As data, we need both the curve Highlights and the error bars
            .data(
              this.inputData[i].curveHighlightErrorBarEndpoints!.map(
                (value, index) =>
                  <[number, [number, number]]>[
                    this.inputData[i].curveHighlights![index],
                    value,
                  ]
              )
            )
            .join('line')
            .attr('class', 'curveHighlightDotErrorBar')
            .attr('x1', ([highlightXValue, [errorBarLeftEndpoint, _]]) =>
              this.svgXAxis(errorBarLeftEndpoint)
            )
            .attr('x2', ([highlightXValue, [_, errorBarRightEndpoint]]) =>
              this.svgXAxis(errorBarRightEndpoint)
            )
            .attr('y1', ([highlightXValue, _]) =>
              this.svgYAxis(
                (<Function>this.inputData[i].curveFunction)(highlightXValue)
              )
            )
            .attr('y2', ([highlightXValue, _]) =>
              this.svgYAxis(
                (<Function>this.inputData[i].curveFunction)(highlightXValue)
              )
            )
            .style('stroke-width', 2)
            .style('stroke', this.inputData[i].color);
          // Add perpendicular lines at both ends - this feels repetitive, but also seems like the D3 way to do it
          const curveHighlightDotErrorBarEndHeight = 7;
          curveGroup
            .selectAll('curveHighlightDotErrorBarLeftEnd')
            // As data, we need both the curve Highlights and the error bars
            .data(
              this.inputData[i].curveHighlightErrorBarEndpoints!.map(
                (value, index) =>
                  <[number, [number, number]]>[
                    this.inputData[i].curveHighlights![index],
                    value,
                  ]
              )
            )
            .join('line')
            .attr('class', 'curveHighlightDotErrorBar')
            .attr('x1', ([highlightXValue, [errorBarLeftEndpoint, _]]) =>
              this.svgXAxis(errorBarLeftEndpoint)
            )
            .attr('x2', ([highlightXValue, [errorBarLeftEndpoint, _]]) =>
              this.svgXAxis(errorBarLeftEndpoint)
            )
            .attr(
              'y1',
              ([highlightXValue, _]) =>
                this.svgYAxis(
                  (<Function>this.inputData[i].curveFunction)(highlightXValue)
                ) - curveHighlightDotErrorBarEndHeight
            )
            .attr(
              'y2',
              ([highlightXValue, _]) =>
                this.svgYAxis(
                  (<Function>this.inputData[i].curveFunction)(highlightXValue)
                ) + curveHighlightDotErrorBarEndHeight
            )
            .style('stroke-width', 2)
            .style('stroke', this.inputData[i].color);

          curveGroup
            .selectAll('curveHighlightDotErrorBarRightEnd')
            // As data, we need both the curve Highlights and the error bars
            .data(
              this.inputData[i].curveHighlightErrorBarEndpoints!.map(
                (value, index) =>
                  <[number, [number, number]]>[
                    this.inputData[i].curveHighlights![index],
                    value,
                  ]
              )
            )
            .join('line')
            .attr('class', 'curveHighlightDotErrorBar')
            .attr('x1', ([highlightXValue, [_, errorBarRightEndpoint]]) =>
              this.svgXAxis(errorBarRightEndpoint)
            )
            .attr('x2', ([highlightXValue, [_, errorBarRightEndpoint]]) =>
              this.svgXAxis(errorBarRightEndpoint)
            )
            .attr(
              'y1',
              ([highlightXValue, _]) =>
                this.svgYAxis(
                  (<Function>this.inputData[i].curveFunction)(highlightXValue)
                ) - curveHighlightDotErrorBarEndHeight
            )
            .attr(
              'y2',
              ([highlightXValue, _]) =>
                this.svgYAxis(
                  (<Function>this.inputData[i].curveFunction)(highlightXValue)
                ) + curveHighlightDotErrorBarEndHeight
            )
            .style('stroke-width', 2)
            .style('stroke', this.inputData[i].color);
          /* eslint-enable @typescript-eslint/no-unused-vars */
        }
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

    const legendSvg = legendContainer.append('svg');

    if (this._metaDataAttr.legendPosition === 'bottom') {
      legendSvg.attr('width', this._metaDataAttr.width!);
    } else {
      legendSvg.attr('height', this._metaDataAttr.height!);
    }

    const legend = legendSvg
      .selectAll('.legend-item')
      .data(this.inputData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(10, ${i * 25})`);

    legend
      .append('circle')
      .attr('cx', this._metaDataAttr.dotSize!)
      .attr('cy', 10 + this._metaDataAttr.dotSize!)
      .attr('r', this._metaDataAttr.dotSize!)
      .attr('fill', d => d.color)
      .attr('opacity', this._metaDataAttr.dotOpacity || 1);

    legend
      .append('text')
      .attr('x', 20 + this._metaDataAttr.dotSize!)
      .attr('y', 10 + this._metaDataAttr.dotSize!)
      .attr('font-size', this._metaDataAttr.legendFontSize || 'medium')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'central')
      .text(d => d.legendText || '');
  }

  static createCurveFunction(
    formula: string,
    escapeCharacter: string,
    curveParameterList: CurveParameterList
  ) {
    let replacedFormula = formula;
    Object.keys(curveParameterList).forEach(key => {
      const escapedKey = `${escapeCharacter}${key}${escapeCharacter}`;
      // returns -1 if no seach result in string
      while (replacedFormula.indexOf(escapedKey) !== -1) {
        replacedFormula = replacedFormula.replace(
          escapedKey,
          curveParameterList[key].toString()
        );
      }
    });
    // TODO Fix entry point of Function call
    // eslint-disable-next-line no-new-func
    return Function('x', replacedFormula);
  }

  calculateCurvePoints(curveFunction: Function, dataPoints: number[][]) {
    if (!this._metaDataAttr.curveMinX && dataPoints.length > 0) {
      this._metaDataAttr.curveMinX = Math.min(
        ...dataPoints.map(coordinates => coordinates[0])
      );
    }

    if (!this._metaDataAttr.curveMaxX && dataPoints.length > 0) {
      this._metaDataAttr.curveMaxX = Math.max(
        ...dataPoints.map(coordinates => coordinates[0])
      );
    }

    const nIntervals = 1000;
    const curvePoints: number[][] = [];
    let x = this._metaDataAttr.curveMinX!;

    if (this._metaDataAttr.xScale === 'linear') {
      const curveStep =
        (this._metaDataAttr.curveMaxX! - this._metaDataAttr.curveMinX!) /
        nIntervals;
      for (let i = 1; i < nIntervals; i += 1) {
        curvePoints.push([x, curveFunction(x)]);
        x += curveStep;
      }
    } else {
      const curveStep = Math.exp(
        (Math.log(this._metaDataAttr.curveMaxX!) -
          Math.log(this._metaDataAttr.curveMinX!)) /
          nIntervals
      );
      for (let i = 1; i < nIntervals; i += 1) {
        curvePoints.push([x, curveFunction(x)]);
        x *= curveStep;
      }
    }

    return curvePoints;
  }
}
