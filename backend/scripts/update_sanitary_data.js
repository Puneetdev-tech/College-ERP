import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rawCSV = `S.No,Sanitary Item,DOP,Bill Number,Quantity,Qty Unit,Unit Rate,Amount,Received Qty,Opening Stock,Issued,Balance,Dealer / Supplier,Remarks
1,PHENYL WHITE,2024-06-11,,200,200LTR LTR,36,7200,200,200,0,200,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
2,PHENYL WHITE,2024-10-18,,90,90LTR,56,5040,90LTR,90LTR,0,90LTR,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
3,PHENYL BLACK,2024-06-11,,30,30LTR LTR,70,2100,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
4,PHENYL BLACK,2024-10-18,,30,30LTR,90,2700,30LTR,30LTR,0,30LTR,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
5,ACID,2024-06-11,,200,200LTR LTR,15,3000,200,200,0,200,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
6,ACID,2024-10-18,,90,90LTR,35,3150,90LTR,90LTR,0,90LTR,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
7,GRASS BROOM(PHOOL JHADU),2024-06-11,,50,50 ,70,3500,50,50,0,50,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
8,GRASS BROOM(PHOOL JHADU),2024-10-18,,12,12,60,720,12,12,0,12,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
9,SEEK BROOM(NARIYAL JHADU),2024-06-11,,100,100 ,37,3700,100,100,0,100,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
10,SEEK BROOM(NARIYAL JHADU),2024-10-18,,12,12,30,360,12,12,0,12,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
11,POCHA PAD,2024-06-11,,50,50 ,60,3000,50,50,0,50,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
13,POCHA MOP (POCHAPAD WITH FRAME ),2024-06-11,,50,50 ,180,9000,50,50,0,50,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
14,POCHA MOP (POCHAPAD WITH FRAME ),2024-10-18,,8,8,160,1280,8,8,0,8,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
15,SURF PACKET,2024-06-11,,300,300(100G) (100G),9,2700,300,300,0,300,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
16,SURF PACKET,2024-10-18,,80,80,10,800,80,80,0,80,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
17,PLASTIC SOOP,2024-06-11,,30,30 ,25,750,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
19,NAPTHALENE BALLS(WHITE),2024-06-11,,30,30 ,150,4500,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
20,NAPTHALENE BALLS(WHITE),2024-10-18,,50,50,22,1100,50,50,0,50,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
21,NAPTHALENE BALLS(COLOR),2024-06-11,,10,10KG KG,250,2500,10,10,0,10,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
23,SEEK STICK (BAMBOO),2024-06-11,,20,20 ,60,1200,20,20,0,20,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
25,TOILET BRUSH,2024-06-11,,30,30 ,50,1500,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
26,TOILET BRUSH,2024-10-18,,8,8,65,520,8,8,0,8,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
27,HANDGLOVES,2024-06-11,,20,20 PAIRS PAIRS,60,1200,20,20,0,20,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
29,SCRUB,2026-06-11,,30,30 ,10,300,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
30,SCRUB,2024-10-18,,50,50,10,500,50,50,0,50,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
31,HAND POCHA,2024-06-11,,50,50 ,20,1000,50,50,0,50,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
32,HAND POCHA,2024-10-18,,10,10,25,250,10,10,0,10,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
33,DRAIN POWDER,2024-06-11,,10,10KG KG,200,2000,10,10,0,10,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
34,DUSTBIN PLASTIC,2024-06-11,,30,30 ,200,6000,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
36,BLEACHING POWDER,2024-06-11,,20,20KG KG,40,800,20,20,0,20,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
38,BUTCH,2024-06-11,,30,30 ,50,1500,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
40,BUCKET SMALL,2024-06-11,,30,30 ,50,1500,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
42,IRON WIRE,2024-06-11,,3,3KG KG,200,600,3,3,0,3,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
44,TILES CLEANER,2024-06-11,,30,30LTR LTR,30,900,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
46,WIPER,2024-06-11,,50,50 ,160,8000,50,50,0,50,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
48,ROOM FRESHNER,2024-06-11,,20,20 ,85,1700,20,20,0,20,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
50,COLIN,2024-06-11,,50,50 ,68,3400,50,50,0,50,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
52,ODONIL,2024-06-11,,20,20 ,50,1000,20,20,0,20,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
54,LIFEBUOY,2024-06-11,,50,50 ,9,450,50,50,0,50,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
55,LIFEBUOY,2024-10-18,,30,30,42,1260,30,30,0,30,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
56,HARPIC,2024-10-18,,6,6 ,225,1350,6,6,0,6,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
58,PLASTIC FATTI,2024-06-11,,30,30 ,200,6000,30,30,0,30,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
60,DUSTBIN CLOTH,2024-06-11,,50,50 ,15,750,50,50,0,50,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
62,WEB BRUSH,2024-10-18,,5,5 ,100,500,5,5,0,5,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
64,RED HARPIC,2024-12-12,,72,72(500ML) (500ML),110,7920,72,72,0,72,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
66,DUSTBIN,2024-12-12,,6,6 ,1120,6720,6,6,0,6,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
68,nariyal jharu,2023-01-16,,30,30 ,40,1200,30,,0,326,m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p),
69,Phenyl / phenyl black,2023-01-16,,, ,90,1350,15,,0,165,m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p),
70,Acid,2023-09-27,,, ,19,1900,100,,0,676,"m/s hardik enterprises mahaveer colony dabra gwalior , mp",
71,Nepthalin ball / Nepthalin ball ( white),2023-05-08,,, ,23,2300,100,,0,547,m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p),
72,washing powder (surf),2023-05-08,,240,240 pkt pkt,9.5,2280,240,,0,763,h/s vikas   enterprises gwalior,
73,odonil,2022-09-27,,10,10 ,50,500,10,,0,61,"m/s hardik enterprises mahaveer colony dabra gwalior , mp",
74,pocha pad ( small and big),2023-01-16,,20,20 ,44,880,20,,0,114,m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p),
75,Hand wash / Hand soap,,,, ,,,,,,103,,
76,Pocha pad with fram,2021-07-22,,25,25 ,115,2875,25,,0,25,M/S sanhagi traders bus stand tekanpur gwalior mp,
77,Complete pocha pad set with iron rod,2023-06-30,,20,20 ,130,2600,20,,0,87,M/S hardik enterprises mahaveer colony dabra,
78,Pocha frame with cloth  + lock,2023-01-16,,10,10 ,100,1000,10,,0,10,Diyanshi traders mandir ke pass dhimarpura dabra dist gwalior,
79,Dettol soap,2021-07-22,,20,20 ,9,180,20,,0,70,M/S hardik enterprises mahaveer colony dabra gwalior mp,
80,Room freshner,2024-01-17,,1,1 ,102,102,1,,0,28,M/S  CSMT dry canteen tekanpur,
81,Napthalene ball colour,2022-09-27,,15,15 pkt pkt,50,750,15,,0,271,M/S hardik enterprises mahaveer colony dabra dist gwalior mp,
82,Colin,2022-03-03,,20,20 btls btls,60,1200,20,,0,76,M/S hardik enterprises mahaveer colony dabra dist gwalior mp,
83,Dusting cloth,2022-03-03,,100,100 ,20,2000,100,,0,197,M/S hardik entereprises mahaveer colony dabra dist gwalior mp,
84,Pocha pad cloth,2023-05-08,,10,10 ,20,200,10,,0,10,,
85,Wiper,2023-01-16,,6,6 ,108,648,6,,0,46,M/S diyanshi traders mandir ke pass dhimarpura dabra,
86,Toilet brush,2023-01-16,,6,6 ,48,288,6,,0,61,M/S diyanshi traders mandir ke pass dhimarpura dabra,
87,Bamboo stick,2021-07-09,,, ,90,90,,,1,6,M/S maa veshno electric and repair center TCP tekanpur gwalior mp,
88,colour harpic/toilet flash,2021-07-09,,, ,65,195,,,3,2,M/S vikash enterprises gwalior,
89,Dustbins 660 ltr,2019-02-25,,4,4 ,14277,57108,4,,0,4,,
90,Dustbins  120 ltr capacity,2019-02-25,,2,2 ,3300,6600,2,,0,2,,
91,Phool jharu,2023-01-16,,10,10 ,80,800,10,,0,203,M/S diyanshi traders mandir ke pass dhimarpura dabra dist gwalior,
92,Hypochlorite,2022-03-15,,5,5 ltr ltr,60,300,5,,0,115,M/S hardik enterprises mahaveer colony dabra gwalior mp,
93,Senitizer,2022-03-15,,5,5 ltr ltr,76,380,5,,0,95,M/S hardik enterprises mahaveer colony dabra gwalior mp,
94,Mask N95,2020-06-15,,50,50 ,120,6000,50,,0,50,M/S balagi enterprises R-1 new kushal nagar padav gwalior mp,
95,Disposal Mask,2021-03-15,,100,100 ,3,300,100,,0,400,M/S maa veshno electric and repair center TCP tekanpur gwalior mp,
96,Disposal gloves,2021-01-12,,100,100 ,4,400,100,,0,300,M/S tirupati enterprises 35 gandhi nagar padav gwalior mp,
97,Sentizer bottle 500 ml,2020-06-12,,40,40 ,60,2400,40,,0,60,M/S Balaji enterprises gwalior mp,
98,Sentizer stand,2020-06-12,,3,3 ,1500,4500,3,,0,3,M/S Balaji enterprises gwalior mp,
99,Sintex water tank with pedal iron stand,2020-06-16,,1,1 ,,,,,,,,
100,Urinal pipe,2021-01-12,,, ,100,1000,10,,0,10,M/S Triupati Enterprises j.s gandhi nagar padav gwalior mp,
101,Net Patti For Kachra,2021-03-12,,, ,200,1200,6,,0,6,M/S maa veshnow electric and repairing center TCP Tekanpur gwalior mp,
102,Jala Cleaner,2021-03-15,,, ,90,540,6,,0,6,M/S maa veshnow electric and repairing center TCP Tekanpur gwalior mp,
103,White Phynile,2023-09-27,,100,100 ,29,2900,100,,0,626,M/S Hardik enterprises mahaveer colony dabra,
104,Buchhi for pot,2021-03-15,,, ,60,240,4,,0,4,M/S maa veshnow electric and repairing center TCP Tekanpur gwalior mp,
105,Plastic Dustpan,2021-03-15,,, ,25,250,10,,0,10,M/S Maa veshnow electric and repair center TCP tekanpur gwalior mp,
106,PVC pipe ( 1 inch),2021-03-19,,, ,20,9000,450,,0,450,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
107,PVC socket ( 11 inch),2021-03-19,,, ,25,525,21,,0,21,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
108,Lotion For fixing PVC PIPE,2021-03-19,,, ,105,315,1,,0,1,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
109,PVC T ( 11 inch),2021-03-19,,, ,30,30,1,,0,1,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
110,Valye 40 mm,2021-03-19,,, ,285,570,2,,0,2,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
111,Valye 1 inch,2021-03-19,,, ,70,70,1,,0,1,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
112,Nozzal 1 inch,2021-03-19,,, ,25,25,1,,0,1,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
113,FTA 1 inch,2021-03-19,,, ,20,20,1,,0,1,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
114,M.T.A 1 inch,2021-03-19,,, ,20,20,1,,0,1,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
115,Reduccer  ( 1.5 ''X 0.5 ''),2021-03-19,,, ,40,40,1,,0,1,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
116,MTA ( 1.5 inch ),2021-03-19,,, ,105,420,4,,0,4,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
117,PVC pipe (1.5 inch ),2021-03-19,,, ,50,300,6,,0,6,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
118,Union (1.5 inch ),2021-03-19,,, ,110,110,1,,0,1,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
119,Angle coke steel,2021-03-19,,, ,150,300,2,,0,2,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
120,Tap Face no. 1,2021-03-19,,, ,60,300,5,,0,5,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
121,Tap Face no. 2,2021-03-19,,, ,50,750,15,,0,15,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
122,Plug 0.5 inch,2021-03-19,,, ,5,100,20,,0,20,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
123,Steel tape,2021-03-19,,, ,140,280,2,,0,2,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
124,Tap PVC,2021-03-19,,, ,40,120,3,,0,3,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
125,Kabje ( 5'' ),2021-03-23,,, ,27,405,15,,0,15,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
126,"Wooden screw ( 1'' , 1.5'' , 2'' )",2022-03-24,,, ,350,350,1,,0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
127,Deksar Footwall complete,,,, ,,,,,,,,
129,s,2021-03-23,,, ,60,900,15,,0,15,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
130,Latches For Almirah 7'',2022-02-04,,, ,13,312,24,,0,24,M/S gudda sanitary and hardware paints TCP Tekanpur Gwalior MP,
131,Dettol spry,2021-07-22,,, ,156,3120,20,,0,50,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
132,Foam pipe 1.5 inch for garden,2021-03-25,,, ,19,9500,500,,0,500,M/S Gopal sanitary store Subash Ganj Dabra Gwalior MP,
133,HDPE PVC pipe ( 1.25 inch ) Suprem ( Black),2021-03-25,,, ,19,9500,500,,0,500,M/S Gopal sanitary store Subash Ganj Dabra Gwalior MP,
134,Polish Yellow ( METAL POLISH ),2021-04-09,,, ,40,80,2,,0,2,M/S Shri Nath Army store TCP Tekanpur gwalior mp,
135,Hit Spray,2021-04-09,,, ,100,100,1,,0,1,M/S Khati stationary Hosiery and general store TCP Tekanpur Gwalior mp,
136,Phenyl Black,2023-01-16,,, ,90,1350,15,,0,165,M/S Divyanshi Traders Mandir ke pass Dhimarpura Dabra dist Gwalior,
137,Lizol ( 200 ml ),2021-07-22,,, ,32,640,20,,0,40,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
138,SOAP life boy,2021-01-13,,, ,10,2880,288,,0,308,M/S Balaji Enterprises Gwalior MP,
139,Caustic soda powder,2021-01-22,,, ,180,360,2,,0,2,M/S Ramlal satish kumar TCP Tekanpur gwalior mp,
140,Handwash,2022-03-15,,, ,,280,5,,0,5,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
141,Fevicol,2021-11-23,,, ,250,500,2,,0,2,M/S steel Fabrication Workshop and sanitary TCP Tekanpur Gwalior mp,
142,Chappa kundi alluminim,2021-11-25,,, ,8,200,25,,,,M/S steel Fabrication Workshop and sanitary TCP Tekanpur Gwalior mp,
143,PVC Gitti,2022-03-24,,, ,20,40,2,,0,14,M/S steel Fabrication workshop and sanitary bajrang vihar colony TCP Tekanpur Gwalior mp,
144,Aluminium Washer For Wash basin,2022-02-04,,, ,3.5,70,20,,0,20,M/S Gudda Sanitary and hardware paints TCP tekanpur gwalior mp,
145,M.S socket for wash basin,2022-02-04,,, ,7.5,75,10,,0,10,M/S Gudda Sanitary and hardware paints TCP tekanpur gwalior mp,
146,Chuna,2022-03-15,,, ,,360,50,,0,50,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
147,Paint Black,2022-01-15,,, ,300,600,2,,0,2,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
148,Paint white,2022-01-15,,, ,340,680,2,,0,2,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
149,PVC pipe 0.5 '' ( Leyam),2022-04-27,,, ,1000,1000,3,,2,1,M/S Ranjana goods and electric general suppliers P.H.E colony Motijheel gwalior mp,
150,Fogging Machine KB 200 ( KOREA),2023-01-20,,, ,8000,8000,1,,0,1,"M/S bagwani kitchen garden centre 119,120 garimaarcade shinde ki chawani MLB ROAD GWALIOR",
151,Kingfog Bayer,2022-02-20,,, ,2200,2200,1,,0,1,"M/S bagwani kitchen garden centre 119,120 garimaarcade shinde ki chawani MLB ROAD GWALIOR"`;

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
  // Extract clean numeric portion if strings like "90LTR" or "30LTR"
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
  const header = parseCSVLine(lines[0]);
  console.log("CSV Header:", header);

  const dataRows = lines.slice(1);
  console.log(`Parsing ${dataRows.length} CSV data lines...`);

  const records = [];
  for (const line of dataRows) {
    const cols = parseCSVLine(line);
    if (cols.length < 2) continue;

    const s_no = parseInt(cols[0], 10) || null;
    const item_name = cols[1] || null;
    const dop = parseDate(cols[2]);
    const bill_number = cols[3] || null;
    const quantity = parseNum(cols[4]);
    const quantity_text = cols[5] || null;
    const quantity_unit = cols[5] ? cols[5].replace(/^[0-9.]+/g, '').trim() : null;
    const unit_rate = parseNum(cols[6]);
    const amount = parseNum(cols[7]);
    const received_quantity = parseNum(cols[8]);
    const opening_stock = parseNum(cols[9]);
    const issued = parseNum(cols[10]);
    const balance = parseNum(cols[11]);
    const dealer_name = cols[12] || null;
    const remarks = cols[13] || null;

    records.push({
      s_no,
      item_name,
      dop,
      bill_number,
      quantity,
      quantity_text,
      quantity_unit,
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

  console.log(`Parsed ${records.length} valid records.`);

  // Clear existing sanitary_items
  const deleted = await prisma.sanitary_items.deleteMany({});
  console.log(`Deleted ${deleted.count} old sanitary_items rows.`);

  // Insert new sanitary_items
  const created = await prisma.sanitary_items.createMany({
    data: records
  });

  console.log(`Successfully inserted ${created.count} new sanitary_items records!`);
}

main()
  .catch((e) => {
    console.error("Error updating sanitary data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
