DROP TABLE IF EXISTS cash_card;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id       BIGSERIAL PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(20)  NOT NULL DEFAULT 'USER'
);

CREATE TABLE cash_card (
    id     BIGSERIAL PRIMARY KEY,
    amount DOUBLE PRECISION NOT NULL,
    owner  VARCHAR(50) NOT NULL REFERENCES users(username)
);

-- Verified BCrypt hashes
-- Rafail  -> rafail123
-- Michael -> michael456
-- admin   -> admin123
INSERT INTO users (username, password, role) VALUES
    ('Rafail', '$2a$10$cDxxERQPtnRrFDH59I0a/OZYh43SEDy2lYjNt3Q2q5t8BIXSvnYAW', 'USER'),
    ('Michael', '$2a$10$xz71N1tlZdE31SFiczA8qeHdSy8prIgtjTjYvxASVUUPTvTjFE0Lm', 'USER'),
    ('admin',  '$2a$10$lS9e9Ng7WdBrkwFXJ8dU3OW1kttIGgOaqBIehsq7ZsgeUqJy/HFMW', 'ADMIN');

INSERT INTO cash_card (amount, owner) VALUES
    (123.45, 'Rafail'),
    (1.00,   'Rafail'),
    (150.00, 'Michael'),
    (200.00, 'Michael');
