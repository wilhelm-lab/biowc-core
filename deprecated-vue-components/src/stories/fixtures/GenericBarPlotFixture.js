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
      VALUE: 3.5,
      ModelId: '0', //TODO: Can be multiple, ;-separated. I am so sorry...
      DrugId: 'Exampletinib',
      CellLineId: 'CellLine X',
      MIN_VALUE: -10,
      MAX_VALUE: 10,
      CellLine: 'DoIHaveToSpecifyThis?',
      Drug: 'Andwhataboutthis?'
    }]
  },
  sSelectedModelIds: { data: [] } //list of 'modelIds'

};


export default { barplot };