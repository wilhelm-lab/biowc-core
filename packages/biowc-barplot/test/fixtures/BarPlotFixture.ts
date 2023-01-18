export default {
  barPlot: {
    minWidth: 600,
    minHeight: 400,
    barWidth: 11,
    title: 'Example Bar Plot',
    multiSelection: true,
    data: {
      AttributeType: 'Attribute type',
      Dataset: 'Dataset',
      data: [
        {
          modelId: 0,
          labelId: 1,
          value: 3.5,
          minValue: 1,
          maxValue: 5,
          label: 'Exampletinib: Cellline B',
        },
        {
          modelId: '1',
          labelId: 2,
          value: 2,
          minValue: 4,
          maxValue: 8,
          label: 'Whateverimab: Cellline C',
        },
        {
          modelId: '2',
          labelId: 3,
          value: 4,
          minValue: 3.9,
          maxValue: 4.1,
          label: 'Foobarbazine: Cellline B',
        },
      ],
    },
    sSelectedModelIds: [],
  },
};
