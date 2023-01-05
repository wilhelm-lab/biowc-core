<template>
  <div id="app">
    <h1>Scatter plot</h1>
    <scatter-plot
        identifier1="gene_X"
        identifier2="gene_Y"
        :expressions1="[ { 'Sample name': 1, 'Z-score' : 3 }, { 'Sample name': 2, 'Z-score' : 1 }, { 'Sample name': 3, 'Z-score' : 3 } ]"
        :expressions2="[ { 'Sample name': 1, 'Z-score' : 2 }, { 'Sample name': 2, 'Z-score' : 1 }, { 'Sample name': 3, 'Z-score' : 5 } ]"
      />
  </div>
</template>

<script>
import ScatterPlot from './components/ScatterPlot.vue'

export default {
  name: 'App',
  components: {
    ScatterPlot
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
