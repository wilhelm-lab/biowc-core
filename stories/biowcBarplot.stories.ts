import { html, TemplateResult } from 'lit';
import '../packages/biowc-barplot/dist/src/biowc-barplot';
import BarPlotFixture from "biowc-barplot/test/fixtures/BarPlotFixture";

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
  myTitle: string;
  multiSelection: boolean;
  data: any;
  sSelectedModelIds: number[];
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-barplot
    .minWidth="${args.minWidth}"
    .minHeight="${args.minHeight}"
    .barWidth="${args.barWidth}"
    .myTitle="${args.myTitle}"
    .multiSelection="${args.multiSelection}"
    .data="${args.data}"
    .sSelectedModelIds="${args.sSelectedModelIds}"
  >
  </biowc-barplot>
`;

export const Regular = Template.bind({});
Regular.args = BarPlotFixture.barPlot;


export const CustomData = Template.bind({});
CustomData.args = {
  ...Regular.args,
  data: {
    attributeType: "Attribute 2",
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
};


