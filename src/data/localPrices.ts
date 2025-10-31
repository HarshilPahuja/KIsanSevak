export type PriceBand = {
  modal: number;
  min?: number;
  max?: number;
};

export type CommodityPrices = Record<string, PriceBand>;
export type LocalPriceMap = Record<string, CommodityPrices>;

// Approximate reference prices in ₹ per quintal.
// You can adjust these values as needed.
export const localPrices: LocalPriceMap = {
  India: {
    Rice: { modal: 2800, min: 2400, max: 3300 },
    Wheat: { modal: 2200, min: 1900, max: 2600 },
    Tomato: { modal: 1600, min: 800, max: 2600 },
    Potato: { modal: 1500, min: 1100, max: 2100 },
    Onion: { modal: 1700, min: 1200, max: 2400 },
    Maize: { modal: 1900, min: 1600, max: 2300 },
    Gram: { modal: 4500, min: 4000, max: 5200 },
    Soybean: { modal: 4600, min: 4200, max: 5200 },
    Groundnut: { modal: 5200, min: 4800, max: 5800 },
    Cotton: { modal: 6600, min: 6000, max: 7200 },
    Jowar: { modal: 2500, min: 2200, max: 3000 },
    Bajra: { modal: 2300, min: 2000, max: 2800 },
    'Green Gram': { modal: 7000, min: 6200, max: 8000 },
    'Black Gram': { modal: 7200, min: 6400, max: 8200 },
    Sugarcane: { modal: 350, min: 300, max: 380 },
  },
  Maharashtra: {
    Rice: { modal: 2750, min: 2300, max: 3200 },
    Wheat: { modal: 2250, min: 2000, max: 2600 },
    Tomato: { modal: 1500, min: 700, max: 2400 },
    Potato: { modal: 1600, min: 1200, max: 2200 },
    Onion: { modal: 1900, min: 1300, max: 2600 },
    Maize: { modal: 1950, min: 1650, max: 2350 },
    Cotton: { modal: 6800, min: 6200, max: 7400 },
    Gram: { modal: 4400, min: 4000, max: 5100 },
    Soybean: { modal: 4700, min: 4300, max: 5300 },
    Groundnut: { modal: 5100, min: 4700, max: 5700 },
    Jowar: { modal: 2450, min: 2150, max: 2950 },
    Bajra: { modal: 2250, min: 1950, max: 2750 },
    Sugarcane: { modal: 320, min: 290, max: 360 },
  },
  Karnataka: {
    Rice: { modal: 2900, min: 2500, max: 3400 },
    Wheat: { modal: 2150, min: 1900, max: 2500 },
    Tomato: { modal: 1800, min: 900, max: 2800 },
    Potato: { modal: 1400, min: 1100, max: 2000 },
    Onion: { modal: 1800, min: 1300, max: 2500 },
    Maize: { modal: 2000, min: 1700, max: 2400 },
    Groundnut: { modal: 5300, min: 4900, max: 5900 },
    Cotton: { modal: 6700, min: 6100, max: 7300 },
    Jowar: { modal: 2550, min: 2250, max: 3050 },
    Bajra: { modal: 2350, min: 2050, max: 2850 },
  },
  Delhi: {
    Rice: { modal: 3000, min: 2600, max: 3500 },
    Wheat: { modal: 2350, min: 2100, max: 2700 },
    Tomato: { modal: 1700, min: 900, max: 2600 },
    Potato: { modal: 1550, min: 1200, max: 2100 },
    Onion: { modal: 1800, min: 1300, max: 2400 },
    Maize: { modal: 2000, min: 1700, max: 2400 },
  },
  'Tamil Nadu': {
    Rice: { modal: 2950, min: 2500, max: 3450 },
    Tomato: { modal: 1750, min: 900, max: 2700 },
    Onion: { modal: 1850, min: 1300, max: 2550 },
    Maize: { modal: 1950, min: 1650, max: 2350 },
    Groundnut: { modal: 5400, min: 5000, max: 6000 },
  },
  'Uttar Pradesh': {
    Rice: { modal: 2700, min: 2300, max: 3200 },
    Wheat: { modal: 2300, min: 2050, max: 2650 },
    Potato: { modal: 1450, min: 1100, max: 2050 },
    Onion: { modal: 1700, min: 1200, max: 2400 },
    Gram: { modal: 4400, min: 4000, max: 5100 },
    Sugarcane: { modal: 330, min: 300, max: 360 },
  },
  Telangana: {
    Rice: { modal: 2850, min: 2450, max: 3350 },
    Maize: { modal: 2050, min: 1750, max: 2450 },
    Cotton: { modal: 6700, min: 6100, max: 7300 },
    Groundnut: { modal: 5150, min: 4750, max: 5750 },
  },
  'West Bengal': {
    Rice: { modal: 2900, min: 2450, max: 3400 },
    Potato: { modal: 1500, min: 1150, max: 2100 },
    Onion: { modal: 1750, min: 1250, max: 2450 },
    Jowar: { modal: 2400, min: 2100, max: 2900 },
  },
  Gujarat: {
    Rice: { modal: 2750, min: 2350, max: 3250 },
    Wheat: { modal: 2250, min: 2000, max: 2600 },
    Onion: { modal: 1850, min: 1300, max: 2550 },
    Groundnut: { modal: 5500, min: 5100, max: 6000 },
    Cotton: { modal: 6900, min: 6300, max: 7500 },
    Bajra: { modal: 2350, min: 2050, max: 2850 },
  },
  Punjab: {
    Rice: { modal: 2850, min: 2450, max: 3350 },
    Wheat: { modal: 2400, min: 2150, max: 2750 },
    Maize: { modal: 2000, min: 1700, max: 2400 },
    Gram: { modal: 4550, min: 4100, max: 5250 },
  },
  Rajasthan: {
    Wheat: { modal: 2300, min: 2050, max: 2650 },
    Bajra: { modal: 2400, min: 2100, max: 2900 },
    Gram: { modal: 4500, min: 4050, max: 5200 },
    Onion: { modal: 1750, min: 1250, max: 2450 },
  },
  'Madhya Pradesh': {
    Wheat: { modal: 2350, min: 2100, max: 2700 },
    Soybean: { modal: 4700, min: 4300, max: 5300 },
    Gram: { modal: 4550, min: 4100, max: 5250 },
    Maize: { modal: 1950, min: 1650, max: 2350 },
  },
  'Andhra Pradesh': {
    Rice: { modal: 2900, min: 2500, max: 3400 },
    Maize: { modal: 2000, min: 1700, max: 2400 },
    Groundnut: { modal: 5400, min: 5000, max: 6000 },
    Tomato: { modal: 1700, min: 800, max: 2600 },
  },
  Kerala: {
    Rice: { modal: 3050, min: 2650, max: 3550 },
    Onion: { modal: 1950, min: 1400, max: 2650 },
    Tomato: { modal: 1750, min: 900, max: 2700 },
  },
  Bihar: {
    Rice: { modal: 2700, min: 2300, max: 3200 },
    Wheat: { modal: 2250, min: 2000, max: 2600 },
    Maize: { modal: 1900, min: 1600, max: 2300 },
    Potato: { modal: 1500, min: 1150, max: 2100 },
  },
  Odisha: {
    Rice: { modal: 2800, min: 2400, max: 3300 },
    Onion: { modal: 1750, min: 1250, max: 2450 },
    Tomato: { modal: 1650, min: 850, max: 2650 },
  },
};
