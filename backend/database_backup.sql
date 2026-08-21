--
-- PostgreSQL database dump
--

\restrict wnIs4u7DFTzhaPMsuI2ev40cOzMIR2mKDbcCppnlBhcsZBSABfUa2fD175WAhiL

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: puneetsharma
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO puneetsharma;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: puneetsharma
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ApprovalSequence; Type: TABLE; Schema: public; Owner: puneetsharma
--

CREATE TABLE public."ApprovalSequence" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "position" integer NOT NULL
);


ALTER TABLE public."ApprovalSequence" OWNER TO puneetsharma;

--
-- Name: ApprovalSequence_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public."ApprovalSequence_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ApprovalSequence_id_seq" OWNER TO puneetsharma;

--
-- Name: ApprovalSequence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public."ApprovalSequence_id_seq" OWNED BY public."ApprovalSequence".id;


--
-- Name: ApprovalStep; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."ApprovalStep" OWNER TO puneetsharma;

--
-- Name: ApprovalStep_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public."ApprovalStep_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ApprovalStep_id_seq" OWNER TO puneetsharma;

--
-- Name: ApprovalStep_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public."ApprovalStep_id_seq" OWNED BY public."ApprovalStep".id;


--
-- Name: InventoryCategory; Type: TABLE; Schema: public; Owner: puneetsharma
--

CREATE TABLE public."InventoryCategory" (
    id text NOT NULL,
    name text NOT NULL,
    icon text DEFAULT 'FaBoxes'::text NOT NULL,
    "desc" text DEFAULT ''::text NOT NULL,
    color text DEFAULT 'from-blue-500 to-indigo-600'::text NOT NULL
);


ALTER TABLE public."InventoryCategory" OWNER TO puneetsharma;

--
-- Name: InventoryItem; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."InventoryItem" OWNER TO puneetsharma;

--
-- Name: InventoryItem_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public."InventoryItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."InventoryItem_id_seq" OWNER TO puneetsharma;

--
-- Name: InventoryItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public."InventoryItem_id_seq" OWNED BY public."InventoryItem".id;


--
-- Name: InventorySubcategory; Type: TABLE; Schema: public; Owner: puneetsharma
--

