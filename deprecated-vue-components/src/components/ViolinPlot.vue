<template>
  <div class="analytics-selectivity violin-plot-container">
    <div class="violinPlot">
      <div class="violinbuttonarea">
        <template v-for="(plot, index) in chartData">
          <label
            v-if="!xLabelShowExtra && _dataObjectHasChilds()"
            :key="plot[keyValue]"
            class="violin-label"
            :style="labelOffsetStyles[index]"
          >{{ plot[plotLabelValueDrug] }}<br>{{ plot[plotLabelValueCatds] }}</label>
        </template>
      </div>
    </div>
  </div>
</template>

<script>

const d3 = require('d3')

export default {
  name: 'ViolinPlot',
  props: {
    height: {
      type: Number,
      default: 300
    },
    violinWidth: {
      type: Number,
      default: 200
    },
    chartData: {
      type: Array,
      default: function () {
        return []
      }
    },
    propertyPath: {
      type: String,
      default: 'PROTEIN_ID'
    },
    dataPath: {
      type: String,
      default: 'data'
    },
    valuePath: {
      type: String,
      default: 'VALUE'
    },
    fontFamily: {
      type: String,
      default: 'Arial,Helvetica,sans-serif'
    },
    fontSize: {
      type: String,
      default: '12px'
    },
    resolution: {
      type: Number,
      default: 20
    },
    selectedElement: {
      type: String,
      default: undefined
    },
    plotLabelValueDrug: {
      type: String,
      default: 'TREATMENT'
    },
    plotLabelValueCatds: {
      type: String,
      default: '0'
    },
    simpleLabel: {
      type: Boolean,
      default: false
    },
    keyValue: {
      type: String,
      default: 'DRUG_ID'
    },
    clippedSelectionLine: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: undefined
    },
    margin: {
      type: Object,
      default() {
        return {
          top: 10,
          bottom: 50,
          left: 80,
          right: 30
        }
      }
    }
  },
  data: function () {
    return {
      selected: null,
      oChartObjects: {}
    }
  },
  computed: {
    /** @returns {any} */
    labelOffsetStyles: function () {
      const styles = {}
      const plotHeight = this.height
      const plotWidth = this.violinWidth
      const plotSpacing = 10
      for (let index = 0; index < this.chartData.length; index++) {
        styles[index] = {
          left: `${index * (plotWidth + plotSpacing) + this.margin.left + plotWidth / 2}px`,
          top: `${plotHeight - this.margin.bottom + 5}px`
        }
      }
      return styles
    }
  },
  watch: {
    chartData: function () {
      this.drawChart()
    }
  },
  mounted: function () {
    this.drawChart()
  },
  methods: {
    selectViolin: function (key) {
      this.$emit('select-violin', key)
    },
    _dataObjectHasChilds: function _dataObjectHasChilds () {
      const data = this.chartData
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          return true
        }
      }
      return false
    },
    drawChart: function () {
      if (this.chartData !== undefined && this._dataObjectHasChilds()) {
        this.drawChartWithData()
      }
    },
    _getElementFromPath: function _getElementFromPath (object, aPath) {
      // Separator is slash
      let current = object
      for (let i = 0; i < aPath.length; i++) {
        current = object[aPath[i]]
      }
      return current
    },
    drawChartWithData: function drawChartWithData () {
      const oControl = this
      // Create SVG element. Remove old ones.
      const svgs = d3.select('.violinPlot').selectAll('svg')
      svgs.remove()

      const plotHeight = this.height
      const plotWidth = this.violinWidth
      const plotSpacing = 10

      const svg = d3.select('.violinPlot').append('svg:svg')
      this.oChartObjects.svg = svg

      const resolution = this.resolution
      const path = this.valuePath

      const y = d3.scaleLinear()
        .range([plotHeight - this.margin.bottom, this.margin.top])

      // this function is local, to access the path reference as fast as possible
      const aPath = path.split('/')
      const getElementFromPath = function getElementFromPath (object) {
        // Seperator is slash
        let current = object
        for (let i = 0; i < aPath.length; i++) {
          current = object[aPath[i]]
        }
        return oControl.convertEC50topEC50(current)
      }

      const compareValues = function compareValues (oSet1, oSet2) {
        return d3.ascending(getElementFromPath(oSet1), getElementFromPath(oSet2))
      }
      // var results = oControl.getChartData();
      const results = this.chartData

      // copy the dataarray and sort it
      const oSortedData = {}
      let min
      let max
      // var aDataPath = oControl.getDataPath().split('/');
      const aDataPath = this.dataPath.split('/')
      const oDomains = {}
      results.forEach(function orderResults (e, i) {
        // slice to copy the array
        oSortedData[i] = oControl._getElementFromPath(e, aDataPath).slice().sort(compareValues)
        const localMin = getElementFromPath(oSortedData[i][0])
        const localMax = getElementFromPath(oSortedData[i][oSortedData[i].length - 1])
        min = min ? Math.min(localMin, min) : localMin
        max = max ? Math.max(localMax, max) : localMax
        oDomains[i] = [localMin, localMax]
      })
      const domain = [min, max]

      y.domain(domain).nice()

      // draw yAxis
      const yAxis = d3.axisLeft()
        .scale(y)
        .ticks(5)
        .tickSize(5, 0, 5)

      let j = 0
      // store Objects needed for Selection
      this.oChartObjects.oSelections = {}
      this.oChartObjects.oSortedData = oSortedData
      this.oChartObjects.d3YScale = y

      for (const [i, oSortedElement] of Object.entries(this.oChartObjects.oSortedData)) {
        const g = svg.append('g').attr('transform', 'translate(' + (j * (plotWidth + plotSpacing) + this.margin.left) + ',0)')
        const oViolinProperties = {
          svg: g,
          results: oSortedElement,
          width: plotWidth,
          localDomain: oDomains[i],
          xScale: y,
          imposeMax: 0.25,
          violinColor: '#ccc',
          resolution,
          path,
          index: j
        }
        this.oChartObjects.oSelections[i] = oControl.addViolin(oViolinProperties)
        oControl.addBoxPlot(g, oSortedElement, plotHeight, plotWidth, this.margin, domain, y, 0.15, 'black', 'white', path)
        oControl.addSelectionBoundingBox(g, plotWidth, plotHeight, i)

        g.on('click', function () {
          oControl.selectViolin(results[i])
        })
        j++
      }

      const width = (plotWidth + plotSpacing) * j
      svg.attr('height', plotHeight).attr('width', width + this.margin.left + this.margin.right)
      svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + this.margin.left + ',0)')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -plotHeight / 2)
        .attr('y', -35)
        .attr('fill', '#000')
        .style('text-anchor', 'middle')
        .style('font-family', this.fontFamily)
        .style('font-size', this.fontSize)
        .text('pEC50')
      svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', 40)
        .attr('y', plotHeight - 12)
        .text('CATDS')
        .style('text-anchor', 'middle')
        .style('font-family', this.fontFamily)
        .style('font-size', 15)

      if (oControl.selectedElement) {
        oControl.selectElement(oControl.selectedElement)
      }
    },
    addSelectionBoundingBox: function (svg, plotWidth, plotHeight, index) {
      const rect = svg.append('svg')
        .attr('width', plotWidth)
        .attr('height', plotHeight)
        .attr('id', 'violin-bbox-' + index)
        .style('cursor', 'pointer')
        .style('opacity', '0')

      rect.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', plotWidth)
        .attr('height', plotHeight)
        .attr('stroke', 'black')
        .attr('fill', 'rgba(0,0,0,0.03)')

      rect.on('mouseenter', function () {
        d3.select(this.$el).select('#violin-bbox-' + index).style('opacity', '1.0')
      }.bind(this))
      rect.on('mouseleave', function () {
        d3.select(this.$el).select('#violin-bbox-' + index).style('opacity', '0')
      }.bind(this))
    },
    selectElement: function selectElement (property) {
      const oControl = this
      const aPropertyPath = oControl.propertyPath.split('/')
      const oChartObjects = this.oChartObjects

      const valuePath = oControl.valuePath
      const aValuePath = valuePath.split('/')

      for (const [plotId, plot] of Object.entries(oChartObjects.oSortedData)) {
        // find the Element with the Value of the Property
        let element
        for (let i = 0; i < plot.length; i++) {
          if (parseInt(property, 10) === oControl._getElementFromPath(plot[i], aPropertyPath)) {
            element = plot[i]
            break
          }
        }
        if (element) {
          oControl.selectElementByValue(oControl.convertEC50topEC50(oControl._getElementFromPath(element, aValuePath)), plotId)
        } else {
          oControl.removeSelectionMarker(plotId)
        }
      }
    },

    selectElementByValue: function selectElementByValue (value, plotValue) {
      const aData = this.oChartObjects.oSortedData[plotValue]
      const oSelection = this.oChartObjects.oSelections[plotValue]
      const d3Yscale = this.oChartObjects.d3YScale
      const iElementIndex = this._binarySearch(value, aData)
      oSelection.selectionLine
        .attr('y1', d3Yscale(value))
        .attr('y2', d3Yscale(value))
        .attr('display', 'inline')
      oSelection.selectionLabelTop
        .text(aData.length - iElementIndex - 1)
        .attr('y', d3Yscale(value) - 10)
        .attr('display', 'inline')
      oSelection.selectionLabelBottom
        .text(iElementIndex)
        .attr('y', d3Yscale(value) + 20)
        .attr('display', 'inline')
    },

    removeSelectionMarker: function removeSelectionMarker (plotValue) {
      const oSelection = this.oChartObjects.oSelections[plotValue]
      oSelection.selectionLine
        .attr('display', 'none')
      oSelection.selectionLabelTop
        .attr('display', 'none')
      oSelection.selectionLabelBottom
        .attr('display', 'none')
    },

    addViolin: function addViolin (oProperties) {
      const svg = oProperties.svg
      const results = oProperties.results
      const width = oProperties.width
      const localDomain = oProperties.localDomain
      const xScale = oProperties.xScale
      const imposeMax = oProperties.imposeMax
      const violinColor = oProperties.violinColor
      const resolution = oProperties.resolution
      const path = oProperties.path
      const index = oProperties.index

      const oControl = this

      // this function is local, to access the path reference
      const aPath = path.split('/')
      const getElementFromPath = function getElementFromPath (object) {
        // Seperator is slash
        let current = object
        for (let i = 0; i < aPath.length; i++) {
          current = object[aPath[i]]
        }
        return oControl.convertEC50topEC50(current)
      }

      let data = d3.histogram()
        .thresholds(resolution)
        .value(getElementFromPath)(results)

      data = data.map(f => {
        return {
          ...f,
          x: f.x0,
          dx: f.x1 - f.x0,
          y: f.length
        }
      })
      // to get pointed start and end, we append the domainstart and end
      const start = {
        x: localDomain[0],
        dx: 0,
        y: 0
      }

      const end = {
        x: localDomain[1],
        dx: 0,
        y: 0
      }

      data = [start].concat(data, [end])

      const y = d3.scaleLinear()
        .range([width / 2, 0])
        .domain([0, Math.max(imposeMax, d3.max(data, function yScaleReturnValue (d) {
          return d.y
        }))])

      const area = d3.area()
        .curve(d3.curveBasis)
        .x(function areaReturnXValue (d) {
          return xScale(d.x + d.dx / 2)
        })
        .y0(width / 2)
        .y1(function areaReturnYValue (d) {
          return y(d.y)
        })

      const line = d3.line()
        .curve(d3.curveBasis)
        .x(function lineReturnXValue (d) {
          return xScale(d.x + d.dx / 2)
        })
        .y(function lineReturnXValue (d) {
          return y(d.y)
        })
      const gPlus = svg.append('g')
      const gMinus = svg.append('g')

      gPlus
        .append('path')
        .datum(data)
        .attr('class', 'area')
        .attr('d', area)
        .style('fill', violinColor)

      gPlus.append('path')
        .datum(data)
        .attr('class', 'violin')
        .attr('d', line)
        .style('stroke', violinColor)
      gMinus.append('path')
        .datum(data)
        .attr('class', 'area')
        .attr('d', area)
        .style('fill', violinColor)

      gMinus.append('path')
        .datum(data)
        .attr('class', 'violin')
        .attr('d', line)
        .style('stroke', violinColor)

      gPlus.attr('transform', 'rotate(90,0,0)  translate(0,-' + width + ')')
      gMinus.attr('transform', 'rotate(90,0,0) scale(1,-1)')

      // clippath for selection
      let clipPathId = ''
      if (this.clippedSelectionLine) {
        clipPathId = 'clip_' + index
        const clipPath = svg.append('clipPath').attr('id', clipPathId)

        const clipPathPlus = clipPath.append('path')
          .datum(data)
          .attr('class', 'clippath')
          .attr('d', area)

        const clipPathMinus = clipPath.append('path')
          .datum(data)
          .attr('class', 'clippath')
          .attr('d', area)
        clipPathPlus.attr('transform', 'rotate(90,0,0)  translate(0,-' + width + ')')
        clipPathMinus.attr('transform', 'rotate(90,0,0) scale(1,-1)')
      }
      const selectionLine = svg.append('line')
        .attr('class', 'selectionLine')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', 0)
        .attr('y2', 0)
        .style('fill', '#ff0000')
        .style('stroke', '#ff0000')
        .style('stroke-width', 2)
        .attr('display', 'none')
      if (this.clippedSelectionLine) {
        selectionLine.attr('clip-path', 'url(#' + clipPathId + ')')
      }

      const selectionLabelTop = svg.append('text')
        .style('font-family', this.fontFamily)
        .style('font-size', this.fontSize)
        .attr('text-anchor', 'end')
        .attr('x', width)
        .attr('display', 'none')

      const selectionLabelBottom = svg.append('text')
        .style('font-family', this.fontFamily)
        .style('font-size', this.fontSize)
        .attr('text-anchor', 'end')
        .attr('x', width)
        .attr('display', 'none')

      const oSelection = {
        selectionLine,
        selectionLabelTop,
        selectionLabelBottom
      }
      return oSelection
    },
    addBoxPlot: function addBoxPlot (svg, results, height, width, margin, domain, yScale, boxPlotWidth, boxColor, boxInsideColor, path) {
      const d3Group = svg.append('g').attr('class', 'thickbox')
      const oControl = this

      const x = d3.scaleLinear()
        .range([0, width])

      const left = 0.5 - boxPlotWidth / 2
      const right = 0.5 + boxPlotWidth / 2

      const probs = [0.05, 0.25, 0.5, 0.75, 0.95]

      // this function is local, to access the path reference
      const aPath = path.split('/')
      const getElementFromPath = function getElementFromPath (object) {
        // Seperator is slash
        let current = object
        for (let i = 0; i < aPath.length; i++) {
          current = object[aPath[i]]
        }
        return oControl.convertEC50topEC50(current)
      }
      const quantile = function quantile (values, p) {
        const H = (values.length - 1) * p + 1
        // h is index of the element on position p*|elements|
        const h = Math.floor(H)
        const v = getElementFromPath(values[h - 1])
        const e = H - h
        // returns mean depending on p
        return e ? v + e * (getElementFromPath(values[h]) - v) : v
      }

      let i
      for (i = 0; i < probs.length; i++) {
        probs[i] = yScale(quantile(results, probs[i]))
      }

      d3Group.append('rect')
        .attr('class', 'boxplot')
        .attr('x', x(left))
        .attr('width', x(right) - x(left))
        .attr('y', probs[3])
        .attr('height', -probs[3] + probs[1])

      let iS = [0, 2, 4]
      const iSclass = ['', 'median', '']
      const iSColor = [boxColor, boxColor, boxColor]
      for (i = 0; i < iS.length; i++) {
        d3Group.append('line')
          .attr('class', 'boxplot ' + iSclass[i])
          .attr('x1', x(left))
          .attr('x2', x(right))
          .attr('y1', probs[iS[i]])
          .attr('y2', probs[iS[i]])
          .style('fill', iSColor[i])
          .style('stroke', iSColor[i])
      }

      iS = [
        [0, 1],
        [3, 4]
      ]
      for (i = 0; i < iS.length; i++) {
        d3Group.append('line')
          .attr('class', 'boxplot')
          .attr('x1', x(0.5))
          .attr('x2', x(0.5))
          .attr('y1', probs[iS[i][0]])
          .attr('y2', probs[iS[i][1]])
          .style('stroke', boxColor)
      }

      d3Group.append('rect')
        .attr('class', 'boxplot')
        .attr('x', x(left))
        .attr('width', x(right) - x(left))
        .attr('y', probs[3])
        .attr('height', -probs[3] + probs[1])
        .style('stroke', boxColor)

      d3Group.append('circle')
        .attr('class', 'boxplot mean')
        .attr('cx', x(0.5))
        .attr('cy', yScale(d3.mean(results, getElementFromPath)))
        .attr('r', x(boxPlotWidth / 5))
        .style('fill', boxColor)
        .style('stroke', 'None')
    },

    addLabel: function addLabel (svg, text, plotHeight, plotWidth, margin, textheight) {
      svg.append('text')
        .text(text)
        .style('font-family', this.fontFamily)
        .style('font-size', this.fontSize)
        .attr('text-anchor', 'middle')
        .attr('x', plotWidth / 2)
        .attr('y', plotHeight - margin.bottom + textheight)
    },

    /**
     * Returns an index of an element with the same value.
     * For Multiple indexes, the minimum is returned
     */
    _binarySearch: function _binarySearch (value, array) {
      const oControl = this
      const path = oControl.valuePath
      const aPath = path.split('/')
      let minIndex = 0
      let maxIndex = array.length - 1
      let compareResult

      while (minIndex <= maxIndex) {
        const midIndex = Math.floor((maxIndex + minIndex) / 2)
        compareResult = d3.ascending(value, oControl.convertEC50topEC50(oControl._getElementFromPath(array[midIndex], aPath)))
        switch (compareResult) {
          case -1:
            maxIndex = midIndex - 1
            break
          case 1:
            minIndex = midIndex + 1
            break
          default:
            return midIndex
        }
      }
      let i = Math.min(array.length - 1, minIndex)
      while (i > 0) {
        // get the lowest array index with the value
        compareResult = d3.ascending(value, oControl.convertEC50topEC50(oControl._getElementFromPath(array[i - 1], aPath)))
        if (compareResult === 0) {
          i--
        } else {
          return i
        }
      }
    },
    /*
     *  Convert log10 EC50 values to pEC50 values
     */
    convertEC50topEC50: function convertEC50topEC50 (nValue) {
      // Convert log10 ec50 to ec50 in nM
      const ec50 = Math.pow(10, nValue)
      // Convert nM to M
      const ec50M = ec50 / 1000000000
      // Convert to pEC50
      const pEC50 = -(Math.log(ec50M) / Math.log(10))
      return pEC50
    },
    getSVG: function getSVG () {
      return d3.select(this.$el).selectAll('svg').node()
    }
  }
}
</script>

