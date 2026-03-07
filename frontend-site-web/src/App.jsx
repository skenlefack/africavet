import React from "react";
import Router from "./Router";
import { AppProvider } from "./context/AppContext";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <NotificationProvider>
          <DataProvider>
            <Router />
          </DataProvider>
        </NotificationProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
