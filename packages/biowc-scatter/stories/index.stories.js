import { html } from 'lit';
import '../biowc-scatter.js';

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

function Template({
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
}) {
  return html`
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
}

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
