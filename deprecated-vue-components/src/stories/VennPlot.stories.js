import VennPlot from '../components/VennPlot'
import VennPlotFixture from './fixtures/VennPlotFixture'
import vuetify from '../plugins/vuetify'

export default {
    title: 'VueVennPlot',
    component: VennPlot,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { VennPlot },
    props: Object.keys(argTypes),
    vuetify,
    template: '<v-app><venn-plot v-bind="$props" /></v-app>',
})

export const ExampleVennPlot = Template.bind({})
ExampleVennPlot.args = VennPlotFixture.vennPlot
