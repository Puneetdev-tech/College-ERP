import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rawCSV = `S.No,Item Description,DOP,Bill Number,Quantity,Unit Rate,Amount,Received Qty,Opening Stock,Issued,Balance,Dealer / Supplier,Remarks
1,A4 Size Paper Rim,2026-02-12,,100,221.99,22199,100,100,20,80,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
2,A4 Size Paper Rim,2026-06-13,,20,224,4480,20,,0,,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
3,Add Gel Pen,2026-02-12,,30,45.5,1365,30,30,1,29,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
4,Add Gel Pen,2026-06-13,,50,6.018,300.9,50,,0,,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
5,Add Gel Refill,2026-02-12,,20,23,460,20,20,0,20,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
6,Cell AAA,2026-02-12,,50,16.8,840,50,50,0,50,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
7,Cell AA,2026-02-12,,1000,16.8,840,50,50,0,50,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
8,Envelope Small Brown,2026-02-12,,50,1.003,1003,1000,1000,200,800,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
9,File Flag,2026-02-12,,20,11.0684,553.42,50,50,0,50,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
10,Highlighter,2026-02-12,,20,15.5996,311.992,20,20,1,19,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
11,Liquid Gum,2026-02-12,,20,29.9956,599.912,20,20,0,20,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,Issue to main office
12,Liquid Gum,2026-06-13,,10,11.2,112,10,,0,,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
13,Notice Board Pin,2026-02-12,,20,16.8032,336.064,20,20,1,19,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
14,Register 100 Pages,2026-02-12,,30,84.9954,2549.862,30,30,1,29,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
15,Register 200 Pages,2026-02-12,,10,139.9952,1399.952,10,10,0,10,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
16,Staff Attendance Register,2026-02-12,,14,78.7178,1102.049,14,14,7,7,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,Issueed to Mrs Alka Vidhyarthi
17,Student Attendance Register,2026-02-12,,,,0,,,,0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
18,Use And Throw Pen,2026-02-12,,200,3.1,620,200,200,23,177,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
19,White Board Marker,2026-02-12,,20,18,360,20,20,0,20,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
20,Whitener Pen,2026-02-12,,20,18,360,20,20,0,20,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
21,File Cover J-280,2026-02-12,,200,9.2,1840,200,200,0,200,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,
22,Pencil Wooden Make - Natraj,2026-06-13,,,56,560,10,10,,,m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior,
29,CL REGISTER,2023-12-08,,,1100,5500,5,5,,5,M/S VANYA ENTERPRISES A-2 INDRAMANI NAGAR GOLE KA MANDIR GWALIOR,
30,DIARY,2024-06-11,,,,,,,,,,
31,WHITE ENVELOPE 9X4,2023-03-21,,,,1200,500,500,,500,M/S BHAGWATI STATIONARY LOHIYA BAZAR CORNER GWALIOR,
32,PEN UNI BALL,2022-02-10,,,,400,5,5,,,,
33,All pin box,2024-07-04,,,13,390,,,0,,M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp,
34,Thumpin big size,2023-09-21,,,25,500,,,0,,m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior,
35,CD ( make moserbear),2023-05-01,,,8.58,17.16,,,2,55,,
36,CHALK DUSTLESS,2024-07-04,,,20,200,,,0,153,M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp,
37,Register 160 pages ( no. 4),2020-07-08,,,25,250,,,10,110,M/S BHAGWATI STATIONARY LOHIYA BAZAR CORNER GWALIOR,
38,Register 240 pages (6 no.),2024-07-04,,100,68,6800,100,,0,178,M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp,
39,Register 320 pages (8 no ),2024-02-13,,50,85,4250,50,,0,50,m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior,
40,Register 400 pages (10 no ),2020-06-29,29/24-06-2020,2,80,160,2,,0,2,m/s khati department and stationary store TCP tekanpur gwalior mp,
41,Fevistick 5gm,2023-05-01,384/03-10-2020,2,33.9,67.8,2,,0,12,M/s vinay enterprises infront kanya vidhyala jiwaji ganj lashkar gwalior mp,
42,Poker / suja,2026-06-13,,4,47.2,188.8,4,,0,66,m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior,
43,Scissor midium size,2024-07-04,,30,45,1350,30,,0,32,M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp,
44,scale steel/plastic,2024-07-04,,30,12,360,30,,0,113,M/S super stationary mart shop no. F-5 first floor old high court road gwalior mp,
45,Markin cloth,2023-05-01,,,35,2765,,,,,,
46,Index box file,2024-07-04,,,80,4000,,,0,,M/S super stationary mart shop no. F-5 first floor old high court road gwalior mp,
47,White board marker ink blue 15 ml,2024-07-04,,50,19,950,50,,0,157,M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior,
48,White board marker ink black 15 ml,2024-07-04,,,19,950,50,,0,,M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior,
49,marker pen blue,2024-07-04,,100,20,2000,100,,0,287,M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior,
50,marker pen black,2023-07-04,,100,20,2000,100,,0,463,M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior,
51,Brown tape 2 inch,2024-07-04,,100,32,3200,100,,0,146,M/S Prasiddhi enterprises E-16 Jgarti Nagar lashkar gwalior,
52,ADD gel pen,2026-06-13,,12,70.8,849.6,12,,0,116,M/s vijay brother  gwalior,
53,ADD gel refill ( red),2020-02-28,,10,24,240,10,,0,35,M/S gk marketing old high court road lashkar gwalior mp,
54,Dusting cloths,2023-09-21,,20,48,960,,,0,20,M/S vijay brothers opposite UCO bank old high cout road lashkar gwalior,
55,Use and through pen,2024-07-04,,400,3,1200,400,,0,1308,M/S super stationary mart shop no. F-5 first floor old high court road gwalior mp,
56,file sticky pad,2021-06-30,,,25,750,30,,0,76,M/S bhagwati stationary lohiya bazar corner lashkar gwalior mp,
57,Attendance register,2024-10-18,,200,110,22000,200,,0,566,M/S RAM ENTERPRISES BAIRAGARH TCP TEKANPUR,
58,colour glossy id card for tata buses,2023-03-15,,,4,568,142,,0,142,Yadav electrostate 130 mayur market thatipur gwalior mp,
59,Brown file,2017-06-23,,700,9.8,6860,700,,0,80,m/s Vinay enterprises gwalior,
60,Brown file cover,2025-03-13,,500,9,4500,500,,0,2226,M/S bharat enterprises lohiya bazar corner near uttpul old high court road gwalior,
61,A4 size contury paper rim,2024-07-04,,,220,44000,200,,0,,M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp,
63,File Tag ( green / white),2020-10-08,,,72.03,72.03,,,0,,M/S Vinay Enterprises in front of kanya vidhyala jiwaji ganj lashkar gwalior mp,
64,DVD black R/W,2020-06-24,,5,20,100,5,,0,10,M/S Navin store gwalior,
65,DVD,2021-07-08,,,15,30,,,2,51,M/S bhagwati stationary lohiya bazar corner lashkar gwalior mp,
67,Brown graphs small size,2024-07-04,,,80,1600,2000,,0,,M/s super stationary mart shop no. F 5 first floor royal plaza old high court  road gwalior,
68,Vechicle Log Book Register,2021-09-15,,10,400,4000,10,,0,8,M/S Santosh traders Bus stand Tekanpur gwalior mp,
70,Sketch pen,2026-06-13,,2,29.5,59,,,0,,M/S vijay brothers opp UCO Bank old high court  lashkar gwalior,
71,PASSY PAD,2024-07-04,,50,16,800,,,0,600,M/s super stationary mart shop no. F 5 first floor royal plaza old high court  road gwalior,
72,Register 3 no jumbo register,2023-09-21,,,150,3000,,,0,,,
73,stipler machine big size,2024-07-04,,50,135,6750,50,,0,,M/S prasiddhi enterprises E-16 jagriti nagar lashkar gwalior mp,
74,Rubber packet/Eraser (DUST free),2022-06-30,,30,3,90,30,,0,122,M/S bhagwati stationary lohiya bazar corner lashkar gwalior mp,
75,Eraser / Dustless,2018-06-24,,10,2.98,29.8,10,,0,,,
76,Stepler machine small size (no. 10),2026-06-13,,4,59,236,4,,0,,M/S Vijay brothers gwalior,
77,U clip,2022-01-25,,,15,30,,,,,Received from admission cell RJIT vide letter no. nil duted,
78,Stapler pin no.10 ( small size),2022-01-25,,,6,444,,,,,Received from admission cell RJIT vide letter no. nil duted,
79,Fees deposited Register,2023-02-13,,,310,3100,10,,0,17,Hardik enterprises mahaveer colony dabra dist. Gwalior mp,
80,Letter head pad ( chief Administratory),2022-07-13,,,395,3950,,,,,M/S Rishika enterprises,
81,pen cello nova red /blue/,2021-07-08,,,4.25,34,,,8,22,M/s vinay enterprises infront kanya vidhyala jiwaji ganj lashkar gwalior mp,
82,Gum sheet paper A4 size,2022-01-25,,,,,,,0,,Received from admission cell vide letter no. nil and dated 19/01/22,
83,Red pen cello nova,2021-07-08,,,4.25,38.25,,,9,160,,
84,Calculator ( model no. 555GT) MAKE ORPAT,2020-02-28,,,400,4000,10,,0,5,M/S GK marketing old high court road gwalior mp,
86,Appreciation card A4 size,2022-06-27,,,11.2,5600,500,,0,1500,M/S rishik enterprises budh nagar kamoo gwaluior,
87,Marker pen blue,2024-07-04,,,20,2000,100,,0,335,M/S prasiddhi enterprisers E-16 jagriti nagar gwalior,
88,Marker pen black,2023-07-04,,,20,2000,100,,0,463,M/S prasiddhi enterprisers E-16 jagriti nagar gwalior,
89,File cover jambudeep,2019-10-31,,,8.5,51,6,,0,6,m/s khati department and stationary store TCP tekanpur gwalior mp,
90,Thumb pin,2019-10-31,,,12,24,,,0,,m/s khati department and stationary store TCP tekanpur gwalior mp,
92,Paper cutter big size,2024-07-04,,,30,1500,,,0,51,M/s super stationary market old high court road gwalior,
93,Numbring ink,2019-10-31,,,30,30,,,0,,M/s lhati department stationary store tcp tekanpur gwalior mp,
94,Transfering tape cello,2024-07-04,,,18,1800,100,,0,297,M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp,
95,Glue sheet barcode,2019-10-31,,,230,1380,,,0,,m/s khati department and stationary store TCP tekanpur gwalior mp,
96,Note book,2020-06-29,,,5,2500,,,0,427,M/S bhagwati stationary lohiya bazar corner lashkar gwalior,
97,Gum tube ( sticky tube),2020-01-30,,,4.35,8.7,2,,0,2,M/S CPC BSF canteen academy tekanpur gwalior mp,
98,Transfer certificate,2023-07-07,,,495.6,8920,18,,0,40,M/S vanya enterprises A-2 indramani nagar goleka mandir gwalior,
99,CD/DVD marker  permanent marker,2020-02-24,,,10,200,,,0,16,m/S bharat enterprises behind old high court gwalior mp,
100,Stock register,2025-03-15,,,88.5,885,10,,,,M/S karuna enterprises near rama market bazar lashkar gwalior mp,
101,Computer dusting cloth,2020-02-24,,,10,1000,100,,0,20,m/s khati department and stationary store TCP tekanpur gwalior mp,
102,Marker white board red,2024-07-04,,,20,1000,50,,0,96,M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp,
103,white tape 2 inch,2024-07-04,,100,35,3500,100,,0,159,M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp,
104,Marker ink red (white board ),2020-02-24,,,25,250,10,,0,8,m/S bharat enterprises behind old high court gwalior mp,
105,Ball pen use and through red,2020-02-20,,,2.4,240,100,,0,58,M/S GK marketing old high court road gwalior mp,
106,Add gel pen green luxar,2020-02-29,,,10,10,1,,0,8,M/S khati department and stationary store TCP Tekanpur gwalior mp,
107,add gel pen red luxar,2020-02-28,,,45,450,10,,0,6,M/S GK marketing old high court road gwalior mp,
108,Sharpner,2022-06-30,,,3,90,30,,0,30,M/S bhagwati stationary lohiya bazar corner lashkar gwalior,
109,Add gel refill (green),2020-02-28,,,24,240,10,,0,8,M/S GK marketing old high court road gwalior mp,
110,Paper cutter,2024-07-04,,,30,1500,,,0,85,M/S super stationary mart old high court road gwalior,
111,Stamp pad small size,2020-10-08,,,25.42,25.42,1,,0,19,M/S vinay enterprises   in front of kanya vidhyala jiwaji ganj lashkar gwalior mp,
112,"Steel scale 40""",2020-02-28,,,250,500,2,,0,2,M/S GK marketing old high court road gwalior mp,
113,ADM approval / expenditure register,2023-07-07,,,702.1,5616.8,8,,0,13,M/S vanya enterprises A-2 indramani nagar gole ka mandir gwalior,
114,Vehicle log book rrecord,2024-10-18,,,650,6500,10,,0,14,M/S ram enterprises bairagarh TCP Tekanpur,
115,Pen stand big,2023-06-28,,,95,95,,,1,1,M/S khati department and stationary store TCP Tekanpur gwalior mp,
116,Carbon paper a4 size,2020-06-29,,,1.7,8.5,,,5,95,M/S khati department and stationary store TCP Tekanpur gwalior mp,
118,File folder dak,2026-06-13,,,424.8,5097.6,12,,0,22,m/s Vijay brothers opp. UCO bank old high court road gwalior lashkar gwalior,
119,A4 size paper colour,2021-07-22,,,320,320,,,0,,M/S khati stationary TCP tekanpur gwalior mp,
120,Flap A4 (Envelope plastic),2021-10-27,,,3,1350,450,,0,450,M/S bhagwati stationary lohiya bazar corner lashkar gwalior,
121,Permanent marker black big size,2024-07-04,,,15,750,,,0,80,M/S super stationary mart shop no.5 first floor royal plaza old high court road gwalior,
122,Attendance register for staff,2023-12-18,,,140.6,1699,12,,0,24,M/s vijay brothers old high court road gwalior,
123,Book Narendra modi,2022-04-22,,,9000,9000,1,,0,1,M/S Multinational publication and distribution house DS 491/492 new rajender nagar new delhi,
124,Cash book,2024-10-18,,,650,6500,10,,0,25,M/s ram enterprises bairagarh TCP tekanpur gwalior,
125,Add  gel refill blue,2024-07-04,,50,22.5,1125,50,,0,117,M/S super stationary mart shop no.5 first floor royal plaza old high court road gwalior`;

