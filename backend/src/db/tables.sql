-- ============================================================
-- Database: MercadoLibre
-- Description: C2C Marketplace
-- PostgreSQL
-- ============================================================

-- Create database
CREATE DATABASE mercadolibre;

-- Connect to the database
-- In psql:
-- \c mercadolibre


-- ============================================================
-- Table: User
-- ============================================================
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reputation NUMERIC(3,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT ck_user_reputation
        CHECK (reputation >= 0 AND reputation <= 5)
);


-- ============================================================
-- Table: Category
-- ============================================================
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT,

    CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_id)
        REFERENCES category(id)
        ON DELETE SET NULL
);


-- ============================================================
-- Table: Listing
-- ============================================================
CREATE TABLE listing (
    id SERIAL PRIMARY KEY,
    seller_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL,
    category_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_listing_seller
        FOREIGN KEY (seller_id)
        REFERENCES "User"(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_listing_category
        FOREIGN KEY (category_id)
        REFERENCES category(id),

    CONSTRAINT ck_listing_price
        CHECK (price >= 0),

    CONSTRAINT ck_listing_stock
        CHECK (stock >= 0),

    CONSTRAINT ck_listing_status
        CHECK (status IN ('Active', 'Paused', 'Finished'))
);


-- ============================================================
-- Table: Question
-- ============================================================
CREATE TABLE question (
    id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL,
    author_id INT NOT NULL,
    text VARCHAR(500) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_question_listing
        FOREIGN KEY (listing_id)
        REFERENCES listing(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_question_author
        FOREIGN KEY (author_id)
        REFERENCES "User"(id)
);


-- ============================================================
-- Table: Answer
-- ============================================================
CREATE TABLE answer (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL UNIQUE,
    text VARCHAR(500) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_answer_question
        FOREIGN KEY (question_id)
        REFERENCES question(id)
        ON DELETE CASCADE
);


-- ============================================================
-- Table: Purchase
-- ============================================================
CREATE TABLE purchase (
    id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL,
    buyer_id INT NOT NULL,
    quantity INT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_purchase_listing
        FOREIGN KEY (listing_id)
        REFERENCES listing(id),

    CONSTRAINT fk_purchase_buyer
        FOREIGN KEY (buyer_id)
        REFERENCES "User"(id),

    CONSTRAINT ck_purchase_quantity
        CHECK (quantity > 0),

    CONSTRAINT ck_purchase_total
        CHECK (total >= 0),

    CONSTRAINT ck_purchase_status
        CHECK (
            status IN (
                'Pending',
                'Paid',
                'Shipped',
                'Cancelled',
                'Completed'
            )
        )
);


-- ============================================================
-- Table: Rating
-- ============================================================
CREATE TABLE rating (
    id SERIAL PRIMARY KEY,
    purchase_id INT NOT NULL,
    author_id INT NOT NULL,
    receiver_id INT NOT NULL,
    score INT NOT NULL,
    comment VARCHAR(500),

    CONSTRAINT fk_rating_purchase
        FOREIGN KEY (purchase_id)
        REFERENCES purchase(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_rating_author
        FOREIGN KEY (author_id)
        REFERENCES "User"(id),

    CONSTRAINT fk_rating_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES "User"(id),

    CONSTRAINT ck_rating_score
        CHECK (score BETWEEN 1 AND 5),

    CONSTRAINT ck_rating_different_users
        CHECK (author_id <> receiver_id)
);


-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_listing_category
ON listing(category_id);

CREATE INDEX idx_listing_seller
ON listing(seller_id);

CREATE INDEX idx_purchase_buyer
ON purchase(buyer_id);

CREATE INDEX idx_purchase_listing
ON purchase(listing_id);

CREATE INDEX idx_question_listing
ON question(listing_id);

CREATE INDEX idx_question_author
ON question(author_id);

CREATE INDEX idx_rating_receiver
ON rating(receiver_id);

CREATE INDEX idx_rating_purchase
ON rating(purchase_id);