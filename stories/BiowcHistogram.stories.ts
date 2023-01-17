import { html, TemplateResult } from 'lit';
import '../packages/biowc-scatter/dist/src/biowc-scatter';
import ScatterPlotFixture from '../packages/biowc-scatter/test/fixtures/ScatterPlotFixture';

export default {
  title: 'BiowcScatter',
  component: 'biowc-scatter',
  argTypes: {
    idKey: { control: 'text' },
    valueKey: { control: 'text' },
    xLabel: { control: 'text' },
    yLabel: { control: 'text' },
    xValues: { control: 'object' },
    yValues: { control: 'object' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  idKey: string;
  valueKey: string;
  xLabel: string;
  yLabel: string;
  xValues: { [key: string]: number | string }[];
  yValues: { [key: string]: number | string }[];
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-scatter
    .idKey="${args.idKey}"
    .valueKey="${args.valueKey}"
    .xLabel="${args.xLabel}"
    .yLabel="${args.yLabel}"
    .xValues="${args.xValues}"
    .yValues="${args.yValues}"
  >
  </biowc-scatter>
`;

export const Regular = Template.bind({});
Regular.args = ScatterPlotFixture.scatterPlot;

export const CustomLabels = Template.bind({});
CustomLabels.args = {
  ...Regular.args,
  xLabel: 'xLabel',
  yLabel: 'yLabel',
};

export const CustomData = Template.bind({});
CustomData.args = {
  ...Regular.args,
  xValues: [
    { 'Sample name': 'sample1', abundance: 0 },
    { 'Sample name': 'sample2', abundance: 1 },
    { 'Sample name': 'sample3', abundance: 2 },
  ],
  yValues: [
    { 'Sample name': 'sample1', abundance: 10 },
    { 'Sample name': 'sample2', abundance: 8 },
    { 'Sample name': 'sample3', abundance: -2 },
  ],
};
