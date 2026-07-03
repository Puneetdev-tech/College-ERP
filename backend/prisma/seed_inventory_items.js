import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const csvData = `S.No,Name_of_item,DOP,Bill_Number,Quantity,Unit_Rate,Amount,Received_Quantity,Opening_Stock,Issued,Balance,Dealer_Name,SLP,Remarks
1,A4 Size Paper Rim,2026-02-12,,100.0,221.99,22199.0,100.0,100.0,20.0,80.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,1.0,
3,Add Gel Pen,2026-02-12,,30.0,45.5,1365.0,30.0,30.0,1.0,29.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,3.0,
5,Add Gel Refill,2026-02-12,,20.0,23.0,460.0,20.0,20.0,0.0,20.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,5.0,
6,Cell AAA,2026-02-12,,50.0,16.8,840.0,50.0,50.0,0.0,50.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,6.0,
7,Cell AA,2026-02-12,,1000.0,16.8,840.0,50.0,50.0,0.0,50.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,7.0,
8,Envelope Small Brown,2026-02-12,,50.0,1.003,1003.0,1000.0,1000.0,200.0,800.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,8.0,
9,File Flag,2026-02-12,,20.0,11.0684,553.42,50.0,50.0,0.0,50.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,9.0,
10,Highlighter,2026-02-12,,20.0,15.5996,311.992,20.0,20.0,1.0,19.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,10.0,
11,Liquid Gum,2026-02-12,,20.0,29.9956,599.912,20.0,20.0,0.0,20.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,11.0,Issue to main office
13,Notice Board Pin,2026-02-12,,20.0,16.8032,336.064,20.0,20.0,1.0,19.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,13.0,
14,Register 100 Pages,2026-02-12,,30.0,84.9954,2549.862,30.0,30.0,1.0,29.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,14.0,
15,Register 200 Pages,2026-02-12,,10.0,139.9952,1399.952,10.0,10.0,0.0,10.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,15.0,
16,Staff Attendance Register,2026-02-12,,14.0,78.7178,1102.049,14.0,14.0,7.0,7.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,16.0,Issueed to Mrs Alka Vidhyarthi
17,Student Attendance Register,2026-02-12,,,,0.0,,,,0.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,17.0,
18,Use And Throw Pen,2026-02-12,,200.0,3.1,620.0,200.0,200.0,23.0,177.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,18.0,
19,White Board Marker,2026-02-12,,20.0,18.0,360.0,20.0,20.0,0.0,20.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,19.0,
20,Whitener Pen,2026-02-12,,20.0,18.0,360.0,20.0,20.0,0.0,20.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,20.0,
21,File Cover J-280,2026-02-12,,200.0,9.2,1840.0,200.0,200.0,0.0,200.0,Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior,21.0,
22,Pencil Wooden Make - Natraj,2026-06-13,,,56.0,560.0,10.0,10.0,,,m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior,,
23,Punching Machine Small,2023-05-01,,,,,,,,32.0,,,
24,Stamp pad big size,,,1.0,38.94,,,,,,"M/s Karuna Enterprises,near rama Market patankar bazar lashkar gwalior",,
25,Stapler pin big size,2017-11-01,,,,,,,,52.0,,,
26,White Fluid,2024-07-04,,,,,,,,88.0,,,
27,Duster Black board,2023-05-01,,,,,,,,174.0,,,
28,Duster white Board,2023-05-01,,,25.0,,,,,,,,
29,CL REGISTER,2023-12-08,,,1100.0,5500.0,5.0,5.0,,5.0,M/S VANYA ENTERPRISES A-2 INDRAMANI NAGAR GOLE KA MANDIR GWALIOR,,
30,DIARY,2024-06-11,,,,,,,,,,,
31,WHITE ENVELOPE 9X4,2023-03-21,,,,1200.0,500.0,500.0,,500.0,M/S BHAGWATI STATIONARY LOHIYA BAZAR CORNER GWALIOR,,
32,PEN UNI BALL,2022-02-10,,,,400.0,5.0,5.0,,,,,
33,All pin box,2024-07-04,,,13.0,390.0,,,0.0,,M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp,,
34,Thumpin big size,2023-09-21,,,25.0,500.0,,,0.0,,m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior,,
35,CD ( make moserbear),2023-05-01,,,8.58,17.16,,,2.0,55.0,,,
36,CHALK DUSTLESS,2024-07-04,,,20.0,200.0,,,0.0,153.0,M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp,,
37,Register 160 pages ( no. 4),2020-07-08,,,25.0,250.0,,,10.0,110.0,M/S BHAGWATI STATIONARY LOHIYA BAZAR CORNER GWALIOR,,
38,Register 240 pages (6 no.),2024-07-04,,100.0,68.0,6800.0,100.0,,0.0,178.0,M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp,,
39,Register 320 pages (8 no ),2024-02-13,,50.0,85.0,4250.0,50.0,,0.0,50.0,m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior,,
40,Register 400 pages (10 no ),2020-06-29,29/24-06-2020,2.0,80.0,160.0,2.0,,0.0,2.0,m/s khati department and stationary store TCP tekanpur gwalior mp,,
41,Fevistick 5gm,2023-05-01,384/03-10-2020,2.0,33.9,67.8,2.0,,0.0,12.0,M/s vinay enterprises infront kanya vidhyala jiwaji ganj lashkar gwalior mp,,
42,Poker / suja,2026-06-13,,4.0,47.2,188.8,4.0,,0.0,66.0,m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior,,
43,Scissor midium size,2024-07-04,,30.0,45.0,1350.0,30.0,,0.0,32.0,M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp,,
44,scale steel/plastic,2024-07-04,,30.0,12.0,360.0,30.0,,0.0,113.0,M/S super stationary mart shop no. F-5 first floor old high court road gwalior mp,,
45,Markin cloth,2023-05-01,,,35.0,2765.0,,,,,,,
46,Index box file,2024-07-04,,,80.0,4000.0,,,0.0,,M/S super stationary mart shop no. F-5 first floor old high court road gwalior mp,,
47,White board marker ink blue 15 ml,2024-07-04,,50.0,19.0,950.0,50.0,,0.0,157.0,M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior,,
48,White board marker ink black 15 ml,2024-07-04,,,19.0,950.0,50.0,,0.0,,M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior,,
49,marker pen blue,2024-07-04,,100.0,20.0,2000.0,100.0,,0.0,287.0,M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior,,
50,marker pen black,2023-07-04,,100.0,20.0,2000.0,100.0,,0.0,463.0,M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior,,
51,Brown tape 2 inch,2024-07-04,,100.0,32.0,3200.0,100.0,,0.0,146.0,M/S Prasiddhi enterprises E-16 Jgarti Nagar lashkar gwalior,,
52,ADD gel pen,2026-06-13,,12.0,70.8,849.6,12.0,,0.0,116.0,M/s vijay brother  gwalior,,
53,ADD gel refill ( red),2020-02-28,,10.0,24.0,240.0,10.0,,0.0,35.0,M/S gk marketing old high court road lashkar gwalior mp,,
54,Dusting cloths,2023-09-21,,20.0,48.0,960.0,,,0.0,20.0,M/S vijay brothers opposite UCO bank old high cout road lashkar gwalior,,
55,Use and through pen,2024-07-04,,400.0,3.0,1200.0,400.0,,0.0,1308.0,M/S super stationary mart shop no. F-5 first floor old high court road gwalior mp,,
56,file sticky pad,2021-06-30,,,25.0,750.0,30.0,,0.0,76.0,M/S bhagwati stationary lohiya bazar corner lashkar gwalior mp,,
57,Attendance register,2024-10-18,,200.0,110.0,22000.0,200.0,,0.0,566.0,M/S RAM ENTERPRISES BAIRAGARH TCP TEKANPUR,,
58,colour glossy id card for tata buses,2023-03-15,,,4.0,568.0,142.0,,0.0,142.0,Yadav electrostate 130 mayur market thatipur gwalior mp,,
59,Brown file,2017-06-23,,700.0,9.8,6860.0,700.0,,0.0,80.0,m/s Vinay enterprises gwalior,,
60,Brown file cover,2025-03-13,,500.0,9.0,4500.0,500.0,,0.0,2226.0,M/S bharat enterprises lohiya bazar corner near uttpul old high court road gwalior,,
61,A4 size contury paper rim,2024-07-04,,,220.0,44000.0,200.0,,0.0,,M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp,,
62,BLANK CD R/W,,,40.0,,,,,,,,,
63,File Tag ( green / white),2020-10-08,,,72.03,72.03,,,0.0,,M/S Vinay Enterprises in front of kanya vidhyala jiwaji ganj lashkar gwalior mp,,
64,DVD black R/W,2020-06-24,,5.0,20.0,100.0,5.0,,0.0,10.0,M/S Navin store gwalior,,
65,DVD,2021-07-08,,,15.0,30.0,,,2.0,51.0,M/S bhagwati stationary lohiya bazar corner lashkar gwalior mp,,
67,Brown graphs small size,2024-07-04,,,80.0,1600.0,2000.0,,0.0,,M/s super stationary mart shop no. F 5 first floor royal plaza old high court  road gwalior,,
68,Vechicle Log Book Register,2021-09-15,,10.0,400.0,4000.0,10.0,,0.0,8.0,M/S Santosh traders Bus stand Tekanpur gwalior mp,,
69,79,,80,81.0,82.0,83.0,84.0,85.0,86.0,87.0,88,89.0,90
70,Sketch pen,2026-06-13,,2.0,29.5,59.0,,,0.0,,M/S vijay brothers opp UCO Bank old high court  lashkar gwalior,,
71,PASSY PAD,2024-07-04,,50.0,16.0,800.0,,,0.0,600.0,M/s super stationary mart shop no. F 5 first floor royal plaza old high court  road gwalior,,
72,Register 3 no jumbo register,2023-09-21,,,150.0,3000.0,,,0.0,,,,
73,stipler machine big size,2024-07-04,,50.0,135.0,6750.0,50.0,,0.0,,M/S prasiddhi enterprises E-16 jagriti nagar lashkar gwalior mp,,
74,Rubber packet/Eraser (DUST free),2022-06-30,,30.0,3.0,90.0,30.0,,0.0,122.0,M/S bhagwati stationary lohiya bazar corner lashkar gwalior mp,,
75,Eraser / Dustless,2018-06-24,,10.0,2.98,29.8,10.0,,0.0,,,,
76,Stepler machine small size (no. 10),2026-06-13,,4.0,59.0,236.0,4.0,,0.0,,M/S Vijay brothers gwalior,,
77,U clip,2022-01-25,,,15.0,30.0,,,,,Received from admission cell RJIT vide letter no. nil duted,,
78,Stapler pin no.10 ( small size),2022-01-25,,,6.0,444.0,,,,,Received from admission cell RJIT vide letter no. nil duted,,
79,Fees deposited Register,2023-02-13,,,310.0,3100.0,10.0,,0.0,17.0,Hardik enterprises mahaveer colony dabra dist. Gwalior mp,,
80,Letter head pad ( chief Administratory),2022-07-13,,,395.0,3950.0,,,,,M/S Rishika enterprises,,
81,pen cello nova red /blue/,2021-07-08,,,4.25,34.0,,,8.0,22.0,M/s vinay enterprises infront kanya vidhyala jiwaji ganj lashkar gwalior mp,,
82,Gum sheet paper A4 size,2022-01-25,,,,,,,0.0,,Received from admission cell vide letter no. nil and dated 19/01/22,,
83,Red pen cello nova,2021-07-08,,,4.25,38.25,,,9.0,160.0,,,
84,Calculator ( model no. 555GT) MAKE ORPAT,2020-02-28,,,400.0,4000.0,10.0,,0.0,5.0,M/S GK marketing old high court road gwalior mp,,
85,Rubber Stamp Rjit,2018-10-15,,,,,,,,,,,
86,Appreciation card A4 size,2022-06-27,,,11.2,5600.0,500.0,,0.0,1500.0,M/S rishik enterprises budh nagar kamoo gwaluior,,
87,Marker pen blue,2024-07-04,,,20.0,2000.0,100.0,,0.0,335.0,M/S prasiddhi enterprisers E-16 jagriti nagar gwalior,,
88,Marker pen black,2023-07-04,,,20.0,2000.0,100.0,,0.0,463.0,M/S prasiddhi enterprisers E-16 jagriti nagar gwalior,,
89,File cover jambudeep,2019-10-31,,,8.5,51.0,6.0,,0.0,6.0,m/s khati department and stationary store TCP tekanpur gwalior mp,,
90,Thumb pin,2019-10-31,,,12.0,24.0,,,0.0,,m/s khati department and stationary store TCP tekanpur gwalior mp,,
91,File folder dak,2019-06-24,,,,,,,,,,,
92,Paper cutter big size,2024-07-04,,,30.0,1500.0,,,0.0,51.0,M/s super stationary market old high court road gwalior,,
93,Numbring ink,2019-10-31,,,30.0,30.0,,,0.0,,M/s lhati department stationary store tcp tekanpur gwalior mp,,
94,Transfering tape cello,2024-07-04,,,18.0,1800.0,100.0,,0.0,297.0,M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp,,
95,Glue sheet barcode,2019-10-31,,,230.0,1380.0,,,0.0,,m/s khati department and stationary store TCP tekanpur gwalior mp,,
96,Note book,2020-06-29,,,5.0,2500.0,,,0.0,427.0,M/S bhagwati stationary lohiya bazar corner lashkar gwalior,,
97,Gum tube ( sticky tube),2020-01-30,,,4.35,8.7,2.0,,0.0,2.0,M/S CPC BSF canteen academy tekanpur gwalior mp,,
98,Transfer certificate,2023-07-07,,,495.6,8920.0,18.0,,0.0,40.0,M/S vanya enterprises A-2 indramani nagar goleka mandir gwalior,,
99,CD/DVD marker  permanent marker,2020-02-24,,,10.0,200.0,,,0.0,16.0,m/S bharat enterprises behind old high court gwalior mp,,
100,Stock register,2025-03-15,,,88.5,885.0,10.0,,,,M/S karuna enterprises near rama market bazar lashkar gwalior mp,,
101,Computer dusting cloth,2020-02-24,,,10.0,1000.0,100.0,,0.0,20.0,m/s khati department and stationary store TCP tekanpur gwalior mp,,
102,Marker white board red,2024-07-04,,,20.0,1000.0,50.0,,0.0,96.0,M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp,,
103,white tape 2 inch,2024-07-04,,100.0,35.0,3500.0,100.0,,0.0,159.0,M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp,,
104,Marker ink red (white board ),2020-02-24,,,25.0,250.0,10.0,,0.0,8.0,m/S bharat enterprises behind old high court gwalior mp,,
105,Ball pen use and through red,2020-02-20,,,2.4,240.0,100.0,,0.0,58.0,M/S GK marketing old high court road gwalior mp,,
106,Add gel pen green luxar,2020-02-29,,,10.0,10.0,1.0,,0.0,8.0,M/S khati department and stationary store TCP Tekanpur gwalior mp,,
107,add gel pen red luxar,2020-02-28,,,45.0,450.0,10.0,,0.0,6.0,M/S GK marketing old high court road gwalior mp,,
108,Sharpner,2022-06-30,,,3.0,90.0,30.0,,0.0,30.0,M/S bhagwati stationary lohiya bazar corner lashkar gwalior,,
109,Add gel refill (green),2020-02-28,,,24.0,240.0,10.0,,0.0,8.0,M/S GK marketing old high court road gwalior mp,,
110,Paper cutter,2024-07-04,,,30.0,1500.0,,,0.0,85.0,M/S super stationary mart old high court road gwalior,,
111,Stamp pad small size,2020-10-08,,,25.42,25.42,1.0,,0.0,19.0,M/S vinay enterprises   in front of kanya vidhyala jiwaji ganj lashkar gwalior mp,,
112,"Steel scale 40""",2020-02-28,,,250.0,500.0,2.0,,0.0,2.0,M/S GK marketing old high court road gwalior mp,,
113,ADM approval / expenditure register,2023-07-07,,,702.1,5616.8,8.0,,0.0,13.0,M/S vanya enterprises A-2 indramani nagar gole ka mandir gwalior,,
114,Vehicle log book rrecord,2024-10-18,,,650.0,6500.0,10.0,,0.0,14.0,M/S ram enterprises bairagarh TCP Tekanpur,,
115,Pen stand big,2023-6-29,,,95.0,95.0,,,1.0,1.0,M/S khati department and stationary store TCP Tekanpur gwalior mp,,
116,Carbon paper a4 size,2020-06-29,,,1.7,8.5,,,5.0,95.0,M/S khati department and stationary store TCP Tekanpur gwalior mp,,
117,Stapler pin pkt ( Big size ),2022-01-25,,,,,,,0.0,,Recived from admission cell vide letter,,
118,File folder dak,2026-06-13,,,424.8,5097.6,12.0,,0.0,22.0,m/s Vijay brothers opp. UCO bank old high court road gwalior lashkar gwalior,,
119,A4 size paper colour,2021-07-22,,,320.0,320.0,,,0.0,,M/S khati stationary TCP tekanpur gwalior mp,,
120,Flap A4 (Envelope plastic),2021-10-27,,,3.0,1350.0,450.0,,0.0,450.0,M/S bhagwati stationary lohiya bazar corner lashkar gwalior,,
121,Permanent marker black big size,2024-07-04,,,15.0,750.0,,,0.0,80.0,M/S super stationary mart shop no.5 first floor royal plaza old high court road gwalior,,
122,Attendance register for staff,2023-12-18,,,140.6,1699.0,12.0,,0.0,24.0,M/s vijay brothers old high court road gwalior,,
123,Book Narendra modi,2022-04-22,,,9000.0,9000.0,1.0,,0.0,1.0,M/S Multinational publication and distribution house DS 491/492 new rajender nagar new delhi,,
124,Cash book,2024-10-18,,,650.0,6500.0,10.0,,0.0,25.0,M/s ram enterprises bairagarh TCP tekanpur gwalior,,
125,Add  gel refill blue,2024-07-04,,50.0,22.5,1125.0,50.0,,0.0,117.0,M/S super stationary mart shop no.5 first floor royal plaza old high court road gwalior,,`;

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // Check if it's an escaped quote (two quotes in a row)
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const parseDate = (val) => {
  if (!val || val.trim() === '') return null;
  const cleaned = val.trim();
  // Standardize single digit month or day dates if any, but YYYY-MM-DD works natively in JS
  // Check if date is in a format like "29/24-06-2020" or something (row 40 has dop: 2020-06-29, but bill_number: 29/24-06-2020)
  // Let's parse normally.
  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? null : date;
};

