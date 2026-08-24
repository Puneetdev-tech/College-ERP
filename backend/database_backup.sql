--
-- PostgreSQL database dump
--

\restrict QZr9YEExTYYmQrtg4lCjJUoSXqlwPM8sklADHifaKs4bPwrbSIv0IhZe5hweoJt

-- Dumped from database version 18.4 (Homebrew)
-- Dumped by pg_dump version 18.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ApprovalSequence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApprovalSequence" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "position" integer NOT NULL
);


--
-- Name: ApprovalSequence_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ApprovalSequence_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ApprovalSequence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ApprovalSequence_id_seq" OWNED BY public."ApprovalSequence".id;


--
-- Name: ApprovalStep; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApprovalStep" (
    id integer NOT NULL,
    "orderId" text NOT NULL,
    "userId" integer NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "position" integer NOT NULL
);


--
-- Name: ApprovalStep_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ApprovalStep_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ApprovalStep_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ApprovalStep_id_seq" OWNED BY public."ApprovalStep".id;


--
-- Name: InventoryCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventoryCategory" (
    id text NOT NULL,
    name text NOT NULL,
    icon text DEFAULT 'FaBoxes'::text NOT NULL,
    "desc" text DEFAULT ''::text NOT NULL,
    color text DEFAULT 'from-blue-500 to-indigo-600'::text NOT NULL
);


--
-- Name: InventoryItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventoryItem" (
    id integer NOT NULL,
    item text NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    type text DEFAULT 'Standard'::text NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    price double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'Good'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: InventoryItem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."InventoryItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: InventoryItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."InventoryItem_id_seq" OWNED BY public."InventoryItem".id;


--
-- Name: InventorySubcategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventorySubcategory" (
    id integer NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL
);


--
-- Name: InventorySubcategory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."InventorySubcategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: InventorySubcategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."InventorySubcategory_id_seq" OWNED BY public."InventorySubcategory".id;


--
-- Name: IssueLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."IssueLog" (
    id integer NOT NULL,
    item text NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    type text NOT NULL,
    department text NOT NULL,
    faculty text NOT NULL,
    quantity integer NOT NULL,
    "issuedById" integer,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "unitCost" double precision
);


--
-- Name: IssueLog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."IssueLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: IssueLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."IssueLog_id_seq" OWNED BY public."IssueLog".id;


--
-- Name: MaintenanceCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaintenanceCategory" (
    id text NOT NULL,
    name text NOT NULL,
    icon text DEFAULT 'FaTools'::text NOT NULL
);


--
-- Name: MaintenanceHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaintenanceHistory" (
    id text NOT NULL,
    "unitId" text NOT NULL,
    "partRepaired" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "pricePerQty" double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    date text NOT NULL,
    technician text DEFAULT 'General Technician'::text NOT NULL,
    notes text DEFAULT ''::text NOT NULL
);


--
-- Name: MaintenanceUnit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaintenanceUnit" (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    location text DEFAULT 'Campus'::text NOT NULL,
    "initialPrice" double precision DEFAULT 0 NOT NULL,
    "installDate" text NOT NULL,
    status text DEFAULT 'Active'::text NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id integer NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    "iconType" text DEFAULT 'info'::text NOT NULL,
    color text DEFAULT 'bg-blue-100 text-blue-800'::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    supplier text NOT NULL,
    item text NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    type text DEFAULT 'Standard'::text NOT NULL,
    quantity integer NOT NULL,
    "pricePerUnit" double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    "orderDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "receiveDate" timestamp(3) without time zone,
    department text NOT NULL,
    faculty text NOT NULL,
    "placedById" integer,
    "placedByName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "totalAmount" double precision,
    "deliverySlip" text
);


--
-- Name: StockAdjustment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockAdjustment" (
    id integer NOT NULL,
    "itemId" integer NOT NULL,
    "itemName" text NOT NULL,
    "oldQuantity" integer NOT NULL,
    "newQuantity" integer NOT NULL,
    reason text NOT NULL,
    "adjustedBy" text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: StockAdjustment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."StockAdjustment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: StockAdjustment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."StockAdjustment_id_seq" OWNED BY public."StockAdjustment".id;


--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SystemSettings" (
    id integer DEFAULT 1 NOT NULL,
    "lowStockThreshold" integer DEFAULT 10 NOT NULL,
    "collegeName" text DEFAULT 'RJ Institute of Technology'::text NOT NULL,
    "collegeLogo" text DEFAULT '/rjit_logo.png'::text NOT NULL,
    "collegeAddress" text DEFAULT ''::text NOT NULL,
    "collegePhone" text DEFAULT ''::text NOT NULL,
    "collegeEmail" text DEFAULT ''::text NOT NULL,
    "collegeWebsite" text DEFAULT ''::text NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    status text DEFAULT 'Active'::text NOT NULL,
    permissions text[],
    phone text,
    photo text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: electrical_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.electrical_items (
    id integer NOT NULL,
    name text NOT NULL,
    "itemCode" text
);


--
-- Name: electrical_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.electrical_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: electrical_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.electrical_items_id_seq OWNED BY public.electrical_items.id;


--
-- Name: electrical_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.electrical_orders (
    id integer NOT NULL,
    "subItemId" integer NOT NULL,
    dop date,
    "billNumber" text,
    quantity text,
    "unitRate" numeric(15,4),
    amount numeric(15,4),
    "receivedQty" text,
    "openingStock" text,
    issued text,
    balance text,
    "avlStockTotal" text,
    "dealerName" text,
    slp integer,
    remarks text
);


--
-- Name: electrical_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.electrical_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: electrical_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.electrical_orders_id_seq OWNED BY public.electrical_orders.id;


--
-- Name: electrical_sub_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.electrical_sub_items (
    id integer NOT NULL,
    "itemId" integer NOT NULL,
    variant text NOT NULL
);


