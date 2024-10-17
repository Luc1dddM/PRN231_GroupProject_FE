import { useState, useRef, useEffect } from "react";
import { Input, Button, List, Card, Layout } from "antd";
import {
  SendOutlined,
  UserOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

const { Content } = Layout;

export default function CustomerChatbox() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to our customer support. How can I assist you today?",
      sender: "agent",
    },
    {
      id: 2,
      text: "Hi, I have a question about my recent order.",
      sender: "customer",
    },
    {
      id: 3,
      text: "Of course! I'd be happy to help. Could you please provide your order number?",
      sender: "agent",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM update
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: "customer",
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");

      // Simulate agent response (you would replace this with actual agent logic)
      setTimeout(() => {
        const agentResponse = {
          id: messages.length + 2,
          text: "Thank you for providing that information. I'm checking your order details now. Is there anything specific you'd like to know about your order?",
          sender: "agent",
        };
        setMessages((prevMessages) => [...prevMessages, agentResponse]);
      }, 1000);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "24px" }}>
        <Card
          title={
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              Customer Support Chat
            </div>
          }
          style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            height: "calc(100vh - 48px)",
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(item) => (
              <List.Item
                style={{
                  justifyContent:
                    item.sender === "customer" ? "flex-end" : "flex-start",
                }}
              >
                <Card
                  style={{
                    maxWidth: "70%",
                    backgroundColor:
                      item.sender === "customer" ? "#e6f7ff" : "#f0f0f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    {item.sender === "customer" ? (
                      <UserOutlined style={{ marginRight: "8px" }} />
                    ) : (
                      <CustomerServiceOutlined style={{ marginRight: "8px" }} />
                    )}
                    <span style={{ fontWeight: "bold" }}>
                      {item.sender === "customer" ? "You" : "Agent"}
                    </span>
                  </div>
                  {item.text}
                </Card>
              </List.Item>
            )}
            style={{
              height: "calc(100vh - 200px)",
              overflowY: "auto",
              marginBottom: 16,
              padding: "0 16px",
            }}
          />
          <div ref={messagesEndRef} />
          <div style={{ display: "flex", padding: "0 16px" }}>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPressEnter={handleSendMessage}
              placeholder="Type your message here..."
              style={{ flexGrow: 1, marginRight: 8 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
