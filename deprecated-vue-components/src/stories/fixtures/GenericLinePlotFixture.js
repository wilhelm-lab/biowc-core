const curveplot = {
  minWidth: 1000,
  minHeight: 400,
  curveParameters: [{
    formula: 'return Lower Limit + (Upper Limit - Lower Limit) / (1 + Math.exp(Slope * (Math.log(x) - Math.log(inflection))));',
    Slope: { value: 1.35 },
    inflection: { value: 5.5e-9, std_error: 5.3e-10 },
    'Upper Limit': { value: 0.932 },
    'Lower Limit': { value: 0.127 }
  },
    {
      formula: 'return Lower Limit + (Upper Limit - Lower Limit) / (1 + Math.exp(Slope * (Math.log(x) - Math.log(inflection))));',
      Slope: { value: 2.65 },
      inflection: { value: 6.12e-6, std_error: 4.7e-7 },
      'Upper Limit': { value: 1.12 },
      'Lower Limit': { value: 2.92 }
    }],
  dataPoints: [
    [[3e-7, 0.12063101147778872], [0.000001, 0.1352228985218722], [3e-10, 0.8496821843981236], [1e-8, 0.40418381986910196], [3e-11, 0.9462693432238317], [1e-9, 0.9609196918750766], [3e-8, 0.17756059206346145], [0.00001, 0.12818969446077955], [1e-7, 0.14009097584918587], [3e-9, 0.6318951493454534]],
    [[0.000003, 1.2897636385655387], [0.00003, 2.9499505232243046], [3e-7, 1.1564594422605476], [3e-8, 1.1299999231924347], [1e-7, 1.1183230470435457], [0.000001, 1.1678202800506234], [0.00001, 2.548519538096348], [1e-8, 0.9715854466541876], [3e-9, 1.3014333484993992]]
  ],
  properties: [
    {
      curveId: 42,
      TREATMENT: 'Gene A',
      lineTooltip: '<b>I can render HTML!</b><br>' +
        '<i>Isn\'t that cool?</i>',
      dotTooltipTitle: '<b>Coordinates:</b> '
    },
    {
      curveId: 43,
      TREATMENT: 'Gene B',
      lineTooltip: '<b>I can render HTML!</b><br>' +
        '<i>Isn\'t that cool?</i>',
      dotTooltipTitle: '<b>Coordinates:</b> '
    }],
  title: 'Example Curve Plot',
  turnover: false,
  ratioY: false,
  hideLegend: false,
  legendAtBottom: false,
  hideErrorBars: false,
  xAxisLabel: 'Dose',
  yAxisLabel: 'Response',
  logX: true,
  exponentialX: true,
  drawLine: false

};

const lineplot = { ...curveplot, curveParameters: [[], []], drawLine: true, title: 'Example Line Plot' };


export default { curveplot, lineplot };