--
-- Name: electrical_sub_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.electrical_sub_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: electrical_sub_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.electrical_sub_items_id_seq OWNED BY public.electrical_sub_items.id;


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_items (
    id integer NOT NULL,
    s_no integer,
    item_name text,
    dop date,
    bill_number text,
    quantity numeric(15,4),
    unit_rate numeric(15,4),
    amount numeric(15,4),
    received_quantity numeric(15,4),
    opening_stock numeric(15,4),
    issued numeric(15,4),
    balance numeric(15,4),
    dealer_name text,
    slp integer,
    remarks text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_items_id_seq OWNED BY public.inventory_items.id;


--
-- Name: sanitary_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sanitary_items (
    id integer NOT NULL,
    s_no integer,
    item_name text,
    dop date,
    bill_number text,
    quantity numeric(15,4),
    quantity_text text,
    quantity_unit text,
    unit_rate numeric(15,4),
    amount numeric(15,4),
    received_quantity numeric(15,4),
    opening_stock numeric(15,4),
    issued numeric(15,4),
    balance numeric(15,4),
    avl_stock_total numeric(15,4),
    dealer_name text,
    remarks text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sanitary_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sanitary_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sanitary_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sanitary_items_id_seq OWNED BY public.sanitary_items.id;


--
-- Name: ApprovalSequence id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalSequence" ALTER COLUMN id SET DEFAULT nextval('public."ApprovalSequence_id_seq"'::regclass);


--
-- Name: ApprovalStep id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalStep" ALTER COLUMN id SET DEFAULT nextval('public."ApprovalStep_id_seq"'::regclass);


--
-- Name: InventoryItem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryItem" ALTER COLUMN id SET DEFAULT nextval('public."InventoryItem_id_seq"'::regclass);


--
-- Name: InventorySubcategory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventorySubcategory" ALTER COLUMN id SET DEFAULT nextval('public."InventorySubcategory_id_seq"'::regclass);


--
-- Name: IssueLog id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IssueLog" ALTER COLUMN id SET DEFAULT nextval('public."IssueLog_id_seq"'::regclass);


--
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- Name: StockAdjustment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockAdjustment" ALTER COLUMN id SET DEFAULT nextval('public."StockAdjustment_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: electrical_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.electrical_items ALTER COLUMN id SET DEFAULT nextval('public.electrical_items_id_seq'::regclass);


--
-- Name: electrical_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.electrical_orders ALTER COLUMN id SET DEFAULT nextval('public.electrical_orders_id_seq'::regclass);


--
-- Name: electrical_sub_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.electrical_sub_items ALTER COLUMN id SET DEFAULT nextval('public.electrical_sub_items_id_seq'::regclass);


--
-- Name: inventory_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_items_id_seq'::regclass);


--
-- Name: sanitary_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sanitary_items ALTER COLUMN id SET DEFAULT nextval('public.sanitary_items_id_seq'::regclass);


--
-- Data for Name: ApprovalSequence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ApprovalSequence" (id, "userId", "position") FROM stdin;
34	78	1
35	77	2
\.


--
-- Data for Name: ApprovalStep; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ApprovalStep" (id, "orderId", "userId", name, role, status, "approvedAt", "position") FROM stdin;
28	PO001	78	Dean (SOW)	Dean Student Welfare	Approved	2026-08-21 08:22:48.003	1
29	PO001	77	Principal	Principal	Approved	2026-08-21 08:23:23.97	2
\.


--
-- Data for Name: InventoryCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryCategory" (id, name, icon, "desc", color) FROM stdin;
stationary	Stationary	FaPen	Admin stationery, files, registers, folders, writing assets and stock registers.	from-blue-600 to-indigo-750
sanitory	Sanitory	FaBroom	Sanitation items, cleaning supplies, soaps, brushes, and hygiene products.	from-teal-500 to-emerald-600
electrical	Electrical	FaBolt	Electrical bulbs, tube lights, wires, sockets, and switchboards.	from-amber-500 to-orange-600
electronics	Electronics	FaDesktop	Desktop computers, monitors, printers, scanners, and UPS units.	from-sky-500 to-blue-600
sports	Sports	FaRunning	Sports kits, athletics gear, fitness assets, and court equipment.	from-rose-500 to-pink-600
furniture	Furniture	FaChair	Beds, wardrobes, tables, office chairs, desks, and cupboards.	from-yellow-600 to-amber-700
legacy_registers	Legacy Registers	FaDatabase	Historical read-only registers including General CSV, Sanitary, and Electrical store archives.	from-purple-600 to-indigo-800
laboratory	laboratory	FaFlask	Glassware, scientific machinery, chemicals and compound microscopes.	from-violet-500 to-fuchsia-600
\.


--
-- Data for Name: InventoryItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryItem" (id, item, category, subcategory, type, stock, price, status, "createdAt", "updatedAt") FROM stdin;
1705	laptop	Electronics	i7	Standard	5	50000	Low	2026-08-21 08:24:20.002	2026-08-21 08:29:14.095
\.


--
-- Data for Name: InventorySubcategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventorySubcategory" (id, "categoryId", name) FROM stdin;
121	stationary	Stationery
122	sanitory	Cleaning
123	electrical	Electrical
124	electronics	Electronics
125	sports	Sports
126	furniture	Furniture
127	legacy_registers	Legacy Records
128	laboratory	Equipment
129	laboratory	Stationery
\.


--
-- Data for Name: IssueLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."IssueLog" (id, item, category, subcategory, type, department, faculty, quantity, "issuedById", date, "unitCost") FROM stdin;
9	i7 - Standard	Electronics	i7	Standard	CSE	Yograj Sharma	5	73	2026-08-21 08:28:00	50000
\.


--
-- Data for Name: MaintenanceCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MaintenanceCategory" (id, name, icon) FROM stdin;
RO	RO (Water Purifiers)	FaTint
AC	Air Conditioners	FaWrench
DG	Diesel Generators	FaTools
\.


--
-- Data for Name: MaintenanceHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MaintenanceHistory" (id, "unitId", "partRepaired", quantity, "pricePerQty", "totalAmount", date, technician, notes) FROM stdin;
h-1-1	ro-1	Membrane Filter	1	1500	1500	2025-08-12	Rakesh Verma	Routine membrane replacement
h-1-2	ro-1	Pre-Filter Spun	2	250	500	2026-03-10	Amit Sharma	Replaced dirty filter cartridges
h-2-1	ro-2	Booster Pump 75 GPD	1	2200	2200	2025-11-20	Rajesh Kumar	Pump pressure was low
h-2-2	ro-2	Activated Carbon Filter	1	450	450	2026-04-05	Rajesh Kumar	Scheduled maintenance
h-3-1	ro-3	SMPS Power Adapter	1	800	800	2025-09-05	Vijay Singh	Adapter burned due to voltage fluctuation
h-4-1	ro-4	UV Lamp	1	650	650	2025-06-12	Amit Sharma	Choke and lamp replacement
h-4-2	ro-4	Sediment Filter	2	300	600	2025-12-18	Suresh Pal	Annual filter replacement
h-5-1	ro-5	Solenoid Valve	1	400	400	2025-10-14	Vijay Singh	Water leakage issue resolved
h-6-1	ro-6	FR (Flow Restrictor)	1	150	150	2025-10-15	Vijay Singh	Replaced flow restrictor
h-7-1	ro-7	RO Membrane & Carbon Filter	1	2100	2100	2025-05-22	Rakesh Verma	Complete filter service
h-7-2	ro-7	Pre-Filter Spun	3	250	750	2026-01-10	Amit Sharma	Workshop dust caused fast clogging
h-8-1	ro-8	TDS Controller Valve	1	350	350	2025-07-08	Suresh Pal	Adjusted TDS level to 120
\.


--
-- Data for Name: MaintenanceUnit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MaintenanceUnit" (id, name, category, location, "initialPrice", "installDate", status) FROM stdin;
ro-1	CV RAMAN RO	RO	C.V. Raman Hostel	15000	2025-01-10	Active
ro-2	ABDUL KALAM RO	RO	Abdul Kalam Block	16500	2025-02-15	Active
ro-3	KALPANA CHAWLA RO	RO	Kalpana Chawla Hostel	15000	2025-01-20	Active
ro-4	RO NEAR CIVIL LAB	RO	Civil Engineering Lab Block	18000	2024-11-05	Active
ro-5	1ST FLOOR RO	RO	Main Building - 1st Floor	14500	2025-03-01	Active
ro-6	2ND FLOOR RO	RO	Main Building - 2nd Floor	14500	2025-03-01	Active
ro-7	RO INFRONT OF WORKSHOP	RO	Mechanical Workshop Gate	20000	2024-08-20	Active
ro-8	LIBRARY RO	RO	Central Library Ground Floor	15500	2024-12-10	Active
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, type, message, "iconType", color, read, "createdAt") FROM stdin;
111	Purchase Order	New Purchase Order PO001 by Admin for 10 × laptop — Total: ₹500,000 (₹50,000/unit)	order	bg-yellow-100 text-yellow-800	f	2026-08-21 08:17:22.286
112	Order Approved	Order PO001 (10 × laptop, ₹500,000) approved by Dean (SOW) (Dean Student Welfare)	order	bg-green-100 text-green-800	f	2026-08-21 08:22:48.053
113	Order Approved	Order PO001 (10 × laptop, ₹500,000) approved by Principal (Principal)	order	bg-green-100 text-green-800	f	2026-08-21 08:23:23.992
114	Order Approved	Order PO001 is fully approved and ready for stock receipt!	received	bg-emerald-100 text-emerald-800	f	2026-08-21 08:23:23.995
115	Stock Received	10 × laptop (Standard) received for Electronics — Total Value: ₹500,000	received	bg-green-100 text-green-800	f	2026-08-21 08:24:20.015
116	Low Stock Alert	laptop (Standard) is below threshold! Remaining: 5	low-stock	bg-red-100 text-red-800	f	2026-08-21 08:29:14.115
117	Stock Issued	5 × i7 (Standard) issued to CSE — Unit cost: ₹50,000	issued	bg-blue-100 text-blue-800	f	2026-08-21 08:29:14.121
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, supplier, item, category, subcategory, type, quantity, "pricePerUnit", status, "orderDate", "receiveDate", department, faculty, "placedById", "placedByName", "createdAt", "updatedAt", "totalAmount", "deliverySlip") FROM stdin;
PO001	test	laptop	Electronics	i7	Standard	10	50000	Received	2026-08-21 08:17:22.062	2026-08-21 08:24:00	Electronics	mr.test	73	Admin	2026-08-21 08:17:22.062	2026-08-24 08:09:51.772	500000	data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAQABAAD/4QBWRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAAAAAABAAAAAQAAAAEAAAAB/+ELDWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLycgeDp4bXB0az0nSW1hZ2U6OkV4aWZUb29sIDEyLjY1Jz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnBkZj0naHR0cDovL25zLmFkb2JlLmNvbS9wZGYvMS4zLyc+CiAgPHBkZjpQcm9kdWNlcj5PbmxpbmUtQ29udmVydDwvcGRmOlByb2R1Y2VyPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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
\.


--
-- Data for Name: StockAdjustment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StockAdjustment" (id, "itemId", "itemName", "oldQuantity", "newQuantity", reason, "adjustedBy", date) FROM stdin;
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SystemSettings" (id, "lowStockThreshold", "collegeName", "collegeLogo", "collegeAddress", "collegePhone", "collegeEmail", "collegeWebsite") FROM stdin;
1	10	Rustamji Institute of Technology	/rjit_logo.png	123 Campus Lane, Okhla, New Delhi	+91 11 2690 7400	info@rjit.edu.in	www.rjit.edu.in
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, password, role, status, permissions, phone, photo, "createdAt", "updatedAt") FROM stdin;
78	Dean (SOW)	dean@rjit.edu.in	$2a$10$UEBBBSODwVG86fcdC0WEN.1awxf8OcOmP5aFiMY0J832Rj2HcSedu	Dean Student Welfare	Active	{Dashboard,Inventory,"Receive Order","Issue Stock",Reports,Notifications,Maintenance}			2026-08-18 09:02:12.017	2026-08-21 08:18:41.382
73	Admin	admin@rjit.edu.in	$2a$10$s9Gxi0gq22YQuUffjRUan.jH83MPE1NTmseyMIuZ/1tYWtV.Vsw.m	Admin	Active	{Dashboard,Inventory,"Place Order","Receive Order","Issue Stock",Analytics,Reports,Notifications,Users,Settings,Maintenance}			2026-08-18 09:02:11.258	2026-08-18 09:02:11.258
75	Store Officer	store@rjit.edu.in	$2a$10$RzOeLEwhgw3LNbaAToQFt.0NFkMump2m8GAq/YfIJG8xOAbA/ysQO	Purchase Officer	Active	{Dashboard,"Place Order","Receive Order",Reports,Notifications}			2026-08-18 09:02:11.616	2026-08-18 09:02:11.616
77	Principal	principal@rjit.edu.in	$2a$10$iojqmJA7ifwtEemmstrIy..auMUQ1gFVvZc1rMelBLu.E.OP9fR2S	Principal	Active	{Dashboard,Analytics,Reports,Maintenance}			2026-08-18 09:02:11.898	2026-08-21 08:18:18.727
\.


--
-- Data for Name: electrical_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.electrical_items (id, name, "itemCode") FROM stdin;
313	SHEET 7X5	\N
314	SQUARE LED 1X1 FEET PANEL	\N
315	FAN CONDENSOR 2.25 UF	\N
316	FAN CONDENSOR 3.15 UF	\N
317	LED 200W ROOF LIGHTS	\N
318	MACHINE OIL	\N
319	OIL PRESSURE KUPPY	\N
320	185MM LUGS(ALUMINIUM/COPPER)	\N
321	GATE LIGHT	\N
322	LED 2X2 VENUS 36 WATT	\N
323	MCB 16 AMP SINGLE POLE	\N
324	MCCB HAVELLS 32AMP	\N
325	MCB 32AMP SINGLE POLE	\N
326	FAN C/F CROMPTON 1200MM	\N
327	MCB 32 AMP CONA	\N
328	MCB 32 AMP HAVELLS	\N
329	FANCY ANGLE HOLDER	\N
330	WIRE FRLS 1 SQMM 200 MTR GREEN	\N
331	LED BULB 15 WATT	\N
332	TOP 16 AMP 3 PIN	\N
333	TOP 16 AMP (CONA)	\N
334	DOL STARTER TWO PHASE	\N
335	8M COVER PLATE	\N
336	WIRE 1.5 SQMM BLUE 200MTR  FRLS	\N
337	WIRE 2.5 SQMM RED 200MTR FRLS	\N
338	SURFACE BOX 12M	\N
339	CASING PATTI 2''	\N
340	PVC CASING 1.5MM	\N
341	GITTI PVC (RAWAL PLUG)	\N
342	CABLE 2 CORE ALUMINIUM (ICAB)	\N
343	SHEET 12M	\N
344	BOX-3M	\N
345	WOODEN SCREW 1.5INCH	\N
346	CAPACITOR 50MFD HAVELLS	\N
347	STEEL NAIL 2''	\N
348	STEEL NAIL 3''	\N
349	SHEET 3M	\N
350	MCCB-40AMP HAVELLS RIO	\N
281	2.5MM COPPER CABLE	\N
282	16 AMP SOCKET(CONA)	\N
283	PEDESTRAL FAN 400MM TORPEDO	\N
284	6/16 AMP TWIN SOCKET WITH SHUTTER	\N
285	6AMP SWITCH -CONA	\N
286	6AMP SWITCH -LEGRAND	\N
287	10 AMP SWITCH	\N
288	6 amp socket -cona	\N
289	6 AMP SOCKET - ANCHOR	\N
290	6 AMP SOCKET LEGRAND	\N
291	10AMP SOCKET SPIN AND SHUTTER	\N
292	16 AMP SWITCH	\N
293	16 AMP SWITCH CONA	\N
294	SWITCH 20A ONE WAY	\N
295	CABLE CLIP	\N
296	EXHAUST FAN 18''	\N
297	CLIP 25 SQ MM	\N
298	100 WATT STREET LIGHT	\N
299	MODULAR SHEET	\N
300	8 WAY SURFACE BOX	\N
301	TUBELIGHT 20W ORIENT	\N
302	LED LUMLINEN 20W HAVELLS	\N
303	T/L BATTEN CROMPTON 20W	\N
304	LED BULB 9WATT	\N
305	2.5 MM WIRE	\N
306	1.5 MM WIRE	\N
307	PVC PIPE 1	\N
308	PVC BEND 1	\N
309	PVC TEE	\N
310	UCLIP 1 FOR PVC PIPE FITTING	\N
311	INSULATION TAPE ROLL	\N
312	SHEET 5X5	\N
\.


