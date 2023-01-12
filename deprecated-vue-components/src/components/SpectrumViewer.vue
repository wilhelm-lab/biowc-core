<template>
  <v-container fluid class="spectrum-viewer">
    <v-row>
      <div id="spectrumViewerId"></div>
    </v-row>
  </v-container>
</template>

<script>
const d3 = require("d3v3");
import d3Tip from "d3-tip";
d3.tip = d3Tip;

export default {
  props: {
    defaultheight: {
      type: Number,
      default: 750,
    },
    height: {
      type: Number,
      default: 550,
    },
    plotdata: {
      type: Object,
    },
    mirrorplotdata: {
      type: Object,
    },
    peptide: {
      type: Object,
    },
    peptideBottom: {
      type: Object,
    },
    settings: {
      type: Object,
    },
    score: {
      type: Object,
    },
    scoreTop: {
      type: Object,
    },
    scoreBottom: {
      type: Object,
    },
  },
  data: function () {
    return {
      subscript: [
        "\u2080",
        "\u2081",
        "\u2082",
        "\u2083",
        "\u2084",
        "\u2085",
        "\u2086",
        "\u2087",
        "\u2088",
        "\u2089",
        "\u208B",
      ],
      superscript: [
        "\u2070",
        "\u00B9",
        "\u00B2",
        "\u00B3",
        "\u2074",
        "\u2075",
        "\u2076",
        "\u2077",
        "\u2078",
        "\u2079",
        "\u207B",
      ],
      ionizationMode: "+",
      tip: d3.tip().attr("class", "d3-tip").offset([0, 0]),
    };
  },
  watch: {
    plotdata: function () {
      this.redraw();
    },
    mirrorplotdata: function () {
      this.redraw();
    },
    peptide: function () {
      this.redraw();
    },
    peptideBottom: function () {
      this.redraw();
    },
    settings: function () {
      this.redraw();
    },
    score: function () {
      this.redraw();
    },
    scoreTop: function () {
      this.redraw();
    },
    scoreBottom: function () {
      this.redraw();
    },
  },
  methods: {
    redraw: function () {        
      if (this.peptide !== undefined) {
        this.clearOldLines();
        // draws the peptide sequence with the locations of bond breakages marked
        this.drawInteractiveTitle();
        this.drawInteractiveTitleBottom();
        // draws the text elements which list precursor m/z, charge state, and # fragmented bonds.
        this.drawPrecursorSummary();
        this.drawCorrelationSummary();
        this.drawCorrelationSummary(false);
        this.drawOriginSummary();
        this.drawOriginSummary(false);
        // draws the elements contained in the annotated mass spectrum
        this.drawAnnotation();
        // draws the elements contained in the mass error scatterplot.
        this.drawMassError();
      }
    },
    clearOldLines: function () {
      var dataset = d3
        .select("#annotationContainer")
        .selectAll(".line")
        .data([]);
      dataset.exit().remove();
    },
    drawMassError: function () {
      var that = this;
      var x,
        y,
        xAxis,
        yAxis,
        dummyXAxis,
        dummyYAxis,
        massErrorLabel,
        shiftFactor,
        options = this.getOptions(),
        xValues = this.getMassErrorX(),
        yValues = this.getMassError(),
        colors = this.getColors(),
        settings = this.getSettings(),
        labels = this.getLabels(),
        sequence = this.getSequence(),
        theoMz = this.getTheoreticalMz(),
        neutralLosses = this.getNeutralLosses(),
        sequenceBottom = this.getSequenceBottom();
      var intensityError = this.getIntensityError();
      var intensityErrorScale = d3.scale
        .linear()
        .domain([d3.min(intensityError), d3.max(intensityError)])
        .range([0, 1]);

      // if x and y values are empty, initialize them to an empty array to squash an error caused by a race condition on page render
      if (isNaN(d3.max(xValues))) {
        xValues = [0];
      }
      if (isNaN(d3.max(yValues))) {
        yValues = [0];
      }
      if (xValues && yValues) {
        // extract what type of mass error we're looking at (ppm or Da)
        massErrorLabel = settings.toleranceType;

        // if we're looking at milliDalton mass error levels, shift the scale by a factor of 1000 to have more meaningful units.
        shiftFactor = 1;
        if (massErrorLabel === "Da" && settings.toleranceThreshold < 1) {
          massErrorLabel = "mDa";
          shiftFactor = 1000;
        }

        // add a fudge factor to prevent svg elements from getting cut off by the clip mask
        var xScaleFudgeFactor = (d3.max(xValues) - d3.min(xValues)) * 0.025;

        // define x and y scales.
        x = d3.scale
          .linear()
          .domain([
            d3.min(xValues) - xScaleFudgeFactor,
            d3.max(xValues) + xScaleFudgeFactor,
          ])
          .range([0, options.fragments.width], 0);
        y = d3.scale
          .linear()
          .domain([d3.max(yValues) + 1, d3.min(yValues) - 1])
          .range([options.fragments.height, 0]);

        // here we define 4 scales instead of just 2. the dummy axes are only used to encapsulate the mass error chart in borders.
        xAxis = d3.svg.axis().scale(x).orient("top").ticks(10);
        yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
        dummyXAxis = d3.svg.axis().scale(x).orient("top").tickValues([]);
        dummyYAxis = d3.svg.axis().scale(y).orient("left").tickValues([]);

        var plotData = [];

        // Prevent non-annotated spectral features from displaying mass error circles
        for (var i = 0; i < xValues.length; i++) {
          // format our data for easy D3 visualization
          // here we need the IDs
          // TODO: do it tobi
          plotData.push({
            mz: xValues[i],
            theoMz: theoMz[i],
            top_id: this.getIntensityErrorIdsTop()[i],
            bottom_id: this.getIntensityErrorIdsBottom()[i],
            neutLoss: this.formatNeutralLoss(neutralLosses[i]),
            error: yValues[i] * shiftFactor,
            color: yValues[i] === 0 ? "grey" : "black",
            radius: 1.5 + intensityErrorScale(intensityError[i]) * 3,
            intensityDifference: intensityError[i],
            topId: this.getIntensityErrorIdsTop()[i],
            bottomId: this.getIntensityErrorIdsBottom()[i],
          });
        }

        // give the y-axis a label based on the mass error unit
        massErrorLabel = this.fragmentContainer
          .selectAll(".yAnnotationLabel")
          .text("Error (" + massErrorLabel + ")");

        // base transition delay on the number of elements visualized
        var delay = 1250 / plotData.length;

        // bind axes to the fragmentContainer
        this.fragmentContainer.selectAll("g.xAnnotation").call(xAxis);
        this.fragmentContainer.selectAll("g.yAnnotation").call(yAxis);
        this.fragmentContainer
          .selectAll("g.xAnnotation_2")
          .attr("transform", "translate(0, " + options.fragments.height + ")")
          .call(dummyXAxis);
        this.fragmentContainer
          .selectAll("g.yAnnotation_2")
          .attr("transform", "translate(" + options.fragments.width + ",0)")
          .call(dummyYAxis);

        // bind plotData to the chart to be rendered into circles by D3
        this.circleDataset = this.massErrorContainer
          .selectAll(".masserror")
          .data(plotData);
        this.circleDataset.enter().append("circle").attr("class", "masserror");

        // actually render the circles and transition them in
        this.circleDataset
          .attr("cy", function () {
            return y(0);
          })
          .style("fill", function (d) {
            return d.color;
          })
          .attr("cx", function (d) {
            return x(d.mz);
          })
          .attr("r", function (d) {
            return d.radius;
          })
          .attr("opacity", 0)
          .transition()
          .delay(function (d, i) {
            return i * delay;
          })
          .duration(1250)
          .attr("cy", function (d) {
            return y(d.error);
          })
          .attr("opacity", 1);

        // remove unneeded circles
        this.circleDataset.exit().remove();

        // create a linear function
        var line = d3.svg
          .line()
          .x(function (d) {
            return x(d.x);
          })
          .y(function (d) {
            return y(d.y);
          })
          .interpolate("linear");

        // Define the points
        var baseLine = [
          {
            lineData: [
              { x: x.domain()[0], y: 0 },
              { x: x.domain()[1], y: 0 },
            ],
            color: "#A9A9A9",
          },
        ];

        // draw the zero line
        var dataset = this.massErrorContainer
          .selectAll(".zeroline")
          .data(baseLine);
        dataset.enter().append("path").attr("class", "zeroline");

        dataset
          .attr("d", function (d) {
            return line(d.lineData);
          })
          .attr("opacity", 0)
          .style("stroke", function (d) {
            return d.color;
          })
          .transition()
          .duration(1500)
          .attr("opacity", 1);

        dataset.exit().remove();

        // attach the tooltip to the fragmentContainer
        this.fragmentContainer.call(that.tip);

        // bind interactive events. When a circle is highlighted, emphasize the mass error circle, indicate the fragement amino acid sequence, highlight the annotation label.
        this.circleDataset.on("mouseenter", function (d, i) {
          var label = labels[i];
          //var charge = labelCharges[i];
          //var neutralLoss = neutralLosses[i];

          let fitting_top_peak = that.plotContainer
            .selectAll(".bar")
            .filter(function (e) {
              return e.id == d.top_id;
            });
          let fitting_bottom_peak = that.plotContainer2
            .selectAll(".bar")
            .filter(function (e) {
              return e.id == d.bottom_id;
            });
          var bottom_mz =
            fitting_bottom_peak.data()[0] === undefined
              ? "-"
              : d3.format(",.4f")(fitting_bottom_peak.data()[0].mz);
          var top_mz =
            fitting_top_peak.data()[0] === undefined
              ? "-"
              : d3.format(",.4f")(fitting_top_peak.data()[0].mz);
          var intensity_diff =
            fitting_top_peak.data()[0] === undefined ||
            fitting_bottom_peak.data()[0] === undefined
              ? "-"
              : Math.abs(
                  d3.format(",.4f")(
                    fitting_top_peak.data()[0].percentBasePeak -
                      fitting_bottom_peak.data()[0].percentBasePeak
                  )
                );
          intensity_diff =
            fitting_top_peak.data()[0] === undefined ||
            fitting_bottom_peak.data()[0] === undefined
              ? fitting_top_peak.data()[0] === undefined
                ? d3.format(",.4f")(
                    fitting_bottom_peak.data()[0].percentBasePeak
                  )
                : d3.format(",.4f")(fitting_top_peak.data()[0].percentBasePeak)
              : Math.abs(
                  d3.format(",.4f")(
                    fitting_top_peak.data()[0].percentBasePeak -
                      fitting_bottom_peak.data()[0].percentBasePeak
                  )
                );

          fitting_top_peak.style("stroke", "black").style("width", 6);
          fitting_bottom_peak.style("stroke", "black").style("width", 6);
          // build the internal tooltip html
          that.tip.html(function () {
            return (
              "" +
              "<strong>Mass Error(ppm):</strong> <span style='color:red'>" +
              d3.format(".4f")(d.error) +
              "</span><br><br>" +
              "<strong>Top</strong><strong style='font-style:italic;'> m/z:</strong> <span style='color:red'>" +
              top_mz +
              " </span><br><br>" +
              "<strong>Bottom</strong><strong style='font-style:italic;'> m/z:</strong> <span style='color:red'>" +
              bottom_mz +
              " </span><br><br>" +
              "<strong>Intensity difference(%)</strong>:</strong> <span style='color:red'>" +
              intensity_diff +
              " </span><br>"
            );
          });
          // show the tooltip
          that.tip.direction("e");
          that.tip.offset([0, 0]);
          that.tip.show(d, this);

          // highlight all related fragment information on other plots
          var labelObj = that.plotContainer
            .selectAll(".barlabel")
            .filter(function (e, j) {
              //TODO correct id highlighting

              return i === j;
            });
          // make the label a little bigger
          labelObj.style("font-size", 18).style("font-weight", "bold");

          // extract the sequence data and highlight the fragment on the peptide sequence
          var fragmentType = label.charAt(0);
          var fragmentNumber = label.slice(1);
          var color = colors[i];

          // select all text elements from the marked peptide sequence
          var interactiveTitleObjects = that.titleContainer
            .selectAll("text")
            .data(sequence);

          // if the fragment type is N-terminal, work from index 0
          if (
            fragmentType === "a" ||
            fragmentType === "b" ||
            fragmentType === "c" ||
            fragmentType === "C"
          ) {
            interactiveTitleObjects
              .style("fill", function (d, i) {
                if (i < fragmentNumber) {
                  return color;
                } else {
                  return "black";
                }
              })
              .style("stroke", function (d, i) {
                if (i < fragmentNumber) {
                  return color;
                } else {
                  return "none";
                }
              });
            // if the fragment type is C-terminal, work from index -1
          } else {
            interactiveTitleObjects
              .style("fill", function (d, i) {
                if (i < sequence.length - fragmentNumber) {
                  return "black";
                } else {
                  return color;
                }
              })
              .style("stroke", function (d, i) {
                if (i < sequence.length - fragmentNumber) {
                  return "none";
                } else {
                  return color;
                }
              });
          }

          // highlight the selected circle by making it bigger and giving it a stroke
          that.circleDataset
            .style("r", function (e, j) {
              // TODO HIGHLIGHT CORRECTLY
              // This is fine => its just self highlight
              if (i === j) {
                return 7;
              }
            })
            .style("stroke", function (e, j) {
              if (i === j) {
                return "black";
              }
            });
        });

        // remove the tooltip and return all svg elements back to normal
        that.circleDataset.on("mouseleave", function (d, i) {
          that.tip.hide();

          // turn all text elements back to black
          that.titleContainer
            .selectAll("text")
            .data(sequence)
            .style("fill", "black")
            .style("stroke", "none");
          that.titleContainerBottom
            .selectAll("text")
            .data(sequenceBottom)
            .style("fill", "black")
            .style("stroke", "none");
          let fitting_top_peak = that.plotContainer
            .selectAll(".bar")
            .filter(function (e) {
              // return e.id == d.bottom_id;
              return e.id == d.top_id;
            });
          let fitting_bottom_peak = that.plotContainer2
            .selectAll(".bar")
            .filter(function (e) {
              return e.id == d.bottom_id;
            });

          fitting_top_peak.style("stroke", "none").style("width", (d) => {
            return d.width;
          });
          fitting_bottom_peak.style("stroke", "none").style("width", (d) => {
            return d.width;
          });

          // return the barlabel back to 0
          var labelObj = that.plotContainer
            .selectAll(".barlabel")
            .filter(function (e, j) {
              return i === j;
            });
          labelObj.style("font-size", 14).style("font-weight", "normal");

          // remove the stroke and resize the circle back to normal
          that.circleDataset
            .style("r", function (data) {
              return data.radius;
            })
            .style("stroke", function () {
              return "none";
            });
        });
      }
    },
    drawAnnotation: function () {
      var that = this;
      let x,
        y,
        y2,
        xAxis,
        xTopAxis,
        fragxAxis,
        yAxis,
        yAxis2,
        barDataset,
        barDataset2,
        labelDataset,
        labelDataset2,
        options = this.getOptions(),
        xValues = this.getX(),
        yValues = this.getIntensities(),
        percentBasePeak = this.getPercentBasePeak(),
        xValues2 = this.getMirrorX(),
        yValues2 = this.getMirrorIntensities(),
        percentBasePeak2 = this.getMirrorPercentBasePeak(),
        labels2 = this.getMirrorLabels(),
        labelCharges2 = this.getMirrorLabelCharges(),
        colors2 = this.getMirrorColors(),
        id = this.getId(),
        id2 = this.getIdMirror(),
        massError = this.getMassError(),
        colors = this.getColors(),
        labels = this.getLabels(),
        labelCharges = this.getLabelCharges(),
        neutralLosses = this.getNeutralLosses(),
        widths = this.getWidths(),
        widths2 = this.getMirrorWidths(),
        sequence = this.getSequence();

      // since y axis is scaled to % relative abundance, yMax will always be 100%.
      let yMin = 0,
        yMin2 = -100;
      let yMax = 100,
        yMax2 = 0;
      let xMin = d3.min([d3.min(xValues), d3.min(xValues2)]);
      let xMax = d3.max([d3.max(xValues), d3.max(xValues2)]);
      let TIC = 0,
        TIC2 = 0;
      let mirror = xValues2 ? true : false;

      // create a variable to add a bit of a buffer between the edges of the svg so things don't get cut off.
      let xScaleFudgeFactor = (xMax - xMin) * 0.025;

      // Do stuff if there is data to visualize.
      if (xValues && yValues) {
        // define x and y scales
        x = d3.scale
          .linear()
          .domain([xMin - xScaleFudgeFactor, xMax + xScaleFudgeFactor])
          .range([0, options.annotation.width]);
        y = d3.scale
          .linear()
          .domain([yMin, yMax + yMax * 2 * options.annotation.padding])
          .range([options.annotation.height, 0]);

        if (mirror) {
          y2 = d3.scale
            .linear()
            .domain([
              yMin2 + yMin2 * 2 * options.annotation.padding,
              yMax2 + yMax2 * options.annotation.padding,
            ])
            .range([options.annotation.height, 0]);
        }
        // x-axis will be at the bottom with a suggested 10 axis ticks. That number may change depending on how D3 interprets the m/z range
        xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
        if (mirror) {
          xTopAxis = d3.svg.axis().scale(x).orient("top").ticks(10);
        }
        // fragxAxis is actually the x axis from the fragment mass error chart. It's defined here so it can be updated on zoom.
        fragxAxis = d3.svg.axis().scale(x).orient("top").ticks(10);

        // Format the y-axis ticks to round itself to 2 significant figures. e.g. 50, 5.0, 0.50
        yAxis = d3.svg
          .axis()
          .scale(y)
          .orient("left")
          .tickFormat(function (d) {
            return d3.format("0.2r")(d);
          });

        if (mirror) {
          yAxis2 = d3.svg
            .axis()
            .scale(y2)
            .orient("left")
            .tickFormat(function (d) {
              return d3.format("0.2r")(d === 0 ? d : -d);
            });
        }

        let plotData = [];
        let mirrorPlotData = [];
        var label, charge, neutralLoss;
        // format all the data recieved from the php script in a way that's easier to plot using D3
        for (let i = 0; i < xValues.length; i++) {
          label = labels[i];
          charge = labelCharges[i];
          neutralLoss = neutralLosses[i];

          // compile labels from the label text, neutral losses, charge, and ionization mode. {"y17", "-H2O", 2, "+"} => [y₁₇-H₂O]⁺²
          label = this.formatLabel(
            label,
            neutralLoss,
            charge,
            this.ionizationMode
          );

          // sum up all intensities to calculate the total ion current
          TIC += yValues[i];

          // format our processed data in a format which makes it easier to process using D3.
          plotData.push({
            mz: xValues[i],
            intensity: yValues[i],
            id: id[i],
            x: xValues[i],
            y: percentBasePeak[i],
            percentBasePeak: percentBasePeak[i],
            color: colors[i],
            label: label,
            width: widths[i] * options.annotation.width * 0.001,
            massError: massError[i],
            points: [],
          });
        }
        // format all the data recieved from the php script in a way that's easier to plot using D3
        for (let i = 0; i < xValues2.length; i++) {
          label = labels2[i];
          charge = labelCharges2[i];

          // compile labels from the label text, neutral losses, charge, and ionization mode. {"y17", "-H2O", 2, "+"} => [y₁₇-H₂O]⁺²
          label = this.formatLabel(label, "", charge, this.ionizationMode);

          // sum up all intensities to calculate the total ion current
          TIC2 += yValues2[i];

          // format our processed data in a format which makes it easier to process using D3.
          mirrorPlotData.push({
            mz: xValues2[i],
            intensity: yValues2[i],
            id: id2[i],
            x: xValues2[i],
            y: percentBasePeak2[i],
            percentBasePeak: percentBasePeak2[i],
            color: colors2[i],
            label: label,
            width: widths2[i] * options.annotation.width * 0.001,
            massError: [], //massError[i],
            points: [],
          });
        }

        // set transition duration depending on the number of spectral features to visualize
        var duration = 1500 / plotData.length;
        var duration2 = 1500 / mirrorPlotData.length;

        // actually render the x- and y-axes
        this.container
          .selectAll("g.xAnnotation")
          .attr("transform", "translate(0, " + options.annotation.height + ")")
          .call(xAxis);
        this.container.selectAll("g.yAnnotation").call(yAxis);
        this.container2.selectAll("g.xAnnotation").call(xTopAxis);
        this.container2.selectAll("g.yAnnotation").call(yAxis2);

        // bind the plotData variable to potential svg rectangle elements.
        barDataset = this.plotContainer.selectAll(".bar").data(plotData);
        // bind the plotData variable to potential svg text elements.
        labelDataset = this.plotContainer.selectAll(".barlabel").data(plotData);
        // bind the plotData variable to potential svg path elements.
        var lineDataset = this.plotContainer.selectAll(".line").data(plotData);

        // bind the plotData variable to potential svg rectangle elements.
        barDataset2 = this.plotContainer2
          .selectAll(".bar")
          .data(mirrorPlotData);
        // bind the plotData variable to potential svg text elements.
        labelDataset2 = this.plotContainer2
          .selectAll(".barlabel")
          .data(mirrorPlotData);
        // bind the plotData variable to potential svg path elements.
        var lineDataset2 = this.plotContainer2
          .selectAll(".line")
          .data(mirrorPlotData);

        // bind the popup tooltip to the annotated mass spectrum.
        this.plotContainer.call(that.tip);

        // bind the popup tooltip to the annotated mass spectrum.
        this.plotContainer2.call(that.tip);

        // create potential bars
        barDataset.enter().append("rect").attr("class", "bar");
        // create potential bars
        barDataset2.enter().append("rect").attr("class", "bar");

        // remove unneeded bars
        barDataset
          .exit()
          .attr("y", function () {
            return y(-10);
          })
          .attr("x", function (d) {
            return x(d3.min(xValues)) - d.width / 2;
          })
          .remove();
        // remove unneeded bars
        barDataset2
          .exit()
          .attr("y", function () {
            return y(-10);
          })
          .attr("x", function (d) {
            return x(d3.min(xValues2)) - d.width / 2;
          })
          .remove();

        // draw spectral features and transition them from the origin. x coordinate is the spectral feature m/z, and y coordinate is the % relative abundance
        barDataset
          .attr("x", function () {
            return x(0);
          })
          .attr("y", function () {
            return y(0);
          })
          .transition()
          .delay(function (d, i) {
            return (duration / 2) * i;
          })
          .duration(1000)
          .attr("width", function (d) {
            return d.width;
          })
          .attr("x", function (d) {
            return x(d.mz) - d.width / 2;
          })
          .attr("height", function (d) {
            return options.annotation.height - y(d.percentBasePeak);
          })
          .attr("y", function (d) {
            return y(d.percentBasePeak);
          })
          .attr("fill", function (d) {
            return d.color;
          })
          .attr("opacity", 1)
          .attr("align", "right");

        // draw spectral features and transition them from the origin. x coordinate is the spectral feature m/z, and y coordinate is the % relative abundance
        barDataset2
          .attr("x", function () {
            return x(0);
          })
          .attr("y", function () {
            return y(0);
          })
          .transition()
          .delay(function (d, i) {
            return (duration2 / 2) * i;
          })
          .duration(1000)
          .attr("width", function (d) {
            return d.width;
          })
          .attr("x", function (d) {
            return x(d.mz) - d.width / 2;
          })
          .attr("height", function (d) {
            return options.annotation.height - y(d.percentBasePeak);
          })
          .attr("y", function () {
            return y(0) - 100 + 1;
          })
          .attr("fill", function (d) {
            return d.color;
          })
          .attr("opacity", 1)
          .attr("align", "right");

        // define zoom functionality on the x-axis
        var zoomX = d3.behavior
          .zoom()
          .scaleExtent([1, 1000])
          .x(x)
          .on("zoom", function () {
            // define translation object to move svg elements from original to zoomed position on the svg
            var t = zoomX.translate();
            var maxX = d3.max(x.range());

            var tx = Math.max(
              Math.min(0, t[0]),
              options.annotation.width - maxX * zoomX.scale()
            );

            // update translation to new coordinates.
            // zoomX.translate([ 0, 0 ]);
            zoomX.translate([tx, t[1]]);

            // calling the x axes here seems to be necessary to get them to scale correctly.
            that.container.selectAll("g.xAnnotation").call(xAxis);
            that.container2.selectAll("g.xAnnotation").call(xTopAxis);
            that.fragmentContainer.selectAll("g.xAnnotation").call(fragxAxis);

            // using the new scale, update the spectral peak positions
            barDataset
              .attr("x", function (d) {
                return x(d.mz) - d.width / 2;
              })
              .attr("width", function (d) {
                return (
                  d.width +
                  options.annotation.zoomFactor *
                    Math.log10(zoomX.scale()) *
                    d.width
                );
              });
            // using the new scale, update the spectral peak positions
            barDataset2
              .attr("x", function (d) {
                return x(d.mz) - d.width / 2;
              })
              .attr("width", function (d) {
                return (
                  d.width +
                  options.annotation.zoomFactor *
                    Math.log10(zoomX.scale()) *
                    d.width
                );
              });

            // using the new scale, update the annotation label positions
            labelDataset.attr("x", function (d) {
              return x(d.x);
            });

            // using the new scale, update the annotation label positions
            labelDataset2.attr("x", function (d) {
              return x(d.x);
            });

            // using the new scale, update the mass error circles
            that.circleDataset.attr("cx", function (d) {
              return x(d.mz);
            });

            // using the new scale, update the mass error circles
            //circleDataset2.attr("cx", function(d) {
            //  return x(d.mz);
            //});

            // using the new scale, redraw the lines connecting the spectral peaks to annotation labels.
            lineDataset.forEach(function (d) {
              that.drawLine(x, y, d);
            });
            // using the new scale, redraw the lines connecting the spectral peaks to annotation labels.
            lineDataset2.forEach(function (d) {
              that.drawLine(x, y, d);
            });
          });

        // define zoom functionality on the y-axis
        var zoomY = d3.behavior
          .zoom()
          .scaleExtent([1, 1000])
          .y(y)
          .on("zoom", function () {
            // define translation object to move svg elements from original to zoomed position on the svg
            var t = zoomY.translate();
            var maxY = d3.max(y.range());

            var ty = Math.max(
              Math.min(0, t[1]),
              options.annotation.height - maxY * zoomY.scale()
            );

            // update translation to new coordinates.
            zoomY.translate([t[0], ty]);

            // make sure y domain keeps min at 0;
            y.domain([0, y.domain()[1]]);

            // calling the y axis here seems to be necessary to get them to scale correctly.
            that.container.selectAll("g.yAnnotation").call(yAxis);
            //this.container2.selectAll("g.yAnnotation").call(yAxis2);

            // using the new scale, update the spectral peak rectangle heights
            barDataset
              .attr("y", function (d) {
                return y(d.percentBasePeak);
              })
              .attr("height", function (d) {
                var height = options.annotation.height - y(d.percentBasePeak);
                if (height < 0) {
                  height = 0;
                }
                return height;
              });

            // using the new scale, update the annotation label positions
            labelDataset.attr("y", function (d) {
              return y(d.y + yMax * 0.005);
            });

            // using the new scale, redraw the lines connecting the spectral peaks to annotation labels.
            lineDataset.forEach(function (d) {
              that.drawLine(x, y, d);
            });
          });
        // define zoom functionality on the y-axis
        var zoomY2 = d3.behavior
          .zoom()
          .scaleExtent([1, 1000])
          .y(y2)
          .on("zoom", function () {
            // define translation object to move svg elements from original to zoomed position on the svg

            var t = zoomY2.translate();
            var maxY = d3.max(y2.range());

            var ty = Math.max(
              Math.min(0, t[1]),
              options.annotation.height - maxY * zoomY2.scale()
            );

            // update translation to new coordinates.
            zoomY2.translate([t[0], ty]);

            // make sure y domain keeps min at 0;
            y2.domain([y2.domain()[0], 0]);

            // calling the y axis here seems to be necessary to get them to scale correctly.
            that.container2.selectAll("g.yAnnotation").call(yAxis2);
            //this.container2.selectAll("g.yAnnotation").call(yAxis2);

            // using the new scale, update the spectral peak rectangle heights
            barDataset2
              .attr("y", function () {
                return y2(0);
              })
              .attr("height", function (d) {
                var height = -y2(d.percentBasePeak);
                //var height = options.annotation.height - y2(d.percentBasePeak);
                if (height < 0) {
                  height = 0;
                }
                return height;
              });

            // using the new scale, update the annotation label positions
            labelDataset2.attr("y", function (d) {
              // return (y(0) - 170 + options.annotation.height - y(d.percentBasePeak))  ;
              //
              return y2(0) - y2(d.percentBasePeak + yMax * 0.005) + 12;
            });

            // using the new scale, redraw the lines connecting the spectral peaks to annotation labels.
            lineDataset2.forEach(function (d) {
              that.drawLine(x, y, d);
            });
          });

        // bind a mouseenter event to the rendered spectral peak to highlight the spectral feature and show a tooltip.
        barDataset.on("mouseenter", function (d) {
          // highlight the peak that is being hovered over using a black stroke
          d3.select(this).style("stroke", function () {
            return "black";
          });

          // define the inner HTML of the tooltip
          that.tip.html(function () {
            let tipText = "";

            if (d.label) {
              tipText +=
                "<strong>Fragment:</strong> <span style='color:red'>" +
                d.label +
                " </span><br><br>";
            }

            tipText +=
              "<strong style='font-style:italic;'>m/z:</strong> <span style='color:red'>" +
              d3.format(",.4f")(d.mz) +
              " </span><br><br>" +
              "<strong>Relative Abundance:</strong> <span style='color:red'>" +
              d3.format("0.2f")(d.percentBasePeak) +
              "%</span><br><br>" +
              "<strong>% TIC:</strong> <span style='color:red'>" +
              d3.format("0.2%")(d.intensity / TIC) +
              "</span>";
            return tipText;
          });

          // show the tooltip
          that.tip.direction("n");
          that.tip.show(d, this);
        });

        // bind a mouseenter event to the rendered spectral peak to highlight the spectral feature and show a tooltip.
        barDataset2.on("mouseenter", function (d) {
          // highlight the peak that is being hovered over using a black stroke
          d3.select(this).style("stroke", function () {
            return "black";
          });

          // define the inner HTML of the tooltip
          that.tip.html(function () {
            let tipText = "";

            if (d.label) {
              tipText +=
                "<strong>Fragment:</strong> <span style='color:red'>" +
                d.label +
                " </span><br><br>";
            }

            tipText +=
              "<strong style='font-style:italic;'>m/z:</strong> <span style='color:red'>" +
              d3.format(",.4f")(d.mz) +
              " </span><br><br>" +
              "<strong>Relative Abundance:</strong> <span style='color:red'>" +
              d3.format("0.2f")(d.percentBasePeak) +
              "%</span><br><br>" +
              "<strong>% TIC:</strong> <span style='color:red'>" +
              d3.format("0.2%")(d.intensity / TIC) +
              "</span>";
            return tipText;
          });

          // show the tooltip
          that.tip.direction("s");
          that.tip.show(d, this);
        });

        // remove the stroke added on mouse-in and hide the tooltip
        barDataset.on("mouseleave", function () {
          d3.select(this).style("stroke", "none");
          that.tip.hide();
        });
        // remove the stroke added on mouse-in and hide the tooltip
        barDataset2.on("mouseleave", function () {
          d3.select(this).style("stroke", "none");
          that.tip.hide();
        });

        // annotation label placement is done here. Get ready to render text elements
        labelDataset.enter().append("text").attr("class", "barlabel");

        // annotation label placement is done here. Get ready to render text elements
        labelDataset2.enter().append("text").attr("class", "barlabel");

        // add the annotation labels and center them over annotated spectral peaks
        labelDataset
          .attr("x", function (d) {
            return x(d.x) - d.width / 2;
          })
          .text(function (d) {
            return d.label;
          })
          .attr("y", function () {
            return y(yMax + yMax * options.annotation.padding);
          })
          .attr("opacity", 0.0)
          .transition()
          .delay(function (d, i) {
            return duration * i + 250;
          })
          .duration(1000)
          .ease("bounce")
          .attr("y", function (d) {
            return y(d.percentBasePeak + yMax * 0.005);
          })
          .attr("opacity", 1);
        // add the annotation labels and center them over annotated spectral peaks
        labelDataset2
          .attr("x", function (d) {
            return x(d.x) - d.width / 2;
          })
          .text(function (d) {
            return d.label;
          })
          .attr("y", function () {
            return y(0);
          })
          .attr("opacity", 0.0)
          .transition()
          .delay(function (d, i) {
            return duration * i + 250;
          })
          .duration(1000)
          .ease("bounce")
          .attr("y", function (d) {
            return y(100 - d.percentBasePeak - 4);
          })
          .attr("opacity", 1);

        // transition out unused labels
        labelDataset
          .exit()
          .attr("y", function () {
            return y(d3.min(yValues));
          })
          .remove();
        // transition out unused labels
        labelDataset2
          .exit()
          .attr("y", function () {
            return y(d3.min(yValues2));
          })
          .remove();

        // return dragged label back to it's original location
        labelDataset.on("dblclick", function (d) {
          d.x = d.mz;
          d.y = d.percentBasePeak;

          d3.select(this).attr("x", x(d.x));
          d3.select(this).attr("y", y(d.y + yMax * 0.005));

          that.drawLine(x, y, d);
        });

        // return dragged label back to it's original location
        labelDataset2.on("dblclick", function (d) {
          d.x = d.mz;
          d.y = d.percentBasePeak;

          d3.select(this).attr("x", x(d.x));
          d3.select(this).attr("y", y(d.y + yMax * 0.005));

          that.drawLine(x, y, d);
        });

        // bind a mouseenter event to the rendered spectral peak to highlight the label and to show a tooltip.
        labelDataset
          .on("mouseenter", function (d, i) {
            // define the tooltip inner html.
            that.tip.html(function () {
              return (
                "<strong>Fragment:</strong> <span style='color:red'>" +
                d.label +
                " </span><br><br>" +
                "<strong style='font-style:italic;'>m/z:</strong> <span style='color:red'>" +
                d3.format(",.4f")(d.mz) +
                " </span><br><br>" +
                "<strong>Relative Abundance:</strong> <span style='color:red'>" +
                d3.format("0.2f")(d.percentBasePeak) +
                "%</span><br><br>" +
                "<strong>% TIC:</strong> <span style='color:red'>" +
                d3.format("0.2%")(d.intensity / TIC) +
                "</span>"
              );
            });
            // show tooltip
            that.tip.show(d, this);

            // slightly enlarge the selected label
            //var labelFontSize = d3.select(this).style("font-size", 18).style("font-weight", "bold");

            // get saved color and text from label. Parse label to get the location of the bond. change color amino acids on the peptide sequence at the top.
            var label = labels[i];
            var fragmentType =
              label.indexOf("_") === -1 ? label.charAt(0) : label.slice(0, 2);
            var fragmentNumber =
              label.indexOf("_") === -1 ? label.slice(1) : label.slice(2);
            var color = colors[i];

            // get all text from the peptide sequence
            var interactiveTitleObjects = that.titleContainer
              .selectAll("text")
              .data(sequence);

            // if the fragment type is n-Terminal, process the peptide sequence data starting from index 0. update text color if within index, else remain black
            if (
              fragmentType === "a" ||
              fragmentType === "b" ||
              fragmentType === "c" ||
              fragmentType === "C" ||
              fragmentType === "yb"
            ) {
              interactiveTitleObjects
                .style("fill", function (d, i) {
                  if (!isNaN(fragmentNumber)) {
                    if (i < fragmentNumber) {
                      return color;
                    } else {
                      return "black";
                    }
                  } else {
                    if (!isNaN(fragmentNumber.split("")[0])) {
                      let start = parseInt(fragmentNumber.split("_")[0]);
                      let stop = parseInt(fragmentNumber.split("_")[1]);
                      if (i < stop && i >= start) {
                        return color;
                      } else {
                        return "black";
                      }
                    }
                  }
                  // give it a stoke as well to make the highlighted section 'pop'
                })
                .style("stroke", function (d, i) {
                  if (!isNaN(fragmentNumber)) {
                    if (i < fragmentNumber) {
                      return color;
                    } else {
                      return "none";
                    }
                  } else {
                    let start = parseInt(fragmentNumber.split("_")[0]);
                    let stop = parseInt(fragmentNumber.split("_")[1]);
                    if (i < stop && i >= start) {
                      return color;
                    } else {
                      return "none";
                    }
                  }
                });
              // if the fragment type is c-Terminal, process the peptide sequence data starting from index 0. update text color if within index, else remain black
            } else if (fragmentType !== "IM") {
              interactiveTitleObjects
                .style("fill", function (d, i) {
                  if (i < sequence.length - fragmentNumber) {
                    return "black";
                  } else {
                    return color;
                  }
                  // give it a stoke as well to make the highlighted section 'pop'
                })
                .style("stroke", function (d, i) {
                  if (i < sequence.length - fragmentNumber) {
                    return "none";
                  } else {
                    return color;
                  }
                });
            }

            // use the selected label index and highlight the mass error circle
            var massErrorCircles =
              that.massErrorContainer.selectAll(".masserror");

            // make it a little bigger
            massErrorCircles
              .style("r", function (e) {
                if (d.id === e.top_id) {
                  return 7;
                }
                // give it a stroke
              })
              .style("stroke", function (e, j) {
                if (i === j) {
                  return "black";
                }
              });
          })
          .on("mouseleave", function () {
            // hide tooltip
            that.tip.hide();
            // reset annotated peptide sequence back to normal
            that.titleContainer
              .selectAll("text")
              .data(sequence)
              .style("fill", "black")
              .style("stroke", "none");
            d3.select(this)
              .style("font-size", 16)
              .style("font-weight", "normal");

            // set all mass error circles back to normal
            var massErrorCircles =
              that.massErrorContainer.selectAll(".masserror");
            massErrorCircles
              .style("r", function (d) {
                return d.radius;
              })
              .style("stroke", "none");
          });

        /////////////////////
        labelDataset2
          .on("mouseenter", function (d, i) {
            // define the tooltip inner html.
            that.tip.html(function () {
              return (
                "<strong>Fragment:</strong> <span style='color:red'>" +
                d.label +
                " </span><br><br>" +
                "<strong style='font-style:italic;'>m/z:</strong> <span style='color:red'>" +
                d3.format(",.4f")(d.mz) +
                " </span><br><br>" +
                "<strong>Relative Abundance:</strong> <span style='color:red'>" +
                d3.format("0.2f")(d.percentBasePeak) +
                "%</span><br><br>" +
                "<strong>% TIC:</strong> <span style='color:red'>" +
                d3.format("0.2%")(d.intensity / TIC2) +
                "</span>"
              );
            });
            // show tooltip
            that.tip.show(d, this);

            // slightly enlarge the selected label
            //var labelFontSize = d3.select(this).style("font-size", 18).style("font-weight", "bold");

            // get saved color and text from label. Parse label to get the location of the bond. change color amino acids on the peptide sequence at the top.
            //var label = labels2[i];
            //var fragmentType = label.charAt(0);
            //var fragmentNumber = label.slice(1)
            //var color = colors2[i];

            // use the selected label index and highlight the mass error circle
            var massErrorCircles =
              that.massErrorContainer.selectAll(".masserror");

            // make it a little bigger
            massErrorCircles
              .style("r", function (e) {
                if (d.id === e.bottom_id) {
                  return 7;
                }
                // give it a stroke
              })
              .style("stroke", function (e, j) {
                if (i === j) {
                  return "black";
                }
              });
          })
          .on("mouseleave", function () {
            // hide tooltip
            that.tip.hide();
            // reset annotated peptide sequence back to normal
            d3.select(this)
              .style("font-size", 16)
              .style("font-weight", "normal");

            // set all mass error circles back to normal
            var massErrorCircles =
              that.massErrorContainer.selectAll(".masserror");
            massErrorCircles
              .style("r", function (d) {
                return d.radius;
              })
              .style("stroke", "none");
          });

        /////////////////////

        // create a drag variable which handles the click and drag event when labels need to be moved.
        var drag = d3.behavior.drag().on("drag", function (d) {
          // hide the tooltip. It's just a little intrusive during click and drag operations
          that.tip.hide();

          // determine where the label was dragged to by retrieving the event x and y coordinates.
          var newX = d3.event.x;
          var newY = d3.event.y;

          // bound the label dragging so elements cannot accidently be moved out of the svg clipping mask
          if (newX < options.annotation.width * 0.015) {
            newX = options.annotation.width * 0.015;
          }
          if (newX > options.annotation.width * 0.985) {
            newX = options.annotation.width * 0.985;
          }
          if (newY < options.annotation.height * 0.025) {
            newY = options.annotation.height * 0.025;
          }
          if (newY > options.annotation.height * 0.985) {
            newY = options.annotation.height * 0.985;
          }

          // get the m/z and % relative abundance values associated with where the label now is.
          d.x = x.invert(newX);
          d.y = y.invert(newY);

          // actually move the label now.
          d3.select(this).attr("x", newX);
          d3.select(this).attr("y", newY);

          // draw a line from the spectral peak to the moved annotation label.
          that.drawLine(x, y, d);

          // remove unused lines
          lineDataset.exit().remove();
        });

        // call drag function creating all the labels. Seem to be hitting a race condition if we try to do it earlier.
        labelDataset.call(drag);

        // give zooming behavior to your invisible zoom rectangles
        this.zoomX.call(zoomX);
        this.zoomY.call(zoomY);
        this.zoomX2.call(zoomX);
        this.zoomY2.call(zoomY2);

        // also pass zooming behavior onto the actual axis elements (ticks, axis labels ect.). Prevents unexpected page scrolling.
        this.container.selectAll("g.xAnnotation").call(zoomX);
        this.container2.selectAll("g.xAnnotation").call(zoomX);
        this.fragmentContainer.selectAll("g.xAnnotation").call(zoomX);
        this.container.selectAll("g.yAnnotation").call(zoomY);
        this.container2.selectAll("g.yAnnotation").call(zoomY2);

        // append line objects to everything in plot data. these will later be generated when labels are dragged.
        // logic to draw annotation lines if elements are dragged
        lineDataset.enter().append("path").attr("class", "line");
        lineDataset2.enter().append("path").attr("class", "line");
      }
    },

    drawOriginSummary: function (topSpectrum = true) {
      var statisticsData = [];
      statisticsData.push({
        title: "Origin: ",
        data: this.getModifications2(topSpectrum),
      });

      var dataset;
      if (topSpectrum) {
        dataset = this.originContainer
          .selectAll(".origincategory")
          .data(statisticsData);
        dataset.enter().append("text").attr("class", "origincategory");
      } else {
        dataset = this.originContainerBottom
          .selectAll(".origincategoryBottom")
          .data(statisticsData);
        dataset.enter().append("text").attr("class", "origincategoryBottom");
      }
      // From line 1067 to 1086 we write the actual numerical data
      if (topSpectrum) {
        dataset = this.originContainer
          .selectAll(".origindata")
          .data(statisticsData);
        dataset.enter().append("text").attr("class", "origindata origin");
      } else {
        dataset = this.originContainerBottom
          .selectAll(".origindataBottom")
          .data(statisticsData);
        dataset.enter().append("text").attr("class", "origindataBottom origin");
      }

      dataset
        .text(function (d) {
          return d.data;
        })
        .attr("opacity", 0)
        .attr("transform", function () {
          return "translate(-" + 0 + ",40)";
        })
        .attr("text-anchor", "middle")
        .transition()
        .delay(function (d, i) {
          return i * 450;
        })
        .duration(1500)
        .attr("opacity", 1);

      dataset.exit().remove();
    },
    drawCorrelationSummary: function (topSpectrum = true) {
      var options = this.getOptions(),
        scoreGeneral = this.score.sa,
        correlationGeneral = this.score.corr,
        score = topSpectrum ? this.scoreTop.sa : this.scoreBottom.sa,
        correlation = topSpectrum ? this.scoreTop.corr : this.scoreBottom.corr,
        stat_width = topSpectrum
          ? options.statistics.width
          : options.statisticsBottom.width,
        stat_mar_catpad2 = topSpectrum
          ? options.statistics.margin.categoryPadding_2
          : options.statisticsBottom.margin.categoryPadding_2,
        stat_mar_catpad3 = topSpectrum
          ? options.statistics.margin.categoryPadding_3
          : options.statisticsBottom.margin.categoryPadding_3,
        stat_mar_datpad1 = topSpectrum
          ? options.statistics.margin.dataPadding_1
          : options.statisticsBottom.margin.dataPadding_1,
        stat_mar_datpad2 = topSpectrum
          ? options.statistics.margin.dataPadding_2
          : options.statisticsBottom.margin.dataPadding_2,
        stat_mar_datpad3 = topSpectrum
          ? options.statistics.margin.dataPadding_3
          : options.statisticsBottom.margin.dataPadding_3;
      var statisticsData = [];
      statisticsData.push({
        title: "SA: ",
        data: scoreGeneral + " (" + score + ")",
      });
      statisticsData.push({
        title: "PCC: ",
        data: correlationGeneral + " (" + correlation + ")",
      });

      var dataset;
      if (topSpectrum) {
        dataset = this.statisticsContainer
          .selectAll(".precursorstatscategory")
          .data(statisticsData);
        dataset.enter().append("text").attr("class", "precursorstatscategory");
      } else {
        dataset = this.statisticsContainerBottom
          .selectAll(".precursorstatscategoryBottom")
          .data(statisticsData);
        dataset
          .enter()
          .append("text")
          .attr("class", "precursorstatscategoryBottom");
      }

      dataset
        .text(function (d) {
          return d.title;
        })
        .attr("opacity", 0)
        .attr("transform", function (d, i) {
          if (i == 0) {
            return "translate(-" + (stat_width / 2 - 170) + ",25)";
          } else if (i == 1) {
            return "translate(-" + (stat_mar_catpad2 - 70) + ",25)";
          } else {
            return "translate(" + (stat_width / 2 - stat_mar_catpad3) + ",25)";
          }
        })
        .attr("text-anchor", "start")
        .transition()
        .delay(function (d, i) {
          return i * 450;
        })
        .duration(1500)
        .attr("opacity", 1);
      //.style("font-size", "13px");

      dataset.exit().remove();

      // From line 1067 to 1086 we write the actual numerical data
      if (topSpectrum) {
        dataset = this.statisticsContainer
          .selectAll(".precursorstatsdata")
          .data(statisticsData);
        dataset.enter().append("text").attr("class", "precursorstatsdata");
      } else {
        dataset = this.statisticsContainerBottom
          .selectAll(".precursorstatsdataBottom")
          .data(statisticsData);
        dataset
          .enter()
          .append("text")
          .attr("class", "precursorstatsdataBottom");
      }

      dataset
        .text(function (d) {
          return d.data;
        })
        .attr("opacity", 0)
        .attr("transform", function (d, i) {
          if (i == 0) {
            return (
              "translate(-" + (stat_width / 2 + stat_mar_datpad1 - 100) + ",25)"
            );
          } else if (i == 1) {
            //return "translate(-" + (options.statistics.margin.categoryPadding_2 + options.statistics.margin.dataPadding_2) + ",0)";
            return "translate(" + (stat_mar_datpad2 + 50) + ",25)";
          } else {
            return (
              "translate(" +
              (stat_width / 2 - stat_mar_catpad3 + stat_mar_datpad3) +
              ",25)"
            );
          }
        })
        .attr("text-anchor", "start")
        .transition()
        .delay(function (d, i) {
          return i * 450;
        })
        .duration(1500)
        .attr("opacity", 1);

      dataset.exit().remove();
    },
    drawPrecursorSummary: function () {
      var options = this.getOptions(),
        sequence = this.getSequence(),
        charge = this.getPrecursorCharge(),
        precursorMz = this.getPrecursorMz(),
        fragments = this.getTickData(),
        sequenceBottom = this.getSequenceBottom(),
        chargeBottom = this.getPrecursorChargeBottom(),
        precursorMzBottom = this.getPrecursorMzBottom(),
        fragmentsBottom = this.getTickData(false);

      // Retrieve and format mz, charge, and formatted fragment objects. Place them into the array summaryData to be later translated into svg elements.
      var summaryData = [];
      summaryData.push({
        title: "Precursor m/z: ",
        data: d3.format(",.4f")(precursorMz),
      });
      summaryData.push({
        title: "Charge: ",
        data: this.ionizationMode + Math.abs(charge),
      });
      summaryData.push({
        title: "Fragmented Bonds: ",
        data: this.getFragmentedBonds(fragments, sequence.length),
      });
      var summaryDataBottom = [];
      summaryDataBottom.push({
        title: "Precursor m/z: ",
        data: d3.format(",.4f")(precursorMzBottom),
      });
      summaryDataBottom.push({
        title: "Charge: ",
        data: this.ionizationMode + Math.abs(chargeBottom),
      });
      summaryDataBottom.push({
        title: "Fragmented Bonds: ",
        data: this.getFragmentedBonds(fragmentsBottom, sequenceBottom.length),
      });

      // From line 1047 to 1065 we write the Title text from the summary data objects e.g. "Precursor m/z"
      var dataset = this.peptideContainer
        .selectAll(".precursorstatscategory")
        .data(summaryData);
      var datasetBottom = this.peptideContainerBottom
        .selectAll(".precursorstatscategoryBottom")
        .data(summaryDataBottom);

      dataset.enter().append("text").attr("class", "precursorstatscategory");
      dataset
        .text(function (d) {
          return d.title;
        })
        .attr("opacity", 0)
        .attr("transform", function (d, i) {
          if (i == 0) {
            return "translate(-" + options.statistics.width / 2 + ",0)";
          } else if (i == 1) {
            return (
              "translate(-" +
              options.statistics.margin.categoryPadding_2 +
              ",0)"
            );
          } else if (i == 2) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_3) +
              ",0)"
            );
          } else if (i == 3) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_4) +
              ",0)"
            );
          } else if (i == 4) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_5) +
              ",0)"
            );
          } else {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_6) +
              ",0)"
            );
          }
        })
        .attr("text-anchor", "start")
        .transition()
        .delay(function (d, i) {
          return i * 450;
        })
        .duration(1500)
        .attr("opacity", 1);

      datasetBottom
        .enter()
        .append("text")
        .attr("class", "precursorstatscategoryBottom");
      datasetBottom
        .text(function (d) {
          return d.title;
        })
        .attr("opacity", 0)
        .attr("transform", function (d, i) {
          if (i == 0) {
            return "translate(-" + options.statistics.width / 2 + ",0)";
          } else if (i == 1) {
            return (
              "translate(-" +
              options.statistics.margin.categoryPadding_2 +
              ",0)"
            );
          } else if (i == 2) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_3) +
              ",0)"
            );
          } else if (i == 3) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_4) +
              ",0)"
            );
          } else if (i == 4) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_5) +
              ",0)"
            );
          } else {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_6) +
              ",0)"
            );
          }
        })
        .attr("text-anchor", "start")
        .transition()
        .delay(function (d, i) {
          return i * 450;
        })
        .duration(1500)
        .attr("opacity", 1);

      dataset.exit().remove();
      datasetBottom.exit().remove();

      // From line 1067 to 1086 we write the actual numerical data
      dataset = this.peptideContainer
        .selectAll(".precursorstatsdata")
        .data(summaryData);
      datasetBottom = this.peptideContainerBottom
        .selectAll(".precursorstatsdataBottom")
        .data(summaryDataBottom);

      dataset.enter().append("text").attr("class", "precursorstatsdata");
      datasetBottom
        .enter()
        .append("text")
        .attr("class", "precursorstatsdataBottom");
      dataset
        .text(function (d) {
          return d.data;
        })
        .attr("opacity", 0)
        .attr("transform", function (d, i) {
          if (i == 0) {
            return (
              "translate(-" +
              (options.statistics.width / 2 +
                options.statistics.margin.dataPadding_1) +
              ",0)"
            );
          } else if (i == 1) {
            //return "translate(-" + (options.statistics.margin.categoryPadding_2 + options.statistics.margin.dataPadding_2) + ",0)";
            return (
              "translate(" + options.statistics.margin.dataPadding_2 + ",0)"
            );
          } else if (i == 2) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_3 +
                options.statistics.margin.dataPadding_3) +
              ",0)"
            );
          } else if (i == 3) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_4 +
                options.statistics.margin.dataPadding_4) +
              ",0)"
            );
          } else {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_5 +
                options.statistics.margin.dataPadding_5) +
              ",0)"
            );
          }
        })
        .attr("text-anchor", "start")
        .transition()
        .delay(function (d, i) {
          return i * 450;
        })
        .duration(1500)
        .attr("opacity", 1);

      dataset.exit().remove();
      datasetBottom
        .text(function (d) {
          return d.data;
        })
        .attr("opacity", 0)
        .attr("transform", function (d, i) {
          if (i == 0) {
            return (
              "translate(-" +
              (options.statistics.width / 2 +
                options.statistics.margin.dataPadding_1) +
              ",0)"
            );
          } else if (i == 1) {
            //return "translate(-" + (options.statistics.margin.categoryPadding_2 + options.statistics.margin.dataPadding_2) + ",0)";
            return (
              "translate(" + options.statistics.margin.dataPadding_2 + ",0)"
            );
          } else if (i == 2) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_3 +
                options.statistics.margin.dataPadding_3) +
              ",0)"
            );
          } else if (i == 3) {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_4 +
                options.statistics.margin.dataPadding_4) +
              ",0)"
            );
          } else {
            return (
              "translate(" +
              (options.statistics.width / 2 -
                options.statistics.margin.categoryPadding_5 +
                options.statistics.margin.dataPadding_5) +
              ",0)"
            );
          }
        })
        .attr("text-anchor", "start")
        .transition()
        .delay(function (d, i) {
          return i * 450;
        })
        .duration(1500)
        .attr("opacity", 1);

      datasetBottom.exit().remove();
    },
    drawInteractiveTitle: function () {
      var x,
        y,
        dataset,
        options = this.getOptions(),
        sequence = this.getSequence(),
        aminoAcidTicks = this.getTickData(),
        mods = this.getModifications();
      // set variables to plot interactive title

      // the min and max units defined here are somewhat arbitrary. Since the scaling is meant to evenly distribute one letter abbreviations, the actual units aren't important,
      // just the proportions. I chose a scale of [0,1] as it made sense to represent the placement as
      var xMin = 0;
      var xMax = 1;
      var interactiveChartWidth = xMax - xMin;
      var spacingFactor;
      var fontSize;
      var fullTitleSpacing;
      var fullTitleStart = 0.05;
      var fullTitleEnd = 0.95;

      // define a transition delay based on peptide length.
      var delay = 1250 / sequence.length;

      // determine the index of the amino acid(s) to center the visualization generation around.
      var middleAminoAcid = Math.floor(sequence.length / 2);

      // define scales
      x = d3.scale
        .linear()
        .domain([xMin, xMax])
        .range([0, options.interactiveTitle.width]);
      y = d3.scale.linear().range([options.interactiveTitle.height, 0]);

      // prepare to add individual text element for each character in the peptide sequence. The class is called "aminoacid".
      dataset = this.titleContainer.selectAll(".aminoacid").data(sequence);
      dataset.enter().append("text").attr("class", "aminoacid");

      // at a font size of 30, we can fit about 22 amino acids on the chart. This is a nice size for a peptide
      if (sequence.length < 22) {
        fontSize = 20;

        // this spacing factor was determined from trial and error using a font size of 30.
        spacingFactor = 0.041;

        // define the horizontal position of each amino acid
        dataset
          .attr("x", function (d, i) {
            var indexDistance = i - middleAminoAcid;
            // If the number of amino acids is even, shift the text placement over by 50% so it remains centered.
            if (sequence.length % 2 == 0) {
              indexDistance += 0.5;
            }
            return x(interactiveChartWidth / 2 + indexDistance * spacingFactor);
          })
          .attr("opacity", 0)
          // if the amino acid is modified, make it lower case
          .text(function (d, i) {
            if (mods[i + 1].deltaMass == 0) {
              return d;
            } else {
              return d.toLowerCase();
            }
            // center the text vertically
          })
          .attr("y", function () {
            return y(0.5);
          })
          .style("font-size", function () {
            return fontSize + "px";
          })
          .transition()
          .delay(function (d, i) {
            return i * delay;
            // transition the opacity of the amino acid character from 0 to 100% over 1.5 seconds.
          })
          .duration(1500)
          .attr("opacity", 1);
      } else {
        // for longer amino acids, we handle the even spacing by changing the font size.
        fullTitleSpacing = 0.9 / sequence.length;

        // the font size is determined by the following linear equation
        // it solves to font size = 30 at peptide length 22 and font size 20 at peptide length 50.
        // It seems a little hacky, but it will work for any peptide less than ~105 amino acids long.
        fontSize = -0.3571 * sequence.length + 37.857;
        dataset
          .attr("x", function (d, i) {
            // space the amino acid letters out evenly depending on sequence length
            return x(fullTitleSpacing * i + fullTitleStart);
          })
          .attr("opacity", 0)
          // modified amino acids are sent to lower case
          .text(function (d, i) {
            if (mods[i + 1].deltaMass == 0) {
              return d;
            } else {
              return d.toLowerCase();
            }
            // vertically center text.
          })
          .attr("y", function () {
            return y(0.5);
          })
          .style("font-size", function () {
            return fontSize + "px";
          })
          .transition()
          .delay(function (d, i) {
            return i * delay;
          })
          .duration(1500)
          .attr("opacity", 1);
      }

      // remove unneeded amino acids
      dataset.exit().remove();

      // now place bar ticks for observed fragments
      // We use svg paths instead of bars since they're easier to orient
      // calculate svg points for each label
      var xValue;
      var yTick, yHook, xHook, indexDistance;
      // define d3 line object which will handle line generation from our data.
      var line = d3.svg
        .line()
        .x(function (d) {
          return x(d.x);
        })
        .y(function (d) {
          return y(d.y);
        })
        .interpolate("linear");

      // Here we define the x and y coordinates to draw fragment markings between the amino acid characters
      if (sequence.length < 22) {
        aminoAcidTicks.forEach(function (labelTick) {
          // these annotations point upwards.
          if (
            labelTick.text == "a" ||
            labelTick.text == "b" ||
            labelTick.text == "c" ||
            labelTick.text == "C"
          ) {
            indexDistance = labelTick.location - middleAminoAcid;
            if (sequence.length % 2 == 1) {
              indexDistance -= 0.5;
            }

            // X location
            xValue = interactiveChartWidth / 2 + indexDistance * spacingFactor;
            // xHook and yHook is used to add a 'hook' at the end the marking to indicate what side the fragment is on.
            yHook = 0.15;
            xHook = -0.01;

            // add different height markings to prevent visualization overlap. Values determined by trial and error. Gives nice spacing between
            if (labelTick.text == "a") {
              yTick = 0.15;
            } else if (labelTick.text == "b") {
              yTick = 0.23;
            } else if (labelTick.text == "c") {
              yTick = 0.31;
            } else if (labelTick.text == "C") {
              yTick = 0.39;
            }
            // slightly different values for x,y,z fragments. They point downwards instead.
          } else if (
            labelTick.text == "x" ||
            labelTick.text == "y" ||
            labelTick.text == "z" ||
            labelTick.text == "Z"
          ) {
            indexDistance = -(labelTick.location - middleAminoAcid);
            if (sequence.length % 2 == 1) {
              indexDistance += 0.5;
            }
            xValue = interactiveChartWidth / 2 + indexDistance * spacingFactor;
            yHook = -0.15;
            xHook = 0.01;
            if (labelTick.text == "x") {
              yTick = -0.15;
            } else if (labelTick.text == "y") {
              yTick = -0.23;
            } else if (labelTick.text == "z") {
              yTick = -0.31;
            } else if (labelTick.text == "Z") {
              yTick = -0.39;
            }
          }
          labelTick.points = [
            { x: xValue, y: 0.5 },
            { x: xValue, y: 0.5 + yTick },
            { x: xValue + xHook, y: 0.5 + yTick + yHook },
          ];
        });
      } else {
        // same logic as before, except this section has logic to handle peptides with length > 22.
        aminoAcidTicks.forEach(function (labelTick) {
          if (
            labelTick.text == "a" ||
            labelTick.text == "b" ||
            labelTick.text == "c" ||
            labelTick.text == "C"
          ) {
            xValue =
              fullTitleStart + fullTitleSpacing * (labelTick.location - 0.5);
            yHook = 0.15;
            xHook = -0.01;
            if (labelTick.text == "a") {
              yTick = 0.15;
            } else if (labelTick.text == "b") {
              yTick = 0.23;
            } else if (labelTick.text == "c") {
              yTick = 0.31;
            } else if (labelTick.text == "C") {
              yTick = 0.39;
            }
          } else if (
            labelTick.text == "x" ||
            labelTick.text == "y" ||
            labelTick.text == "z" ||
            labelTick.text == "Z"
          ) {
            xValue =
              fullTitleEnd - fullTitleSpacing * (labelTick.location + 0.5);
            yHook = -0.15;
            xHook = 0.01;
            if (labelTick.text == "x") {
              yTick = -0.15;
            } else if (labelTick.text == "y") {
              yTick = -0.23;
            } else if (labelTick.text == "z") {
              yTick = -0.31;
            } else if (labelTick.text == "Z") {
              yTick = -0.39;
            }
          }
          labelTick.points = [
            { x: xValue, y: 0.5 },
            { x: xValue, y: 0.5 + yTick },
            { x: xValue + xHook, y: 0.5 + yTick + yHook },
          ];
        });
      }

      // add the lines
      dataset = this.titleContainer.selectAll(".line").data(aminoAcidTicks);

      dataset.enter().append("path").attr("class", "line");

      dataset
        .attr("d", function (d) {
          return line(d.points);
        })
        .attr("opacity", 0)
        .style("stroke", function (d) {
          return d.color;
        })
        .transition()
        .delay(function (d, i) {
          return i * delay;
        })
        .duration(1500)
        .attr("opacity", 1);

      dataset.exit().remove();
    },

    drawInteractiveTitleBottom: function () {
      var x,
        y,
        dataset,
        options = this.getOptions(),
        sequence = this.getSequenceBottom(),
        aminoAcidTicks = this.getTickData(false),
        mods = this.getModificationsBottom();
      // set variables to plot interactive title

      // the min and max units defined here are somewhat arbitrary. Since the scaling is meant to evenly distribute one letter abbreviations, the actual units aren't important,
      // just the proportions. I chose a scale of [0,1] as it made sense to represent the placement as
      var xMin = 0;
      var xMax = 1;
      var interactiveChartWidth = xMax - xMin;
      var spacingFactor;
      var fontSize;
      var fullTitleSpacing;
      var fullTitleStart = 0.05;
      var fullTitleEnd = 0.95;

      // define a transition delay based on peptide length.
      var delay = 1250 / sequence.length;

      // determine the index of the amino acid(s) to center the visualization generation around.
      var middleAminoAcid = Math.floor(sequence.length / 2);

      // define scales
      x = d3.scale
        .linear()
        .domain([xMin, xMax])
        .range([0, options.interactiveTitleBottom.width]);
      y = d3.scale.linear().range([options.interactiveTitleBottom.height, 0]);

      // prepare to add individual text element for each character in the peptide sequence. The class is called "aminoacid".
      dataset = this.titleContainerBottom
        .selectAll(".aminoacid")
        .data(sequence);
      dataset.enter().append("text").attr("class", "aminoacid");

      // at a font size of 30, we can fit about 22 amino acids on the chart. This is a nice size for a peptide
      if (sequence.length < 22) {
        fontSize = 20;

        // this spacing factor was determined from trial and error using a font size of 30.
        spacingFactor = 0.041;

        // define the horizontal position of each amino acid
        dataset
          .attr("x", function (d, i) {
            var indexDistance = i - middleAminoAcid;
            // If the number of amino acids is even, shift the text placement over by 50% so it remains centered.
            if (sequence.length % 2 == 0) {
              indexDistance += 0.5;
            }
            return x(interactiveChartWidth / 2 + indexDistance * spacingFactor);
          })
          .attr("opacity", 0)
          // if the amino acid is modified, make it lower case
          .text(function (d, i) {
            if (mods[i + 1].deltaMass == 0) {
              return d;
            } else {
              return d.toLowerCase();
            }
            // center the text vertically
          })
          .attr("y", function () {
            return y(0.5);
          })
          .style("font-size", function () {
            return fontSize + "px";
          })
          .transition()
          .delay(function (d, i) {
            return i * delay;
            // transition the opacity of the amino acid character from 0 to 100% over 1.5 seconds.
          })
          .duration(1500)
          .attr("opacity", 1);
      } else {
        // for longer amino acids, we handle the even spacing by changing the font size.
        fullTitleSpacing = 0.9 / sequence.length;

        // the font size is determined by the following linear equation
        // it solves to font size = 30 at peptide length 22 and font size 20 at peptide length 50.
        // It seems a little hacky, but it will work for any peptide less than ~105 amino acids long.
        fontSize = -0.3571 * sequence.length + 37.857;
        dataset
          .attr("x", function (d, i) {
            // space the amino acid letters out evenly depending on sequence length
            return x(fullTitleSpacing * i + fullTitleStart);
          })
          .attr("opacity", 0)
          // modified amino acids are sent to lower case
          .text(function (d, i) {
            if (mods[i + 1].deltaMass == 0) {
              return d;
            } else {
              return d.toLowerCase();
            }
            // vertically center text.
          })
          .attr("y", function () {
            return y(0.5);
          })
          .style("font-size", function () {
            return fontSize + "px";
          })
          .transition()
          .delay(function (d, i) {
            return i * delay;
          })
          .duration(1500)
          .attr("opacity", 1);
      }

      // remove unneeded amino acids
      dataset.exit().remove();

      // now place bar ticks for observed fragments
      // We use svg paths instead of bars since they're easier to orient
      // calculate svg points for each label
      var xValue;
      var yTick, yHook, xHook, indexDistance;
      // define d3 line object which will handle line generation from our data.
      var line = d3.svg
        .line()
        .x(function (d) {
          return x(d.x);
        })
        .y(function (d) {
          return y(d.y);
        })
        .interpolate("linear");

      // Here we define the x and y coordinates to draw fragment markings between the amino acid characters
      if (sequence.length < 22) {
        aminoAcidTicks.forEach(function (labelTick) {
          // these annotations point upwards.
          if (
            labelTick.text == "a" ||
            labelTick.text == "b" ||
            labelTick.text == "c" ||
            labelTick.text == "C"
          ) {
            indexDistance = labelTick.location - middleAminoAcid;
            if (sequence.length % 2 == 1) {
              indexDistance -= 0.5;
            }

            // X location
            xValue = interactiveChartWidth / 2 + indexDistance * spacingFactor;
            // xHook and yHook is used to add a 'hook' at the end the marking to indicate what side the fragment is on.
            yHook = 0.15;
            xHook = -0.01;

            // add different height markings to prevent visualization overlap. Values determined by trial and error. Gives nice spacing between
            if (labelTick.text == "a") {
              yTick = 0.15;
            } else if (labelTick.text == "b") {
              yTick = 0.23;
            } else if (labelTick.text == "c") {
              yTick = 0.31;
            } else if (labelTick.text == "C") {
              yTick = 0.39;
            }
            // slightly different values for x,y,z fragments. They point downwards instead.
          } else if (
            labelTick.text == "x" ||
            labelTick.text == "y" ||
            labelTick.text == "z" ||
            labelTick.text == "Z"
          ) {
            indexDistance = -(labelTick.location - middleAminoAcid);
            if (sequence.length % 2 == 1) {
              indexDistance += 0.5;
            }
            xValue = interactiveChartWidth / 2 + indexDistance * spacingFactor;
            yHook = -0.15;
            xHook = 0.01;
            if (labelTick.text == "x") {
              yTick = -0.15;
            } else if (labelTick.text == "y") {
              yTick = -0.23;
            } else if (labelTick.text == "z") {
              yTick = -0.31;
            } else if (labelTick.text == "Z") {
              yTick = -0.39;
            }
          }
          labelTick.points = [
            { x: xValue, y: 0.5 },
            { x: xValue, y: 0.5 + yTick },
            { x: xValue + xHook, y: 0.5 + yTick + yHook },
          ];
        });
      } else {
        // same logic as before, except this section has logic to handle peptides with length > 22.
        aminoAcidTicks.forEach(function (labelTick) {
          if (
            labelTick.text == "a" ||
            labelTick.text == "b" ||
            labelTick.text == "c" ||
            labelTick.text == "C"
          ) {
            xValue =
              fullTitleStart + fullTitleSpacing * (labelTick.location - 0.5);
            yHook = 0.15;
            xHook = -0.01;
            if (labelTick.text == "a") {
              yTick = 0.15;
            } else if (labelTick.text == "b") {
              yTick = 0.23;
            } else if (labelTick.text == "c") {
              yTick = 0.31;
            } else if (labelTick.text == "C") {
              yTick = 0.39;
            }
          } else if (
            labelTick.text == "x" ||
            labelTick.text == "y" ||
            labelTick.text == "z" ||
            labelTick.text == "Z"
          ) {
            xValue =
              fullTitleEnd - fullTitleSpacing * (labelTick.location + 0.5);
            yHook = -0.15;
            xHook = 0.01;
            if (labelTick.text == "x") {
              yTick = -0.15;
            } else if (labelTick.text == "y") {
              yTick = -0.23;
            } else if (labelTick.text == "z") {
              yTick = -0.31;
            } else if (labelTick.text == "Z") {
              yTick = -0.39;
            }
          }
          labelTick.points = [
            { x: xValue, y: 0.5 },
            { x: xValue, y: 0.5 + yTick },
            { x: xValue + xHook, y: 0.5 + yTick + yHook },
          ];
        });
      }

      // add the lines
      dataset = this.titleContainerBottom
        .selectAll(".line")
        .data(aminoAcidTicks);

      dataset.enter().append("path").attr("class", "line");

      dataset
        .attr("d", function (d) {
          return line(d.points);
        })
        .attr("opacity", 0)
        .style("stroke", function (d) {
          return d.color;
        })
        .transition()
        .delay(function (d, i) {
          return i * delay;
        })
        .duration(1500)
        .attr("opacity", 1);

      dataset.exit().remove();
    },
    drawLine: function (x, y, d) {
      // Generate x and y coordinates from the spectral data and the current location of the label.
      d.points = [];
      d.points.push({ x: d.mz, y: d.percentBasePeak });
      d.points.push({ x: d.x, y: d.y });

      // define a linear function to translate numerical data to the svg coordinates
      let lineGenerator = d3.svg
        .line()
        .x(function (e) {
          return x(e.x);
        })
        .y(function (e) {
          return y(e.y);
        });

      // define line interpolation depending on if the label is located above or below the spectral peak.
      d3.select("#plotContainer")
        .selectAll(".line")
        .attr("d", function (d) {
          if (d.y > d.percentBasePeak) {
            lineGenerator.interpolate("step-before");
          } else {
            lineGenerator.interpolate("step-after");
          }
          return lineGenerator(d.points);
        })
        .attr("opacity", 1)
        .style("stroke", function (d) {
          return d.color;
        })
        .style("stroke-dasharray", "4,4")
        .style("stroke-width", 0.5);
    },

    initialize: function () {
      // get svg dimensions and settings
      var options = this.getOptions();
      // create svg element to hold charts
      this.svg = d3.select(this.$el).append("svg").attr("class", "chart");
      //.attr("width", options.renderSize.width)
      //.attr("height", options.renderSize.height);

      // svg element to show peptide sequence and fragment locations
      this.titleContainer = this.svg.append("g").attr("id", "titleContainer");
      this.titleContainerBottom = this.svg
        .append("g")
        .attr("id", "titleContainerBottom");

      // svg element to show summary data about peptide
      this.peptideContainer = this.svg
        .append("g")
        .attr("id", "peptideContainer");
      this.peptideContainerBottom = this.svg
        .append("g")
        .attr("id", "peptideContainerBottom");
      // svg element to show correlation info about peptide
      this.statisticsContainer = this.svg
        .append("g")
        .attr("id", "statisticsContainer");
      this.statisticsContainerBottom = this.svg
        .append("g")
        .attr("id", "statisticsContainerBottom");

      // svg element to show origin of spectrum
      this.originContainer = this.svg.append("g").attr("id", "originContainer");
      this.originContainerBottom = this.svg
        .append("g")
        .attr("id", "originContainerBottom");

      // main svg container to hold spectrum annotations
      this.container = this.svg.append("g").attr("id", "topSpectrumContainer");
      // last svg container to hold matched fragment ppm error
      this.fragmentContainer = this.svg
        .append("g")
        .attr("id", "fragmentContainer");
      // main svg container to hold spectrum annotations
      this.container2 = this.svg
        .append("g")
        .attr("id", "bottomSpectrumContainer");

      // invisible rectangle on Y axis used to catch zoom events
      this.zoomY = this.container
        .append("rect")
        .attr("id", "yZoom")
        .attr("fill", "none")
        .attr("x", -options.annotation.margin.left)
        .attr("y", "0")
        .attr("pointer-events", "all")
        .attr("width", options.annotation.margin.left)
        .attr("height", options.annotation.height)
        .style("cursor", "n-resize");

      // invisible rectangle on X axis used to catch zoom events
      this.zoomX = this.container
        .append("rect")
        .attr("id", "xZoom")
        .attr("fill", "none")
        .attr("x", "0")
        .attr("y", options.annotation.height)
        .attr("pointer-events", "all")
        .attr("width", options.annotation.width)
        .attr("height", options.annotation.margin.zoomXHeight)
        .style("cursor", "w-resize");

      // invisible rectangle on Y axis used to catch zoom events
      this.zoomY2 = this.container2
        .append("rect")
        .attr("id", "yZoom2")
        .attr("fill", "none")
        .attr("x", -options.annotation.margin.left)
        .attr("y", "0")
        .attr("pointer-events", "all")
        .attr("width", options.annotation.margin.left)
        .attr("height", options.annotation.height)
        .style("cursor", "n-resize");

      // invisible rectangle on X axis used to catch zoom events
      this.zoomX2 = this.container2
        .append("rect")
        .attr("id", "xZoom2")
        .attr("fill", "none")
        .attr("x", "0")
        .attr("y", -options.annotation.margin.zoomXHeightBottom)
        .attr("pointer-events", "all")
        .attr("width", options.annotation.width)
        .attr("height", options.annotation.margin.zoomXHeightBottom)
        .style("cursor", "w-resize");

      // container to hold annotated spectrum
      this.plotContainer = this.container
        .append("g")
        .attr("id", "annotationContainer");
      // container to hold annotated spectrum
      this.plotContainer2 = this.container2
        .append("g")
        .attr("id", "annotationContainer2");

      // container to hold mass error dot plot
      this.massErrorContainer = this.fragmentContainer
        .append("g")
        .attr("id", "massErrorContainer");

      // add x axis container and label
      this.container
        .append("g")
        .attr("class", "xAnnotation")
        .append("text")
        .attr("class", "xAnnotationLabel")
        .attr(
          "transform",
          "translate(" +
            (options.annotation.width / 2 -
              options.annotation.margin.xAxisLabelPadding) +
            " ," +
            (options.annotation.margin.bottom + 2) +
            ")"
        )
        .text("m/z");

      // add y axis container and label
      this.container
        .append("g")
        .attr("class", "yAnnotation")
        .append("text")
        .attr("class", "yAnnotationLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - options.annotation.margin.left)
        .attr("x", 0 - options.annotation.height / 2)
        .attr("dy", "1em")
        .text("Relative Abundance (%)");

      // place a clip mask over the annotated spectrum container to prevent svg elements from displaying out of the SVG when zooming.
      this.plotContainer
        .append("clipPath")
        .attr("id", "clippy")
        .append("rect")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", options.annotation.width)
        .attr("height", options.annotation.height);

      // add x axis container and label
      this.container2.append("g").attr("class", "xAnnotation").append("text");

      // add y axis container and label
      this.container2
        .append("g")
        .attr("class", "yAnnotation")
        .append("text")
        .attr("class", "yAnnotationLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - options.annotation.margin.left)
        .attr("x", 0 - options.annotation.height / 2)
        .attr("dy", "1em")
        .text("Relative Abundance (%)");

      //TODO check later
      // place a clip mask over the annotated spectrum container to prevent svg elements from displaying out of the SVG when zooming.
      this.plotContainer2
        .append("clipPath")
        .attr("id", "clippy2")
        .append("rect")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", options.annotation.width)
        .attr("height", options.annotation.height);

      // Define location of the mass error chart relative to the rest of the SVG
      this.fragmentContainer.attr(
        "transform",
        "translate(" +
          options.fragments.margin.left +
          "," +
          options.offsets.middleOffset +
          ")"
      );

      // Define mass error chart x-axis
      this.fragmentContainer.append("g").attr("class", "xAnnotation");

      // Define mass error chart y-axis and axis label
      this.fragmentContainer
        .append("g")
        .attr("class", "yAnnotation")
        .append("text")
        .attr("class", "yAnnotationLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - options.annotation.margin.left)
        .attr("x", 0 - options.fragments.height / 2)
        .attr("dy", "1em")
        .attr("text-anchor", "middle");

      // Define mass error chart bottom x-axis
      this.fragmentContainer.append("g").attr("class", "xAnnotation_2");

      // Define mass error chart bottom y-axis
      this.fragmentContainer.append("g").attr("class", "yAnnotation_2");

      // place a clip mask over the mass error container to prevent svg elements from displaying out of the SVG when zooming.
      this.massErrorContainer
        .append("clipPath")
        .attr("id", "clippy2")
        .append("rect")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", options.fragments.width)
        .attr("height", options.fragments.height);

      // // position the container which will hold the marked peptide sequence
      this.container.attr(
        "transform",
        "translate(" +
          options.annotation.margin.left +
          ", " +
          options.annotation.margin.top +
          ")"
      );

      // bind the clip path to the annotated mass spectrum
      this.plotContainer.attr("clip-path", "url(#clippy)");

      // // position the container which will hold the marked peptide sequence
      this.container2.attr(
        "transform",
        "translate(" +
          options.annotation.margin.left +
          ", " +
          (options.annotation.margin.top + options.offsets.bottomOffset) +
          ")"
      );

      // bind the clip path to the annotated mass spectrum
      this.plotContainer2.attr("clip-path", "url(#clippy)");

      // position the container which will hold the marked peptide sequence
      this.titleContainer.attr(
        "transform",
        "translate(" +
          options.interactiveTitle.margin.left +
          ", " +
          options.interactiveTitle.margin.top +
          ")"
      );
      this.titleContainerBottom.attr(
        "transform",
        "translate(" +
          options.interactiveTitleBottom.margin.left +
          ", " +
          options.interactiveTitleBottom.margin.top +
          ")"
      );

      this.peptideContainer.attr(
        "transform",
        "translate(" +
          (options.statistics.margin.left + options.statistics.width / 2) +
          ", " +
          options.statistics.margin.top +
          ")"
      );
      this.peptideContainerBottom.attr(
        "transform",
        "translate(" +
          (options.statisticsBottom.margin.left +
            options.statisticsBottom.width / 2) +
          ", " +
          options.statisticsBottom.margin.top +
          ")"
      );
      this.statisticsContainer.attr(
        "transform",
        "translate(" +
          (options.statistics.margin.left + options.statistics.width / 2) +
          ", " +
          options.statistics.margin.top +
          ")"
      );
      this.statisticsContainerBottom.attr(
        "transform",
        "translate(" +
          (options.statisticsBottom.margin.left +
            options.statisticsBottom.width / 2) +
          ", " +
          options.statisticsBottom.margin.top +
          ")"
      );

      this.originContainer.attr(
        "transform",
        "translate(" +
          (options.statistics.margin.left + options.statistics.width / 2) +
          ", " +
          options.statistics.margin.top +
          ")"
      );
      this.originContainerBottom.attr(
        "transform",
        "translate(" +
          (options.statisticsBottom.margin.left +
            options.statisticsBottom.width / 2) +
          ", " +
          options.statisticsBottom.margin.top +
          ")"
      );

      // bind the clip path to the mass error chart
      this.massErrorContainer.attr("clip-path", "url(#clippy2)");

      // set the svg size. this function scales the svg using the viewBox attribute.
      this.setSvgSize();
    },
    getOptions: function () {
      return {
        svg: {
          width: 700,
          height: this.height,
          margin: {
            top: 0,
            right: 15,
            bottom: 35,
            left: 60,
          },
          padding: 0.05,
        },
        renderSize: {
          width: 1080,
          height: 885,
        },
        interactiveTitle: {
          width: 700,
          height: (this.height * 6) / 100,
          margin: {
            top: 5,
            right: 15,
            bottom: 0,
            left: 60,
          },
          padding: 0.05,
        },
        interactiveTitleBottom: {
          width: 700,
          height: (this.height * 6) / 100,
          margin: {
            top: this.height - (this.height * 6) / 100,
            right: 15,
            bottom: 0,
            left: 60,
          },
          padding: 0.05,
        },
        statistics: {
          width: 700,
          height: (this.height * 4) / 100,
          margin: {
            top: (this.height * 10) / 100,
            right: 15,
            bottom: 0,
            left: 60,
            categoryPadding_2: 80,
            categoryPadding_3: 220,
            categoryPadding_4: 65,
            categoryPadding_5: 35,
            dataPadding_1: -100,
            dataPadding_2: -20,
            dataPadding_3: 115,
            dataPadding_4: 40,
            dataPadding_5: 40,
          },
          padding: 0.05,
        },
        statisticsBottom: {
          width: 700,
          height: (this.height * 4) / 100,
          margin: {
            top: this.height - (this.height * 16) / 100,
            right: 15,
            bottom: 35,
            left: 60,
            categoryPadding_2: 80,
            categoryPadding_3: 320,
            categoryPadding_4: 65,
            categoryPadding_5: 35,
            categoryPadding_6: 15,
            dataPadding_1: -100,
            dataPadding_2: -20,
            dataPadding_3: 185,
            dataPadding_4: 40,
            dataPadding_5: 40,
            dataPadding_6: 40,
          },
          padding: 0.05,
        },
        annotation: {
          width: 700,
          zoomFactor: 1.1,
          height: (this.height * 18) / 100,
          heightBottom: (this.height * 18) / 100,
          margin: {
            top: (this.height * 20) / 100,
            right: 15,
            bottom: 26,
            left: 60,
            zoomXHeight: 45,
            zoomXHeightBottom: 30,
            yAxisLabelPadding: 70,
            xAxisLabelPadding: 20,
          },
          padding: 0.05,
        },
        fragments: {
          width: 700,
          height: (this.height * 9) / 100,
          margin: {
            top: 552,
            right: 15,
            bottom: 35,
            left: 60,
            yAxisLabelPadding: 60,
            xAxisLabelPadding: 20,
          },
          padding: 0.05,
        },
        offsets: {
          middleOffset: (this.height * 47) / 100,
          bottomOffset: (this.height * 42) / 100,
        },
      };
    },
    getPrecursorMz: function () {
      return this.peptide.precursorMz;
    },

    getPrecursorMzBottom: function () {
      return this.peptideBottom.precursorMz;
    },

    /**
     * @description Retrieves the peptide sequence.
     * @returns {string} The peptide amino acid sequence.
     */
    getSequence: function () {
      return this.peptide.sequence;
    },
    getSequenceBottom: function () {
      return this.peptideBottom.sequence;
    },

    /**
     * @description Retrieves the peptide precursor charge.
     * @returns {number} The peptide precursor charge.
     */
    getPrecursorCharge: function () {
      return this.peptide.precursorCharge;
    },

    getPrecursorChargeBottom: function () {
      return this.peptideBottom.precursorCharge;
    },

    /**
     * @description Retrieves all of the spectral mass to charge values
     * @example [100, 121.3154, 125.9435, ...]
     * @returns {Array} All experimental mass to charge values.
     */
    getX: function () {
      return this.plotdata.x;
    },

    /**
     * @description Retrieves all of the spectral mass to charge values
     * @example [100, 121.3154, 125.9435, ...]
     * @returns {Array} All experimental mass to charge values.
     */
    getMirrorX: function () {
      return this.mirrorplotdata.x;
    },

    getId: function () {
      return this.plotdata.id;
    },

    getIdMirror: function () {
      return this.plotdata.intensityErrorIdsBottom;
    },

    /**
     * @description Retrieves all of the spectral intensity values
     * @example [10000, 648059, 393403, ...]
     * @returns {Array} All experimental intensities values.
     */
    getIntensities: function () {
      return this.plotdata.y;
    },

    /**
     * @description Retrieves all of the spectral intensity values
     * @example [10000, 648059, 393403, ...]
     * @returns {Array} All experimental intensities values.
     */
    getMirrorIntensities: function () {
      return this.mirrorplotdata.y;
    },

    /**
     * @description Retrieves all of the spectral intensity values in percent relative abundance format. Min = 0, Max = 1.
     * @example [0.01, 0.12, .063, ...]
     * @returns {Array} All experimental intensity values in percent relative abundance format.
     */
    getPercentBasePeak: function () {
      return this.plotdata.percentBasePeak;
    },

    /**
     * @description Retrieves all of the spectral intensity values in percent relative abundance format. Min = 0, Max = 1.
     * @example [0.01, 0.12, .063, ...]
     * @returns {Array} All experimental intensity values in percent relative abundance format.
     */
    getMirrorPercentBasePeak: function () {
      return this.mirrorplotdata.percentBasePeak;
    },

    /**
     * @description Retrieves the previously specified colors to draw the spectral data with. Each spectral peak will have a color associated with it depending on what fragment types were
     *     specified and the colors specified in the control form. Colors must be provided in hexadecimal format.
     * @example ["#a6a6a6", "#0d75bc", "#be202d", ...]
     * @returns {Array} All colors in hexidecimal notation.
     */
    getColors: function () {
      return this.plotdata.color;
    },

    /**
     * @description Retrieves the previously specified colors to draw the spectral data with. Each spectral peak will have a color associated with it depending on what fragment types were
     *     specified and the colors specified in the control form. Colors must be provided in hexadecimal format.
     * @example ["#a6a6a6", "#0d75bc", "#be202d", ...]
     * @returns {Array} All colors in hexidecimal notation.
     */
    getMirrorColors: function () {
      return this.mirrorplotdata.color;
    },

    /**
     * @description Retrieves all the best matching fragment labels as an array. Spectral peaks which don't have a matching fragment should be listed as an empty string.
     * @example ["", "b1", "y1", ...]
     * @returns {Array} An array containing all annotated labels. Non-annotated peaks will have an empty string as a placeholder.
     */
    getLabels: function () {
      return this.plotdata.label;
    },

    /**
     * @description Retrieves all the best matching fragment labels as an array. Spectral peaks which don't have a matching fragment should be listed as an empty string.
     * @example ["", "b1", "y1", ...]
     * @returns {Array} An array containing all annotated labels. Non-annotated peaks will have an empty string as a placeholder.
     */
    getMirrorLabels: function () {
      return this.mirrorplotdata.label;
    },

    /**
     * @description Retrieves all the best matching fragment label charges as an array. Spectral peaks which don't have a matching fragment should be listed as 0.
     * @example ["0", "1", "2", ...]
     * @returns {Array} An array containing all annotated fragment charges. Non-annotated peaks will have 0 as a placeholder.
     */
    getLabelCharges: function () {
      return this.plotdata.labelCharge;
    },

    /**
     * @description Retrieves all the best matching fragment label charges as an array. Spectral peaks which don't have a matching fragment should be listed as 0.
     * @example ["0", "1", "2", ...]
     * @returns {Array} An array containing all annotated fragment charges. Non-annotated peaks will have 0 as a placeholder.
     */
    getMirrorLabelCharges: function () {
      return this.mirrorplotdata.labelCharge;
    },

    /**
     * @description Retrieves all the best matching fragment label neutral losses as an array. Spectral peaks which don't have a neutral loss should be listed as an empty string
     * @example ["", "", "2", ...]
     * @returns {Array} An array containing all annotated fragment neutral losses. Spectral peaks without a neutral loss will have an empty string as a placeholder
     */
    getNeutralLosses: function () {
      return this.plotdata.neutralLosses;
    },

    /**
     * @description Retrieves an array containing bar widths. These values are used to scale annotated peak widths differently.
     * @example ["1", "3", "3", ...]
     * @returns {Array} An array containing all bar widths. Non-annotated peaks default to width = 1. Annotated peaks have width = 3.
     */
    getWidths: function () {
      return this.plotdata.barwidth;
    },

    /**
     * @description Retrieves an array containing bar widths. These values are used to scale annotated peak widths differently.
     * @example ["1", "3", "3", ...]
     * @returns {Array} An array containing all bar widths. Non-annotated peaks default to width = 1. Annotated peaks have width = 3.
     */
    getMirrorWidths: function () {
      return this.mirrorplotdata.barwidth;
    },

    getMassErrorX: function () {
      return this.plotdata.massErrorX;
    },

    getIntensityErrorIdsTop: function () {
      return this.plotdata.intensityErrorIdsTop;
    },
    getIntensityErrorIdsBottom: function () {
      return this.plotdata.intensityErrorIdsBottom;
    },

    /**
     * @description Retrieves an array containing mass errors of annotated fragments. Non-annotated spectral features should default to empty strings.
     * @example ["", "3", "3", ...]
     * @returns {Array} An array containing all mass errors of annotated fragments. Non-annotated spectral features should default to empty strings.
     */
    getMassError: function () {
      return this.plotdata.massError;
    },

    getMassErrorBottomId: function () {
      return this.mirrorplotdata.id;
    },
    getMassErrorTopId: function () {
      return this.plotdata.id;
    },

    getIntensityError: function () {
      return this.plotdata.intensityError;
    },

    /**
     * @description Retrieves an array containing theoratical mass to charges of annotated fragments. Non-annotated spectral features should default to 0.
     * @example ["", "3", "3", ...]
     * @returns {Array} Retrieves an array containing theoratical mass to charges of annotated fragments. Non-annotated spectral features should default to 0.
     */
    getTheoreticalMz: function () {
      return this.plotdata.theoMz;
    },

    /**
     * @description Retrieves an object which contains the mass error minimum/maximum, mass error unit (ppm or Da), and ionization mode. These values are used in assigning a scale for the
     *     mass error portion of the visualization and charge signs.
     * @example settings: { toleranceThreshold: 10, toleranceType: "ppm", ionizationMode: "+" }
     * @returns {object} Retrieves an array containing theoratical mass to charges of annotated fragments. Non-annotated spectral features should default to 0.
     */
    getSettings: function () {
      return this.settings;
    },

    /**
     * @description Retrieves an array which contains an entry for every possible modifictaion position on the peptide. Modification locations are shown on the peptide sequence by changing
     *     the single character amino acid representations to lower case.
     * @example N-terminus (index -1) is unmodified. The first amino acid (index 0) has a water loss. [{site: -1, deltaElement: null, deltaMass: 0}, {site: 0, deltaElement: "H-2 O-1,
     *     deltaMass: -18.01056468403"}...]
     * @returns {array} retrieves all peptide modifications.
     */
    getModifications: function () {
      return this.peptide.mods || [];
    },

    getModificationsBottom: function () {
      return this.peptideBottom.mods || [];
    },

    getModifications2: function (topSpectrum) {
      if (topSpectrum) {
        return this.peptide.origin;
      } else {
        return this.peptideBottom.origin;
      }
    },

    getTickData: function (topSpectrum = true) {
      var returnArray = [];
      var labels = topSpectrum ? this.getLabels() : this.getMirrorLabels();
      var colors = topSpectrum ? this.getColors() : this.getMirrorColors();
      var length = topSpectrum
        ? this.getSequence().length
        : this.getSequenceBottom();
      var labelObj;
      var i;
      var tempLabel;

      for (i = 0; i < labels.length; i++) {
        tempLabel = labels[i];
        if (
          tempLabel.charAt(0) == "[" ||
          tempLabel.indexOf("IM") !== -1 ||
          tempLabel.indexOf("yb") !== -1
        ) {
          continue;
        }
        if (tempLabel) {
          labelObj = {
            text: tempLabel.charAt(0),
            location: parseInt(tempLabel.slice(1)),
            color: colors[i],
          };
          if (!this.containsLabelTick(labelObj, returnArray)) {
            returnArray.push(labelObj);
          }
        }

        returnArray.sort(function (a, b) {
          var aLoc;
          var bLoc;
          if (
            a.text == "a" ||
            a.text == "b" ||
            a.text == "c" ||
            a.text == "C"
          ) {
            aLoc = a.location;
          } else {
            aLoc = length - a.location;
          }

          if (
            b.text == "a" ||
            b.text == "b" ||
            b.text == "c" ||
            b.text == "C"
          ) {
            bLoc = b.location;
          } else {
            bLoc = length - b.location;
          }

          if (aLoc < bLoc) {
            return -1;
          } else if (aLoc > bLoc) {
            return 1;
          } else {
            if (a.text.toLowerCase() > b.text.toLowerCase()) {
              return -1;
            } else {
              return 1;
            }
          }
        });
      }
      return returnArray;
    },

    getFragmentedBonds: function (fragments, length) {
      var numBonds = length - 1;

      // fill an array representing all the unique peptide bonds. N-terminus index = 0
      // a peptide of length 8 has 7 bonds. E.g the peptide "P-E-P-T-I-D-E-K"
      var bondArray = new Array(numBonds).fill(0);

      // mark the bond array with the locations of fragmentation events. The value 1 means a fragmentation event has happened at the specific bond.
      fragments.forEach(function (fragment) {
        if (
          fragment.text == "a" ||
          fragment.text == "b" ||
          fragment.text == "c" ||
          fragment.text == "C"
        ) {
          bondArray[fragment.location - 1] = 1;
        } else if (
          fragment.text == "x" ||
          fragment.text == "y" ||
          fragment.text == "z" ||
          fragment.text == "Z"
        ) {
          bondArray[-(fragment.location - numBonds)] = 1;
        }
      });

      // calculate how many bonds were broken.
      var uniqueBondsBroken = bondArray.reduce(function (a, b) {
        return a + b;
      }, 0);
      return uniqueBondsBroken + "/" + numBonds;
    },

    setSvgSize: function () {
      var options = this.getOptions();

      d3.select(".chart")
        .attr(
          "viewBox",
          "0 0 " +
            (options.svg.width +
              options.svg.margin.left +
              options.svg.margin.right) +
            " " +
            (options.svg.height +
              options.svg.margin.top +
              options.svg.margin.bottom)
        )
        .attr("preserveAspectRatio", "xMinYMin");

      // this.redraw actually creates the axes and chart elements.
      this.redraw();
    },
    formatLabel: function (label, neutralLoss, charge, ionizationMode) {
      // string to be returned from function
      var returnString = "";
      // Lazy cast charge to a string
      charge += "";

      // if there is a label to format, format it
      if (label) {
        // special logic to format labels containing brackets i.e. unreacted precursor
        if (label[0] == "[") {
          label = label.slice(1, -1);

          // [M+2H-H₂O]⁺²
          returnString +=
            "[" + label + this.formatNeutralLoss(neutralLoss) + "]";

          // add unicode superscripts and charges to multiply charged fragment ions
          if (charge > 1) {
            if (ionizationMode == "+") {
              returnString += "\u207a";
            } else {
              returnString += "\u207b";
            }

            // transform every character in the charge variable into superscripts
            for (i = 0; i < charge.length; i++) {
              returnString += this.powerUnicode(charge[i], false);
            }
          }
        } else {
          // normal logic to format

          var fragmentNumber =
            label.indexOf("_") === -1 ? label.slice(1) : label.slice(2);

          // generate labels for positive mode fragment ions
          if (ionizationMode == "+") {
            // labels for singly-charged ions
            if (charge == 1) {
              // labels for c-1 ions
              if (label[0] == "C") {
                returnString += "[c";
                for (i = 0; i < fragmentNumber.length; i++) {
                  returnString += this.powerUnicode(fragmentNumber[i], true);
                }
                returnString +=
                  "-H" + this.formatNeutralLoss(neutralLoss) + "]";
                // labels for z+1 ions
              } else if (label[0] == "Z") {
                returnString += "[z";
                for (i = 0; i < fragmentNumber.length; i++) {
                  returnString += this.powerUnicode(fragmentNumber[i], true);
                }
                returnString +=
                  "+H" + this.formatNeutralLoss(neutralLoss) + "]";
              } else if (label.slice(0, 2) === "IM") {
                returnString += label;

                // logic for a,b,c,x,y,z fragment ions with neutral losses
              } else if (neutralLoss) {
                returnString += "[" + label[0];

                // add a unicode bullet to z-ions to support etd fragmentation
                if (label[0] == "z") {
                  returnString += "\u2022";
                }
                for (i = 0; i < fragmentNumber.length; i++) {
                  returnString += this.powerUnicode(fragmentNumber[i], true);
                }
                returnString += this.formatNeutralLoss(neutralLoss) + "]";
                // logic for a,b,c,x,y,z fragment ions without neutral losses
              } else {
                returnString +=
                  label.indexOf("_") === -1 ? label[0] : label.slice(0, 2);
                // add a unicode bullet to z-ions to support etd fragmentation
                if (label[0] == "z") {
                  returnString += "\u2022";
                }
                for (i = 0; i < fragmentNumber.length; i++) {
                  if (fragmentNumber[i] !== "_") {
                    returnString += this.powerUnicode(fragmentNumber[i], true);
                  } else {
                    returnString += this.powerUnicode(10, true);
                  }
                }
              }
              // labels for multiply-charged ions
            } else {
              // labels for c-1 ions
              if (label[0] == "C") {
                returnString += "[c";
                for (i = 0; i < fragmentNumber.length; i++) {
                  returnString += this.powerUnicode(fragmentNumber[i], true);
                }
                returnString +=
                  "-H" + this.formatNeutralLoss(neutralLoss) + "]" + "\u207a";
                for (i = 0; i < charge.length; i++) {
                  returnString += this.powerUnicode(charge[i]);
                }
                // labels for z+1 ions
              } else if (label[0] == "Z") {
                returnString += "[z";
                for (i = 0; i < fragmentNumber.length; i++) {
                  returnString += this.powerUnicode(fragmentNumber[i], true);
                }
                returnString +=
                  "+H" + this.formatNeutralLoss(neutralLoss) + "]" + "\u207a";
                for (i = 0; i < charge.length; i++) {
                  returnString += this.powerUnicode(charge[i]);
                }
                // logic for a,b,c,x,y,z fragment ions with neutral losses
              } else {
                if (neutralLoss) {
                  returnString += "[" + label[0];
                  if (label[0] == "z") {
                    returnString += "\u2022";
                  }
                  for (i = 0; i < fragmentNumber.length; i++) {
                    returnString += this.powerUnicode(fragmentNumber[i], true);
                  }
                  returnString +=
                    this.formatNeutralLoss(neutralLoss) + "]" + "\u207a";
                  for (i = 0; i < charge.length; i++) {
                    returnString += this.powerUnicode(charge[i]);
                  }
                  // logic for a,b,c,x,y,z fragment ions without neutral losses
                } else {
                  returnString += label[0];
                  if (label[0] == "z") {
                    returnString += "\u2022";
                  }
                  for (i = 0; i < fragmentNumber.length; i++) {
                    returnString += this.powerUnicode(fragmentNumber[i], true);
                  }
                  returnString += "\u207a";
                  for (i = 0; i < charge.length; i++) {
                    returnString += this.powerUnicode(charge[i]);
                  }
                }
              }
            }
            // generate labels for negative mode fragment ions
          } else {
            // labels for singly-charged ions
            if (charge == 1) {
              // labels for a• ions
              if (label[0] == "a") {
                // a• ions with neutral losses
                if (neutralLoss) {
                  returnString += "[a\u2022";
                  for (i = 0; i < fragmentNumber.length; i++) {
                    returnString += this.powerUnicode(fragmentNumber[i], true);
                  }
                  returnString += this.formatNeutralLoss(neutralLoss) + "]";
                  // a• ions without neutral losses
                } else {
                  returnString += "a\u2022";
                  for (i = 0; i < fragmentNumber.length; i++) {
                    returnString += this.powerUnicode(fragmentNumber[i], true);
                  }
                }
                // logic for b,c,x,y,z fragment ions with neutral losses
              } else if (neutralLoss) {
                returnString += "[" + label[0];
                for (i = 0; i < fragmentNumber.length; i++) {
                  returnString += this.powerUnicode(fragmentNumber[i], true);
                }
                returnString += this.formatNeutralLoss(neutralLoss) + "]";
                // logic for b,c,x,y,z fragment ions without neutral losses
              } else {
                returnString += label[0];
                for (i = 0; i < fragmentNumber.length; i++) {
                  returnString += this.powerUnicode(fragmentNumber[i], true);
                }
              }
              // labels for multiply-charged ions
            } else {
              // labels for ions with neutral losses
              if (neutralLoss) {
                returnString += "[" + label[0];
                // labels for a• ions
                if (label[0] == "a") {
                  returnString += "\u2022";
                }
                // subscript fragment numbers
                for (i = 0; i < fragmentNumber.length; i++) {
                  returnString += this.powerUnicode(fragmentNumber[i], true);
                }
                // add neutral losses
                returnString +=
                  this.formatNeutralLoss(neutralLoss) + "]" + "\u207b";
                // superscript the fragment charge
                for (i = 0; i < charge.length; i++) {
                  returnString += this.powerUnicode(charge[i]);
                }
                // format regular fragment ion i.e. y3
              } else {
                returnString += label[0];
                if (label[0] == "a") {
                  returnString += "\u2022";
                }
                for (i = 0; i < fragmentNumber.length; i++) {
                  returnString += this.powerUnicode(fragmentNumber[i], true);
                }
                returnString += "\u207b";
                for (var i = 0; i < charge.length; i++) {
                  returnString += this.powerUnicode(charge[i]);
                }
              }
            }
          }
        }
      }
      return returnString;
    },
    formatLabelPower: function (d) {
      var returnString = d.charAt(0);

      if (returnString == "z") {
        returnString += "\u2022";
      }
      for (var i = 1; i < d.length; i++) {
        returnString += this.powerUnicode(d.charAt(i), true);
      }
      return returnString;
    },
    powerUnicode: function (number, isSubscript) {
      if (isSubscript) {
        return this.subscript[number];
      } else {
        return this.superscript[number];
      }
    },
    formatAxisPower: function (d) {
      return (d + "")
        .split("")
        .map(function (c) {
          return this.superscript[c];
        })
        .join("");
    },
    containsLabelTick: function (obj, list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].text == obj.text && list[i].location == obj.location) {
          return true;
        }
      }
      return false;
    },
    formatNeutralLoss: function (string) {
      var returnString = "";

      if (string) {
        var char = "";
        var length = string.length;
        for (var i = 0; i < length; i++) {
          char = string.charAt(i);
          // subscript numbers
          if (/[0-9]/.test(char)) {
            returnString += this.subscript[char];
          } else {
            returnString += char;
          }
        }
      }

      return returnString;
    },

    /**
     * @description Define tooltip popups to be later called during interactive mouseovers
     */
  },
  mounted: function () {
    this.initialize();
  },
};
</script>

