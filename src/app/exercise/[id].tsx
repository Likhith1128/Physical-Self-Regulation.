import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Bullets, Button, Card, colors, confirm, H1, H2, notify, P, Pill, ProgressBar, Screen } from '@/components/ui';
import { DAILY_TARGETS, Exercise, exerciseById } from '@/lib/content';
import { dateKey, formatClock, shortLabel } from '@/lib/date';
import { useStore } from '@/lib/store';

type Phase = 'hold' | 'rest';

function GuidedTimer({ exercise, onFinished }: { exercise: Exercise; onFinished: () => void }) {
  const [running, setRunning] = useState(false);
  const [rep, setRep] = useState(1);
  const [phase, setPhase] = useState<Phase>('hold');
  const [remaining, setRemaining] = useState(exercise.holdSeconds);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(onFinished);
  finishedRef.current = onFinished;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (remaining > 0) return;
    if (phase === 'hold') {
      if (rep >= exercise.reps) {
        setRunning(false);
        setFinished(true);
        finishedRef.current();
        return;
      }
      setPhase('rest');
      setRemaining(exercise.restSeconds);
    } else {
      setRep((n) => n + 1);
      setPhase('hold');
      setRemaining(exercise.holdSeconds);
    }
  }, [remaining, phase, rep, exercise]);

  const restart = () => {
    setRep(1);
    setPhase('hold');
    setRemaining(exercise.holdSeconds);
    setFinished(false);
    setRunning(true);
  };

  const phaseColor = phase === 'hold' ? colors.primary : colors.teal;
  const total = phase === 'hold' ? exercise.holdSeconds : exercise.restSeconds;

  return (
    <Card>
      <H2 icon="timer-outline">Guided practice</H2>
      <View style={{ alignItems: 'center', gap: 6, paddingVertical: 8 }}>
        <Pill text={`Repetition ${rep} of ${exercise.reps}`} />
        <Text style={{ fontSize: 22, fontWeight: '700', color: finished ? colors.success : phaseColor }}>
          {finished ? 'Well done!' : phase === 'hold' ? 'Hold the stretch' : 'Relax'}
        </Text>
        <Text style={{ fontSize: 48, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] }}>
          {formatClock(finished ? 0 : remaining)}
        </Text>
        <View style={{ alignSelf: 'stretch' }}>
          <ProgressBar value={finished ? total : total - remaining} max={total} color={phaseColor} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {finished || (!running && rep === 1 && phase === 'hold' && remaining === exercise.holdSeconds) ? (
          <Button title={finished ? 'Practice again' : 'Start'} icon="play" onPress={restart} style={{ flex: 1 }} />
        ) : (
          <>
            <Button
              title={running ? 'Pause' : 'Resume'}
              icon={running ? 'pause' : 'play'}
              onPress={() => setRunning((r) => !r)}
              style={{ flex: 1 }}
            />
            <Button title="Restart" icon="refresh" variant="ghost" onPress={restart} />
          </>
        )}
      </View>
    </Card>
  );
}

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = exerciseById(id ?? '');
  const { state, today, update, updateDay } = useStore();

  if (!exercise) {
    return (
      <Screen>
        <P>Exercise not found.</P>
      </Screen>
    );
  }

  const done = today.exercises[exercise.id];
  const target = DAILY_TARGETS.exercisePracticesPerDay;
  const stopped = state.discontinued[exercise.id];

  const logPractice = () => {
    updateDay((d) => ({ ...d, exercises: { ...d.exercises, [exercise.id]: d.exercises[exercise.id] + 1 } }));
  };

  const onTimerFinished = () => {
    logPractice();
    notify('Practice logged', `${exercise.title}: ${done + 1} of ${target} today.`);
  };

  const discontinue = () =>
    confirm(
      'Stop this exercise?',
      'If this exercise increases your pain, stop doing it and let your interventionist know at your next session.',
      () =>
        update((s) => ({
          ...s,
          discontinued: { ...s.discontinued, [exercise.id]: { date: dateKey(), note: 'Increased pain' } },
        })),
      'Stop exercise',
    );

  const resume = () =>
    confirm(
      'Resume this exercise?',
      'Only resume if your interventionist has advised you to.',
      () =>
        update((s) => {
          const discontinued = { ...s.discontinued };
          delete discontinued[exercise.id];
          return { ...s, discontinued };
        }),
      'Resume',
    );

  return (
    <Screen>
      <Stack.Screen options={{ title: exercise.title }} />
      <View style={{ gap: 4 }}>
        <H1>{exercise.title}</H1>
        <P muted>{exercise.target}</P>
      </View>

      {stopped ? (
        <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }}>
          <H2 icon="alert-circle-outline" color={colors.danger}>
            Discontinued on {shortLabel(stopped.date)}
          </H2>
          <P>
            You stopped this exercise because it increased your pain. Please discuss it with your interventionist before
            resuming.
          </P>
          <Button title="Resume exercise" variant="ghost" onPress={resume} />
        </Card>
      ) : (
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <H2 icon="calendar-outline">Today</H2>
            <Pill
              text={`${done}/${target}`}
              color={done >= target ? colors.success : colors.primary}
              bg={done >= target ? colors.successSoft : colors.primarySoft}
            />
          </View>
          <ProgressBar value={done} max={target} color={done >= target ? colors.success : colors.primary} />
          <P muted>Practice this stretch {target} times per day until your next session.</P>
        </Card>
      )}

      <Card>
        <H2 icon="information-circle-outline">About</H2>
        <P>{exercise.summary}</P>
        <P muted>
          {exercise.reps} repetitions · hold {exercise.holdSeconds}s · rest {exercise.restSeconds}s
        </P>
      </Card>

      <Card>
        <H2 icon="list-outline">How to do it</H2>
        <Bullets items={exercise.steps} numbered />
      </Card>

      {!stopped && <GuidedTimer exercise={exercise} onFinished={onTimerFinished} />}

      {!stopped && (
        <View style={{ gap: 8 }}>
          <Button title="Log a practice without the timer" icon="add-circle-outline" variant="secondary" onPress={logPractice} />
          {done > 0 && (
            <Button
              title="Undo last logged practice"
              variant="ghost"
              onPress={() =>
                updateDay((d) => ({
                  ...d,
                  exercises: { ...d.exercises, [exercise.id]: Math.max(0, d.exercises[exercise.id] - 1) },
                }))
              }
            />
          )}
        </View>
      )}

      <Card style={{ borderColor: colors.warning }}>
        <H2 icon="warning-outline" color={colors.warning}>
          Safety
        </H2>
        <Bullets items={exercise.cautions} />
        {!stopped && (
          <Button title="This exercise increases my pain" icon="hand-left-outline" variant="danger" onPress={discontinue} />
        )}
      </Card>
    </Screen>
  );
}
