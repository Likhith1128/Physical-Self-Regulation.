import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ReminderControls } from '@/components/ReminderControls';
import { SessionStatus } from '@/components/SessionStatus';
import { Bullets, Button, Card, CheckRow, colors, H1, H2, P, Pill, Screen } from '@/components/ui';
import {
  CLENCHING_EDUCATION,
  EXERCISES,
  MONITORING_STRATEGIES,
  SESSION_TEXT,
  SUGGESTED_ANCHORS,
} from '@/lib/content';
import { useStore } from '@/lib/store';

function HabitAnchors() {
  const { state, update } = useStore();
  const [custom, setCustom] = useState('');
  const anchors = state.habitAnchors;

  const toggle = (a: string) =>
    update((s) => ({
      ...s,
      habitAnchors: s.habitAnchors.includes(a) ? s.habitAnchors.filter((x) => x !== a) : [...s.habitAnchors, a],
    }));

  const addCustom = () => {
    const text = custom.trim();
    if (text && !anchors.includes(text)) toggle(text);
    setCustom('');
  };

  const options = [...SUGGESTED_ANCHORS, ...anchors.filter((a) => !SUGGESTED_ANCHORS.includes(a))];

  return (
    <View style={{ gap: 8, marginLeft: 34 }}>
      <P muted>Pick the everyday moments that will remind you to check your jaw:</P>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((a) => {
          const on = anchors.includes(a);
          return (
            <Pressable
              key={a}
              onPress={() => toggle(a)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: on ? colors.primary : colors.border,
                backgroundColor: on ? colors.primarySoft : colors.card,
              }}
            >
              <Text style={{ color: on ? colors.primary : colors.text }}>{a}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={custom}
          onChangeText={setCustom}
          onSubmitEditing={addCustom}
          placeholder="Add your own…"
          placeholderTextColor={colors.muted}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 15,
            color: colors.text,
          }}
        />
        <Button title="Add" variant="secondary" onPress={addCustom} />
      </View>
    </View>
  );
}

export default function Session1Screen() {
  const { state, update } = useStore();

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <H1>Session 1</H1>
        <P muted>Clenching awareness, monitoring habits, and stretching exercises.</P>
      </View>

      <SessionStatus session="session1" label="Session 1" />

      <Card>
        <H2 icon="eye-outline">Clenching awareness</H2>
        <P>{CLENCHING_EDUCATION.intro}</P>
        <View style={{ backgroundColor: colors.successSoft, borderRadius: 12, padding: 12, gap: 4 }}>
          <Text style={{ fontWeight: '700', color: colors.success }}>{CLENCHING_EDUCATION.restPosition.title}</Text>
          <P>{CLENCHING_EDUCATION.restPosition.text}</P>
        </View>
        <Text style={{ fontWeight: '600', color: colors.text }}>Signs you may be clenching:</Text>
        <Bullets items={CLENCHING_EDUCATION.signs} />
      </Card>

      <Card>
        <H2 icon="checkbox-outline">Monitoring strategies</H2>
        <P muted>Choose the strategies you will use to monitor jaw activity until your next session.</P>
        {MONITORING_STRATEGIES.map((s) => (
          <View key={s.id}>
            <CheckRow
              checked={state.strategies[s.id]}
              label={s.title}
              description={s.description}
              onToggle={() => update((st) => ({ ...st, strategies: { ...st.strategies, [s.id]: !st.strategies[s.id] } }))}
            />
            {s.id === 'anchors' && state.strategies.anchors && <HabitAnchors />}
            {s.id === 'tracking' && state.strategies.tracking && (
              <View style={{ marginLeft: 34 }}>
                <Button
                  title="Track on the Today screen"
                  variant="ghost"
                  icon="arrow-forward"
                  onPress={() => router.push('/')}
                  style={{ alignSelf: 'flex-start' }}
                />
              </View>
            )}
          </View>
        ))}
      </Card>

      <Card>
        <H2 icon="alarm-outline">Reminders</H2>
        <P muted>Set a recurring alarm to check in on your jaw, and optional reminders for your stretches.</P>
        <ReminderControls fields={['clenchCheckIns', 'exerciseReminders']} />
      </Card>

      <Card>
        <H2 icon="body-outline">Stretching exercises</H2>
        <P muted>
          Three stretches to relax the masseters, neck, and upper back – developed with physical therapists to reduce
          muscle activity in the jaw region. Practice each one 5 times a day.
        </P>
        {EXERCISES.map((e, i) => {
          const stopped = !!state.discontinued[e.id];
          return (
            <Pressable
              key={e.id}
              onPress={() => router.push(`/exercise/${e.id}`)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 12,
                backgroundColor: colors.bg,
                opacity: pressed ? 0.7 : 1,
                gap: 12,
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontWeight: '600', fontSize: 15, color: colors.text }}>{e.title}</Text>
                <Text style={{ color: colors.muted }}>{e.target}</Text>
                {stopped && <Pill text="Discontinued" color={colors.danger} bg={colors.dangerSoft} />}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          );
        })}
      </Card>

      <Card style={{ borderColor: colors.warning }}>
        <H2 icon="clipboard-outline" color={colors.warning}>
          Homework until Session 2
        </H2>
        <Bullets items={SESSION_TEXT.session1Homework} />
      </Card>
    </Screen>
  );
}
