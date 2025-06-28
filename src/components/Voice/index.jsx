import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { Tooltip, message } from 'antd';
import { io } from 'socket.io-client';
import './index.scss';

const VoiceInput = ({ onVoiceInput, className = '' }) => {
    const [isListening, setIsListening] = useState(false);
    const socketRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);
    const processorRef = useRef(null);
    const isMountedRef = useRef(true);
    const sessionIdRef = useRef(''); // 添加ref来同步会话ID状态

    // 初始化Socket.IO连接
    useEffect(() => {
        isMountedRef.current = true;

        const initSocketConnection = async () => {
            try {
                const serviceUrl = globalInitConfig.REACT_APP_API_PLUG_URL;
                console.log('连接语音服务:', serviceUrl);

                socketRef.current = io(serviceUrl, {
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 10000,
                    autoConnect: true,
                    path: '/socket.io'
                });

                const setupEventListeners = () => {
                    socketRef.current.on('connect', () => {
                        console.log('Socket.IO已连接，ID:', socketRef.current.id);
                    });

                    socketRef.current.on('partial_result', (data) => {
                        console.info('收到识别结果事件:', data);
                        const recognizedText = data.full_text || '';

                        if (recognizedText && isMountedRef.current) {
                            if (typeof onVoiceInput === 'function') {
                                try {
                                    onVoiceInput(recognizedText);
                                    console.log('已调用onVoiceInput函数');

                                    if (data.is_final) {
                                        message.success(`识别结果: ${recognizedText}`);
                                    }
                                } catch (err) {
                                    console.error('调用onVoiceInput时出错:', err);
                                }
                            }
                        }
                    });

                    socketRef.current.on('error', (error) => {
                        console.error('识别错误:', error);
                        if (isMountedRef.current) {
                            message.error('语音识别错误: ' + (error.message || error.details || '未知错误'));
                        }
                    });

                    socketRef.current.on('disconnect', () => {
                        console.log('Socket.IO已断开连接');
                        setIsListening(false);
                    });

                    socketRef.current.onAny((eventName, ...args) => {
                        console.log('收到事件:', eventName, args);
                    });
                };

                setupEventListeners();
            } catch (err) {
                console.error('初始化Socket.IO失败:', err);
                message.error('语音服务初始化失败: ' + (err.message || '未知错误'));
            }
        };

        initSocketConnection();

        return () => {
            isMountedRef.current = false;
            stopRecording();
            if (socketRef.current) {
                // 移除所有事件监听器
                socketRef.current.off('connect');
                socketRef.current.off('partial_result');
                socketRef.current.off('error');
                socketRef.current.off('disconnect');
                socketRef.current.offAny();

                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    // 开始录音
    const startRecording = async () => {
        try {
            if (!socketRef.current) {
                message.error('语音服务未连接');
                return;
            }

            // 使用ref的值进行检查
            if (!sessionIdRef.current) {
                console.log('请求新的session...');

                // 等待session创建，最多10秒
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('获取session超时'));
                    }, 10000);

                    const sessionHandler = (data) => {
                        console.log('收到session_created事件:', data);
                        if (data.session_id) {
                            console.log('收到新的session ID:', data.session_id);
                            sessionIdRef.current = data.session_id;
                            socketRef.current.off('session_created', sessionHandler);
                            clearTimeout(timeout);
                            resolve();
                        }
                    };

                    // 确保在发送start_recognition之前设置监听器
                    socketRef.current.on('session_created', sessionHandler);

                    // 发送创建会话请求
                    socketRef.current.emit('start_recognition', {
                        timestamp: Date.now()
                    });
                });
            }

            console.log('使用会话ID:', sessionIdRef.current);

            console.log('请求麦克风权限...');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });
            console.log('麦克风权限已获取');
            streamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });
            console.log('音频上下文已创建，采样率:', audioContextRef.current.sampleRate);

            console.log('初始化音频处理器...');
            useScriptProcessor(audioContextRef.current.createMediaStreamSource(stream));
            console.log('音频处理器已初始化');

            setIsListening(true);
            message.success('开始录音');

        } catch (err) {
            console.error('开始录音失败:', err);
            stopRecording();
            message.error(`开始录音失败: ${err.message}`);
        }
    };

    // 使用ScriptProcessor作为备选方案
    const useScriptProcessor = (source) => {
        console.log('创建ScriptProcessor节点...');
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        const bufferSize = 16000;
        let audioBuffer = new Float32Array(bufferSize);
        let bufferIndex = 0;
        let sendInterval = null;

        console.log('设置音频发送定时器...');
        sendInterval = setInterval(() => {
            if (bufferIndex > 0 && socketRef.current?.connected) {
                if (!sessionIdRef.current) {
                    console.log('没有有效的会话ID，请求新会话...');
                    socketRef.current.emit('start_recognition', {
                        timestamp: Date.now()
                    });
                    return;
                }

                const dataToSend = audioBuffer.slice(0, bufferIndex);
                const int16Data = new Int16Array(dataToSend.length);
                for (let i = 0; i < dataToSend.length; i++) {
                    int16Data[i] = Math.max(-1, Math.min(1, dataToSend[i])) * 32767;
                }

                const buffer = int16Data.buffer;
                const base64 = arrayBufferToBase64(buffer);

                console.log(`发送音频数据: ${bufferIndex} 采样点, ${base64.length} 字节(base64), 会话ID: ${sessionIdRef.current}`);

                try {
                    socketRef.current.emit('audio_chunk', {
                        session_id: sessionIdRef.current, // 使用ref的值
                        audio_data: base64,
                        timestamp: Date.now()
                    });
                    console.log('音频数据已发送');
                } catch (err) {
                    console.error('发送音频数据失败:', err);
                    sessionIdRef.current = ''; // 重置ref
                    socketRef.current.emit('start_recognition', {
                        timestamp: Date.now()
                    });
                }

                bufferIndex = 0;
            } else {
                console.log('音频发送状态:', {
                    socketConnected: socketRef.current?.connected,
                    hasSessionId: !!sessionIdRef.current,
                    sessionId: sessionIdRef.current,
                    bufferIndex: bufferIndex
                });

                if (socketRef.current?.connected && !sessionIdRef.current) {
                    console.log('没有会话ID，请求新会话...');
                    socketRef.current.emit('start_recognition');
                }
            }
        }, 500);

        processorRef.current.onaudioprocess = (event) => {
            if (!socketRef.current?.connected || !sessionIdRef.current) {
                if (!socketRef.current?.connected) console.log('Socket未连接，跳过音频处理');
                if (!sessionIdRef.current) console.log('没有会话ID，跳过音频处理');
                return;
            }

            const pcmData = event.inputBuffer.getChannelData(0);

            for (let i = 0; i < pcmData.length && bufferIndex < bufferSize; i++) {
                audioBuffer[bufferIndex++] = pcmData[i];
            }

            if (bufferIndex >= bufferSize) {
                console.log('音频缓冲区已满');
            }
        };

        processorRef.current.sendInterval = sendInterval;
        source.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);
    };

    const arrayBufferToBase64 = (buffer) => {
        const binary = [];
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary.push(String.fromCharCode(bytes[i]));
        }
        return window.btoa(binary.join(''));
    };

    const stopRecording = () => {
        try {
            if (processorRef.current) {
                if (processorRef.current.sendInterval) {
                    clearInterval(processorRef.current.sendInterval);
                    processorRef.current.sendInterval = null;
                }

                processorRef.current.disconnect();
                processorRef.current = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                    track.enabled = false;
                });
                streamRef.current = null;
            }

            if (audioContextRef.current?.state !== 'closed') {
                audioContextRef.current?.close().catch(err => {
                    console.warn('关闭音频上下文失败:', err);
                });
                audioContextRef.current = null;
            }

            if (socketRef.current?.connected && sessionIdRef.current) {
                console.log('通知服务器停止识别:', sessionIdRef.current);
                socketRef.current.emit('end_recognition', {
                    session_id: sessionIdRef.current, // 使用ref的值
                    timestamp: Date.now()
                });
                sessionIdRef.current = ''; // 重置ref
            }

            if (isListening) {
                setIsListening(false);
                message.info('停止录音');
            }
        } catch (err) {
            console.error('停止录音时出错:', err);
            message.error('停止录音失败: ' + err.message);
            setIsListening(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className={`voice-input-container ${className}`}>
            <Tooltip title={isListening ? '停止录音' : '开始录音'}>
                <div
                    className={`voice-button ${isListening ? 'recording' : ''}`}
                    onClick={toggleListening}
                    aria-label={isListening ? '停止录音' : '开始录音'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none"
                         version="1.1" width="24" height="24" viewBox="0 0 24 24">
                        <defs>
                            <clipPath id="master_svg0_280_25182">
                                <rect x="0" y="0" width="24" height="24" rx="0"/>
                            </clipPath>
                        </defs>
                        <g clipPath="url(#master_svg0_280_25182)">
                            <g>
                                <path
                                    d="M18.916084375,10.8062203125C18.914684375,10.7148603125,18.840184375,10.6415503125,18.748784375,10.6415503125L17.490784375,10.6415503125C17.399384375,10.6415403125,17.324884375,10.714850312500001,17.323384375,10.8062203125C17.323384375,13.6938203125,14.940354375,16.0334203125,12.000044375,16.0334203125C9.059734375,16.0334203125,6.677974375,13.6951203125,6.677974375,10.8075303125C6.676524375,10.7156503125,6.601244375,10.6421303125,6.509354375,10.642870312500001L5.251287375,10.642870312500001C5.160409875,10.642840312499999,5.086131005,10.7153703125,5.083984375,10.8062203125C5.083984375,14.2787203125,7.737114375,17.1426203125,11.162214375,17.5484203125L11.162214375,19.6561203125L8.116514375,19.6561203125C7.829334375,19.6561203125,7.598794375000001,19.9512203125,7.598794375000001,20.3148203125L7.598794375000001,21.0565203125C7.598794375000001,21.1474203125,7.658074375,21.2211203125,7.729214375,21.2211203125L16.270884375,21.2211203125C16.341984375,21.2211203125,16.401284375,21.1474203125,16.401284375,21.0565203125L16.401284375,20.3148203125C16.401284375,19.9512203125,16.170784375,19.6561203125,15.883584375,19.6561203125L12.754884375,19.6561203125L12.754884375,17.5589203125C16.219484375,17.1900203125,18.916084375,14.3077203125,18.916084375,10.8062203125ZM12.000044375,14.3051203125C13.968154375,14.3051203125,15.563484375,12.7572003125,15.563484375,10.8470603125L15.563484375,6.2363503125C15.563484375,4.3262003125,13.968154375,2.7783203125,12.000044375,2.7783203125C10.031934374999999,2.7783203125,8.436624375000001,4.3262003125,8.436624375000001,6.2363503125L8.436624375000001,10.8470603125C8.436624375000001,12.7572003125,10.031934374999999,14.3051203125,12.000044375,14.3051203125ZM10.030614374999999,6.2363503125C10.030614374999999,5.1956503125,10.907964374999999,4.3420103125,12.000044375,4.3420103125C13.092124375,4.3420103125,13.969474375,5.1943303125,13.969474375,6.2363503125L13.969474375,10.8470603125C13.969474375,11.8877603125,13.092124375,12.7414003125,12.000044375,12.7414003125C10.907964374999999,12.7414003125,10.030614374999999,11.8890703125,10.030614374999999,10.8470603125L10.030614374999999,6.2363503125Z"
                                    fill="currentColor"/>
                            </g>
                        </g>
                    </svg>
                </div>
            </Tooltip>
        </div>
    );
};

export default VoiceInput;
