import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { AppButton, colors } from '../shared';
import { errMsg } from '../api';

// ---------- Action sheet (long-press menu) ----------
export type SheetAction = { label: string; danger?: boolean; onPress: () => void };

export function ActionSheet({
  visible, title, actions, onClose,
}: { visible: boolean; title: string; actions: SheetAction[]; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet}>
          <Text style={s.title}>{title}</Text>
          {actions.map(a => (
            <TouchableOpacity key={a.label} style={s.action} onPress={a.onPress}>
              <Text style={[s.actionText, a.danger && { color: colors.error }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.action} onPress={onClose}>
            <Text style={[s.actionText, { color: colors.subText }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------- Report sheet ----------
const REASONS: { value: string; label: string }[] = [
  { value: 'ABUSIVE_LANGUAGE', label: 'Abusive language' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'THREATS', label: 'Threats' },
  { value: 'FAKE_INFORMATION', label: 'Fake or misleading information' },
  { value: 'PERSONAL_INFORMATION', label: 'Sharing personal information' },
  { value: 'HATE_SPEECH', label: 'Hate speech' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'SEXUAL_HARASSMENT', label: 'Sexual harassment' },
  { value: 'OTHER', label: 'Other' },
];

export function ReportSheet({
  visible, title, onClose, onSubmit,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) { setReason(''); setDescription(''); setError(''); setBusy(false); }
  }, [visible]);

  const submit = async () => {
    if (!reason) return setError('Please select a reason');
    setBusy(true);
    setError('');
    try {
      await onSubmit(reason, description.trim());
      onClose();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <Pressable style={s.overlay} onPress={onClose}>
          <Pressable style={[s.sheet, { maxHeight: '85%' }]}>
            <Text style={s.title}>{title}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {REASONS.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={s.reasonRow}
                  onPress={() => { setReason(r.value); setError(''); }}>
                  <View style={[s.radio, reason === r.value && s.radioOn]} />
                  <Text style={s.actionText}>{r.label}</Text>
                </TouchableOpacity>
              ))}
              <TextInput
                style={s.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details (optional)"
                placeholderTextColor={colors.subText}
                maxLength={300}
                multiline
              />
            </ScrollView>
            {!!error && <Text style={s.error}>{error}</Text>}
            <AppButton title={busy ? 'Submitting...' : 'Submit report'} onPress={submit} disabled={busy} />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 8 },
  action: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border },
  actionText: { color: colors.text, fontSize: 16 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, marginRight: 12,
  },
  radioOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    color: colors.text, padding: 12, minHeight: 70, marginVertical: 10, textAlignVertical: 'top',
  },
  error: { color: colors.error, fontSize: 13, marginBottom: 8 },
});