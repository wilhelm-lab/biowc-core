import { BiowcViolinplot } from 'biowc-violinplot';
import { html, TemplateResult } from 'lit';
import '../packages/biowc-violinplot/dist/src/biowc-violinplot';
import ViolinPlotFixture from '../packages/biowc-violinplot/test/fixtures/ViolinPlotFixture';

export default {
  title: 'BiowcViolinplot',
  component: 'biowc-violinplot',
  argTypes: {
    plotLabelValueCatds: {control: 'text' },
    chartData: { control: 'object' }
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
    plotLabelValueCatds: string;
    chartData: { [key: string]: number | string | {[key: string]: number | string}[] }[];
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-violinplot
    .plotLabelValueCatds="${args.plotLabelValueCatds}"
    .chartData="${args.chartData}"
  >
  </biowc-violinplot>
`;

export const Regular = Template.bind({});
Regular.args = ViolinPlotFixture.violinPlot;

export const CustomLabels = Template.bind({});
CustomLabels.args = {
  ...Regular.args,
  plotLabelValueCatds: 'CATDS Example',
};

export const CustomData = Template.bind({});
CustomData.args = {
  ...Regular.args,
  chartData: [
    {
      DRUG_ID: 103,
      TREATMENT: 'CUSTOM DRUG',
      catds: 0.8,
      data: [
        {
          PROTEIN_ID: 59199,
          GENE_NAME: 'MAP2K5',
          VALUE: 2.156096833453978,
          STD_ERROR: 377.496344653788,
          COD: 0.973658167533412,
          BIC: -19.0144925570025,
        },
        {
          PROTEIN_ID: 80852,
          GENE_NAME: 'OSBPL3',
          VALUE: 2.3640446277823703,
          STD_ERROR: 851.166394634132,
          COD: 0.946086446044412,
          BIC: -7.68393005312425,
        },
        {
          PROTEIN_ID: 51261,
          GENE_NAME: 'EGFR',
          VALUE: 5.9513888363866225,
          STD_ERROR: 51.9773760920471,
          COD: 0.898650157095037,
          BIC: 7.41915175882179,
        },
      ],
    }
]
};
