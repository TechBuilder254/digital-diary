import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaSave, FaTimes } from 'react-icons/fa';
import axios from '../config/axios';

interface NoteData {
  title: string;
  content: string;
  category?: string;
  tags?: string;
  priority?: string;
  is_favorite?: boolean;
}

interface AudioData {
  filename: string;
  duration: number;
  size: number;
  blob?: Blob;
}

interface QuickAudioRecorderProps {
  onSave: (noteData: NoteData, audioData: AudioData) => Promise<void>;
  onCancel: () => void;
}

const QuickAudioRecorder: React.FC<QuickAudioRecorderProps> = ({ onSave, onCancel }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate default title based on date/time
  const getDefaultTitle = (): string => {
    const now = new Date();
    return `Audio Note ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!audioBlob) {
      alert('Please record an audio first.');
      return;
    }

    // Use default title if not provided
    const finalTitle = noteTitle.trim() || getDefaultTitle();

    const formData = new FormData();
    const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
    formData.append('audio', audioFile);

    try {
      const uploadResponse = await axios.post('/notes/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadData = uploadResponse.data;

      const noteData: NoteData = {
        title: finalTitle,
        content: 'Audio recording',
        category: 'Audio',
        tags: 'audio, recording',
        priority: 'Medium',
        is_favorite: false,
      };

      const audioData: AudioData = {
        filename: uploadData.filename,
        duration: recordingTime,
        size: audioBlob.size,
        blob: audioBlob,
      };

      await onSave(noteData, audioData);
      
      // Reset state after successful save
      setNoteTitle('');
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error saving audio note:', error);
      alert('Failed to save audio note. Please try again.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-40">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FaMicrophone className="text-indigo-600" />
            Quick Audio Note
          </h3>
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onCancel}
          >
            <FaTimes />
          </button>
        </div>
        <input
          type="text"
          placeholder="Note title (optional - will use default if empty)"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
        />
      </div>
      
      <div className="p-4">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FaMicrophone />
            Start Recording
          </button>
        )}
        
        {isRecording && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{formatTime(recordingTime)}</div>
              <div className="flex items-center justify-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">Recording...</span>
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaStop />
              Stop Recording
            </button>
          </div>
        )}
        
        {audioBlob && !isRecording && (
          <div className="space-y-4">
            <audio src={audioUrl || undefined} controls className="w-full" />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaSave />
                Save Note
              </button>
              <button
                onClick={() => {
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setRecordingTime(0);
                  setNoteTitle('');
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickAudioRecorder;