// Function to parse CSV line preserving quoted values
function parseCSVLine(text) {
  const result = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = "";
    } else {
      cell += c;
    }
  }
  result.push(cell.trim());
  return result;
}

function parseNum(val) {
  if (!val) return null;
  const match = val.replace(/,/g, "").match(/[-+]?\d*\.?\d+/);
  return match ? parseFloat(match[0]) : null;
}

function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const lines = rawCSV.split("\n").map(l => l.trim()).filter(Boolean);
  // Remove "now do with stationary legacy" if attached to last line
  if (lines[lines.length - 1].includes("now do with stationary legacy")) {
    lines[lines.length - 1] = lines[lines.length - 1].replace("now do with stationary legacy", "").trim();
  }

  const header = parseCSVLine(lines[0]);
  console.log("CSV Header:", header);

  const dataRows = lines.slice(1);
  console.log(`Parsing ${dataRows.length} CSV data lines...`);

  const records = [];
  for (const line of dataRows) {
    if (!line) continue;
    const cols = parseCSVLine(line);
    if (cols.length < 2) continue;

    const s_no = parseInt(cols[0], 10) || null;
    const item_name = cols[1] || null;
    const dop = parseDate(cols[2]);
    const bill_number = cols[3] || null;
    const quantity = parseNum(cols[4]);
    const unit_rate = parseNum(cols[5]);
    const amount = parseNum(cols[6]);
    const received_quantity = parseNum(cols[7]);
    const opening_stock = parseNum(cols[8]);
    const issued = parseNum(cols[9]);
    const balance = parseNum(cols[10]);
    const dealer_name = cols[11] || null;
    const remarks = cols[12] || null;

    records.push({
      s_no,
      item_name,
      dop,
      bill_number,
      quantity,
      unit_rate,
      amount,
      received_quantity,
      opening_stock,
      issued,
      balance,
      dealer_name,
      remarks
    });
  }

  console.log(`Parsed ${records.length} valid stationery records.`);

  // Clear existing inventory_items
  const deleted = await prisma.inventory_items.deleteMany({});
  console.log(`Deleted ${deleted.count} old inventory_items rows.`);

  // Insert new inventory_items
  const created = await prisma.inventory_items.createMany({
    data: records
  });

  console.log(`Successfully inserted ${created.count} new stationery inventory_items records!`);
}

main()
  .catch((e) => {
    console.error("Error updating stationery data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
