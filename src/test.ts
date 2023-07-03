const table1 = `
Country     Children    Adult          Pensioner
Germany     100         300            200
France      200         100            400
UK          100         100            200
Italy       400         200            100
`;

// const table1 = `
// Year    Country     Children    Adult          Pensioner
// 1995    Germany     100         300            200
// 1996    Germany     100         300            200
// 1997    Germany     100         300            200
//         France      200         100            400
//         UK          100         100            200
//         Italy       400         200            100
// `;

/*
  |            #           #
  |  #         #           #
  |  # #   #   #       #   # #
  |# # #   # # #   # # #   # # #
--+-----------------------------
  |C A P   C A P   C A P   C A P
    Ger     Fr       UK     It
*/
const json1 = [
  { country: "Germany", children: 100, adult: 300, pensiner: 200 },
  { country: "France", children: 200, adult: 100, pensiner: 400 },
  { country: "UK", children: 100, adult: 100, pensiner: 200 },
  { country: "Italy", children: 400, adult: 200, pensiner: 100 },
];

// Only children
const table2 = `
Germany     France        UK     Italy
100         200           100    400
`;
const json2 = [
  { country: "Germany", children: 100 },
  { country: "France", children: 200 },
  { country: "UK", children: 100 },
  { country: "Italy", children: 400 },
];
/*
  |                          #
  |                          #
  |           #              #
  |   #       #       #      #
--+---------------------------------
  |  Ger     Fr       UK     It
*/

const table3 = `
Data            Germany     France      UK          Italy
Children        100         200         100         400
Adults          300         100         100         200
Pensioners      200         400         200         100
`;
