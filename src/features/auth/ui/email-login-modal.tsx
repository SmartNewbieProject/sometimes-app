import React, {useState} from 'react';
import {View, StyleSheet, Modal} from 'react-native';
import {Text, Button, Input} from '@/src/shared/ui';
import {useAuth} from '@/src/features/auth/hooks/use-auth';
import {tryCatch} from '@/src/shared/libs';
import {router} from 'expo-router';
import colors from "@constants/colors";

interface EmailLoginModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function EmailLoginModal({isVisible, onClose}: EmailLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {login} = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsLoading(true);
    await tryCatch(
        async () => {
          await login(email, password);
          onClose();
          router.replace('/home');
        },
        (error) => {
          console.error('Login failed:', error);
        }
    );
    setIsLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setIsLoading(false);
    onClose();
  };

  return (
      <Modal
          visible={isVisible}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>이메일 로그인</Text>

            <View style={styles.inputContainer}>
              <Input
                  placeholder="이메일"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
              />

              <Input
                  placeholder="비밀번호"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  editable={!isLoading}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                  onPress={handleClose}
                  styles={styles.button}
                  disabled={isLoading}
              >취소</Button>
              <Button
                  onPress={handleLogin}
                  styles={styles.loginButton}
                  disabled={isLoading || !email.trim() || !password.trim()}
              >{isLoading ? "로그인 중..." : "로그인"}</Button>
            </View>
          </View>
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    gap: 12,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors["gray-300"],
    borderWidth: 1,
    borderColor: colors["gray-300"],
  },
  cancelButtonText: {
    color: colors["gray-600"],
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: colors.primaryPurple,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});