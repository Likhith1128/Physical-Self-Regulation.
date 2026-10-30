import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Field } from '@/components/Field';
import { ReminderControls } from '@/components/ReminderControls';
import { SessionStatus } from '@/components/SessionStatus';
import { Bullets, Button, Card, CheckRow, colors, H1, H2, P, Pill, ProgressBar, Screen } from '@/components/ui';
import { BREATHING, EXERCISES, MONITORING_STRATEGIES, SESSION_TEXT } from '@/lib/content';
import { dateKey, lastNDays, shortLabel } from '@/lib/date';
import { daysSince, pct, summarize } from '@/lib/stats';
import { AppState, useStore } from '@/lib/store';

type Goal = AppState['plan']['goals'][number];

function HomeworkReview() {
  const { state, update } = useStore();
  const start = state.sessions.session1;
  const end = state.sessions.session2 ?? dateKey();
  const keys = start ? daysSince(start, end) : lastNDays(7);
  const s = summarize(state, keys);
  const strategies = MONITORING_STRATEGIES.filter((m) => state.strategies[m.id]);

  return (
    <Card>
      <H2 icon="clipboard-outline">Review of Session 1 homework</H2>
      <P muted>
        {start ? `Since Session 1 (${shortLabel(start)}) · ${s.days} day${s.days === 1 ? '' : 's'}` : 'Last 7 days'}
      </P>

      <Text style={{ fontWeight: '600', color: colors.text }}>Stretch practice (target 5×/day)</Text>
      {EXERCISES.map((e) => {
        const stopped = state.discontinued[e.id];
        return (
          <View key={e.id} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, flex: 1 }}>{e.title}</Text>
              <Text style={{ color: colors.muted }}>{stopped ? 'Discontinued' : pct(s.exerciseAdherence[e.id])}</Text>
            </View>
            {!stopped && <ProgressBar value={s.exerciseAdherence[e.id]} max={1} />}
          </View>
        );
      })}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
        <Pill text={`${s.avgClenchEpisodes.toFixed(1)} clenching episodes/day`} color={colors.danger} bg={colors.dangerSoft} />
        <Pill text={`${s.totalCheckIns} jaw check-ins`} />
        {s.avgPain !== null && <Pill text={`Avg pain ${s.avgPain.toFixed(1)}/10`} color={colors.warning} bg={colors.warningSoft} />}
      </View>

      <Text style={{ fontWeight: '600', color: colors.text, marginTop: 4 }}>Monitoring strategies used</Text>
      <P muted>
        {strategies.length ? strategies.map((m) => m.title).join(' · ') : 'None selected'}
        {state.strategies.anchors && state.habitAnchors.length ? `\nAnchors: ${state.habitAnchors.join(', ')}` : ''}
      </P>

      <Text style={{ fontWeight: '600', color: colors.text, marginTop: 4 }}>Reflection</Text>
      <Field
        multiline
        value={state.plan.review}
        onChangeText={(t) => update((st) => ({ ...st, plan: { ...st.plan, review: t } }))}
        placeholder="What went well? What got in the way? Did any exercise increase pain?"
      />
      <Button title="Practice the stretches again" variant="ghost" icon="body-outline" onPress={() => router.push('/session1')} />
    </Card>
  );
}

function TreatmentPlanning() {
  const { state, update } = useStore();
  const [goal, setGoal] = useState('');

  const addGoal = () => {
    const text = goal.trim();
    if (!text) return;
    update((s) => ({
      ...s,
      plan: { ...s.plan, goals: [...s.plan.goals, { id: String(Date.now()), text, done: false }] },
    }));
    setGoal('');
  };

  const setGoals = (fn: (g: Goal[]) => Goal[]) =>
    update((s) => ({ ...s, plan: { ...s.plan, goals: fn(s.plan.goals) } }));

  return (
    <Card>
      <H2 icon="map-outline">Treatment planning</H2>
      <P muted>Record any additional goals and plans agreed with your interventionist.</P>
      {state.plan.goals.map((g) => (
        <View key={g.id} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <CheckRow
              checked={g.done}
              label={g.text}
              onToggle={() => setGoals((gs) => gs.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)))}
            />
          </View>
          <Pressable
            accessibilityLabel="Remove goal"
            onPress={() => setGoals((gs) => gs.filter((x) => x.id !== g.id))}
            style={{ padding: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.muted} />
          </Pressable>
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Field value={goal} onChangeText={setGoal} onSubmitEditing={addGoal} placeholder="Add a goal…" style={{ flex: 1 }} />
        <Button title="Add" variant="secondary" onPress={addGoal} />
      </View>
      <Field
        multiline
        value={state.plan.notes}
        onChangeText={(t) => update((s) => ({ ...s, plan: { ...s.plan, notes: t } }))}
        placeholder="Notes from your session…"
      />
    </Card>
  );
}

export default function Session2Screen() {
  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <H1>Session 2</H1>
        <P muted>Homework review, diaphragmatic breathing, and treatment planning.</P>
      </View>

      <SessionStatus session="session2" label="Session 2" />

      <HomeworkReview />

      <Card>
        <H2 icon="leaf-outline" color={colors.teal}>
          Diaphragmatic breathing
        </H2>
        <P>{BREATHING.intro}</P>
        <Bullets items={BREATHING.steps} numbered />
        <Button title="Practice now" icon="play" onPress={() => router.push('/breathing')} />
      </Card>

      <Card>
        <H2 icon="alarm-outline" color={colors.teal}>
          Breathing reminders
        </H2>
        <ReminderControls fields={['breathingReminders']} />
      </Card>

      <Card style={{ borderColor: colors.warning }}>
        <H2 icon="clipboard-outline" color={colors.warning}>
          Homework
        </H2>
        <Bullets items={SESSION_TEXT.session2Homework} />
      </Card>

      <TreatmentPlanning />
    </Screen>
  );
}
