import axios from 'axios'

const utils = {
  /**
     * Download the given context as a png.
     *
     * @param {object}  oCanvas     The canvas of the svg.
     * @param {string}  sSource     Image/svg source.
     * @param {string}  sName       The image name used for the downloaded file.
     */
  downloadPNG: function (oCanvas, sSourceSVG, sName) {
    // serialize svgs
    const serializer = new XMLSerializer()
    let sSource = serializer.serializeToString(sSourceSVG)
    // add xml declaration
    sSource = '<?xml version="1.0" standalone="no"?>\r\n' + sSource

    const sImgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(sSource)))

    const oContext = oCanvas.getContext('2d')

    const image = new Image()
    image.src = sImgsrc
    image.onload = function () {
      oContext.drawImage(image, 0, 0)

      // click button for download
      const oLink = document.createElement('a')
      oLink.download = sName + '.png'
      oLink.href = oCanvas.toDataURL('image/png')

      document.body.appendChild(oLink)
      oLink.click()
      document.body.removeChild(oLink)
    }
  },

  /**
     * Download the given svg source.
     * @param {string}  sSourceSVG The svg source.
     * @param {string}  sName   The image name used for the downloaded file.
     */
  downloadSVG: function (sSourceSVG, sName) {
    // serialize svgs
    const serializer = new XMLSerializer()
    let sSource = serializer.serializeToString(sSourceSVG)
    // add xml declaration
    sSource = '<?xml version="1.0" standalone="no"?>\r\n' + sSource

    const oBlob = new Blob([sSource], {
      type: 'image/svg+xml'
    })

    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(oBlob, sName + '.svg')
    } else {
      const oLink = document.createElement('a')
      oLink.download = sName + '.svg'
      oLink.href = URL.createObjectURL(oBlob)
      document.body.appendChild(oLink)
      oLink.click()
      document.body.removeChild(oLink)
    }
  },

  /**
     * Downloads the SVGs given in aSVGs either as SVG or PNG, depending on bDownloadAsSvg. The downloaded graphic gets the title sName.
     * @param  {svg[]} aSVGs          Array of SVGs to be downloaded
     * @param  {string} sName          Title and Name of the downloaded graphic
     * @param  {boolean} bDownloadAsSvg true: download as svg, false: download as png
     * @param  {string} sCanvasId      Id of the hidden canvas used for downloading as png
     */
  downloadSVGs: async function (aSVGs, sName, bDownloadAsSvg, sCanvasId, cssFiles) {
    sCanvasId = encodeURI(sCanvasId)

    // create new SVG for all components
    const oCombinedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    // create inline stylesheet
    const oStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    oStyle.setAttribute('type', 'text/css')

    let nMaxWidth = 0 // widest element determines the width for the new svg
    let nCombinedHeight = 30 // combined height for all components stacked, initially 30 for the Title
    for (let i = 0; i < aSVGs.length; i++) {
      const oSVG = aSVGs[i].cloneNode(true)

      const dSvgWidth = aSVGs[i].width.animVal.value
      const dSvgHeight = aSVGs[i].height.animVal.value

      if (dSvgWidth > nMaxWidth) {
        nMaxWidth = dSvgWidth
      }

      oSVG.setAttribute('width', dSvgWidth)
      oSVG.setAttribute('y', nCombinedHeight + 'px')
      oSVG.setAttribute('x', '0px')

      nCombinedHeight += dSvgHeight

      oCombinedSvg.appendChild(oSVG)
      // add stylesheets for the SVG to inline Stylesheets
      for (let j = 0; j < cssFiles.length; j++) {
        const response = await this.downloadCSS(cssFiles[j])
        oStyle.textContent += ' ' + response.data
      }
    }

    oCombinedSvg.setAttribute('height', nCombinedHeight)
    oCombinedSvg.setAttribute('width', nMaxWidth)
    oCombinedSvg.setAttribute('enable-background', 'new 0 0 ' + nMaxWidth + ' ' + nCombinedHeight)
    oCombinedSvg.setAttribute('viewBox', '0 0 ' + nMaxWidth + ' ' + nCombinedHeight)

    // add inline Stylesheet
    oCombinedSvg.appendChild(oStyle)

    // add title
    const newGTextTitle = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const newTextTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const textNodeTitle = document.createTextNode(sName)
    newGTextTitle.setAttribute('transform', 'translate(' + parseInt(oCombinedSvg.getAttribute('width'), 10) / 2 + ', 20)')
    newGTextTitle.setAttribute('text-anchor', 'middle')
    newTextTitle.setAttribute('font-weight', 'bold')
    newTextTitle.setAttribute('font-size', '20px')
    newTextTitle.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    newTextTitle.appendChild(textNodeTitle)
    newGTextTitle.appendChild(newTextTitle)
    oCombinedSvg.appendChild(newGTextTitle)

    // scaling svg for higher resolution in png
    const SCALINGFACTOR = bDownloadAsSvg ? 1 : 2 // higher scaling factors might crash the browser when downloading as png
    const scalingSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const scalingGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    scalingSVG.setAttribute('height', nCombinedHeight * SCALINGFACTOR)
    scalingSVG.setAttribute('width', nMaxWidth * SCALINGFACTOR)
    scalingGroup.setAttribute('transform', 'scale(' + SCALINGFACTOR + ')')
    scalingGroup.appendChild(oCombinedSvg)
    scalingSVG.appendChild(scalingGroup)

    if (!bDownloadAsSvg) {
      // save png
      // paint into canvas
      const canvas = document.getElementById(sCanvasId)
      // resize canvas to the height of bodymap + title + protein expression
      canvas.height = nCombinedHeight * SCALINGFACTOR
      canvas.width = nMaxWidth * SCALINGFACTOR

      this.downloadPNG(canvas, scalingSVG, sName)
    } else {
      this.downloadSVG(scalingSVG, sName)
    }
  },

  downloadCSS: function (path) {
    return axios.get(path, {})
  },

  /**
     * Download Array of CSV formatted Rows as <sFilename>.csv
     * @param  {string[]} aCSVRows Array of csv formatted Strings
     * @param {string} sFilename Name of the File to be downloaded
     */
  downloadCSV: function (aCSVRows, sFileName) {
    const sCSV = aCSVRows.join('\n')

    const oBlob = new Blob([sCSV], {
      type: 'text/plain'
    })

    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(oBlob, sFileName + '.csv')
    } else {
      const oLink = document.createElement('a')
      oLink.download = sFileName + '.csv'
      oLink.href = URL.createObjectURL(oBlob)
      document.body.appendChild(oLink)
      oLink.click()
      document.body.removeChild(oLink)
    }
  },

  /**
     * Download Array of CSV formatted Rows as <sFilename>.csv
     * @param  {string[]} aCSVRows Array of csv formatted Strings
     * @param {string} sFilename Name of the File to be downloaded
     */
  downloadFile: function (aCSVRows, sFileName, sFileExtension) {
    const sCSV = aCSVRows.join('\n')

    const oBlob = new Blob([sCSV], {
      type: 'text/plain'
    })

    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(oBlob, sFileName + '.' + sFileExtension)
    } else {
      const oLink = document.createElement('a')
      oLink.download = sFileName + '.' + sFileExtension
      oLink.href = URL.createObjectURL(oBlob)
      document.body.appendChild(oLink)
      oLink.click()
      document.body.removeChild(oLink)
    }
  }
}

export default utils
