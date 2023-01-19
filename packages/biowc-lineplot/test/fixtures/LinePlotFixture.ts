const basicLineplot = {
  dataPoints: [
    [
      [0, 1],
      [2, 5],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
    [
      [1, 7],
      [-1, 0],
      [0, 3],
      [2, 5],
      [-2, -2],
    ],
  ],
  width: 500,
  height: 500,
  xAxisLabel: 'This is the x Axis',
  yAxisLabel: 'This is the y Axis',
};

const oneDotLineplot = {
  dataPoints: [[[1, 1]]],
};

const emptyLineplot = {
  dataPoints: [[]],
};

const complexLineplot = {
  dataPoints: [
    [
      [0, 1],
      [2, 5],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
    [
      [1, 7],
      [-1, 0],
      [0, 3],
      [2, 5],
      [-2, -2],
    ],
    [
      [-3, 4],
      [8, 6],
      [1, 3],
      [9, 4],
      [-1, 6],
    ],
    [
      [1, 1],
      [-1, 5],
      [0, 3],
      [5, 5],
      [-5, -2],
    ],
    [
      [4, 1],
      [2, 9],
      [1, 2],
      [3, 3],
      [8, 6],
    ],
    [
      [1, 7],
      [-1, 0],
      [0, 3],
      [2, 4],
      [-2, -2],
    ],
    [
      [0, 1],
      [2, 5],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
    [
      [1, 7],
      [-8, 0],
      [0, 3],
      [2, 9],
      [-2, -2],
    ],
    [
      [0, 1],
      [2, 3],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
    [
      [5, 7],
      [-1, -4],
      [4, 3],
      [2, 4],
      [-2, 6],
    ],
  ],
  width: 500,
  height: 500,
};

const parabola = {
  formulas: ['return x**2+abscissa', 'return (-0.2*x+offset)**3'],
  curveParameters: [{ abscissa: 0.5 }, { offset: -1 }],
  curveMinX: -5,
  curveMaxX: 5,
};

const userInput = [
  {
    id: 'dataset1',
    formula: 'return x+abscissa',
    curveParameters: { abscissa: 2 },
    dataPoints: [
      [0, 1],
      [2, 5],
      [1, 2],
      [3, 4],
      [4, 6],
    ],
    color: '#58631c',
  },

  {
    id: 'dataset2',
    formula: 'return x**2+abscissa',
    curveParameters: { abscissa: 2 },
    dataPoints: [
      [1, 7],
      [-1, 0],
      [0, 3],
      [2, 5],
      [-2, -2],
    ],
  },
];

const plotMetaAttributes = {
  width: 500,
  height: 500,
  xAxisLabel: 'This is the x Axis',
  yAxisLabel: 'This is the y Axis',
  curveMinX: -5,
  curveMaxX: 5,
  connectDots: true, // TODO: Add check in component
};

export default {
  basicLineplot,
  oneDotLineplot,
  emptyLineplot,
  parabola,
  complexLineplot,
  userInput,
  plotMetaAttributes,
};
