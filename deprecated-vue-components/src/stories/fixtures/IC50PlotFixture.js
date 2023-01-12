const ic50plot = {
  width: 600,
  height: 400,
  //The parameters are a bit different than in the GenericLinePlot, e.g. slope is lowercase.
  curveParameters: {
    formula: 'return bottom + (top - bottom) / (1 + Math.exp(slope * (Math.log(x) - Math.log(inflection))));',
    slope: { value: 1.35 },
    //The values of inflection and the dataPoints are not *1e9 here (this should be customizable by a flag)
    inflection: { value: 5.5, std_error: 2 },
    top: { value: 0.932 },
    bottom: { value: 0.127 }
  },
  dataPoints: [[300, 0.12063101147778872],
    [10000, 0.1352228985218722],
    [0.3, 0.8496821843981236],
    [10, 0.40418381986910196],
    [0.03, 0.9462693432238317],
    [1, 0.9609196918750766],
    [30, 0.17756059206346145],
    [100000, 0.12818969446077955],
    [100, 0.14009097584918587],
    [3, 0.6318951493454534]],
  properties: { calculationMethod: 4 }, //4 means normalized intensities, anything else means unnormalized
  visible: true,
  title: 'Example IC50 Plot'

};

export default { ic50plot };