--
-- Data for Name: electrical_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.electrical_orders (id, "subItemId", dop, "billNumber", quantity, "unitRate", amount, "receivedQty", "openingStock", issued, balance, "avlStockTotal", "dealerName", slp, remarks) FROM stdin;
83	83	2024-12-12	\N	36MTR	93.0000	3348.0000	\N	\N	0.0	\N	\N	M/S MAHESH ENTERPRISES BERAGARH TCP TEKANPUR GWALIOR	1	\N
84	84	2024-12-19	\N	200MTR(2-100MTR)	14500.0000	29000.0000	\N	\N	0.0	\N	\N	\N	2	\N
85	85	2025-01-01	\N	100MTR	14500.0000	14500.0000	\N	\N	0.0	\N	\N	\N	3	\N
86	86	2024-12-19	\N	50	100.0000	5000.0000	\N	\N	0.0	50.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	4	\N
87	87	2024-12-28	\N	20	100.0000	2000.0000	\N	\N	0.0	20.0	\N	M/S SHEETLA ELECTRICALS INFRONT CENTRAL BOI	5	\N
88	88	2025-12-10	\N	16	120.0000	1920.0000	\N	\N	\N	0.0	\N	M/S SHRI KRISHNA COMPUTER ,SHUBHASH GANJ DABRA	6	\N
89	89	2026-04-10	\N	5	110.0000	550.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	7	\N
90	90	2026-03-24	\N	4	3280.0000	13120.0000	\N	\N	\N	3.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	8	\N
91	91	2026-04-09	\N	14	89.5600	1253.8400	\N	\N	\N	0.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	9	\N
92	92	2024-12-19	\N	50	22.5000	1125.0000	\N	\N	0.0	50.0	\N	M/S MAHESH ENTERPRISES BERAGARH TCP TEKANPUR GWALIOR	10	\N
93	93	2025-01-01	\N	100	19.0000	1900.0000	\N	\N	0.0	100.0	\N	M/S MAHESH ENTERPRISES BERAGARH TCP TEKANPUR GWALIOR	11	\N
94	94	2025-11-20	\N	20	61.3600	1227.2000	\N	\N	0.0	20.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	12	\N
95	95	2026-04-09	\N	50	18.1700	908.6000	\N	\N	\N	0.0	\N	\N	13	\N
96	96	2024-12-19	\N	50	38.0000	1900.0000	\N	\N	0.0	50.0	\N	M/S MAHESH ENTERPRISES BERAGARH TCP TEKANPUR GWALIOR	14	\N
97	97	2024-12-28	\N	20	50.0000	1000.0000	\N	\N	0.0	20.0	\N	M/S JAI SHEETLA ELECTRICALS TEKANPUR	15	\N
98	98	2025-01-01	\N	100	30.0000	3000.0000	\N	\N	0.0	100.0	\N	M/S MAHESH ENTERPRISES BERAGARH TCP TEKANPUR GWALIOR	16	\N
99	99	2025-11-20	\N	20	159.3000	3186.0000	\N	\N	0.0	20.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	17	\N
100	100	2026-04-09	\N	6	40.1200	240.7200	\N	\N	6.0	0.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	18	\N
101	101	2024-12-19	\N	50	85.0000	4250.0000	\N	\N	0.0	50.0	\N	M/S MAHESH ENTERPRISES BERAGARH TCP TEKANPUR GWALIOR	19	\N
102	102	2026-04-10	\N	5	80.0000	400.0000	\N	\N	5.0	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	20	\N
103	103	2026-04-09	\N	14	45.6500	639.1000	\N	\N	\N	0.0	\N	M/S JSB INDIA 32,TALWAR KA BADA OLD INDUSTRIAL AREA TANSEN NAGAR ROAD GWALIOR	21	\N
104	104	2024-12-19	\N	10 PKT	110.0000	1100.0000	\N	\N	0.0	\N	\N	M/S MAHESH ENTERPRISES BERAGARH TCP TEKANPUR GWALIOR	22	\N
105	105	2026-03-24	\N	4	4450.0000	17800.0000	\N	\N	\N	1.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	23	\N
106	106	2026-04-09	\N	10PKT	41.3000	413.0000	\N	\N	\N	0.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	24	\N
107	107	2024-12-19	\N	5	2832.0000	14160.0000	\N	\N	0.0	5.0	\N	M/S JAI SHEETLA ELECTRICALS INFRONT OF CENTRAL BOI TEKANPUR	25	\N
108	108	2024-12-28	\N	10	120.0000	1200.0000	\N	\N	0.0	10.0	\N	M/S JAI SHEETLA ELECTRICALS INFRONT OF CENTRAL BOI TEKANPUR	26	\N
109	109	2024-12-28	\N	10	90.0000	900.0000	\N	\N	0.0	10.0	\N	M/S JAI SHEETLA ELECTRICALS INFRONT OF CENTRAL BOI TEKANPUR	27	\N
110	110	2025-01-01	\N	300	225.0000	67500.0000	\N	\N	0.0	300.0	\N	M/S MAHESH ENTERPRISES BERAGARH TCP TEKANPUR GWALIOR	28	\N
111	111	2025-11-20	\N	60	141.6000	8496.0000	\N	\N	4.0	56.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	29	\N
112	112	2026-02-12	\N	30	120.0000	3600.0000	\N	\N	0.0	30.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	30	\N
113	113	2025-01-01	\N	200	85.0000	17000.0000	\N	\N	0.0	200.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	31	\N
114	114	2025-01-01	\N	450MTR	38.0000	17100.0000	\N	\N	0.0	\N	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	32	\N
115	115	2025-01-01	\N	450MTR	28.0000	12600.0000	\N	\N	0.0	\N	\N	M/S JAI SHEETLA ELECTRICALS INFRONT OF CENTRAL BOI TEKANPUR	33	\N
116	116	2025-01-31	\N	90MTR (4 BUNDLE)	2112.2000	8448.8000	\N	\N	0.0	\N	\N	M/S JAI SHEETLA ELECTRICALS INFRONT OF CENTRAL BOI TEKANPUR	34	\N
117	117	2025-01-01	\N	200FEET	60.0000	12000.0000	\N	\N	0.0	\N	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	35	\N
118	118	2026-03-28	\N	12	12.0000	144.0000	\N	\N	12.0	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	36	\N
119	119	2025-01-01	\N	24	10.0000	240.0000	\N	\N	0.0	24.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	37	\N
120	120	2025-01-01	\N	12	10.0000	120.0000	\N	\N	0.0	12.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	38	\N
121	121	2025-01-01	\N	1PKT	500.0000	500.0000	\N	\N	0.0	\N	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	39	\N
122	122	2025-01-01	\N	100	14.0000	1400.0000	\N	\N	0.0	100.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	40	\N
123	123	2025-11-20	\N	30	11.8000	354.0000	\N	\N	3.0	27.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	41	\N
124	124	2025-01-01	\N	15	18.0000	270.0000	\N	\N	0.0	15.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	42	\N
125	125	2025-01-01	\N	20	24.0000	480.0000	\N	\N	0.0	20.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	43	\N
126	126	2025-01-01	\N	25	1327.0000	33175.0000	\N	\N	0.0	25.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	44	\N
127	127	2025-01-01	\N	100	40.0000	4000.0000	\N	\N	0.0	100.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	45	\N
128	128	2025-01-01	\N	200	50.0000	10000.0000	\N	\N	0.0	200.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	46	\N
129	129	2025-01-01	\N	5	8500.0000	42500.0000	\N	\N	0.0	5.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	47	\N
130	130	2025-01-01	\N	1LTR	200.0000	200.0000	\N	\N	0.0	\N	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	48	\N
131	131	2025-01-01	\N	1	50.0000	50.0000	\N	\N	0.0	1.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	49	\N
132	132	2025-01-01	\N	20	85.0000	1700.0000	\N	\N	0.0	20.0	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	50	\N
133	133	2025-01-31	\N	45	737.5000	33187.5000	\N	\N	0.0	45.0	\N	M/S JAI SHEETLA ELECTRICALS INFRONT OF CENTRAL BOI TEKANPUR	51	\N
134	134	2025-11-20	\N	9	1416.0000	12744.0000	\N	\N	\N	5.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	52	\N
135	135	2025-11-20	\N	6	110.0000	660.0000	\N	\N	0.0	6.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	53	\N
136	136	2026-04-27	\N	6	150.0000	900.0000	\N	\N	0.0	6.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	54	\N
137	137	2025-11-20	\N	6	129.8000	778.8000	\N	\N	2.0	4.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	55	\N
138	138	2026-03-24	\N	20	1600.0000	32000.0000	\N	\N	\N	13.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	56	\N
139	139	2026-04-10	\N	1	165.0000	165.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	57	\N
140	140	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	58	\N
141	141	2026-04-27	\N	6	150.0000	900.0000	\N	\N	0.0	6.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	59	\N
142	142	2025-11-20	\N	25	47.2000	1180.0000	\N	\N	0.0	25.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	60	\N
143	143	2025-11-20	\N	200MTR-1QNT	2987.7600	2987.7600	\N	\N	0.0	\N	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	61	\N
144	144	2025-11-20	\N	25	123.9000	3097.5000	\N	\N	0.0	25.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	62	\N
145	145	2025-11-20	\N	10	76.7000	767.0000	\N	\N	0.0	10.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	63	\N
146	146	2026-04-27	\N	10	95.0000	950.0000	\N	\N	0.0	10.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	64	\N
147	147	2025-11-20	\N	1	2065.0000	2065.0000	\N	\N	0.0	1.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	65	\N
148	148	2026-04-09	\N	13	107.0850	1392.1050	\N	\N	\N	0.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	66	\N
149	149	2026-04-09	\N	200MTR(4)	5310.0000	21240.0000	\N	\N	\N	0.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	67	\N
150	150	2026-04-09	\N	200MTR(3 COIL)	8488.9200	25466.7600	\N	\N	\N	0.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	68	\N
151	151	2026-04-10	\N	1	140.0000	140.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	69	\N
152	152	2026-04-10	\N	35	133.0000	4655.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	70	\N
153	153	2026-04-09	\N	30	88.5000	2655.0000	\N	\N	\N	0.0	\N	JSB INDIA 32 TALWAR KA BADA OLD INDUSTRIAL AREA, TANSEN NAGAR ROAD GWALIOR	71	\N
154	154	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	72	\N
155	155	2026-04-10	\N	5PKT	25.0000	125.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	73	\N
156	156	2026-04-17	\N	150MTR	25.0000	4200.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	74	\N
157	157	2026-04-10	\N	1	170.0000	170.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	75	\N
158	158	2026-04-10	\N	1	60.0000	60.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	76	\N
159	159	2026-04-10	\N	5PKT	60.0000	300.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	77	\N
160	160	2026-04-17	\N	1	200.0000	200.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	78	\N
161	161	2026-04-10	\N	4	10.0000	40.0000	\N	\N	4.0	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	79	\N
162	162	\N	\N	2	20.0000	40.0000	\N	\N	2.0	0.0	\N	\N	80	\N
163	163	2026-04-10	\N	1	70.0000	70.0000	\N	\N	\N	0.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	81	\N
164	164	2026-04-27	\N	4	300.0000	1200.0000	\N	\N	0.0	4.0	\N	M/S NARMADA ENTERPRISES ,SHOP NO B11 RAJGERI APARTMENT GANDHI NAGAR GWALIOR	82	\N
\.


