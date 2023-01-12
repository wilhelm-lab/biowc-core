import SpectrumViewer from '../components/SpectrumViewer'
import SpectrumViewerFixture from './fixtures/SpectrumViewerFixture'
import vuetify from '../plugins/vuetify'

export default {
    title: 'VueSpectrumViewer',
    component: SpectrumViewer,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { SpectrumViewer },
    props: Object.keys(argTypes),
    vuetify,
    template: '<v-app><spectrum-viewer v-bind="$props" /></v-app>',
})

export const ExampleSpectrumViewer = Template.bind({})
ExampleSpectrumViewer.args = SpectrumViewerFixture.spectrumViewer
