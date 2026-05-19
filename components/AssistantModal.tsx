

import React, { useEffect, useRef, useState } from 'react';
import { useLiveAssistant } from '../hooks/useLiveAssistant';
import { useTextAssistant } from '../hooks/useTextAssistant';
import type { SensorData, IrrigationMode, AssistantTranscript } from '../types';
import { CrossIcon } from './icons/CrossIcon';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { MicIcon } from './icons/MicIcon';
import { SendIcon } from './icons/SendIcon';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensorData: SensorData;
  irrigationMode: IrrigationMode;
}

type AssistantStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'error';

export const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose, sensorData, irrigationMode }) => {
  const [transcripts, setTranscripts] = useState<AssistantTranscript[]>([]);
  const [voiceStatus, setVoiceStatus] = useState<AssistantStatus>('idle');
  const [textInput, setTextInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const onTranscriptUpdate = (newPart: AssistantTranscript) => {
    setTranscripts(prev => {
      const last = prev[prev.length - 1];
      if (last?.source === newPart.source && !last.isFinal) {
        return [...prev.slice(0, -1), newPart];
      }
      return [...prev, newPart];
    });
  };

  const { start: startVoice, stop: stopVoice } = useLiveAssistant({
    sensorData,
    irrigationMode,
    onTranscriptUpdate,
    onStatusChange: setVoiceStatus,
  });

  const { isLoading: isTextLoading, sendMessage: sendTextMessage } = useTextAssistant({
    sensorData,
    irrigationMode,
  });

  useEffect(() => {
    if (isOpen) {
      setTranscripts([]);
      setTextInput('');
      startVoice();
    } else {
      stopVoice();
    }
    return () => stopVoice();
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);
  
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isTextLoading) return;

    stopVoice();
    setVoiceStatus('idle');

    const userMessage: AssistantTranscript = { source: 'user', text: textInput, isFinal: true };
    setTranscripts(prev => [...prev, userMessage]);
    const messageToSend = textInput;
    setTextInput('');

    const modelResponse = await sendTextMessage(messageToSend);
    
    if (modelResponse) {
      const modelMessage: AssistantTranscript = { source: 'model', text: modelResponse, isFinal: true };
      setTranscripts(prev => [...prev, modelMessage]);
    } else {
      const errorMessage: AssistantTranscript = { source: 'model', text: "Sorry, I couldn't get a response. Please check the API key.", isFinal: true };
      setTranscripts(prev => [...prev, errorMessage]);
    }
  };


  if (!isOpen) return null;

  const getStatusIndicator = () => {
    if (isTextLoading) {
      return <div className="text-blue-400">Thinking...</div>;
    }
    switch (voiceStatus) {
      case 'connecting':
        return <div className="text-yellow-400">Connecting...</div>;
      case 'listening':
        return <div className="text-green-400 flex items-center justify-center"><MicIcon className="w-4 h-4 mr-2 animate-pulse" />Listening...</div>;
      case 'thinking':
        return <div className="text-blue-400">Thinking...</div>;
      case 'error':
        return <div className="text-red-400">Connection Error.</div>;
      default:
        return <div className="text-gray-400">Idle</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-light-surface dark:bg-surface rounded-xl shadow-2xl w-full max-w-lg h-[70vh] flex flex-col p-6 relative transition-colors" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-light-on-surface dark:text-on-surface">AI Assistant</h2>
          <button onClick={onClose} className="text-light-on-surface-variant dark:text-on-surface-variant hover:text-light-on-surface dark:hover:text-white transition-colors">
            <CrossIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div ref={scrollRef} className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
          {transcripts.map((t, i) => (
            <div key={i} className={`flex items-start gap-3 ${t.source === 'user' ? 'justify-end' : ''}`}>
              {t.source === 'model' && (
                <div className="w-8 h-8 flex-shrink-0 bg-secondary rounded-full flex items-center justify-center text-white"><BotIcon className="w-5 h-5"/></div>
              )}
              <div className={`px-4 py-2 rounded-lg max-w-sm ${t.source === 'user' ? 'bg-blue-600 text-white' : 'bg-light-base dark:bg-base'} ${!t.isFinal ? 'opacity-70' : ''}`}>
                {t.text}
              </div>
              {t.source === 'user' && (
                <div className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center text-white"><UserIcon className="w-5 h-5"/></div>
              )}
            </div>
          ))}
          {transcripts.length === 0 && (
            <div className="text-center text-light-on-surface-variant dark:text-on-surface-variant pt-16">
              <MicIcon className="w-16 h-16 mx-auto mb-4"/>
              <p>The assistant is ready.</p>
              <p>Try asking "What is the current soil moisture?" or type below.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleTextSubmit} className="flex-shrink-0 flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={voiceStatus === 'listening' ? 'Listening...' : 'Type a message...'}
            className="flex-grow w-full px-4 py-2 bg-light-base dark:bg-base rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
            disabled={isTextLoading || voiceStatus !== 'idle'}
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isTextLoading || voiceStatus !== 'idle'}
            className="flex-shrink-0 w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>

        <div className="flex-shrink-0 text-center font-medium mt-2">
          {getStatusIndicator()}
        </div>
      </div>
    </div>
  );
};