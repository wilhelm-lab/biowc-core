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
};

const oneDotLineplot = {
  dataPoints: [[[1, 1]]],
};

const emptyLineplot = {
  dataPoints: [[]],
};

const parabola = {
  formulas: ['return x**2+abscissa', 'return (x+offset)**2'],
  curveParameters: [{ abscissa: 0.5 }, { offset: -1 }],
};

export default { basicLineplot, oneDotLineplot, emptyLineplot, parabola };
