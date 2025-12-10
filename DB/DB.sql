CREATE TABLE IF NOT EXISTS `Users` (
	`ID` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`Name` VARCHAR(255) NOT NULL,
	`Email` VARCHAR(255) NOT NULL UNIQUE,
	`Password` VARCHAR(255) NOT NULL,
	`Birth_Date` DATE NOT NULL,
	`is_Admin` BOOLEAN NOT NULL,
	PRIMARY KEY(`ID`)
);


CREATE TABLE IF NOT EXISTS `Borrow` (
	`ID` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`Book_ID` INTEGER NOT NULL,
	`User_ID` INTEGER NOT NULL,
	`fine_per_day` DOUBLE NOT NULL,
	`borrow_date` DATE NOT NULL,
	`expected_return_date` DATE NOT NULL,
	`actual_return_date` DATE,
	PRIMARY KEY(`ID`)
);


CREATE TABLE IF NOT EXISTS `Books` (
	`ID` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`Name` VARCHAR(255) NOT NULL UNIQUE,
	`Category_ID` INTEGER NOT NULL,
	`Available_Copies` INTEGER NOT NULL,
	`Img_URL` VARCHAR(255),
	`Author_ID` INTEGER NOT NULL,
	PRIMARY KEY(`ID`)
);


CREATE TABLE IF NOT EXISTS `Authors` (
	`ID` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`Name` VARCHAR(255) NOT NULL,
	`About` VARCHAR(255),
	PRIMARY KEY(`ID`)
);


CREATE TABLE IF NOT EXISTS `Categories` (
	`ID` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`Name` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`ID`)
);


CREATE TABLE IF NOT EXISTS `Reserve` (
	`ID` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`User_ID` INTEGER NOT NULL,
	`Book_ID` INTEGER NOT NULL,
	`reservation_date` DATE NOT NULL,
	`book_availble_date` DATE,
	`is_reservation_done` BOOLEAN NOT NULL DEFAULT false,
	PRIMARY KEY(`ID`)
);


ALTER TABLE `Books`
ADD FOREIGN KEY(`Category_ID`) REFERENCES `Categories`(`ID`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Borrow`
ADD FOREIGN KEY(`Book_ID`) REFERENCES `Books`(`ID`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Borrow`
ADD FOREIGN KEY(`User_ID`) REFERENCES `Users`(`ID`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Reserve`
ADD FOREIGN KEY(`Book_ID`) REFERENCES `Books`(`ID`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Reserve`
ADD FOREIGN KEY(`User_ID`) REFERENCES `Users`(`ID`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Books`
ADD FOREIGN KEY(`Author_ID`) REFERENCES `Authors`(`ID`)
ON UPDATE NO ACTION ON DELETE NO ACTION;

-- ============================
-- 1) CATEGORIES
-- ============================
INSERT INTO Categories (Name) VALUES
('Fantasy'),
('Science Fiction'),
('Mystery'),
('History'),
('Self-Help'),
('Programming');

-- ============================
-- 2) AUTHORS
-- ============================
INSERT INTO Authors (Name, About) VALUES
('J.K. Rowling', 'British author best known for Harry Potter series'),
('George R.R. Martin', 'American novelist, author of A Song of Ice and Fire'),
('Agatha Christie', 'English mystery novelist'),
('Yuval Noah Harari', 'Author of Sapiens'),
('Robert C. Martin', 'Author of Clean Code');

-- ============================
-- 3) USERS
-- ============================
INSERT INTO Users (Name, Email, Password, Birth_Date, is_Admin) VALUES
('Admin User', 'admin@library.com', 'admin123', '1990-01-01', 1),
('Ahmed Ali', 'ahmed@example.com', 'pass123', '2001-05-12', 0),
('Sara Mohamed', 'sara@example.com', 'pass123', '1998-09-23', 0),
('Omar Hassan', 'omar@example.com', 'pass123', '1995-11-03', 0),
('Mona Adel', 'mona@example.com', 'pass123', '2000-07-18', 0);

-- ============================
-- 4) BOOKS
-- ============================
INSERT INTO Books (Name, Category_ID, Available_Copies, Img_URL, Author_ID) VALUES
('Harry Potter and the Sorcerer''s Stone', 1, 5, 'https://example.com/hp1.jpg', 1),
('A Game of Thrones', 1, 3, 'https://example.com/got1.jpg', 2),
('Murder on the Orient Express', 3, 4, 'https://example.com/murder.jpg', 3),
('Sapiens: A Brief History of Humankind', 4, 2, 'https://example.com/sapiens.jpg', 4),
('Clean Code', 6, 6, 'https://example.com/cleancode.jpg', 5);

-- ============================
-- 5) BORROW RECORDS
-- Includes:
-- - ON-TIME return
-- - LATE returns
-- - Still NOT returned
-- ============================

-- Borrow 1: Still NOT returned (late)
INSERT INTO Borrow (Book_ID, User_ID, fine_per_day, borrow_date, expected_return_date, actual_return_date)
VALUES (1, 2, 5, '2025-01-01', '2025-01-14', NULL);

-- Borrow 2: Returned ON TIME
INSERT INTO Borrow (Book_ID, User_ID, fine_per_day, borrow_date, expected_return_date, actual_return_date)
VALUES (3, 3, 3, '2025-01-05', '2025-01-15', '2025-01-14');

-- Borrow 3: Returned LATE (5 days late)
INSERT INTO Borrow (Book_ID, User_ID, fine_per_day, borrow_date, expected_return_date, actual_return_date)
VALUES (5, 4, 4, '2025-01-03', '2025-01-10', '2025-01-15');

-- Borrow 4: Returned LATE (2 days late)
INSERT INTO Borrow (Book_ID, User_ID, fine_per_day, borrow_date, expected_return_date, actual_return_date)
VALUES (2, 5, 6, '2025-01-08', '2025-01-18', '2025-01-20');

-- Borrow 5: Still NOT returned (overdue)
INSERT INTO Borrow (Book_ID, User_ID, fine_per_day, borrow_date, expected_return_date, actual_return_date)
VALUES (4, 3, 5, '2025-01-02', '2025-01-12', NULL);
