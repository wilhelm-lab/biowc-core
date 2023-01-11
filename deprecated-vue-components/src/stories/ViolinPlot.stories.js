import ViolinPlot from '../components/ViolinPlot'
import ViolinPlotFixture from './fixtures/ViolinPlotFixture'
import vuetify from '../plugins/vuetify'

export default {
    title: 'VueViolinPlot',
    component: ViolinPlot,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { ViolinPlot },
    props: Object.keys(argTypes),
    vuetify,
    template: '<v-app><violin-plot v-bind="$props" /></v-app>',
})

export const ExampleViolinPlot = Template.bind({})
ExampleViolinPlot.args = ViolinPlotFixture.violinPlot
