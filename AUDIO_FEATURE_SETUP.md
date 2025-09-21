# Audio Recording Feature Setup

## Database Setup

Before using the audio recording feature, you need to update your database schema. Run the following SQL commands in your MySQL database:

```sql
-- Add audio recording fields to notes table
ALTER TABLE `notes`
ADD COLUMN `audio_filename` VARCHAR(255) NULL AFTER `is_favorite`,
ADD COLUMN `audio_duration` INT NULL AFTER `audio_filename`,
ADD COLUMN `audio_size` BIGINT NULL AFTER `audio_duration`,
ADD COLUMN `has_audio` TINYINT(1) DEFAULT 0 AFTER `audio_size`;

-- Add index for audio-related queries
ALTER TABLE `notes`
ADD INDEX `idx_has_audio` (`has_audio`);

-- Update existing notes to have has_audio = 0 (no audio)
UPDATE `notes` 
SET `has_audio` = 0 
WHERE `has_audio` IS NULL;
```

## How to Use the Audio Recording Feature

### Quick Audio Recording
1. **Record Button**: Click the red microphone button (floating above the + button) to start recording
2. **Stop Recording**: Click the stop button to end the recording
3. **Save Dialog**: After stopping, a dialog will appear where you can:
   - Edit the default note title (defaults to "Audio Note [timestamp]")
   - See recording duration and file size
   - Save the note or cancel

### Audio Storage
- **Local Storage**: Audio files are stored locally in the browser's localStorage
- **Database**: Only metadata (filename, duration, size) is stored in the database
- **File Format**: Audio is recorded in WebM format for better browser compatibility

### Audio Playback
- Notes with audio recordings show an audio indicator with duration
- Click on a note to edit it and access the audio playback controls
- Audio can be played, paused, downloaded, or deleted

### Features
- ✅ Quick recording without opening note modal
- ✅ Default naming with timestamp
- ✅ Editable note titles
- ✅ Audio duration and size display
- ✅ Local audio storage
- ✅ Database metadata storage
- ✅ Audio playback controls
- ✅ Download audio files
- ✅ Delete audio recordings
- ✅ Visual indicators for notes with audio

### Browser Requirements
- Modern browser with WebRTC support
- Microphone access permission
- LocalStorage support

### Troubleshooting
- If recording doesn't work, check browser microphone permissions
- Ensure you're using HTTPS or localhost for microphone access
- Clear browser cache if audio playback issues occur


