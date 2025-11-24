import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import ChatLayout from './layouts/chats';
import LoginPage from './pages/login';
import RouteProtection from './layouts/route-protection';
import ChatPage from './pages/chat-room';
import FriendRequestPage from './pages/me';
import GuildPage from './pages/guild';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';

const NotFound = () => (
  <Empty>
    <EmptyHeader>
      <EmptyTitle>404 - Not Found</EmptyTitle>
      <EmptyDescription>
        The page you&apos;re looking for doesn&apos;t exist. Try searching for
        what you need below.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <RouteProtection predicate={(token) => !!token} redirect="/me">
            <LoginPage />
          </RouteProtection>
        } />
        <Route path="/register" element={
          <RouteProtection predicate={(token) => !!token} redirect="/me">
            <LoginPage isRegister />
          </RouteProtection>
        } />
        <Route
          element={
            <RouteProtection>
              <ChatLayout />
            </RouteProtection>
          }
        >
          <Route path="/me" element={<FriendRequestPage />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
          <Route path="/guilds/:guildId" element={
            <Suspense fallback={<div>Loading...</div>}>
              <GuildPage />
            </Suspense>
          }>
            <Route path="chats/:chatId" element={<ChatPage />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/me" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
