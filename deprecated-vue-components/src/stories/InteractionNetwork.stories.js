import InteractionNetwork from '../components/InteractionNetwork'
import InteractionNetworkFixture from './fixtures/InteractionNetworkFixture'
import vuetify from '../plugins/vuetify'

export default {
    title: 'VueInteractionNetwork',
    component: InteractionNetwork,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { InteractionNetwork },
    props: Object.keys(argTypes),
    vuetify,
    template: '<v-app><interaction-network v-bind="$props" /></v-app>',
})

export const ExampleInteractionNetwork = Template.bind({})
ExampleInteractionNetwork.args = InteractionNetworkFixture.interactionNetwork
