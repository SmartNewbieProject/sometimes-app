import { StyleSheet } from "react-native";


export const sideStyle = StyleSheet.create({
  previousContainer: {
    position: 'absolute',
    width: 72,
    flexDirection: 'column',
    backgroundColor: '#ECE5FF',
    height: 128,
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    right: 0,
    top: 0,
  },
  previousButton: {
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    height: 120,
  },
  topRadius: {
    borderBottomRightRadius: 16,
    borderTopEndRadius: 16,
    height: 35,
    width: '100%',
    backgroundColor: '#ECE5FF',
  },
  bottomRadius: {
    borderTopEndRadius: 16,
    height: 35,
    width: '100%',
    backgroundColor: '#e6ddff',
  },
});
