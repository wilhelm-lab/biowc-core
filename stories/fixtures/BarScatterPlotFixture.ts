export default {
  barPlot: {
    minWidth: 600,
    minHeight: 400,
    barWidth: 11,
    myTitle: 'another Example Bar Plot',
    multiSelection: true,
    data: {
      attributeType: 'Attribute type',
      dataset: 'Dataset',
      data: [
        {
          modelId: 0,
          labelId: 1,
          value: 3.5,
          minValue: 1,
          maxValue: 5,
          label: 'Exampletinib: Cellline B',
          tooltipText: 'Some text',
        },
        {
          modelId: 1,
          labelId: 2,
          value: 2,
          minValue: 4,
          maxValue: 8,
          label: 'Whateverimab: Cellline C',
          tooltipText: '',
        },
        {
          modelId: 2,
          labelId: 3,
          value: 4,
          minValue: 3.9,
          maxValue: 4.1,
          label: 'Foobarbazine: Cellline B',
          tooltipText:
            "This is a large text to test how the tooltip will behave when there's a lot to say",
        },
        {
          modelId: 3,
          labelId: 4,
          value: 7,
          minValue: -1.45,
          maxValue: 2.555,
          label: 'A weird label\nsomehow...',
        },
      ],
    },
    sSelectedModelIds: [],
  },
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
  },
};