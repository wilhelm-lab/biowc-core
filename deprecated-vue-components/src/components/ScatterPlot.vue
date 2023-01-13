<template>
  <div id="scatterplot" />
</template>

<script>

const d3 = require('d3')

export default {
  name: 'ScatterPlot',
  props: {
    identifier1: {
      type: String,
      default: ''
    },
    identifier2: {
      type: String,
      default: ''
    },
    expressions1: {
      type: Array,
      default: () => []
    },
    expressions2: {
      type: Array,
      default: () => []
    }

  },
  data: () => ({
    expressionsCommon: []
  }),
  watch: {
    expressions1: function () {
      this.updateScatterPlot()
    },
    expressions2: function () {
      this.updateScatterPlot()
    }
  },
  mounted() {
    this.expressionsCommon = this.getExpressionInCommonSamples()
    this.plotExpression()
  },
  methods: {
    updateScatterPlot () {
      this.expressionsCommon = this.getExpressionInCommonSamples()
      this.plotExpression()
    },
    getExpressionInCommonSamples: function () {
      const expressionsBySampleId1 = Object.assign({}, ...this.expressions1.map((x) => ({ [x['Sample name']]: x['Z-score'] })))
      const expressionsBySampleId2 = Object.assign({}, ...this.expressions2.map((x) => ({ [x['Sample name']]: x['Z-score'] })))
      const expressionsInCommonSamples = []
      for (const [key, value] of Object.entries(expressionsBySampleId1)) {
        if (key in expressionsBySampleId2) {
          expressionsInCommonSamples.push({
            sampleId: key,
            expression1: value,
            expression2: expressionsBySampleId2[key]
          })
        }
      }
      return expressionsInCommonSamples
    },

    linearRegression: function (y, x) {
      const lr = {}
      const n = y.length
      let sumX = 0
      let sumY = 0
      let sumXy = 0
      let sumXx = 0
      let sumYy = 0

      for (let i = 0; i < y.length; i++) {
        sumX += x[i]
        sumY += y[i]
        sumXy += (x[i] * y[i])
        sumXx += (x[i] * x[i])
        sumYy += (y[i] * y[i])
      }

      lr.slope = (n * sumXy - sumX * sumY) / (n * sumXx - sumX * sumX)
      lr.intercept = (sumY - lr.slope * sumX) / n
      let r2 = Math.pow((n * sumXy - sumX * sumY) / Math.sqrt((n * sumXx - sumX * sumX) * (n * sumYy - sumY * sumY)), 2)
      r2 = Math.sqrt(r2)
      lr.correlation = Math.round(r2 * 100) / 100
      return lr
    },

    plotExpression: function () {
      // set the dimensions and margins of the graph
      const margin = { top: 10, right: 30, bottom: 30, left: 60 }
      const width = 460 - margin.left - margin.right
      const height = 400 - margin.top - margin.bottom

      d3.select('#scatterplot').select('svg').remove()

      // append the svg object to the body of the page
      const svg = d3.select('#scatterplot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom + 30)
        .append('g')
        .attr('transform',
          'translate(' + margin.left + ',' + margin.top + ')')

      // Add X axis
      const minValueX = Math.min(-3.0, Math.min(...this.expressionsCommon.map(d => d.expression1)))
      const maxValueX = Math.max(3.0, Math.max(...this.expressionsCommon.map(d => d.expression1)))
      const x = d3.scaleLinear()
        .domain([minValueX, maxValueX])
        .range([0, width])
      svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))

      // Add Y axis
      const minValueY = Math.min(-3.0, Math.min(...this.expressionsCommon.map(d => d.expression2)))
      const maxValueY = Math.max(3.0, Math.max(...this.expressionsCommon.map(d => d.expression2)))

      // trendline parameters
      const XaxisData = []
      const YaxisData = []
      Object.entries(this.expressionsCommon).forEach(Element => {
        XaxisData.push(Element[1].expression1)
        YaxisData.push(Element[1].expression2)
      })
      let x1 = minValueX
      const x2 = maxValueX
      const equation = this.linearRegression(YaxisData, XaxisData)
      let y1 = (equation.slope * x1) + equation.intercept
      const y2 = (equation.slope * x2) + equation.intercept

      if (y1 < minValueY) {
        // if overflow it updates the two vlaues
        y1 = minValueY
        x1 = (y1 - equation.intercept) / equation.slope
      }

      const y = d3.scaleLinear()
        .domain([minValueY, maxValueY])
        .range([height, 0])
      svg.append('g')
        .call(d3.axisLeft(y))

      // Add the tooltip container to the vis container
      // it's invisible and its position/contents are defined during mouseover
      const tooltip = d3.select('#scatterplot').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

      // tooltip mouseover event handler
      const tipMouseover = function (e, d) {
        const html = d.sampleId
        tooltip.html(html)
          .style('left', (e.pageX + 10) + 'px')
          .style('top', (e.pageY - 50) + 'px')
          .transition()
          .duration(200) // ms
          .style('opacity', 0.9) // started as 0!
      }
      // tooltip mouseout event handler
      const tipMouseout = function () {
        tooltip.transition()
          .duration(300) // ms
          .style('opacity', 0) // don't care about position!
      }

      // Add dots
      svg.append('g')
        .selectAll('dot')
        .data(this.expressionsCommon)
        .enter()
        .append('circle')
        .attr('cx', function (d) {
          return x(d.expression1)
        })
        .attr('cy', function (d) {
          return y(d.expression2)
        })
        .attr('r', 4)
        .style('fill', '#69b3a2')
        .on('mousemove', tipMouseover)
        .on('mouseout', tipMouseout)

      // adding trendline to the plot
      svg
        .append('line')
        .data(this.expressionsCommon)
        .attr('x1', x(x1))
        .attr('x2', x(x2))
        .attr('y1', y(y1))
        .attr('y2', y(y2))
        .attr('stroke', 'black')

      // add the x Axis
      svg
        .append('text')
        .attr(
          'transform',
          'translate(' +
              width / 2 +
              ' ,' +
              (height + margin.top + 30) +
              ')'
        )
        .style('text-anchor', 'middle')
        .text(this.identifier1 + ' Z-score')

      // add the y Axis
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(this.identifier2 + ' Z-score')

      /*
      let line = d3.line()
        .x((d) => x(d[0]))
        .y((d) => y(d[1]));
      svg
      .append("path")
      .datum(res)
      .attr("class", "line")
      .attr("d", line)
*/
    }
  }
}
</script>
<style>
.tooltip {
  position: absolute;
  font-size: 12px;
  width: auto;
  height: auto;
  pointer-events: none;
  background-color: white;
}
</style>
