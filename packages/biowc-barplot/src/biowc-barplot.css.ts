import { css } from 'lit';

export default css`
  .barPlotClearSelectionButton {
    position: absolute !important;
    margin-top: 32px;
    margin-left: 50px;
  }

  .barplotClass {
    height: inherit;
    width: inherit;
  }

  .BarContainer .Title {
    font-size: 18px;
    font-family: Arial, Helvetica, sans-serif;
  }

  .BarContainer .AxisTitle {
    font-family: Arial, Helvetica, sans-serif;
    font: 12px sans-serif;
    text-anchor: middle;
  }

  .BarContainer .BetterValue {
    fill: rgb(240, 171, 0);
    stroke: black;
    stroke-width: -1;
    padding: 1px;
  }

  .BarContainer .ClickBar.Highlight,
  .BarContainer .ClickBar:hover {
    stroke: black;
    stroke-width: 1;
    fill: transparent;
    cursor: pointer;
  }

  .Bar {
    cursor: pointer;
    fill: rgb(0, 143, 211);
  }

  .ClickBar {
    stroke: transparent;
    stroke-width: 0;
    fill: transparent;
    cursor: pointer;
  }

  .BackgroundBar {
    stroke: transparent;
    fill: transparent;
  }

  .BackgroundBar.Highlight {
    fill: #f7d57f;
  }

  a .Label.Highlight {
    font-family: Arial, Helvetica, sans-serif;
    font: 10px sans-serif;
    text-anchor: end;
    fill: green;
    color: green;
    font-weight: bold;
  }

  a .Label {
    font-family: Arial, Helvetica, sans-serif;
    font: 10px sans-serif;
    text-anchor: end;
    fill: #00679e;
    color: #00679e;
    font-weight: normal;
  }

  .axis path,
  .axis line {
    fill: none;
    stroke: #000;
    stroke-width: 1px;
    color-rendering: optimizeQuality !important;
    shape-rendering: crispEdges !important;
    text-rendering: geometricPrecision !important;
  }
`;
