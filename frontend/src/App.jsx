import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState('Email Generator');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/tools')
      .then(res => {
        const toolsArray = Object.entries(res.data.tools).map(([name, tool]) => ({
          name: name,
          description: tool.description
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

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/execute', {
        tool_name: selectedTool,
        input: { topic: input, filename: input, type: input }
      });

      const result = response.data.output;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.output
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: ' + error.message
      }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#222', padding: '20px', borderRight: '1px solid #333', overflowY: 'auto' }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>AI Tools</h2>
        {tools.map(tool => (
          <button
            key={tool.name}
            onClick={() => setSelectedTool(tool.name)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: selectedTool === tool.name ? '#0066ff' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{tool.name}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{tool.description}</div>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#222', borderBottom: '1px solid #333', padding: '15px', color: 'white' }}>
          <h1 style={{ fontSize: '20px' }}>{selectedTool}</h1>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '60%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: msg.role === 'user' ? '#0066ff' : '#333',
                color: 'white',
                wordWrap: 'break-word'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: '#999' }}>Loading...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ backgroundColor: '#222', borderTop: '1px solid #333', padding: '15px' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your request..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#333',
                color: 'white',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0066ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
