import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, ConversationHeader, Avatar, InfoButton } from '@chatscope/chat-ui-kit-react';

function App() {
  const API_key = "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";
  const [messages, setMessages] = useState([
    { message: "Hello, I'm your AI assistant!", sender: "GROG", direction: "incoming" }
  ]);
  const [typing, setTyping] = useState(false);
  const [theme, setTheme] = useState('dark');


  useEffect(() => {
    document.body.className = theme;
    document.body.style.backgroundColor = theme === 'dark' ? '#121212' : '#f5f5f5';
    document.body.style.transition = 'background-color 0.3s ease';
  }, [theme]);

  const handleSend = async (message) => {

    const cleanedMessage = message.replace(/&nbsp;/g, ' ');

    const newMessage = {
      message: cleanedMessage,
      sender: "user",
      direction: "outgoing"
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);
    await sendToGroq(newMessages);
  };

  async function sendToGroq(chatMessages) {
    const apiMessages = chatMessages.map((msg) => ({
      role: msg.sender === "GROG" ? "assistant" : "user",
      content: msg.message
    }));

    const systemMessage = {
      role: "system",
      content: "Explain all concepts in a simple way."
    };

    const apiRequestBody = {
      model: "llama3-8b-8192",
      messages: [systemMessage, ...apiMessages]
    };

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        // Clean the response message as well
        const responseContent = data.choices[0].message.content.replace(/&nbsp;/g, ' ');

        const aiMessage = {
          message: responseContent,
          sender: "GROG",
          direction: "incoming"
        };
        setMessages([...chatMessages, aiMessage]);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      // Add error message
      const errorMessage = {
        message: "Sorry, I couldn't process your request. Please try again.",
        sender: "GROG",
        direction: "incoming"
      };
      setMessages([...chatMessages, errorMessage]);
    }

    setTyping(false);
  }

  // Custom styling for message bubbles
  const getMessageStyle = (sender) => {
    if (theme === 'dark') {
      return {
        backgroundColor: sender === 'user' ? '#4a5568' : '#2d3748',
        color: '#e2e8f0',
        borderRadius: '18px',
        padding: '10px 15px',
        maxWidth: '80%',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      };
    } else {
      return {
        backgroundColor: sender === 'user' ? '#3182ce' : '#e2e8f0',
        color: sender === 'user' ? 'white' : '#1a202c',
        borderRadius: '18px',
        padding: '10px 15px',
        maxWidth: '80%',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
      };
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Custom styles
  const appStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    transition: 'all 0.3s ease',
    background: theme === 'dark' ? 'linear-gradient(to bottom, #121212, #1a1a2e)' : 'linear-gradient(to bottom, #f5f5f5, #e0e0e0)'
  };

  const chatContainerStyle = {
    width: '700px',
    height: '800px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: theme === 'dark'
      ? '0 10px 25px rgba(0,0,0,0.3)'
      : '0 10px 25px rgba(0,0,0,0.1)',
    border: theme === 'dark'
      ? '1px solid #2d3748'
      : '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  };

  const headerStyle = {
    backgroundColor: theme === 'dark' ? '#2d3748' : '#4299e1',
    borderBottom: theme === 'dark' ? '1px solid #4a5568' : '1px solid #3182ce'
  };

  const controlsStyle = {
    display: 'flex',
    justifyContent: 'center',
    margin: '15px 0'
  };

  const buttonStyle = {
    backgroundColor: theme === 'dark' ? '#4a5568' : '#4299e1',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px'
  };

  // Custom message renderer to handle HTML entities
  const renderMessage = (message) => {
    // Create a plain text node rather than using dangerouslySetInnerHTML
    return message;
  };

  return (
    <div style={appStyle}>
      <div style={controlsStyle}>
        <button
          onClick={toggleTheme}
          style={buttonStyle}
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div style={chatContainerStyle}>
        <MainContainer>
          <ChatContainer>
            <ConversationHeader style={headerStyle}>
              <Avatar src={reactLogo} name="GROG" status="available" />
              <ConversationHeader.Content userName="GROG AI Assistant" info="Online" />
              <ConversationHeader.Actions>
                <InfoButton />
              </ConversationHeader.Actions>
            </ConversationHeader>

            <MessageList
              typingIndicator={typing ?
                <TypingIndicator content="GROG is thinking..." style={{
                  background: theme === 'dark' ? '#1a202c' : '#f7fafc',
                  color: theme === 'dark' ? '#e2e8f0' : '#1a202c'
                }} />
                : null
              }
              style={{
                backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                transition: 'background-color 0.3s ease'
              }}
            >
              {messages.map((message, i) => {
                return (
                  <Message
                    key={i}
                    model={{
                      ...message,
                      position: message.sender === 'user' ? 'normal' : 'first',
                      type: 'custom'
                    }}
                    style={getMessageStyle(message.sender)}
                  >
                    {renderMessage(message.message)}
                  </Message>
                );
              })}
            </MessageList>

            <MessageInput
              placeholder='Type your message here...'
              onSend={handleSend}
              attachButton={false}
              style={{
                backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
                color: theme === 'dark' ? '#e2e8f0' : '#1a202c',
                borderTop: theme === 'dark' ? '1px solid #4a5568' : '1px solid #e2e8f0'
              }}
            />
          </ChatContainer>
        </MainContainer>
      </div>

      <div style={{
        marginTop: '15px',
        color: theme === 'dark' ? '#a0aec0' : '#4a5568',
        fontSize: '14px'
      }}>
       
      </div>
    </div>
  )
}

export default App