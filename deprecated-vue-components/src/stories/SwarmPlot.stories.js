import SwarmPlot from '../components/SwarmPlot'
import SwarmPlotFixture from './fixtures/SwarmPlotFixture'
import vuetify from '../plugins/vuetify'

export default {
    title: 'VueSwarmPlot',
    component: SwarmPlot,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { SwarmPlot },
    props: Object.keys(argTypes),
    vuetify,
    template: '<v-app><swarm-plot v-bind="$props" /></v-app>',
})

export const ExampleSwarmPlot = Template.bind({})
ExampleSwarmPlot.args = SwarmPlotFixture.swarmPlot
