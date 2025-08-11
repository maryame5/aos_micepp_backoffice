INSERT INTO admin (firstname, lastname, email, password, enabled, account_locked)
VALUES('Admin', 'User', 'admi@example.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5uG9zFQv6pY8Zp5l5yX1JZC6Y6F6b5K', true, false)
ON CONFLICT (email) DO NOTHING;