import { html, TemplateResult } from 'lit';
import BarScatterPlotFixture from "./fixtures/BarScatterPlotFixture";
import './BiowcBarPlotScatter.ts'

export default {
  title: 'Combining BioWCs',
  component: 'biowc-bar-scatter-plot',
  argTypes: {
    scatterProperties: { control: 'any' },
    barplotProperties: { control: 'any' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  scatterPlot: any;
  barPlot: any;
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-bar-scatter-plot
    .scatterProperties="${args.scatterPlot}"
    .barplotProperties="${args.barPlot}"
  >
  </biowc-bar-scatter-plot>
`;

export const Regular = Template.bind({});
Regular.args = BarScatterPlotFixture;


export const CustomBarplot = Template.bind({});
CustomBarplot.args = {
  ...Regular.args,
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
          value: 4,
          minValue: 3,
          maxValue: 5,
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
            "This ",
        },
        {
          modelId: 3,
          labelId: 4,
          value: 7,
          minValue: 3.5,
          maxValue: 10.5,
          label: 'A weird label\nsomehow...',
        },
      ],
    },
    sSelectedModelIds: [],
  },
};

export const CustomScatter = Template.bind({});
CustomScatter.args = {
  ...Regular.args,
  scatterPlot: {
    idKey: 'Sample name',
    valueKey: 'abundance',
    xLabel: 'abundance Gene_A',
    xValues: [
      { 'Sample name': 'sample1', abundance: 3 },
      { 'Sample name': 'sample2', abundance: 4 },
      { 'Sample name': 'sample3', abundance: 7 },
      { 'Sample name': 'sample4', abundance: 2 },
    ],
    yLabel: 'abundance Gene_B',
    yValues: [
      { 'Sample name': 'sample1', abundance: 2 },
      { 'Sample name': 'sample2', abundance: 5 },
      { 'Sample name': 'sample3', abundance: 4 },
      { 'Sample name': 'sample4', abundance: 10 },
    ],
  },
};




