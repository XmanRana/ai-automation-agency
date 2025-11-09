import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState('Document Converter');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/tools')
      .then(res => {
        const toolsArray = Object.entries(res.data.tools).map(([name, tool]) => ({
          name: name,
          description: tool.description
        }));
        setTools(toolsArray);
        if (toolsArray.length > 0) setSelectedTool(toolsArray[0].name);
      })
      .catch(err => console.error('Error fetching tools:', err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setUploadedFile({
          name: response.data.filename,
          originalName: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB'
        });

        setMessages(prev => [...prev, {
          role: 'system',
          content: `✅ File uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Upload failed: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    try {
      // If file uploaded, go directly to convert
      if (uploadedFile) {
        const convertResponse = await axios.post('http://127.0.0.1:8000/api/convert', {
          filename: uploadedFile.name,
          task: input
        });

        if (convertResponse.data.success) {
          const downloadUrl = convertResponse.data.download_url;
          const outputFile = convertResponse.data.output_file;

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ ${convertResponse.data.message}\n\n📥 ${outputFile}`,
            downloadUrl: downloadUrl,
            outputFile: outputFile
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `❌ Error: ${convertResponse.data.error}`
          }]);
        }
      } else {
        // No file uploaded, show available tasks
        const response = await axios.post('http://127.0.0.1:8000/api/execute', {
          tool_name: selectedTool,
          input: {
            topic: input,
            filename: input,
            type: input
          }
        });

        const result = response.data.output;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.output || result.error || JSON.stringify(result)
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error: ' + (error.response?.data?.error || error.message)
      }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#222', padding: '20px', borderRight: '1px solid #333', overflowY: 'auto' }}>
        <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '18px' }}>🤖 AI Tools</h2>
        {tools.map(tool => (
          <button
            key={tool.name}
            onClick={() => {
              setSelectedTool(tool.name);
              setMessages([]);
              setUploadedFile(null);
            }}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: selectedTool === tool.name ? '#0066ff' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{tool.name}</div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>{tool.description}</div>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#222', borderBottom: '1px solid #333', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', margin: '0 0 5px 0' }}>{selectedTool}</h1>
            {uploadedFile && (
              <p style={{ fontSize: '12px', color: '#0f0', margin: '0' }}>📄 {uploadedFile.originalName} ({uploadedFile.size})</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.length === 0 && (
            <div style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>
              <p style={{ fontSize: '14px' }}>Select a tool and start chatting...</p>
              {selectedTool === 'Document Converter' && (
                <p style={{ fontSize: '12px', marginTop: '20px' }}>Try: "compress pdf", "merge pdf", "convert to word", etc.</p>
              )}
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : msg.role === 'system' ? 'center' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor:
                  msg.role === 'user' ? '#0066ff' :
                    msg.role === 'system' ? '#1a1a1a' :
                      '#333',
                color: msg.role === 'system' ? '#0f0' : 'white',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                fontSize: '13px',
                border: msg.role === 'system' ? '1px solid #0f0' : 'none'
              }}>
                {msg.content}
              </div>
              {msg.downloadUrl && (
                <a
                  href={msg.downloadUrl}
                  download={msg.outputFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#0a6600',
                    color: '#0f0',
                    border: '1px solid #0f0',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0d7a00';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#0a6600';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ⬇️ Download
                </a>
              )}
            </div>
          ))}
          {loading && <div style={{ color: '#999', fontSize: '12px' }}>⏳ Processing...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Compact */}
        <div style={{ backgroundColor: '#222', borderTop: '1px solid #333', padding: '10px 15px' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* File Upload Button - Small Icon */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title={uploadedFile ? `${uploadedFile.originalName}` : 'Upload file'}
              style={{
                width: '36px',
                height: '36px',
                padding: '0',
                backgroundColor: uploadedFile ? '#0a6600' : '#444',
                color: 'white',
                border: uploadedFile ? '2px solid #0f0' : '1px solid #666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              {uploadedFile ? '✓' : '📎'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              style={{ display: 'none' }}
            />

            {/* Message Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedTool === 'Document Converter' ? 'compress pdf, convert to word, merge...' : 'Send message...'}
              disabled={loading}
              style={{
                flex: 1,
                padding: '9px 12px',
                backgroundColor: '#333',
                color: 'white',
                border: '1px solid #444',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />

            {/* Send Button - Icon */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '36px',
                height: '36px',
                padding: '0',
                backgroundColor: '#0066ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </form>

          {/* Uploaded File Info - Small */}
          {uploadedFile && (
            <p style={{ fontSize: '10px', color: '#0f0', margin: '5px 0 0 0' }}>
              ✓ {uploadedFile.originalName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
