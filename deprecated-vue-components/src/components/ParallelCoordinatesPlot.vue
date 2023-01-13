<template>
  <div id="parcoords" class="parcoords"></div>
</template>

<script>
import "parcoord-es/dist/parcoords.css";
import ParCoords from "parcoord-es";

const d3 = require("d3");

export default {
  props: {
    plotWidth: {
      type: Number,
      default: 600,
    },
    plotHeight: {
      type: Number,
      default: 400,
    },
    chartData: {
      type: Array,
      default: undefined,
    },
    propertyPath: {
      type: String,
      default: "ModelId",
    },
    dataPath: {
      type: String,
      default: "data",
    },
    valuePath: {
      type: String,
      default: "VALUE",
    },
    fontFamily: {
      type: String,
      default: "Arial,Helvetica,sans-serif",
    },
    fontSize: {
      type: String,
      default: "12px",
    },
    resolution: {
      type: Number,
      default: 20,
    },
    interpolation: {
      type: String,
      // alternative: step-before
      default: "basis",
    },
    selectedElement: {
      type: String,
      default: undefined,
    },
    plotLabelValue: {
      type: String,
      default: "AttributeType",
    },
    simpleLabel: {
      type: Boolean,
      default: false,
    },
    keyValue: {
      type: String,
      default: "AttributeType",
    },
    clippedSelectionLine: {
      type: Boolean,
      default: false,
    },
    minimalModelId: {
      type: String,
      default: "-10",
    },
    title: {
      type: String,
      default: undefined,
    },
  },

  data: function () {
    return {
      selectedKey : undefined
    }
  },

  methods: {
    fireKeyChange: function () {
      this.$emit("keyChange", this.selectedKey);
    },
    fireSelectedLinesChange: function(selectedLines){
      this.$emit("selectedLinesChange", selectedLines)
    },
    drawPlot: function () {
      var that = this;

      d3.select(this.$el).selectAll("svg").remove();

      if (this.chartData && this.chartData.length > 0) {
        var dat = this.chartData;
        var aParameters = dat.map(function (d) {
          return d.AttributeType;
        });
        // sorter necessary - db delivers non sorted
        // ic 50 array in different order than BIC array
        for (var i = 0; i < dat.length; i++) {
          dat[i].data = dat[i].data.sort(function (a, b) {
            //There might be multiple modelIds, separated by ';' - these are ALSO not sorted
            //So split them, sort them, and take the first one - then compare the two
            let aFirstModelId = a.ModelId.split(";").sort()[0];
            let bFirstModelId = b.ModelId.split(";").sort()[0];
            return parseInt(aFirstModelId) - parseInt(bFirstModelId);
          });
        }

        var models = dat[0].data.map(function (d) {
          return d.ModelId;
        });

        // extract values
        var g = dat.map(function (d) {
          return d.data.map(function (e) {
            return e.VALUE;
          });
        });
        var z = g.reduce(function (prev, next) {
          return next.map(function (item, i) {
            return (prev[i] || []).concat(next[i]);
          });
        }, []);

        z = z.map(function (d) {
          var obj = {};
          aParameters.forEach(function (e, i) {
            obj[e] = d[i];
          });

          return obj;
        });

        var dimensions = {};

        aParameters.forEach(function (e) {
          dimensions[e] = {
            type: "number",
          };
        });

        var pc = ParCoords()(this.$el)
          .data(z)
          .height(this.plotHeight)
          .width(this.plotWidth)
          .margin({
            top: 50,
            left: 0,
            right: 0,
            bottom: 50,
          })
          .dimensions(dimensions)
          .render()
          .createAxes()
          .alpha(0.45)
          .brushMode("1D-axes")
          .alphaOnBrushed(0.1)
          .on("brushend", function (d) {
            var idx = d.map(function (h) {
              return z.indexOf(h);
            });
            var modelids = idx.map(function (d) {
              return models[d];
            });

            var selectedLines =
              modelids.length === 0
                ? ""
                : modelids.reduce(function (prev, next) {
                    return prev + ";" + next;
                  });

            that.fireSelectedLinesChange(selectedLines);
          }); // command line mode;

        var radioButtonGroup = d3
          .select(this.$el)
          .select("svg")
          .attr("style", "position:relative")
          .append("g")
          .selectAll("circle")
          .data(aParameters)
          .enter()
          .append("g");

        radioButtonGroup
          .append("circle")
          .attr("cx", function (d) {
            return pc.xscale(d);
          })
          .attr("cy", "370")
          .attr("r", 10)
          .style("fill", "white");

        radioButtonGroup
          .append("circle")
          .attr("class", "radioFakeInner")
          .attr("cx", function (d) {
            return pc.xscale(d);
          })
          .attr("cy", "370")
          .attr("r", 4)

          .style("fill", function (d) {
            return that.selectedKey === d ? "#007dbb" : "white";
          });

        let radioButtonOuter = radioButtonGroup
          .append("circle")
          .attr("class", "radioButton outerButton")
          .attr("cx", function (d) {
            return pc.xscale(d);
          })
          .attr("cy", "370")
          .attr("r", 10)
          .on("mouseover", function () {
            d3.select(this).style("stroke", "#007dbb");
            d3.select(this).style("stroke-width", 4);
          })
          .on("mouseout", function () {
            d3.select(this).style("stroke", "grey");
            d3.select(this).style("stroke-width", 2);
          });
        radioButtonOuter.on("click", function (d, key) {
          that.selectedKey = key;
          d3.selectAll(".radioFakeInner").style("fill", "white");
          d3.selectAll(".radioFakeInner")
            .filter(function (e) {
              return key == e;
            })
            .style("fill", "#007dbb");
          that.fireKeyChange();
        });

        // move labels
        d3.selectAll("text.label").attr("transform", "translate(0,-15)");
        this.selectDefaultKey();
      }
    },
    selectDefaultKey: function () {
      if (this.chartData.length > 0) {
        if (!this.selectedKey) {
          this.selectedKey = this.chartData[0].AttributeType;
        }
        var that = this;
        d3.selectAll(".radioFakeInner").style("fill", "white");
        d3.selectAll(".radioFakeInner")
          .filter(function (e) {
            return that.selectedKey == e;
          })
          .style("fill", "#007dbb");
        this.fireKeyChange();
      }
    },
  },
  watch: {
    chartData: {
      handler: function(newValue, oldValue){
        if(JSON.stringify(newValue) !== JSON.stringify(oldValue))
          this.drawPlot();
      },
      deep: true
    }
  },

  mounted: function () {
    this.drawPlot();
  },
};
</script>

<style>
.parcoords > canvas {
  font: 14px sans-serif;
  position: absolute;
}
.parcoords > canvas {
  pointer-events: none;
}
.parcoords text.label {
  cursor: default;
  font-weight: bold;
}
.parcoords rect.background:hover {
  fill: rgba(120, 120, 120, 0.2);
}
.parcoords canvas {
  opacity: 1;
  transition: opacity 0.3s;
  -moz-transition: opacity 0.3s;
  -webkit-transition: opacity 0.3s;
  -o-transition: opacity 0.3s;
}
.parcoords canvas.faded {
  opacity: 0.25;
}
.parcoords {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  /*background-color: #f2f2f2;*/
}

.radioButton {
}

.radioButton .backGroundButton {
}

.radioButton .innerButton {
}

.outerButton {
  fill: transparent;
  stroke-width: 2;
  stroke: grey;
}
</style>
