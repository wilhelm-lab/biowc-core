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
    template: '<div>I add nothing on top of the scatter plot. Delete me!<volcano-plot v-bind="$props" /></div>',
})

export const ExampleVolcanoPlot = Template.bind({})
ExampleVolcanoPlot.args = VolcanoPlotFixture.scatterPlot
