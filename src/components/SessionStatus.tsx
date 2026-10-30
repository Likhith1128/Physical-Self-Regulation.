import { View } from 'react-native';

import { Button, Card, colors, confirm, P, Pill } from '@/components/ui';
import { dateKey, shortLabel } from '@/lib/date';
import { useStore } from '@/lib/store';

export function SessionStatus({ session, label }: { session: 'session1' | 'session2'; label: string }) {
  const { state, update } = useStore();
  const completed = state.sessions[session];

  const setCompleted = (value: string | null) =>
    update((s) => ({ ...s, sessions: { ...s.sessions, [session]: value } }));

  return (
    <Card>
      {completed ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <Pill text={`${label} completed ${shortLabel(completed)}`} color={colors.success} bg={colors.successSoft} />
          <Button
            title="Undo"
            variant="ghost"
            onPress={() => confirm('Undo', `Mark ${label} as not completed?`, () => setCompleted(null), 'Undo')}
          />
        </View>
      ) : (
        <>
          <P muted>Work through this session with your interventionist, then mark it complete.</P>
          <Button title={`Mark ${label} complete`} icon="checkmark-done" onPress={() => setCompleted(dateKey())} />
        </>
      )}
    </Card>
  );
}
