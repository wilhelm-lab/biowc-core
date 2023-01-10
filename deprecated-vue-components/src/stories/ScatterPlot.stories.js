import ScatterPlot from '../components/ScatterPlot'
import ScatterPlotFixture from './fixtures/ScatterPlotFixture'

export default {
    title: 'VueScatterPlot',
    component: ScatterPlot,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { ScatterPlot },
    props: Object.keys(argTypes),
    template: '<scatter-plot v-bind="$props" />',
})

export const ExampleScatterPlot = Template.bind({})
ExampleScatterPlot.args = ScatterPlotFixture.scatterPlot
