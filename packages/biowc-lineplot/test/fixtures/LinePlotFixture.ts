const basicLineplot = [
  {
    id: 'lineplot1',
    dataPoints: [
      [0, 1],
      [2, 5],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
  },
  {
    id: 'lineplot2',
    dataPoints: [
      [1, 7],
      [-1, 0],
      [0, 3],
      [2, 5],
      [-2, -2],
    ],
  },
];

const oneDotLineplot = [
  {
    id: 'onedot',
    dataPoints: [[1, 1]],
  },
];

const emptyLineplot = [
  {
    id: 'emptylp',
    dataPoints: [[]],
  },
];

const complexLineplot = [
  {
    id: 'complex1',
    dataPoints: [
      [0, 1],
      [2, 5],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
  },
  {
    id: 'complex2',
    dataPoints: [
      [1, 7],
      [-1, 0],
      [0, 3],
      [2, 5],
      [-2, -2],
    ],
  },
  {
    id: 'complex3',
    dataPoints: [
      [-3, 4],
      [8, 6],
      [1, 3],
      [9, 4],
      [-1, 6],
    ],
  },
  {
    id: 'complex4',
    dataPoints: [
      [1, 1],
      [-1, 5],
      [0, 3],
      [5, 5],
      [-5, -2],
    ],
  },
  {
    id: 'complex5',
    dataPoints: [
      [4, 1],
      [2, 9],
      [1, 2],
      [3, 3],
      [8, 6],
    ],
  },
  {
    id: 'complex6',
    dataPoints: [
      [1, 7],
      [-1, 0],
      [0, 3],
      [2, 4],
      [-2, -2],
    ],
  },
  {
    id: 'complex7',
    dataPoints: [
      [0, 1],
      [2, 5],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
  },
  {
    id: 'complex8',
    dataPoints: [
      [1, 7],
      [-8, 0],
      [0, 3],
      [2, 9],
      [-2, -2],
    ],
  },
  {
    id: 'complex9',
    dataPoints: [
      [0, 1],
      [2, 3],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
  },
  {
    id: 'complex10',
    dataPoints: [
      [5, 7],
      [-1, -4],
      [4, 3],
      [2, 4],
      [-2, 6],
    ],
  },
];

const parabola = [
  {
    id: 'parabola1',
    formula: 'return x**2+abscissa',
    curveParameters: { abscissa: 0.5 },
  },
  {
    id: 'parabola2',
    formula: 'return (-0.2*x+offset)**3',
    curveParameters: { offset: -1 },
  },
];

const userInput = [
  {
    id: 'dataset1',
    formula: 'return x+$abscissa$',
    escapeCharacter: '$',
    curveParameters: { abscissa: 2 },
    dataPoints: [
      [0, 1],
      [2, 5],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
    // color: '#58631c',
    legendText: 'Dataset 1',
    tooltipTextHTML:
      "<pre style='text-align: left'>I am Number <b>One</b>!</pre>",
  },

  {
    id: 'dataset2',
    formula: 'return x**2+#abscissa#',
    escapeCharacter: '#',
    curveParameters: { abscissa: 2 },
    curveHighlights: [1.5, 3.5],
    dataPoints: [
      [1, 7],
      [-1, 0],
      [0, 3],
      [2, 5],
      [-2, -2],
    ],
    // color: '#393dfc',
    legendText: 'Dataset 2',
    tooltipTextHTML:
      "<pre style='text-align: left'><i>I</i> am Number <b>Two</b>!</pre>",
  },
];

const plotMetaAttributes = {
  width: 800,
  height: 500,
  xAxisLabel: 'Very important x axis',
  yAxisLabel: 'This is the y Axis',
  curveMinX: -10,
  curveMaxX: 5,
  connectDots: true,
  showLegend: true,
  legendPosition: 'bottom',
  dotOpacity: 0.75,
  curveOpacity: 0.9,
  legendFontSize: 12,
};

const userInputLogarithmic = [
  {
    id: 'LogDataset1',
    formula: 'return $d$+($a$-$d$)/(1+(x/$c$)**$b$)',
    escapeCharacter: '$',
    curveParameters: {
      a: 40, // Min
      b: 5, // Slope
      c: 2, // Inflection
      d: 20, // Max
    },

    dataPoints: [
      [1, 2],
      [2, 5],
      [3, 4],
      [4, 6],
      [5, 10],
    ],
    color: '#58631c',
    legendText: 'Logarithmic Dataset 1',
  },
];

const plotMetaAttributesLogarithmic = {
  width: 800,
  height: 500,
  xAxisLabel: 'Log x',
  yAxisLabel: 'y',
  // curveMinX: 1,
  // curveMaxX: 10,
  connectDots: true,
  showLegend: true,
  legendPosition: 'side',
  dotOpacity: 0.75,
  curveOpacity: 0.9,
  xScale: 'logarithmic',
  yScale: 'linear',
};

export default {
  basicLineplot,
  oneDotLineplot,
  emptyLineplot,
  parabola,
  complexLineplot,
  userInput,
  plotMetaAttributes,
  userInputLogarithmic,
  plotMetaAttributesLogarithmic,
};
