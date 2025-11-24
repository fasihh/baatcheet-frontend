import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import ChatLayout from './layouts/chats';
import LoginPage from './pages/login';
import RouteProtection from './layouts/route-protection';
import ChatPage from './pages/chat-room';
import FriendRequestPage from './pages/me';
import GuildPage from './pages/guild';

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage isRegister />} />
        <Route
          element={
            <RouteProtection>
              <ChatLayout />
            </RouteProtection>
          }
        >
          <Route path="/me" element={<FriendRequestPage />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
          <Route path="/guilds/:guildId" element={<GuildPage />}>
            <Route path="chats/:chatId" element={<ChatPage />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/me" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
