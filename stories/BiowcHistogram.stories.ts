import { html, TemplateResult } from 'lit';
import '../packages/biowc-histogram/dist/src/biowc-histogram';
import HistogramFixture from '../packages/biowc-histogram/test/fixtures/HistogramFixture';
import { BiowcHistogram } from "biowc-histogram";

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
    width: {control: 'number'},
    height: {control: 'number'},
    plotKDE: { control: 'boolean'}
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes extends Pick<BiowcHistogram, keyof BiowcHistogram> {} // load in ArgTypes from BiowcHistogram properties: https://stackoverflow.com/questions/47114181/typescript-use-class-as-interface#64754408

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-histogram
    .idKey="${args.idKey}"
    .valueKey="${args.valueKey}"
    .xLabel="${args.xLabel}"
    .yLabel="${args.yLabel}"
    .xValues="${args.xValues}"
    .barColor="${args.barColor}"
    .numBins="${args.numBins}"
    .height="${args.height}"
    .width="${args.width}"
    .plotKDE="${args.plotKDE}"
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

export const CustomSize = Template.bind({});
CustomSize.args = {
  ...Regular.args,
  height: 200,
  width: 300,
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

export const PlotKDE = Template.bind({});
PlotKDE.args = HistogramFixture.kdeHistogram;

export const LargeHistogram = Template.bind({});
LargeHistogram.args = HistogramFixture.largeHistogram;

export const NaHistogram = Template.bind({});
NaHistogram.args = HistogramFixture.naHistogram;
