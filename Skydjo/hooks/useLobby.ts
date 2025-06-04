import { useRef, useState } from 'react';

export type ChatMessage = {
  user: string;
  text: string;
};

export function useLobby(name: string) {
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = (lobbyCode: string, create: boolean) => {
    const socket = new WebSocket('ws://localhost:3001');
    socketRef.current = socket;
    setCode(lobbyCode);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: create ? 'create' : 'join',
          name,
          code: lobbyCode,
        })
      );
      fetch(`http://localhost:3001/history/${lobbyCode}`)
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
          setIsHost(data.host === name);
        } else if (data.type === 'chat') {
          setMessages((m) => [...m, { user: data.user, text: data.message }]);
        } else if (data.type === 'created') {
          setCode(data.code);
        }
      } catch {
        // ignore bad payloads
      }
    };
  };

  const sendChat = (text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: 'chat', message: text })
      );
    }
  };

  const startGame = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'start' }));
    }
  };

  const disconnect = () => {
    socketRef.current?.close();
    setUsers([]);
    setMessages([]);
    setCode(null);
  };

  return { connect, users, messages, sendChat, startGame, code, isHost, disconnect };
}
