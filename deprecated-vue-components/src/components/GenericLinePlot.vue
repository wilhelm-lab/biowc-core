<template>
  <div class='lineplotClass'></div>
</template>

<script>
const d3 = require('d3');


export default {
  props: {
    minWidth: {
      type: Number,
      default: 200
    },
    minHeight: {
      type: Number,
      default: 200
    },
    curveParameters: {
      type: Array,
      default: undefined
    },
    dataPoints: {
      type: Array,
      default: undefined
    },
    properties: {
      type: Array,
      default: undefined
    },
    title: {
      type: String,
      default: undefined
    },
    kinobeads: {
      type: Boolean,
      default: false
    },
    turnover: {
      type: Boolean,
      default: false
    },
    ratioY: {
      type: Boolean,
      default: false
    },
    hideLegend: {
      type: Boolean,
      default: false
    },
    legendAtBottom: {
      type: Boolean,
      default: false
    },
    hideErrorBars: {
      type: Boolean,
      defalut: false
    },
    xAxisLabel: {
      type: String,
      default: null
    },
    yAxisLabel: {
      type: String,
      default: null
    },
    logX: {
      type: Boolean,
      default: true
    },
    exponentialX: {
      type: Boolean,
      default: true
    },
    drawLine: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    dataPoints: function() {
      this.init();
    }
  },
  data: function() {
    return {
      bShowCurve: true,
      oErrorbarInfo: {},
      bCETSA: false
    };
  },

  methods: {
    getCurveFunction: function(oParameters) {
      var formula = oParameters.formula;
      if (formula) {
        for (var key in oParameters) {
          let sKey = key.length < 2 ? ' ' + key + ' ' : key;

          while (formula.search(sKey) > 0) {
            formula = formula.replace(sKey, oParameters[key].value);
          }
        }

        return Function('x', formula);
      } else {
        return Function('return null');
      }
    },

    calculateCurvePoints: function(oParameters, aDataPoints) {
      var fCurve = this.getCurveFunction(oParameters);
      var aValues = [];

      if (!this.kinobeads) {
        var min = d3.min(aDataPoints, function(d) {
          return d[0];
        });
        var max = d3.max(aDataPoints, function(d) {
          return d[0];
        });
        if (this.logX) {
          min = Math.log10(min);
          max = Math.log10(max);
          var step = 0.05;
          aValues.push(min);
          for (var j = min + step; j <= max; j = j + step) {
            aValues.push(j);
          }
          aValues.push(max);
        } else {
          for (var k = min; k <= max; k++) {
            aValues.push(k);
          }
        }
      } else {
        for (var i = -1; i <= 5; i = i + 0.01) {
          aValues.push(i);
        }
      }

      if (this.logX) {
        aValues = aValues.map(function(d) {
          return Math.pow(10, d);
        });
      }

      var aData = aValues.map(function(d) {
        return [d, fCurve(d)];
      }).filter(d => d[1]); //Only retain values where y!=null
      return aData;
    },

    createCurveStyleDictionary: function(aProperties) {
      var color = d3.scaleOrdinal(d3.schemeCategory10);

      var oDictionary = {};
      var treatmentDictionary = {};
      var numTreatments = 0;
      for (var i = 0; i < aProperties.length; i++) {
        if (!(aProperties[i].TREATMENT in treatmentDictionary)) {
          treatmentDictionary[aProperties[i].TREATMENT] = [++numTreatments, 0];
        }

        // var x = aProperties[i].biologicalReplicate;
        // var dash = x * 3 + "," + (x - 1) * 3;
        const dash = '3,0';
        let cid = aProperties[i].curveId || i;
        oDictionary[cid] = {
          // color: color(treatmentDictionary[aProperties[i].TREATMENT][0]),
          color: color(i),
          dash: dash,
          marker: d3
            .symbol()
            .type(
              d3.symbols[treatmentDictionary[aProperties[i].TREATMENT][1] % 6]
            )()
        };
        treatmentDictionary[aProperties[i].TREATMENT][1]++;
      }
      return oDictionary;
    },

    highlightMouseOver: function(sId, x, y) {
      d3.select(this.$el)
        .select('#errorLine-' + sId)
        .attr('class', 'highlightLines');
      if (!this.hideLegend) {
        d3.select(this.$el)
          .select('#legendLine-' + sId)
          .attr('class', 'highlightLines');
        d3.select(this.$el)
          .select('#legendText-' + sId)
          .attr('font-weight', 'bold');
        d3.select(this.$el)
          .selectAll('#dotsLegend-' + sId)
          .attr(
            'transform',
            'translate(' + 25 / 2 + ',' + 10 / 2 + ') scale(1)'
          ); // sry for hard coding
      }
      d3.select(this.$el)
        .selectAll('#plotLine-' + sId)
        .attr('class', 'highlightLines');
      d3.select(this.$el)
        .selectAll('#dots-' + sId)
        .attr('transform', function(d) {
          return 'translate(' + x(d.x) + ',' + y(d.y) + ') scale(1)';
        });
    },

    unHighlightMouseOver: function(sId, x, y) {
      d3.select(this.$el)
        .select('#errorLine-' + sId)
        .attr('class', 'lines');
      d3.select(this.$el)
        .selectAll('#plotLine-' + sId)
        .attr('class', 'lines');
      d3.select(this.$el)
        .selectAll('#dots-' + sId)
        .attr('transform', function(d) {
          return 'translate(' + x(d.x) + ',' + y(d.y) + ') scale(0.75)';
        });
      if (!this.hideLegend) {
        d3.select(this.$el)
          .select('#legendLine-' + sId)
          .attr('class', 'lines');
        d3.select(this.$el)
          .select('#legendText-' + sId)
          .attr('font-weight', 'normal');
        d3.select(this.$el)
          .selectAll('#dotsLegend-' + sId)
          .attr(
            'transform',
            'translate(' + 25 / 2 + ',' + 10 / 2 + ') scale(0.75)'
          );
      }
    },

    showTooltip: function(curveTooltipText) {
      if (curveTooltipText) {
        const tooltip = d3.select('#curvetooltip');
        tooltip.transition().duration(0).style('opacity', '1');
        tooltip.html(curveTooltipText);
      }
    },
    moveTooltip: function(e) {
      const tooltip = d3.select('#curvetooltip');
      tooltip
        .style('left', d3.pointer(e, this.svg.node())[0] + 'px')
        .style('top', d3.pointer(e, this.svg.node())[1] + 'px');
    },
    hideTooltip: function() {
      const tooltip = d3.select('#curvetooltip');
      tooltip.transition().duration(0).style('opacity', '0');
    },
    drawPlot: function(aData, aPoints, aProperties, aParameters) {
      // assign each different treatment a number for graph coloring
      // aData is the curveData
      // aPoints are the plotted measurements
      var that = this;

      var oCurveStyleMapping = this.createCurveStyleDictionary(aProperties);
      this.$emit('update-curve-styles', oCurveStyleMapping);

      var margin = {
        top: 40,
        right: this.hideLegend ? 50 : (this.legendAtBottom ? 100 : 500),
        bottom: this.legendAtBottom ? 250 : 50,
        left: 50
      };

      var width = this.minWidth - margin.left - margin.right;
      var height = this.minHeight - margin.top - margin.bottom;

      // scale x Axis for highest within all series
      //...or points, if there is no series
      let aDomain = aData.map((d, i) => d.length > 0 ? d : aPoints[i].map(p => [p.x, p.y]));
      var minDomain = this.kinobeads
        ? 0.1
        : d3.min(aDomain, function(d) {
          return d3.min(d, function(e) {
            return e[0];
          });
        });

      var x = this.logX
        ? d3
          .scaleLog()
          .domain([
            minDomain,
            d3.max(aDomain, function(d) {
              return d3.max(d, function(e) {
                return e[0];
              });
            })
          ])
          .range([0, width])
          .nice()
        : d3
          .scaleLinear()
          .domain([
            minDomain,
            d3.max(aDomain, function(d) {
              return d3.max(d, function(e) {
                return e[0];
              });
            })
          ])
          .range([0, width])
          .nice();

      var yMaxPoints = 0;

      var yMaxCurve = 0;
      yMaxPoints = d3.max(aPoints, function(d) {
        return d3.max(d, function(e) {
          return e.y;
        });
      });
      yMaxCurve = d3.max(aData, function(d) {
        return d3.max(d, function(e) {
          return e[1];
        });
      });
      var y = d3
        .scaleLinear()
        .domain([0, (yMaxPoints > yMaxCurve || !yMaxCurve) ? yMaxPoints : yMaxCurve])
        .range([height, 0])
        .nice();

      var xAxis;

      if (!this.logX) {
        xAxis = d3.axisBottom(x);
      } else {
        xAxis = d3
          .axisBottom(x)
          .ticks(this.kinobeads ? 10 : 8, function ticks(digit) {
            if (digit < 1) {
              return d3.format('1~e')(digit);
            } else {
              return d3.format('~s')(digit);
            }
          });
      }

      var yAxis = d3.axisLeft(y);

      var line = d3
        .line()
        .curve(d3.curveLinear)
        .x(function(d) {
          return x(d[0]);
        })
        .y(function(d) {
          return y(d[1]);
        });

      var svg = d3
        .select(this.$el)
        .append('svg')
        .attr('class', 'LinePlot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      this.svg = svg;

      svg = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      svg.append('g').attr('class', 'y axis').call(yAxis);

      // Lines - color for different treatments, dash style for different biological replicates
      if (this.bShowCurve) {
        svg
          .append('g')
          .attr('class', 'lines')
          .selectAll('.line')
          .data(aData)
          .enter()
          .append('path')
          .filter(function(f) {
            return f.filter(function(g) {
              return g[1] > 0;
            });
          })
          .attr('id', function(d, i) {
            let iterator = aProperties.length === 1 ? 0 : i;
            let postfix = aProperties[iterator].curveId || i;
            return 'plotLine-' + postfix;
          })
          .style('stroke', function(d, i) {
            let iterator = aProperties.length === 1 ? 0 : i;
            return oCurveStyleMapping[aProperties[iterator].curveId || i].color;
          })
          .style('stroke-dasharray', function(d, i) {
            let iterator = aProperties.length === 1 ? 0 : i;
            return oCurveStyleMapping[aProperties[iterator].curveId || i].dash;
          })
          .attr('d', line);

        //Add thicker invisible lines for better mouseover functionality
        const invisiblePath = svg
          .append('g')
          .attr('class', 'invisibleLines')
          .selectAll('.invisibleLines')
          .data(aData)
          .enter()
          .append('path')
          .filter(function(f) {
            return f.filter(function(g) {
              return g[1] > 0;
            });
          })
          .attr('d', line)
          .attr('id', function(d, i) {
            let iterator = aProperties.length === 1 ? 0 : i;
            let postfix = aProperties[iterator].curveId || i;
            return 'invisibleLine-' + postfix;
          });

        invisiblePath
          .attr('lineTooltip', function(d, i) {
            let iterator = aProperties.length === 1 ? 0 : i;
            return aProperties[iterator].lineTooltip;
          })
          .attr('dotTooltipTitle', function(d, i) {
            let iterator = aProperties.length === 1 ? 0 : i;
            return aProperties[iterator].dotTooltipTitle;
          })
          .on('mouseenter', function() {
            var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
            that.highlightMouseOver(sId, x, y);

            that.showTooltip(d3.select(this).attr('lineTooltip'));
          })
          .on('mousemove', function(e) {
            that.moveTooltip(e);
          })
          .on('mouseout', function() {
            var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
            that.unHighlightMouseOver(sId, x, y);

            that.hideTooltip();

          });


        if (!this.hideErrorBars && aParameters[0] && (aParameters[0]['ED50, inflection'] || aParameters[0]['inflection'])) {
          var errorGroup = svg
            .selectAll('g.error')
            .attr('class', 'errorGroup')
            .data(
              aParameters.map(function(x, i) {
                let iterator = aProperties.length === 1 ? 0 : i;
                let o = {
                  data: x['ED50, inflection'] || x['inflection'],
                  formula: that.getCurveFunction(aParameters[i]),
                  curveId: aProperties[iterator].curveId || i
                };

                if (that.kinobeads) {
                  o.errorInfo = that.oErrorbarInfo;
                }
                return o;
              })
            );

          // add elements
          var g1 = errorGroup
            .enter()
            .append('g')
            .filter(function(d) {
              return (
                x(d.data.value) < width &&
                x(d.data.value) > 0 &&
                y(d.formula(d.data.value)) > 0 &&
                y(d.formula(d.data.value)) < height
              );
            })
            .attr('class', 'errorBox');

          if (this.kinobeads) {
            g1.append('text')
              .text(function text(d) {
                return 'EC50: ' + d.errorInfo.value.toFixed(0) + ' nM';
              })
              .attr('text-anchor', function textAnchor(d) {
                var nTextWidth = this.getBBox().width;
                var nXPosition = x(
                  d3.max([0.1, d.errorInfo.value + d.std_error])
                );
                return nXPosition + nTextWidth > width ? 'end' : 'begin';
              })
              .attr('y', function getY(d) {
                return Math.max(y(d.errorInfo.y + 0.1), 0);
              })
              .attr('x', function getX(d) {
                return Math.min(
                  x(d3.max([0.1, d.errorInfo.value + d.errorInfo.std_error])),
                  width
                );
              });
          }

          var g = errorGroup
            .enter()
            .append('g')
            .filter(function(d) {
              return (
                x(d.data.value) < width &&
                x(d.data.value) > 0 &&
                y(d.formula(d.data.value)) > 0 &&
                y(d.formula(d.data.value)) < height
              );
            })
            .attr('class', 'errorLine');
          g.attr('id', function(d) {
            return 'errorLine-' + d.curveId;
          }).style('stroke', function(d) {
            return that.kinobeads
              ? 'orange'
              : oCurveStyleMapping[d.curveId].color;
          });

          // errorLine
          g.append('line').attr('class', 'errorLine');

          svg
            .selectAll('.errorLine')
            .attr('x1', function getX1(d) {
              var dPosition =
                x(d.data.value + d.data.std_error) - x(d.data.value);
              return x(d.data.value) - dPosition < 0
                ? 0
                : x(d.data.value) - dPosition;
            })
            .attr('y1', function getY1(d) {
              var fCurve = d.formula;
              return y(fCurve(d.data.value));
            })
            .attr('x2', function getX2(d) {
              return x(d.data.value + d.data.std_error) > width
                ? width
                : x(d.data.value + d.data.std_error);
            })
            .attr('y2', function getY2(d) {
              var fCurve = d.formula;
              return y(fCurve(d.data.value));
            });

          // rightLine
          g.append('line')
            .attr('class', 'end_right')
            .attr('x1', -1000)
            .attr('x2', -1000)
            .attr('y1', -1000)
            .attr('y2', -1000); // just accept it!

          var iPxOffSetErrorBar = 8;
          svg
            .selectAll('.end_right')
            .filter(function(d) {
              return x(d.data.value + d.data.std_error) < width;
            })
            .attr('x1', function getX1(d) {
              return x(d.data.value + d.data.std_error);
            })
            .attr('y1', function getY1(d) {
              // upper
              var fCurve = d.formula;
              return y(fCurve(d.data.value)) - iPxOffSetErrorBar;
            })
            .attr('x2', function getX2(d) {
              return x(d.data.value + d.data.std_error);
            })
            .attr('y2', function getY2(d) {
              var fCurve = d.formula;
              return y(fCurve(d.data.value)) + iPxOffSetErrorBar;
            });

          // leftLine
          g.append('line')
            .attr('class', 'end_left')
            .attr('x1', -1000)
            .attr('x2', -1000)
            .attr('y1', -1000)
            .attr('y2', -1000);

          svg
            .selectAll('.end_left')
            .filter(function(d) {
              var dPosition =
                x(d.data.value + d.data.std_error) - x(d.data.value);
              return x(d.data.value) - dPosition > 0;
            })
            .attr('x1', function getX1(d) {
              var dPosition =
                x(d.data.value + d.data.std_error) - x(d.data.value);
              return x(d.data.value) - dPosition;
            })
            .attr('y1', function getY1(d) {
              var fCurve = d.formula;
              return y(fCurve(d.data.value)) - iPxOffSetErrorBar;
            })
            .attr('x2', function getX2(d) {
              var dPosition =
                x(d.data.value + d.data.std_error) - x(d.data.value);
              return x(d.data.value) - dPosition;
            })
            .attr('y2', function getY2(d) {
              var fCurve = d.formula;
              return y(fCurve(d.data.value)) + iPxOffSetErrorBar;
            });

          // marker
          g.append('rect').attr('class', 'marker');

          svg
            .selectAll('.marker')
            .attr('x', function getX(d) {
              return x(d.data.value) - 2.5;
            })
            .attr('y', function getY(d) {
              var fCurve = d.formula;
              return y(fCurve(d.data.value)) - 2.5;
            })
            .attr('width', '5')
            .attr('height', '5')
            .attr('fill', function(d) {
              return that.kinobeads
                ? 'orange'
                : oCurveStyleMapping[d.curveId].color;
            });
        }
      }
      // title
      svg
        .append('text')
        .attr('class', 'Title')
        .attr('x', width / 2)
        .attr('y', -25)
        .attr('text-anchor', 'middle')
        .text(this.title);

      // Symbols - color for different treatments, symbol type for different biological replicates
      for (var i = 0; i < aPoints.length; i++) {
        if (aPoints[i].length > 0) {
          //If we do not show a curve, we connect the dots via a line
          if (this.drawLine) {
            svg
              .append('g')
              .attr('class', 'lines')
              .append('path')
              .attr('class', 'lines')
              .datum(aPoints[i].sort((a, b) => a.x - b.x))
              .attr('id', function(d, i) {
                let iterator = aProperties.length === 1 ? 0 : i;
                let postfix = aProperties[iterator].curveId || i;
                return 'plotLine-' + postfix;
              })
              .style('stroke', () => {
                let iterator = aProperties.length === 1 ? 0 : i;
                return oCurveStyleMapping[
                aProperties[iterator].curveId || i
                  ].color;
              })
              .attr('fill', 'none')
              .attr('stroke-width', 1.5)
              .attr('d', d3.line()
                .x(d => x(d.x))
                .y(d => y(d.y))
              );

            //Add thicker invisible lines for better mouseover functionality
            const invisibleLine = svg
              .append('g')
              .attr('class', 'invisibleLines')
              .append('path')
              .attr('class', 'invisibleLines')
              .datum(aPoints[i].sort((a, b) => a.x - b.x))
              .attr('id', function(d, i) {
                let iterator = aProperties.length === 1 ? 0 : i;
                let postfix = aProperties[iterator].curveId || i;
                return 'invisibleLine-' + postfix;
              })
              .attr('d', d3.line()
                .x(d => x(d.x))
                .y(d => y(d.y))
              );

            invisibleLine
              .attr('lineTooltip', function(d, i) {
                let iterator = aProperties.length === 1 ? 0 : i;
                return aProperties[iterator].lineTooltip;
              })
              .attr('dotTooltipTitle', function(d, i) {
                let iterator = aProperties.length === 1 ? 0 : i;
                return aProperties[iterator].dotTooltipTitle;
              })
              .on('mouseenter', function(e, d, i) {
                var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
                that.highlightMouseOver(sId, x, y);

                //These lines do not have an informative tooltip
                // that.showTooltip(d3.select(this).attr("lineTooltip"))
              })
              .on('mousemove', function(e) {
                that.moveTooltip(e);
              })
              .on('mouseout', function() {
                var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
                that.unHighlightMouseOver(sId, x, y);

                that.hideTooltip();

              });
          }
          svg
            .append('g')
            .attr('class', 'dots')
            .selectAll('.dot')
            .data(aPoints[i])
            .enter()
            .append('path')
            .attr('class', 'point')
            .attr('id', function() {
              let iterator = aProperties.length === 1 ? 0 : i;
              let postfix = aProperties[iterator].curveId || i;
              return 'dots-' + postfix;
            })
            .attr('ModelId', function() {
              let iterator = aProperties.length === 1 ? 0 : i;
              return aProperties[iterator].curveId;
            })
            .attr('d', function() {
              let iterator = aProperties.length === 1 ? 0 : i;
              return oCurveStyleMapping[
              aProperties[iterator].curveId || i
                ].marker;
            })
            .attr('transform', function(d) {
              return 'translate(' + x(d.x) + ',' + y(d.y) + ') scale(0.75)';
            })
            .on('mouseenter', function(e, d) {
              var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
              that.highlightMouseOver(sId, x, y);

              let dotTooltipTitle = d3.select('#invisibleLine-' + sId).attr('dotTooltipTitle');
              dotTooltipTitle = dotTooltipTitle ? dotTooltipTitle : '';

              that.showTooltip(dotTooltipTitle + `x=${that.exponentialX ? d.x.toExponential(1) : d.x.toPrecision(2)}, y=${d.y.toPrecision(4)} </pre>`);
            })
            .on('mousemove', function(e) {
              that.moveTooltip(e);
            })
            .on('mouseout', function() {
              var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
              that.unHighlightMouseOver(sId, x, y);
              that.hideTooltip();
            })
            .style('fill', function() {
              let iterator = aProperties.length === 1 ? 0 : i;
              return oCurveStyleMapping[
              aProperties[iterator].curveId || i
                ].color;
            });
        }
      }

      svg
        .append('text')
        .attr('class', 'x_label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 30)
        .text(this.xAxisLabel);

      svg
        .append('text')
        .attr('class', 'y_label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', 0 - height / 2)
        .text(
          this.yAxisLabel !== null
            ? this.yAxisLabel
            : aProperties[0].responseUnit
        );

      // Legend
      if (!this.hideLegend) {
        var LegendLineWidth = 25;
        var LegendRowHeight = 12;
        var LegendOffset = 6;
        var legend = svg
          .selectAll('.legend')
          .data(aProperties)
          .enter()
          .append('g')
          .attr('id', function(d, i) {
            return 'CETSALegend-' + i;
          })
          .attr('ModelId', function(d, i) {
            return d.curveId || i;
          })
          .attr('transform', (d, i) => {
            var combined = LegendRowHeight + LegendOffset;
            var x = this.legendAtBottom ? -10 : width + LegendOffset * 2;
            var y = combined * i + (this.legendAtBottom ? height + 40 : (height - aProperties.length * combined) / 2);
            return 'translate(' + x + ',' + y + ')';
          });

        legend
          .append('path')
          .attr('class', 'point')
          .attr('id', function(d, i) {
            let si = d.curveId || i;
            return 'dotsLegend-' + si;
          })
          .attr('d', function(d, i) {
            let si = d.curveId || i;
            return oCurveStyleMapping[si].marker;
          })
          .attr(
            'transform',
            'translate(' +
            LegendLineWidth / 2 +
            ',' +
            LegendRowHeight / 2 +
            ') scale(0.75)'
          )
          .style('fill', function(d, i) {
            let si = d.curveId || i;
            return oCurveStyleMapping[si].color;
          });

        legend
          .append('path')
          .attr('class', 'invisibleLines')
          .attr('id', function(d, i) {
            let si = d.curveId || i;
            return 'dotsLegendInvisible-' + si;
          })
          .attr('d', function(d, i) {
            let si = d.curveId || i;
            return oCurveStyleMapping[si].marker;
          })
          .attr(
            'transform',
            'translate(' +
            LegendLineWidth / 2 +
            ',' +
            LegendRowHeight / 2 +
            ') scale(0.75)'
          )
          .on('mouseover', function() {
            var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
            that.highlightMouseOver(sId, x, y);
            that.showTooltip(d3.select('#invisibleLine-' + sId).attr('lineTooltip'));
          })
          .on('mousemove', function(e) {
            that.moveTooltip(e);
          })
          .on('mouseout', function() {
            var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
            that.unHighlightMouseOver(sId, x, y);
            that.hideTooltip();
          });

        legend
          .append('line')
          .attr('x1', 0)
          .attr('id', function(d, i) {
            let si = d.curveId || i;
            return 'legendLine-' + si;
          })
          .attr('x2', LegendLineWidth)
          .attr('y1', LegendRowHeight / 2)
          .attr('y2', LegendRowHeight / 2)
          .style('stroke', function(d, i) {
            let si = d.curveId || i;
            return oCurveStyleMapping[si].color;
          })
          .style('stroke-dasharray', function(d, i) {
            let si = d.curveId || i;
            return oCurveStyleMapping[si].dash;
          });

        legend
          .append('text')
          .attr('x', LegendLineWidth + LegendOffset)
          .attr('y', LegendRowHeight - 1)
          .attr('class', 'legendText')
          .attr('id', function(d, i) {
            let si = aProperties[i].curveId || i;
            return 'legendText-' + si;
          })
          .text(function(d) {
            let sTreatment = d.TREATMENT || 'Replicate';
            return that.bCETSA
              ? sTreatment + ' ' + d.biologicalReplicate
              : sTreatment;
          })
          .on('mouseover', function() {
            //This does not seem to be ever triggered
            var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
            that.highlightMouseOver(sId, x, y);
            that.showTooltip(d3.select('#invisibleLine-' + sId).attr('lineTooltip'));
          })
          .on('mousemove', function(e) {
            that.moveTooltip(e);
          })
          .on('mouseout', function() {
            var sId = d3.select(this).attr('id').split('-')[1]; // next time: we do data binding correctly
            that.unHighlightMouseOver(sId, x, y);
            that.hideTooltip();
          });
      }
      /* TODO: convert this to Vue.js
      for (i = 0; i < aProperties.length; i++) {
        $('#CETSALegend-' + i).tipsy({
          gravity: 's',
          html: true,
          title: function title() {
            var sTreatment = 'Inhibitor: ' + this.__data__.TREATMENT + '<br>';
            var sBioRep = 'biological Replicate: ' + this.__data__.biologicalReplicate + '<br>';
            var sTechRep = 'technical Replicate: ' + this.__data__.technicalReplicate;
            return sTreatment + sBioRep + sTechRep;
          }
        });
      }

      for (i = 0; i < aParameters.length; i++) {
        $('#BoxTipsy-' + i).tipsy({
          gravity: 's',
          html: true,
          title: function title() {
            var text1 = 'Treatment: ' + this.__data__[1].TREATMENT + '<br>';
            var text2 = 'EC50: ' + this.__data__[0]['ED50, inflection'].value.toFixed(2);
            var text3 = ' ' + aProperties[0].doseUnit; + '<br>';
            return text1 + text2 + text3;
          }
        });
      }*/
    },
    init: function() {
      // create Curve Function
      var aParameters = this.curveParameters;
      var aDataPoints = this.dataPoints;

      var aProperties = this.properties;
      var aPoints = [];
      d3.select(this.$el).selectAll('svg').remove();

      if (aParameters) {
        // we need smallest value possible not zero and make it one dimension smaller
        aDataPoints = aDataPoints.map(function(curve) {
          var minimalXValue = d3.min(
            curve.filter(function(d) {
              return d[0] > 0;
            }),
            function(d) {
              return d[0];
            }
          );
          minimalXValue = minimalXValue / 10;
          return curve.map(function(d) {
            return d[0] === 0 ? [minimalXValue, d[1]] : d;
          });
        });

        if (aParameters.filter((p) => p.Slope !== undefined).length > 0) {
          this.bShowCurve = !(
            aParameters.filter((p) => p.Slope.value < 0).length > 0 &&
            this.kinobeads
          );
        }
        // Series Array for multiple Curves
        var aSeries = [];
        // add Curve Datasets for each dataset
        for (var i = 0; i < aParameters.length; i++) {
          aSeries.push(
            this.calculateCurvePoints(aParameters[i], aDataPoints[i])
          );
          var fCurve = this.getCurveFunction(aParameters[i]);
          if (this.kinobeads) {
            this.oErrorbarInfo = aParameters[i]['ED50, inflection'];
            this.oErrorbarInfo.y = fCurve(this.oErrorbarInfo.value);
          }
        }
        // calculate Data Points
        if (aDataPoints && aDataPoints.length > 0) {
          for (i = 0; i < aDataPoints.length; i++) {
            if (aDataPoints[i] && aDataPoints[i].length > 0) {
              if (!this.ratioY) {
                aPoints.push(
                  //Only add points where the dose is > 0.
                  // Since in aDataPoints these have already been modified, we need to look into the original
                  // object
                  this.dataPoints[i].filter((d) => d[0] > 0)
                    .map(function(d) {
                      return {
                        x: d[0],
                        y: d[1]
                      };
                    })
                );
              } else {
                aPoints.push(this.calculateRatio(aDataPoints[i], i));
              }
            } else {
              aPoints.push([]);
            }
          }
        }
        // Draw Plot with fitted Curve and actual Data Points
        if (aProperties.length >= 1) {
          if (aProperties[0].singles) {
            this.bCETSA = true;
            this.drawPlot(
              aSeries,
              aPoints,
              aProperties[0].singles,
              aParameters
            );
          } else {
            this.drawPlot(aSeries, aPoints, aProperties, aParameters);
          }
        }
      }
      this.createTooltip();
    },
    calculateRatio: function(aData, iter) {
      var aResult = [];
      var i = 0;
      var nCompare;
      aData = aData.sort(function compare(a, b) {
        // sort Points to have x = 0 in first position
        return a[0] - b[0];
      });
      // find if upgoing curve
      if (this.turnover) {
        var bUp = aData[0][1] < aData[aData.length - 1][1];
      }
      var iteration = this.properties.length === 1 ? 0 : iter;
      var bNormalized = this.properties[iteration].calculationMethod === 4; // 4 means normalized intensities
      if (this.turnover) {
        nCompare = bUp ? aData[aData.length - 1][1] : aData[0][1];
      } else {
        nCompare = Math.pow(10, aData[0][1]);
        // change 0 to 0.1, because log 0 becomes -Infinity and we want to see the control point in the plot
        aResult[0] = {
          x: 0.1,
          y: 1
        };
        i++;
      }

      for (i; i < aData.length; i++) {
        aResult[i] = {
          x: aData[i][0],
          y: this.turnover
            ? aData[i][1] / nCompare
            : bNormalized
              ? aData[i][1]
              : Math.pow(10, aData[i][1]) / nCompare
        };
      }

      return aResult;
    },
    createTooltip: function() {
      //Remove tooltip if present
      d3.select('#curvetooltip').remove();

      d3
        .select('.lineplotClass')
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', 'curvetooltip')
        .style('max-width', '600px')
        .style('opacity', '0');
    },

    getSVG: function() {
      return d3.select(this.$el).selectAll('svg').node();
    }
  },

  mounted: function() {
    this.init();
  }
};
</script>

<style>
@import "./GenericLinePlot.css.prdb";

.tooltip {
  position: absolute;
  text-align: center;
  background-color: white;
  border: solid;
  border-width: 1px;
  border-radius: 5px;
  padding: 10px;
  pointer-events: none;
  font-size: 10pt;
  color: #252525;
}
</style>

