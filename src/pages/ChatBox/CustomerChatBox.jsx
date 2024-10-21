import { useState, useRef, useEffect } from "react";
import { Input, Button, List, Card, Layout } from "antd";
import {
  SendOutlined,
  UserOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const { Content } = Layout;

export default function CustomerChatbox() {

  const userId = JSON.parse(localStorage.getItem("userInfo")).id;
  let { groupId } = useParams();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [connection, setConnection] = useState();
  console.log("test");




  useEffect(() => {
    const fetchData = async () => {
      const connection = new HubConnectionBuilder()
        .withUrl(`https://localhost:6019/chat`, {
          withCredentials: true
        })
        .configureLogging(LogLevel.Information)
        .build();

      console.log(connection);
      await connection.start();
      await connection.invoke("OnConnected", userId);
      await connection.invoke("JoinRoom", userId, groupId);
      setConnection(connection)


      connection.on("ReceiveMessage", (UserId, userName, message) => {
        console.log("message receive: ", message);
        const newMessage = {
          id: messages.length + 1,
          text: message,
          sender: UserId === userId ? "Customer" : "Agent",
        };
        setMessages(messages => [...messages, newMessage]);
      })




      const res = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/chat/message/${groupId}`);
      console.log(res.data.listMessage.result);
      const oldMessages = res.data.listMessage.result;

      const transformedMessages = oldMessages.map((message, index) => ({
        id: index + 1, // Assigning a unique id based on the index
        text: message.content, // Using the 'content' field as the 'text'
        sender: message.senderId === userId ? "Customer" : "Agent", // Using the 'senderName' field as the 'sender'
      }));

      setMessages(transformedMessages); // Update the messages state with oldMessages

      return () => {
        // Disconnect SignalR when the component unmounts (i.e., user navigates away)
        if (connection) {
            connection.stop()
                .then(() => console.log('Connection stopped'))
                .catch(err => console.error('Disconnection failed:', err));
        }
    };

    };
    fetchData();
  }, [groupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  window.addEventListener("beforeunload", function () {
    connection.stop()
  });

  useEffect(() => {
    window.addEventListener("popstate", () => {
      window.location.reload();
    });

    return () => {
      window.removeEventListener("popstate", () => {
        window.location.reload();
      });
    };
  }, [location]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     scrollToBottom();
  //   }, 100); 
  //   return () => clearTimeout(timer);
  // }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "") {

      setInputMessage("");

      await connection.invoke("SendMessage", inputMessage, groupId, userId);
      // Simulate agent response
      // setTimeout(() => {
      //   const agentResponse = {
      //     id: messages.length + 2,
      //     text: "Thank you for providing that information. I'm checking your order details now.",
      //     sender: "agent",
      //   };
      //   setMessages((prevMessages) => [...prevMessages, agentResponse]);
      // }, 1000);
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
                    item.sender === "Customer" ? "flex-end" : "flex-start",
                }}
              >
                <Card
                  style={{
                    maxWidth: "70%",
                    backgroundColor:
                      item.sender === "Customer" ? "#e6f7ff" : "#f0f0f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    {item.sender === "Customer" ? (
                      <UserOutlined style={{ marginRight: "8px" }} />
                    ) : (
                      <CustomerServiceOutlined style={{ marginRight: "8px" }} />
                    )}
                    <span style={{ fontWeight: "bold" }}>
                      {item.sender === "Customer" ? "" : "Agent"}
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