--
-- Data for Name: electrical_sub_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.electrical_sub_items (id, "itemId", variant) FROM stdin;
83	281	36MTR
84	281	200MTR(2-100MTR)
85	281	100MTR
86	282	50
87	282	20
88	282	16
89	282	5
90	283	4
91	284	14
92	285	50
93	285	100
94	286	20
95	287	50
96	288	50
97	288	20
98	289	100
99	290	20
100	291	6
101	292	50
102	293	5
103	294	14
104	295	10 PKT
105	296	4
106	297	10PKT
107	298	5
108	299	10
109	300	10
110	301	300
111	302	60
112	303	30
113	304	200
114	305	450MTR
115	306	450MTR
116	306	90MTR (4 BUNDLE)
117	307	200FEET
118	308	12
119	308	24
120	309	12
121	310	1PKT
122	311	100
123	311	30
124	312	15
125	313	20
126	314	25
127	315	100
128	316	200
129	317	5
130	318	1LTR
131	319	1
132	320	20
133	321	45
134	322	9
135	323	6
136	324	6
137	325	6
138	326	20
139	327	1
140	328	Default
141	328	6
142	329	25
143	330	200MTR-1QNT
144	331	25
145	332	10
146	333	10
147	334	1
148	335	13
149	336	200MTR(4)
150	337	200MTR(3 COIL)
151	338	1
152	339	35
153	340	30
154	341	Default
155	341	5PKT
156	342	150MTR
157	343	1
158	344	1
159	345	5PKT
160	346	1
161	347	4
162	348	2
163	349	1
164	350	4
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_items (id, s_no, item_name, dop, bill_number, quantity, unit_rate, amount, received_quantity, opening_stock, issued, balance, dealer_name, slp, remarks, created_at) FROM stdin;
150	35	CD ( make moserbear)	2023-05-01	\N	\N	8.5800	17.1600	\N	\N	2.0000	55.0000	\N	\N	\N	2026-08-21 07:56:01.723
149	34	Thumpin big size	2023-09-21	\N	\N	25.0000	500.0000	\N	\N	0.0000	\N	m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
122	1	A4 Size Paper Rim	2026-02-12	\N	100.0000	221.9900	22199.0000	100.0000	100.0000	20.0000	80.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
123	2	A4 Size Paper Rim	2026-06-13	\N	20.0000	224.0000	4480.0000	20.0000	\N	0.0000	\N	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
124	3	Add Gel Pen	2026-02-12	\N	30.0000	45.5000	1365.0000	30.0000	30.0000	1.0000	29.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
125	4	Add Gel Pen	2026-06-13	\N	50.0000	6.0180	300.9000	50.0000	\N	0.0000	\N	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
126	5	Add Gel Refill	2026-02-12	\N	20.0000	23.0000	460.0000	20.0000	20.0000	0.0000	20.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
127	6	Cell AAA	2026-02-12	\N	50.0000	16.8000	840.0000	50.0000	50.0000	0.0000	50.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
128	7	Cell AA	2026-02-12	\N	1000.0000	16.8000	840.0000	50.0000	50.0000	0.0000	50.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
129	8	Envelope Small Brown	2026-02-12	\N	50.0000	1.0030	1003.0000	1000.0000	1000.0000	200.0000	800.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
130	9	File Flag	2026-02-12	\N	20.0000	11.0684	553.4200	50.0000	50.0000	0.0000	50.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
131	10	Highlighter	2026-02-12	\N	20.0000	15.5996	311.9920	20.0000	20.0000	1.0000	19.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
132	11	Liquid Gum	2026-02-12	\N	20.0000	29.9956	599.9120	20.0000	20.0000	0.0000	20.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	Issue to main office	2026-08-21 07:56:01.723
133	12	Liquid Gum	2026-06-13	\N	10.0000	11.2000	112.0000	10.0000	\N	0.0000	\N	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
134	13	Notice Board Pin	2026-02-12	\N	20.0000	16.8032	336.0640	20.0000	20.0000	1.0000	19.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
135	14	Register 100 Pages	2026-02-12	\N	30.0000	84.9954	2549.8620	30.0000	30.0000	1.0000	29.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
136	15	Register 200 Pages	2026-02-12	\N	10.0000	139.9952	1399.9520	10.0000	10.0000	0.0000	10.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
137	16	Staff Attendance Register	2026-02-12	\N	14.0000	78.7178	1102.0490	14.0000	14.0000	7.0000	7.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	Issueed to Mrs Alka Vidhyarthi	2026-08-21 07:56:01.723
138	17	Student Attendance Register	2026-02-12	\N	\N	\N	0.0000	\N	\N	\N	0.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
139	18	Use And Throw Pen	2026-02-12	\N	200.0000	3.1000	620.0000	200.0000	200.0000	23.0000	177.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
140	19	White Board Marker	2026-02-12	\N	20.0000	18.0000	360.0000	20.0000	20.0000	0.0000	20.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
141	20	Whitener Pen	2026-02-12	\N	20.0000	18.0000	360.0000	20.0000	20.0000	0.0000	20.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
142	21	File Cover J-280	2026-02-12	\N	200.0000	9.2000	1840.0000	200.0000	200.0000	0.0000	200.0000	Supplied By Om Hari Priya & co.  Address-behind Roxy  Cinema Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
143	22	Pencil Wooden Make - Natraj	2026-06-13	\N	\N	56.0000	560.0000	10.0000	10.0000	\N	\N	m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
144	29	CL REGISTER	2023-12-08	\N	\N	1100.0000	5500.0000	5.0000	5.0000	\N	5.0000	M/S VANYA ENTERPRISES A-2 INDRAMANI NAGAR GOLE KA MANDIR GWALIOR	\N	\N	2026-08-21 07:56:01.723
145	30	DIARY	2024-06-11	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:56:01.723
146	31	WHITE ENVELOPE 9X4	2023-03-21	\N	\N	\N	1200.0000	500.0000	500.0000	\N	500.0000	M/S BHAGWATI STATIONARY LOHIYA BAZAR CORNER GWALIOR	\N	\N	2026-08-21 07:56:01.723
147	32	PEN UNI BALL	2022-02-10	\N	\N	\N	400.0000	5.0000	5.0000	\N	\N	\N	\N	\N	2026-08-21 07:56:01.723
148	33	All pin box	2024-07-04	\N	\N	13.0000	390.0000	\N	\N	0.0000	\N	M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
151	36	CHALK DUSTLESS	2024-07-04	\N	\N	20.0000	200.0000	\N	\N	0.0000	153.0000	M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
152	37	Register 160 pages ( no. 4)	2020-07-08	\N	\N	25.0000	250.0000	\N	\N	10.0000	110.0000	M/S BHAGWATI STATIONARY LOHIYA BAZAR CORNER GWALIOR	\N	\N	2026-08-21 07:56:01.723
153	38	Register 240 pages (6 no.)	2024-07-04	\N	100.0000	68.0000	6800.0000	100.0000	\N	0.0000	178.0000	M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
154	39	Register 320 pages (8 no )	2024-02-13	\N	50.0000	85.0000	4250.0000	50.0000	\N	0.0000	50.0000	m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
155	40	Register 400 pages (10 no )	2020-06-29	29/24-06-2020	2.0000	80.0000	160.0000	2.0000	\N	0.0000	2.0000	m/s khati department and stationary store TCP tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
156	41	Fevistick 5gm	2023-05-01	384/03-10-2020	2.0000	33.9000	67.8000	2.0000	\N	0.0000	12.0000	M/s vinay enterprises infront kanya vidhyala jiwaji ganj lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
157	42	Poker / suja	2026-06-13	\N	4.0000	47.2000	188.8000	4.0000	\N	0.0000	66.0000	m/s Vijay Brothers opp. UCO Bank old high court Lashkar Gwalior	\N	\N	2026-08-21 07:56:01.723
158	43	Scissor midium size	2024-07-04	\N	30.0000	45.0000	1350.0000	30.0000	\N	0.0000	32.0000	M/S prassddhi enterprises E-16  jagriti nagar laxmi ganj lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
159	44	scale steel/plastic	2024-07-04	\N	30.0000	12.0000	360.0000	30.0000	\N	0.0000	113.0000	M/S super stationary mart shop no. F-5 first floor old high court road gwalior mp	\N	\N	2026-08-21 07:56:01.723
160	45	Markin cloth	2023-05-01	\N	\N	35.0000	2765.0000	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:56:01.723
161	46	Index box file	2024-07-04	\N	\N	80.0000	4000.0000	\N	\N	0.0000	\N	M/S super stationary mart shop no. F-5 first floor old high court road gwalior mp	\N	\N	2026-08-21 07:56:01.723
162	47	White board marker ink blue 15 ml	2024-07-04	\N	50.0000	19.0000	950.0000	50.0000	\N	0.0000	157.0000	M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
163	48	White board marker ink black 15 ml	2024-07-04	\N	\N	19.0000	950.0000	50.0000	\N	0.0000	\N	M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
164	49	marker pen blue	2024-07-04	\N	100.0000	20.0000	2000.0000	100.0000	\N	0.0000	287.0000	M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
165	50	marker pen black	2023-07-04	\N	100.0000	20.0000	2000.0000	100.0000	\N	0.0000	463.0000	M/S Prasiddhi enterprises E-16 jagriti nagar lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
166	51	Brown tape 2 inch	2024-07-04	\N	100.0000	32.0000	3200.0000	100.0000	\N	0.0000	146.0000	M/S Prasiddhi enterprises E-16 Jgarti Nagar lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
167	52	ADD gel pen	2026-06-13	\N	12.0000	70.8000	849.6000	12.0000	\N	0.0000	116.0000	M/s vijay brother  gwalior	\N	\N	2026-08-21 07:56:01.723
168	53	ADD gel refill ( red)	2020-02-28	\N	10.0000	24.0000	240.0000	10.0000	\N	0.0000	35.0000	M/S gk marketing old high court road lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
169	54	Dusting cloths	2023-09-21	\N	20.0000	48.0000	960.0000	\N	\N	0.0000	20.0000	M/S vijay brothers opposite UCO bank old high cout road lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
170	55	Use and through pen	2024-07-04	\N	400.0000	3.0000	1200.0000	400.0000	\N	0.0000	1308.0000	M/S super stationary mart shop no. F-5 first floor old high court road gwalior mp	\N	\N	2026-08-21 07:56:01.723
171	56	file sticky pad	2021-06-30	\N	\N	25.0000	750.0000	30.0000	\N	0.0000	76.0000	M/S bhagwati stationary lohiya bazar corner lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
172	57	Attendance register	2024-10-18	\N	200.0000	110.0000	22000.0000	200.0000	\N	0.0000	566.0000	M/S RAM ENTERPRISES BAIRAGARH TCP TEKANPUR	\N	\N	2026-08-21 07:56:01.723
173	58	colour glossy id card for tata buses	2023-03-15	\N	\N	4.0000	568.0000	142.0000	\N	0.0000	142.0000	Yadav electrostate 130 mayur market thatipur gwalior mp	\N	\N	2026-08-21 07:56:01.723
174	59	Brown file	2017-06-23	\N	700.0000	9.8000	6860.0000	700.0000	\N	0.0000	80.0000	m/s Vinay enterprises gwalior	\N	\N	2026-08-21 07:56:01.723
175	60	Brown file cover	2025-03-13	\N	500.0000	9.0000	4500.0000	500.0000	\N	0.0000	2226.0000	M/S bharat enterprises lohiya bazar corner near uttpul old high court road gwalior	\N	\N	2026-08-21 07:56:01.723
176	61	A4 size contury paper rim	2024-07-04	\N	\N	220.0000	44000.0000	200.0000	\N	0.0000	\N	M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp	\N	\N	2026-08-21 07:56:01.723
177	63	File Tag ( green / white)	2020-10-08	\N	\N	72.0300	72.0300	\N	\N	0.0000	\N	M/S Vinay Enterprises in front of kanya vidhyala jiwaji ganj lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
178	64	DVD black R/W	2020-06-24	\N	5.0000	20.0000	100.0000	5.0000	\N	0.0000	10.0000	M/S Navin store gwalior	\N	\N	2026-08-21 07:56:01.723
179	65	DVD	2021-07-08	\N	\N	15.0000	30.0000	\N	\N	2.0000	51.0000	M/S bhagwati stationary lohiya bazar corner lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
180	67	Brown graphs small size	2024-07-04	\N	\N	80.0000	1600.0000	2000.0000	\N	0.0000	\N	M/s super stationary mart shop no. F 5 first floor royal plaza old high court  road gwalior	\N	\N	2026-08-21 07:56:01.723
181	68	Vechicle Log Book Register	2021-09-15	\N	10.0000	400.0000	4000.0000	10.0000	\N	0.0000	8.0000	M/S Santosh traders Bus stand Tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
182	70	Sketch pen	2026-06-13	\N	2.0000	29.5000	59.0000	\N	\N	0.0000	\N	M/S vijay brothers opp UCO Bank old high court  lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
183	71	PASSY PAD	2024-07-04	\N	50.0000	16.0000	800.0000	\N	\N	0.0000	600.0000	M/s super stationary mart shop no. F 5 first floor royal plaza old high court  road gwalior	\N	\N	2026-08-21 07:56:01.723
184	72	Register 3 no jumbo register	2023-09-21	\N	\N	150.0000	3000.0000	\N	\N	0.0000	\N	\N	\N	\N	2026-08-21 07:56:01.723
185	73	stipler machine big size	2024-07-04	\N	50.0000	135.0000	6750.0000	50.0000	\N	0.0000	\N	M/S prasiddhi enterprises E-16 jagriti nagar lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
186	74	Rubber packet/Eraser (DUST free)	2022-06-30	\N	30.0000	3.0000	90.0000	30.0000	\N	0.0000	122.0000	M/S bhagwati stationary lohiya bazar corner lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
187	75	Eraser / Dustless	2018-06-24	\N	10.0000	2.9800	29.8000	10.0000	\N	0.0000	\N	\N	\N	\N	2026-08-21 07:56:01.723
188	76	Stepler machine small size (no. 10)	2026-06-13	\N	4.0000	59.0000	236.0000	4.0000	\N	0.0000	\N	M/S Vijay brothers gwalior	\N	\N	2026-08-21 07:56:01.723
189	77	U clip	2022-01-25	\N	\N	15.0000	30.0000	\N	\N	\N	\N	Received from admission cell RJIT vide letter no. nil duted	\N	\N	2026-08-21 07:56:01.723
190	78	Stapler pin no.10 ( small size)	2022-01-25	\N	\N	6.0000	444.0000	\N	\N	\N	\N	Received from admission cell RJIT vide letter no. nil duted	\N	\N	2026-08-21 07:56:01.723
191	79	Fees deposited Register	2023-02-13	\N	\N	310.0000	3100.0000	10.0000	\N	0.0000	17.0000	Hardik enterprises mahaveer colony dabra dist. Gwalior mp	\N	\N	2026-08-21 07:56:01.723
192	80	Letter head pad ( chief Administratory)	2022-07-13	\N	\N	395.0000	3950.0000	\N	\N	\N	\N	M/S Rishika enterprises	\N	\N	2026-08-21 07:56:01.723
193	81	pen cello nova red /blue/	2021-07-08	\N	\N	4.2500	34.0000	\N	\N	8.0000	22.0000	M/s vinay enterprises infront kanya vidhyala jiwaji ganj lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
194	82	Gum sheet paper A4 size	2022-01-25	\N	\N	\N	\N	\N	\N	0.0000	\N	Received from admission cell vide letter no. nil and dated 19/01/22	\N	\N	2026-08-21 07:56:01.723
195	83	Red pen cello nova	2021-07-08	\N	\N	4.2500	38.2500	\N	\N	9.0000	160.0000	\N	\N	\N	2026-08-21 07:56:01.723
196	84	Calculator ( model no. 555GT) MAKE ORPAT	2020-02-28	\N	\N	400.0000	4000.0000	10.0000	\N	0.0000	5.0000	M/S GK marketing old high court road gwalior mp	\N	\N	2026-08-21 07:56:01.723
197	86	Appreciation card A4 size	2022-06-27	\N	\N	11.2000	5600.0000	500.0000	\N	0.0000	1500.0000	M/S rishik enterprises budh nagar kamoo gwaluior	\N	\N	2026-08-21 07:56:01.723
198	87	Marker pen blue	2024-07-04	\N	\N	20.0000	2000.0000	100.0000	\N	0.0000	335.0000	M/S prasiddhi enterprisers E-16 jagriti nagar gwalior	\N	\N	2026-08-21 07:56:01.723
199	88	Marker pen black	2023-07-04	\N	\N	20.0000	2000.0000	100.0000	\N	0.0000	463.0000	M/S prasiddhi enterprisers E-16 jagriti nagar gwalior	\N	\N	2026-08-21 07:56:01.723
200	89	File cover jambudeep	2019-10-31	\N	\N	8.5000	51.0000	6.0000	\N	0.0000	6.0000	m/s khati department and stationary store TCP tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
201	90	Thumb pin	2019-10-31	\N	\N	12.0000	24.0000	\N	\N	0.0000	\N	m/s khati department and stationary store TCP tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
202	92	Paper cutter big size	2024-07-04	\N	\N	30.0000	1500.0000	\N	\N	0.0000	51.0000	M/s super stationary market old high court road gwalior	\N	\N	2026-08-21 07:56:01.723
203	93	Numbring ink	2019-10-31	\N	\N	30.0000	30.0000	\N	\N	0.0000	\N	M/s lhati department stationary store tcp tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
204	94	Transfering tape cello	2024-07-04	\N	\N	18.0000	1800.0000	100.0000	\N	0.0000	297.0000	M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp	\N	\N	2026-08-21 07:56:01.723
205	95	Glue sheet barcode	2019-10-31	\N	\N	230.0000	1380.0000	\N	\N	0.0000	\N	m/s khati department and stationary store TCP tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
206	96	Note book	2020-06-29	\N	\N	5.0000	2500.0000	\N	\N	0.0000	427.0000	M/S bhagwati stationary lohiya bazar corner lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
207	97	Gum tube ( sticky tube)	2020-01-30	\N	\N	4.3500	8.7000	2.0000	\N	0.0000	2.0000	M/S CPC BSF canteen academy tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
208	98	Transfer certificate	2023-07-07	\N	\N	495.6000	8920.0000	18.0000	\N	0.0000	40.0000	M/S vanya enterprises A-2 indramani nagar goleka mandir gwalior	\N	\N	2026-08-21 07:56:01.723
209	99	CD/DVD marker  permanent marker	2020-02-24	\N	\N	10.0000	200.0000	\N	\N	0.0000	16.0000	m/S bharat enterprises behind old high court gwalior mp	\N	\N	2026-08-21 07:56:01.723
210	100	Stock register	2025-03-15	\N	\N	88.5000	885.0000	10.0000	\N	\N	\N	M/S karuna enterprises near rama market bazar lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
211	101	Computer dusting cloth	2020-02-24	\N	\N	10.0000	1000.0000	100.0000	\N	0.0000	20.0000	m/s khati department and stationary store TCP tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
212	102	Marker white board red	2024-07-04	\N	\N	20.0000	1000.0000	50.0000	\N	0.0000	96.0000	M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp	\N	\N	2026-08-21 07:56:01.723
213	103	white tape 2 inch	2024-07-04	\N	100.0000	35.0000	3500.0000	100.0000	\N	0.0000	159.0000	M/S prasiddhi enterprises E-16 jagriti nagar gwalior mp	\N	\N	2026-08-21 07:56:01.723
214	104	Marker ink red (white board )	2020-02-24	\N	\N	25.0000	250.0000	10.0000	\N	0.0000	8.0000	m/S bharat enterprises behind old high court gwalior mp	\N	\N	2026-08-21 07:56:01.723
215	105	Ball pen use and through red	2020-02-20	\N	\N	2.4000	240.0000	100.0000	\N	0.0000	58.0000	M/S GK marketing old high court road gwalior mp	\N	\N	2026-08-21 07:56:01.723
216	106	Add gel pen green luxar	2020-02-29	\N	\N	10.0000	10.0000	1.0000	\N	0.0000	8.0000	M/S khati department and stationary store TCP Tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
217	107	add gel pen red luxar	2020-02-28	\N	\N	45.0000	450.0000	10.0000	\N	0.0000	6.0000	M/S GK marketing old high court road gwalior mp	\N	\N	2026-08-21 07:56:01.723
218	108	Sharpner	2022-06-30	\N	\N	3.0000	90.0000	30.0000	\N	0.0000	30.0000	M/S bhagwati stationary lohiya bazar corner lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
219	109	Add gel refill (green)	2020-02-28	\N	\N	24.0000	240.0000	10.0000	\N	0.0000	8.0000	M/S GK marketing old high court road gwalior mp	\N	\N	2026-08-21 07:56:01.723
220	110	Paper cutter	2024-07-04	\N	\N	30.0000	1500.0000	\N	\N	0.0000	85.0000	M/S super stationary mart old high court road gwalior	\N	\N	2026-08-21 07:56:01.723
221	111	Stamp pad small size	2020-10-08	\N	\N	25.4200	25.4200	1.0000	\N	0.0000	19.0000	M/S vinay enterprises   in front of kanya vidhyala jiwaji ganj lashkar gwalior mp	\N	\N	2026-08-21 07:56:01.723
222	112	Steel scale 40	2020-02-28	\N	\N	250.0000	500.0000	2.0000	\N	0.0000	2.0000	M/S GK marketing old high court road gwalior mp	\N	\N	2026-08-21 07:56:01.723
223	113	ADM approval / expenditure register	2023-07-07	\N	\N	702.1000	5616.8000	8.0000	\N	0.0000	13.0000	M/S vanya enterprises A-2 indramani nagar gole ka mandir gwalior	\N	\N	2026-08-21 07:56:01.723
224	114	Vehicle log book rrecord	2024-10-18	\N	\N	650.0000	6500.0000	10.0000	\N	0.0000	14.0000	M/S ram enterprises bairagarh TCP Tekanpur	\N	\N	2026-08-21 07:56:01.723
225	115	Pen stand big	2023-06-28	\N	\N	95.0000	95.0000	\N	\N	1.0000	1.0000	M/S khati department and stationary store TCP Tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
226	116	Carbon paper a4 size	2020-06-29	\N	\N	1.7000	8.5000	\N	\N	5.0000	95.0000	M/S khati department and stationary store TCP Tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
227	118	File folder dak	2026-06-13	\N	\N	424.8000	5097.6000	12.0000	\N	0.0000	22.0000	m/s Vijay brothers opp. UCO bank old high court road gwalior lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
228	119	A4 size paper colour	2021-07-22	\N	\N	320.0000	320.0000	\N	\N	0.0000	\N	M/S khati stationary TCP tekanpur gwalior mp	\N	\N	2026-08-21 07:56:01.723
229	120	Flap A4 (Envelope plastic)	2021-10-27	\N	\N	3.0000	1350.0000	450.0000	\N	0.0000	450.0000	M/S bhagwati stationary lohiya bazar corner lashkar gwalior	\N	\N	2026-08-21 07:56:01.723
230	121	Permanent marker black big size	2024-07-04	\N	\N	15.0000	750.0000	\N	\N	0.0000	80.0000	M/S super stationary mart shop no.5 first floor royal plaza old high court road gwalior	\N	\N	2026-08-21 07:56:01.723
231	122	Attendance register for staff	2023-12-18	\N	\N	140.6000	1699.0000	12.0000	\N	0.0000	24.0000	M/s vijay brothers old high court road gwalior	\N	\N	2026-08-21 07:56:01.723
232	123	Book Narendra modi	2022-04-22	\N	\N	9000.0000	9000.0000	1.0000	\N	0.0000	1.0000	M/S Multinational publication and distribution house DS 491/492 new rajender nagar new delhi	\N	\N	2026-08-21 07:56:01.723
233	124	Cash book	2024-10-18	\N	\N	650.0000	6500.0000	10.0000	\N	0.0000	25.0000	M/s ram enterprises bairagarh TCP tekanpur gwalior	\N	\N	2026-08-21 07:56:01.723
234	125	Add  gel refill blue	2024-07-04	\N	50.0000	22.5000	1125.0000	50.0000	\N	0.0000	117.0000	M/S super stationary mart shop no.5 first floor royal plaza old high court road gwalior	\N	\N	2026-08-21 07:56:01.723
\.


