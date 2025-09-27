import {cn} from '@/src/shared/libs/cn';
import {platform} from '@/src/shared/libs/platform';
import {Button, Label, Show, PalePurpleGradient, Text} from '@/src/shared/ui';
import {Form, LabelInput, ChipSelector} from '@/src/widgets';
import {Image} from 'expo-image';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {KeyboardAvoidingView, View, Platform, StyleSheet, ScrollView} from 'react-native';
import {z} from 'zod';
import {useKeyboarding} from '@/src/shared/hooks';
import {useUnivQuery, useDepartmentQuery} from "@features/signup/queries";
import {useState} from 'react';
import {useExistsUniversityQuery} from "@features/home/queries";
import i18n from '@/src/shared/libs/i18n';

type FormProps = {
  universityName: string;
  departmentName: string;
  grade: string;
  studentNumber: string;
}

const gradeOptions = Array.from({length: 5}, (_, i) => ({
  label: `${i + 1}${i18n.t("features.home.ui.university_form.grade")}`,
  value: `${i + 1}${i18n.t("features.home.ui.university_form.grade")}`,
}));

const studentNumberOptions = ['25', '24', '23', '22', '21', '20', '19', '18', '17'].map(n => `${n}${i18n.t("features.home.ui.university_form.student_number")}`);

const schema = z.object({
  universityName: z.string().min(1, i18n.t("features.home.ui.university_form.error_university_name")),
  departmentName: z.string().min(1, i18n.t("features.home.ui.university_form.error_department_name")),
  grade: z.string().min(1, i18n.t("features.home.ui.university_form.error_grade")),
  studentNumber: z.string().min(1, i18n.t("features.home.ui.university_form.error_student_number")),
});
interface UniversityFormProps {
  onSubmit: (data: FormProps) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function UniversityForm({
                                         onSubmit,
                                         onBack,
                                         isLoading = false
                                       }: UniversityFormProps) {

  const [selectedUniv, setSelectedUniv] = useState<string>('');
  const {data: univs = []} = useUnivQuery();
  const {data: departments = []} = useDepartmentQuery(selectedUniv || undefined);
  const filteredUnivs = univs.filter((univ) => univ.startsWith(selectedUniv || ''));

  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      universityName: '',
      departmentName: '',
      grade: '',
      studentNumber: '',
    },
  });

  const {handleSubmit, formState: {isValid}, setValue} = form;

  const onNext = handleSubmit(async (data) => {
    onSubmit(data);
  });

  const nextable = isValid;

  const nextButtonMessage = i18n.t("features.home.ui.university_form.submit_button");

  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <LabelInput
                label={i18n.t("features.home.ui.university_form.university_label")}
                size="sm"
                value={selectedUniv}
                placeholder={i18n.t("features.home.ui.university_form.university_placeholder")}
                onChangeText={(text) => {
                  setSelectedUniv(text);
                  setValue('universityName', text);
                }}
            />
            <ScrollView style={styles.chipContainer} contentContainerStyle={styles.chipScrollContent}>
              <ChipSelector
                  value={selectedUniv}
                  options={filteredUnivs.map((univ) => ({label: univ, value: univ}))}
                  onChange={(value) => {
                    setSelectedUniv(value);
                    setValue('universityName', value);
                  }}
                  className="w-full"
              />
            </ScrollView>
          </View>

          <Show when={selectedUniv !== ''}>
            <View style={styles.fieldContainer}>
              <Label label={i18n.t("features.home.ui.university_form.department_label")} size="sm"/>
              <Form.Select
                  size="sm"
                  name="departmentName"
                  control={form.control}
                  options={departments.map((department) => ({label: department, value: department}))}
                  placeholder={i18n.t("features.home.ui.university_form.department_placeholder")}
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfFieldContainer}>
                <Form.Select
                    name="studentNumber"
                    control={form.control}
                    options={studentNumberOptions.map((option) => ({label: option, value: option}))}
                    placeholder={i18n.t("features.home.ui.university_form.student_number_placeholder")}
                    size="sm"
                    className="flex-1"
                />
                <Label label={i18n.t("features.home.ui.university_form.student_number")} size="sm"/>
              </View>

              <View style={styles.halfFieldContainer}>
                <Form.Select
                    name="grade"
                    control={form.control}
                    options={gradeOptions}
                    placeholder={i18n.t("features.home.ui.university_form.grade_placeholder")}
                    size="sm"
                    className="flex-1"
                />
                <Label label={i18n.t("features.home.ui.university_form.grade")} size="sm"/>
              </View>
            </View>
          </Show>

        </View>

        <View style={styles.buttonContainer}>
          <Button
              onPress={onNext}
              disabled={!nextable || isLoading}
          >
            {nextButtonMessage}
          </Button>
        </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingHorizontal: 20,
  },
  image: {
    width: 81,
    height: 81,
    marginBottom: 16,
  },
  formContainer: {
    flexDirection: 'column',
    gap: 14,
    marginTop: 20,
    flex: 1,
  },
  fieldContainer: {
    width: '100%',
  },
  rowContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 14,
  },
  halfFieldContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  chipContainer: {
    marginTop: 8,
    width: '100%',
    maxHeight: 400,
  },
  chipScrollContent: {
    flexGrow: 1,
  },
  buttonContainer: {
    marginTop: 12,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  backButton: {
    flex: 0.3,
  },
  nextButton: {
    flex: 0.7,
  },
  fullButton: {
    flex: 1,
  },
});
