import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState('Email Generator');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/tools')
      .then(res => {
        const toolsArray = Object.keys(res.data.tools).map(key => ({
          name: key,
          description: res.data.tools[key].description
        }));
        setTools(toolsArray);
      })
      .catch(err => console.error('Error fetching tools:', err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input, tool: selectedTool }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/execute', {
        tool_name: selectedTool,
        input: { topic: input, filename: input, type: input }
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.output,
        tool: selectedTool
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: ' + error.message,
        tool: 'error'
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
        <h2 className="text-white font-bold mb-4 text-lg">AI Tools</h2>
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => setSelectedTool(tool.name)}
            className={`w-full text-left p-3 rounded mb-2 transition ${
              selectedTool === tool.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            <div className="font-semibold">{tool.name}</div>
            <div className="text-xs opacity-75">{tool.description}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <h1 className="text-white font-bold text-xl">{selectedTool}</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-gray-400 text-center mt-10">
              <p>Select a tool and start chatting!</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                <p className="text-sm">Executing {selectedTool}...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your request..."
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
