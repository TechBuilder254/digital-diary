import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause, FaTrash, FaDownload } from 'react-icons/fa';
import './AudioRecorder.css';

const AudioRecorder = ({ onAudioRecorded, onAudioDeleted, initialAudio = null, noteId = null }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(initialAudio?.url || null);
  const [audioDuration, setAudioDuration] = useState(initialAudio?.duration || 0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    // Check for existing audio on component mount
    if (initialAudio) {
      setAudioUrl(initialAudio.url);
      setAudioDuration(initialAudio.duration);
    }
  }, [initialAudio]);

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

  const requestMicrophonePermission = async () => {
    try {
      // Request high-quality audio with echo cancellation and noise suppression
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // High quality sample rate
          channelCount: 1, // Mono is fine for voice
          // Try to get the best quality available
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          googNoiseReduction: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      setHasPermission(true);
      streamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please allow microphone access to record audio.');
      setHasPermission(false);
      return null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await requestMicrophonePermission();
      if (!stream) return;

      // Configure MediaRecorder with high-quality settings
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/webm'; // Fallback

      const options = {
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // High bitrate for better quality (128 kbps)
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Calculate duration
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          setAudioDuration(Math.round(audio.duration));
        };

        // Call the callback with audio data
        if (onAudioRecorded) {
          onAudioRecorded({
            blob,
            url,
            duration: Math.round(audio.duration),
            size: blob.size,
            filename: `audio_${Date.now()}.webm`
          });
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording with timeslice for better quality (collect data every 100ms)
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
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

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioDuration(0);
    setIsPlaying(false);
    
    if (onAudioDeleted) {
      onAudioDeleted();
    }
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio_note_${noteId || Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-recorder">
      <div className="audio-recorder-header">
        <h4>Audio Recording</h4>
        {audioUrl && (
          <div className="audio-info">
            <span className="audio-duration">{formatTime(audioDuration)}</span>
            <span className="audio-size">{(audioBlob?.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        )}
      </div>

      <div className="audio-recorder-controls">
        {!audioUrl ? (
          <div className="recording-controls">
            {!isRecording ? (
              <button
                className="record-btn"
                onClick={startRecording}
                title="Start Recording"
                disabled={!hasPermission}
              >
                <FaMicrophone />
                <span>Record</span>
              </button>
            ) : (
              <button
                className="stop-btn"
                onClick={stopRecording}
                title="Stop Recording"
              >
                <FaStop />
                <span>Stop ({formatTime(recordingTime)})</span>
              </button>
            )}
          </div>
        ) : (
          <div className="playback-controls">
            <button
              className="play-btn"
              onClick={playAudio}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            
            <div className="audio-progress">
              <span className="current-time">
                {isPlaying ? formatTime(Math.floor(audioRef.current?.currentTime || 0)) : '0:00'}
              </span>
              <span className="total-time">/ {formatTime(audioDuration)}</span>
            </div>

            <div className="audio-actions">
              <button
                className="download-btn"
                onClick={downloadAudio}
                title="Download Audio"
              >
                <FaDownload />
              </button>
              <button
                className="delete-btn"
                onClick={deleteAudio}
                title="Delete Audio"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          onTimeUpdate={() => {
            // Force re-render for time updates
            if (isPlaying) {
              setRecordingTime(Math.floor(audioRef.current?.currentTime || 0));
            }
          }}
        />
      )}

      {isRecording && (
        <div className="recording-indicator">
          <div className="pulse-dot"></div>
          <span>Recording...</span>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;



