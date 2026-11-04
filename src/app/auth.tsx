import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Field } from '@/components/Field';
import { Button, Card, colors, P } from '@/components/ui';
import { useAuth } from '@/lib/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

type Mode = 'signup' | 'signin';

function LabeledField({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: '600', color: colors.text }}>{label}</Text>
      <Field {...props} style={error ? { borderColor: colors.danger } : undefined} />
      {error ? <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text> : null}
    </View>
  );
}

export default function AuthScreen() {
  const { hasAccounts, signUp, signIn } = useAuth();
  const [mode, setMode] = useState<Mode>(hasAccounts ? 'signin' : 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signup';

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setFormError('');
    setPassword('');
    setConfirmPassword('');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (isSignUp && !name.trim()) e.name = 'Please enter your name.';
    if (!EMAIL_PATTERN.test(email.trim())) e.email = 'Please enter a valid email address.';
    if (isSignUp) {
      if (password.length < MIN_PASSWORD) e.password = `Password must be at least ${MIN_PASSWORD} characters.`;
      if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match.';
    } else if (!password) {
      e.password = 'Please enter your password.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setFormError('');
    if (!validate()) return;
    setBusy(true);
    try {
      if (isSignUp) await signUp({ name, email, password });
      else await signIn(email, password);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const passwordProps: TextInputProps = {
    secureTextEntry: !showPassword,
    autoCapitalize: 'none',
    autoCorrect: false,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', maxWidth: 440, gap: 16 }}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="body-outline" size={34} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Physical Self-Regulation</Text>
              <P muted style={{ textAlign: 'center' }}>
                {isSignUp ? 'Create an account to start your PSR program.' : 'Welcome back. Sign in to continue.'}
              </P>
            </View>

            <Card style={{ gap: 14 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                {isSignUp ? 'Sign up' : 'Sign in'}
              </Text>

              {isSignUp && (
                <LabeledField
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  autoComplete="name"
                  textContentType="name"
                  error={errors.name}
                />
              )}
              <LabeledField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                error={errors.email}
              />
              <LabeledField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder={isSignUp ? `At least ${MIN_PASSWORD} characters` : 'Your password'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                textContentType={isSignUp ? 'newPassword' : 'password'}
                onSubmitEditing={isSignUp ? undefined : submit}
                error={errors.password}
                {...passwordProps}
              />
              {isSignUp && (
                <LabeledField
                  label="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  onSubmitEditing={submit}
                  error={errors.confirmPassword}
                  {...passwordProps}
                />
              )}

              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
                <Text style={{ color: colors.muted }}>{showPassword ? 'Hide password' : 'Show password'}</Text>
              </Pressable>

              {formError ? (
                <View style={{ backgroundColor: colors.dangerSoft, borderRadius: 10, padding: 10 }}>
                  <Text style={{ color: colors.danger }}>{formError}</Text>
                </View>
              ) : null}

              <Button
                title={busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
                icon={isSignUp ? 'person-add-outline' : 'log-in-outline'}
                onPress={submit}
                disabled={busy}
              />
            </Card>

            <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
              <Text style={{ color: colors.muted }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <Pressable onPress={() => switchMode(isSignUp ? 'signin' : 'signup')}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>{isSignUp ? 'Sign in' : 'Sign up'}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
