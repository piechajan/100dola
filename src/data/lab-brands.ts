// Materiály, se kterými Lab pracuje.
// PLACEHOLDER — Jan doplní reálné brandy, které opravdu používá.
// Hierarchie: nejvýše ty, se kterými má Lab nejvíc zkušeností.

export interface LabBrand {
  category: "wax" | "wax_coating" | "ppf" | "ceramic" | "bearings" | "cleanup";
  categoryLabel: string;
  brands: { name: string; note?: string }[];
}

export const LAB_BRANDS: LabBrand[] = [
  {
    category: "ppf",
    categoryLabel: "PPF folie",
    brands: [
      { name: "Syncros", note: "Bike-specific PPF — přesné výřezy na rámy" },
      { name: "3M Scotchgard Pro" },
    ],
  },
  {
    category: "ceramic",
    categoryLabel: "Keramické coatingy",
    brands: [
      { name: "Gtechniq C1+", note: "Hydrofóbní, UV ochrana" },
      { name: "CarPro CQuartz UK 3.0" },
      { name: "Crankalicious Frame Pro", note: "Bike-specific" },
    ],
  },
  {
    category: "bearings",
    categoryLabel: "Keramická ložiska",
    brands: [
      { name: "CeramicSpeed", note: "Náboje, středy, pedály — referenční značka" },
      { name: "Kogel Bearings" },
      { name: "CEMA keramická ložiska" },
    ],
  },
  {
    category: "wax",
    categoryLabel: "Vosky na řetěz",
    brands: [
      { name: "Silca SuperSecret", note: "Drip wax, čistý drivetrain" },
      { name: "Molten Speed Wax", note: "Hot wax aplikace" },
      { name: "Squirt Lube" },
    ],
  },
  {
    category: "wax_coating",
    categoryLabel: "Wax coating",
    brands: [
      { name: "FUSSO Coat", note: "Japonský fluoro coating na lak — hydrofóbní bariéra až 12 měsíců" },
    ],
  },
  {
    category: "cleanup",
    categoryLabel: "Cleanup chemie",
    brands: [
      { name: "Muc-Off", note: "Drivetrain cleaner + bike wash" },
    ],
  },
];
