import ParallelCoordinatesPlot from '../components/ParallelCoordinatesPlot'
import ParallelCoordinatesPlotFixture from './fixtures/ParallelCoordinatesPlotFixture'
import vuetify from '../plugins/vuetify'

export default {
    title: 'VueParallelCoordinatesPlot',
    component: ParallelCoordinatesPlot,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { ParallelCoordinatesPlot },
    props: Object.keys(argTypes),
    vuetify,
    template: '<v-app><parallel-coordinates-plot v-bind="$props" /></v-app>',
})

export const ExampleParallelCoordinatesPlot = Template.bind({})
ExampleParallelCoordinatesPlot.args = ParallelCoordinatesPlotFixture.parallelCoordinatesPlot
