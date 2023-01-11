export default {
    spectrumViewer: {
      plotdata: {
        x: [123.12, 234.23], // sets the x-values in the spectrum plot
        y: [10.0, 100.0], // not sure where this is used...
        id: [0, 1], // used to link mass errors bubbles to peaks in the spectrum plot
        color: ["#0d75bc", "#a6a6a6"],
        label: ["b1", ""],
        labelCharge: [1, 0],
        neutralLosses: ["", ""],
        barwidth: [3, 1],
        theoMz: [0, 0], // not sure where this is used...
        percentBasePeak: [100, 50], // sets the y-values in the spectrum plot
        TIC: 110.0,
        massError: ["", 2.5], // sets the y-values in the mass errors plot
        massErrorX: [123.12, 234.23], // sets the x-values in the mass errors plot
        intensityError: [5, 4], // determines bubble size in the mass errors plot
        intensityErrorIdsTop: [0, 1], // refers to the id field of plotdata to know which peak belongs to the mass error bubble
        intensityErrorIdsBottom: [0, 1], // refers to the id field of mirrorplotdata
      },
      peptide: {
        sequence: "TESTPEPTIDE",
        precursorMz: 123.12,
        precursorCharge: 2,
        mods: [
          {
            site: -1,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 0,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 1,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 2,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 3,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 4,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 5,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 6,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 7,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 8,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 9,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 10,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 11,
            deltaElement: null,
            deltaMass: 0,
          },
        ],
        origin: "Experimental",
      },
      mirrorplotdata: {
        x: [135.13, 234.25],
        y: [100.0, 10.0],
        id: [0, 1],
        color: ["#a6a6a6", "#a6a6a6"],
        label: ["", ""],
        labelCharge: [0, 0],
        neutralLosses: ["", ""],
        barwidth: [1, 1],
        theoMz: [0, 0],
        percentBasePeak: [50, 100],
        TIC: 110.0,
      },
      peptideBottom: {
        sequence: "TESTPEPTIDE",
        precursorMz: 123.12,
        precursorCharge: 2,
        mods: [
          {
            site: -1,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 0,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 1,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 2,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 3,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 4,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 5,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 6,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 7,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 8,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 9,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 10,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 11,
            deltaElement: null,
            deltaMass: 0,
          },
        ],
        origin: "Origin",
      },
      settings: {
        toleranceThreshold: 40,
        toleranceType: "ppm",
        ionizationMode: "+",
      },
      score: {
        sa: 0.5, // spectral angle
        corr: 0.6, // pearson correlation
      },
      scoreTop: {
        sa: 0.2,
        corr: 0.3,
      },
      scoreBottom: {
        sa: 0.4,
        corr: 0.5,
      }
    }
}