--
-- Data for Name: sanitary_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sanitary_items (id, s_no, item_name, dop, bill_number, quantity, quantity_text, quantity_unit, unit_rate, amount, received_quantity, opening_stock, issued, balance, avl_stock_total, dealer_name, remarks, created_at) FROM stdin;
598	1	PHENYL WHITE	2024-06-11	\N	200.0000	200LTR LTR	LTR LTR	36.0000	7200.0000	200.0000	200.0000	0.0000	200.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
599	2	PHENYL WHITE	2024-10-18	\N	90.0000	90LTR	LTR	56.0000	5040.0000	90.0000	90.0000	0.0000	90.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
600	3	PHENYL BLACK	2024-06-11	\N	30.0000	30LTR LTR	LTR LTR	70.0000	2100.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
601	4	PHENYL BLACK	2024-10-18	\N	30.0000	30LTR	LTR	90.0000	2700.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
602	5	ACID	2024-06-11	\N	200.0000	200LTR LTR	LTR LTR	15.0000	3000.0000	200.0000	200.0000	0.0000	200.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
603	6	ACID	2024-10-18	\N	90.0000	90LTR	LTR	35.0000	3150.0000	90.0000	90.0000	0.0000	90.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
604	7	GRASS BROOM(PHOOL JHADU)	2024-06-11	\N	50.0000	50		70.0000	3500.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
605	8	GRASS BROOM(PHOOL JHADU)	2024-10-18	\N	12.0000	12		60.0000	720.0000	12.0000	12.0000	0.0000	12.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
606	9	SEEK BROOM(NARIYAL JHADU)	2024-06-11	\N	100.0000	100		37.0000	3700.0000	100.0000	100.0000	0.0000	100.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
607	10	SEEK BROOM(NARIYAL JHADU)	2024-10-18	\N	12.0000	12		30.0000	360.0000	12.0000	12.0000	0.0000	12.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
608	11	POCHA PAD	2024-06-11	\N	50.0000	50		60.0000	3000.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
609	13	POCHA MOP (POCHAPAD WITH FRAME )	2024-06-11	\N	50.0000	50		180.0000	9000.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
610	14	POCHA MOP (POCHAPAD WITH FRAME )	2024-10-18	\N	8.0000	8		160.0000	1280.0000	8.0000	8.0000	0.0000	8.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
611	15	SURF PACKET	2024-06-11	\N	300.0000	300(100G) (100G)	(100G) (100G)	9.0000	2700.0000	300.0000	300.0000	0.0000	300.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
612	16	SURF PACKET	2024-10-18	\N	80.0000	80		10.0000	800.0000	80.0000	80.0000	0.0000	80.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
613	17	PLASTIC SOOP	2024-06-11	\N	30.0000	30		25.0000	750.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
614	19	NAPTHALENE BALLS(WHITE)	2024-06-11	\N	30.0000	30		150.0000	4500.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
615	20	NAPTHALENE BALLS(WHITE)	2024-10-18	\N	50.0000	50		22.0000	1100.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
616	21	NAPTHALENE BALLS(COLOR)	2024-06-11	\N	10.0000	10KG KG	KG KG	250.0000	2500.0000	10.0000	10.0000	0.0000	10.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
617	23	SEEK STICK (BAMBOO)	2024-06-11	\N	20.0000	20		60.0000	1200.0000	20.0000	20.0000	0.0000	20.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
618	25	TOILET BRUSH	2024-06-11	\N	30.0000	30		50.0000	1500.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
619	26	TOILET BRUSH	2024-10-18	\N	8.0000	8		65.0000	520.0000	8.0000	8.0000	0.0000	8.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
620	27	HANDGLOVES	2024-06-11	\N	20.0000	20 PAIRS PAIRS	PAIRS PAIRS	60.0000	1200.0000	20.0000	20.0000	0.0000	20.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
621	29	SCRUB	2026-06-11	\N	30.0000	30		10.0000	300.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
622	30	SCRUB	2024-10-18	\N	50.0000	50		10.0000	500.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
623	31	HAND POCHA	2024-06-11	\N	50.0000	50		20.0000	1000.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
624	32	HAND POCHA	2024-10-18	\N	10.0000	10		25.0000	250.0000	10.0000	10.0000	0.0000	10.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
625	33	DRAIN POWDER	2024-06-11	\N	10.0000	10KG KG	KG KG	200.0000	2000.0000	10.0000	10.0000	0.0000	10.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
626	34	DUSTBIN PLASTIC	2024-06-11	\N	30.0000	30		200.0000	6000.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
627	36	BLEACHING POWDER	2024-06-11	\N	20.0000	20KG KG	KG KG	40.0000	800.0000	20.0000	20.0000	0.0000	20.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
628	38	BUTCH	2024-06-11	\N	30.0000	30		50.0000	1500.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
629	40	BUCKET SMALL	2024-06-11	\N	30.0000	30		50.0000	1500.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
630	42	IRON WIRE	2024-06-11	\N	3.0000	3KG KG	KG KG	200.0000	600.0000	3.0000	3.0000	0.0000	3.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
631	44	TILES CLEANER	2024-06-11	\N	30.0000	30LTR LTR	LTR LTR	30.0000	900.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
632	46	WIPER	2024-06-11	\N	50.0000	50		160.0000	8000.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
633	48	ROOM FRESHNER	2024-06-11	\N	20.0000	20		85.0000	1700.0000	20.0000	20.0000	0.0000	20.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
634	50	COLIN	2024-06-11	\N	50.0000	50		68.0000	3400.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
635	52	ODONIL	2024-06-11	\N	20.0000	20		50.0000	1000.0000	20.0000	20.0000	0.0000	20.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
636	54	LIFEBUOY	2024-06-11	\N	50.0000	50		9.0000	450.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
637	55	LIFEBUOY	2024-10-18	\N	30.0000	30		42.0000	1260.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
638	56	HARPIC	2024-10-18	\N	6.0000	6		225.0000	1350.0000	6.0000	6.0000	0.0000	6.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
639	58	PLASTIC FATTI	2024-06-11	\N	30.0000	30		200.0000	6000.0000	30.0000	30.0000	0.0000	30.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
640	60	DUSTBIN CLOTH	2024-06-11	\N	50.0000	50		15.0000	750.0000	50.0000	50.0000	0.0000	50.0000	\N	M/S SHAUKARLAL SUKHILAL RASSI BAZAR TOPI BAZAR,GWALIOR	\N	2026-08-21 07:48:58.383
641	62	WEB BRUSH	2024-10-18	\N	5.0000	5		100.0000	500.0000	5.0000	5.0000	0.0000	5.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
642	64	RED HARPIC	2024-12-12	\N	72.0000	72(500ML) (500ML)	(500ML) (500ML)	110.0000	7920.0000	72.0000	72.0000	0.0000	72.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
643	66	DUSTBIN	2024-12-12	\N	6.0000	6		1120.0000	6720.0000	6.0000	6.0000	0.0000	6.0000	\N	M/S MAHESH ENTERPRISES TCP BAIRAGARH TEKANPUR GWAKIOR MP	\N	2026-08-21 07:48:58.383
644	68	nariyal jharu	2023-01-16	\N	30.0000	30		40.0000	1200.0000	30.0000	\N	0.0000	326.0000	\N	m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p)	\N	2026-08-21 07:48:58.383
645	69	Phenyl / phenyl black	2023-01-16	\N	\N	\N	\N	90.0000	1350.0000	15.0000	\N	0.0000	165.0000	\N	m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p)	\N	2026-08-21 07:48:58.383
646	70	Acid	2023-09-27	\N	\N	\N	\N	19.0000	1900.0000	100.0000	\N	0.0000	676.0000	\N	m/s hardik enterprises mahaveer colony dabra gwalior , mp	\N	2026-08-21 07:48:58.383
647	71	Nepthalin ball / Nepthalin ball ( white)	2023-05-08	\N	\N	\N	\N	23.0000	2300.0000	100.0000	\N	0.0000	547.0000	\N	m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p)	\N	2026-08-21 07:48:58.383
648	72	washing powder (surf)	2023-05-08	\N	240.0000	240 pkt pkt	pkt pkt	9.5000	2280.0000	240.0000	\N	0.0000	763.0000	\N	h/s vikas   enterprises gwalior	\N	2026-08-21 07:48:58.383
649	73	odonil	2022-09-27	\N	10.0000	10		50.0000	500.0000	10.0000	\N	0.0000	61.0000	\N	m/s hardik enterprises mahaveer colony dabra gwalior , mp	\N	2026-08-21 07:48:58.383
650	74	pocha pad ( small and big)	2023-01-16	\N	20.0000	20		44.0000	880.0000	20.0000	\N	0.0000	114.0000	\N	m/s divyanshi traders mandir vepass dhimar pura dist gwalior (m.p)	\N	2026-08-21 07:48:58.383
651	75	Hand wash / Hand soap	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	103.0000	\N	\N	\N	2026-08-21 07:48:58.383
652	76	Pocha pad with fram	2021-07-22	\N	25.0000	25		115.0000	2875.0000	25.0000	\N	0.0000	25.0000	\N	M/S sanhagi traders bus stand tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
653	77	Complete pocha pad set with iron rod	2023-06-30	\N	20.0000	20		130.0000	2600.0000	20.0000	\N	0.0000	87.0000	\N	M/S hardik enterprises mahaveer colony dabra	\N	2026-08-21 07:48:58.383
654	78	Pocha frame with cloth  + lock	2023-01-16	\N	10.0000	10		100.0000	1000.0000	10.0000	\N	0.0000	10.0000	\N	Diyanshi traders mandir ke pass dhimarpura dabra dist gwalior	\N	2026-08-21 07:48:58.383
655	79	Dettol soap	2021-07-22	\N	20.0000	20		9.0000	180.0000	20.0000	\N	0.0000	70.0000	\N	M/S hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
656	80	Room freshner	2024-01-17	\N	1.0000	1		102.0000	102.0000	1.0000	\N	0.0000	28.0000	\N	M/S  CSMT dry canteen tekanpur	\N	2026-08-21 07:48:58.383
657	81	Napthalene ball colour	2022-09-27	\N	15.0000	15 pkt pkt	pkt pkt	50.0000	750.0000	15.0000	\N	0.0000	271.0000	\N	M/S hardik enterprises mahaveer colony dabra dist gwalior mp	\N	2026-08-21 07:48:58.383
658	82	Colin	2022-03-03	\N	20.0000	20 btls btls	btls btls	60.0000	1200.0000	20.0000	\N	0.0000	76.0000	\N	M/S hardik enterprises mahaveer colony dabra dist gwalior mp	\N	2026-08-21 07:48:58.383
659	83	Dusting cloth	2022-03-03	\N	100.0000	100		20.0000	2000.0000	100.0000	\N	0.0000	197.0000	\N	M/S hardik entereprises mahaveer colony dabra dist gwalior mp	\N	2026-08-21 07:48:58.383
660	84	Pocha pad cloth	2023-05-08	\N	10.0000	10		20.0000	200.0000	10.0000	\N	0.0000	10.0000	\N	\N	\N	2026-08-21 07:48:58.383
661	85	Wiper	2023-01-16	\N	6.0000	6		108.0000	648.0000	6.0000	\N	0.0000	46.0000	\N	M/S diyanshi traders mandir ke pass dhimarpura dabra	\N	2026-08-21 07:48:58.383
662	86	Toilet brush	2023-01-16	\N	6.0000	6		48.0000	288.0000	6.0000	\N	0.0000	61.0000	\N	M/S diyanshi traders mandir ke pass dhimarpura dabra	\N	2026-08-21 07:48:58.383
663	87	Bamboo stick	2021-07-09	\N	\N	\N	\N	90.0000	90.0000	\N	\N	1.0000	6.0000	\N	M/S maa veshno electric and repair center TCP tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
664	88	colour harpic/toilet flash	2021-07-09	\N	\N	\N	\N	65.0000	195.0000	\N	\N	3.0000	2.0000	\N	M/S vikash enterprises gwalior	\N	2026-08-21 07:48:58.383
665	89	Dustbins 660 ltr	2019-02-25	\N	4.0000	4		14277.0000	57108.0000	4.0000	\N	0.0000	4.0000	\N	\N	\N	2026-08-21 07:48:58.383
666	90	Dustbins  120 ltr capacity	2019-02-25	\N	2.0000	2		3300.0000	6600.0000	2.0000	\N	0.0000	2.0000	\N	\N	\N	2026-08-21 07:48:58.383
667	91	Phool jharu	2023-01-16	\N	10.0000	10		80.0000	800.0000	10.0000	\N	0.0000	203.0000	\N	M/S diyanshi traders mandir ke pass dhimarpura dabra dist gwalior	\N	2026-08-21 07:48:58.383
668	92	Hypochlorite	2022-03-15	\N	5.0000	5 ltr ltr	ltr ltr	60.0000	300.0000	5.0000	\N	0.0000	115.0000	\N	M/S hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
669	93	Senitizer	2022-03-15	\N	5.0000	5 ltr ltr	ltr ltr	76.0000	380.0000	5.0000	\N	0.0000	95.0000	\N	M/S hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
670	94	Mask N95	2020-06-15	\N	50.0000	50		120.0000	6000.0000	50.0000	\N	0.0000	50.0000	\N	M/S balagi enterprises R-1 new kushal nagar padav gwalior mp	\N	2026-08-21 07:48:58.383
671	95	Disposal Mask	2021-03-15	\N	100.0000	100		3.0000	300.0000	100.0000	\N	0.0000	400.0000	\N	M/S maa veshno electric and repair center TCP tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
672	96	Disposal gloves	2021-01-12	\N	100.0000	100		4.0000	400.0000	100.0000	\N	0.0000	300.0000	\N	M/S tirupati enterprises 35 gandhi nagar padav gwalior mp	\N	2026-08-21 07:48:58.383
673	97	Sentizer bottle 500 ml	2020-06-12	\N	40.0000	40		60.0000	2400.0000	40.0000	\N	0.0000	60.0000	\N	M/S Balaji enterprises gwalior mp	\N	2026-08-21 07:48:58.383
674	98	Sentizer stand	2020-06-12	\N	3.0000	3		1500.0000	4500.0000	3.0000	\N	0.0000	3.0000	\N	M/S Balaji enterprises gwalior mp	\N	2026-08-21 07:48:58.383
675	99	Sintex water tank with pedal iron stand	2020-06-16	\N	1.0000	1		\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:48:58.383
676	100	Urinal pipe	2021-01-12	\N	\N	\N	\N	100.0000	1000.0000	10.0000	\N	0.0000	10.0000	\N	M/S Triupati Enterprises j.s gandhi nagar padav gwalior mp	\N	2026-08-21 07:48:58.383
677	101	Net Patti For Kachra	2021-03-12	\N	\N	\N	\N	200.0000	1200.0000	6.0000	\N	0.0000	6.0000	\N	M/S maa veshnow electric and repairing center TCP Tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
678	102	Jala Cleaner	2021-03-15	\N	\N	\N	\N	90.0000	540.0000	6.0000	\N	0.0000	6.0000	\N	M/S maa veshnow electric and repairing center TCP Tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
679	103	White Phynile	2023-09-27	\N	100.0000	100		29.0000	2900.0000	100.0000	\N	0.0000	626.0000	\N	M/S Hardik enterprises mahaveer colony dabra	\N	2026-08-21 07:48:58.383
680	104	Buchhi for pot	2021-03-15	\N	\N	\N	\N	60.0000	240.0000	4.0000	\N	0.0000	4.0000	\N	M/S maa veshnow electric and repairing center TCP Tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
681	105	Plastic Dustpan	2021-03-15	\N	\N	\N	\N	25.0000	250.0000	10.0000	\N	0.0000	10.0000	\N	M/S Maa veshnow electric and repair center TCP tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
682	106	PVC pipe ( 1 inch)	2021-03-19	\N	\N	\N	\N	20.0000	9000.0000	450.0000	\N	0.0000	450.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
683	107	PVC socket ( 11 inch)	2021-03-19	\N	\N	\N	\N	25.0000	525.0000	21.0000	\N	0.0000	21.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
684	108	Lotion For fixing PVC PIPE	2021-03-19	\N	\N	\N	\N	105.0000	315.0000	1.0000	\N	0.0000	1.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
685	109	PVC T ( 11 inch)	2021-03-19	\N	\N	\N	\N	30.0000	30.0000	1.0000	\N	0.0000	1.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
686	110	Valye 40 mm	2021-03-19	\N	\N	\N	\N	285.0000	570.0000	2.0000	\N	0.0000	2.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
687	111	Valye 1 inch	2021-03-19	\N	\N	\N	\N	70.0000	70.0000	1.0000	\N	0.0000	1.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
688	112	Nozzal 1 inch	2021-03-19	\N	\N	\N	\N	25.0000	25.0000	1.0000	\N	0.0000	1.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
689	113	FTA 1 inch	2021-03-19	\N	\N	\N	\N	20.0000	20.0000	1.0000	\N	0.0000	1.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
690	114	M.T.A 1 inch	2021-03-19	\N	\N	\N	\N	20.0000	20.0000	1.0000	\N	0.0000	1.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
691	115	Reduccer  ( 1.5 ''X 0.5 '')	2021-03-19	\N	\N	\N	\N	40.0000	40.0000	1.0000	\N	0.0000	1.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
692	116	MTA ( 1.5 inch )	2021-03-19	\N	\N	\N	\N	105.0000	420.0000	4.0000	\N	0.0000	4.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
693	117	PVC pipe (1.5 inch )	2021-03-19	\N	\N	\N	\N	50.0000	300.0000	6.0000	\N	0.0000	6.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
694	118	Union (1.5 inch )	2021-03-19	\N	\N	\N	\N	110.0000	110.0000	1.0000	\N	0.0000	1.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
695	119	Angle coke steel	2021-03-19	\N	\N	\N	\N	150.0000	300.0000	2.0000	\N	0.0000	2.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
696	120	Tap Face no. 1	2021-03-19	\N	\N	\N	\N	60.0000	300.0000	5.0000	\N	0.0000	5.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
697	121	Tap Face no. 2	2021-03-19	\N	\N	\N	\N	50.0000	750.0000	15.0000	\N	0.0000	15.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
698	122	Plug 0.5 inch	2021-03-19	\N	\N	\N	\N	5.0000	100.0000	20.0000	\N	0.0000	20.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
699	123	Steel tape	2021-03-19	\N	\N	\N	\N	140.0000	280.0000	2.0000	\N	0.0000	2.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
700	124	Tap PVC	2021-03-19	\N	\N	\N	\N	40.0000	120.0000	3.0000	\N	0.0000	3.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
701	125	Kabje ( 5'' )	2021-03-23	\N	\N	\N	\N	27.0000	405.0000	15.0000	\N	0.0000	15.0000	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
702	126	Wooden screw ( 1'' , 1.5'' , 2'' )	2022-03-24	\N	\N	\N	\N	350.0000	350.0000	1.0000	\N	0.0000	\N	\N	M/S Steel Fabrication vaishnav karna mohalla antri gwalior mp	\N	2026-08-21 07:48:58.383
703	127	Deksar Footwall complete	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:48:58.383
704	129	s	2021-03-23	\N	\N	\N	\N	60.0000	900.0000	15.0000	\N	0.0000	15.0000	\N	M/S Hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
705	130	Latches For Almirah 7''	2022-02-04	\N	\N	\N	\N	13.0000	312.0000	24.0000	\N	0.0000	24.0000	\N	M/S gudda sanitary and hardware paints TCP Tekanpur Gwalior MP	\N	2026-08-21 07:48:58.383
706	131	Dettol spry	2021-07-22	\N	\N	\N	\N	156.0000	3120.0000	20.0000	\N	0.0000	50.0000	\N	M/S Hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
707	132	Foam pipe 1.5 inch for garden	2021-03-25	\N	\N	\N	\N	19.0000	9500.0000	500.0000	\N	0.0000	500.0000	\N	M/S Gopal sanitary store Subash Ganj Dabra Gwalior MP	\N	2026-08-21 07:48:58.383
708	133	HDPE PVC pipe ( 1.25 inch ) Suprem ( Black)	2021-03-25	\N	\N	\N	\N	19.0000	9500.0000	500.0000	\N	0.0000	500.0000	\N	M/S Gopal sanitary store Subash Ganj Dabra Gwalior MP	\N	2026-08-21 07:48:58.383
709	134	Polish Yellow ( METAL POLISH )	2021-04-09	\N	\N	\N	\N	40.0000	80.0000	2.0000	\N	0.0000	2.0000	\N	M/S Shri Nath Army store TCP Tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
710	135	Hit Spray	2021-04-09	\N	\N	\N	\N	100.0000	100.0000	1.0000	\N	0.0000	1.0000	\N	M/S Khati stationary Hosiery and general store TCP Tekanpur Gwalior mp	\N	2026-08-21 07:48:58.383
711	136	Phenyl Black	2023-01-16	\N	\N	\N	\N	90.0000	1350.0000	15.0000	\N	0.0000	165.0000	\N	M/S Divyanshi Traders Mandir ke pass Dhimarpura Dabra dist Gwalior	\N	2026-08-21 07:48:58.383
712	137	Lizol ( 200 ml )	2021-07-22	\N	\N	\N	\N	32.0000	640.0000	20.0000	\N	0.0000	40.0000	\N	M/S Hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
713	138	SOAP life boy	2021-01-13	\N	\N	\N	\N	10.0000	2880.0000	288.0000	\N	0.0000	308.0000	\N	M/S Balaji Enterprises Gwalior MP	\N	2026-08-21 07:48:58.383
714	139	Caustic soda powder	2021-01-22	\N	\N	\N	\N	180.0000	360.0000	2.0000	\N	0.0000	2.0000	\N	M/S Ramlal satish kumar TCP Tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
715	140	Handwash	2022-03-15	\N	\N	\N	\N	\N	280.0000	5.0000	\N	0.0000	5.0000	\N	M/S Hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
716	141	Fevicol	2021-11-23	\N	\N	\N	\N	250.0000	500.0000	2.0000	\N	0.0000	2.0000	\N	M/S steel Fabrication Workshop and sanitary TCP Tekanpur Gwalior mp	\N	2026-08-21 07:48:58.383
717	142	Chappa kundi alluminim	2021-11-25	\N	\N	\N	\N	8.0000	200.0000	25.0000	\N	\N	\N	\N	M/S steel Fabrication Workshop and sanitary TCP Tekanpur Gwalior mp	\N	2026-08-21 07:48:58.383
718	143	PVC Gitti	2022-03-24	\N	\N	\N	\N	20.0000	40.0000	2.0000	\N	0.0000	14.0000	\N	M/S steel Fabrication workshop and sanitary bajrang vihar colony TCP Tekanpur Gwalior mp	\N	2026-08-21 07:48:58.383
719	144	Aluminium Washer For Wash basin	2022-02-04	\N	\N	\N	\N	3.5000	70.0000	20.0000	\N	0.0000	20.0000	\N	M/S Gudda Sanitary and hardware paints TCP tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
720	145	M.S socket for wash basin	2022-02-04	\N	\N	\N	\N	7.5000	75.0000	10.0000	\N	0.0000	10.0000	\N	M/S Gudda Sanitary and hardware paints TCP tekanpur gwalior mp	\N	2026-08-21 07:48:58.383
721	146	Chuna	2022-03-15	\N	\N	\N	\N	\N	360.0000	50.0000	\N	0.0000	50.0000	\N	M/S Hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
722	147	Paint Black	2022-01-15	\N	\N	\N	\N	300.0000	600.0000	2.0000	\N	0.0000	2.0000	\N	M/S Hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
723	148	Paint white	2022-01-15	\N	\N	\N	\N	340.0000	680.0000	2.0000	\N	0.0000	2.0000	\N	M/S Hardik enterprises mahaveer colony dabra gwalior mp	\N	2026-08-21 07:48:58.383
724	149	PVC pipe 0.5 '' ( Leyam)	2022-04-27	\N	\N	\N	\N	1000.0000	1000.0000	3.0000	\N	2.0000	1.0000	\N	M/S Ranjana goods and electric general suppliers P.H.E colony Motijheel gwalior mp	\N	2026-08-21 07:48:58.383
725	150	Fogging Machine KB 200 ( KOREA)	2023-01-20	\N	\N	\N	\N	8000.0000	8000.0000	1.0000	\N	0.0000	1.0000	\N	M/S bagwani kitchen garden centre 119,120 garimaarcade shinde ki chawani MLB ROAD GWALIOR	\N	2026-08-21 07:48:58.383
726	151	Kingfog Bayer	2022-02-20	\N	\N	\N	\N	2200.0000	2200.0000	1.0000	\N	0.0000	1.0000	\N	M/S bagwani kitchen garden centre 119,120 garimaarcade shinde ki chawani MLB ROAD GWALIOR	\N	2026-08-21 07:48:58.383
\.


