<template>
  <div
    id="ic50plot"
    ref="container"
    class="sapProteomicsdbIC50Plot"
    :style="containerStyle"
  />
</template>

<script>

const d3 = require('d3')
export default {
  name: 'IC50Plot',
  props: {
    width: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      default: 200
    },
    curveParameters: {
      type: Object,
      default: undefined
    },
    dataPoints: {
      type: Array,
      default: undefined
    },
    properties: {
      type: Object,
      default: undefined
    },
    visible: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: undefined
    }
  },
  computed: {
    /** @returns {{ width: string, height: string }} */
    containerStyle: function () {
      return {
        width: this.width + 'px',
        height: this.height + 'px'
      }
    }
  },
  watch: {
    dataPoints: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.render()
      }
    }
  },
  mounted () {
    this.render()
  },
  methods: {
    render: function () {
      // create Curve Function
      const oParameters = this.curveParameters
      const aDataPoints = this.dataPoints
      let aPoints = []
      let oErrorBarInfo = {}
      let bShowCurve = true
      if (oParameters && this.visible) {
        const fCurve = this.createCurveFunction(oParameters)
        if (oParameters.slope.value < 0) {
          bShowCurve = false
        }
        // errorbarinfo
        oErrorBarInfo = oParameters.inflection
        oErrorBarInfo.y = fCurve(oErrorBarInfo.value)
        // Series Array for possible multiple Curves
        const aSeries = []
        // add Curve Datasets
        aSeries.push(this.calculateCurvePoints(fCurve))
        // calculate Data Points
        if (aDataPoints && aDataPoints.length > 0) {
          aPoints = this.calculateRatio(aDataPoints)
        }
        // Draw Plot with fitted Curve and actual Data Points
        this.drawPlot(aSeries, aPoints, oErrorBarInfo, bShowCurve)
      }
    },
    createCurveFunction: function createCurveFunction (oParameters) {
      const slope = parseFloat(oParameters.slope.value)
      const bottom = parseFloat(oParameters.bottom.value)
      const top = parseFloat(oParameters.top.value)
      const inflection = parseFloat(oParameters.inflection.value)
      const a = function curveFunction (x) {
        return bottom + (top - bottom) / (1 + Math.exp(slope * (Math.log(x) - Math.log(inflection))))
      }
      return a
    },
    calculateCurvePoints: function calculateCurvePoints (fCurve) {
      const nm = []
      for (let i = -1; i <= 5; i = i + 0.01) {
        nm.push(Math.pow(10, i))
      }
      const aData = nm.map(function map (d) {
        return [d, fCurve(d)]
      })
      return aData
    },
    calculateRatio: function calculateRatio (aData) {
      const aResult = []
      aData = aData.sort(function compare (a, b) { // sort Points to have x = 0 in first position
        return a[0] - b[0]
      })

      const bNormalized = this.properties.calculationMethod === 4 // 4 means normalized intensities
      const nCompare = Math.pow(10, aData[0][1])
      // change 0 to 0.1, because log 0 becomes -Infinity and we want to see the control point in the plot
      aResult[0] = {
        x: 0.1,
        y: 1
      }

      for (let i = 1; i < aData.length; i++) {
        aResult[i] = {
          x: aData[i][0],
          y: bNormalized ? aData[i][1] : Math.pow(10, aData[i][1]) / nCompare
        }
      }

      return aResult
    },
    drawPlot: function drawPlot (aData, aPoints, oErrorBarInfo, bShowCurve) {
      const sPlotId = '#ic50plot'
      const $Plot = this.$refs.container
      const margin = {
        top: 40,
        right: 30,
        bottom: 40,
        left: 50
      }
      const width = $Plot.clientWidth - margin.left - margin.right
      const height = $Plot.clientHeight - margin.top - margin.bottom

      d3.select(sPlotId).select('svg').remove()

      // scale x Axis for highest within all series
      const x = d3.scaleLog()
        .domain([0.1, d3.max(aData, function outerMax (d) {
          return d3.max(d, function innerMax (e) {
            return e[0]
          })
        })])
        .range([0, width])
        .nice()

      let yMaxPoints = 0
      let yMaxCurve = 0
      yMaxPoints = d3.max(aPoints, function max (d) {
        return d.y
      })
      yMaxCurve = d3.max(aData, function outerMax (d) {
        return d3.max(d, function innerMax (e) {
          return e[1]
        })
      })
      const y = d3.scaleLinear()
        .domain([0, yMaxPoints > yMaxCurve ? yMaxPoints : yMaxCurve])
        .range([height, 0])
        .nice()

      const color = d3.scaleOrdinal(d3.schemeCategory10)

      const xAxis = d3.axisBottom()
        .scale(x)
        .ticks(10, function ticks (digit) {
          return digit
        })

      const yAxis = d3.axisLeft()
        .scale(y)

      const line = d3.line()
        .x(function getX (d) {
          return x(d[0])
        })
        .y(function getY (d) {
          return y(d[1])
        })
        .curve(d3.curveBasis)

      const svg = d3.select(sPlotId).append('svg:svg')
        .attr('class', 'sapProteomicsdbIC50Plot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

      const content = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      this.svg = svg

      content.append('defs').append('clipPath')
        .attr('id', 'clip-' + sPlotId)
        .append('rect')
        .attr('width', width)
        .attr('height', height)

      content.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

      content.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

      if (bShowCurve) {
        content.append('g')
          .attr('class', 'lines')
          .attr('clip-path', 'url(#clip-' + sPlotId + ')')
          .selectAll('path')
          .data(aData)
          .enter().append('path')
          .style('stroke', function stroke (d, i) {
            return color(i)
          })
          .attr('d', line)

        const errorBox = content.append('g')
          .attr('class', 'errorbox')

        const errorbar = errorBox.append('g')
          .attr('class', 'errorbar')
          .style('stroke', 'orange')

        errorbar.append('g')
          .selectAll('line')
          .data([oErrorBarInfo])
          .enter()
          .append('line')
          .attr('x1', function getX1 (d) {
            return x(d3.max([0.1, d.value - d.std_error]))
          })
          .attr('y1', function getY1 (d) {
            return y(d.y)
          })
          .attr('x2', function getX2 (d) {
            return x(d.value + d.std_error)
          })
          .attr('y2', function getY2 (d) {
            return y(d.y)
          })

        const iPxOffSetErrorBar = 8

        errorbar.append('g')
          .selectAll('line')
          .data([oErrorBarInfo])
          .enter()
          .append('line')
          .attr('x1', function getX1 (d) {
            return x(d3.max([0.1, d.value - d.std_error]))
          })
          .attr('y1', function getY1 (d) {
            return y(d.y) - iPxOffSetErrorBar
          })
          .attr('x2', function getX2 (d) {
            return x(d3.max([0.1, d.value - d.std_error]))
          })
          .attr('y2', function getY2 (d) {
            return y(d.y) + iPxOffSetErrorBar
          })

        errorbar.append('g')
          .selectAll('line')
          .data([oErrorBarInfo])
          .enter()
          .append('line')
          .attr('x1', function getX1 (d) {
            return x(d3.max([0.1, d.value + d.std_error]))
          })
          .attr('y1', function getY1 (d) {
            return y(d.y) - iPxOffSetErrorBar
          })
          .attr('x2', function getX2 (d) {
            return x(d.value + d.std_error)
          })
          .attr('y2', function getY2 (d) {
            return y(d.y) + iPxOffSetErrorBar
          })

        errorbar.append('g')
          .selectAll('rect')
          .data([oErrorBarInfo])
          .enter()
          .append('rect')
          .attr('x', function getX (d) {
            return x(d3.max([0.1, d.value])) - 2.5
          })
          .attr('y', function getY (d) {
            return y(d.y) - 2.5
          })
          .attr('width', '5')
          .attr('height', '5')
          .attr('fill', 'orange')

        errorBox.append('g')
          .selectAll('text')
          .data([oErrorBarInfo])
          .enter()
          .append('text')
          .text(function text (d) {
            return 'EC50: ' + d.value.toFixed(0) + ' nM'
          })
          .attr('text-anchor', function textAnchor (d) {
            const nTextWidth = this.getBBox().width
            const nXPosition = x(d3.max([0.1, d.value + d.std_error]))
            return nXPosition + nTextWidth > width ? 'end' : 'begin'
          })
          .attr('y', function getY (d) {
            return Math.max(y(d.y + 0.1), 0)
          })
          .attr('x', function getX (d) {
            return Math.min(x(d3.max([0.1, d.value + d.std_error])), width)
          })
      }

      if (aPoints.length > 0) {
        content.selectAll('.dot')
          .data(aPoints)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('r', 2)
          .attr('cx', function cx (d) {
            return x(d.x)
          })
          .attr('cy', function cy (d) {
            return y(d.y)
          })
      }

      content.append('text')
        .attr('class', 'AxisLabel')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 30)
        .text('concentration in nM')

      content.append('text')
        .attr('class', 'AxisLabel')
        .attr('transform', 'rotate(-90)')
        .attr('y', -35)
        .attr('x', 0 - height / 2)
        .style('font-size', '12px')
        .style('text-anchor', 'middle')
        .text('relative intensity')
      // Title
      const title = svg.append('text')
        .attr('class', 'IC50Title')
        .attr('x', margin.left)
        .attr('y', 20)
        .attr('text-anchor', 'start')
        .text(this.title)
      this.expandChartSizeToTitle(svg, title, width, margin)
    },
    expandChartSizeToTitle: function (svg, d3Title, width, margin) {
      var titleWidth = d3Title.node().getBBox().width;
      var titlePadding = 10;
      if (titleWidth > width) {
        var newWidth = Math.max(titleWidth + margin.left + titlePadding, width + margin.left + margin.right);
        svg.attr('width', newWidth);
        d3Title
          .attr('x', margin.left)
          .attr('text-anchor', 'left');
      }
    },
    getSVG: function getSVG () {
      return d3.selectAll('svg').node()
    }
  }
}
</script>

<style>
@import './IC50Plot.css.prdb';
</style>
