# Library System

## Overview

The Library System is designed to **manage borrowing, returning, and reservation of books efficiently**. It ensures fairness among users, tracks book availability, prioritizes reservations, and maintains accurate records of all books in stock.

---

## Table of Contents

1. [Features](#features)  
2. [Borrowing Process](#borrowing-process)  
3. [Returning Process](#returning-process)  
4. [Reservation Process](#reservation-process)  
5. [Automated Reservation Handling](#automated-reservation-handling)  
6. [Priority Summary](#priority-summary)  
7. [Tech Stack](#tech-stack)  

---

## Features

- Borrow and return books.  
- Reserve books when copies are unavailable.  
- Automatic assignment of books to pending reservations.  
- Hourly background task to handle expired reservations.  
- Ensures fairness and prevents double-booking.  

---

## Borrowing Process

- **Who can borrow:** Any registered user.  
- **Priority:**
  1. Users with reservations (borrow first when the book becomes available).  
  2. Users without reservations (borrow if copies are available).  
- **Restrictions:** Cannot borrow if no copies are available and no reservation exists.  
- **Rules:**
  - Each borrowing has a fixed period (e.g., 14 days).  
  - Late returns may incur fines.  

---

## Returning Process

- **Who can return:** Only users who have borrowed the book.  
- **Steps:**
  1. Record the **actual return date**.  
  2. Increase the **available copies** of the book.  
  3. Check for **pending reservations**:
     - Reserved users are prioritized and the book is held for them.  
     - Remaining copies become available for general borrowing.  

---

## Reservation Process

- **Who can reserve:** Users who want a book with **no available copies**.  
- **Rules:**
  - Cannot reserve a book if copies are available.  
  - Reservations are **first-come, first-served**.  
- **Priority:** Earliest reservation is fulfilled first when a copy becomes available.  
- Reserved copies are temporarily unavailable to other users until borrowed.  

---

## Automated Reservation Handling

The system runs an **hourly automated task** to manage expired and pending reservations.

### Purpose

- Assign returned books to users with reservations.  
- Handle expired reservations not collected within 7 days.  
- Update book availability for general borrowing.  

### Process

1. **Expired reservations:**  
   - Reservations not collected within 7 days are marked as completed/expired.  
2. **Assign to pending reservations:**  
   - Available copies are automatically assigned to the next users in line.  
3. **Return leftover copies:**  
   - Remaining copies from expired reservations are added back to library stock.  

### Benefits

- Ensures reserved books reach the right users.  
- Prevents books from being locked by inactive users.  
- Reduces manual work and maintains accurate availability.  

---

## Priority Summary

| Action  | Priority / Condition                                                                                           |
| ------- | -------------------------------------------------------------------------------------------------------------- |
| Borrow  | 1. Reserved user → 2. Normal user if copies available                                                          |
| Return  | 1. Only borrower can return → 2. Reserved users get returned copy first → 3. Others can borrow remaining copies |
| Reserve | 1. Only if no copies available → 2. Earliest reservation fulfilled first                                     |

---

## Tech Stack

- **Backend:** Node.js + Express  
- **Database:** MySQL  
- **Cron Jobs:** node-cron for automated reservation handling  
- **Middleware:** Authentication and request validation  
- **Environment Management:** dotenv  

---