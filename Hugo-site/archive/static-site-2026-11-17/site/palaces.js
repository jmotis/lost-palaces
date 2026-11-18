// The palaces shown on the Lost Palaces Project site.
// Dates are the span each 3D model covers (from the model's own title).
// lat/lon are approximate site locations for the map pins: check before publishing.
// `model` is the model page, relative to the site root. null = not in this folder yet.
window.LPP = {
  palaces: [
    { id: 'baynards', name: 'Baynard’s Castle', title: 'Baynard’s Castle', start: 1428, end: 1670,
      place: 'City of London, on the Thames', lat: 51.5112, lon: -0.0995, model: 'Baynards Castle/baynardscastle.html' },
    { id: 'richmond', name: 'Richmond', title: 'Richmond Palace', start: 1445, end: 1703,
      place: 'Richmond, Surrey', lat: 51.4606, lon: -0.3087, model: 'Richmond/index.html' },
    { id: 'more', name: 'The More', title: 'The More', start: 1450, end: 1700,
      place: 'Rickmansworth, Hertfordshire', lat: 51.6400, lon: -0.4450, model: 'The More/index.html' },
    { id: 'greenwich', name: 'Greenwich', title: 'Greenwich Palace', start: 1500, end: 1700,
      place: 'Greenwich, on the Thames', lat: 51.4827, lon: -0.0077, model: 'Greenwich/index.html' },
    { id: 'bridewell', name: 'Bridewell', title: 'Bridewell Palace', start: 1510, end: 1700,
      place: 'City of London, by the Fleet', lat: 51.5131, lon: -0.1050, model: 'Bridewell/bridewell.html' },
    { id: 'whitehall', name: 'Whitehall', title: 'Whitehall Palace', start: 1514, end: 1698,
      place: 'Westminster, on the Thames', lat: 51.5045, lon: -0.1265, model: null },
    { id: 'beaulieu', name: 'Beaulieu', title: 'Beaulieu', start: 1516, end: 1700,
      place: 'Boreham, Essex', lat: 51.7590, lon: 0.5380, model: 'Beaulieu/beaulieu.html' },
    { id: 'nonsuch', name: 'Nonsuch', title: 'Nonsuch Palace', start: 1537, end: 1690,
      place: 'Cheam, Surrey', lat: 51.3600, lon: -0.2330, model: 'Nonsuch/index.html' },
    { id: 'oatlands', name: 'Oatlands', title: 'Oatlands Palace', start: 1537, end: 1650,
      place: 'Weybridge, Surrey', lat: 51.3720, lon: -0.4460, model: 'Oatlands/oatlands.html' }
  ],
  planned: [
    { id: 'theobalds', name: 'Theobalds', place: 'Cheshunt, Hertfordshire', lat: 51.7050, lon: -0.0450 },
    { id: 'woking', name: 'Woking', place: 'Old Woking, Surrey', lat: 51.3035, lon: -0.5395 },
    { id: 'tickenhill', name: 'Tickenhill', place: 'Bewdley, Worcestershire', lat: 52.3740, lon: -2.3230 },
    { id: 'linlithgow', name: 'Linlithgow', place: 'Linlithgow, West Lothian', lat: 55.9790, lon: -3.6010 },
    { id: 'fieldofgold', name: 'The Field of Cloth of Gold', place: 'Balinghem, near Calais', lat: 50.8600, lon: 1.9300 }
  ],
  // The map opens here.
  centre: { lat: 51.5045, lon: -0.1265 }
};

// Shared helpers.
window.LPP.sortName = (n) => n.replace(/^The /, '');
window.LPP.span = (p) => p.start + '–' + p.end;
window.LPP.pageFor = (p) => 'palace.html?id=' + encodeURIComponent(p.id);
window.LPP.modelUrl = (p) => p.model ? encodeURI(p.model) : null;
