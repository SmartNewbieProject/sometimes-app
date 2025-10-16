import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { useToast } from '../../hooks/use-toast';
import { Show } from '../show';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


function Toast() {
  const { toast, icon } = useToast();
  const insets = useSafeAreaInsets()
  return (
    <Show when={!!toast}>
      <View style={[styles.toastContainer, {bottom: insets.bottom + 65}]}>
        <View style={styles.toast}>
          <Show when={!!icon}>
            <View style={styles.iconContainer}>
              {icon}
            </View>
          </Show>
          <Text style={styles.toastText}>{toast}</Text>
      </View>
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
    height: 46,
    borderRadius: 15,
    backgroundColor: "#818489",
    paddingVertical: 11,
    alignItems: 'center',
    position: "relative",
    paddingHorizontal: 14,
    width: "100%",
  },
  toastText: {
    fontSize: 20,
    lineHeight: 24,
    color: "#fff",

  },
  iconContainer: {
    position: "absolute",
    left: 33,
    top: 12 
  }
});

export default Toast;