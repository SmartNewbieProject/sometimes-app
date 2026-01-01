import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import SearchIcon from "@assets/icons/search.svg"
import { useStorage } from '@/src/shared/hooks/use-storage';
import useInviteCode from '../../hooks/use-invite-code';


function CodeForm() {
  const { t } = useTranslation();
  const {code, handleInviteCode} = useInviteCode()

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("apps.auth.sign_up.invite_code.label")}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={code}
          onChangeText={handleInviteCode}
          style={styles.input}
          placeholder={t("apps.auth.sign_up.enter_invite_code_placeholder")}
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
    color: semanticColors.brand.primary,
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
    borderColor: semanticColors.brand.primary,
    borderRadius: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 3,
    fontSize: 18,
    lineHeight: 22,
    color: semanticColors.text.primary,
  },

});

export default CodeForm;