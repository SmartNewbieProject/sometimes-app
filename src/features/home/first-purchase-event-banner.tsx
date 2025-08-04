

import React from 'react';
import {StyleSheet, View} from 'react-native';


function FirstPurchaseEvent() {
  return (
    <View>
      
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    width: "100%",
    minHeight: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "row",
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
  },
  leftContent: {
    flex: 1,
    justifyContent: "center",
  },
  rightContent: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  counterContainer: {
    flexDirection: "row",
    width: 142,
    alignItems: "flex-end",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  heartIcon: {
    width: 40,
    height: 40,
  },
});


export default FirstPurchaseEvent;