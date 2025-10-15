import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import SearchIcon from "@assets/icons/search.svg"


function CodeForm() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>초대코드</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='초대코드를 입력하세요'
          placeholderTextColor="#BAB0D0"
        />
        <SearchIcon />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    gap: 15,
  
  },
  label: {
    color: "#7A4AE2",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
      gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#7A4AE2",
    borderRadius: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 3,
    fontSize: 18,
    lineHeight: 22,
  },

});

export default CodeForm;