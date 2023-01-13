const barplot = {
  minWidth: 600,
  minHeight: 400,
  barWidth: 11,
  title: 'Example Bar Plot',
  multiSelection: true,
  data: {
    AttributeType: 'Attribute Type',
    Dataset: 'Dataset Name',
    data: [{
      ModelId: '0',
      DrugId: 1,
      CellLineId: 1,
      VALUE: 3.5,
      MIN_VALUE: 1,
      MAX_VALUE: 5,
      Drug: 'Exampletinib',
      CellLine: 'Cellline A'
    },
      {
        ModelId: '1',
        DrugId: 2,
        CellLineId: 3,
        VALUE: 2,
        MIN_VALUE: 4, //Here's a todo: It shouldn't be possible that the value range does not include the value
        MAX_VALUE: 8,
        Drug: 'Whateverimab',
        CellLine: 'Cellline C'
      },
      {
        ModelId: '2',
        DrugId: 5,
        CellLineId: 6,
        VALUE: 4,
        MIN_VALUE: 3.9,
        MAX_VALUE: 4.1,
        Drug: 'Foobarbazine',
        CellLine: 'Cellline B'
      }]
  },
  sSelectedModelIds: { data: [] } //list of 'modelIds'

};


export default { barplot };