<style lang="scss">
.analytics-selectivity {
  font-family: Arial,Helvetica,sans-serif;
  font: 10px sans-serif;

  .area {
    shape-rendering: geometricPrecision;
    fill: #ccc !important;
  }

  .boxplot{
    shape-rendering: crispEdges;
    fill: none;
    stroke: black;
    stroke-width: 1px;
  }
  .boxplot.fill{
    fill: black;
  }
  .thickbox .boxplot{
    stroke-width: 2;
  }
  .boxplot.mean, .boxplot.median{
    fill: white;
    stroke: white;
  }
  .boxplot.mean{
    shape-rendering: geometricPrecision;
  }
  .violin{
    shape-rendering: geometricPrecision;
    fill: none !important;
    stroke: #777;
    stroke-width: 1px;
  }

  .axis path, .axis line {
    fill: none;
    stroke: #000;
    stroke-width: 1px;
    color-rendering: optimizeQuality !important;
    shape-rendering: crispEdges !important;
    text-rendering: geometricPrecision !important;

  }

  .violinPlot{
    position: relative;
  }

  .violinarea{
    position: absolute;
  }

  .violinbuttonarea.violinhidden{
    display: none;
  }

  .D3ViolinPlotTitle{
    font-family: Arial,Helvetica,sans-serif;
    font-size: 18px;
  }

  .selectedTreatment {
    text-decoration: underline;
  }

  .violin-label {
    transform: translate(-50%, 0);
    position: absolute;
    pointer-events: none;
    font-size: 15px;
  }
}
</style>
