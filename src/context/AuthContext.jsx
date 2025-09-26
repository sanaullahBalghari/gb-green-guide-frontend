
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// 🔹 Helper function to check token expiry
const isTokenExpired = (token) => {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    if (!payload.exp) return true;

    const now = Date.now() / 1000; // seconds
    return payload.exp < now; // true agar expire ho gaya hai
  } catch (e) {
    return true; // invalid token ko expired treat karo
  }
};

export const AuthProvider = ({ children }) => {
  // ✅ Load from localStorage
  let storedData = localStorage.getItem("userData");
  let parsedData = storedData ? JSON.parse(storedData) : null;

  // ✅ Check expiry at app start
  if (parsedData?.token && isTokenExpired(parsedData.token)) {
    parsedData = null;
    localStorage.removeItem("userData");
  }

  const [user, setUser] = useState(parsedData?.user || null);
  const [token, setToken] = useState(parsedData?.token || null);

  // 🔹 Login function
  const login = (backendResponse) => {
    const { user: userData, access } = backendResponse;

    setUser(userData);
    setToken(access);

    localStorage.setItem("userData", JSON.stringify({ user: userData, token: access }));
  };

  // 🔹 Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("userData");
  };

  // ✅ Check expiry whenever token changes
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      console.log("⛔ Token expired, logging out...");
      logout();
    }
  }, [token]);

  // ✅ Keep localStorage in sync
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("userData", JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem("userData");
    }
  }, [user, token]);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const storedData = localStorage.getItem("userData");
//   const parsedData = storedData ? JSON.parse(storedData) : null;

//   const [user, setUser] = useState(parsedData?.user || null);
//   const [token, setToken] = useState(parsedData?.token || null);

//   // Login function to handle backend response correctly
//   const login = (backendResponse) => {
//     const { user: userData, access } = backendResponse;
    
//     // Store user and token (backend sends token as 'access')
//     setUser(userData);
//     setToken(access);
    
//     // Also store in localStorage
//     localStorage.setItem("userData", JSON.stringify({ 
//       user: userData, 
//       token: access 
//     }));
//   };

//   // Logout function
//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem("userData");
//   };

//   // Save/update localStorage whenever user or token changes
//   useEffect(() => {
//     if (user && token) {
//       localStorage.setItem("userData", JSON.stringify({ user, token }));
//     } else {
//       localStorage.removeItem("userData");
//     }
//   }, [user, token]);

//   return (
//     <AuthContext.Provider value={{ 
//       user, 
//       setUser, 
//       token, 
//       setToken, 
//       login, 
//       logout 
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);