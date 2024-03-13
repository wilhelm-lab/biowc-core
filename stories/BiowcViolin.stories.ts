import { html, TemplateResult } from 'lit';
import '../packages/biowc-violinplot/dist/src/biowc-violinplot';
import ViolinPlotFixture from '../packages/biowc-violinplot/test/fixtures/ViolinPlotFixture';

export default {
  title: 'BiowcViolinplot',
  component: 'biowc-violinplot',
  argTypes: {
    plotLabelExtraFields: {control: 'object' },
    chartData: { control: 'object' },
    yLabel: { control: 'text' },
    simpleLabel: {control: 'boolean'}
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  plotLabelExtraFields: string[];
    chartData: { [key: string]: number | string | {[key: string]: number | string}[] }[];
  yLabel: string;
  simpleLabel: boolean;
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-violinplot
    .yLabel="${args.yLabel}"
    .simpleLabel="${args.simpleLabel}"
    .plotLabelExtraFields="${args.plotLabelExtraFields}"
    .chartData="${args.chartData}"
  >
  </biowc-violinplot>
`;

export const Regular = Template.bind({});
Regular.args = ViolinPlotFixture.violinPlot;

export const CustomLabels = Template.bind({});
CustomLabels.args = {
  ...Regular.args,
  plotLabelExtraFields: [],
};

export const CustomData = Template.bind({});
CustomData.args = {
  ...Regular.args,
  chartData: [
    {
      idKey: 103,
      sampleName: 'CP-724714',
      scores: [{ scoreName: 'catds', scoreValue: 0.8 }],
      data: [
        {
          proteinId: 59199,
          geneName: 'MAP2K5',
          value: 3.156096833453978,
          STD_ERROR: 377.496344653788,
          COD: 0.973658167533412,
          BIC: -19.0144925570025,
        },
        {
          proteinId: 80852,
          geneName: 'OSBPL3',
          value: 3.3640446277823703,
          STD_ERROR: 851.166394634132,
          COD: 0.946086446044412,
          BIC: -7.68393005312425,
        },
        {
          proteinId: 51261,
          geneName: 'EGFR',
          value: 1.9513888363866225,
          STD_ERROR: 51.9773760920471,
          COD: 0.898650157095037,
          BIC: 7.41915175882179,
        },
      ],
    },
  ]
};
