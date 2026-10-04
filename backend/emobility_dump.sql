--
-- PostgreSQL database dump
--

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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

SET default_tablespace = '';
SET default_table_access_method = heap;

CREATE TABLE public.cameras (
    camera_id integer NOT NULL,
    location character varying(100),
    latitude numeric(10,7),
    longitude numeric(10,7)
);

CREATE SEQUENCE public.cameras_camera_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.cameras_camera_id_seq OWNED BY public.cameras.camera_id;

CREATE TABLE public.owners (
    owner_id integer NOT NULL,
    full_name character varying(100),
    nic character varying(20),
    email character varying(100),
    phone character varying(15),
    address text
);

CREATE SEQUENCE public.owners_owner_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.owners_owner_id_seq OWNED BY public.owners.owner_id;

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    ticket_id integer,
    payment_method character varying(30),
    payment_date date,
    amount numeric(10,2)
);

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;

CREATE TABLE public.tickets (
    ticket_id integer NOT NULL,
    violation_id integer,
    amount numeric(10,2),
    issue_date date,
    due_date date,
    status character varying(20)
);

CREATE SEQUENCE public.tickets_ticket_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.tickets_ticket_id_seq OWNED BY public.tickets.ticket_id;

CREATE TABLE public.vehicles (
    vehicle_id integer NOT NULL,
    owner_id integer,
    plate_number character varying(20),
    model character varying(50),
    color character varying(20),
    year integer
);

CREATE SEQUENCE public.vehicles_vehicle_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.vehicles_vehicle_id_seq OWNED BY public.vehicles.vehicle_id;

CREATE TABLE public.violations (
    violation_id integer NOT NULL,
    vehicle_id integer,
    camera_id integer,
    speed_detected integer,
    speed_limit integer,
    violation_time timestamp without time zone
);

CREATE SEQUENCE public.violations_violation_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.violations_violation_id_seq OWNED BY public.violations.violation_id;

ALTER TABLE ONLY public.cameras ALTER COLUMN camera_id SET DEFAULT nextval('public.cameras_camera_id_seq'::regclass);
ALTER TABLE ONLY public.owners ALTER COLUMN owner_id SET DEFAULT nextval('public.owners_owner_id_seq'::regclass);
ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);
ALTER TABLE ONLY public.tickets ALTER COLUMN ticket_id SET DEFAULT nextval('public.tickets_ticket_id_seq'::regclass);
ALTER TABLE ONLY public.vehicles ALTER COLUMN vehicle_id SET DEFAULT nextval('public.vehicles_vehicle_id_seq'::regclass);
ALTER TABLE ONLY public.violations ALTER COLUMN violation_id SET DEFAULT nextval('public.violations_violation_id_seq'::regclass);

INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (1, 'Kottawa', 6.8412000, 79.9654000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (2, 'Kadawatha', 7.0012000, 79.9498000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (3, 'Gelanigama', 6.7345000, 80.0234000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (4, 'Dodangoda', 6.5623000, 80.0345000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (5, 'Welipenna', 6.4234000, 80.0678000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (6, 'Kurundugahahetekma', 6.2567000, 80.1234000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (7, 'Baddegama', 6.1876000, 80.1765000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (8, 'Pinnaduwa', 6.0534000, 80.2167000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (9, 'Imaduwa', 6.0321000, 80.3012000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (10, 'Kokmaduwa', 6.0123000, 80.3345000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (11, 'Godagama', 6.8567000, 79.9789000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (12, 'Athurugiriya', 6.8778000, 79.9987000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (13, 'Maharagama', 6.8489000, 79.9267000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (14, 'Matara', 5.9549000, 80.5550000);
INSERT INTO public.cameras (camera_id, location, latitude, longitude) VALUES (15, 'Galle', 6.0535000, 80.2200000);

INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (1, 'Nimal Perera', '991234567V', 'nimal@gmail.com', 0711111111, 'Colombo');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (2, 'Kamal Silva', '981234568V', 'kamal@gmail.com', 0722222222, 'Kandy');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (3, 'Sunil Fernando', '971234569V', 'sunil@gmail.com', 0733333333, 'Galle');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (4, 'Amali Perera', '961234570V', 'amali@gmail.com', 0744444444, 'Matara');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (5, 'Saman Kumara', '951234571V', 'saman@gmail.com', 0755555555, 'Kurunegala');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (6, 'Kasuni Silva', '941234572V', 'kasuni@gmail.com', 0766666666, 'Jaffna');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (7, 'Ruwan Fernando', '931234573V', 'ruwan@gmail.com', 0777777777, 'Negombo');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (8, 'Nadeesha Perera', '921234574V', 'nadeesha@gmail.com', 0788888888, 'Matale');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (9, 'Chathura Silva', '911234575V', 'chathura@gmail.com', 0799999999, 'Kegalle');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (10, 'Sanduni Perera', '901234576V', 'sanduni@gmail.com', 0700000000, 'Anuradhapura');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (11, 'Tharindu Silva', '891234577V', 'tharindu@gmail.com', 0710000001, 'Polonnaruwa');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (12, 'Nisansala Perera', '881234578V', 'nisansala@gmail.com', 0720000002, 'Kurunegala');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (13, 'Ashan Fernando', '871234579V', 'ashan@gmail.com', 0730000003, 'Gampaha');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (14, 'Sanjeewa Silva', '861234580V', 'sanjeewa@gmail.com', 0740000004, 'Badulla');
INSERT INTO public.owners (owner_id, full_name, nic, email, phone, address) VALUES (15, 'Dilani Perera', '851234581V', 'dilani@gmail.com', 0750000005, 'Ratnapura');

INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (1, 1, 'Credit Card', '2026-08-02', 3500.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (2, 2, 'Debit Card', '2026-08-02', 3000.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (3, 3, 'Bank Transfer', '2026-08-03', 4000.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (4, 4, 'Credit Card', '2026-08-03', 2500.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (5, 5, 'Debit Card', '2026-08-04', 4500.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (6, 6, 'Bank Transfer', '2026-08-04', 3200.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (7, 7, 'Credit Card', '2026-08-05', 2800.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (8, 8, 'Debit Card', '2026-08-05', 4200.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (9, 9, 'Bank Transfer', '2026-08-06', 5000.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (10, 10, 'Credit Card', '2026-08-06', 3000.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (11, 11, 'Debit Card', '2026-08-07', 4300.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (12, 12, 'Bank Transfer', '2026-08-07', 3100.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (13, 13, 'Credit Card', '2026-08-08', 3900.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (14, 14, 'Debit Card', '2026-08-08', 2700.00);
INSERT INTO public.payments (payment_id, ticket_id, payment_method, payment_date, amount) VALUES (15, 15, 'Bank Transfer', '2026-08-09', 4800.00);

INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (1, 1, 3500.00, '2026-08-01', '2026-08-15', 'Unpaid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (2, 2, 3000.00, '2026-08-01', '2026-08-15', 'Paid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (3, 3, 4000.00, '2026-08-01', '2026-08-15', 'Unpaid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (4, 4, 2500.00, '2026-08-01', '2026-08-15', 'Paid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (5, 5, 4500.00, '2026-08-01', '2026-08-15', 'Unpaid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (6, 6, 3200.00, '2026-08-01', '2026-08-15', 'Paid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (7, 7, 2800.00, '2026-08-01', '2026-08-15', 'Unpaid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (8, 8, 4200.00, '2026-08-01', '2026-08-15', 'Paid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (9, 9, 5000.00, '2026-08-01', '2026-08-15', 'Unpaid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (10, 10, 3000.00, '2026-08-01', '2026-08-15', 'Paid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (11, 11, 4300.00, '2026-08-01', '2026-08-15', 'Unpaid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (12, 12, 3100.00, '2026-08-01', '2026-08-15', 'Paid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (13, 13, 3900.00, '2026-08-01', '2026-08-15', 'Unpaid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (14, 14, 2700.00, '2026-08-01', '2026-08-15', 'Paid');
INSERT INTO public.tickets (ticket_id, violation_id, amount, issue_date, due_date, status) VALUES (15, 15, 4800.00, '2026-08-01', '2026-08-15', 'Unpaid');

INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (1, 1, 'WP CAB 4521', 'Toyota Aqua', 'White', 2019);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (2, 2, 'SP KY 3390', 'Suzuki Wagon R', 'Blue', 2021);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (3, 3, 'WP BBC 112', 'Honda Fit', 'Black', 2020);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (4, 4, 'NW KY 9080', 'Toyota Prius', 'Silver', 2018);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (5, 5, 'CP AB 1234', 'Nissan Leaf', 'Red', 2022);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (6, 6, 'WP CAB 4522', 'Toyota Aqua', 'White', 2020);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (7, 7, 'SP KY 3391', 'Suzuki Alto', 'Blue', 2021);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (8, 8, 'WP BBC 113', 'Honda Vezel', 'Black', 2022);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (9, 9, 'NW KY 9081', 'Toyota Premio', 'Silver', 2019);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (10, 10, 'CP AB 1235', 'Nissan Sunny', 'Red', 2020);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (11, 11, 'WP CAB 4523', 'Toyota Axio', 'White', 2018);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (12, 12, 'SP KY 3392', 'Suzuki Swift', 'Blue', 2021);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (13, 13, 'WP BBC 114', 'Honda Grace', 'Black', 2019);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (14, 14, 'NW KY 9082', 'Toyota Yaris', 'Silver', 2020);
INSERT INTO public.vehicles (vehicle_id, owner_id, plate_number, model, color, year) VALUES (15, 15, 'CP AB 1236', 'Nissan X-Trail', 'Red', 2022);

INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (1, 1, 1, 125, 100, '2026-08-01 10:15:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (2, 2, 2, 118, 100, '2026-08-01 10:20:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (3, 3, 3, 130, 100, '2026-08-01 10:25:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (4, 4, 4, 115, 100, '2026-08-01 10:30:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (5, 5, 5, 140, 100, '2026-08-01 10:35:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (6, 6, 6, 128, 100, '2026-08-01 10:40:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (7, 7, 7, 122, 100, '2026-08-01 10:45:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (8, 8, 8, 135, 100, '2026-08-01 10:50:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (9, 9, 9, 145, 100, '2026-08-01 10:55:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (10, 10, 10, 120, 100, '2026-08-01 11:00:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (11, 11, 11, 138, 100, '2026-08-01 11:05:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (12, 12, 12, 124, 100, '2026-08-01 11:10:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (13, 13, 13, 133, 100, '2026-08-01 11:15:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (14, 14, 14, 119, 100, '2026-08-01 11:20:00');
INSERT INTO public.violations (violation_id, vehicle_id, camera_id, speed_detected, speed_limit, violation_time) VALUES (15, 15, 15, 142, 100, '2026-08-01 11:25:00');

SELECT pg_catalog.setval('public.cameras_camera_id_seq', 15, true);
SELECT pg_catalog.setval('public.owners_owner_id_seq', 15, true);
SELECT pg_catalog.setval('public.payments_payment_id_seq', 15, true);
SELECT pg_catalog.setval('public.tickets_ticket_id_seq', 15, true);
SELECT pg_catalog.setval('public.vehicles_vehicle_id_seq', 30, true);
SELECT pg_catalog.setval('public.violations_violation_id_seq', 15, true);

ALTER TABLE ONLY public.cameras ADD CONSTRAINT cameras_pkey PRIMARY KEY (camera_id);
ALTER TABLE ONLY public.owners ADD CONSTRAINT owners_pkey PRIMARY KEY (owner_id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);
ALTER TABLE ONLY public.tickets ADD CONSTRAINT tickets_pkey PRIMARY KEY (ticket_id);
ALTER TABLE ONLY public.vehicles ADD CONSTRAINT vehicles_pkey PRIMARY KEY (vehicle_id);
ALTER TABLE ONLY public.violations ADD CONSTRAINT violations_pkey PRIMARY KEY (violation_id);

ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(ticket_id);
ALTER TABLE ONLY public.tickets ADD CONSTRAINT tickets_violation_id_fkey FOREIGN KEY (violation_id) REFERENCES public.violations(violation_id);
ALTER TABLE ONLY public.vehicles ADD CONSTRAINT vehicles_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owners(owner_id);
ALTER TABLE ONLY public.violations ADD CONSTRAINT violations_camera_id_fkey FOREIGN KEY (camera_id) REFERENCES public.cameras(camera_id);
ALTER TABLE ONLY public.violations ADD CONSTRAINT violations_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(vehicle_id);
