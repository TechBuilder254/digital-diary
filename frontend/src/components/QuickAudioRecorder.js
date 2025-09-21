import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaCheck, FaTimes } from 'react-icons/fa';
import './QuickAudioRecorder.css';

const QuickAudioRecorder = ({ onSave, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [noteTitle, setNoteTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioUrl(url);
        setShowSaveDialog(true);
        
        // Generate default title
        const defaultTitle = `Audio Note ${new Date().toLocaleString()}`;
        setNoteTitle(defaultTitle);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied. Please allow microphone access to record audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleSave = async () => {
    if (audioBlob && noteTitle.trim()) {
      try {
        // Upload audio file to server
        const formData = new FormData();
        formData.append('audio', audioBlob, `audio_${Date.now()}.webm`);

        const uploadResponse = await fetch('http://localhost:5000/api/notes/upload-audio', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload audio file');
        }

        const uploadData = await uploadResponse.json();

        const audioData = {
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          size: audioBlob.size,
          filename: uploadData.filename,
          serverUrl: uploadData.url
        };

        const noteData = {
          title: noteTitle.trim(),
          content: 'Audio recording',
          category: 'Audio',
          tags: 'audio, recording',
          priority: 'Medium',
          is_favorite: false,
          audio_filename: audioData.filename,
          audio_duration: audioData.duration,
          audio_size: audioData.size,
          has_audio: true,
        };

        onSave(noteData, audioData);
        handleCancel();
      } catch (error) {
        console.error('Error uploading audio:', error);
        alert('Failed to upload audio file. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    // Don't revoke URL here as it might be needed for saving
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setNoteTitle('');
    setShowSaveDialog(false);
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showSaveDialog) {
    return (
      <div className="quick-audio-save-dialog">
        <div className="save-dialog-content">
          <h3>Save Audio Recording</h3>
          <div className="audio-preview">
            <div className="audio-info">
              <span className="audio-duration">Duration: {formatTime(recordingTime)}</span>
              <span className="audio-size">Size: {(audioBlob?.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
          <div className="title-input">
            <label>Note Title:</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Enter note title..."
              autoFocus
            />
          </div>
          <div className="save-dialog-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              <FaTimes />
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave} disabled={!noteTitle.trim()}>
              <FaCheck />
              Save Note
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-audio-recorder">
      {!isRecording ? (
        <button
          className="quick-record-btn"
          onClick={startRecording}
          title="Start Recording"
        >
          <FaMicrophone />
        </button>
      ) : (
        <div className="recording-controls">
          <button
            className="quick-stop-btn"
            onClick={stopRecording}
            title="Stop Recording"
          >
            <FaStop />
          </button>
          <div className="recording-timer">
            {formatTime(recordingTime)}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAudioRecorder;


