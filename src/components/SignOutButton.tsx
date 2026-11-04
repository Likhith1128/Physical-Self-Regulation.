import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { colors, confirm } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      onPress={() => confirm('Sign out', 'Are you sure you want to sign out?', () => void signOut(), 'Sign out')}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: colors.dangerSoft,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name="log-out-outline" size={18} color={colors.danger} />
      <Text style={{ color: colors.danger, fontWeight: '600' }}>Sign out</Text>
    </Pressable>
  );
}
