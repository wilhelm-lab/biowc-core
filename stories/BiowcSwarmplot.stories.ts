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
  swarmTitle: string;
  fieldName: string;
  fieldValues: string;
  swarmTitlePrefix: string;
  swarmData: { 'Z-score': number; "Sample name": string; "colorID": string; "sizeR": number;
  }[]
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-swarmplot
    .swarmTitle=${SwarmPlotFixture.swarmPlot.swarmTitle}
    .fieldName="${SwarmPlotFixture.swarmPlot.fieldName}"
    .fieldValues="${SwarmPlotFixture.swarmPlot.fieldValues}"
    .swarmTitlePrefix="${SwarmPlotFixture.swarmPlot.swarmTitlePrefix}"
    .swarmData="${SwarmPlotFixture.swarmPlot.swarmData}"
  >
  </biowc-swarmplot>
`;

export const Regular = Template.bind({});
Regular.args = SwarmPlotFixture.swarmPlot;

export const CustomLabels = Template.bind({});
CustomLabels.args = {
  ...Regular.args,
  swarmTitle: 'new title',
};

export const CustomData = Template.bind({});
CustomData.args = {
  ...Regular.args,
  swarmData: [
    {"Z-score": 3.6, "Sample name": "sample1", "colorID": 'grey', "sizeR": 3},
    {"Z-score": 3.0, "Sample name": "sample2", "colorID": 'grey', "sizeR": 3},
    {"Z-score": 2.5, "Sample name": "sample3", "colorID": 'grey', "sizeR": 3},
    {"Z-score": 2.3, "Sample name": "sample4", "colorID": 'grey', "sizeR": 3},
    {"Z-score": 2.3, "Sample name": "sample5", "colorID": 'grey', "sizeR": 3},
  ],
};
