import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Config react-toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Config react-router-dom with BrowserRouter
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/">
    <GoogleOAuthProvider clientId="">
      <App />
    </GoogleOAuthProvider>
    <ToastContainer position="bottom-left" theme="colored" />
  </BrowserRouter>
);
