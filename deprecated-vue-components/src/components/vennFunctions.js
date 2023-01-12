const memberships = {

  getMemFunc (num) {
    /* makes all possible binary combinations for the input number
      for example if num = 3 it generates
        [
        [ 0, 0, 1 ],
        [ 0, 1, 0 ],
        [ 0, 1, 1 ],
        [ 1, 0, 0 ],
        [ 1, 0, 1 ],
        [ 1, 1, 0 ],
        [ 1, 1, 1 ]
        ]
    */
    function areAllCharactersTheSame (word) {
      // returns true if all characters of word are identical: for example areAllCharactersTheSame(111) returns true
      let ansWer = true
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== word[0]) {
          ansWer = false
        }
      }
      return ansWer
    }

    function addLeadingZeros (num, totalLength) {
      // adds zero before the num to make the size to totalLength
      // i.e. addLeadingZeros(1,3) will return 001
      return (String(num).padStart(totalLength, '0'))
    }

    function dec2Binary (numInt) {
      // takes to binary i.e dec2Binary(2) = 10
      return (numInt >>> 0).toString(2)
    }

    let conDition = true // condition is true as far as all characters of comB are not identical
    let counTer = 1
    let comB = null
    const listComb = []
    let innerList = []
    while (conDition) {
      comB = dec2Binary(counTer)
      comB = addLeadingZeros(comB, num)

      for (let k = 0; k < comB.length; k++) {
        innerList.push(parseInt(comB[k]))
      }

      listComb.push(innerList)
      innerList = []

      if (areAllCharactersTheSame(comB)) { // when all characters are the same like 111 the loop should end
        conDition = false
      }
      counTer++
    }
    return (listComb)
  },
  getIntersection (listA, listB) {
    // items overlapping in both lists
    const setA = new Set(listA)
    const setB = new Set(listB)
    const intersection = new Set(
      [...setA].filter(element => setB.has(element))
    )
    return [...intersection]
  },
  getDifference (listA, listB) {
    // items which are in A but not in B
    const diff = listA.filter(function (x) { return listB.indexOf(x) < 0 })
    return diff
  },
  getProteinList (plotSet, id) {
    // take the whole dataset as plotSet and one group id and returns all elements which belong to group id
    const grp = plotSet.filter(element => element.group === id)
    const grpProteins = []
    grp.forEach(element => { grpProteins.push(element.sample) })
    return grpProteins
  },
  getUniqList (plotSet) {
    // gettig the unique of the  group names in plotSet
    const uniquegroups = []
    plotSet.filter(element => {
      const isDuplicate = uniquegroups.includes(element.group)
      if (!isDuplicate) {
        uniquegroups.push(element.group)
        return true
      }
      return false
    })
    return uniquegroups
  }
}

export default memberships
