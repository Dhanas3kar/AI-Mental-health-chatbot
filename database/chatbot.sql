-- Active: 1741787346355@@localhost@3306@AIchatbot
CREATE DATABASE aichatbot;
USE aichatbot;
CREATE TABLE chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_message TEXT NOT NULL,
    bot_response TEXT
);
