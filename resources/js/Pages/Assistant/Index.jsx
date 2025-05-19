import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const AssistantPage = ({ auth }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useInternetSearch, setUseInternetSearch] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [perplexityApiKey, setPerplexityApiKey] = useState('');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Focus vào input khi trang được tải
        inputRef.current?.focus();

        // Lấy API key từ localStorage nếu có
        const savedApiKey = localStorage.getItem('perplexityApiKey');
        if (savedApiKey) {
            setPerplexityApiKey(savedApiKey);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            let apiEndpoint = 'http://0.0.0.0:8002/query';
            let requestBody = {
                question: userMessage.content
            };
            let headers = {
                'Content-Type': 'application/json'
            };

            if (useInternetSearch) {
                apiEndpoint = 'https://api.perplexity.ai/chat/completions';
                requestBody = {
                    model: 'sonar-pro',
                    messages: [
                        {
                            role: 'user',
                            content: userMessage.content
                        }
                    ],
                    max_tokens: 1024
                };

                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer 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`
                };
            }

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Lỗi kết nối đến API');
            }

            const data = await response.json();

            let responseContent;
            if (useInternetSearch) {
                // Xử lý phản hồi từ Perplexity API
                responseContent = data.choices && data.choices[0] && data.choices[0].message
                    ? data.choices[0].message.content
                    : 'Không nhận được phản hồi từ Perplexity API';
            } else {
                // Xử lý phản hồi từ API local
                responseContent = data.answer || 'Không nhận được phản hồi từ API';
            }

            const assistantMessage = {
                role: 'assistant',
                content: responseContent,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Lỗi:', error);

            // Nếu lỗi liên quan đến API key thì không hiển thị thông báo lỗi
            if (error.message === 'Vui lòng nhập API key của Perplexity') {
                return;
            }

            const errorMessage = {
                role: 'assistant',
                content: 'Đã xảy ra lỗi khi kết nối đến API. Vui lòng thử lại sau.',
                timestamp: new Date().toISOString(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveApiKey = () => {
        if (apiKeyInput.trim()) {
            setPerplexityApiKey(apiKeyInput.trim());
            localStorage.setItem('perplexityApiKey', apiKeyInput.trim());
            setShowApiKeyModal(false);
            setApiKeyInput('');
        }
    };

    const handleApiKeyInputChange = (e) => {
        setApiKeyInput(e.target.value);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Trợ lý AI</h2>}
        >
            <Head title="Trợ lý AI" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="flex flex-col h-[70vh]">
                            {/* Phần hiển thị tin nhắn */}
                            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center text-gray-500">
                                            <h3 className="text-xl font-medium mb-2">Chào mừng đến với Trợ lý AI</h3>
                                            <p>Hãy đặt câu hỏi để bắt đầu cuộc trò chuyện</p>
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                                msg.role === 'user'
                                                    ? 'bg-blue-500 text-white'
                                                    : msg.isError
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <div className="markdown-content prose prose-sm max-w-none dark:prose-invert">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            )}
                                            <div className="text-xs opacity-70 mt-1">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Form nhập tin nhắn */}
                            <div className="border-t p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="flex space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Nhập câu hỏi của bạn..."
                                            className="flex-grow rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            disabled={isLoading}
                                            ref={inputRef}
                                        />
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                                            disabled={isLoading || !input.trim()}
                                        >
                                            Gửi
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <div className="flex flex-col">
                                            <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useInternetSearch}
                                                    onChange={(e) => setUseInternetSearch(e.target.checked)}
                                                    className="rounded text-blue-500 focus:ring-blue-200"
                                                />
                                                <span className="flex items-center">
                                                    Internet Search
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AssistantPage;
