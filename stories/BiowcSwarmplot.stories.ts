import { html, TemplateResult } from 'lit';
import '../packages/biowc-swarmplot/dist/src/biowc-swarmplot';
import SwarmPlotFixture from '../packages/biowc-swarmplot/test/fixtures/SwarmPlotFixture';

export default {
  title: 'BiowcSwarmplot',
  component: 'biowc-swarmplot',
  argTypes: {
    idKey: { control: 'text' },
    valueKey: { control: 'text' },
    xLabel: { control: 'text' },
    xValues: { control: 'object' },
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
  xValues: { [key: string]: number | string }[];
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-swarmplot
    .idKey="${args.idKey}"
    .valueKey="${args.valueKey}"
    .xLabel="${args.xLabel}"
    .xValues="${args.xValues}"
  >
  </biowc-swarmplot>
`;

export const Regular = Template.bind({});
Regular.args = SwarmPlotFixture.swarmPlot;

export const CustomLabels = Template.bind({});
CustomLabels.args = {
  ...Regular.args,
  xLabel: 'xLabel',
};

export const CustomData = Template.bind({});
CustomData.args = {
  ...Regular.args,
  xValues: [
    { 'Sample name': 'sample1', abundance: 0 },
    { 'Sample name': 'sample2', abundance: 1 },
    { 'Sample name': 'sample3', abundance: 2 },
  ],
};
