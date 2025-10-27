import { FormContentSelector } from "./content-selector";
import { FormImageSelector } from "./image-selector";
import { FormInput } from "./input";
import { FormLabelInput } from "./label-input";
import { FormRadio } from "./radio";
import { FormSelect } from "./select";

export const Form = {
  Input: FormInput,
  LabelInput: FormLabelInput,
  ImageSelector: FormImageSelector,
  ContentSelector: FormContentSelector,
  Select: FormSelect,
  Radio: FormRadio,
};

export * from "./text-area";
