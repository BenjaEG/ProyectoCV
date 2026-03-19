CREATE DATABASE IF NOT EXISTS centro_vecinal;
CREATE DATABASE IF NOT EXISTS keycloak;

CREATE USER IF NOT EXISTS 'cv_user'@'%' IDENTIFIED BY 'cv_pass';

GRANT ALL PRIVILEGES ON centro_vecinal.* TO 'cv_user'@'%';
GRANT ALL PRIVILEGES ON keycloak.* TO 'cv_user'@'%';

FLUSH PRIVILEGES;
