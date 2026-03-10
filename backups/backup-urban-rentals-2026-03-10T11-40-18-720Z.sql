--
-- PostgreSQL database dump
--

\restrict HahmAHeQTdar35kTpEzqic6MZa6dln08VpVuIJi0NiUnOUJfbfLi10Uxm4uh3gd

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AccountPayable; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."AccountPayable" (
    id text NOT NULL,
    "rentalId" text NOT NULL,
    type text NOT NULL,
    "beneficiaryName" text NOT NULL,
    "beneficiaryDni" text,
    amount integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AccountPayable" OWNER TO jorge;

--
-- Name: BookingRequest; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."BookingRequest" (
    id text NOT NULL,
    "vehicleId" text,
    "vehicleName" text,
    "clientName" text NOT NULL,
    "clientEmail" text NOT NULL,
    "clientPhone" text NOT NULL,
    "clientAddress" text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    services text,
    status text DEFAULT 'Pendiente'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BookingRequest" OWNER TO jorge;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    dni text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Client" OWNER TO jorge;

--
-- Name: CommercialAgent; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."CommercialAgent" (
    id text NOT NULL,
    name text NOT NULL,
    dni text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CommercialAgent" OWNER TO jorge;

--
-- Name: CompanySettings; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."CompanySettings" (
    id integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    logo text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    "taxId" text NOT NULL,
    website text NOT NULL
);


ALTER TABLE public."CompanySettings" OWNER TO jorge;

--
-- Name: ContactMessage; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."ContactMessage" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'Pendiente'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ContactMessage" OWNER TO jorge;

--
-- Name: DriverPayment; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."DriverPayment" (
    id text NOT NULL,
    "personnelId" text NOT NULL,
    amount integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    concept text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DriverPayment" OWNER TO jorge;

--
-- Name: Expense; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    amount integer NOT NULL,
    "expenseNumber" text,
    description text NOT NULL,
    "categoryId" text NOT NULL,
    "invoiceId" text,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Expense" OWNER TO jorge;

--
-- Name: ExpenseCategory; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."ExpenseCategory" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type text DEFAULT 'Gasto'::text NOT NULL
);


ALTER TABLE public."ExpenseCategory" OWNER TO jorge;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "rentalId" text,
    "clientId" text NOT NULL,
    amount integer NOT NULL,
    "paidAmount" integer DEFAULT 0 NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    "rentalDetails" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO jorge;

--
-- Name: Maintenance; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Maintenance" (
    id text NOT NULL,
    "vehicleId" text NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    cost integer NOT NULL,
    status text NOT NULL,
    type text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Maintenance" OWNER TO jorge;

--
-- Name: Owner; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Owner" (
    id text NOT NULL,
    name text NOT NULL,
    dni text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Owner" OWNER TO jorge;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "receiptId" text NOT NULL,
    "clientId" text NOT NULL,
    "invoiceId" text NOT NULL,
    amount integer NOT NULL,
    "paymentNumber" text,
    date timestamp(3) without time zone NOT NULL,
    method text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Payment" OWNER TO jorge;

--
-- Name: Payroll; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Payroll" (
    id text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "totalAmount" integer NOT NULL,
    status text NOT NULL,
    details text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payroll" OWNER TO jorge;

--
-- Name: Personnel; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Personnel" (
    id text NOT NULL,
    name text NOT NULL,
    dni text NOT NULL,
    phone text NOT NULL,
    email text,
    role text NOT NULL,
    "licenseNumber" text,
    salary integer,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Personnel" OWNER TO jorge;

--
-- Name: Refund; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Refund" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "clientId" text NOT NULL,
    amount integer NOT NULL,
    "refundNumber" text,
    date timestamp(3) without time zone NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'Pendiente'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Refund" OWNER TO jorge;

--
-- Name: Rental; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Rental" (
    id text NOT NULL,
    "vehicleId" text NOT NULL,
    "clientId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "originalEndDate" timestamp(3) without time zone,
    "dailyRate" integer NOT NULL,
    status text NOT NULL,
    "totalAmount" integer,
    "commercialAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Rental" OWNER TO jorge;

--
-- Name: User; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    status text NOT NULL,
    password text DEFAULT '123456'::text NOT NULL,
    avatar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO jorge;

--
-- Name: Vehicle; Type: TABLE; Schema: public; Owner: jorge
--

CREATE TABLE public."Vehicle" (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    range text NOT NULL,
    price integer NOT NULL,
    image text NOT NULL,
    status text NOT NULL,
    plate text NOT NULL,
    year integer NOT NULL,
    ownership text NOT NULL,
    "ownerName" text,
    "ownerDni" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    images text[] DEFAULT ARRAY[]::text[],
    seats integer DEFAULT 5 NOT NULL
);


ALTER TABLE public."Vehicle" OWNER TO jorge;

--
-- Data for Name: AccountPayable; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."AccountPayable" (id, "rentalId", type, "beneficiaryName", "beneficiaryDni", amount, date, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BookingRequest; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."BookingRequest" (id, "vehicleId", "vehicleName", "clientName", "clientEmail", "clientPhone", "clientAddress", "startDate", "endDate", services, status, notes, "createdAt", "updatedAt") FROM stdin;
0eb45155-3dbb-441c-921f-2835ec085216	\N	Honda CR-V 2020	Jorge García Rodríguez	jgarcia9007@outlook.com	+240222726749	Detras del Hotel Banapa	2026-02-01 00:00:00	2026-02-24 00:00:00	{"withDriver":true,"fuel":false,"tolls":true}	Rechazado	\N	2026-02-26 10:21:28.438	2026-02-26 10:22:13.441
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Client" (id, name, email, phone, address, dni, "createdAt", "updatedAt") FROM stdin;
6d3baaa0-17ac-412c-906c-ff3b96aafbb6	Empresa ABC S.R.L.	contacto@empresaabc.com	809-555-0301	Calle Industria 5, Zona Industrial	101-00000-1	2026-02-26 09:20:15.851	2026-02-26 09:20:15.851
49959a82-4905-4107-8cf8-e96331cc5d33	SATGURU TAVELS	satgurutravels@gmail.com	551244774	Malabo, KM 4	12345	2026-03-10 10:20:41.438	2026-03-10 10:20:41.438
4bf2fb2f-f676-4ff3-85f7-28e1cb9e3bfb	RIGWORLD OILFIELD	rigword@gmail.com	555 835 019/222 275 304	segunda planta, Complejo siglo 21	45612	2026-03-10 10:41:10.266	2026-03-10 10:41:10.266
6f809e42-d99b-40bb-9702-e980fd4f63f1	APEX	CD@GMAIL.COM	222209142	Malabo 2, detras de BEAC	1102292	2026-03-10 10:14:08.032	2026-03-10 10:42:54.148
7d2f1ba9-f95d-4eef-97a2-d8bacc44daac	BGFI BANK / SRA ANITA	bgfibank@hotmail.com	222 755 292 /222 267 916	Banapa, edificio GVI	141424	2026-03-10 10:45:37.542	2026-03-10 10:45:37.542
8a07c88d-f682-41e4-ae4f-9403e35cb9f2	Cleto NDONG ASUMU OKOMO / NACIONES UNIDAS	cleto@hhotmail.com	222 130 035	Malabo	100725	2026-03-10 10:48:20.409	2026-03-10 10:48:20.409
\.


--
-- Data for Name: CommercialAgent; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."CommercialAgent" (id, name, dni, phone, email, status, "createdAt", "updatedAt") FROM stdin;
51035cdf-e41d-40f0-924c-b67c3ddeb5a2	Carlos Ventas	001-0000000-3	809-555-0201	carlos.ventas@empresa.com	Activo	2026-02-26 09:20:15.807	2026-02-26 09:20:15.807
9ecb648c-0ab9-45a0-a9b8-7afb142ca6a5	Ana Comercial	001-0000000-4	809-555-0202	ana.comercial@empresa.com	Activo	2026-02-26 09:20:15.812	2026-02-26 09:20:15.812
\.


--
-- Data for Name: CompanySettings; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."CompanySettings" (id, name, logo, address, phone, email, "taxId", website) FROM stdin;
1	UrbanRentals	/uploads/1772803823388-66985869-LOGO.png	Malabo 2, Bioko Norte	+240222090172	contacto@urbanrentals.com	RNC-123456789	http://www.urban-rentals.es
\.


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."ContactMessage" (id, name, email, phone, message, status, "createdAt", "updatedAt") FROM stdin;
42d8f3f6-4033-435f-b347-ffcd9c0c778a	Jorge García	jgarcia9007@outlook.com	+240222726749	Me interesa ofrecer un choche para servicio de terceros	Atendido	2026-02-26 10:23:00.409	2026-02-26 10:23:19.084
\.


--
-- Data for Name: DriverPayment; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."DriverPayment" (id, "personnelId", amount, date, concept, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Expense" (id, date, amount, "expenseNumber", description, "categoryId", "invoiceId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ExpenseCategory; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."ExpenseCategory" (id, name, description, type) FROM stdin;
307b4a69-14a7-4bdc-a5f7-a26fdb3cc867	Mantenimiento	Gasto general de mantenimiento	Gasto
115909a1-960d-4771-8ca7-c55860b92282	Combustible	Gasto general de combustible	Gasto
26df6005-02b8-4ed6-ae5a-1147fd74d421	Seguro	Gasto general de seguro	Gasto
9191fbf5-6892-4a8d-89e6-53e7051fdc6b	Limpieza	Gasto general de limpieza	Gasto
e9c7fdd8-5088-4c14-a64b-21b8b105a2c7	Repuestos	Gasto general de repuestos	Gasto
fb5d3c29-ce62-49b5-bc01-f84bb4c8442a	Publicidad	Gasto general de publicidad	Gasto
5153fa76-2e78-432c-9fc7-014a49a3a8ed	Servicio de Chofer	Ingreso general de servicio de chofer	Ingreso
c1bf11a2-ccd8-4d06-8093-45ca7abb019a	Silla de Bebé	Ingreso general de silla de bebé	Ingreso
0a20c85a-22bb-429f-8f0e-2015c756c444	GPS Adicional	Ingreso general de gps adicional	Ingreso
d6a4ad92-5049-4940-840b-8f5ab61e9028	Entrega a Domicilio	Ingreso general de entrega a domicilio	Ingreso
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Invoice" (id, "invoiceNumber", "rentalId", "clientId", amount, "paidAmount", date, status, "rentalDetails", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Maintenance; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Maintenance" (id, "vehicleId", description, date, cost, status, type, "createdAt", "updatedAt") FROM stdin;
c9362333-f568-4c01-964a-4a504a38d8ec	7dbafd8a-6d64-447c-8170-4e2b3a855f45	cambio de aceite y filtros	2026-03-09 00:00:00	50000	Programado	\N	2026-03-09 10:23:23.433	2026-03-09 10:23:23.433
\.


--
-- Data for Name: Owner; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Owner" (id, name, dni, phone, email, status, "createdAt", "updatedAt") FROM stdin;
b0be1257-d4fa-460b-bcd3-c9830ecbcee6	ROMAN MONSUY	00000456	222200383	antonio26@hotmail.com	Activo	2026-02-27 14:45:03.219	2026-02-27 14:45:03.219
4c469bdc-7af2-4519-b460-fd06924ebf5a	Norberto PRADO	1111230	222274924	norbert12@outlook.es	Activo	2026-02-27 14:47:51.747	2026-02-27 14:47:51.747
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Payment" (id, "receiptId", "clientId", "invoiceId", amount, "paymentNumber", date, method, "createdAt") FROM stdin;
\.


--
-- Data for Name: Payroll; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Payroll" (id, month, year, "totalAmount", status, details, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Personnel; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Personnel" (id, name, dni, phone, email, role, "licenseNumber", salary, status, "createdAt", "updatedAt") FROM stdin;
3a6d8372-0f5d-4d10-9ea8-2801d41e2023	Pedro El Conductor	001-1111111-1	809-555-9001		Conductor	LIC-998877	\N	Activo	2026-02-26 09:20:15.869	2026-02-26 09:20:15.869
056bc918-2bad-422a-aea4-076d81e431de	Manuel Volante	001-1111111-2	809-555-9002		Conductor	LIC-554433	\N	Activo	2026-02-26 09:20:15.874	2026-02-26 09:20:15.874
38ef18b4-d1e8-4f8f-80c6-f8f8240ede61	Laura Secretaria	001-2222222-1	809-555-8001	laura@sgflota.com	Administrativo	\N	25000	Activo	2026-02-26 09:20:15.876	2026-02-26 09:20:15.876
98e65244-fb22-4cdf-bc2e-14585735d671	Roberto Mecánico	001-2222222-2	809-555-8002	taller@sgflota.com	Mecánico	\N	30000	Activo	2026-02-26 09:20:15.878	2026-02-26 09:20:15.878
\.


--
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Refund" (id, "invoiceId", "clientId", amount, "refundNumber", date, reason, status, "createdAt") FROM stdin;
\.


--
-- Data for Name: Rental; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Rental" (id, "vehicleId", "clientId", "startDate", "endDate", "originalEndDate", "dailyRate", status, "totalAmount", "commercialAgent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."User" (id, name, email, role, status, password, avatar, "createdAt", "updatedAt") FROM stdin;
f95e89f6-80c8-454d-aaca-96fac1b49505	Admin Principal	admin@sgflota.com	Admin	Active	$2b$10$ZdyVReFLnYmZr3pXwZl1XOYkHUsx8ZmmHpuROLdR.3k7W0GLTJSbG	\N	2026-02-26 09:20:15.733	2026-02-26 09:20:15.733
3744efbb-9755-44b2-a4e2-2b179862187f	Vendedor Turno Mañana	vendedor@sgflota.com	User	Active	$2b$10$iJYvDXuPbSh8ThmXPwQZse3G8.auywrRH11X7LnDi/2Ys71DGhQTC	\N	2026-02-26 09:20:15.797	2026-02-26 09:20:15.797
822427a4-7d4d-4968-b714-369598d63ad4	Hervé Gontrand Nvomo	nvomo@outlook.es	Admin	Active	$2b$10$lslkm2DYB8X4hY07yMGGS.JFIORz/v6CnPxEzfx1Z3Dr9NQjF9BVi	\N	2026-02-26 10:24:45.019	2026-02-26 10:24:45.019
16321e54-edda-485c-af34-53b98d5632b4	Jorge Garcia	jgarcia9007@outlook.com	Admin	Active	$2b$10$Pp6QahTmiQMgkyWgza/1mOREdKiXqrcQ/rFWvhc2JjpPa2tZ.vPkW	\N	2026-03-03 08:17:43.578	2026-03-03 08:17:43.578
\.


--
-- Data for Name: Vehicle; Type: TABLE DATA; Schema: public; Owner: jorge
--

COPY public."Vehicle" (id, name, type, range, price, image, status, plate, year, ownership, "ownerName", "ownerDni", "createdAt", "updatedAt", images, seats) FROM stdin;
aeca48b2-44b4-4335-a5a8-cbcc8ead34ef	Toyota HIACE 	Gasolina	700	80000	/uploads/1773053280965-737643593-Gemini_Generated_Image_fw75eyfw75eyfw75.png	Disponible	LT-514-AN	2014	Propia			2026-03-05 14:03:17.471	2026-03-09 11:54:53.673	{/uploads/1773053280965-737643593-Gemini_Generated_Image_fw75eyfw75eyfw75.png,/uploads/1773053288865-877603833-Gemini_Generated_Image_mtmf06mtmf06mtmf.png,/uploads/1773053300543-739265452-Gemini_Generated_Image_cdwtl0cdwtl0cdwt.png}	15
20021565-a3c6-441d-b590-515e78063ca7	Toyota HIGHLANDER	Gasolina	650	70000	/uploads/1773055142434-210552031-Gemini_Generated_Image_qoe50dqoe50dqoe5.png	Disponible	AN-114-I	2012	Propia			2026-03-09 11:19:11.25	2026-03-10 10:11:40.843	{/uploads/1773055142434-210552031-Gemini_Generated_Image_qoe50dqoe50dqoe5.png,/uploads/1773055149658-901250630-Gemini_Generated_Image_yjyh0fyjyh0fyjyh.png,/uploads/1773055161061-348007887-Gemini_Generated_Image_9ru43d9ru43d9ru4.png,/uploads/1773137494321-327810171-Gemini_Generated_Image_q9azwxq9azwxq9az.png}	5
e5bcfc1e-784c-412a-8782-cbbf925de8e1	Toyota HILUX	Diésel	1066	120000	/uploads/1773053194162-251285428-Gemini_Generated_Image_ffey5mffey5mffey.png	Disponible	BN-807-P	2026	Propia			2026-03-05 14:10:38.648	2026-03-09 10:47:00.861	{/uploads/1773053194162-251285428-Gemini_Generated_Image_ffey5mffey5mffey.png,/uploads/1773053212524-933740219-Gemini_Generated_Image_8xua6p8xua6p8xua.png}	5
a105e0e6-790f-4620-9115-ee5e4bf469b8	Toyota PRADO	Diésel	750	135000	/uploads/1773053244805-720122057-Gemini_Generated_Image_ij17jiij17jiij17.png	Disponible	LT-469-AL	2023	Propia			2026-03-05 14:44:00.073	2026-03-09 10:47:26.929	{/uploads/1773053244805-720122057-Gemini_Generated_Image_ij17jiij17jiij17.png}	7
6b7e69b5-7e93-4e02-8970-4f724d2cdc7d	Hyundai AVANTE	Gasolina	700	50000	/uploads/1773053333647-86836189-hyundai1.png	Disponible	BN-560-AS	2016	Propia			2026-03-04 10:01:53.299	2026-03-09 10:49:30.165	{/uploads/1773053333647-86836189-hyundai1.png,/uploads/1773053343595-963153735-hyundai3.png,/uploads/1773053349415-141671812-hyundai-2.png,/uploads/1773053359977-485604729-HYUNDAI-INTERIOR.png}	5
7dbafd8a-6d64-447c-8170-4e2b3a855f45	Mitsubishi L200	Diésel	758	100000	/uploads/1773053387515-177200970-Gemini_Generated_Image_vdp37nvdp37nvdp3.png	Disponible	AN-979-J	2022	Propia			2026-03-05 14:30:17.158	2026-03-09 10:50:10.565	{/uploads/1773053387515-177200970-Gemini_Generated_Image_vdp37nvdp37nvdp3.png,/uploads/1773053406047-518067130-Gemini_Generated_Image_ynpkfqynpkfqynpk-(1).png}	5
713c837f-dc09-47f5-a311-5bcdd03acef0	Toyota Corolla 2010	Gasolina	700	40000	/uploads/1773053429159-140689370-Gemini_Generated_Image_wmhpw5wmhpw5wmhp.png	Disponible	WN-294-T	2010	Propia			2026-03-06 11:06:59.856	2026-03-09 11:02:04.009	{/uploads/1773053429159-140689370-Gemini_Generated_Image_wmhpw5wmhpw5wmhp.png,/uploads/1773053434733-144181055-Gemini_Generated_Image_3fc5053fc5053fc5.png,/uploads/1773053460767-650278936-Gemini_Generated_Image_q9azwxq9azwxq9az.png}	5
e0914feb-52d4-44bb-97fe-ff67ca94562a	Hyundai H1 Minibus 	Gasolina	700	80000	/uploads/1773054139368-672917485-Gemini_Generated_Image_i9honui9honui9ho.png	Disponible	LT-904-AL	2016	Propia			2026-03-05 14:24:56.131	2026-03-09 11:02:27.954	{/uploads/1773054139368-672917485-Gemini_Generated_Image_i9honui9honui9ho.png,/uploads/1773054146216-307468932-Gemini_Generated_Image_5auwr55auwr55auw.png}	9
af2f3e6f-1977-40a4-8116-44b2a5b4e52d	Nissan KICKS	Gasolina	550	50000	/uploads/1773054195728-19328016-nissan2.png	Disponible	LT-184-AP	2021	Propia			2026-03-04 09:57:06.684	2026-03-09 11:09:05.377	{/uploads/1773054195728-19328016-nissan2.png,/uploads/1773054535032-791064108-nissan3.png,/uploads/1773054542197-758122955-nissan-kicks1.png}	5
\.


--
-- Name: AccountPayable AccountPayable_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."AccountPayable"
    ADD CONSTRAINT "AccountPayable_pkey" PRIMARY KEY (id);


--
-- Name: BookingRequest BookingRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."BookingRequest"
    ADD CONSTRAINT "BookingRequest_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: CommercialAgent CommercialAgent_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."CommercialAgent"
    ADD CONSTRAINT "CommercialAgent_pkey" PRIMARY KEY (id);


--
-- Name: CompanySettings CompanySettings_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."CompanySettings"
    ADD CONSTRAINT "CompanySettings_pkey" PRIMARY KEY (id);


--
-- Name: ContactMessage ContactMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."ContactMessage"
    ADD CONSTRAINT "ContactMessage_pkey" PRIMARY KEY (id);


--
-- Name: DriverPayment DriverPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."DriverPayment"
    ADD CONSTRAINT "DriverPayment_pkey" PRIMARY KEY (id);


--
-- Name: ExpenseCategory ExpenseCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."ExpenseCategory"
    ADD CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: Maintenance Maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Maintenance"
    ADD CONSTRAINT "Maintenance_pkey" PRIMARY KEY (id);


--
-- Name: Owner Owner_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Owner"
    ADD CONSTRAINT "Owner_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Payroll Payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Payroll"
    ADD CONSTRAINT "Payroll_pkey" PRIMARY KEY (id);


--
-- Name: Personnel Personnel_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Personnel"
    ADD CONSTRAINT "Personnel_pkey" PRIMARY KEY (id);


--
-- Name: Refund Refund_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_pkey" PRIMARY KEY (id);


--
-- Name: Rental Rental_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Rental"
    ADD CONSTRAINT "Rental_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Vehicle Vehicle_pkey; Type: CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY (id);


--
-- Name: Client_dni_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Client_dni_key" ON public."Client" USING btree (dni);


--
-- Name: Client_email_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Client_email_key" ON public."Client" USING btree (email);


--
-- Name: CommercialAgent_dni_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "CommercialAgent_dni_key" ON public."CommercialAgent" USING btree (dni);


--
-- Name: CommercialAgent_email_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "CommercialAgent_email_key" ON public."CommercialAgent" USING btree (email);


--
-- Name: Expense_expenseNumber_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Expense_expenseNumber_key" ON public."Expense" USING btree ("expenseNumber");


--
-- Name: Invoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree ("invoiceNumber");


--
-- Name: Invoice_rentalId_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Invoice_rentalId_key" ON public."Invoice" USING btree ("rentalId");


--
-- Name: Owner_dni_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Owner_dni_key" ON public."Owner" USING btree (dni);


--
-- Name: Owner_email_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Owner_email_key" ON public."Owner" USING btree (email);


--
-- Name: Payment_paymentNumber_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Payment_paymentNumber_key" ON public."Payment" USING btree ("paymentNumber");


--
-- Name: Personnel_dni_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Personnel_dni_key" ON public."Personnel" USING btree (dni);


--
-- Name: Refund_refundNumber_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "Refund_refundNumber_key" ON public."Refund" USING btree ("refundNumber");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: jorge
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: AccountPayable AccountPayable_rentalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."AccountPayable"
    ADD CONSTRAINT "AccountPayable_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES public."Rental"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BookingRequest BookingRequest_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."BookingRequest"
    ADD CONSTRAINT "BookingRequest_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DriverPayment DriverPayment_personnelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."DriverPayment"
    ADD CONSTRAINT "DriverPayment_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES public."Personnel"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Expense Expense_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ExpenseCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Expense Expense_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_rentalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES public."Rental"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Maintenance Maintenance_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Maintenance"
    ADD CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Refund Refund_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Refund Refund_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Rental Rental_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Rental"
    ADD CONSTRAINT "Rental_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Rental Rental_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jorge
--

ALTER TABLE ONLY public."Rental"
    ADD CONSTRAINT "Rental_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO jorge;


--
-- PostgreSQL database dump complete
--

\unrestrict HahmAHeQTdar35kTpEzqic6MZa6dln08VpVuIJi0NiUnOUJfbfLi10Uxm4uh3gd