--
-- Name: ApprovalSequence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ApprovalSequence_id_seq"', 35, true);


--
-- Name: ApprovalStep_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ApprovalStep_id_seq"', 29, true);


--
-- Name: InventoryItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."InventoryItem_id_seq"', 1705, true);


--
-- Name: InventorySubcategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."InventorySubcategory_id_seq"', 129, true);


--
-- Name: IssueLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."IssueLog_id_seq"', 9, true);


--
-- Name: Notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 117, true);


--
-- Name: StockAdjustment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StockAdjustment_id_seq"', 2, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."User_id_seq"', 78, true);


--
-- Name: electrical_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.electrical_items_id_seq', 350, true);


--
-- Name: electrical_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.electrical_orders_id_seq', 164, true);


--
-- Name: electrical_sub_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.electrical_sub_items_id_seq', 164, true);


--
-- Name: inventory_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_items_id_seq', 234, true);


--
-- Name: sanitary_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sanitary_items_id_seq', 726, true);


--
-- Name: ApprovalSequence ApprovalSequence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalSequence"
    ADD CONSTRAINT "ApprovalSequence_pkey" PRIMARY KEY (id);


--
-- Name: ApprovalStep ApprovalStep_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalStep"
    ADD CONSTRAINT "ApprovalStep_pkey" PRIMARY KEY (id);


