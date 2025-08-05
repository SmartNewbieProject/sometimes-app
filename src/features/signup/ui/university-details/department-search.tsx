import Loading from "@/src/features/loading";
import SearchIcon from "@assets/icons/search.svg";
import { useGlobalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSignupProgress } from "../../hooks";
import { filterDepartments } from "../../lib/university-details";
import { useDepartmentQuery } from "../../queries";

function DepartmentSearch() {
  const {
    updateForm,
    form: { departmentName },
  } = useSignupProgress();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { universityName } = useGlobalSearchParams<{
    universityName: string;
  }>();
  const { data: departments = [], isLoading } =
    useDepartmentQuery(universityName);
  const [filteredDepartment, setFilteredDepartment] = useState(departments);

  useEffect(() => {
    if (!departments) return;

    const filtered = filterDepartments(departments, departmentName ?? "");

    setFilteredDepartment(filtered);
  }, [departmentName, JSON.stringify(departments)]);

  if (isLoading) {
    return <Loading.Page title="학과를 검색중이에요" />;
  }
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,

          {
            backgroundColor: "#FFFFFF",
            borderColor: "#7A4AE2",
            flexDirection: "row",
            paddingHorizontal: 12,
          },
        ]}
      >
        <TextInput
          className="outline-none"
          value={departmentName}
          onChangeText={(text) => updateForm({ departmentName: text })}
          placeholder="학과를 입력해주세요"
          placeholderTextColor="#999"
          style={styles.input}
          ref={inputRef}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          underlineColorAndroid="transparent"
        />

        <TouchableWithoutFeedback>
          <View style={styles.iconWrapper}>
            <SearchIcon width={12} height={12} />
          </View>
        </TouchableWithoutFeedback>
      </View>

      <View style={styles.popularContainer}>
        {departments.slice(0, 3).map((department, index) => (
          <Pressable
            onPress={() => updateForm({ departmentName: department })}
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            style={styles.tag}
          >
            <Text style={styles.tagText}>{department}</Text>
          </Pressable>
        ))}
      </View>

      {focused && filteredDepartment && filteredDepartment.length > 0 && (
        <ScrollView
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          style={styles.searchResult}
        >
          {filteredDepartment.map((department, index) => (
            <Pressable
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              onPress={() => {
                updateForm({ departmentName: department });
                if (inputRef?.current) {
                  inputRef?.current.blur();
                }
              }}
            >
              <Text style={styles.searchResultText}>{department}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    height: 36,

    alignItems: "center",

    position: "relative",
    borderRadius: 15,
    borderWidth: 1,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    borderWidth: 0,
    fontSize: 14,
    height: 32,
    paddingVertical: 0,
    color: "#000",
  },
  iconWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    paddingLeft: 1,
    top: 0,
  },
  container: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  searchResult: {
    maxHeight: 166,
    paddingHorizontal: 13,
    paddingVertical: 7,
    width: 230,
    borderWidth: 1,
    borderColor: "#7A4AE2",

    position: "absolute",
    top: 43,
    backgroundColor: "#fff",
    borderRadius: 15,
    zIndex: 10,
  },
  searchResultText: {
    fontSize: 13,
    backgroundColor: "#fff",
    fontWeight: 400,
    paddingVertical: 4,
    lineHeight: 15.6,
    color: "#BAB0D0",
  },
  popularContainer: {
    flexDirection: "row",
    gap: 7,
    marginTop: 7,
    alignItems: "center",
  },
  tag: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E2D9FF",
    flexWrap: "wrap",
  },
  tagText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 15.6,
  },
});

export default DepartmentSearch;
