import GenericLinePlot from '../components/GenericLinePlot'
import GenericLinePlotFixture from './fixtures/GenericLinePlotFixture'

export default {
    title: 'VueGenericLinePlot',
    component: GenericLinePlot,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { GenericLinePlot },
    props: Object.keys(argTypes),
    template: '<generic-line-plot v-bind="$props" />',
})

export const ExampleCurvePlot = Template.bind({})
ExampleCurvePlot.args = GenericLinePlotFixture.curveplot

export const ExampleLinePlot = Template.bind({})
ExampleLinePlot.args = GenericLinePlotFixture.lineplot