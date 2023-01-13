import GenericBarPlot from '../components/GenericBarPlot';
import GenericBarPlotFixture from './fixtures/GenericBarPlotFixture';
import vuetify from '../plugins/vuetify'

export default {
    title: 'VueGenericBarPlot',
    component: GenericBarPlot,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { GenericBarPlot },
    props: Object.keys(argTypes),
    vuetify,
    template: '<generic-bar-plot v-bind="$props" />',
})

export const ExampleHistogram = Template.bind({})
ExampleHistogram.args = GenericBarPlotFixture.barplot

