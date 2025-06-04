import { useEffect, useRef, useState } from 'react';

export type ChatMessage = {
  user: string;
  text: string;
};

export function useLobby(name: string) {
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', name }));
      fetch('http://localhost:3001/history')
        .then((res) => res.json())
        .then((history) => {
          const chats = history.filter((e: any) => e.event === 'chat');
          setMessages(
            chats.map((c: any) => ({ user: c.user, text: c.message }))
          );
        })
        .catch(() => {
          // ignore errors fetching history
        });
    };

    socket.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'users') {
          setUsers(data.users);
        } else if (data.type === 'chat') {
          setMessages((m) => [...m, { user: data.user, text: data.message }]);
        }
      } catch {
        // ignore bad payloads
      }
    };

    return () => {
      socket.close();
    };
  }, [name]);

  const sendChat = (text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: 'chat', message: text })
      );
    }
  };

  return { users, messages, sendChat };
}
