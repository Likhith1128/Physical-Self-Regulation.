import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, colors, H1, P, Screen } from '@/components/ui';
import { CLENCHING_EDUCATION } from '@/lib/content';
import { useStore } from '@/lib/store';

export default function CheckInScreen() {
  const { today, updateDay } = useStore();
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);

  const record = (clenching: boolean) => {
    updateDay((d) => ({
      ...d,
      checkIns: d.checkIns + 1,
      clenchEpisodes: d.clenchEpisodes + (clenching ? 1 : 0),
    }));
    setAnswer(clenching ? 'yes' : 'no');
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 8, paddingTop: 12 }}>
        <Ionicons name="happy-outline" size={56} color={colors.primary} />
        <H1>Are you clenching right now?</H1>
        <P muted style={{ textAlign: 'center' }}>
          Notice your jaw. Are your teeth touching? Is your tongue pressing? Are your cheeks or temples tight?
        </P>
      </View>

      {answer === null ? (
        <View style={{ gap: 10 }}>
          <Button title="Yes, I was clenching" icon="alert-circle-outline" variant="danger" onPress={() => record(true)} />
          <Button title="No, my jaw is relaxed" icon="checkmark-circle-outline" variant="secondary" onPress={() => record(false)} />
        </View>
      ) : (
        <Card style={{ backgroundColor: colors.successSoft, borderColor: colors.successSoft }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.success }}>
            {answer === 'yes' ? 'Good catch – episode recorded.' : 'Great – keep it relaxed.'}
          </Text>
          <P>
            <Text style={{ fontWeight: '700' }}>{CLENCHING_EDUCATION.restPosition.title}: </Text>
            {CLENCHING_EDUCATION.restPosition.text}
          </P>
          <P muted>
            Today: {today.checkIns} check-ins · {today.clenchEpisodes} clenching episodes
          </P>
          <Button title="Done" onPress={close} />
        </Card>
      )}
    </Screen>
  );
}
