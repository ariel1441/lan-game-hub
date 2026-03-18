import { createBrowserRouter } from 'react-router-dom';
import { App } from '../App';
import { HomePage } from '../pages/HomePage';
import { HostPage } from '../pages/HostPage';
import { JoinPage } from '../pages/JoinPage';
import { RoomPage } from '../pages/RoomPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'host', element: <HostPage /> },
      { path: 'join', element: <JoinPage /> },
      { path: 'room/:roomCode', element: <RoomPage /> },
    ],
  },
]);
