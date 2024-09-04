/* eslint-disable react-hooks/exhaustive-deps */
import { useFormikContext } from "formik";
import { useEffect } from "react";

const FormikFocusError = () => {
  const { errors, isSubmitting, isValidating } = useFormikContext();

  const validateErrors = (path = "", object = {}) => {
    if (!object) {
      return;
    }
    let entries = Object.entries(object);
    if (entries.length > 0) {
      if (typeof entries[0][1] === "object") {
        validateErrors(`${path}${entries[0][0]}.`, entries[0][1]);
      } else {
        const selector = `[name='${path}${entries[0][0]}']`;
        const errorElement = document.querySelector(selector);
        if (errorElement) {
          errorElement.scrollIntoView(false);
        }
      }
    }
  };

  useEffect(() => {
    if (isSubmitting && !isValidating) {
      validateErrors("", errors);
    }
  }, [errors, isSubmitting, isValidating]);

  return null;
};

export default FormikFocusError;
