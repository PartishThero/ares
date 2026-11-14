// Historical Curiosity RAD (Radiation Assessment Detector) measurements from NASA PDS

export const MSL_RAD_OBSERVATIONS = [
  {
    sol: 106,
    earthDate: '2012-11-22',
    location: 'Rocknest (Bradbury Landing Plain)',
    coordinates: [137.4410, -4.5910],
    elevation: -4512,
    doseRateUgyDay: 210,
    doseEquivalentUsvDay: 640,
    solarActivity: 'Quiet Sun (Solar Minimum)',
    atmosphericPressurePa: 840,
    primarySource: 'Galactic Cosmic Rays (GCR heavy ions & neutrons)'
  },
  {
    sol: 753,
    earthDate: '2014-09-19',
    location: 'Pahrump Hills (Base of Mount Sharp)',
    coordinates: [137.3712, -4.7290],
    elevation: -4420,
    doseRateUgyDay: 205,
    doseEquivalentUsvDay: 625,
    solarActivity: 'Moderate',
    atmosphericPressurePa: 815,
    primarySource: 'GCR attenuated by seasonal CO2 atmospheric column'
  },
  {
    sol: 1805,
    earthDate: '2017-09-10',
    location: 'Vera Rubin Ridge (Lower Flank)',
    coordinates: [137.3620, -4.7410],
    elevation: -4010,
    doseRateUgyDay: 840,
    doseEquivalentUsvDay: 2450,
    solarActivity: 'Solar Particle Event (SPE Spike - NOAA AR2673)',
    atmosphericPressurePa: 780,
    primarySource: 'Solar Energetic Protons & secondary neutrons'
  },
  {
    sol: 2420,
    earthDate: '2019-05-28',
    location: 'Glen Torridon (Clay-bearing Unit)',
    coordinates: [137.3870, -4.7330],
    elevation: -4140,
    doseRateUgyDay: 215,
    doseEquivalentUsvDay: 655,
    solarActivity: 'Solar Minimum Background',
    atmosphericPressurePa: 805,
    primarySource: 'GCR isotropic flux'
  },
  {
    sol: 3450,
    earthDate: '2022-04-20',
    location: 'Sulfate-Bearing Transition Pass',
    coordinates: [137.3810, -4.8910],
    elevation: -3620,
    doseRateUgyDay: 220,
    doseEquivalentUsvDay: 670,
    solarActivity: 'Solar Cycle 25 Ascending',
    atmosphericPressurePa: 760,
    primarySource: 'GCR with decreased solar modulation'
  },
  {
    sol: 4180,
    earthDate: '2024-05-20',
    location: 'Gediz Vallis Channel Slope',
    coordinates: [137.3490, -4.8430],
    elevation: -3740,
    doseRateUgyDay: 480,
    doseEquivalentUsvDay: 1420,
    solarActivity: 'Solar Maximum High Activity (May 2024 Auroral Event)',
    atmosphericPressurePa: 745,
    primarySource: 'Combined GCR and Solar Proton stream'
  }
];

export const RAD_STANDARDS = {
  averageGcrRateUsvHour: 27.1,
  speWarningThresholdUsvHour: 80.0,
  earthSeaLevelDailyUsv: 8.2,
  commercialFlightTransatlanticUsv: 40.0,
  chestXrayUsv: 20.0,
  astronaut6MonthLimitMsv: 250
};

export function calculateEvaRadiationDose(durationHours, speActive = false) {
  const ratePerHour = speActive ? 95.0 : RAD_STANDARDS.averageGcrRateUsvHour;
  const totalDoseUsv = Math.round(durationHours * ratePerHour);
  const chestXrayEquiv = (totalDoseUsv / RAD_STANDARDS.chestXrayUsv).toFixed(1);
  const earthDaysEquiv = (totalDoseUsv / RAD_STANDARDS.earthSeaLevelDailyUsv).toFixed(1);

  return {
    ratePerHour,
    totalDoseUsv,
    totalDoseMsv: (totalDoseUsv / 1000).toFixed(3),
    chestXrayEquiv,
    earthDaysEquiv,
    status: speActive ? 'WARNING - ELEVATED SPE EVENT' : 'NOMINAL GCR BACKGROUND'
  };
}
