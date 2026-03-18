import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { RoomProvider } from './providers/RoomProvider';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RoomProvider>
      <RouterProvider router={router} />
    </RoomProvider>
  </React.StrictMode>,
);
