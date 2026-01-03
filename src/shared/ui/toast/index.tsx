import React from 'react';
import { semanticColors } from '../../constants/semantic-colors';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { useToast } from '../../hooks/use-toast';
import { Show } from '../show';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


function Toast() {
  const { toast, icon, dismissToast } = useToast();
  const insets = useSafeAreaInsets()
  return (
    <Show when={!!toast}>
      <View style={[styles.toastContainer, {bottom: insets.bottom + 65}]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={dismissToast}
          style={styles.toast}
        >
          <Show when={!!icon}>
            <View style={styles.iconContainer}>
              {icon}
            </View>
          </Show>
          <Text style={styles.toastText}>{toast}</Text>
        </TouchableOpacity>
      </View>
    </Show>

  )
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: 16,
    justifyContent: "center",
    flexDirection: "row"
  },
  toast: {
    minHeight: 46,
    borderRadius: 15,
    backgroundColor: semanticColors.surface.inverse,
    paddingVertical: 11,
    alignItems: 'center',
    position: "relative",
    paddingHorizontal: 70,
    width: "100%",
  },
  toastText: {
    fontSize: 20,
    lineHeight: 24,
    color: semanticColors.text.inverse,
  },
  iconContainer: {
    position: "absolute",
    left: 33,
    top: 12 
  }
});

export default Toast;