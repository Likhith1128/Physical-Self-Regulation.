import { useState } from 'react';
import { Switch, Text, View } from 'react-native';

import { Button, colors, notify, P, Stepper } from '@/components/ui';
import { formatHour } from '@/lib/date';
import { applyReminders, planReminders, remindersSupported } from '@/lib/notifications';
import { ReminderSettings, useStore } from '@/lib/store';

type Field = 'clenchCheckIns' | 'exerciseReminders' | 'breathingReminders';

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ fontSize: 15, color: colors.text, flex: 1, marginRight: 12 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

function LabeledStepper(props: { label: string } & Parameters<typeof Stepper>[0]) {
  const { label, ...rest } = props;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 15, color: colors.text }}>{label}</Text>
      <Stepper {...rest} />
    </View>
  );
}

export function ReminderControls({ fields }: { fields: Field[] }) {
  const { state, update } = useStore();
  const r = state.reminders;
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<ReminderSettings>) =>
    update((s) => ({ ...s, reminders: { ...s.reminders, ...patch } }));

  const save = async () => {
    setSaving(true);
    try {
      const result = await applyReminders(state.reminders);
      if (result.ok) {
        notify('Reminders updated', result.count ? `${result.count} daily reminders scheduled.` : 'All reminders are off.');
      } else {
        notify('Reminders not scheduled', result.message ?? 'Something went wrong.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      {fields.includes('clenchCheckIns') && (
        <>
          <ToggleRow label="Recurring jaw check-in alarm" value={r.clenchCheckIns} onChange={(v) => set({ clenchCheckIns: v })} />
          {r.clenchCheckIns && (
            <LabeledStepper
              label="Every"
              value={r.intervalMinutes}
              min={15}
              max={240}
              step={15}
              format={(v) => `${v} min`}
              onChange={(v) => set({ intervalMinutes: v })}
            />
          )}
        </>
      )}
      {fields.includes('exerciseReminders') && (
        <ToggleRow label="Stretch reminders (5× per day)" value={r.exerciseReminders} onChange={(v) => set({ exerciseReminders: v })} />
      )}
      {fields.includes('breathingReminders') && (
        <ToggleRow label="Breathing reminders (2× per day)" value={r.breathingReminders} onChange={(v) => set({ breathingReminders: v })} />
      )}
      <LabeledStepper
        label="From"
        value={r.startHour}
        min={5}
        max={Math.min(r.endHour, 12)}
        format={formatHour}
        onChange={(v) => set({ startHour: v })}
      />
      <LabeledStepper
        label="Until"
        value={r.endHour}
        min={Math.max(r.startHour, 14)}
        max={23}
        format={formatHour}
        onChange={(v) => set({ endHour: v })}
      />
      <P muted>{planReminders(r).length} reminders per day with these settings.</P>
      {!remindersSupported && (
        <P muted>Phone reminders work in the Android and iOS apps. On the web, set a recurring alarm on your phone instead.</P>
      )}
      <Button title={saving ? 'Saving…' : 'Save reminders'} icon="alarm-outline" onPress={save} disabled={saving} />
    </View>
  );
}