const parseDecimal = (val) => {
  if (!val || val.trim() === '') return null;
  const num = parseFloat(val.trim());
  return isNaN(num) ? null : num;
};

const parseIntVal = (val) => {
  if (!val || val.trim() === '') return null;
  const num = parseInt(val.trim(), 10);
  return isNaN(num) ? null : num;
};

const parseString = (val) => {
  if (!val || val.trim() === '') return null;
  return val.trim();
};

async function main() {
  const lines = csvData.trim().split('\n');
  const rows = lines.slice(1);

  let createdCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    if (!row.trim()) continue;
    const parts = parseCSVLine(row);
    if (parts.length < 1) continue;

    const s_no = parseIntVal(parts[0]);

    if (s_no !== null) {
      const existing = await prisma.inventory_items.findFirst({
        where: { s_no }
      });
      if (existing) {
        skippedCount++;
        continue;
      }
    }

    const item_name = parseString(parts[1]);
    const dop = parseDate(parts[2]);
    const bill_number = parseString(parts[3]);
    const quantity = parseDecimal(parts[4]);
    const unit_rate = parseDecimal(parts[5]);
    const amount = parseDecimal(parts[6]);
    const received_quantity = parseDecimal(parts[7]);
    const opening_stock = parseDecimal(parts[8]);
    const issued = parseDecimal(parts[9]);
    const balance = parseDecimal(parts[10]);
    const dealer_name = parseString(parts[11]);
    const slp = parseIntVal(parts[12]);
    const remarks = parseString(parts[13]);

    await prisma.inventory_items.create({
      data: {
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
        slp,
        remarks
      }
    });

    createdCount++;
  }

  console.log(`Created: ${createdCount}, Skipped: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
