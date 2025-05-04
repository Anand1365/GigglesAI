import { useCallback, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./friend-avtar-chat-page.module.css";

const FriendAvtarChatPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { text: "Hey there! 👋 I'm your friendly AI assistant. How can I help you today?", isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Improved scroll function with a small delay to ensure DOM updates
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message to chat
    setChatMessages([...chatMessages, { text: message, isUser: true }]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: message,
          avatar: "friend"
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
      setChatMessages(prev => [...prev, { text: "Sorry, I couldn't connect to the server. Let's try again later! 😊", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className={styles.friendAvtarChatPage}>
      <header className={styles.topBar}>
        <div className={styles.backToParent}>
          <img
            className={styles.backToIcon}
            loading="lazy"
            alt=""
            src="/back-to@2x.png"
            onClick={onBackToIconClick}
          />
          <div className={styles.gigglesAiWrapper}>
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
          <div className={styles.messageArea}>
            <div className={styles.advicePrompt}>
              {/* REMOVE THIS LINE */}
              {/* // In the render section where messages are displayed: */}
              
              <div className={styles.chatMessages}>
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={msg.isUser ? styles.userMessage : styles.botMessage}
                    // Format the message text with proper line breaks
                    dangerouslySetInnerHTML={{
                      __html: msg.text
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
              <div className={styles.problemPrompt}>
                <div className={styles.rectangleParent}>
                  <input
                    className={styles.frameItem}
                    placeholder="Type a message..."
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <img
                    className={styles.stashpaperplaneSolidIcon}
                    alt="Send"
                    src="/stashpaperplanesolid.svg"
                    onClick={sendMessage}
                    style={{ cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FriendAvtarChatPage;
