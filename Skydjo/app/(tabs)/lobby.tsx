import { useState } from 'react';
import { Button, FlatList, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLobby } from '@/hooks/useLobby';

export default function LobbyScreen() {
  const [name] = useState('Player-' + Math.floor(Math.random() * 1000));
  const [text, setText] = useState('');
  const { users, messages, sendChat } = useLobby(name);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Lobby</ThemedText>
      <ThemedText>Connected as {name}</ThemedText>
      <ThemedText type="subtitle">Users</ThemedText>
      <FlatList
        data={users}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <ThemedText>{item}</ThemedText>}
        style={styles.list}
      />
      <ThemedText type="subtitle">Chat</ThemedText>
      <FlatList
        data={messages}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={({ item }) => (
          <ThemedText>
            {item.user}: {item.text}
          </ThemedText>
        )}
        style={styles.list}
      />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Say something"
        style={styles.input}
      />
      <Button
        title="Send"
        onPress={() => {
          if (text.trim()) {
            sendChat(text.trim());
            setText('');
          }
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    marginBottom: 8,
  },
});
