import React, { useState, useRef, useEffect } from "react";
import { Input, Button, List, Card, Layout, Menu, Empty, Badge } from "antd";
import {
  SendOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const { Content, Sider } = Layout;

export default function AdminChatBox() {
  const [groupId, setGroupId] = useState();
  const userId = JSON.parse(localStorage.getItem("userInfo")).id;

  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [connection, setConnection] = useState();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    async function fetchData() {
      const res = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/chat/group`);
      const group = res.data.response.result;
      const transformedGroup = group.map((group, index) => ({
        id: index + 1,
        name: group.groupName,
        groupId: group.groupId,
      }));
      setChatUsers(transformedGroup);
      const notifi = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/chat/notify`);
      const unreadCountData = notifi.data.result.result
      // Initialize unread counts
      const initialUnreadCounts = {}
      unreadCountData.forEach(item => {
        initialUnreadCounts[item.groupId] = item.count
      });
      setUnreadCounts(initialUnreadCounts);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {

      const connection = new HubConnectionBuilder()
        .withUrl(`https://localhost:6019/chat`, {
          withCredentials: true
        })
        .configureLogging(LogLevel.Information)
        .build();

      await connection.start();
      await connection.invoke("OnConnected", userId);
      if (groupId) {
        await connection.invoke("JoinRoom", userId, groupId);
        setConnection(connection);
      }
      connection.on("ReceiveMessage", (UserId, userName, message) => {
        const newMessage = {
          id: messages.length + 1,
          text: message,
          sender: userName,
          senderId: UserId,
        };
        setMessages(messages => [...messages, newMessage]);

      });

      connection.on("ReceiveNotifyTotal", (totalNotify) => {
        const handlerNotify = async () => {
          const notifi = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/chat/notify`);
          const unreadCountData = notifi.data.result.result
          // Initialize unread counts
          const initialUnreadCounts = {}
          unreadCountData.forEach(item => {
            initialUnreadCounts[item.groupId] = item.count
          });
          setUnreadCounts(initialUnreadCounts);
          console.log(unreadCountData)
        }
        handlerNotify()

      })



      const res = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/chat/message/${groupId}`);
      const oldMessages = res.data.listMessage.result;

      const transformedMessages = oldMessages.map((message, index) => ({
        id: index + 1,
        text: message.content,
        sender: message.senderName,
        senderId: message.senderId
      }));

      setMessages(transformedMessages);
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
  }, [groupId])

  useEffect(()=>{
    const outGroup = async () =>{
      if(connection){
        connection.stop()
      }
    }
    outGroup()
  },[groupId])


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


  window.addEventListener("beforeunload", function () {
    connection.stop()
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      setInputMessage("");
      await connection.invoke("SendMessage", inputMessage, groupId, userId);
    }
  };

  const handleUserSelect = (groupId) => {
    setSelectedUser(chatUsers.find((user) => user.groupId === groupId));
    setGroupId(groupId);
    // Reset unread count when selecting a user
    setUnreadCounts(prevCounts => ({
      ...prevCounts,
      [groupId]: 0
    }));
  };

  return (
    <Layout style={{ minHeight: "100vh", padding: "24px", background: "#f0f2f5" }}>
      <Card
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          height: "calc(100vh - 48px)",
        }}
        bodyStyle={{ padding: 0, height: "100%" }}
      >
        <Layout style={{ height: "100%", background: "white" }}>
          <Sider width={250} theme="light" style={{ borderRight: "1px solid #f0f0f0" }}>
            <div
              style={{
                padding: "16px",
                fontWeight: "bold",
                fontSize: "18px",
                textAlign: "center",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              Chat Users ({chatUsers.length})
            </div>
            <Menu
              mode="inline"
              selectedKeys={selectedUser ? [selectedUser.groupId] : []}
              onClick={({ key }) => handleUserSelect(key)}
              style={{ borderRight: "none" }}
            >
              {chatUsers.map((user) => (
                <Menu.Item
                  key={user.groupId}
                  icon={
                    <Badge count={unreadCounts[user.groupId] || 0} size="small">
                      <MessageOutlined />
                    </Badge>
                  }
                >
                  {user.name}
                </Menu.Item>
              ))}
            </Menu>
          </Sider>
          <Layout style={{ background: "white" }}>
            <Content style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0", textAlign: "center" }}>
                <h2 style={{ margin: 0 }}>
                  {selectedUser ? `Chat with ${selectedUser.name}` : "Customer Support Chat"}
                </h2>
              </div>
              {selectedUser ? (
                <>
                  <List
                    itemLayout="horizontal"
                    dataSource={messages}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          justifyContent: item.senderId === userId ? "flex-end" : "flex-start",
                          padding: "8px 16px",
                        }}
                      >
                        <Card
                          style={{
                            maxWidth: "70%",
                            backgroundColor: item.senderId === userId ? "#e6f7ff" : "#f0f0f0",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                            {item.senderId === userId ? (
                              <UserOutlined style={{ marginRight: "8px" }} />
                            ) : (
                              <CustomerServiceOutlined style={{ marginRight: "8px" }} />
                            )}
                            <span style={{ fontWeight: "bold" }}>{item.sender}</span>
                          </div>
                          {item.text}
                        </Card>
                      </List.Item>
                    )}
                    style={{ flexGrow: 1, overflowY: "auto", padding: "16px 0" }}
                  />
                  <div ref={messagesEndRef} />
                  <div style={{ display: "flex", padding: "16px", borderTop: "1px solid #f0f0f0" }}>
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onPressEnter={handleSendMessage}
                      placeholder="Type your message here..."
                      style={{ flexGrow: 1, marginRight: 8 }}
                    />
                    <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage}>
                      Send
                    </Button>
                  </div>
                </>
              ) : (
                <Empty description="Select a user to start chatting" style={{ margin: "auto" }} />
              )}
            </Content>
          </Layout>
        </Layout>
      </Card>
    </Layout>
  );
}