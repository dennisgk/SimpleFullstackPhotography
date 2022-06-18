# SimpleFullstackPhotography

## What is this project?

This is a very simple template for a photography website. It does not require any user authentication, but it includes admin
accounts and a nice admin panel designed for easily uploading pictures to be automatically resized on the server. The images
in the example are from Lorem Picsum, and they are just place holders.

## What does this project use?

The Simply Fullstack Photography consists of a frontend, React website, and a backend, express website. The two components
mostly use GraphQL to communicate, but they also use other, static CRUD features. Both the frontend and backend 
are written in typescript to avoid confusion. The backend uses mariadb as its database and stores the photos as static
files in the sfp_images directory which the backend can access.

## Setup

### Prerequisites

1. Nodejs
2. NPM
3. MariaDB

### Step by step setup guide

1. Install the prerequisites
    1. This differs from machine to machine
2. Clone the repository to some location on the server
3. Install the node modules for the backend
    1. Navigate to /sfp_backend/ in terminal
    2. Run the command:

```bash
npm install --force
```

4. Install the node modules for the frontend
    1. Navigate to /sfp_frontend/ in terminal
    2. Run the command:

```bash
npm install --force
```

5. Make mariadb easily accessible for node
    1. I would recommend to have your 'root'@'localhost' account for mariadb not require sudo so that node can easily use it
    2. In order to do this, first make sure the mariadb service is running, then follow these commands:

```bash
sudo mysql -u root
```

```sql
DROP USER 'root'@'localhost';
CREATE USER 'root'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

6. Copy the database
    1. Create the sfp_database in mariadb
    2. Copy contents from sfp_database.sql

```bash
mysql -u root
```

```sql
CREATE DATABASE sfp_database;
```

```bash
mysql -u root sfp_database < sfp_database.sql
```

7. Edit the backend photo retrieval location
    1. Edit /sfp_backend/src/PhotoAccess/PhotoRetrieve.ts
    2. Change **imageStoragePath** to the absolute path of sfp_images on your hard drive

8. Edit the name of the website
    1. Edit /sfp_frontend/public/index.html
    2. Change the **SF Photography** in the title tag to whatever you would like
    3. Edit /sfp_frontend/src/Components/FloatingNavbar.tsx
    4. Change the **SF Photography** in the NavbarBrand.Link component in the return function of the react component to whatever you would like

9. Add an admin account

```bash
mysql -u root
```

```sql
USE sfp_database;
INSERT INTO admin_accounts(username, password) VALUES('ADMIN_USERNAME_HERE', 'ADMIN_PASSWORD_HERE');
```

10. Start both the backend and frontend
    1. Navigate to /sfp_backend/ and run 
    2. Navigate to /sfp_frontend/ and run

```bash
npm start
```
