import { useState } from 'react';
import { sendChatMessage } from '../api/aiApi.js';
import AlertMessage from './AlertMessage.jsx';

const suggestedPrompts = [
  'What is my balance?',
  'Summarize my recent transactions',
  'How much did I spend recently?',
];

export default function ChatAssistant({ username }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hi. Ask me about your account.',
    },
  ]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function submitMessage(messageText) {
    const nextMessage = messageText.trim();

    if (!nextMessage || isLoading) {
      return;
    }

    setError('');
    setInput('');
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `${Date.now()}-user`,
        sender: 'user',
        text: nextMessage,
      },
    ]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(username, nextMessage);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${Date.now()}-ai`,
          sender: 'ai',
          text: response.response || 'No response from AI.',
        },
      ]);
    } catch (err) {
      setError(err.message || 'AI assistant is unavailable.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitMessage(input);
  }

  return (
    <section className="panel chat-panel" aria-labelledby="chat-title">
      <div className="section-heading">
        <p className="eyebrow">Assistant</p>
        <h2 id="chat-title">AI Banking Assistant</h2>
      </div>

      <AlertMessage message={error} type="error" />

      <div className="prompt-list" aria-label="Suggested prompts">
        {suggestedPrompts.map((prompt) => (
          <button
            className="prompt-button"
            type="button"
            key={prompt}
            onClick={() => submitMessage(prompt)}
            disabled={isLoading}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-messages" aria-live="polite">
        {messages.map((message) => (
          <div className={`chat-message chat-message-${message.sender}`} key={message.id}>
            <span>{message.sender === 'user' ? 'You' : 'AI'}</span>
            <p>{message.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message chat-message-ai">
            <span>AI</span>
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <label className="form-field" htmlFor="chat-input">
          <span>Message</span>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about your finances"
          />
        </label>
        <button className="primary-button" type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </section>
  );
}
