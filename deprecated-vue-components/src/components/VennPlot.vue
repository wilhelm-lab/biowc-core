<template>
  <div id="container">
    <div id="venn" />

    <v-text-field
      v-model="selectedBatch"
      value=""
      label="Selected Group"
      readonly
    />
    <v-text-field
      v-model="uniqueSize"
      value=""
      label="Number of Unique Proteins/Peptides"
      readonly
    />
    <v-text-field
      v-model="selectedSize"
      value=""
      label="Number of Selected Proteins/Peptides"
      readonly
    />
    <v-checkbox
      v-model="showListDiff"
      label="Show the list of Unique proteins/peptides"
    />
    <v-textarea
      label="Unique Proteins/Peptides"
      style="width:1000px;"
      :value="uniqProteins"
    />

    <v-checkbox
      v-model="showListIntersect"
      label="Show the list of Selected proteins/peptides"
    />
    <v-textarea
      label="Proteins/Peptides"
      style="width:1000px;"
      :value="selectedProteins"
    />
  </div>
</template>

<script>
import memberships from './vennFunctions'
const venn = require('venn.js')
const d3 = require('d3')
const matrix = require('matrix-js')

export default {
  name: 'VennPlot',
  props: {
    vennplotData: {
      // The data should be structured as bellow
      /*
      const plotSet = [
        { sample: 'gene1', group: 'A' },
        { sample: 'gene2', group: 'A' },
        { sample: 'gene2', group: 'B' },
        { sample: 'gene3', group: 'B' },
        { sample: 'gene1', group: 'C' },
        { sample: 'gene3', group: 'C' },
        { sample: 'gene4', group: 'C' }
      ]
      */
      type: Array,
      default: undefined
    }
  },
  data: () => ({
    finalPlotData: [],
    selectedBatch: '',
    selectedProteins: '',
    uniqProteins: '',
    selectedSize: '',
    uniqueSize: '',
    showListIntersect: false,
    showListDiff: false
  }),
  watch: {
    vennplotData: function () {
      this.plotVennDiagram()
    }
  },
  mounted () {
    this.plotVennDiagram()
  },
  methods: {
    // https://github.com/benfred/venn.js
    plotVennDiagram () {
      const that = this
      const plotSet = this.vennplotData
      const uniquegroups = memberships.getUniqList(plotSet)
      const assignedMat = matrix(memberships.getMemFunc(uniquegroups.length))

      // preparation of the plot set
      const finalSet = []
      for (let i = 0; i < assignedMat.size()[0]; i++) {
        const element = {}
        const sett = []
        for (let j = 0; j < assignedMat.size()[1]; j++) {
          if (assignedMat(i, j) === 1) {
            sett.push(uniquegroups[j])
          }
        }
        element.sets = sett
        finalSet.push(element)
      }

      // calculating proteins list and interserction sizse
      finalSet.forEach(element => {
        element.proteins = []
        if (element.sets.length === 1) {
          // only one group
          const indGrp = uniquegroups.indexOf(element.sets[0])
          element.proteins = memberships.getProteinList(plotSet, uniquegroups[indGrp])
        } else {
          // 2 groups
          const indGrp1 = uniquegroups.indexOf(element.sets[0])
          const grpList1 = memberships.getProteinList(plotSet, uniquegroups[indGrp1])
          const indGrp2 = uniquegroups.indexOf(element.sets[1])
          const grpList2 = memberships.getProteinList(plotSet, uniquegroups[indGrp2])
          let interSectList = memberships.getIntersection(grpList1, grpList2)
          // more than two groups
          if (element.sets.length > 2) { // more than 2 venn
            for (let z = 2; z < element.sets.length; z++) {
              const indGrp = uniquegroups.indexOf(element.sets[z])
              const grpList = memberships.getProteinList(plotSet, uniquegroups[indGrp])
              interSectList = memberships.getIntersection(interSectList, grpList)
            }
          }
          element.proteins = interSectList
        }
        element.size = element.proteins.length
      })
      this.finalPlotData = finalSet

      // let sets = this.finalPlotData
      const sets = this.finalPlotData.filter(element => element.size > 0)
      /*
         sets = sets.sort(function(a, b) {
          // Compare the 2 dates
          if (a.size < b.size) return -1;
          if (a.size > b.size) return 1;
          return 0;
        });
        */

      // plot
      const div = d3.select('#venn')
      div.datum(sets).call(venn.VennDiagram())
      // add listeners to all the groups to display tooltip on mouseover
      div.selectAll('g')
        .on('mouseover', function (event, d) {
          venn.sortAreas(div, d)
          // highlight the current path
          console.log(event)
          // console.log(selGrp)
          const selection = d3.select(this).transition('tooltip').duration(400)
          that.selectedBatch = selection._groups[0][0].__data__.sets
          that.selectedProteins = ''
          that.uniqProteins = ''
          let currentDiff = ''
          if (that.showListIntersect) { that.selectedProteins = selection._groups[0][0].__data__.proteins }
          that.uniqueSize = ''
          if (that.selectedBatch.length === 1) {
            currentDiff = selection._groups[0][0].__data__.proteins
            const selGrp = that.selectedBatch.toString()
            for (let p = 0; p < uniquegroups.length; p++) {
              if (uniquegroups[p] !== selGrp) {
                // console.log(uniquegroups[p])
                currentDiff = memberships.getDifference(currentDiff, memberships.getProteinList(plotSet, uniquegroups[p]))
              }
            }
            if (that.showListDiff) { that.uniqProteins = currentDiff }
          }
          that.uniqueSize = currentDiff.length
          that.selectedSize = selection._groups[0][0].__data__.size
          selection.select('path')
            .style('stroke-width', 3)
            .style('fill-opacity', 0.6)
            .style('stroke-opacity', 1)
        })
        .on('mouseout', function (d, i) {
          const selection = d3.select(this).transition('tooltip').duration(400)
          selection.select('path')
            .style('stroke-width', 0)
            .style('fill-opacity', 0.25)
            .style('stroke-opacity', 0)
        })
      // console.log(test)
    }

  }

}
</script>

<style>
.qcbtn {
  width: 70px;

}
</style>