--
-- Name: InventoryCategory InventoryCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryCategory"
    ADD CONSTRAINT "InventoryCategory_pkey" PRIMARY KEY (id);


--
-- Name: InventoryItem InventoryItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_pkey" PRIMARY KEY (id);


--
-- Name: InventorySubcategory InventorySubcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventorySubcategory"
    ADD CONSTRAINT "InventorySubcategory_pkey" PRIMARY KEY (id);


--
-- Name: IssueLog IssueLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IssueLog"
    ADD CONSTRAINT "IssueLog_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceCategory MaintenanceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceCategory"
    ADD CONSTRAINT "MaintenanceCategory_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceHistory MaintenanceHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceHistory"
    ADD CONSTRAINT "MaintenanceHistory_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceUnit MaintenanceUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceUnit"
    ADD CONSTRAINT "MaintenanceUnit_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: StockAdjustment StockAdjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockAdjustment"
    ADD CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: electrical_items electrical_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.electrical_items
    ADD CONSTRAINT electrical_items_pkey PRIMARY KEY (id);


--
-- Name: electrical_orders electrical_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.electrical_orders
    ADD CONSTRAINT electrical_orders_pkey PRIMARY KEY (id);


--
-- Name: electrical_sub_items electrical_sub_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.electrical_sub_items
    ADD CONSTRAINT electrical_sub_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: sanitary_items sanitary_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sanitary_items
    ADD CONSTRAINT sanitary_items_pkey PRIMARY KEY (id);