CREATE TABLE public."InventorySubcategory" (
    id integer NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."InventorySubcategory" OWNER TO puneetsharma;

--
-- Name: InventorySubcategory_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public."InventorySubcategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."InventorySubcategory_id_seq" OWNER TO puneetsharma;

--
-- Name: InventorySubcategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public."InventorySubcategory_id_seq" OWNED BY public."InventorySubcategory".id;


--
-- Name: IssueLog; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."IssueLog" OWNER TO puneetsharma;

--
-- Name: IssueLog_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public."IssueLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."IssueLog_id_seq" OWNER TO puneetsharma;

--
-- Name: IssueLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public."IssueLog_id_seq" OWNED BY public."IssueLog".id;


--
-- Name: MaintenanceCategory; Type: TABLE; Schema: public; Owner: puneetsharma
--

CREATE TABLE public."MaintenanceCategory" (
    id text NOT NULL,
    name text NOT NULL,
    icon text DEFAULT 'FaTools'::text NOT NULL
);


ALTER TABLE public."MaintenanceCategory" OWNER TO puneetsharma;

--
-- Name: MaintenanceHistory; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."MaintenanceHistory" OWNER TO puneetsharma;

--
-- Name: MaintenanceUnit; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."MaintenanceUnit" OWNER TO puneetsharma;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."Notification" OWNER TO puneetsharma;

--
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public."Notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Notification_id_seq" OWNER TO puneetsharma;

--
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."Order" OWNER TO puneetsharma;

--
-- Name: StockAdjustment; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."StockAdjustment" OWNER TO puneetsharma;

--
-- Name: StockAdjustment_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public."StockAdjustment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StockAdjustment_id_seq" OWNER TO puneetsharma;

--
-- Name: StockAdjustment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public."StockAdjustment_id_seq" OWNED BY public."StockAdjustment".id;


--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."SystemSettings" OWNER TO puneetsharma;

--
-- Name: User; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public."User" OWNER TO puneetsharma;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO puneetsharma;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: electrical_items; Type: TABLE; Schema: public; Owner: puneetsharma
--

CREATE TABLE public.electrical_items (
    id integer NOT NULL,
    name text NOT NULL,
    "itemCode" text
);


ALTER TABLE public.electrical_items OWNER TO puneetsharma;

--
-- Name: electrical_items_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public.electrical_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.electrical_items_id_seq OWNER TO puneetsharma;

--
-- Name: electrical_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public.electrical_items_id_seq OWNED BY public.electrical_items.id;


--
-- Name: electrical_orders; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public.electrical_orders OWNER TO puneetsharma;

--
-- Name: electrical_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public.electrical_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.electrical_orders_id_seq OWNER TO puneetsharma;

--
-- Name: electrical_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public.electrical_orders_id_seq OWNED BY public.electrical_orders.id;


--
-- Name: electrical_sub_items; Type: TABLE; Schema: public; Owner: puneetsharma
--

CREATE TABLE public.electrical_sub_items (
    id integer NOT NULL,
    "itemId" integer NOT NULL,
    variant text NOT NULL
);


ALTER TABLE public.electrical_sub_items OWNER TO puneetsharma;

--
-- Name: electrical_sub_items_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public.electrical_sub_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.electrical_sub_items_id_seq OWNER TO puneetsharma;

--
-- Name: electrical_sub_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public.electrical_sub_items_id_seq OWNED BY public.electrical_sub_items.id;


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public.inventory_items OWNER TO puneetsharma;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public.inventory_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_items_id_seq OWNER TO puneetsharma;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public.inventory_items_id_seq OWNED BY public.inventory_items.id;


--
-- Name: sanitary_items; Type: TABLE; Schema: public; Owner: puneetsharma
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


ALTER TABLE public.sanitary_items OWNER TO puneetsharma;

--
-- Name: sanitary_items_id_seq; Type: SEQUENCE; Schema: public; Owner: puneetsharma
--

CREATE SEQUENCE public.sanitary_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sanitary_items_id_seq OWNER TO puneetsharma;

--
-- Name: sanitary_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: puneetsharma
--

ALTER SEQUENCE public.sanitary_items_id_seq OWNED BY public.sanitary_items.id;


--
-- Name: ApprovalSequence id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."ApprovalSequence" ALTER COLUMN id SET DEFAULT nextval('public."ApprovalSequence_id_seq"'::regclass);


--
-- Name: ApprovalStep id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."ApprovalStep" ALTER COLUMN id SET DEFAULT nextval('public."ApprovalStep_id_seq"'::regclass);


--
-- Name: InventoryItem id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."InventoryItem" ALTER COLUMN id SET DEFAULT nextval('public."InventoryItem_id_seq"'::regclass);


--
-- Name: InventorySubcategory id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."InventorySubcategory" ALTER COLUMN id SET DEFAULT nextval('public."InventorySubcategory_id_seq"'::regclass);


--
-- Name: IssueLog id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."IssueLog" ALTER COLUMN id SET DEFAULT nextval('public."IssueLog_id_seq"'::regclass);


--
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- Name: StockAdjustment id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."StockAdjustment" ALTER COLUMN id SET DEFAULT nextval('public."StockAdjustment_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: electrical_items id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.electrical_items ALTER COLUMN id SET DEFAULT nextval('public.electrical_items_id_seq'::regclass);


--
-- Name: electrical_orders id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.electrical_orders ALTER COLUMN id SET DEFAULT nextval('public.electrical_orders_id_seq'::regclass);


--
-- Name: electrical_sub_items id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.electrical_sub_items ALTER COLUMN id SET DEFAULT nextval('public.electrical_sub_items_id_seq'::regclass);


--
-- Name: inventory_items id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_items_id_seq'::regclass);


--
-- Name: sanitary_items id; Type: DEFAULT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.sanitary_items ALTER COLUMN id SET DEFAULT nextval('public.sanitary_items_id_seq'::regclass);


--
-- Data for Name: ApprovalSequence; Type: TABLE DATA; Schema: public; Owner: puneetsharma
--

COPY public."ApprovalSequence" (id, "userId", "position") FROM stdin;
34	78	1
35	77	2
\.


--
-- Data for Name: ApprovalStep; Type: TABLE DATA; Schema: public; Owner: puneetsharma
--

COPY public."ApprovalStep" (id, "orderId", "userId", name, role, status, "approvedAt", "position") FROM stdin;
28	PO001	78	Dean (SOW)	Dean Student Welfare	Approved	2026-08-21 08:22:48.003	1
29	PO001	77	Principal	Principal	Approved	2026-08-21 08:23:23.97	2
\.


--
-- Data for Name: InventoryCategory; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Data for Name: InventoryItem; Type: TABLE DATA; Schema: public; Owner: puneetsharma
--

COPY public."InventoryItem" (id, item, category, subcategory, type, stock, price, status, "createdAt", "updatedAt") FROM stdin;
1705	laptop	Electronics	i7	Standard	5	50000	Low	2026-08-21 08:24:20.002	2026-08-21 08:29:14.095
\.


--
-- Data for Name: InventorySubcategory; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Data for Name: IssueLog; Type: TABLE DATA; Schema: public; Owner: puneetsharma
--

COPY public."IssueLog" (id, item, category, subcategory, type, department, faculty, quantity, "issuedById", date, "unitCost") FROM stdin;
9	i7 - Standard	Electronics	i7	Standard	CSE	Yograj Sharma	5	73	2026-08-21 08:28:00	50000
\.


--
-- Data for Name: MaintenanceCategory; Type: TABLE DATA; Schema: public; Owner: puneetsharma
--

COPY public."MaintenanceCategory" (id, name, icon) FROM stdin;
RO	RO (Water Purifiers)	FaTint
AC	Air Conditioners	FaWrench
DG	Diesel Generators	FaTools
\.


--
-- Data for Name: MaintenanceHistory; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Data for Name: MaintenanceUnit; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: puneetsharma
--

COPY public."Order" (id, supplier, item, category, subcategory, type, quantity, "pricePerUnit", status, "orderDate", "receiveDate", department, faculty, "placedById", "placedByName", "createdAt", "updatedAt", "totalAmount", "deliverySlip") FROM stdin;
PO001	test	laptop	Electronics	i7	Standard	10	50000	Received	2026-08-21 08:17:22.062	2026-08-21 08:24:00	Electronics	mr.test	73	Admin	2026-08-21 08:17:22.062	2026-08-21 08:24:19.997	500000	\N
\.


--
-- Data for Name: StockAdjustment; Type: TABLE DATA; Schema: public; Owner: puneetsharma
--

COPY public."StockAdjustment" (id, "itemId", "itemName", "oldQuantity", "newQuantity", reason, "adjustedBy", date) FROM stdin;
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: puneetsharma
--

COPY public."SystemSettings" (id, "lowStockThreshold", "collegeName", "collegeLogo", "collegeAddress", "collegePhone", "collegeEmail", "collegeWebsite") FROM stdin;
1	10	Rustamji Institute of Technology	/rjit_logo.png	123 Campus Lane, Okhla, New Delhi	+91 11 2690 7400	info@rjit.edu.in	www.rjit.edu.in
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: puneetsharma
--

COPY public."User" (id, name, email, password, role, status, permissions, phone, photo, "createdAt", "updatedAt") FROM stdin;
78	Dean (SOW)	dean@rjit.edu.in	$2a$10$UEBBBSODwVG86fcdC0WEN.1awxf8OcOmP5aFiMY0J832Rj2HcSedu	Dean Student Welfare	Active	{Dashboard,Inventory,"Receive Order","Issue Stock",Reports,Notifications,Maintenance}			2026-08-18 09:02:12.017	2026-08-21 08:18:41.382
73	Admin	admin@rjit.edu.in	$2a$10$s9Gxi0gq22YQuUffjRUan.jH83MPE1NTmseyMIuZ/1tYWtV.Vsw.m	Admin	Active	{Dashboard,Inventory,"Place Order","Receive Order","Issue Stock",Analytics,Reports,Notifications,Users,Settings,Maintenance}			2026-08-18 09:02:11.258	2026-08-18 09:02:11.258
75	Store Officer	store@rjit.edu.in	$2a$10$RzOeLEwhgw3LNbaAToQFt.0NFkMump2m8GAq/YfIJG8xOAbA/ysQO	Purchase Officer	Active	{Dashboard,"Place Order","Receive Order",Reports,Notifications}			2026-08-18 09:02:11.616	2026-08-18 09:02:11.616
77	Principal	principal@rjit.edu.in	$2a$10$iojqmJA7ifwtEemmstrIy..auMUQ1gFVvZc1rMelBLu.E.OP9fR2S	Principal	Active	{Dashboard,Analytics,Reports,Maintenance}			2026-08-18 09:02:11.898	2026-08-21 08:18:18.727
\.


--
-- Data for Name: electrical_items; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Data for Name: electrical_orders; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Data for Name: electrical_sub_items; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Data for Name: sanitary_items; Type: TABLE DATA; Schema: public; Owner: puneetsharma
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
-- Name: ApprovalSequence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public."ApprovalSequence_id_seq"', 35, true);


--
-- Name: ApprovalStep_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public."ApprovalStep_id_seq"', 29, true);


--
-- Name: InventoryItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public."InventoryItem_id_seq"', 1705, true);


--
-- Name: InventorySubcategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public."InventorySubcategory_id_seq"', 129, true);


--
-- Name: IssueLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public."IssueLog_id_seq"', 9, true);


--
-- Name: Notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 117, true);


--
-- Name: StockAdjustment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public."StockAdjustment_id_seq"', 2, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public."User_id_seq"', 78, true);


