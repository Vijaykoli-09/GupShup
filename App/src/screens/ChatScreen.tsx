import React, { useRef, useState } from 'react';
import {
  Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, RootStackParamList } from '../shared';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

type Message = { id: string; user: string; text: string; time: Date };

const MY_USERNAME = 'SilentTiger482'; // demo public username of the logged-in user
const MAX_LENGTH = 500;
const ONLINE_COUNT = 24;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000);

const DUMMY_MESSAGES: Message[] = [
  { id: '1', user: 'BlueMoon173', text: 'Good morning Jaysingpur! Anyone knows a good mobile repair shop near the main market?', time: minutesAgo(95) },
  { id: '2', user: 'CrazyFalcon821', text: 'Try the shop near the bus stand. They fixed my screen in one day.', time: minutesAgo(90) },
  { id: '3', user: MY_USERNAME, text: 'Thanks, I will check it out today.', time: minutesAgo(86) },
  { id: '4', user: 'HiddenWolf394', text: 'Is the road work near the market completed?', time: minutesAgo(60) },
  { id: '5', user: 'SmartPanda621', text: 'I passed there this morning. Work is still going on, use the back lane.', time: minutesAgo(55) },
  { id: '6', user: 'MidnightRider287', text: 'Any good place for breakfast nearby? Looking for misal pav.', time: minutesAgo(30) },
  { id: '7', user: 'BlueMoon173', text: 'There is a small stall near the station, very tasty and cheap.', time: minutesAgo(26) },
];

const formatTime = (d: Date) => {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

export default function ChatScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const canSend = text.trim().length > 0;

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), user: MY_USERNAME, text: trimmed, time: new Date() },
    ]);
    setText('');
  };

  const onInfo = () =>
    Alert.alert(
      'Jaysingpur Community',
      `Public community chat\n${ONLINE_COUNT} people online\n\nMessages clear every day at 3:00 AM IST.`,
    );

  const renderItem = ({ item }: { item: Message }) => {
    const mine = item.user === MY_USERNAME;
    return (
      <View style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          {!mine && <Text style={styles.username}>{item.user}</Text>}
          <Text style={styles.msgText}>{item.text}</Text>
          <Text style={styles.time}>{formatTime(item.time)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.icon}>⚙</Text>
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>Jaysingpur Community</Text>
          <Text style={styles.status}>● {ONLINE_COUNT} people online</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={onInfo}>
          <Text style={styles.icon}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={styles.empty}>No messages yet. Say hello to your community!</Text>
          }
        />

        {/* Type bar */}
        <View style={styles.composer}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
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
            <Text style={styles.sendText}>Send</Text>
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
  icon: { color: colors.lavender, fontSize: 24 },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
  status: { color: colors.success, fontSize: 12, marginTop: 2 },

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