--
-- Name: InventoryCategory_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "InventoryCategory_name_key" ON public."InventoryCategory" USING btree (name);


--
-- Name: InventorySubcategory_categoryId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "InventorySubcategory_categoryId_name_key" ON public."InventorySubcategory" USING btree ("categoryId", name);


--
-- Name: MaintenanceCategory_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MaintenanceCategory_name_key" ON public."MaintenanceCategory" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: electrical_items_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX electrical_items_name_key ON public.electrical_items USING btree (name);


--
-- Name: electrical_sub_items_itemId_variant_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "electrical_sub_items_itemId_variant_key" ON public.electrical_sub_items USING btree ("itemId", variant);


--
-- Name: ApprovalStep ApprovalStep_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalStep"
    ADD CONSTRAINT "ApprovalStep_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ApprovalStep ApprovalStep_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalStep"
    ADD CONSTRAINT "ApprovalStep_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventorySubcategory InventorySubcategory_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventorySubcategory"
    ADD CONSTRAINT "InventorySubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."InventoryCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IssueLog IssueLog_issuedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IssueLog"
    ADD CONSTRAINT "IssueLog_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MaintenanceHistory MaintenanceHistory_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceHistory"
    ADD CONSTRAINT "MaintenanceHistory_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."MaintenanceUnit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_placedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_placedById_fkey" FOREIGN KEY ("placedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: electrical_orders electrical_orders_subItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.electrical_orders
    ADD CONSTRAINT "electrical_orders_subItemId_fkey" FOREIGN KEY ("subItemId") REFERENCES public.electrical_sub_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: electrical_sub_items electrical_sub_items_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.electrical_sub_items
    ADD CONSTRAINT "electrical_sub_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.electrical_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict QZr9YEExTYYmQrtg4lCjJUoSXqlwPM8sklADHifaKs4bPwrbSIv0IhZe5hweoJt

