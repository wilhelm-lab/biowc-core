import { html, TemplateResult } from 'lit';
import '../packages/biowc-barplot/dist/src/biowc-barplot';
import BarPlotFixture from "../packages/biowc-barplot/test/fixtures/BarPlotFixture";

export default {
  title: 'BiowcBarplot',
  component: 'biowc-barplot',
  argTypes: {
    minWidth: { control: 'number' },
    minHeight: { control: 'number' },
    barWidth: { control: 'number' },
    title: { control: 'text' },
    multiSelection: { control: 'boolean' },
    data: { control: 'object' },
    sSelectedModelIds: { control: 'object' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  minWidth: number;
  minHeight: number;
  barWidth: number;
  title: string;
  multiSelection: boolean;
  data: {
    [key: string]: number | string | {
      [key: string]: number | string | {
        [key: string]: number | string
      }[]
    } | number[]
  }
  sSelectedModelIds: number[];
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-barplot
    .minWidth="${args.minWidth}"
    .minHeight="${args.minHeight}"
    .barWidth="${args.barWidth}"
    .title="${args.title}"
    .multiSelection="${args.multiSelection}"
    .data="${args.data}"
    .sSelectedModelIds="${args.sSelectedModelIds}"
  >
  </biowc-barplot>
`;

export const Regular = Template.bind({});
Regular.args = BarPlotFixture.barPlot;

/*
export const CustomLabels = Template.bind({});
CustomLabels.args = {
  ...Regular.args,
  minWidth: 'min width',
  minHeight: 'min height',
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
*/

