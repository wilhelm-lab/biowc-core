export default {
  scatterPlot: {
    idKey: 'Sample name',
    valueKey: 'abundance',
    xLabel: 'abundance Gene_X',
    xValues: [
      { 'Sample name': 'sample1', abundance: 1 },
      { 'Sample name': 'sample2', abundance: 3 },
      { 'Sample name': 'sample4', abundance: 3 },
      { 'Sample name': 'sample5', abundance: 2 },
    ],
    yLabel: 'abundance Gene_Y',
    yValues: [
      { 'Sample name': 'sample1', abundance: 1 },
      { 'Sample name': 'sample2', abundance: 2 },
      { 'Sample name': 'sample4', abundance: 3 },
      { 'Sample name': 'sample5', abundance: -2.5 },
    ],
    categories: [
      { 'Sample name': 'sample1', category: 'B' },
      { 'Sample name': 'sample2', category: 'C' },
      { 'Sample name': 'sample4', category: 'LongText' },
      { 'Sample name': 'sample5', category: 'C' },
    ],
    colors: {
      LongText: '#d20d0d',
      B: '#0d62d2',
      C: '#a80086',
    },
    showTrendline: true,
    showLegend: true,
    legendPosition: 'side',
  },
};