--
-- Name: electrical_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public.electrical_items_id_seq', 350, true);


--
-- Name: electrical_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public.electrical_orders_id_seq', 164, true);


--
-- Name: electrical_sub_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public.electrical_sub_items_id_seq', 164, true);


--
-- Name: inventory_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public.inventory_items_id_seq', 234, true);


--
-- Name: sanitary_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: puneetsharma
--

SELECT pg_catalog.setval('public.sanitary_items_id_seq', 726, true);


--
-- Name: ApprovalSequence ApprovalSequence_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."ApprovalSequence"
    ADD CONSTRAINT "ApprovalSequence_pkey" PRIMARY KEY (id);


--
-- Name: ApprovalStep ApprovalStep_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."ApprovalStep"
    ADD CONSTRAINT "ApprovalStep_pkey" PRIMARY KEY (id);


--
-- Name: InventoryCategory InventoryCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."InventoryCategory"
    ADD CONSTRAINT "InventoryCategory_pkey" PRIMARY KEY (id);


--
-- Name: InventoryItem InventoryItem_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_pkey" PRIMARY KEY (id);


--
-- Name: InventorySubcategory InventorySubcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."InventorySubcategory"
    ADD CONSTRAINT "InventorySubcategory_pkey" PRIMARY KEY (id);


