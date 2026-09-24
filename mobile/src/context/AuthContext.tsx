import React, { createContext, useContext, useState, useEffect } from "react";
import { IUser } from "../types";
import { fetchDemoUsersApi } from "../api/client";

interface AuthContextType {
  currentUserId: string;
  currentUser: IUser | null;
  demoUsers: IUser[];
  language: "en" | "hi";
  switchUser: (userId: string) => void;
  setLanguage: (lang: "en" | "hi") => void;
  isLoadingUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to user_demo_2 so initial render matches Objective_Page.png (Registered, 1/20 Booked)
  const [currentUserId, setCurrentUserId] = useState<string>("user_demo_2");
  const [demoUsers, setDemoUsers] = useState<IUser[]>([]);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  useEffect(() => {
    fetchDemoUsersApi()
      .then((users) => {
        setDemoUsers(users);
        const match = users.find((u) => u.userId === currentUserId);
        if (match) setCurrentUser(match);
      })
      .finally(() => setIsLoadingUsers(false));
  }, []);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const match = demoUsers.find((u) => u.userId === userId);
    if (match) setCurrentUser(match);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUserId,
        currentUser,
        demoUsers,
        language,
        switchUser,
        setLanguage,
        isLoadingUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
