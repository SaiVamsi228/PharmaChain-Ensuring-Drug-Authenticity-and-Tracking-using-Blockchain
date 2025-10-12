export const manufacturingPlants = [
  "Bhiwandi Plant",
  "Chennai Factory",
  "Pune Hub",
  "Hyderabad Facility",
  "Patna Warehouse",
];

export const getRandomLocation = (locations) => {
  return locations[Math.floor(Math.random() * locations.length)];
};