export default {
  barPlot: {
    width: 600,
    height: 400,
    barWidth: 11,
    plotTitle: 'another Example Bar Plot',
    multiSelection: true,
    yLabel: 'AUC',
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
};
