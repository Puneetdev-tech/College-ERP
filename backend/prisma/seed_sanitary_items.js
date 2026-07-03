import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const csvData = `S.No,Name_of_item,DOP,Bill_Number,Quantity,quantity_text,quantity_unit,Unit_Rate,Amount,Received_Quantity,Opening_Stock,Issued,Balance,AVL_STOCK_TOTAL,Dealer_Name,Remarks
1,PHENYL WHITE,2024-06-11,,200.0,200LTR,LTR,36.0,7200.0,200.0,200.0,0.0,200.0,7200.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
3,PHENYL BLACK,2024-06-11,,30.0,30LTR,LTR,70.0,2100.0,30.0,30.0,0.0,30.0,2100.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
5,ACID,2024-06-11,,200.0,200LTR,LTR,15.0,3000.0,200.0,200.0,0.0,200.0,3000.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
7,GRASS BROOM(PHOOL JHADU),2024-06-11,,50.0,50,,70.0,3500.0,50.0,50.0,0.0,50.0,3500.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
9,SEEK BROOM(NARIYAL JHADU),2024-06-11,,100.0,100,,37.0,3700.0,100.0,100.0,0.0,100.0,3700.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
11,POCHA PAD,2024-06-11,,50.0,50,,60.0,3000.0,50.0,50.0,0.0,50.0,3000.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
13,POCHA MOP (POCHAPAD WITH FRAME ),2024-06-11,,50.0,50,,180.0,9000.0,50.0,50.0,0.0,50.0,9000.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
15,SURF PACKET,2024-06-11,,300.0,300(100G),(100G),9.0,2700.0,300.0,300.0,0.0,300.0,2700.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
17,PLASTIC SOOP,2024-06-11,,30.0,30,,25.0,750.0,30.0,30.0,0.0,30.0,750.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
19,NAPTHALENE BALLS(WHITE),2024-06-11,,30.0,30,,150.0,4500.0,30.0,30.0,0.0,30.0,4500.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
21,NAPTHALENE BALLS(COLOR),2024-06-11,,10.0,10KG,KG,250.0,2500.0,10.0,10.0,0.0,10.0,2500.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
23,SEEK STICK (BAMBOO),2024-06-11,,20.0,20,,60.0,1200.0,20.0,20.0,0.0,20.0,1200.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
25,TOILET BRUSH,2024-06-11,,30.0,30,,50.0,1500.0,30.0,30.0,0.0,30.0,1500.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
27,HANDGLOVES,2024-06-11,,20.0,20 PAIRS,PAIRS,60.0,1200.0,20.0,20.0,0.0,20.0,1200.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
29,SCRUB,2026-06-11,,30.0,30,,10.0,300.0,30.0,30.0,0.0,30.0,300.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
31,HAND POCHA,2024-06-11,,50.0,50,,20.0,1000.0,50.0,50.0,0.0,50.0,1000.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
33,DRAIN POWDER,2024-06-11,,10.0,10KG,KG,200.0,2000.0,10.0,10.0,0.0,10.0,2000.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
34,DUSTBIN PLASTIC,2024-06-11,,30.0,30,,200.0,6000.0,30.0,30.0,0.0,30.0,6000.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
36,BLEACHING POWDER,2024-06-11,,20.0,20KG,KG,40.0,800.0,20.0,20.0,0.0,20.0,800.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
38,BUTCH,2024-06-11,,30.0,30,,50.0,1500.0,30.0,30.0,0.0,30.0,1500.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
40,BUCKET SMALL,2024-06-11,,30.0,30,,50.0,1500.0,30.0,30.0,0.0,30.0,1500.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
42,IRON WIRE,2024-06-11,,3.0,3KG,KG,200.0,600.0,3.0,3.0,0.0,3.0,600.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
44,TILES CLEANER,2024-06-11,,30.0,30LTR,LTR,30.0,900.0,30.0,30.0,0.0,30.0,900.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
46,WIPER,2024-06-11,,50.0,50,,160.0,8000.0,50.0,50.0,0.0,50.0,8000.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
48,ROOM FRESHNER,2024-06-11,,20.0,20,,85.0,1700.0,20.0,20.0,0.0,20.0,1700.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
50,COLIN,2024-06-11,,50.0,50,,68.0,3400.0,50.0,50.0,0.0,50.0,3400.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
52,ODONIL,2024-06-11,,20.0,20,,50.0,1000.0,20.0,20.0,0.0,20.0,1000.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
54,LIFEBUOY,2024-06-11,,50.0,50,,9.0,450.0,50.0,50.0,0.0,50.0,450.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
56,HARPIC,2024-10-18,,6.0,6,,225.0,1350.0,6.0,6.0,0.0,6.0,1350.0,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
58,PLASTIC FATTI,2024-06-11,,30.0,30,,200.0,6000.0,30.0,30.0,0.0,30.0,6000.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
60,DUSTBIN CLOTH,2024-06-11,,50.0,50,,15.0,750.0,50.0,50.0,0.0,50.0,750.0,"M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR",
62,WEB BRUSH,2024-10-18,,5.0,5,,100.0,500.0,5.0,5.0,0.0,5.0,500.0,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
64,RED HARPIC,2024-12-12,,72.0,72(500ML),(500ML),110.0,7920.0,72.0,72.0,0.0,72.0,7920.0,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
66,DUSTBIN,2024-12-12,,6.0,6,,1120.0,6720.0,6.0,6.0,0.0,6.0,6720.0,M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP,
68,nariyal jharu,2023-01-16,,30.0,30,,40.0,1200.0,30.0,,0.0,326.0,,m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p),
69,Phenyl / phenyl black,2023-01-16,,,,,90.0,1350.0,15.0,,0.0,165.0,,m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p),
70,Acid,2023-09-27,,,,,19.0,1900.0,100.0,,0.0,676.0,,"m/s hardik enterprises mahaveer colony dabra gwalior , mp",
71,Nepthalin ball / Nepthalin ball ( white),2023-05-08,,,,,23.0,2300.0,100.0,,0.0,547.0,,m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p),
72,washing powder (surf),2023-05-08,,240.0,240 pkt,pkt,9.5,2280.0,240.0,,0.0,763.0,,h/s vikas   enterprises gwalior,
73,odonil,2022-09-27,,10.0,10,,50.0,500.0,10.0,,0.0,61.0,,"m/s hardik enterprises mahaveer colony dabra gwalior , mp",
74,pocha pad ( small and big),2023-01-16,,20.0,20,,44.0,880.0,20.0,,0.0,114.0,,m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p),
75,Hand wash / Hand soap,,,,,,,,,,,103.0,,,
76,Pocha pad with fram,2021-07-22,,25.0,25,,115.0,2875.0,25.0,,0.0,25.0,,M/S sanhagi traders bus stand tekanpur gwalior mp,
77,Complete pocha pad set with iron rod,2023-06-30,,20.0,20,,130.0,2600.0,20.0,,0.0,87.0,,M/S hardik enterprises mahaveer colony dabra,
78,Pocha frame with cloth  + lock,2023-01-16,,10.0,10,,100.0,1000.0,10.0,,0.0,10.0,,Diyanshi traders mandir ke pass dhimarpura dabra dist gwalior,
79,Dettol soap,2021-07-22,,20.0,20,,9.0,180.0,20.0,,0.0,70.0,,M/S hardik enterprises mahaveer colony dabra gwalior mp,
80,Room freshner,2024-01-17,,1.0,1,,102.0,102.0,1.0,,0.0,28.0,,M/S  CSMT dry canteen tekanpur,
81,Napthalene ball colour,2022-09-27,,15.0,15 pkt,pkt,50.0,750.0,15.0,,0.0,271.0,,M/S hardik enterprises mahaveer colony dabra dist gwalior mp,
82,Colin,2022-03-03,,20.0,20 btls,btls,60.0,1200.0,20.0,,0.0,76.0,,M/S hardik enterprises mahaveer colony dabra dist gwalior mp,
83,Dusting cloth,2022-03-03,,100.0,100,,20.0,2000.0,100.0,,0.0,197.0,,M/S hardik entereprises mahaveer colony dabra dist gwalior mp,
84,Pocha pad cloth,2023-05-08,,10.0,10,,20.0,200.0,10.0,,0.0,10.0,,,
85,Wiper,2023-01-16,,6.0,6,,108.0,648.0,6.0,,0.0,46.0,,M/S diyanshi traders mandir ke pass dhimarpura dabra,
86,Toilet brush,2023-01-16,,6.0,6,,48.0,288.0,6.0,,0.0,61.0,,M/S diyanshi traders mandir ke pass dhimarpura dabra,
87,Bamboo stick,2021-07-09,,,,,90.0,90.0,,,1.0,6.0,,M/S maa veshno electric and repair center TCP tekanpur gwalior mp,
88,colour harpic/toilet flash,2021-07-09,,,,,65.0,195.0,,,3.0,2.0,,M/S vikash enterprises gwalior,
89,Dustbins 660 ltr,2019-02-25,,4.0,4,,14277.0,57108.0,4.0,,0.0,4.0,,,
90,Dustbins  120 ltr capacity,2019-02-25,,2.0,2,,3300.0,6600.0,2.0,,0.0,2.0,,,
91,Phool jharu,2023-01-16,,10.0,10,,80.0,800.0,10.0,,0.0,203.0,,M/S diyanshi traders mandir ke pass dhimarpura dabra dist gwalior,
92,Hypochlorite,2022-03-15,,5.0,5 ltr,ltr,60.0,300.0,5.0,,0.0,115.0,,M/S hardik enterprises mahaveer colony dabra gwalior mp,
93,Senitizer,2022-03-15,,5.0,5 ltr,ltr,76.0,380.0,5.0,,0.0,95.0,,M/S hardik enterprises mahaveer colony dabra gwalior mp,
94,Mask N95,2020-06-15,,50.0,50,,120.0,6000.0,50.0,,0.0,50.0,,M/S balagi enterprises R-1 new kushal nagar padav gwalior mp,
95,Disposal Mask,2021-03-15,,100.0,100,,3.0,300.0,100.0,,0.0,400.0,,M/S maa veshno electric and repair center TCP tekanpur gwalior mp,
96,Disposal gloves,2021-01-12,,100.0,100,,4.0,400.0,100.0,,0.0,300.0,,M/S tirupati enterprises 35 gandhi nagar padav gwalior mp,
97,Sentizer bottle 500 ml,2020-06-12,,40.0,40,,60.0,2400.0,40.0,,0.0,60.0,,M/S Balaji enterprises gwalior mp,
98,Sentizer stand,2020-06-12,,3.0,3,,1500.0,4500.0,3.0,,0.0,3.0,,M/S Balaji enterprises gwalior mp,
99,Sintex water tank with pedal iron stand,2020-06-16,,1.0,1,,,,,,,,,,
100,Urinal pipe,2021-01-12,,,,,100.0,1000.0,10.0,,0.0,10.0,,M/S Triupati Enterprises j.s gandhi nagar padav gwalior mp,
101,Net Patti For Kachra,2021-03-12,,,,,200.0,1200.0,6.0,,0.0,6.0,,M/S maa veshnow electric and repairing center TCP Tekanpur gwalior mp,
102,Jala Cleaner,2021-03-15,,,,,90.0,540.0,6.0,,0.0,6.0,,M/S maa veshnow electric and repairing center TCP Tekanpur gwalior mp,
103,White Phynile,2023-09-27,,100.0,100,,29.0,2900.0,100.0,,0.0,626.0,,M/S Hardik enterprises mahaveer colony dabra,
104,Buchhi for pot,2021-03-15,,,,,60.0,240.0,4.0,,0.0,4.0,,M/S maa veshnow electric and repairing center TCP Tekanpur gwalior mp,
105,Plastic Dustpan,2021-03-15,,,,,25.0,250.0,10.0,,0.0,10.0,,M/S Maa veshnow electric and repair center TCP tekanpur gwalior mp,
106,PVC pipe ( 1 inch),2021-03-19,,,,,20.0,9000.0,450.0,,0.0,450.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
107,PVC socket ( 11 inch),2021-03-19,,,,,25.0,525.0,21.0,,0.0,21.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
108,Lotion For fixing PVC PIPE,2021-03-19,,,,,105.0,315.0,1.0,,0.0,1.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
109,PVC T ( 11 inch),2021-03-19,,,,,30.0,30.0,1.0,,0.0,1.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
110,Valye 40 mm,2021-03-19,,,,,285.0,570.0,2.0,,0.0,2.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
111,Valye 1 inch,2021-03-19,,,,,70.0,70.0,1.0,,0.0,1.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
112,Nozzal 1 inch,2021-03-19,,,,,25.0,25.0,1.0,,0.0,1.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
113,FTA 1 inch,2021-03-19,,,,,20.0,20.0,1.0,,0.0,1.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
114,M.T.A 1 inch,2021-03-19,,,,,20.0,20.0,1.0,,0.0,1.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
115,Reduccer  ( 1.5 ''X 0.5 ''),2021-03-19,,,,,40.0,40.0,1.0,,0.0,1.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
116,MTA ( 1.5 inch ),2021-03-19,,,,,105.0,420.0,4.0,,0.0,4.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
117,PVC pipe (1.5 inch ),2021-03-19,,,,,50.0,300.0,6.0,,0.0,6.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
118,Union (1.5 inch ),2021-03-19,,,,,110.0,110.0,1.0,,0.0,1.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
119,Angle coke steel,2021-03-19,,,,,150.0,300.0,2.0,,0.0,2.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
120,Tap Face no. 1,2021-03-19,,,,,60.0,300.0,5.0,,0.0,5.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
121,Tap Face no. 2,2021-03-19,,,,,50.0,750.0,15.0,,0.0,15.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
122,Plug 0.5 inch,2021-03-19,,,,,5.0,100.0,20.0,,0.0,20.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
123,Steel tape,2021-03-19,,,,,140.0,280.0,2.0,,0.0,2.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
124,Tap PVC,2021-03-19,,,,,40.0,120.0,3.0,,0.0,3.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
125,Kabje ( 5'' ),2021-03-23,,,,,27.0,405.0,15.0,,0.0,15.0,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
126,"Wooden screw ( 1'' , 1.5'' , 2'' )",2022-03-24,,,,,350.0,350.0,1.0,,0.0,,,M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp,
127,Deksar Footwall complete,,,,,,,,,,,,,,
129,s,2021-03-23,,,,,60.0,900.0,15.0,,0.0,15.0,,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
130,Latches For Almirah 7'',2022-02-04,,,,,13.0,312.0,24.0,,0.0,24.0,,M/S gudda sanitary and hardware paints TCP Tekanpur Gwalior MP,
131,Dettol spry,2021-07-22,,,,,156.0,3120.0,20.0,,0.0,50.0,,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
132,Foam pipe 1.5 inch for garden,2021-03-25,,,,,19.0,9500.0,500.0,,0.0,500.0,,M/S Gopal sanitary store Subash Ganj Dabra Gwalior MP,
133,HDPE PVC pipe ( 1.25 inch ) Suprem ( Black),2021-03-25,,,,,19.0,9500.0,500.0,,0.0,500.0,,M/S Gopal sanitary store Subash Ganj Dabra Gwalior MP,
134,Polish Yellow ( METAL POLISH ),2021-04-09,,,,,40.0,80.0,2.0,,0.0,2.0,,M/S Shri Nath Army store TCP Tekanpur gwalior mp,
135,Hit Spray,2021-04-09,,,,,100.0,100.0,1.0,,0.0,1.0,,M/S Khati stationary Hosiery and general store TCP Tekanpur Gwalior mp,
136,Phenyl Black,2023-01-16,,,,,90.0,1350.0,15.0,,0.0,165.0,,M/S Divyanshi Traders Mandir ke pass Dhimarpura Dabra dist Gwalior,
137,Lizol ( 200 ml ),2021-07-22,,,,,32.0,640.0,20.0,,0.0,40.0,,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
138,SOAP life boy,2021-01-13,,,,,10.0,2880.0,288.0,,0.0,308.0,,M/S Balaji Enterprises Gwalior MP,
139,Caustic soda powder,2021-01-22,,,,,180.0,360.0,2.0,,0.0,2.0,,M/S Ramlal satish kumar TCP Tekanpur gwalior mp,
140,Handwash,2022-03-15,,,,,,280.0,5.0,,0.0,5.0,,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
141,Fevicol,2021-11-23,,,,,250.0,500.0,2.0,,0.0,2.0,,M/S steel Fabrication Workshop and sanitary TCP Tekanpur Gwalior mp,
142,Chappa kundi alluminim,2021-11-25,,,,,8.0,200.0,25.0,,,,,M/S steel Fabrication Workshop and sanitary TCP Tekanpur Gwalior mp,
143,PVC Gitti,2022-03-24,,,,,20.0,40.0,2.0,,0.0,14.0,,M/S steel Fabrication workshop and sanitary bajrang vihar colony TCP Tekanpur Gwalior mp,
144,Aluminium Washer For Wash basin,2022-02-04,,,,,3.5,70.0,20.0,,0.0,20.0,,M/S Gudda Sanitary and hardware paints TCP tekanpur gwalior mp,
145,M.S socket for wash basin,2022-02-04,,,,,7.5,75.0,10.0,,0.0,10.0,,M/S Gudda Sanitary and hardware paints TCP tekanpur gwalior mp,
146,Chuna,2022-03-15,,,,,,360.0,50.0,,0.0,50.0,,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
147,Paint Black,2022-01-15,,,,,300.0,600.0,2.0,,0.0,2.0,,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
148,Paint white,2022-01-15,,,,,340.0,680.0,2.0,,0.0,2.0,,M/S Hardik enterprises mahaveer colony dabra gwalior mp,
149,PVC pipe 0.5 '' ( Leyam),2022-04-27,,,,,1000.0,1000.0,3.0,,2.0,1.0,,M/S Ranjana goods and electric general suppliers P.H.E colony Motijheel gwalior mp,
150,Fogging Machine KB 200 ( KOREA),2023-01-20,,,,,8000.0,8000.0,1.0,,0.0,1.0,,"M/S bagwani kitchen garden centre 119,120 garimaarcade shinde ki chawani MLB ROAD GWALIOR",
151,Kingfog Bayer,2022-02-20,,,,,2200.0,2200.0,1.0,,0.0,1.0,,"M/S bagwani kitchen garden centre 119,120 garimaarcade shinde ki chawani MLB ROAD GWALIOR",
`;

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
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
  await prisma.sanitary_items.deleteMany();
  await prisma.inventoryItem.deleteMany({ where: { category: "Sanitory" } });

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
      // Skips duplicates by checking s_no
      const existing = await prisma.sanitary_items.findFirst({
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
    const quantity_text = parseString(parts[5]);
    const quantity_unit = parseString(parts[6]);
    const unit_rate = parseDecimal(parts[7]);
    const amount = parseDecimal(parts[8]);
    const received_quantity = parseDecimal(parts[9]);
    const opening_stock = parseDecimal(parts[10]);
    const issued = parseDecimal(parts[11]);
    const balance = parseDecimal(parts[12]);
    const avl_stock_total = parseDecimal(parts[13]);
    const dealer_name = parseString(parts[14]);
    const remarks = parseString(parts[15]);

    await prisma.sanitary_items.create({
      data: {
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
        avl_stock_total,
        dealer_name,
        remarks
      }
    });

    // Also populate in main InventoryItem table under "Sanitory" category
    if (item_name) {
      const cleanItemName = item_name.trim();
      const cleanType = quantity_unit || quantity_text || "Standard";
      const cleanStock = Math.round(balance !== null ? balance : (quantity !== null ? quantity : 0));
      const cleanPrice = unit_rate !== null ? parseFloat(unit_rate) : 0;
      
      let cleanStatus = "Good";
      if (cleanStock === 0) cleanStatus = "Low";
      else if (cleanStock < 10) cleanStatus = "Medium";

      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          item: { equals: cleanItemName, mode: "insensitive" },
          category: { equals: "Sanitory", mode: "insensitive" },
          type: { equals: cleanType, mode: "insensitive" }
        }
      });

      if (!existingItem) {
        await prisma.inventoryItem.create({
          data: {
            item: cleanItemName,
            category: "Sanitory",
            subcategory: cleanItemName,
            type: cleanType,
            stock: cleanStock,
            price: cleanPrice,
            status: cleanStatus
          }
        });
      }
    }

    createdCount++;
  }

  // Logs progress
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
