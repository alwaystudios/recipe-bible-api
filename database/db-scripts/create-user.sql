CREATE USER readonlyuser WITH ENCRYPTED PASSWORD 'someSecurePassword';
GRANT readonlyrole TO readonlyuser;
