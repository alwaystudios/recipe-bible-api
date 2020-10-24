CREATE ROLE readonlyrole;

GRANT USAGE ON SCHEMA public TO readonlyrole;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonlyrole;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO readonlyrole;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonlyrole;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO readonlyrole;
GRANT CONNECT ON DATABASE recipebible TO readonlyrole;