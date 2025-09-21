-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 21, 2025 at 09:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `digital_diary`
--

-- --------------------------------------------------------

--
-- Table structure for table `entries`
--

CREATE TABLE `entries` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `entries`
--

INSERT INTO `entries` (`id`, `title`, `content`, `user_id`, `created_at`, `updated_at`) VALUES
(23, 'test 1', 'working ', 1, '2025-09-20 11:32:35', '2025-09-20 11:32:35'),
(24, 'Assignment ', ' c# \npython ', 1, '2025-09-20 11:32:35', '2025-09-20 11:32:35'),
(25, 'wacha nione ', 'story for shikisha na shell', 1, '2025-09-20 11:32:35', '2025-09-20 11:32:35');

-- --------------------------------------------------------

--
-- Table structure for table `moods`
--

CREATE TABLE `moods` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `mood` varchar(50) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `moods`
--

INSERT INTO `moods` (`id`, `user_id`, `mood`, `date`) VALUES
(1, 1, 'Sad', '2025-04-27 15:42:49'),
(2, 1, 'Happy', '2025-04-27 15:45:01'),
(3, 1, 'Happy', '2025-04-27 16:31:38'),
(4, 1, 'Sad', '2025-04-27 17:18:15'),
(5, 1, 'Sad', '2025-04-27 17:56:14'),
(6, 1, 'Happy', '2025-04-28 09:32:35'),
(7, 1, 'Sad', '2025-04-28 11:18:47'),
(8, 1, 'Angry', '2025-04-28 11:18:55'),
(9, 1, 'Sad', '2025-05-24 15:30:00'),
(11, 1, 'Happy', '2025-05-30 08:02:35'),
(12, 1, 'Sad', '2025-05-30 08:23:47'),
(14, 1, 'Happy', '2025-07-11 09:28:28'),
(15, 1, 'Happy', '2025-07-18 18:26:26'),
(16, 1, 'Happy', '2025-09-20 10:44:29'),
(17, 1, 'happy', '2025-09-20 11:37:52'),
(18, 1, 'neutral', '2025-09-20 11:37:55'),
(19, 1, 'anxious', '2025-09-20 11:38:11'),
(21, 1, 'sad', '2025-09-21 12:30:16');

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `is_favorite` tinyint(1) DEFAULT 0,
  `audio_filename` varchar(255) DEFAULT NULL,
  `audio_duration` int(11) DEFAULT NULL,
  `audio_size` bigint(20) DEFAULT NULL,
  `has_audio` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `audio` longblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`id`, `user_id`, `title`, `content`, `category`, `tags`, `priority`, `is_favorite`, `audio_filename`, `audio_duration`, `audio_size`, `has_audio`, `updated_at`, `created_at`, `audio`) VALUES
