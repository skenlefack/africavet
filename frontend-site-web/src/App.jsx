import React from "react";
import Router from "./Router";
import { AppProvider } from "./context/AppContext";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { OpportunityAccessProvider } from "./component/opportunities/OpportunityAccessGate";

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <OpportunityAccessProvider>
          <NotificationProvider>
            <DataProvider>
              <Router />
            </DataProvider>
          </NotificationProvider>
        </OpportunityAccessProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
