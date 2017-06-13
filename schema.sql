DROP INDEX token_index;
DROP INDEX service_id_index;
DROP INDEX user_id_index;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS oauth_tokens CASCADE;
DROP TABLE IF EXISTS oauth_infos CASCADE;
DROP TABLE IF EXISTS team_users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  token VARCHAR(60) not null,
  image_url VARCHAR(255)
);

CREATE TABLE oauth_tokens (
  id SERIAL PRIMARY KEY,
  service_id VARCHAR(40) NOT NULL,
  user_id INT,
  CONSTRAINT user_id_ref FOREIGN KEY (user_id) REFERENCES users INITIALLY DEFERRED
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name int,
  image_url VARCHAR(255)
);

CREATE TABLE team_users (
  id SERIAL PRIMARY KEY,
  user_id int REFERENCES users,
  team_id int REFERENCES teams
);

CREATE INDEX token_index ON users (token);
CREATE UNIQUE INDEX service_id_index ON oauth_tokens (service_id);
CREATE UNIQUE INDEX email_index ON users (email);
CREATE INDEX user_id_index ON oauth_tokens (user_id);
