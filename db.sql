SET GLOBAL event_scheduler=ON;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    anonym TINYINT NOT NULL DEFAULT 0,
    token BINARY(16) UNIQUE DEFAULT NULL,
    last_request DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS texts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title TEXT NOT NULL,
    text_content TEXT NOT NULL,
    creator INT,
    FOREIGN KEY (creator) REFERENCES users(id)
);

DELIMITER |

CREATE EVENT IF NOT EXISTS clear_db
    ON SCHEDULE
        EVERY 1 MINUTE
    COMMENT 'Disconnect clients who are inactive more than 30 minutes'
    DO
        BEGIN
            UPDATE users
            SET token = NULL
            WHERE last_request < CURRENT_TIMESTAMP - INTERVAL 15 MINUTE;
            DELETE FROM users
            WHERE anonym AND token is NULL;
        END |


CREATE PROCEDURE IF NOT EXISTS create_user (IN username VARCHAR(30), IN user_password VARCHAR(255), IN anonym TINYINT)
    BEGIN
        INSERT INTO users (username, user_password, anonym, last_request)
        VALUES (username, user_password, anonym, CURRENT_TIMESTAMP);
    END |

CREATE FUNCTION IF NOT EXISTS user_exists (user_name VARCHAR(30))
    RETURNS TINYINT
    NOT DETERMINISTIC
    BEGIN
        DECLARE user_exists_result TINYINT DEFAULT 0;
        SELECT 1 INTO user_exists_result FROM users WHERE username = user_name LIMIT 1;
        RETURN user_exists_result;
    END |

CREATE FUNCTION IF NOT EXISTS set_token_from_username (user_name VARCHAR(30))
    RETURNS BINARY(16)
    BEGIN
        SET @new_token = UUID_TO_BIN(UUID());
        UPDATE users
        SET token = @new_token
        WHERE username = user_name;
        RETURN @new_token;
    END |

CREATE FUNCTION IF NOT EXISTS replace_token (old_token BINARY(16))
    RETURNS BINARY(16)
    BEGIN
        SET @new_token = UUID_TO_BIN(UUID());
        UPDATE users
        SET token = new_token
        WHERE token = old_token;
        RETURN @new_token;
    END |

DELIMITER ;