import { html, TemplateResult } from 'lit';
import '../packages/biowc-lineplot/dist/src/biowc-lineplot';
import LinePlotFixture from '../packages/biowc-lineplot/test/fixtures/LinePlotFixture';

interface InputDataset {
  id: string;
  formula?: string;
  curveParameters?: { [key: string]: number | undefined; };
  dataPoints?: number[][];
  color?: string;
  curveFunction?: Function;
  curvePoints?: number[][];
}

interface MetaDataAttributes {
  width: number;
  height: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  curveMinX: number;
  curveMaxX: number;
  curveMinY?: number;
  curveMaxY?: number;
  connectDots: boolean; // TODO: Add check in component
}


export default {
  title: 'BiowcLinePlot',
  component: 'biowc-lineplot',
  argTypes: {
    inputData: { control: 'object' },
    metaDataAttr: { control: 'object' }
  }
};

interface Story<T> {
  (args: T): TemplateResult;

  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  inputData: InputDataset[];
  metaDataAttr: MetaDataAttributes;
}

const Template: Story<ArgTypes> = (args: ArgTypes) => html`
  <biowc-lineplot
    .inputData='${args.inputData}'
    .metaDataAttr='${args.metaDataAttr}'
  >
  </biowc-lineplot>
`;

export const SimpleLinePlot = Template.bind({});
SimpleLinePlot.args = {};
SimpleLinePlot.args.inputData = LinePlotFixture.basicLineplot;
SimpleLinePlot.args.metaDataAttr = { ...LinePlotFixture.plotMetaAttributes, connectDots: true };


export const SimpleCurvePlot = Template.bind({});
SimpleCurvePlot.args = {
  inputData: LinePlotFixture.parabola,
  metaDataAttr: LinePlotFixture.plotMetaAttributes
};


export const LineAndCurve = Template.bind({});
LineAndCurve.args = {
  inputData: LinePlotFixture.userInput,
  metaDataAttr: LinePlotFixture.plotMetaAttributes
};
