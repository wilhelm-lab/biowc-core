import VolcanoPlot from '../components/VolcanoPlot';
import VolcanoPlotFixture from './fixtures/VolcanoPlotFixture';

export default {
    title: 'VueVolcanoPlot',
    component: VolcanoPlot,
    argTypes: {},
    parameters: {
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { VolcanoPlot },
    props: Object.keys(argTypes),
    template: '<volcano-plot v-bind="$props" />',
})

export const ExampleVolcanoPlot = Template.bind({})
ExampleVolcanoPlot.args = VolcanoPlotFixture.scatterPlot
