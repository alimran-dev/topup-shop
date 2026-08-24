// Shared combo catalog for auto-topup forms (AddDynamicOption + OfferForm).
// Source of truth: was inline in AddDynamicOption.jsx — extracted so dynamic
// options and special offers build combos with the SAME unit identity
// (uc / package / label), which is what the auto server expects.
// Row fields: name (display), original (server-side name), value (unipin
// diamonds), uc (unipin), package (my/indo/sg/like), day (like), quantity.
const comboConfigs = {
  unipin: [
    { name: "25 💎", original: "25 Diamond", value: 25, uc: 20, quantity: 0 },
    { name: "50 💎", original: "50 Diamond", value: 50, uc: 36, quantity: 0 },
    { name: "115 💎", original: "115 Diamond", value: 115, uc: 80, quantity: 0 },
    { name: "240 💎", original: "240 Diamond", value: 240, uc: 160, quantity: 0 },
    { name: "610 💎", original: "610 Diamond", value: 610, uc: 405, quantity: 0 },
    { name: "1240 💎", original: "1240 Diamond", value: 1240, uc: 810, quantity: 0 },
    { name: "2530 💎", original: "2530 Diamond", value: 2530, uc: 1625, quantity: 0 },
    { name: "Weekly", original: "Weekly Membership", value: 0, uc: 161, quantity: 0 },
    {
      name: "Monthly",
      original: "Monthly Membership",
      value: 0, uc: 800,
      quantity: 0,
    },
  ],
  my: [
    {
      name: "LU Pass - 6",
      original: "Level Up Package - Level 6",
      package: "108588",
      quantity: 0,
    },
    {
      name: "LU Pass - 10",
      original: "Level Up Package - Level 10",
      package: "108589",
      quantity: 0,
    },
    {
      name: "LU Pass - 15",
      original: "Level Up Package - Level 15",
      package: "108590",
      quantity: 0,
    },
    {
      name: "LU Pass - 20",
      original: "Level Up Package - Level 20",
      package: "108591",
      quantity: 0,
    },
    {
      name: "LU Pass - 25",
      original: "Level Up Package - Level 25",
      package: "108592",
      quantity: 0,
    },
    {
      name: "LU Pass - 30",
      original: "Level Up Package - Level 30",
      package: "108593",
      quantity: 0,
    },
    { name: "Evo 3D", original: "Evo Access 3D", package: "3D", quantity: 0 },
    { name: "Evo 7D", original: "Evo Access 7D", package: "7D", quantity: 0 },
    { name: "Evo 30D", original: "Evo Access 30D", package: "30D", quantity: 0 },
    { name: "Weekly", original: "Weekly Lite", package: "LITE", quantity: 0 },
    { name: "Less is More", original: "Less is More", package: "lessismore", quantity: 0 },
  ],
  indo: [
    { name: "5 💎", original: "5", package: "5", quantity: 0 },
    { name: "50 💎", original: "50", package: "50", quantity: 0 },
    { name: "70 💎", original: "70", package: "70", quantity: 0 },
    { name: "140 💎", original: "140", package: "140", quantity: 0 },
    { name: "355 💎", original: "355", package: "355", quantity: 0 },
    { name: "720 💎", original: "720", package: "720", quantity: 0 },
    { name: "7290 💎", original: "7.290", package: "7290", quantity: 0 },
    { name: "36500 💎", original: "36.500", package: "36500", quantity: 0 },
    { name: "73100 💎", original: "73.100", package: "73100", quantity: 0 },
    { name: "BP Card", original: "BP Card", package: "BP", quantity: 0 },
    { name: "Monthly", original: "Member Bulanan", package: "monthly", quantity: 0 },
    { name: "Weekly", original: "Member Mingguan", package: "weekly", quantity: 0 },
    { name: "LU Pass - 6", original: "Level Up Pass - Level 6", package: "lvl6", quantity: 0 },
    {
      name: "LU Pass - 10",
      original: "Level Up Pass - Level 10",
      package: "lvl10",
      quantity: 0,
    },
    {
      name: "LU Pass - 15",
      original: "Level Up Pass - Level 15",
      package: "lvl15",
      quantity: 0,
    },
    {
      name: "LU Pass - 20",
      original: "Level Up Pass - Level 20",
      package: "lvl20",
      quantity: 0,
    },
    {
      name: "LU Pass - 25",
      original: "Level Up Pass - Level 25",
      package: "lvl25",
      quantity: 0,
    },
    {
      name: "LU Pass - 30",
      original: "Level Up Pass - Level 30",
      package: "lvl30",
      quantity: 0,
    },
  ],
  sg: [
    { name: "Weekly Lite", package: "LITE", quantity: 0 }
  ],
  like: [
    {name: "100 Like", package: "100", day: 0},
    {name: "200 Like", package: "200", day: 0}
  ]
};

// Deep-copy one server's rows. ComboModalRow mutates item objects in place
// (prevCombo[idx].quantity += …), so component state must NEVER hold
// references to the shared catalog objects — otherwise quantity changes leak
// between pages and into every future offer. Always take rows via this.
const comboRows = (server) =>
  (comboConfigs[server] || comboConfigs.unipin).map((item) => ({ ...item }));

export default comboConfigs;
export { comboRows };
