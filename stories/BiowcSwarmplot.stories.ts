import { html, TemplateResult } from 'lit';
import '../packages/biowc-swarmplot/dist/src/biowc-swarmplot';
import SwarmPlotFixture from '../packages/biowc-swarmplot/test/fixtures/SwarmPlotFixture';
import { BiowcSwarmplot } from "biowc-swarmplot";

export default {
  title: 'BiowcSwarmplot',
  component: 'biowc-swarmplot',
  argTypes: {
    swarmTitle: { control: 'text' },
    fieldName: { control: 'text' },
    fieldValues: { control: 'text' },
    swarmTitlePrefix: { control: 'text' },
    width: {control: 'number'},
    height: {control: 'number'},
    drawBoxPlot: {control: 'boolean'}
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
  width: number;
  height: number;
  drawBoxPlot: boolean;
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-swarmplot
    .swarmTitle=${args.swarmTitle}
    .fieldName="${args.fieldName}"
    .fieldValues="${args.fieldValues}"
    .swarmTitlePrefix="${args.swarmTitlePrefix}"
    .swarmData="${args.swarmData}"
    .height="${args.height}"
    .width="${args.width}"
    .drawBoxPlot="${args.drawBoxPlot}"
  >
  </biowc-swarmplot>
`;

export const Regular = Template.bind({});
Regular.args = SwarmPlotFixture.swarmPlot;

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  ...Regular.args,
  swarmTitle: 'new title',
};

export const CustomSize = Template.bind({});
CustomSize.args = {
  ...Regular.args,
  height: 200,
  width: 300,
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

export const CustomColor = Template.bind({});
CustomColor.args = {
  ...Regular.args,
  swarmData: [
    {"Z-score": 3.6, "Sample name": "sample1", "colorID": 'red', "sizeR": 3},
    {"Z-score": 3.0, "Sample name": "sample2", "colorID": 'red', "sizeR": 3},
    {"Z-score": 2.5, "Sample name": "sample3", "colorID": 'red', "sizeR": 3},
    {"Z-score": 2.3, "Sample name": "sample4", "colorID": 'red', "sizeR": 3},
    {"Z-score": 2.3, "Sample name": "sample5", "colorID": 'red', "sizeR": 3},
  ],
};

export const CustomRadius = Template.bind({});
CustomRadius.args = {
  ...Regular.args,
  swarmData: [
    {"Z-score": 3.6, "Sample name": "sample1", "colorID": 'grey', "sizeR": 5},
    {"Z-score": 3.0, "Sample name": "sample2", "colorID": 'grey', "sizeR": 5},
    {"Z-score": 2.5, "Sample name": "sample3", "colorID": 'grey', "sizeR": 5},
    {"Z-score": 2.3, "Sample name": "sample4", "colorID": 'grey', "sizeR": 5},
    {"Z-score": 2.3, "Sample name": "sample5", "colorID": 'grey', "sizeR": 5},
  ],
};


