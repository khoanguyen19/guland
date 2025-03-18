import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    // Cuộn xuống cuối cuộc trò chuyện khi có tin nhắn mới
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    // Xử lý khi gửi tin nhắn
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) return;

        // Thêm tin nhắn của người dùng vào cuộc trò chuyện
        const userMessage = message;
        setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
        setMessage('');
        setIsLoading(true);

        try {
            // Gửi tin nhắn đến endpoint RAG chat
            const response = await axios.post('http://0.0.0.0:8001/api/chat', {
                query: userMessage,
                document_ids: '3fd0e936-a68d-417c-a1fc-828e8f732fb6'
            });

            // Thêm phản hồi từ bot vào cuộc trò chuyện
            setConversation(prev => [...prev, { role: 'assistant', content: response.data.response }]);
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            setConversation(prev => [...prev, {
                role: 'assistant',
                content: 'Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle hiển thị chat widget
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-5 right-5 z-[9999]">
            {/* Chat button */}
            <button
                onClick={toggleChat}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat container */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 mb-2 w-80 overflow-hidden rounded-lg bg-white shadow-xl sm:w-96 z-[9999]">
                    {/* Chat header */}
                    <div className="flex items-center justify-between bg-blue-600 p-4 text-white">
                        <h3 className="text-lg font-medium">Chat Bot</h3>
                        <button onClick={toggleChat} className="rounded p-1 hover:bg-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Chat messages */}
                    <div
                        ref={chatContainerRef}
                        className="h-80 overflow-y-auto p-4"
                    >
                        {conversation.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-center text-gray-500">
                                    Hãy hỏi bất kỳ câu hỏi nào về bất động sản!
                                </p>
                            </div>
                        ) : (
                            conversation.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                            msg.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="rounded-lg bg-gray-100 px-4 py-2 text-gray-800">
                                    <div className="flex space-x-1">
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat input */}
                    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="ml-2 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                                disabled={isLoading || !message.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
