import { StyleSheet, TouchableWithoutFeedback, View, Pressable, Platform } from "react-native";
import { ImageResources } from "../../libs";
import { ImageResource } from "../image-resource";
import { Show } from "../show";
import { useState, useEffect } from "react";

export type DropdownItem = {
  key: string;
  content: React.ReactNode;
  onPress: () => void;
}

type DropdownProps = {
  open: boolean;
  items: DropdownItem[];
};

export const Dropdown = ({ open: _open, items }: DropdownProps) => {
  const [open, setOpen] = useState(_open);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const handleOutsideClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const isOutsideClick = !target.closest('.dropdown-container');

        if (open && isOutsideClick) {
          setOpen(false);
        }
      };
      document.addEventListener('click', handleOutsideClick, true);
      return () => {
        document.removeEventListener('click', handleOutsideClick, true);
      };
    }
  }, [open]);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <View>
          <ImageResource resource={ImageResources.MENU} width={24} height={24} />
        </View>
      </TouchableWithoutFeedback>

      <Show when={open}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View
            style={styles.dropdownContainer}
            className="dropdown-container"
          >
            {items.map((item) => (
              <Pressable
                key={item.key}
                style={styles.dropdownItem}
                onPress={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  item.onPress();
                  setOpen(false);
                }}
              >
                {item.content}
              </Pressable>
            ))}
          </View>
        </TouchableWithoutFeedback>
      </Show>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 32,
    height: 32,
    zIndex: 10,
  },
  dropdownContainer: {
    width: 140,
    padding: 2,
    borderRadius: 8,
    backgroundColor: 'white',
    position: 'absolute',
    top: 48,
    right: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
});

export { styles as dropdownStyles };
