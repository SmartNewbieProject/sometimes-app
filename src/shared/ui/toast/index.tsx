import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { useToast } from '../../hooks/use-toast';
import { Show } from '../show';


function Toast() {
  const { toast } = useToast();
  return (
    <Show when={!!toast}>
 <View style={styles.toastContainer}>
      <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
      </View>
    </View>
    </Show>
   
  )
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    justifyContent: "center",
    flexDirection: "row"
  },
  toast: {
    height: 40,
    borderRadius: 10,
    backgroundColor: "#000",
    paddingVertical: 8,

    paddingHorizontal: 14

  },
  toastText: {
    fontSize: 20,
    lineHeight: 24,
    color: "#fff",

  }
});

export default Toast;