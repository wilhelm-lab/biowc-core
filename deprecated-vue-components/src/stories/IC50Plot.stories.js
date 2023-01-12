import IC50Plot from '../components/IC50Plot';
import IC50PlotFixture from './fixtures/IC50PlotFixture';

export default {
    title: 'VueIC50Plot',
    component: IC50Plot,
    argTypes: {},
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/vue/configure/story-layout
        layout: 'centered',
    },
}

const Template = (args, { argTypes }) => ({
    components: { IC50Plot },
    props: Object.keys(argTypes),
    template: '<div><i-c50-plot v-bind="$props" /><p>I am quite similar to the GenericLinePlot and we should be merged.</p></div>',
})

export const ExampleCurvePlot = Template.bind({})
ExampleCurvePlot.args = IC50PlotFixture.ic50plot