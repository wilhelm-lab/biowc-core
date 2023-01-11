<template>
  <v-card id="interactions" class="interactions"></v-card>
</template>

<script>
const d3 = require("d3");
export default {
  props: {
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 600,
    },
    sRelationTypeIds: {
      type: String,
      default: undefined,
    },
    graph: {
      type: Object,
      default: undefined,
    },
    markers: {
      type: Array,
      default: undefined,
    },
  },
  data: function () {
    return {
      busy: false,
      parentElement: this,
      aResourceTypes: [],
      simulation: null
    };
  },
  methods: {
    drawPlot: function () {
      d3.select(this.$el).selectAll("svg").remove();
      var svg = d3.select(this.$el).append("svg");

      svg
        .attr("class", "InteractionsGraphC")
        .attr("width", this.width)
        .attr("height", this.height);

      this.prepareGraph(svg);
    },
    prepareGraph: function prepareGraph(svg) {
      var graph = JSON.parse(JSON.stringify(this.graph)) // currently, we need a deep copy of the graph, otherwise graph.links gets overwritten even on remounts
      this.prepareGraphForSvgDefinitions(
        svg,
        graph,
        this.getResourceTypesInitially(graph.nodes)
      );
      this.$emit("visibleRetrieval", {
        value: true,
      });
    },
    
    //TODO: Get rid of this nonsense.
    seek_and_hide: function seek_and_hide() {},

    getSVG: function getSVG() {
      return document
        .getElementById("interactions")
        .getElementsByTagName("svg")[0];
    },

    getSif: function getSif() {
      var aData = d3
        .selectAll(".link")
        .data()
        .map(function (d) {
          var asRelations = d.RelationName.split(",");
          return asRelations.map(function (e) {
            return [d.source.Label, e, d.target.Label];
          });
        })
        .reduce(function (prev, next) {
          return prev.concat(next);
        }, []);

      var sSeparator = "\t";
      var sHeader = ["source", "interaction", "target"].join(sSeparator);
      var aCSVRows = [];
      aCSVRows.push(sHeader);
      //TODO: check if fix is correct
      aCSVRows = aCSVRows.concat(
        aData.map(function (d) {
          return d.join(sSeparator);
        })
      );
      return aCSVRows;
    },

    getResourceTypesInitially: function getResourceTypes(nodes) {
      var aResourceTypes = Array.from(
        new Set(
          nodes.map(function (d) {
            return [d.Shape, d.ResourceType, d.Color].join(";");
          })
        )
      ).map(function (d) {
        var data = d.split(";");
        return {
          Shape: data[0],
          ResourceType: data[1],
          Color: data[2],
          State: 1,
        };
      });
      this.aResourceTypes.Radios = aResourceTypes;
      this.$emit("radioButtons", this.aResourceTypes.Radios);
      var aGlobalCheckedTypes = aResourceTypes.map(function (d) {
        return d.Shape;
      });
      return aGlobalCheckedTypes;
    },

    getResourceTypes: function getResourceTypes(nodes) {
      var existingAResourceTypes = new Object(this.aResourceTypes).Radios;
      var aSexistingResourceTypes = existingAResourceTypes.map(function (d) {
        return [d.Shape, d.ResourceType, d.Color, d.State].join(";");
      });

      var aNewResourceTypes = Array.from(
        new Set(
          nodes.map(function (d) {
            return [d.Shape, d.ResourceType, d.Color, "1"].join(";");
          })
        )
      );

      var sCombinedResourceTypes = Array.from(
        new Set(aSexistingResourceTypes.concat(aNewResourceTypes))
      ).sort(function (a, b) {
        return a.localeCompare(b);
      });

      sCombinedResourceTypes = sCombinedResourceTypes.map(function (d) {
        var dataX = d.split(";");
        var iState = parseInt(dataX[3], 10);

        var ter = {
          Shape: dataX[0],
          ResourceType: dataX[1],
          Color: dataX[2],
          State: iState,
        };
        return ter;
      });

      var asCombinedResourceTypes = sCombinedResourceTypes.reduce(function (
        prev,
        next
      ) {
        if (prev.length === 0) {
          return prev.concat(next);
        }
        if (prev[prev.length - 1].ResourceType === next.ResourceType) {
          return prev;
        }
        return prev.concat(next);
      },
      []);
      this.aResourceTypes.Radios = asCombinedResourceTypes;
      this.$emit("triggerRadioSelection", {
        value: true,
      });
    },

    helperCreateUniqueMarkerSchema: function helperCreateUniqueMarkerSchema(
      data
    ) {
      var test = data
        .reduce(function (prev, acc) {
          return prev.concat(
            acc.Children.map(function (e) {
              return ["Start", "End", "Mid"]
                .map(function (x) {
                  return {
                    ArrowTypeId: e[x + "ArrowTypeId"],
                    Marker: e[x + "Marker"],
                    ArrowColour: e[x + "ArrowColour"],
                    ArrowName: e[x + "ArrowName"],
                    Position: x,
                  };
                })
                .reduce(function (p, a) {
                  return p.concat(
                    typeof a.ArrowTypeId === "undefined" ? [] : a
                  );
                }, []);
            })
          );
        }, [])
        .reduce(function (prev, acc) {
          return prev.concat(acc);
        }, []);
      test.sort(function (a, b) {
        return a.ArrowTypeId.localeCompare(b.ArrowTypeId);
      });
      // TODO: make aUniqueMarker to a global Object
      var aUniqueMarker = test.reduce(function (prev, acc) {
        if (prev.length === 0) {
          return prev.concat(acc);
        }
        if (prev[prev.length - 1].ArrowTypeId === acc.ArrowTypeId) {
          return prev;
        }
        return prev.concat(acc);
      }, []);

      var mUniqueMarker = {};
      aUniqueMarker.forEach(function (x) {
        mUniqueMarker[x.ArrowTypeId] = x;
      });

      var aInputdata = aUniqueMarker.map(function (x) {
        return x.ArrowTypeId;
      });

      return {
        aInputdata: aInputdata,
        mUniqueMarker: mUniqueMarker,
      };
    },

    prepareGraphForSvgDefinitions: function prepareGraphForSvgDefinitions (
        svg,
        graph,
        aGlobalCheckedTypes
    ) {
      var defs = svg.append('svg:defs')
      var data = this.markers
      data = data.filter(function (x) {
        return x !== {}
      })
      data = data
          .filter(function (x) {
            return Object.keys(x).length !== 0 && x.constructor === Object
          })
          .map(function (e) {
            return ['Start', 'End', 'Mid'].map(function (x) {
              return {
                ArrowTypeId: e[x + 'ArrowTypeId'],
                Marker: e[x + 'Marker'],
                ArrowColour: e[x + 'ArrowColour'],
                ArrowName: e[x + 'ArrowName'],
                Position: x,
              }
            })
          })
          .reduce(function (prev, acc) {
            return prev.concat(acc)
          }, [])
          .reduce(function (prev, acc) {
            return prev.concat(
                typeof acc.ArrowTypeId === 'undefined' ? [] : acc
            )
          }, [])

      defs
          .selectAll('marker')
          .data(data)
          .enter()
          .append('svg:marker')
          .attr('id', function (d) {
            return d.ArrowTypeId
          })
          .attr(
              'viewBox',
              function (d) {
                return d === 'None' ? '-10 -10 20 20' : '-10 -10 20 20'
              } // new coordinate system = old coordinate system - but stuff is just drawn in your defined box
          )
          .attr('refX', function (d) {
            return d.Position === 'Mid' ? 0 : 70
          })
          .attr('refY', 0)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('svg:path')
          .attr('transform', function (d) {
            return d === 'None' ? 'scale(0.5)' : 'scale(1)'
          })
          .attr('fill', function (d) {
            return d.ArrowColour
          })
          .attr('d', function (d) {
            return d.Marker
          })
      this.createSelectableForceDirectedGraph(
          svg,
          graph,
          aGlobalCheckedTypes
      )
    },

    //TODO: This function goes on for the rest of the program (>1200 lines).
    createSelectableForceDirectedGraph:
      function createSelectableForceDirectedGraph(
        svg,
        graph,
        aGlobalCheckedTypes
      ) {
        this.busy = false;
        var parentWidth = svg.node().width.baseVal.value; //.parentNode.clientWidth;
        var parentHeight = svg.node().height.baseVal.value * 3; //this.height;

        var node;
        var link;
        var that = this;

        // triggers heatmap link generation

        var nodes_hidden = [];
        var links_additional = []; // stores links linking into non existing nodes

        function onlyUnique(value, index, self) {
          return self.indexOf(value) === index;
        }

        var aN = graph.nodes.map(function (x) {
          return x.AccessionId;
        });
        var aNu = aN.filter(onlyUnique);

        links_additional = links_additional.concat(
          graph.links.filter(function (x) {
            return !(aNu.includes(x.source) && aNu.includes(x.target));
          })
        );
        graph.links = graph.links.filter(function (x) {
          return aNu.includes(x.source) && aNu.includes(x.target);
        });

        var symbolMap = {
          wye: d3.symbolWye,
          circle: d3.symbolCircle,
          cross: d3.symbolCross,
          diamond: d3.symbolDiamond,
          square: d3.symbolSquare,
          star: d3.symbolStar,
          triangle: d3.symbolTriangle,
        };

        var edgeTypeMap = {
          dotted: "1, 5",
          dashed: "5, 5",
          solid: null,

          // remove any previous graphs
        };
        d3.selectAll(".g-main").remove();

        var gMain = svg.append("g").classed("g-main", true);

        var rect = gMain
          .append("rect")
          .attr("width", parentWidth)
          .attr("height", parentHeight)
          .style("fill", "#ffffff");

        var gDraw = gMain.append("g");

        var zoom = d3.zoom().scaleExtent([0.1, 5]).on("zoom", ({ transform }) => {
          gDraw.attr("transform", transform)
        });

        gMain.call(zoom);
        //Trigger initial zoom event to position the graph in the visible area of the screen
        gMain.call(zoom.scaleBy, 0.5);
        //TODO: For some reason, there is an initial translate which I need to work against here
        gMain.call(zoom.translateBy, 320,-600)


        //var color =
        d3.scaleOrdinal(d3.schemeCategory10);

        if (!("links" in graph)) {
          return;
        }

        // the brush needs to go before the nodes so that it doesn't
        // get called when the mouse is over a node
        //var gBrushHolder =
        var gBrush = null;
        
        graph.links = initializeLinks(graph.links);
        
        var l = gDraw
          .append("g")
          .attr("class", "edge")
          .selectAll("path")
          .data(graph.links);
        
        enterLinks(l);

        var lengthNodes = graph.nodes.length;

        // Initial Position

        graph.nodes.forEach(function (d, i) {
          d.x = parentWidth / 2;
          d.y = parentHeight / 2;
          if (i === lengthNodes - 1) {
            // fixes start node to the middle of the graph
            d.fx = parentWidth / 2;
            d.fy = parentHeight / 2;
          }
        });

        var n = gDraw
          .append("g")
          .attr("class", "node")
          .selectAll("circle")
          .data(graph.nodes);

        enterNodes(n);

        node = d3.select(".node").selectAll(".super"); // TODO FIX THIS SELECTION THINGY
        link = d3.select(".edge").selectAll(".link"); // TODO FIX THIS SELECTION THINGY

        this.simulation = d3
          .forceSimulation()
          .force(
            "link",
            d3
              .forceLink()
              .id(function (d) {
                return d.AccessionId;
              })
              .distance(function (d) {
                return d.Weight * 270;
              })
              .strength(1)
          )
          .force(
            "collide",
            d3
              .forceCollide(function () {
                return 110;
              })
              .iterations(16) //TODO: What does this do?
          )
          .force("charge", d3.forceManyBody().distanceMin(250).strength(-500));
        this.simulation.nodes(graph.nodes).on("tick", ticked);

        this.simulation.force("link").links(graph.links);

        node.call(dragNodes(this.simulation))

        function dragNodes (sim) {
          function dragstarted (event) {
            if (!event.active && sim) sim.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          }

          function dragged (event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          }

          function dragended (event) {
            if (!event.active && sim) sim.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          }

          return d3
              .drag()
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended)
        }

        var brushing = false;
        var shiftKey;

        d3.select('body').on('keydown', e => {
          shiftKey = e.key === 'Shift'
        })
        d3.select('body').on('keyup', () => {
          shiftKey = false

          if (!gBrush) {
            return
          }

          if (!brushing) {
            // only remove the brush if we're not actively brushing
            // otherwise it'll be removed when the brushing ends
            gBrush.remove()
            gBrush = null
          }
        })

        that.expandSelection = expandSelection;
        that.deleteSelectionDirty = deleteSelectionDirty;
        that.unfixSelection = unfixSelection;



        rect.on("click", function () {
          node.selectAll(".point").each(function (d) {
            d.selected = false;
            d.previouslySelected = false;
          });

          that.$emit("disableNodeTab", {
            bDisable: true,
          });

          // that.setProperty('visibleNode', false, true);
          node.selectAll(".point").classed("selected", false);
        });

        function ticked() {
          // update node and line positions at every step of
          // the force simulation
          link.attr("d", function (d) {
            // d.linknum 0 to differentiate for straight line
            var draw;
            if (d.target.x === d.source.x && d.target.y === d.source.y) {
              var x2 = d.target.x + 1;
              var y2 = d.target.y + 1;
              var largeArc = 1;
              var xRotation = -45;
              var dr = 10;
              var sweep = 1;
              draw =
                "M" +
                d.source.x +
                "," +
                d.source.y +
                "A" +
                dr +
                "," +
                dr +
                " " +
                xRotation +
                "," +
                largeArc +
                "," +
                sweep +
                " " +
                x2 +
                "," +
                y2;
            } else {
              var p = calculatePoint(
                d.target.y,
                d.source.y,
                d.target.x,
                d.source.x,
                18,
                d.position,
                d.linknum
              );
              draw =
                "M" +
                p.source.x +
                "," +
                p.source.y +
                "L" +
                (p.target.x + p.source.x) / 2 +
                "," +
                (p.target.y + p.source.y) / 2 +
                "L" +
                p.target.x +
                "," +
                p.target.y;
            }
            return draw;
          });
          node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          });
        }

        function compareWeight(a, b) {
          if (a.Weight < b.Weight) {
            return -1;
          }
          if (a.Weight > b.Weight) {
            return 1;
          }
          return 0;
        }

        function initializeLinks(links) {
          //  links is at the beginnign src and dest: node id -> must map to the position
          //  linknum needs also an update // because node id is always an id, sort -> String ->
          var linkNums = {};

          links.sort(compareWeight).reverse();
          links = links.map(function (e) {
            var E = e;

            var uniqueId = [e.target, e.source].sort().join(";");

            if (!linkNums[uniqueId]) {
              linkNums[uniqueId] = {
                link: 0,
                position: 0,
              };
            } else {
              if (linkNums[uniqueId].position % 2 == 0) {
                linkNums[uniqueId].link++;
              }
              linkNums[uniqueId].position =
                (linkNums[uniqueId].position + 1) % 2;
            }
            E.linknum = linkNums[uniqueId].link;
            E.position = linkNums[uniqueId].position;

            return E;
          });

          return links;
        }

        function calculate(x, y, theta, r) {
          var p = {};
          p.x = x + r * Math.cos(Math.radians(theta + 90));
          p.y = y + r * Math.sin(Math.radians(theta + 90));
          return p;
        }

        // Converts from degrees to radians.
        Math.radians = function (degrees) {
          return (degrees * Math.PI) / 180;
        };

        // Converts from radians to degrees.
        Math.degrees = function (radians) {
          return (radians * 180) / Math.PI;
        };

        function calculateM(y2, y1, x2, x1) {
          return (y2 - y1) / (x2 - x1);
        }

        function calculateAngle(y2, y1, x2, x1) {
          return Math.degrees(Math.atan(calculateM(y2, y1, x2, x1)));
        }

        function calculatePoint(y2, y1, x2, x1, r, bLeftRight, multiplicator) {
          // x2 , y2 target
          var p = {};

          var additional = bLeftRight === 0 ? 0 : 180;

          var theta = calculateAngle(y2, y1, x2, x1);

          p.target = calculate(x2, y2, theta + additional, multiplicator * r);
          p.source = calculate(x1, y1, theta + additional, multiplicator * r);

          return p;
        }

        function wrapExpansion(d, callback) {
          expandNode(d);
          callback(null);
        }

        function expandSelection() {
          var q = d3.queue(1);
          d3.selectAll(".point.selected").each(function (d) {
            q.defer(wrapExpansion, d);
          });
          q.awaitAll(function (error) {
            if (error) {
              throw error;
            }
          });
        }

        function unfixSelection() {
          node
            .filter(function (d) {
              return d.selected;
            })
            .each(function (d) {
              // d.fixed &= ~6;
              d.fx = null;
              d.fy = null;
            });
          this.simulation.restart();
        }

        function checkNodeExist(nodeAry) {
          return nodeAry
            .filter(function (n) {
              var foundNodes = graph.nodes.filter(function (no) {
                return no.AccessionId === n.AccessionId;
              });
              // length = 1 if already exists
              return foundNodes.length !== 1;
            })
            .filter(function (n) {
              var foundNodes = nodes_hidden.filter(function (no) {
                return no.AccessionId === n.AccessionId;
              });
              // length = 1 if already exists
              return foundNodes.length !== 1;
            });
        }

        function linkNumsAryBuilder() {
          // works just for alreadz build links
          var linkNums = {};
          graph.links.forEach(function (e) {
            var uniqueId = [e.target.AccessionId, e.source.AccessionId]
              .sort()
              .join(";");

            if (!linkNums[uniqueId]) {
              linkNums[uniqueId] = {
                link: 0,
                position: 0,
              };
            }

            if (linkNums[uniqueId].position % 2 == 0) {
              linkNums[uniqueId].link++;
            }
            linkNums[uniqueId].position = (linkNums[uniqueId].position + 1) % 2;
          });
          return linkNums;
        }

        function checkLinkExists(linkNums, linkAry) {
          return linkAry.filter(function (l) {
            var uniqueId = [l.target.AccessionId, l.source.AccessionId]
              .sort()
              .join(";");
            return linkNums[uniqueId] ? false : true;
          });
        }

        function updateLinks() {
          /*
      linknum needs also an update // because node id is always an id, sort -> String ->
       */
          var linkNums = {};
          graph.links.sort(compareWeight).reverse();
          graph.links = graph.links.map(function (e) {
            var E = e;

            var uniqueId = [e.target.AccessionId, e.source.AccessionId]
              .sort()
              .join(";");

            if (!linkNums[uniqueId]) {
              linkNums[uniqueId] = {
                link: 0,
                position: 0,
              };
            } else {
              if (linkNums[uniqueId].position % 2 == 0) {
                linkNums[uniqueId].link++;
              }
              linkNums[uniqueId].position =
                (linkNums[uniqueId].position + 1) % 2;
            }
            E.linknum = linkNums[uniqueId].link;
            E.position = linkNums[uniqueId].position;

            return E;
          });
          seek_and_hide();
        }

        function expandNode(d) {
          that.busy = true;
          var sExistingNodes = d3
            .selectAll(".point")
            .data()
            .map(function (d) {
              return d.AccessionId;
            })
            .concat(
              nodes_hidden.map(function (d) {
                return d.AccessionId;
              })
            )
            .join(",");
          this.$emit('expand-node', d)
        }
        
        function expandGraph(data) {
          function onlyUnique (value, index, self) {
            return self.indexOf(value) === index
          }
          var aN = data.nodes
              .map(function (x) {
                return x.AccessionId
              })
              .concat(
                  graph.nodes.map(function (x) {
                    return x.AccessionId
                  })
              )
          var aNu = aN.filter(onlyUnique)
          //                links_additional = links_additional.concat(data["links"]);
          links_additional = data.links

          // links additional has to
          links_additional.sort(function (a, b) {
            return a.EdgeId.localeCompare(b.EdgeId)
          })

          links_additional = links_additional.reduce(function (prev, next) {
            if (prev.length === 0) {
              next.bHidden = true
              if (aNu.includes(next.source) && aNu.includes(next.target)) {
                next.bHidden = false
              }
              return prev.concat(next)
            }
            if (prev[prev.length - 1].EdgeId !== next.EdgeId) {
              next.bHidden = true
              if (aNu.includes(next.source) && aNu.includes(next.target)) {
                next.bHidden = false
              }
              return prev.concat(next)
            }

            return prev
          }, [])

          // extract from hidden links new link stuff
          data.links = links_additional.filter(function (x) {
            return !x.bHidden
            // return aNu.includes(x["source"]) && aNu.includes(x["target"]);
          })
          links_additional = links_additional.filter(function (x) {
            return x.bHidden
            // return !(aNu.includes(x["source"]) && aNu.includes(x["target"]));
          })

          //          oldNodes = nodes;
          // checkNodeExist returns an ary
          var additionalNode = checkNodeExist(data.nodes)
          additionalNode.forEach(function (e) {
            e.x = d.x // + randomInteger(-500, 500);
            e.y = d.y // + randomInteger(-500, 500);
            e.vx = 0
            e.vy = 0
          })
          graph.nodes = graph.nodes.concat(additionalNode)
          // graph.nodes = graph.nodes.concat(checkNodeExist(data["nodes"]));

          //          maintainNodePositions();
          // linknums have to be created beforehand
          var linkNums = linkNumsAryBuilder()

          data.links.forEach(function (e) {
            var start_ = graph.nodes.filter(function (n) {
              return n.AccessionId === e.source
            })
            var end_ = graph.nodes.filter(function (n) {
              return n.AccessionId === e.target
            })

            if (
                typeof start_[0] !== 'undefined' &&
                typeof end_[0] !== 'undefined'
            ) {
              graph.links = graph.links.concat(
                  checkLinkExists(linkNums, [
                    {
                      source: start_[0],
                      target: end_[0],
                      Weight: e.Weight,
                      ArrowType: e.ArrowType,
                      StartArrowTypeId: e.StartArrowTypeId,
                      MidArrowTypeId: e.MidArrowTypeId,
                      EndArrowTypeId: e.EndArrowTypeId,
                      EdgeId: e.EdgeId,
                      EdgeType: e.EdgeType,
                      EdgeColor: e.EdgeColor,
                    },
                  ])
              )
            }
          })
          this.busy = false
          this.getResourceTypes(data.nodes)
          updateLinks() // TODO ?
        }

        function deleteSelectionDirty() {
          var aNodes = d3.selectAll(".point.selected").data();

          while (aNodes.length > 0) {
            var d = aNodes.pop();

            graph.nodes = graph.nodes.filter(function (e) {
              var bCorrect = d.AccessionId !== e.AccessionId;
              return bCorrect;
            });

            graph.links = graph.links.filter(function (e) {
              var bCorrect =
                d.AccessionId !== e.source.AccessionId &&
                d.AccessionId !== e.target.AccessionId;
              return bCorrect;
            });
          }
          d3.selectAll(".node.point > *")
            .classed("selected", function (d) {
              d.selected;
            })
            .each(function (d) {
              d.selected = false;
              d.previouslySelected = false;
            });

          update();
        }

        function enterNodes(n) {
          var tthat = that; //TODO: Not sure if I want to laugh or cry about this.
          var node_group = n
            .enter()
            .append("g")
            .merge(n)
            .attr("class", "super")

          var nodeCircle = node_group.append("path").attr("class", "point");
          var nodeText = node_group
            .append("g")
            .attr("class", "textG")
            .selectAll("text")
            .data(function (d) {
              var le = d.Label.split(" ").length;
              return d.Label.split(" ").map(function (e) {
                return {
                  Label: e,
                  maxLength: le,
                };
              });
            })
            .enter()
            .append("text")
            .attr("class", "text1");

          var annotation = node_group
            .append("g")
            .attr("class", "selfInteractionG");
          annotation.each(function (d) {
            d3.select(this)
              .selectAll("Annotations")
              .data(d.SelfInteraction)
              .enter()
              .append("path")
              .attr("transform", function () {
                return "translate(" + 10 + "," + -10 + ")";
              })
              .attr("fill", function (d) {
                if (d.ArrowType === "Arrow") {
                  return "green";
                } else if (d.ArrowType === "Bar") {
                  return "red";
                } else if (d.ArrowType === "None") {
                  return "blue";
                }
                return "black";
              })
              .attr("d", function (d) {
                if (d.ArrowType === "Arrow") {
                  return "M0,-5L10,0L0,5";
                } else if (d.ArrowType === "Bar") {
                  return "M5,-5L5,5L0,5L0,-5";
                } else if (d.ArrowType === "None") {
                  return "M0,-10L10,0L0,10L-10,0";
                }
              });
          });

          nodeText
            .attr("x", 0)
            .attr("y", function (d, i) {
              if (d.maxLength === 1) {
                return 0;
              }
              return (-d.maxLength / 2) * 15 + i * 15;
            })
            .attr("pointer-events", "none")
            .attr("font-size", 20)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .text(function (d) {
              if (d.Label.length < 12) {
                return d.Label;
              }
              return d.Label.slice(0, 3) + "(...)" + d.Label.slice(-3);
            });

          nodeCircle
            .attr("fill", function (d) {
              return d.Color;
            })
            .attr("stroke", function (d) {
              return d.BorderColor;
            })
            .attr("border-style", function (d) {
              return d.BorderType;
            })
            .attr(
              "d",
              d3
                .symbol()
                .type(function (d) {
                  //			    return d3.symbolDiamond;
                  return symbolMap[d.Shape];
                })
                .size(function () {
                  return 15000;
                })
            )
            .attr("id", function (d, i) {
              return "nodeCircle" + i;
            })
            .attr("stroke-width", 3)
            .on("mouseover", function (e, d) {
              d3.select(this).style("cursor", "pointer");
              var aUniqueLinkedEdges = graph.links
                .filter(function (l) {
                  return (
                    (l.source.AccessionId == d.AccessionId) |
                    (l.target.AccessionId == d.AccessionId)
                  );
                })
                .map(function (l) {
                  return [l.source.AccessionId, l.target.AccessionId];
                })
                .reduce(function (prev, next) {
                  return prev.concat(next);
                }, [])
                .reduce(function (a, x) {
                  return ~a.indexOf(x) ? a : a.concat(x);
                }, [])
                .sort()
                .filter(function (n) {
                  return n !== d.AccessionId;
                });
              aUniqueLinkedEdges.forEach(function (iAccesionLinked) {
                d3.selectAll(".point")
                  .filter(function (d) {
                    return d.AccessionId == iAccesionLinked;
                  })
                  .attr("stroke-width", 5)
                  .attr("stroke", "rgb(240, 171, 0)");
              });
              d3.selectAll(".link")
                .filter(function (l) {
                  return (
                    (l.source.AccessionId == d.AccessionId) |
                    (l.target.AccessionId === d.AccessionId)
                  );
                })
                .attr("stroke-width", 5)
                .attr("stroke", "rgb(240, 171, 0)");
            })
            .on("mouseout", function (e, d) {
              d3.select(this).style("cursor", "");
              var aUniqueLinkedEdges = graph.links
                .filter(function (l) {
                  return (
                    (l.source.AccessionId == d.AccessionId) |
                    (l.target.AccessionId == d.AccessionId)
                  );
                })
                .map(function (l) {
                  return [l.source.AccessionId, l.target.AccessionId];
                })
                .reduce(function (prev, next) {
                  return prev.concat(next);
                }, [])
                .reduce(function (a, x) {
                  return ~a.indexOf(x) ? a : a.concat(x);
                }, [])
                .sort()
                .filter(function (n) {
                  return n !== d.AccessionId;
                });
              aUniqueLinkedEdges.forEach(function (iAccesionLinked) {
                d3.selectAll(".point")
                  .filter(function (d) {
                    return d.AccessionId == iAccesionLinked;
                  })
                  .attr("stroke-width", 3)
                  .attr("stroke", function (d) {
                    return d.BorderColor;
                  });
              });
              d3.selectAll(".link")
                .filter(function (l) {
                  return (
                    (l.source.AccessionId == d.AccessionId) |
                    (l.target.AccessionId === d.AccessionId)
                  );
                })
                .attr("stroke-width", 5)
                .attr("stroke", function (d) {
                  return d.EdgeColor;
                });
            })
              .on("click", (e,d) => {
                let selectedNodeIds
                if (e.ctrlKey) {
                  d.selected = !d.selected
                  selectedNodeIds = d3.selectAll('.point')
                      .data()
                      .filter(oNode => oNode.selected)
                      .map(oNode => oNode.AccessionId)
                      .join(',')
                }
                else{
                  d3.selectAll('.point')
                  .data()
                  .forEach(d => d.selected=false)

                  d.selected = !d.selected
                  selectedNodeIds = d.selected ? d.AccessionId : null
                }
                if(selectedNodeIds) {
                    console.log(selectedNodeIds)
                    that.$emit('SelectedNodes', selectedNodeIds)
                    highlightSelectedNodes()
                }

                var aSelectedNodes = d3
                    .selectAll(".point.selected")
                    .data()
                    .filter(function (x) {
                      return x.ResourceTypeId === 1;
                    })
                    .map(function (x) {
                      return x.AccessionId;
                    });
                tthat.$emit("enableExpansion", {
                  bEnable: aSelectedNodes > 1,
                });

              })
        }

        function highlightSelectedNodes(){
          d3.selectAll(".point")
          .classed("selected", d => d.selected)
        }

        function exitNodes(n) {
          n.exit().remove();
          d3.select(".node").selectAll("g").select(".textG").remove();
          d3.select(".node").selectAll("g").select(".point").remove();
          d3.select(".node")
            .selectAll("g")
            .select(".selfInteractionG")
            .remove();
        }

        function enterLinks(l) {
          l.enter()
            .append("svg:path")
            .merge(l)
            .attr("marker-end", function (d) {
              if (d.EndArrowTypeId === null) {
                return null;
              }
              return "url(#" + d.EndArrowTypeId + ")";
            })
            .attr("marker-start", function (d) {
              if (d.StartArrowTypeId === null) {
                return null;
              }
              return "url(#" + d.StartArrowTypeId + ")";
            })
            .attr("marker-mid", function (d) {
              if (d.MidArrowTypeId === null) {
                return null;
              }
              return "url(#" + d.MidArrowTypeId + ")";
            })
            .attr("class", "link")
            .attr("refY", -50)
            .attr("stroke", function (d) {
              return d.EdgeColor;
            })
            .attr("stroke-width", function () {
              return "5px";
            })
            .attr("stroke-dasharray", function (d) {
              return edgeTypeMap[d.EdgeType];
            })
            .on("mouseover", function (e, d) {
              d3.select(this).attr("stroke", "rgb(240, 171, 0)");
              d3.select(this).style("cursor", "pointer");
              var aUniqueLinkedNodes = [
                d.target.AccessionId,
                d.source.AccessionId,
              ];
              aUniqueLinkedNodes.forEach(function (iAccesionLinked) {
                d3.selectAll(".point")
                  .filter(function (d) {
                    return d.AccessionId == iAccesionLinked;
                  })
                  .attr("stroke-width", 5)
                  .attr("stroke", function () {
                    return "rgb(240, 171, 0)";
                  });
              });
            })
            .on("mouseout", function (e, d) {

              d3.select(this).attr("stroke", function (d) {
                return d.EdgeColor;
              });
              d3.select(this).style("cursor", "");
              var aUniqueLinkedNodes = [
                d.target.AccessionId,
                d.source.AccessionId,
              ];
              d3.selectAll(".point")
                .attr("stroke-width", 3)
                .attr("stroke", function (d) {
                  return d.BorderColor;
                });
            })
            .on("mousedown", function (e, d) {
              var sRelationTypeIds = that.sRelationTypeIds;
              var ArrowTypeIdNumber;
              if (d.EndArrowTypeId !== null) {
                ArrowTypeIdNumber = d.EndArrowTypeId.split("_")[0];
              } else if (d.StartArrowTypeId !== null) {
                ArrowTypeIdNumber = d.StartArrowTypeId.split("_")[0];
              } else if (d.MidArrowTypeId !== null) {
                ArrowTypeIdNumber = d.MidArrowTypeId.split("_")[0];
              }

              that.$emit("showOverlay", {
                source: d.source.AccessionId,
                target: d.target.AccessionId,
                directional:
                  d.EndArrowTypeId === null && d.StartArrowTypeId === null
                    ? 0
                    : 1, // directional
                arrowtype: ArrowTypeIdNumber,
                relation_ids: sRelationTypeIds,
              });
            });
        }

        function exitLinks(l) {
          l.exit().remove();
        }

        //TODO: WHAT? seek_and_hide exists twice? But once with arguments and once without. What is this?
        function seek_and_hide() {
          var b_update =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : true;
          var checkedTypes;
          if (arguments.length == 2) {
            checkedTypes = arguments[1];
            aGlobalCheckedTypes = checkedTypes;
          } else {
            checkedTypes = aGlobalCheckedTypes;
          }

          // if b_update -> false -> loop to update -> back to b_update
          // move stuff to hidden nodes ary
          // get it back

          //    var checkedTypes = d3.selectAll("input:checked").data();
          // var checkedTypes = d3.selectAll('text.selected').data();
          var getHiddenBackIndex = [];
          nodes_hidden.forEach(function (d, i) {
            var index = checkedTypes.indexOf(d.Shape);
            var insertIndex = index === -1 ? [] : [i];
            getHiddenBackIndex = getHiddenBackIndex.concat(insertIndex);
          });

          nodes_hidden.forEach(function (d) {
            delete d.index;
          });

          for (var i = getHiddenBackIndex.length - 1; i >= 0; i--) {
            // splice does in place and returns the deleted stuff
            graph.nodes = graph.nodes.concat(
              nodes_hidden.splice(getHiddenBackIndex[i], 1)
            );
          }

          //    nodes.forEach((d) => {d.weight = 25});

          var nodes2HideIndex = [];
          graph.nodes.forEach(function (d, i) {
            var index = checkedTypes.indexOf(d.Shape);
            var insertIndex = index !== -1 ? [] : [i];
            nodes2HideIndex = nodes2HideIndex.concat(insertIndex);
          });

          for (i = nodes2HideIndex.length - 1; i >= 0; i--) {
            nodes_hidden = nodes_hidden.concat(
              graph.nodes.splice(nodes2HideIndex[i], 1)
            );
          }

          // dont show links
          var nodesKeyAry = nodes_hidden.map(function (d) {
            return d.AccessionId;
          });
          d3.selectAll(".link").attr("visibility", function (d) {
            if (
              nodesKeyAry.indexOf(d.source.AccessionId) !== -1 || // if found in hidden (-1 is is not found)
              nodesKeyAry.indexOf(d.target.AccessionId) !== -1
            ) {
              // or if found in target
              return "hidden";
            }
            return "visible";
          });
          if (b_update) {
            update(checkedTypes);
          }
        }

        that.seek_and_hide = seek_and_hide;

        function update() {
          // hidden argument 0 => checkedTypes
          var n = d3.select(".node").selectAll(".super").data(graph.nodes);

          exitNodes(n);
          enterNodes(n);

          var l = d3.select(".edge").selectAll(".link").data(graph.links);
          //            .data(graph.links , function(d) { return d.source.id + "-" + d.target.id; });

          exitLinks(l);
          enterLinks(l);

          // node = d3.select('.node').selectAll('.point'); // TODO FIX THIS SELECTION THINGY
          // link = d3.select('.edge').selectAll('.link'); // TODO FIX THIS SELECTION THINGY
          node = d3.select(".node").selectAll(".super"); // TODO FIX THIS SELECTION THINGY
          link = d3.select(".edge").selectAll(".link"); // TODO FIX THIS SELECTION THINGY

          that.simulation.nodes(graph.nodes);
          that.simulation.force("link").links(graph.links);
          that.simulation
            .alpha(
              1
              //	       .transition()
              //	       .duration(500)
              //	       .alphaTarget(0.0)
            )
            .restart();

          if (arguments.length === 1) {
            seek_and_hide(false, arguments[0]);
          } else {
            seek_and_hide(false);
          }
        }

        return graph;
      },
  },
  mounted: function () {
    this.drawPlot();
  },
};
</script>

<style scss>
</style>

