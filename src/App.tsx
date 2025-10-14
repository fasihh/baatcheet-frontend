import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import ChatLayout from './layouts/chats';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import RouteProtection from './layouts/route-protection';
import ChatPage from './pages/chat-room';

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
        <Route
          element={
            <RouteProtection>
              <ChatLayout />
            </RouteProtection>
          }
        >
          <Route path="/chats" element={<HomePage />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/chats" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
