<template>
  <div>
    <div class='barplotClass'></div>
    <v-btn
      x-small
      class='barPlotClearSelectionButton'
      v-if='multiSelection'
      @click='clearSelectedBars'
      :disabled='
        !this.selectedModelIds || this.selectedModelIds.data.length == 0
      '
    >
      Clear selection
    </v-btn>
  </div>
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
      default: 300
    },
    barWidth: {
      type: Number,
      default: 11
    },
    data: {
      type: Object,
      default: undefined
    },
    sSelectedModelIds: {
      // protein selected through Dropdown
      type: Object,
      default: undefined
    },
    title: {
      type: String,
      default: undefined
    },
    multiSelection: {
      type: Boolean,
      default: true
    }
  },
  data: function() {
    return {
      selectedModelIds: null
    };
  },
  watch: {
    data: function(newData) {
      this.drawPlot(newData);
    },
    sSelectedModelIds: function(newIds) {
      this.selectedModelIds = newIds;
    }
  },
  methods: {
    onModelSelected: function(obj) {
      this.$emit('send-message', obj);
    },
    convertEC50topEC50: function(nValue) {
      return nValue;
    },
    clearSelectedModelIds: function() {
      this.selectedModelIds = { data: [] };
    },
    clearSelectedBars: function() {
      this.clearSelectedModelIds();
      d3.selectAll('.Bar').attr('class', 'Bar');
      d3.selectAll('.BackgroundBar').attr('class', 'BackgroundBar');
      this.$emit('clear-selection');

      this.onModelSelected({
        AttributeType: this.data.AttributeType,
        SelectedModelIds: this.selectedModelIds
      });
    },
    drawPlot: function(oData) {
      this.clearSelectedModelIds();

      var that = this;
      oData.data = oData.data.sort(function(a, b) {
        return (
          that.convertEC50topEC50(b.VALUE) - that.convertEC50topEC50(a.VALUE)
        );
      });

      var margin = {
        top: 60,
        right: 230,
        bottom: 120,
        left: 50
      };

      oData.data
        .map(function(e) {
          return e.ModelId.split(';');
        })
        .reduce(function(prev, next) {
          return prev.concat(next);
        }, []);

      var bSameDrug = !!oData.data.reduce(function(a, b) {
        return a.DrugId === b.DrugId ? a : NaN;
      });

      var bSameCellLine = !!oData.data.reduce(function(a, b) {
        return a.CellLineId === b.CellLineId ? a : NaN;
      });

      var height = this.minHeight - margin.top - margin.bottom;
      var width = Math.max(
        oData.data.length * this.barWidth,
        d3.select(this.$el).attr('width')
      );
      d3.select(this.$el).selectAll('svg').remove();

      var svg = d3
        .select(this.$el)
        .append('svg')
        .attr('class', 'BarContainer')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      this.svg = svg;

      //  legend
      svg.append('g');

      var content = svg
        .append('g')
        .attr(
          'transform',
          'translate(' + margin.left + ', ' + margin.top + ')'
        );

      // Y-AXIS
      var minY = d3.min(oData.data, function(d) {
        return d.MIN_VALUE > 0 && d.VALUE > 0 ? 0 : d.MIN_VALUE;
      });

      var maxY = d3.max(oData.data, function(d) {
        return d.MAX_VALUE < 0 ? 0 : d.MAX_VALUE;
      });

      var y = d3.scaleLinear().domain([minY, maxY]).range([height, 0]).nice();

      var yAxis = d3.axisLeft().scale(y);
      // .orient('left')

      content
        .append('g')
        .attr('class', 'y axis')
        .attr('height', height)
        .call(yAxis)
        .selectAll('text')
        .attr('y', 4)
        .attr('x', -10)
        .style('font-family', 'Arial,Helvetica,sans-serif')
        .style('font-size', '12px')
        .style('text-anchor', 'end');

      content
        .append('text')
        .attr('class', 'AxisTitle')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -40)
        .text(oData.AttributeType);

      // DATA BARS
      var bars = content.append('g');
      var bar = bars
        .selectAll('g')
        .data(oData.data)
        .enter()
        .append('g')
        .attr('transform', (d, i) => {
          return 'translate(' + (i * this.barWidth + 1) + ', 0)';
        });

      // clickBar
      bar
        .append('rect')
        .attr('class', function() {
          return 'BackgroundBar';
        })
        .attr('height', height)
        .attr('width', this.barWidth - 1)
        .attr('ModelId', function(d) {
          return d.ModelId;
        });

      // store bars in chartObjects
      this.data.chartObjects = {};
      this.data.chartObjects.bars = bar
        .append('rect')
        .attr('class', function() {
          return 'Bar';
        })
        .attr('height', function(d) {
          var startingPoint;
          if (minY < 0) {
            startingPoint = y(0);
          } else {
            startingPoint = y(minY);
          }
          if (d.VALUE < 0) {
            return y(that.convertEC50topEC50(d.VALUE)) - startingPoint;
          }
          return startingPoint - y(that.convertEC50topEC50(d.VALUE));
        })
        .attr('width', this.barWidth - 1)
        .attr('y', function(d) {
          if (d.VALUE < 0) {
            return y(0);
          }
          return y(that.convertEC50topEC50(d.VALUE));
        })
        .attr('ModelId', function(d) {
          return d.ModelId;
        });

      bar
        .append('a')
        .attr('target', '_blank')
        .append('text')
        .attr('x', 2)
        .attr('y', height + 3)
        .attr('dy', '.75em')
        .attr('class', 'Label')
        .attr('transform', 'rotate(-65 0,' + (height + 3) + ')')
        .text(function(d) {
          if (d.Dataset) {
            return d.Dataset;
          }
          var labelText = !bSameDrug ? d.Drug : '';
          labelText += !bSameDrug && !bSameCellLine ? ' : ' : '';
          labelText += !bSameCellLine ? d.CellLine : '';
          return labelText;
        });
      // clickBar
      let barRect = bar
        .append('rect')
        .attr('class', () => {
          return 'ClickBar';
        })
        .attr('id', (d, i) => {
          return 'ClickTipsy-' + i;
        })
        .attr('height', height)
        .attr('width', this.barWidth - 1)
        .attr('ModelId', function(d) {
          return d.ModelId;
        })
        .on('mouseover', function() {
          d3.select(this).style('cursor', 'pointer');
          d3.select(this).attr('class', 'ClickBar Highlight');
        })
        .on('mouseout', function() {
          d3.select(this).style('cursor', 'default');
          d3.select(this).attr('class', 'ClickBar');
        });

      //TPS Explorer uses d3v6, ProteomicsDB uses D3v5. This if/else makes the component compatible with both
      if (d3.version.startsWith(6)) {
        barRect.on('click', (clickEvent, f) => onBarClick(that, f));
      } else {
        barRect.on('click', (f) => onBarClick(that, f));
      }

      function onBarClick(that, f) {
        var oSelectedModelIds = that.selectedModelIds;
        if (oSelectedModelIds) {
          var aSelectedModelIds = oSelectedModelIds.data;
          if (
            aSelectedModelIds.some(function(modelIdsEntry) {
              return modelIdsEntry === f.ModelId;
            })
          ) {
            d3.selectAll('.Bar')
              .filter(function(e) {
                return e.ModelId === f.ModelId;
              })
              .attr('class', 'Bar');

            d3.selectAll('.BackgroundBar')
              .filter(function(e) {
                return e.ModelId === f.ModelId;
              })
              .attr('class', 'BackgroundBar');

            that.selectedModelIds = {
              // remove it
              data: aSelectedModelIds.filter(function(e) {
                return e !== f.ModelId;
              })
            };
          } else {
            if (that.multiSelection) {
              d3.selectAll('.Bar')
                .filter(function(e) {
                  return e.ModelId === f.ModelId;
                })
                .attr('class', 'Bar BetterValue');

              d3.selectAll('.BackgroundBar')
                .filter(function(e) {
                  return e.ModelId === f.ModelId;
                })
                .attr('class', 'BackgroundBar Highlight');

              aSelectedModelIds.push(f.ModelId);
            } else {
              // first deselect
              d3.selectAll('.Bar').attr('class', 'Bar');
              d3.selectAll('.BackgroundBar').attr('class', 'BackgroundBar');
              // then select the new one and set it as single element array
              d3.selectAll('.Bar')
                .filter(function(e) {
                  return e.ModelId === f.ModelId;
                })
                .attr('class', 'Bar BetterValue');
              d3.selectAll('.BackgroundBar')
                .filter(function(e) {
                  return e.ModelId === f.ModelId;
                })
                .attr('class', 'BackgroundBar Highlight');
              aSelectedModelIds = [f.ModelId];
            }
            that.selectedModelIds = {
              // adding stuff
              data: aSelectedModelIds
            };
          }
        } else {
          d3.selectAll('.Bar')
            .filter(function(e) {
              return e.ModelId === f.ModelId;
            })
            .attr('class', 'Bar BetterValue');
          d3.selectAll('.BackgroundBar')
            .filter(function(e) {
              return e.ModelId === f.ModelId;
            })
            .attr('class', 'BackgroundBar Highlight');
          that.selectedModelIds = {
            data: [f.ModelId]
          };
        }

        that.onModelSelected({
          AttributeType: oData.AttributeType,
          SelectedModelIds: that.selectedModelIds
        });
      }

      bar.append('line').attr('class', 'pointer');
      bar.append('line').attr('class', 'end_left');
      bar.append('line').attr('class', 'end_right');

      bar
        .selectAll('line.pointer')
        .attr('x1', function pointerGetX1(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return 6;
          }
          return null;
        })
        .attr('y1', function pointerGetY1(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return y(d.MIN_VALUE);
          }
          return null;
        }) // 6 is middle of 11 (height of bars)
        .attr('x2', function pointerGetX2(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return 6;
          }
          return null;
        })
        .attr('y2', function pointerGetY2(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return y(d.MAX_VALUE);
          }
          return null;
        })
        .style('stroke', 'black')
        .style('stroke-width', '1px');

      bar
        .selectAll('line.end_left')
        .attr('x1', function endLeftGetX1(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return 0;
          }
          return null;
        })
        .attr('y1', function endLeftGetY1(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return y(d.MIN_VALUE);
          }
          return null;
        })
        .attr('x2', function endLeftGetX2(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return 11;
          }
          return null;
        })
        .attr('y2', function endLeftGetY2(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return y(d.MIN_VALUE);
          }
          return null;
        })
        .style('stroke', 'black')
        .style('stroke-width', '1px');

      bar
        .selectAll('line.end_right')
        .attr('x1', function endLeftGetX1(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return 0;
          }
          return null;
        })
        .attr('y1', function endLeftGetY1(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return y(d.MAX_VALUE);
          }
          return null;
        })
        .attr('x2', function endLeftGetX2(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return 11;
          }
          return null;
        })
        .attr('y2', function endLeftGetY2(d) {
          if (d.MIN_VALUE < d.MAX_VALUE) {
            return y(d.MAX_VALUE);
          }
          return null;
        })
        .style('stroke', 'black')
        .style('stroke-width', '1px');

      var title = svg
        .append('text')
        .attr('class', 'Title')
        .attr('x', margin.left)
        .attr('y', 28)
        .attr('text-anchor', 'start')
        .text(this.title);

      /* TODO: convert this to Vue.js
      for (i = 0; i < oData.data.length; i++) {
          $('#ClickTipsy-' + i).tipsy({
              gravity: 's',
              html: true,
              title: function() {
                  return 'cell line: ' + this.__data__.CellLine + '<br>' + 'drug: ' + this.__data__.Drug + '<br>'; // .value.toFixed(2) + " " + aProperties[0]["doseUnit"];+ '<br>';
              }
          });
      }*/

      this.expandChartSizeToTitle(svg, title, width, margin);
    },
    expandChartSizeToTitle: function(svg, d3Title, width, margin) {
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
    getBarStyleClasses: function() {
      var sClasses = 'Bar';
      return sClasses;
    },

    getLegendStyleClass: function(i) {
      var aClass = [
        'BetterValue',
        'SelectedModelIds',
        'AtMostTenfold',
        'MoreThanTenfold'
      ];
      return aClass[i];
    },

    getLegendText: function(i) {
      var aTexts = ['< 1', '= 1 (target protein)', '1 - 10', '> 10'];
      return aTexts[i];
    },

    getLegendTransformation: function(i) {
      var aTransformation = [15, 30, 45, 60];
      return aTransformation[i];
    },

    deletePlot: function() {
      d3.select(this.$el).selectAll('svg').remove();
    },

    getLegendHeight: function() {
      return 75;
    }
  },
  mounted: function() {
    this.deletePlot();

    var oData = this.data;
    if (!oData || !oData.data) {
      return;
    }

    this.drawPlot(oData);
  }
};
</script>


<style scss>
@import "./GenericBarPlot.css.prdb";

.barPlotClearSelectionButton {
  position: absolute !important;
  margin-top: 32px;
  margin-left: 50px;
}

</style>