--
-- Name: IssueLog IssueLog_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."IssueLog"
    ADD CONSTRAINT "IssueLog_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceCategory MaintenanceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."MaintenanceCategory"
    ADD CONSTRAINT "MaintenanceCategory_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceHistory MaintenanceHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."MaintenanceHistory"
    ADD CONSTRAINT "MaintenanceHistory_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceUnit MaintenanceUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."MaintenanceUnit"
    ADD CONSTRAINT "MaintenanceUnit_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: StockAdjustment StockAdjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."StockAdjustment"
    ADD CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: electrical_items electrical_items_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.electrical_items
    ADD CONSTRAINT electrical_items_pkey PRIMARY KEY (id);


--
-- Name: electrical_orders electrical_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.electrical_orders
    ADD CONSTRAINT electrical_orders_pkey PRIMARY KEY (id);


--
-- Name: electrical_sub_items electrical_sub_items_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.electrical_sub_items
    ADD CONSTRAINT electrical_sub_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: sanitary_items sanitary_items_pkey; Type: CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.sanitary_items
    ADD CONSTRAINT sanitary_items_pkey PRIMARY KEY (id);


--
-- Name: InventoryCategory_name_key; Type: INDEX; Schema: public; Owner: puneetsharma
--

CREATE UNIQUE INDEX "InventoryCategory_name_key" ON public."InventoryCategory" USING btree (name);


--
-- Name: InventorySubcategory_categoryId_name_key; Type: INDEX; Schema: public; Owner: puneetsharma
--

CREATE UNIQUE INDEX "InventorySubcategory_categoryId_name_key" ON public."InventorySubcategory" USING btree ("categoryId", name);


--
-- Name: MaintenanceCategory_name_key; Type: INDEX; Schema: public; Owner: puneetsharma
--

CREATE UNIQUE INDEX "MaintenanceCategory_name_key" ON public."MaintenanceCategory" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: puneetsharma
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: electrical_items_name_key; Type: INDEX; Schema: public; Owner: puneetsharma
--

CREATE UNIQUE INDEX electrical_items_name_key ON public.electrical_items USING btree (name);


--
-- Name: electrical_sub_items_itemId_variant_key; Type: INDEX; Schema: public; Owner: puneetsharma
--

CREATE UNIQUE INDEX "electrical_sub_items_itemId_variant_key" ON public.electrical_sub_items USING btree ("itemId", variant);


--
-- Name: ApprovalStep ApprovalStep_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."ApprovalStep"
    ADD CONSTRAINT "ApprovalStep_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ApprovalStep ApprovalStep_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."ApprovalStep"
    ADD CONSTRAINT "ApprovalStep_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventorySubcategory InventorySubcategory_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."InventorySubcategory"
    ADD CONSTRAINT "InventorySubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."InventoryCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IssueLog IssueLog_issuedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."IssueLog"
    ADD CONSTRAINT "IssueLog_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MaintenanceHistory MaintenanceHistory_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."MaintenanceHistory"
    ADD CONSTRAINT "MaintenanceHistory_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."MaintenanceUnit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_placedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_placedById_fkey" FOREIGN KEY ("placedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: electrical_orders electrical_orders_subItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.electrical_orders
    ADD CONSTRAINT "electrical_orders_subItemId_fkey" FOREIGN KEY ("subItemId") REFERENCES public.electrical_sub_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: electrical_sub_items electrical_sub_items_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: puneetsharma
--

ALTER TABLE ONLY public.electrical_sub_items
    ADD CONSTRAINT "electrical_sub_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.electrical_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: puneetsharma
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict wnIs4u7DFTzhaPMsuI2ev40cOzMIR2mKDbcCppnlBhcsZBSABfUa2fD175WAhiL

