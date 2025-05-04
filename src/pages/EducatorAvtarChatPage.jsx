import { useCallback, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EducatorAvtarChatPage.module.css";

const EducatorAvtarChatPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { text: "Hello! I'm your educator assistant. What would you like to learn today?", isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Improved scroll function with a small delay to ensure DOM updates
  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        
        // Force browser to recalculate layout
        window.requestAnimationFrame(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      }
    }, 100);
  };

  // Call scrollToBottom both when messages change and after component renders
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Additional effect to ensure scroll works on initial load
  useEffect(() => {
    scrollToBottom();
  }, []);

  const onMaleUserIconClick = useCallback(() => {
    navigate("/profile-page");
  }, [navigate]);

  const onBackToIconClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Function to copy code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert("Code copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message to chat
    setChatMessages([...chatMessages, { text: message, isUser: true }]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token if using authentication
        },
        body: JSON.stringify({
          query: message,
          avatar: "educator"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response to chat
      setChatMessages(prev => [...prev, { text: data.response, isUser: false }]);
      
      // Clear input field
      setMessage("");
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [...prev, { text: "Error connecting to server. Please try again.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Function to format message content with code blocks
  const formatMessageContent = (text) => {
    // Check if the text contains code blocks (```language...```)
    if (text.includes("```")) {
      // Split by code blocks
      const parts = text.split(/(```[\s\S]*?```)/g);
      
      return parts.map((part, i) => {
        // Check if this part is a code block
        if (part.startsWith("```") && part.endsWith("```")) {
          // Extract language and code
          const codeContent = part.slice(3, -3);
          let language = "python"; // Default language
          let code = codeContent;
          
          // Check if language is specified
          const firstLineBreak = codeContent.indexOf('\n');
          if (firstLineBreak > 0) {
            const possibleLang = codeContent.substring(0, firstLineBreak).trim();
            if (possibleLang && !possibleLang.includes(' ')) {
              language = possibleLang;
              code = codeContent.substring(firstLineBreak + 1);
            }
          }
          
          // Generate line numbers
          const lines = code.split('\n');
          const lineNumbers = lines.map((_, idx) => idx + 1).join('\n');
          
          return (
            <div key={i} className={styles.codeBlockContainer}>
              <div className={styles.codeBlockHeader}>
                <span className={styles.codeLanguage}>{language}</span>
                <div className={styles.codeActions}>
                  <button 
                    className={styles.copyButton}
                    onClick={() => copyToClipboard(code)}
                  >
                    <span>📋 Copy</span>
                  </button>
                  <button className={styles.editButton}>
                    <span>✏️ Edit</span>
                  </button>
                </div>
              </div>
              <div className={styles.codeBlockContent}>
                <div className={styles.lineNumbers}>
                  {lines.map((_, idx) => (
                    <div key={idx} className={styles.lineNumber}>{idx + 1}</div>
                  ))}
                </div>
                <pre className={styles.codeContent}>
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          );
        } else {
          // Regular text - process markdown and return
          return (
            <div 
              key={i}
              dangerouslySetInnerHTML={{
                __html: part
                  // Replace double asterisks with bold text
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  // Replace single asterisks with italic text
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  // Ensure emojis have proper spacing
                  .replace(/([\uD800-\uDBFF][\uDC00-\uDFFF])/g, '<span class="emoji">$1</span>')
                  // Convert line breaks to <br> tags
                  .replace(/\n/g, '<br />')
              }}
            />
          );
        }
      });
    } else {
      // No code blocks, just return formatted text
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: text
              // Replace double asterisks with bold text
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              // Replace single asterisks with italic text
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              // Ensure emojis have proper spacing
              .replace(/([\uD800-\uDBFF][\uDC00-\uDFFF])/g, '<span class="emoji">$1</span>')
              // Convert line breaks to <br> tags
              .replace(/\n/g, '<br />')
          }}
        />
      );
    }
  };

  return (
    <div className={styles.educatorAvtarChatPage}>
      <header className={styles.pageLayout}>
        <div className={styles.navigation}>
          <img
            className={styles.backToIcon}
            loading="lazy"
            alt=""
            src="/back-to@2x.png"
            onClick={onBackToIconClick}
          />
          <div className={styles.titleContainer}>
            <h3 className={styles.gigglesAi}>
              <p className={styles.gigglesAi1}>Giggles AI</p>
            </h3>
          </div>
        </div>
        <img
          className={styles.maleUserIcon}
          loading="lazy"
          alt=""
          src="/male-user@2x.png"
          onClick={onMaleUserIconClick}
        />
      </header>
      <section className={styles.content}>
        <div className={styles.chatArea}>
          <div className={styles.chatMessages}>
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={msg.isUser ? styles.userMessage : styles.botMessage}
              >
                {formatMessageContent(msg.text)}
              </div>
            ))}
            {isLoading && (
              <div className={styles.botMessage}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} style={{ height: '1px', clear: 'both' }} />
          </div>
          <div className={styles.inputContainer}>
            <input
              className={styles.messageInput}
              placeholder="Ask me anything..."
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              className={styles.sendButton} 
              onClick={sendMessage}
              disabled={isLoading || !message.trim()}
            >
              <img
                src="/stashpaperplanesolid.svg"
                alt="Send"
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EducatorAvtarChatPage;
