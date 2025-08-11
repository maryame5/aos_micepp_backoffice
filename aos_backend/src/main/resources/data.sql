-- Insert roles into the role table (if not already present)
INSERT INTO role (id, name) VALUES
(1, 'ADMIN'),
(2, 'SUPPORT'),
(3, 'AGENT')
ON CONFLICT (name) DO NOTHING;

-- Insert users into the utilisateur table, omitting id to use auto-increment
--  Log in with ::admin1@example.com and password Temp123!
-- Log in with admin2@example.com and password Secure123!
INSERT INTO utilisateur (
    firstname, 
    lastname, 
    email, 
    phone, 
    matricule, 
    cin, 
    password, 
    account_locked, 
    enabled, 
    using_temporary_password, 
    created_date, 
    updated_date
) VALUES
('Admin', 'One', 'admin1@example.com', '1234567890', 'MAT001', 'CIN001', '$2a$12$jvZ7NIosIS.eA5sX.KO3nO1z6JBQ082OECWKgmSVF23AGgIT3ihQS', false, true, true, '2025-08-10T12:00:00', '2025-08-10T12:00:00'),
('Admin', 'Two', 'admin2@example.com', '0987654321', 'MAT002', 'CIN002', '$2a$12$9b650Ben93ANEv0bXtLF/.KzG1pXY4J9joIyJFnc8ryCZoLe/J1jO', false, true, false, '2025-08-10T12:00:00', '2025-08-10T12:00:00')
ON CONFLICT (email) DO NOTHING;

-- Insert admins into the admin table, using only id (mapped to utilisateur.id)
INSERT INTO admin (id)
SELECT id
FROM utilisateur
WHERE email IN ('admin1@example.com', 'admin2@example.com')
ON CONFLICT (id) DO NOTHING;

-- Assign roles to users in the utilisateur_roles table
INSERT INTO utilisateur_roles (utilisateur_id, role_id)
SELECT u.id, r.id
FROM utilisateur u
CROSS JOIN role r
WHERE u.email IN ('admin1@example.com', 'admin2@example.com')
AND r.name = 'ADMIN'
ON CONFLICT (utilisateur_id, role_id) DO NOTHING;