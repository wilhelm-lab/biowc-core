export default {
  scatterPlot: {
    width: '40%',
    height: '40%',
    minWidthCSS: '100',
    minHeightCSS: '100',
    minWidth: 500,
    minHeight: 500,
    chartData: [{x:1, y:2}, {x:2, y:3}, {x:3, y:4}, {x:4, y:5},
      {x:-1, y:2}, {x:-2, y:3}, {x:-3, y:4}, {x:-4, y:5}],
    busy: false,
    xAxis: 'x-axis',
    yAxis: 'y-axis',
    mirroredSelection: true,
    aSelectedGeneNamesUp: undefined,
    aSelectedGeneNamesDown: undefined
  }
};