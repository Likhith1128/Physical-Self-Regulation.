import { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';

import { Button, Card, colors, confirm, H1, H2, notify, P, Pill, Screen } from '@/components/ui';
import { DAILY_TARGETS, EXERCISES } from '@/lib/content';
import { lastNDays, shortLabel } from '@/lib/date';
import { applyReminders } from '@/lib/notifications';
import { pct, summarize } from '@/lib/stats';
import { AppState, DayLog, emptyDay, useStore } from '@/lib/store';

const RANGES = [7, 14, 30];

function BarChart({ keys, values, max, color, goal }: {
  keys: string[];
  values: number[];
  max: number;
  color: string;
  goal?: number;
}) {
  const top = Math.max(max, goal ?? 0, 1);
  const dense = keys.length > 14;
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: dense ? 2 : 6 }}>
        {values.map((v, i) => (
          <View key={keys[i]} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            {!dense && v > 0 && <Text style={{ fontSize: 10, color: colors.muted }}>{Math.round(v)}</Text>}
            <View
              style={{
                width: '100%',
                height: `${(v / top) * 100}%`,
                minHeight: v > 0 ? 3 : 0,
                backgroundColor: goal !== undefined && v >= goal ? colors.success : color,
                borderRadius: 4,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: dense ? 2 : 6, marginTop: 4 }}>
        {keys.map((k, i) => (
          <Text key={k} style={{ flex: 1, fontSize: 10, color: colors.muted, textAlign: 'center' }} numberOfLines={1}>
            {dense ? (i % 5 === 0 ? k.slice(8) : '') : shortLabel(k).split(' ')[0].slice(0, 2)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function buildReport(state: AppState, keys: string[]) {
  const s = summarize(state, keys);
  const lines = [
    `PSR progress report (${shortLabel(keys[0])} – ${shortLabel(keys[keys.length - 1])}, ${keys.length} days)`,
    '',
    'Stretch adherence (target 5×/day):',
    ...EXERCISES.map(
      (e) => `  • ${e.title}: ${state.discontinued[e.id] ? 'discontinued (increased pain)' : pct(s.exerciseAdherence[e.id])}`,
    ),
    `Clenching episodes: ${s.avgClenchEpisodes.toFixed(1)} per day (${s.totalCheckIns} check-ins)`,
    `Diaphragmatic breathing: ${s.avgBreathingMinutes.toFixed(1)} min/day, ${s.breathingSessions} full sessions`,
    `Average jaw pain: ${s.avgPain === null ? 'not rated' : `${s.avgPain.toFixed(1)}/10`}`,
    '',
    'Daily log (date: stretches, clench episodes, breathing min, pain):',
    ...keys.map((k) => {
      const d: DayLog = state.logs[k] ?? emptyDay();
      const stretches = EXERCISES.map((e) => d.exercises[e.id]).join('/');
      return `  ${k}: ${stretches}, ${d.clenchEpisodes}, ${d.breathingMinutes}, ${d.painRating ?? '-'}`;
    }),
  ];
  if (state.plan.goals.length) {
    lines.push('', 'Treatment goals:', ...state.plan.goals.map((g) => `  [${g.done ? 'x' : ' '}] ${g.text}`));
  }
  return lines.join('\n');
}

export default function ProgressScreen() {
  const { state, reset } = useStore();
  const [range, setRange] = useState(7);
  const keys = lastNDays(range);
  const logs = keys.map((k) => state.logs[k] ?? emptyDay());
  const s = summarize(state, keys);
  const target = DAILY_TARGETS.exercisePracticesPerDay;

  const stretches = logs.map((d) => EXERCISES.reduce((t, e) => t + Math.min(target, d.exercises[e.id]), 0));
  const clench = logs.map((d) => d.clenchEpisodes);
  const breathing = logs.map((d) => d.breathingMinutes);
  const pain = logs.map((d) => d.painRating ?? 0);
  const breathingGoal = DAILY_TARGETS.breathingSessionsPerDay * DAILY_TARGETS.breathingSessionMinutes;

  const share = async () => {
    const message = buildReport(state, keys);
    try {
      await Share.share({ message, title: 'PSR progress report' });
    } catch {
      notify('PSR progress report', message);
    }
  };

  const resetAll = () =>
    confirm('Reset all data?', 'This permanently deletes your logs, settings, and notes on this device.', () => {
      reset();
      applyReminders({ ...state.reminders, clenchCheckIns: false, exerciseReminders: false, breathingReminders: false });
    }, 'Delete');

  return (
    <Screen>
      <H1>Progress</H1>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {RANGES.map((r) => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: r === range ? colors.primary : colors.primarySoft,
            }}
          >
            <Text style={{ color: r === range ? '#fff' : colors.primary, fontWeight: '600' }}>{r} days</Text>
          </Pressable>
        ))}
      </View>

      <Card>
        <H2 icon="body-outline">Stretch practices per day</H2>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {EXERCISES.map((e) => (
            <Pill
              key={e.id}
              text={`${e.title.split(' (')[0]}: ${state.discontinued[e.id] ? 'stopped' : pct(s.exerciseAdherence[e.id])}`}
            />
          ))}
        </View>
        <BarChart keys={keys} values={stretches} max={EXERCISES.length * target} color={colors.primary} goal={EXERCISES.length * target} />
      </Card>

      <Card>
        <H2 icon="pulse-outline" color={colors.danger}>
          Clenching episodes
        </H2>
        <P muted>
          {s.avgClenchEpisodes.toFixed(1)} per day on average · {s.totalCheckIns} check-ins
        </P>
        <BarChart keys={keys} values={clench} max={Math.max(...clench)} color={colors.danger} />
      </Card>

      <Card>
        <H2 icon="leaf-outline" color={colors.teal}>
          Breathing minutes
        </H2>
        <P muted>
          {s.avgBreathingMinutes.toFixed(1)} min/day on average · goal {breathingGoal} min/day
        </P>
        <BarChart keys={keys} values={breathing} max={Math.max(...breathing)} color={colors.teal} goal={breathingGoal} />
      </Card>

      <Card>
        <H2 icon="thermometer-outline" color={colors.warning}>
          Jaw pain
        </H2>
        <P muted>{s.avgPain === null ? 'No ratings yet' : `Average ${s.avgPain.toFixed(1)} / 10 on rated days`}</P>
        <BarChart keys={keys} values={pain} max={10} color={colors.warning} />
      </Card>

      <Button title="Share report with interventionist" icon="share-outline" onPress={share} />
      <Button title="Reset all data" icon="trash-outline" variant="danger" onPress={resetAll} />
    </Screen>
  );
}
