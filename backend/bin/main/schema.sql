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
INSERT INTO users (username, password, role) VALUES
    ('Rafail', '$2a$10$p4Mq4YMmYVAB62H7CyqbY.sBlHuto8gSA4LJkVQKutTbB1UTr6y1a', 'USER'),
    ('Michael', '$2a$10$gIyOC/oMypcyDn7iOGpUQOlG.DUfxFhfqS7elFoKGVeNSdkau5.ja', 'USER'),
    ('admin',  '$2a$10$9G1mnTLlrYpPM56HWhbvZeyljQ2ddZ9PWsUcoNm7Sjw5S7TlAX2U.', 'ADMIN');

INSERT INTO cash_card (amount, owner) VALUES
    (123.45, 'Rafail'),
    (1.00,   'Rafail'),
    (150.00, 'Michael'),
    (200.00, 'Michael');
