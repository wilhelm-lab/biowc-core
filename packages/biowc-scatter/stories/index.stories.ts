import { html, TemplateResult } from 'lit';
import '../src/biowc-scatter.js';

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
  idKey: string,
  valueKey: string,
  xLabel: string,
  yLabel: string,
  xValues: { [key: string]: number|string }[],
  yValues: { [key: string]: number|string }[],
}

const Template: Story<ArgTypes> = ({
                                     idKey = 'Sample name',
                                     valueKey = 'abundance',
                                     xLabel = 'abundance Gene_X',
                                     yLabel = 'abundance Gene_Y',
                                     xValues = [
                                       { 'Sample name': 'sample1', abundance: 1 },
                                       { 'Sample name': 'sample2', abundance: 3 },
                                       { 'Sample name': 'sample3', abundance: 3 },
                                     ],
                                     yValues = [
                                       { 'Sample name': 'sample1', abundance: 1 },
                                       { 'Sample name': 'sample2', abundance: 2 },
                                       { 'Sample name': 'sample3', abundance: 3 },
                                     ],
}: ArgTypes) => html`
  <biowc-scatter
    .idKey=${idKey}
    .valueKey=${valueKey}
    .xLabel=${xLabel}
    .yLabel=${yLabel}
    .xValues=${xValues}
    .yValues=${yValues}
  >
  </biowc-scatter>
`;

export const Regular = Template.bind({});

export const CustomLabels = Template.bind({});
CustomLabels.args = {
  xLabel: 'xLabel',
  yLabel: 'yLabel',
};

export const CustomData = Template.bind({});
CustomData.args = {
  xValues: [
    { 'Sample name': 'sample1', abundance: 1 },
    { 'Sample name': 'sample2', abundance: 3 },
    { 'Sample name': 'sample3', abundance: 3 },
  ],
  yValues: [
    { 'Sample name': 'sample1', abundance: 1 },
    { 'Sample name': 'sample2', abundance: 2 },
    { 'Sample name': 'sample3', abundance: 3 },
  ],
};
