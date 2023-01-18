import { css } from 'lit';

export default css`
  .analytics-selectivity {
    font-family: Arial, Helvetica, sans-serif;
    font: 10px sans-serif;
  }
  .area {
    shape-rendering: geometricPrecision;
    fill: #ccc !important;
  }

  .boxplot {
    shape-rendering: crispEdges;
    fill: none;
    stroke: black;
    stroke-width: 1px;
  }
  .boxplot.fill {
    fill: black;
  }
  .thickbox .boxplot {
    stroke-width: 1;
  }
  .boxplot.mean,
  .boxplot.median {
    fill: white;
    stroke: white;
  }
  .boxplot.mean {
    shape-rendering: geometricPrecision;
  }
  .violin {
    shape-rendering: geometricPrecision;
    fill: none !important;
    stroke: #777;
    stroke-width: 1px;
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

  .sapProteomicsdbViolinPlot {
    position: relative;
  }

  .violinarea {
    position: absolute;
  }

  .violinbuttonarea.violinhidden {
    display: none;
  }

  .D3ViolinPlotTitle {
    font-family: Arial, Helvetica, sans-serif;
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
`;
