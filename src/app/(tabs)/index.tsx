import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Button, Card, colors, H1, H2, P, Pill, ProgressBar, Screen, Stepper } from '@/components/ui';
import { DAILY_TARGETS, EXERCISES } from '@/lib/content';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';

export default function TodayScreen() {
  const { user } = useAuth();
  const { state, today, updateDay } = useStore();
  const target = DAILY_TARGETS.exercisePracticesPerDay;
  const activeExercises = EXERCISES.filter((e) => !state.discontinued[e.id]);
  const stretchDone = activeExercises.reduce((n, e) => n + Math.min(target, today.exercises[e.id]), 0);
  const stretchGoal = activeExercises.length * target;
  const breathingGoalMin = DAILY_TARGETS.breathingSessionsPerDay * DAILY_TARGETS.breathingSessionMinutes;
  const breathingActive = !!state.sessions.session2;

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <H1>Hi, {user?.name.split(' ')[0]}</H1>
        <P muted>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</P>
      </View>

      {!state.sessions.session1 && (
        <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          <H2 icon="information-circle-outline">Getting started</H2>
          <P>
            Start with Session 1 to learn about clenching awareness, choose your monitoring strategies, and
            practice the three stretches.
          </P>
          <Button title="Open Session 1" icon="arrow-forward" onPress={() => router.push('/session1')} />
        </Card>
      )}

      <Card>
        <H2 icon="pulse-outline" color={colors.danger}>
          Clenching episodes
        </H2>
        <P muted>Each time you notice you are clenching, add one. Then relax: lips together, teeth apart.</P>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Stepper
            value={today.clenchEpisodes}
            onChange={(v) => updateDay((d) => ({ ...d, clenchEpisodes: v }))}
          />
          <Button title="Jaw check-in" icon="happy-outline" variant="secondary" onPress={() => router.push('/checkin')} />
        </View>
        <P muted>Check-ins today: {today.checkIns}</P>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2 icon="body-outline">Stretches</H2>
          <Pill text={`${stretchDone}/${stretchGoal}`} />
        </View>
        <ProgressBar value={stretchDone} max={stretchGoal} />
        <P muted>Goal: each stretch {target}× per day (about 15–30 minutes total).</P>
        {EXERCISES.map((e) => {
          const done = today.exercises[e.id];
          const stopped = !!state.discontinued[e.id];
          return (
            <Pressable
              key={e.id}
              onPress={() => router.push(`/exercise/${e.id}`)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: stopped ? colors.muted : colors.text }}>{e.title}</Text>
                {stopped ? (
                  <Pill text="Discontinued – increased pain" color={colors.danger} bg={colors.dangerSoft} />
                ) : (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {Array.from({ length: target }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < done ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={i < done ? colors.success : colors.border}
                      />
                    ))}
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          );
        })}
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2 icon="leaf-outline" color={colors.teal}>
            Diaphragmatic breathing
          </H2>
          <Pill
            text={`${today.breathingSessions}/${DAILY_TARGETS.breathingSessionsPerDay} sessions`}
            color={colors.teal}
            bg={colors.tealSoft}
          />
        </View>
        <ProgressBar value={today.breathingMinutes} max={breathingGoalMin} color={colors.teal} />
        <P muted>
          {breathingActive
            ? `${today.breathingMinutes} of ${breathingGoalMin} min today. Goal: two 15-minute sessions.`
            : 'Introduced in Session 2. You can preview it any time.'}
        </P>
        <Button title="Start breathing session" icon="play" variant="secondary" onPress={() => router.push('/breathing')} />
      </Card>

      <Card>
        <H2 icon="thermometer-outline" color={colors.warning}>
          Jaw pain today
        </H2>
        <P muted>Rate your typical jaw/face pain today (0 = none, 10 = worst imaginable).</P>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {Array.from({ length: 11 }).map((_, i) => {
            const selected = today.painRating === i;
            return (
              <Pressable
                key={i}
                accessibilityLabel={`Pain ${i}`}
                onPress={() => updateDay((d) => ({ ...d, painRating: selected ? null : i }))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? colors.warning : colors.warningSoft,
                }}
              >
                <Text style={{ fontWeight: '700', color: selected ? '#fff' : colors.warning }}>{i}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}
