import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, Text, View } from 'react-native';

import { Bullets, Button, Card, colors, H2, notify, P, Pill, ProgressBar, Screen } from '@/components/ui';
import { BREATHING, DAILY_TARGETS } from '@/lib/content';
import { formatClock } from '@/lib/date';
import { useStore } from '@/lib/store';

const DURATIONS = [5, 10, 15, 20];
const CYCLE = BREATHING.inhaleSeconds + BREATHING.exhaleSeconds;
const useNativeDriver = Platform.OS !== 'web';

export default function BreathingScreen() {
  const { today, updateDay } = useStore();
  const [minutes, setMinutes] = useState(DAILY_TARGETS.breathingSessionMinutes);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const scale = useRef(new Animated.Value(0.6)).current;
  const lastTick = useRef(0);

  const totalSeconds = minutes * 60;

  useEffect(() => {
    if (!running) return;
    lastTick.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTick.current) / 1000;
      lastTick.current = now;
      setElapsed((e) => e + delta);
    }, 200);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) {
      scale.stopAnimation();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: BREATHING.inhaleSeconds * 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(scale, {
          toValue: 0.6,
          duration: BREATHING.exhaleSeconds * 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ]),
    );
    scale.setValue(0.6);
    loop.start();
    return () => loop.stop();
  }, [running, scale]);

  const logSession = (secs: number, complete: boolean) => {
    const mins = Math.floor(secs / 60);
    if (mins < 1 && !complete) return 0;
    updateDay((d) => ({
      ...d,
      breathingMinutes: d.breathingMinutes + mins,
      breathingSessions: d.breathingSessions + (complete ? 1 : 0),
    }));
    return mins;
  };

  useEffect(() => {
    if (running && elapsed >= totalSeconds) {
      setRunning(false);
      setStarted(false);
      setElapsed(0);
      logSession(totalSeconds, minutes >= DAILY_TARGETS.breathingSessionMinutes);
      notify('Session complete', `${minutes} minutes of diaphragmatic breathing logged.`);
    }
  }, [elapsed, running, totalSeconds]);

  const start = () => {
    setElapsed(0);
    setStarted(true);
    setRunning(true);
  };

  const finishEarly = () => {
    setRunning(false);
    setStarted(false);
    const mins = logSession(elapsed, false);
    setElapsed(0);
    notify('Session ended', mins > 0 ? `${mins} minute${mins === 1 ? '' : 's'} logged.` : 'Less than a minute – nothing logged.');
  };

  const inCycle = elapsed % CYCLE;
  const inhaling = inCycle < BREATHING.inhaleSeconds;
  const phaseRemaining = Math.ceil(inhaling ? BREATHING.inhaleSeconds - inCycle : CYCLE - inCycle);
  const goalMinutes = DAILY_TARGETS.breathingSessionsPerDay * DAILY_TARGETS.breathingSessionMinutes;

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2 icon="today-outline" color={colors.teal}>
            Today
          </H2>
          <Pill
            text={`${today.breathingSessions}/${DAILY_TARGETS.breathingSessionsPerDay} sessions · ${today.breathingMinutes}/${goalMinutes} min`}
            color={colors.teal}
            bg={colors.tealSoft}
          />
        </View>
        <ProgressBar value={today.breathingMinutes} max={goalMinutes} color={colors.teal} />
      </Card>

      <Card style={{ alignItems: 'center' }}>
        <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: 120,
              backgroundColor: colors.tealSoft,
              transform: [{ scale }],
            }}
          />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: colors.teal }}>
              {started ? (inhaling ? 'Breathe in' : 'Breathe out') : 'Ready'}
            </Text>
            {started && <Text style={{ fontSize: 18, color: colors.teal }}>{phaseRemaining}</Text>}
          </View>
        </View>

        <Text style={{ fontSize: 36, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] }}>
          {formatClock(started ? totalSeconds - elapsed : totalSeconds)}
        </Text>
        <View style={{ alignSelf: 'stretch' }}>
          <ProgressBar value={elapsed} max={totalSeconds} color={colors.teal} />
        </View>

        {!started && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            {DURATIONS.map((m) => (
              <Pressable
                key={m}
                onPress={() => setMinutes(m)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: m === minutes ? colors.teal : colors.tealSoft,
                }}
              >
                <Text style={{ color: m === minutes ? '#fff' : colors.teal, fontWeight: '600' }}>{m} min</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch' }}>
          {!started ? (
            <Button title="Start" icon="play" onPress={start} style={{ flex: 1 }} />
          ) : (
            <>
              <Button
                title={running ? 'Pause' : 'Resume'}
                icon={running ? 'pause' : 'play'}
                onPress={() => setRunning((r) => !r)}
                style={{ flex: 1 }}
              />
              <Button title="End & log" icon="stop" variant="ghost" onPress={finishEarly} />
            </>
          )}
        </View>
        {minutes < DAILY_TARGETS.breathingSessionMinutes && !started && (
          <P muted>Shorter sessions log minutes but only 15+ minute sessions count toward the 2 daily sessions.</P>
        )}
      </Card>

      <Card>
        <H2 icon="leaf-outline" color={colors.teal}>
          How to breathe
        </H2>
        <P>{BREATHING.intro}</P>
        <Bullets items={BREATHING.steps} numbered />
        <P muted>
          Pace: in for {BREATHING.inhaleSeconds} seconds, out for {BREATHING.exhaleSeconds} seconds (about{' '}
          {Math.round(60 / CYCLE)} breaths per minute). If you feel light-headed, return to normal breathing.
        </P>
      </Card>
    </Screen>
  );
}
