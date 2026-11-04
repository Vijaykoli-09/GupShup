import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, AlertButton, FlatList, KeyboardAvoidingView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Client } from '@stomp/stompjs';
import { colors, RootStackParamList } from '../shared';
import { chatApi, ChatMessage, errMsg, getToken, userApi, WS_URL } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const MAX_LENGTH = 500;

const formatTime = (iso: string) => {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

export default function ChatScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [me, setMe] = useState('');
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const load = useCallback(async () => {
    try {
      const [profile, list] = await Promise.all([userApi.me(), chatApi.messages()]);
      setMe(profile.publicUsername);
      setMessages(list);
      setError('');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever the screen is shown (for example after changing username in Settings).
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Live messages over WebSocket.
  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${getToken()}` },
      reconnectDelay: 5000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      onConnect: () => {
        setLive(true);
        load(); // catch up on anything missed while offline
        client.subscribe('/topic/chat', frame => {
          const ev = JSON.parse(frame.body) as ChatMessage;
          setMessages(prev => (prev.some(m => m.id === ev.id) ? prev : [...prev, ev]));
        });
        client.subscribe('/topic/chat.deleted', frame => {
          const { id } = JSON.parse(frame.body) as { id: number };
          setMessages(prev => prev.filter(m => m.id !== id));
        });
      },
      onWebSocketClose: () => setLive(false),
    });
    client.activate();
    return () => { client.deactivate(); };
  }, [load]);

  const canSend = text.trim().length > 0 && !sending;

  const onSend = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setError('');
    try {
      const saved = await chatApi.send(t, replyTo ? replyTo.id : null);
      setMessages(prev => (prev.some(m => m.id === saved.id) ? prev : [...prev, saved]));
      setText('');
      setReplyTo(null);
    } catch (e) {
      setError(errMsg(e)); // slow mode, banned, consent and similar messages come from the server
    } finally {
      setSending(false);
    }
  };

  const confirmDelete = (m: ChatMessage) =>
    Alert.alert('Delete message?', 'This removes it for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await chatApi.remove(m.id);
            setMessages(prev => prev.filter(x => x.id !== m.id));
          } catch (e) {
            setError(errMsg(e));
          }
        },
      },
    ]);

  const onLongPress = (m: ChatMessage) => {
    const buttons: AlertButton[] = [{ text: 'Reply', onPress: () => setReplyTo(m) }];
    if (m.username === me) {
      buttons.push({ text: 'Delete', style: 'destructive', onPress: () => confirmDelete(m) });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Message', undefined, buttons);
  };

  const onInfo = () =>
    Alert.alert(
      'Sambhajipur Community',
      'Public community chat.\n\nMessages clear every day at 3:00 AM IST.',
    );

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const mine = item.username === me;
    return (
      <View style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onLongPress={() => onLongPress(item)}
          style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          {!mine && <Text style={styles.username}>{item.username}</Text>}
          {item.replyToId !== null && (
            <View style={styles.quote}>
              <Text style={styles.quoteUser}>{item.replyToUsername}</Text>
              <Text style={styles.quoteText} numberOfLines={2}>{item.replyToText}</Text>
            </View>
          )}
          <Text style={styles.msgText}>{item.text}</Text>
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.icon}>⚙</Text>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Sambhajipur Community</Text>
          <Text style={[styles.status, { color: live ? colors.success : colors.subText }]}>
            {live ? '● Live' : '○ Connecting...'}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={onInfo}>
          <Text style={styles.icon}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => String(m.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {loading ? 'Loading...' : 'No messages yet. Say hello to your community!'}
            </Text>
          }
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        {replyTo && (
          <View style={styles.replyBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.quoteUser}>Replying to {replyTo.username}</Text>
              <Text style={styles.quoteText} numberOfLines={1}>{replyTo.text}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)} style={styles.iconBtn}>
              <Text style={styles.icon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.composer}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={t => { setText(t); setError(''); }}
              placeholder="Type a message"
              placeholderTextColor={colors.subText}
              multiline
              maxLength={MAX_LENGTH}
            />
            {text.length > 400 && (
              <Text style={styles.counter}>{text.length}/{MAX_LENGTH}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !canSend && { opacity: 0.4 }]}
            disabled={!canSend}
            onPress={onSend}>
            <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  icon: { color: colors.lavender, fontSize: 22 },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
  status: { fontSize: 12, marginTop: 2 },

  list: { padding: 12, flexGrow: 1 },
  empty: { color: colors.subText, textAlign: 'center', marginTop: 40 },
  row: { marginBottom: 10, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  username: { color: colors.lavender, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  msgText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  time: { color: 'rgba(255,255,255,0.6)', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },

  quote: {
    backgroundColor: 'rgba(0,0,0,0.25)', borderLeftWidth: 3, borderLeftColor: colors.lavender,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6,
  },
  quoteUser: { color: colors.lavender, fontSize: 12, fontWeight: '700' },
  quoteText: { color: colors.subText, fontSize: 12 },

  error: { color: colors.error, fontSize: 13, paddingHorizontal: 14, paddingBottom: 6 },
  replyBar: {
    flexDirection: 'row', alignItems: 'center', paddingLeft: 14,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },

  composer: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 10,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg,
  },
  inputWrap: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 22,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, marginRight: 8,
  },
  input: { color: colors.text, fontSize: 15, maxHeight: 110, minHeight: 44, paddingVertical: 10 },
  counter: { color: colors.warning, fontSize: 11, alignSelf: 'flex-end', marginBottom: 4 },
  sendBtn: {
    height: 44, paddingHorizontal: 18, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendText: { color: colors.text, fontSize: 15, fontWeight: '700' },
});