<style lang="scss">
.spectrum-viewer {
  min-width: 900px;
    
  .navbar-default {
    background-color: #231d49;
    border-color: #534e72;
  }

  .navbar-default .navbar-brand {
    color: #ffffff;
  }

  .navbar-default .navbar-brand:hover,
  .navbar-default .navbar-brand:focus {
    color: #ffffff;
    background-color: #534e72;
  }

  .navbar-default .navbar-text {
    color: #ffffff;
  }

  .navbar-default .navbar-nav > li > a {
    color: #ffffff;
  }

  .navbar-default .navbar-nav > li > a:hover,
  .navbar-default .navbar-nav > li > a:focus {
    color: #ffffff;
    background-color: #534e72;
  }

  .navbar-default .navbar-nav > .active > a,
  .navbar-default .navbar-nav > .active > a:hover,
  .navbar-default .navbar-nav > .active > a:focus {
    color: #ffffff;
    background-color: #534e72;
  }
  .na .navbar-default .navbar-nav > .open > a,
  .navbar-default .navbar-nav > .open > a:hover,
  .navbar-default .navbar-nav > .open > a:focus {
    color: #ffffff;
    background-color: #534e72;
  }

  .navbar-default .navbar-toggle {
    border-color: #534e72;
  }

  .navbar-default .navbar-toggle:hover,
  .navbar-default .navbar-toggle:focus {
    background-color: #534e72;
  }

  .navbar-default .navbar-toggle .icon-bar {
    background-color: #ffffff;
  }

  .navbar-default .navbar-collapse,
  .navbar-default .navbar-form {
    border-color: #ffffff;
  }

  .navbar-default .navbar-link {
    color: #ffffff;
  }

  .navbar-default .navbar-link:hover {
    color: #ffffff;
  }

  .navbar-brand {
    font-size: 40px;
  }

  .navbar-nav {
    font-size: 16px;
  }

  .navbar .divider-vertical {
    height: 30px;
    margin-top: 10px;
    border-right: 1px solid #ffffff;
  }

  /* panel css */
  .panel > .panel-heading {
    background-image: none;
    color: #ffffff;
    background-color: #231d49;
    border-color: #000000;
  }

  .select2-results li > div:hover {
    color: #ffffff;
    background: #000000;
  }

  .panel {
    border-color: #000000;
  }
  .panel-title {
    font-size: 22px;
  }

  .panel > .panel-body {
    background-image: none;
    background-color: #e2e2e3;
    border-color: #000000;
  }

  /* handsontable css */
  .handsontable table thead th {
    background-color: #231d49;
    color: white;
  }

  /* Button */
  /* fragment */
  .btn-fragment {
    background-color: rgba(51, 122, 183, 0.95);
    color: #ffffff;
    border-color: #555555;
    transition: all 0.5s;
  }

  .btn-fragment:hover,
  .btn-fragment:focus {
    color: #000000;
    background-color: rgba(51, 122, 183, 0.4);
    border-color: #555555;
  }

  .btn-fragment:active,
  .btn-fragment.active,
  .open .dropdown-toggle.btn-fragment {
    color: #000000;
    background-color: rgba(51, 122, 183, 0.4);
    border-color: #555555;
  }

  /* Class Font Options */
  .tick text {
    font-family: Montserrat, sans-serif;
    font-weight: 100;
  }

  label {
    font-family: Open Sans, sans-serif;
    font-size: 16px;
  }

  .filelabel {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  h3 {
    font-family: Montserrat, sans-serif;
    font-size: 16px;
  }

  .barlabel {
    font-family: Open Sans, sans-serif;
    text-anchor: middle;
    font-size: 12px;
  }

  .aminoacid {
    font-family: "Inconsolata", monospace;
    text-anchor: middle;
    alignment-baseline: central;
    dominant-baseline: central;
  }

  .precursorstatscategory,
  .origincategory,
  .origincategoryBottom {
    font-family: Montserrat, sans-serif;
    font-weight: 500;
    font-size: 12px;
  }

  .precursorstatsdata,
  .origindata.origin,
  .origindataBottom.origin {
    font-family: Montserrat, sans-serif;
    font-weight: 400;
    font-size: 12px;
  }

  .precursorstatscategoryBottom {
    font-family: Montserrat, sans-serif;
    font-weight: 500;
    font-size: 12px;
  }

  .precursorstatsdataBottom {
    font-family: Montserrat, sans-serif;
    font-weight: 400;
    font-size: 12px;
  }

  .zeroline {
    stroke-dasharray: 10, 5;
    stroke: #a6a6a6;
    fill: #a9a9a9;
  }

  /* D3 CSS */
  .chart .domain {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
  }

  .xAnnotationLabel,
  .yAnnotationLabel,
  .yQTLLabel,
  .yGeneLabel,
  .xLodLabel,
  .yLodLabel,
  .yAlleleLabel {
    font-family: Montserrat, sans-serif;
    font-weight: 700;
    font-size: 12px;
    text-anchor: middle;
  }
  .xAnnotation,
  .yAnnotation {
    font-family: Montserrat, sans-serif;
    font-size: 10px;
  }

  .xAnnotationLabel {
    font-style: italic;
  }

  .axis path,
  .axis line {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
  }

  .tick line {
    stroke: black;
  }

  .line {
    fill: none;
    stroke-width: 2;
  }

  /* probably won't work tooltip */
  .d3-tip {
    line-height: 1;
    font-weight: bold;
    padding: 12px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    border-radius: 2px;
    pointer-events: none;
  }

  /* Creates a small triangle extender for the tooltip */
  .d3-tip:after {
    box-sizing: border-box;
    display: inline;
    font-size: 10px;
    width: 100%;
    line-height: 1;
    color: rgba(0, 0, 0, 0.8);
    content: "\25BC";
    position: absolute;
    text-align: center;
    pointer-events: none;
  }

  /* Style northward tooltips differently */
  .d3-tip.n:after {
    margin: -1px 0 0 0;
    top: 100%;
    left: 0;
    pointer-events: none;
  }

  .ui-select-bootstrap .ui-select-choices-row > span {
    white-space: normal !important;
  }

  .ui-select-placeholder {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 95%;
  }

  .ui-select-match-text > span {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;
  }

  .ui-select-toggle {
    height: auto;
  }

  .ui-select-choices-row:hover {
    background-color: #3875d7;
    color: #fff;
  }

  div.valid-data i {
    vertical-align: middle;
  }

  /* unvisited link */
  a:link {
    color: #1c9cbc;
  }

  /* visited link */
  a:visited {
    color: purple;
  }

  /* mouse over link */
  a:hover {
    color: purple;
  }

  .pull-right {
    float: right !important;
    margin-top: 5px;
  }

  .table {
    margin-bottom: 0px;
    margin-top: 0px;
  }

  .d3-tip,
  .d3-tip n,
  .d3-tip e,
  .d3-tip s {
    z-index: 2000;
  }  
}

/* probably won't work tooltip */
.d3-tip {
  font-family: Open Sans, sans-serif;
  line-height: 1;
  font-weight: bold;
  padding: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 2px;
}

/* Creates a small triangle extender for the tooltip */
.d3-tip:after {
  box-sizing: border-box;
  display: inline;
  font-size: 10px;
  width: 100%;
  line-height: 1;
  color: rgba(0, 0, 0, 0.8);
  content: "\25BC";
  position: absolute;
  text-align: center;
}

/* Style northward tooltips differently */
.d3-tip.n:after {
  margin: -1px 0 0 0;
  top: 100%;
  left: 0;
}
</style>
