import { html, TemplateResult } from 'lit';
import '../packages/biowc-histogram/dist/src/biowc-histogram';
import HistogramFixture from '../packages/biowc-histogram/test/fixtures/HistogramFixture';

export default {
  title: 'BiowcHistogram',
  component: 'biowc-histogram',
  argTypes: {
    idKey: { control: 'text' },
    valueKey: { control: 'text' },
    xLabel: { control: 'text' },
    yLabel: { control: 'text' },
    xValues: { control: 'object' },
    barColor: { control: 'text'},
    numBins: { control: 'number'},
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
  xValues: { [key: string]: number | string | null}[];
  barColor: string;
  numBins: number;
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-histogram
    .idKey="${args.idKey}"
    .valueKey="${args.valueKey}"
    .xLabel="${args.xLabel}"
    .yLabel="${args.yLabel}"
    .xValues="${args.xValues}"
    .barColor="${args.barColor}"
    .numBins="${args.numBins}"
  >
  </biowc-histogram>
`;

export const Regular = Template.bind({});
Regular.args = HistogramFixture.histogram;

export const CustomLabels = Template.bind({});
CustomLabels.args = {
  ...Regular.args,
  xLabel: 'xLabel',
  yLabel: 'yLabel',
};

export const CustomColor = Template.bind({});
CustomColor.args = {
  ...Regular.args,
  barColor: '#bd282c',
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

export const LargeHistogram = Template.bind({});
LargeHistogram.args = HistogramFixture.largeHistogram;

export const NaHistogram = Template.bind({});
NaHistogram.args = HistogramFixture.naHistogram;