(37, 1, 'Audio Note 9/20/2025, 10:24:58 PM', 'Audio recording', 'Audio', 'audio, recording', 'Medium', 0, 'audio_1758396300368.webm', 2, 45698, 1, '2025-09-20 19:25:00', '2025-09-20 19:25:00', NULL),
(39, 1, 'Audio Note 9/21/2025, 2:55:28 PM', 'Audio recording', 'Audio', 'audio, recording', 'Medium', 0, 'audio-1758455730657-707120639.webm', 3, 48596, 1, '2025-09-21 11:55:31', '2025-09-21 11:55:31', NULL),
(40, 1, 'cww', 'wfc  ', 'Finance', 'd', 'Low', 1, NULL, NULL, NULL, 0, '2025-09-21 11:56:50', '2025-09-21 11:56:50', NULL),
(41, 1, 'Audio Note 9/21/2025, 3:13:40 PM', 'Audio recording', 'Audio', 'audio, recording', 'Medium', 0, 'audio-1758456822883-603317382.webm', 3, 61154, 1, '2025-09-21 12:13:43', '2025-09-21 12:13:43', NULL),
(42, 1, 'Audio Note 9/21/2025, 4:19:15 PM', 'Audio recording', 'Audio', 'audio, recording', 'Medium', 0, 'audio-1758460756945-677265486.webm', 2, 37004, 1, '2025-09-21 13:19:17', '2025-09-21 13:19:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `deadline` datetime NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `user_id`, `title`, `description`, `deadline`, `is_completed`) VALUES
(12, 1, 'whats up today 1', 'random testing', '2025-05-30 12:28:00', NULL),
(15, 1, 'Website Deadline ', 'To-Do list web', '2025-07-23 14:49:00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `todos`
--

CREATE TABLE `todos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `text` varchar(255) NOT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expiry_date` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `todos`
--

INSERT INTO `todos` (`id`, `user_id`, `text`, `completed`, `created_at`, `expiry_date`, `is_deleted`, `deleted_at`, `updated_at`) VALUES
(6, 1, 'buy vegetables ', 0, '2025-04-27 17:08:19', NULL, 1, '2025-09-21 13:47:34', '2025-09-21 16:47:35'),
(7, 1, 'go to church ', 0, '2025-04-27 17:08:35', NULL, 0, NULL, '2025-09-21 16:12:47'),
(13, 1, 'Go to shop ', 1, '2025-05-24 16:26:26', NULL, 1, '2025-09-20 12:52:39', '2025-09-20 12:52:39'),
(14, 1, 'what needs to be done ', 1, '2025-09-20 12:46:31', '2025-09-20 19:50:00', 0, NULL, '2025-09-21 18:36:17'),
(15, 1, 'what needs ', 1, '2025-09-20 12:47:14', '2025-09-20 15:48:00', 0, NULL, '2025-09-21 18:36:15'),
(16, 1, 'fbfg', 1, '2025-09-21 15:53:43', '2025-09-21 22:57:00', 0, NULL, '2025-09-21 18:36:13');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `avatar`, `bio`, `join_date`, `last_updated`) VALUES
(1, 'mwangi', 'admin@mail.com', '$2b$10$HaYcXGUdfUg8/MPI87CZWO9USpt/Jh3bDKBxYKK1eetbZ0wpJGMJy', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(2, 'Admin', 'mwa@gmail.com', '$2b$10$8gWM20sIPXgKoOCfu6U4suCEMWd76WAjOuCUL3cTSjecij6.u4x3u', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(3, 'Nigel', 'Nigel@gmail.com', '$2b$10$a6VrBskNEnBuR0KIAc0ASu74d1qp7sQupptrq9auoZdItP.hxw0pO', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(4, 'chris', 'chris@gmail.com', '$2b$10$8Qh2Vo1Pdm7O3UEhxela3.VUqsPJRZ.Dl93QnZT9EBi0RfCt8SX7S', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(5, 'samiya ', 'samiya@gmail.com', '$2b$10$pYlvWmuWL/TKjXwSjy4W1.QKFsxSeiszuGET807ojajqFzv1uROMq', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(6, 'pr', 'pr@gmail.com', '$2b$10$aS2Ktd.6lOOyAuRqqH6gwuEbam9rMpUy9qj7FGNDWjGXgyoFy1Y..', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(7, 'aw', 'Alex@gmail.com', '$2b$10$RcmwSujMPmLzAV0YiNuBEOA2MxlHr7hTGrYotaVlOHog0s4k3aKn6', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(8, 'test4@gmail.com', 'test@gmail.com', '$2b$10$TdFv5AmegsG9PGToqMQKg.OYruby5GMqkAl9D3Y95DVL62EjHxFxS', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(9, 'testuser123', 'test@example.com', '$2b$10$/n7VXV2fVdCPh1Pm13solepwun8jLJbu9S4WR6O0QWlvXDoWiFkMi', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(10, 'testuser456', 'test456@example.com', '$2b$10$i9lw98V/ST3KvfcgYLHFZONZtIjsth4h5G7iPga.XQrUBEl6WpKfm', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(11, 'testuser1234', 'test1234@example.com', '$2b$10$7OHwUCr3QAnOH/XZZFm.ZOv/qqgXgx4cRBpGUV8sc4j18Qhpoea62', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19'),
(12, 'test2', 'test2@gmail.com', '$2b$10$yrS3vX..Wty4jz.jU4sNo.OSg1m88AxnwM6OiRJtp9OQ8DHS8GgXK', NULL, NULL, '2025-09-20 13:43:19', '2025-09-20 13:43:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `entries`
--
ALTER TABLE `entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `moods`
--
ALTER TABLE `moods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_moods_user_id` (`user_id`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_is_favorite` (`is_favorite`),
  ADD KEY `idx_updated_at` (`updated_at`),
  ADD KEY `idx_has_audio` (`has_audio`),
  ADD KEY `idx_notes_user_id` (`user_id`),
  ADD KEY `idx_notes_has_audio` (`has_audio`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tasks_user_id` (`user_id`);

--
-- Indexes for table `todos`
--
ALTER TABLE `todos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_todos_completed` (`completed`),
  ADD KEY `idx_todos_deleted` (`is_deleted`),
  ADD KEY `idx_todos_created` (`created_at`),
  ADD KEY `idx_todos_user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_join_date` (`join_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `entries`
--
ALTER TABLE `entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `moods`
--
ALTER TABLE `moods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `todos`
--
ALTER TABLE `todos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `entries`
--
ALTER TABLE `entries`
  ADD CONSTRAINT `entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `moods`
--
ALTER TABLE `moods`
  ADD CONSTRAINT `moods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `todos`
--
ALTER TABLE `todos`
  ADD CONSTRAINT `todos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
