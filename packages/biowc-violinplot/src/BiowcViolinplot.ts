import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { HTMLTemplateResult, PropertyValues } from 'lit/development';
import * as d3 from 'd3';
import { ScaleLinear } from 'd3';
import styles from './biowc-violinplot.css';

type ExpressionData = {
  PROTEIN_ID: number;
  GENE_NAME: string;
  VALUE: number;
  STD_ERROR: number;
  COD: number;
  BIC: number;
};

type DataEntry = {
  DRUG_ID: number;
  TREATMENT: string;
  catds: number;
  data: ExpressionData[];
};

type ViolinPropertiesType = {
  svg: any;
  results: ExpressionData[];
  width: number;
  localDomain: number[];
  xScale: ScaleLinear<number, number, never>;
  imposeMax: number;
  violinColor: string;
  resolution: number;
  path: string;
  index: number;
};

export class BiowcViolinplot extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  height: number = 300;

  @property({ attribute: false })
  violinWidth: number = 200;

  @property({ attribute: false })
  chartData: DataEntry[] = [
    {
      DRUG_ID: NaN,
      TREATMENT: '',
      catds: NaN,
      data: [
        {
          PROTEIN_ID: NaN,
          GENE_NAME: '',
          VALUE: NaN,
          STD_ERROR: NaN,
          COD: NaN,
          BIC: NaN,
        },
      ],
    },
  ];

  @property({ attribute: false })
  propertyPath: string = 'PROTEIN_ID';

  @property({ attribute: false })
  dataPath: string = 'data';

  @property({ attribute: false })
  valuePath: string = 'VALUE';

  @property({ attribute: false })
  fontFamily: string = 'Arial,Helvetica,sans-serif';

  @property({ attribute: false })
  fontSize: string = '12px';

  @property({ attribute: false })
  resolution: number = 20;

  @property({ attribute: false })
  selectedElement: string = '';

  @property({ attribute: false })
  plotLabelValueDrug: string = 'TREATMENT';

  @property({ attribute: false })
  plotLabelValueCatds: string = '';

  @property({ attribute: false })
  plotLabelExtraFields: string[] = [];

  @property({ attribute: false })
  simpleLabel: boolean = false;

  @property({ attribute: false })
  keyValue: string = 'DRUG_ID';

  @property({ attribute: false })
  clippedSelectionLine: boolean = false;

  @property({ attribute: false })
  myTitle: string = '';

  @property({ attribute: false })
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } = { top: 10, bottom: 0, left: 80, right: 30 };

  @property({ attribute: false })
  oChartObjects: {
    svg: any;
    oSelections: any;
    oSortedData: ExpressionData[][];
    d3YScale: any;
  } = {
    svg: {},
    oSelections: {},
    oSortedData: [],
    d3YScale: d3.scaleLinear,
  };

  render(): HTMLTemplateResult {
    return html`
      <div class="analytics-selectivity violin-plot-container">
        <div class="sapProteomicsdbViolinPlot">
          <!-- <div class="violinbuttonarea">
        <template v-for="(plot, index) in chartData">
          <label
            v-if="!simpleLabel &amp;&amp; _dataObjectHasChilds()"
            :key="plot[keyValue]"
            class="violin-label"
            :style="labelOffsetStyles[index]"
          >{{ plot[plotLabelValueDrug] }}<br>{{ plot[plotLabelValueCatds] }}</label>
        </template>
      </div> -->
        </div>
      </div>
    `;
  }

  // test message on select
  private _selectViolin(key: DataEntry) {
    const selectEvent = new CustomEvent('select-violin', {
      detail: {
        key,
      },
    });

    this.dispatchEvent(selectEvent);
  }

  private _getMainDiv() {
    // TODO: Fix without ignore
    // @ts-ignore
    return d3.select(this.shadowRoot).select('.sapProteomicsdbViolinPlot');
  }

  _dataObjectHasChilds() {
    const data = this.chartData;
    return data.length > 0;
  }

  drawChart() {
    if (this.chartData !== undefined && this._dataObjectHasChilds()) {
      this.drawChartWithData();
    }
  }

  drawChartWithData() {
    const oControl = this;
    // Create SVG element. Remove old ones.
    const svgs = this._getMainDiv().selectAll('svg');
    svgs.remove();

    const plotHeight = this.height;
    const plotWidth = this.violinWidth;
    const plotSpacing = 10;

    const svg = this._getMainDiv().append('svg:svg');
    this.oChartObjects.svg = svg;

    // const resolution = this.resolution
    const path = this.valuePath;

    const y = d3
      .scaleLinear()
      .range([plotHeight - this.margin.bottom, this.margin.top]);

    // this function is local, to access the path reference as fast as possible
    const aPath = path.split('/');

    const compareValues = function compareValues(
      oSet1: ExpressionData,
      oSet2: ExpressionData
    ) {
      return d3.ascending(
        oSet1[aPath[aPath.length - 1] as keyof ExpressionData],
        oSet2[aPath[aPath.length - 1] as keyof ExpressionData]
      );
    };

    // var results = oControl.getChartData();
    const results = this.chartData;

    // copy the dataarray and sort it
    const oSortedData: ExpressionData[][] = [];
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    // var aDataPath = oControl.getDataPath().split('/');
    // const aDataPath = this.dataPath.split('/')
    const oDomains: number[][] = [];
    results.forEach((e, i) => {
      // slice to copy the array
      // replace data with parameter
      oSortedData[i] = e.data.slice().sort(compareValues);
      const localMin = oSortedData[i][0][
        aPath[aPath.length - 1] as keyof ExpressionData
      ] as number;
      const localMax = oSortedData[i][oSortedData[i].length - 1][
        aPath[aPath.length - 1] as keyof ExpressionData
      ] as number;
      min = min ? Math.min(localMin, min) : localMin;
      max = max ? Math.max(localMax, max) : localMax;
      oDomains[i] = [localMin, localMax];
    });
    const domain = [min, max];

    y.domain(domain).nice();

    // draw yAxis
    const yAxis = d3.axisLeft(y).ticks(5).tickSize(5);

    let j = 0;
    // store Objects needed for Selection
    this.oChartObjects.oSelections = {};
    this.oChartObjects.oSortedData = oSortedData;
    this.oChartObjects.d3YScale = y;

    for (const [i, oSortedElement] of Object.entries(
      this.oChartObjects.oSortedData
    )) {
      const g = svg
        .append('g')
        .attr(
          'transform',
          `translate(${j * (plotWidth + plotSpacing) + this.margin.left},0)`
        );
      const oViolinProperties: ViolinPropertiesType = {
        svg: g,
        results: oSortedElement,
        width: plotWidth,
        localDomain: oDomains[parseInt(i, 10)],
        xScale: y,
        imposeMax: 0.25,
        violinColor: '#ccc',
        resolution: this.resolution,
        path,
        index: j,
      };
      this.oChartObjects.oSelections[i] = oControl.addViolin(oViolinProperties);
      BiowcViolinplot.addBoxPlot(
        g,
        oSortedElement,
        plotHeight,
        plotWidth,
        this.margin,
        domain,
        y,
        0.15,
        'black',
        'white',
        path
      );

      this.addLabel(
        g,
        results[parseInt(i, 10)][
          this.plotLabelValueDrug as keyof DataEntry
        ] as string,
        plotHeight,
        plotWidth,
        this.margin,
        10
      );

      this.plotLabelExtraFields.forEach((extraLabel: string, index: number) => {
        this.addLabel(
          g,
          results[parseInt(i, 10)][extraLabel as keyof DataEntry] as string,
          plotHeight + (index + 1) * 15,
          plotWidth,
          this.margin,
          10
        );
      });

      oControl.addSelectionBoundingBox(
        g,
        plotWidth,
        plotHeight,
        parseInt(i, 10)
      );

      g.on('click', () => {
        oControl._selectViolin(results[parseInt(i, 10)]);
      });
      j += 1;
    } // end of for loop

    const width = (plotWidth + plotSpacing) * j;
    svg
      .attr('height', plotHeight)
      .attr('width', width + this.margin.left + this.margin.right);
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${this.margin.left},0)`)
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', (-plotHeight + this.margin.bottom) / 2)
      .attr('y', -35)
      .attr('fill', '#000')
      .style('text-anchor', 'middle')
      .style('font-family', this.fontFamily)
      .style('font-size', this.fontSize)
      .text('pEC50');

    this.plotLabelExtraFields.forEach((extraLabel: string, index: number) => {
      svg
        .append('text')
        .attr('text-anchor', 'end')
        .attr('x', this.margin.left)
        .attr('y', plotHeight + (index + 1) * 15 - this.margin.bottom + 10)
        .text(extraLabel)
        .style('text-anchor', 'end')
        .style('text-align', 'right')
        .style('font-family', this.fontFamily)
        .style('font-size', this.fontSize);
    });

    if (oControl.selectedElement) {
      oControl.selectElement(oControl.selectedElement);
    }
  }

  addSelectionBoundingBox(
    svg: any,
    plotWidth: number,
    plotHeight: number,
    index: number
  ) {
    const rect = svg
      .append('svg')
      .attr('width', plotWidth)
      .attr('height', plotHeight)
      .attr('id', `violin-bbox-${index}`)
      .style('cursor', 'pointer')
      .style('opacity', '0');

    rect
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', plotWidth)
      .attr('height', plotHeight)
      .attr('stroke', 'black')
      .attr('fill', 'rgba(0,0,0,0.03)');

    const that = this;
    rect.on('mouseenter', () => {
      that
        ._getMainDiv()
        .select(`#violin-bbox-${index}`)
        .style('opacity', '1.0');
    });
    rect.on('mouseleave', () => {
      that._getMainDiv().select(`#violin-bbox-${index}`).style('opacity', '0');
    });
  }

  selectElement(prop: string) {
    const oControl = this;
    const aPropertyPath = oControl.propertyPath.split('/');
    const { oChartObjects } = this;

    const { valuePath } = oControl;
    const aValuePath = valuePath.split('/');

    for (const [plotId, plot] of Object.entries(oChartObjects.oSortedData)) {
      // find the Element with the Value of the Property
      let element;
      for (let i = 0; i < plot.length; i += 1) {
        if (
          parseInt(prop, 10) ===
          (plot[i][
            aPropertyPath[aPropertyPath.length - 1] as keyof ExpressionData
          ] as number)
        ) {
          element = plot[i];
          break;
        }
      }
      if (element) {
        oControl.selectElementByValue(
          BiowcViolinplot.convertEC50topEC50(
            element[
              aValuePath[aValuePath.length - 1] as keyof ExpressionData
            ] as number
          ),
          parseInt(plotId, 10)
        );
      } else {
        oControl.removeSelectionMarker(parseInt(plotId, 10));
      }
    }
  }

  selectElementByValue(value: number, plotValue: number) {
    const aData = this.oChartObjects.oSortedData[plotValue];
    const oSelection = this.oChartObjects.oSelections[plotValue];
    const d3Yscale = this.oChartObjects.d3YScale;
    const iElementIndex = this._binarySearch(value, aData);
    if (iElementIndex === undefined) {
      throw new RangeError('No expression data provided');
    }

    oSelection.selectionLine
      .attr('y1', d3Yscale(value))
      .attr('y2', d3Yscale(value))
      .attr('display', 'inline');
    oSelection.selectionLabelTop
      .text(aData.length - iElementIndex - 1)
      .attr('y', d3Yscale(value) - 10)
      .attr('display', 'inline');
    oSelection.selectionLabelBottom
      .text(iElementIndex)
      .attr('y', d3Yscale(value) + 20)
      .attr('display', 'inline');
  }

  removeSelectionMarker(plotValue: number) {
    const oSelection = this.oChartObjects.oSelections[plotValue];
    oSelection.selectionLine.attr('display', 'none');
    oSelection.selectionLabelTop.attr('display', 'none');
    oSelection.selectionLabelBottom.attr('display', 'none');
  }

  addViolin(oProperties: ViolinPropertiesType) {
    const { svg } = oProperties;
    const { results } = oProperties;
    const { width } = oProperties;
    const { localDomain } = oProperties;
    const { xScale } = oProperties;
    const { imposeMax } = oProperties;
    const { violinColor } = oProperties;
    const { resolution } = oProperties;
    const { path } = oProperties;
    const { index } = oProperties;

    // this function is local, to access the path reference
    const aPath = path.split('/');

    const prepareData = function prepareData(data: ExpressionData) {
      return data[aPath[aPath.length - 1] as keyof ExpressionData] as number;
    };

    const histData = results.map(prepareData);

    const initialdata = d3.bin().thresholds(resolution)(histData);

    const data = initialdata.map(f => {
      if (f.x1 === undefined || f.x0 === undefined) {
        return {
          ...f,
          x: NaN,
          dx: NaN,
          y: f.length,
        };
      }
      return {
        ...f,
        x: f.x0,
        dx: f.x1 - f.x0,
        y: f.length,
      };
    });
    // to get pointed start and end, we append the domainstart and end
    const start = {
      x: localDomain[0],
      dx: 0,
      y: 0,
    };

    const end = {
      x: localDomain[1],
      dx: 0,
      y: 0,
    };

    const finalData = [start].concat(data, [end]);

    const y = d3
      .scaleLinear()
      .range([width / 2, 0])
      .domain([0, Math.max(imposeMax, d3.max(finalData, d => d.y) as number)]);

    const area = d3
      .area()
      .curve(d3.curveBasis)
      .x((d: any) => xScale(d.x + d.dx / 2))
      .y0(width / 2)
      .y1((d: any) => y(d.y));

    const line = d3
      .line()
      .curve(d3.curveBasis)
      .x((d: any) => xScale(d.x + d.dx / 2))
      .y((d: any) => y(d.y));
    const gPlus = svg.append('g');
    const gMinus = svg.append('g');

    gPlus
      .append('path')
      .datum(finalData)
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', violinColor);

    gPlus
      .append('path')
      .datum(finalData)
      .attr('class', 'violin')
      .attr('d', line)
      .style('stroke', violinColor);

    gMinus
      .append('path')
      .datum(finalData)
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', violinColor);

    gMinus
      .append('path')
      .datum(finalData)
      .attr('class', 'violin')
      .attr('d', line)
      .style('stroke', violinColor);

    gPlus.attr('transform', `rotate(90,0,0)  translate(0,-${width})`);
    gMinus.attr('transform', 'rotate(90,0,0) scale(1,-1)');

    // clippath for selection
    let clipPathId = '';
    if (this.clippedSelectionLine) {
      clipPathId = `clip_${index}`;
      const clipPath = svg.append('clipPath').attr('id', clipPathId);

      const clipPathPlus = clipPath
        .append('path')
        .datum(finalData)
        .attr('class', 'clippath')
        .attr('d', area);

      const clipPathMinus = clipPath
        .append('path')
        .datum(finalData)
        .attr('class', 'clippath')
        .attr('d', area);
      clipPathPlus.attr('transform', `rotate(90,0,0)  translate(0,-${width})`);
      clipPathMinus.attr('transform', 'rotate(90,0,0) scale(1,-1)');
    }
    const selectionLine = svg
      .append('line')
      .attr('class', 'selectionLine')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', 0)
      .attr('y2', 0)
      .style('fill', '#ff0000')
      .style('stroke', '#ff0000')
      .style('stroke-width', 2)
      .attr('display', 'none');
    if (this.clippedSelectionLine) {
      selectionLine.attr('clip-path', `url(#${clipPathId})`);
    }

    const selectionLabelTop = svg
      .append('text')
      .style('font-family', this.fontFamily)
      .style('font-size', this.fontSize)
      .attr('text-anchor', 'end')
      .attr('x', width)
      .attr('display', 'none');

    const selectionLabelBottom = svg
      .append('text')
      .style('font-family', this.fontFamily)
      .style('font-size', this.fontSize)
      .attr('text-anchor', 'end')
      .attr('x', width)
      .attr('display', 'none');

    const oSelection = {
      selectionLine,
      selectionLabelTop,
      selectionLabelBottom,
    };
    return oSelection;
  }

  static addBoxPlot(
    svg: any,
    results: ExpressionData[],
    height: number,
    width: number,
    margin: any,
    domain: number[],
    yScale: any,
    boxPlotWidth: number,
    boxColor: string,
    boxInsideColor: string,
    path: string
  ) {
    const d3Group = svg.append('g').attr('class', 'thickbox');

    const x = d3.scaleLinear().range([0, width]);

    const left = 0.5 - boxPlotWidth / 2;
    const right = 0.5 + boxPlotWidth / 2;

    const probs = [0.05, 0.25, 0.5, 0.75, 0.95];

    // this function is local, to access the path reference
    const aPath = path.split('/');
    const prepareData = function prepareData(data: ExpressionData) {
      return data[aPath[aPath.length - 1] as keyof ExpressionData] as number;
    };
    const quantile = function quantile(values: ExpressionData[], p: number) {
      const H = (values.length - 1) * p + 1;
      // h is index of the element on position p*|elements|
      const h = Math.floor(H);
      const v = prepareData(values[h - 1]);
      const e = H - h;
      // returns mean depending on p
      return e ? v + e * (prepareData(values[h]) - v) : v;
    };

    let i;
    for (i = 0; i < probs.length; i += 1) {
      probs[i] = yScale(quantile(results, probs[i]));
    }

    d3Group
      .append('rect')
      .attr('class', 'boxplot')
      .attr('x', x(left))
      .attr('width', x(right) - x(left))
      .attr('y', probs[3])
      .attr('height', -probs[3] + probs[1]);

    const iS = [0, 2, 4];
    const iSclass = ['', 'median', ''];
    const iSColor = [boxColor, boxColor, boxColor];
    for (i = 0; i < iS.length; i += 1) {
      d3Group
        .append('line')
        .attr('class', `boxplot ${iSclass[i]}`)
        .attr('x1', x(left))
        .attr('x2', x(right))
        .attr('y1', probs[iS[i]])
        .attr('y2', probs[iS[i]])
        .style('fill', iSColor[i])
        .style('stroke', iSColor[i]);
    }

    const iS2 = [
      [0, 1],
      [3, 4],
    ];
    for (i = 0; i < iS2.length; i += 1) {
      d3Group
        .append('line')
        .attr('class', 'boxplot')
        .attr('x1', x(0.5))
        .attr('x2', x(0.5))
        .attr('y1', probs[iS2[i][0]])
        .attr('y2', probs[iS2[i][1]])
        .style('stroke', boxColor);
    }

    d3Group
      .append('rect')
      .attr('class', 'boxplot')
      .attr('x', x(left))
      .attr('width', x(right) - x(left))
      .attr('y', probs[3])
      .attr('height', -probs[3] + probs[1])
      .style('stroke', boxColor)
      .style('fill', 'none');

    d3Group
      .append('circle')
      .attr('class', 'boxplot mean')
      .attr('cx', x(0.5))
      .attr('cy', yScale(d3.mean(results, prepareData)))
      .attr('r', x(boxPlotWidth / 5))
      .style('fill', boxColor)
      .style('stroke', 'None');
  }

  addLabel(
    svg: any,
    text: string,
    plotHeight: number,
    plotWidth: number,
    margin: any,
    textheight: number
  ) {
    svg
      .append('text')
      .text(text)
      .style('font-family', this.fontFamily)
      .style('font-size', this.fontSize)
      .attr('text-anchor', 'middle')
      .attr('x', plotWidth / 2)
      .attr('y', plotHeight - margin.bottom + textheight);
  }

  /**
   * Returns an index of an element with the same value.
   * For Multiple indexes, the minimum is returned
   */
  _binarySearch(value: number, array: ExpressionData[]) {
    if (array.length === 0) {
      throw new RangeError('No expression data provided');
    }

    const oControl = this;
    const path = oControl.valuePath;
    const aPath = path.split('/');
    let minIndex = 0;
    let maxIndex = array.length - 1;
    let compareResult;

    while (minIndex <= maxIndex) {
      const midIndex = Math.floor((maxIndex + minIndex) / 2);
      compareResult = d3.ascending(
        value,
        BiowcViolinplot.convertEC50topEC50(
          array[midIndex][
            aPath[aPath.length - 1] as keyof ExpressionData
          ] as number
        )
      );
      switch (compareResult) {
        case -1:
          maxIndex = midIndex - 1;
          break;
        case 1:
          minIndex = midIndex + 1;
          break;
        default:
          return midIndex;
      }
    }

    let i = Math.min(array.length - 1, minIndex);
    while (i > 0) {
      // get the lowest array index with the value
      compareResult = d3.ascending(
        value,
        BiowcViolinplot.convertEC50topEC50(
          array[i - 1][
            aPath[aPath.length - 1] as keyof ExpressionData
          ] as number
        )
      );
      if (compareResult === 0) {
        i -= 1;
      } else {
        return i;
      }
    }

    // it will never reach here
    return minIndex;
  }

  /*
   *  Convert log10 EC50 values to pEC50 values
   */
  static convertEC50topEC50(nValue: number) {
    // Convert log10 ec50 to ec50 in nM
    const ec50 = 10 ** nValue;
    // Convert nM to M
    const ec50M = ec50 / 1000000000;
    // Convert to pEC50
    const pEC50 = -(Math.log(ec50M) / Math.log(10));
    return pEC50;
  }

  getSVGgetSVG() {
    return this._getMainDiv().selectAll('svg').node();
  }

  labelOffsetStyles() {
    const offsets: { left: number; top: number }[] = [];
    const plotHeight = this.height;
    const plotWidth = this.violinWidth;
    const plotSpacing = 10;
    for (let index = 0; index < this.chartData.length; index += 1) {
      offsets[index] = {
        left:
          index * (plotWidth + plotSpacing) + this.margin.left + plotWidth / 2,
        top: plotHeight - this.margin.bottom + 5,
      };
    }
    return offsets;
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    // change bottom margin
    this.margin.bottom += (this.plotLabelExtraFields.length + 1) * 15;
    this.drawChart();

    super.firstUpdated(changedProperties);
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('chartData')) {
      this.drawChart();
    }
  }
}
