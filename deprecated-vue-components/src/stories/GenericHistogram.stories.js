import GenericHistogram from '../components/GenericHistogram'
import GenericHistogramFixture from './fixtures/GenericHistogramFixture'

export default {
    title: 'VueGenericHistogram',
    component: GenericHistogram,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { GenericHistogram },
    props: Object.keys(argTypes),
    template: '<div><generic-histogram v-bind="$props" /><p style="font-size: 8pt">The median bar is obviously wrong. We didn\'t check why, sorry :/</p></div>',
})

export const ExampleHistogram = Template.bind({})
ExampleHistogram.args = GenericHistogramFixture.histogram

export const ExampleHistogramFiltered = Template.bind({})
ExampleHistogramFiltered.args = GenericHistogramFixture.histogramFiltered

export const ExampleHistogramWithSelection = Template.bind({})
ExampleHistogramWithSelection.args = GenericHistogramFixture.histogramWithSelection

