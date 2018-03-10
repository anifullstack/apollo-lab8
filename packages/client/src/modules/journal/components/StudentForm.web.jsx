import React from "react";
import PropTypes from "prop-types";
import { withFormik } from "formik";
import moment from "moment";
import Field from "../../../utils/FieldAdapter";
import { Form, RenderField, Button } from "../../common/components/web";
import { required, validateForm } from "../../../../../common/validation";

const studentFormSchema = {
  firstName: [required],
  lastName: [required],

  content: [required]
};

const validate = values => validateForm(values, studentFormSchema);

const StudentForm = ({ values, handleSubmit, submitting }) => {
  const tempBirthDate = isNaN(values.birthDate)
    ? values.activityDate
    : moment(parseInt(values.birthDate)).format("MM/DD/YYYY");

  return (
    <Form name="student" onSubmit={handleSubmit}>
      <Field
        name="firstName"
        component={RenderField}
        type="text"
        label="FirstName"
        value={values.firstName}
      />
      <Field
        name="lastName"
        component={RenderField}
        type="text"
        label="lastName"
        value={values.lastName}
      />
      <Field
        name="birthDate"
        component={RenderField}
        type="text"
        label="BirthDate"
        value={values.birthDate}
      />
      <Field
        name="content"
        component={RenderField}
        type="text"
        label="Content"
        value={values.content}
      />
      <Button color="primary" type="submit" disabled={submitting}>
        Save
      </Button>
    </Form>
  );
};

StudentForm.propTypes = {
  handleSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  values: PropTypes.object,
  student: PropTypes.object
};

const StudentFormWithFormik = withFormik({
  mapPropsToValues: props => ({
    firstName: props.student && props.student.firstName,
    lastName: props.student && props.student.lastName,
    birthDate: props.student && props.student.birthDate,
    content: props.student && props.student.content
  }),
  validate: values => validate(values),
  handleSubmit(values, { props: { onSubmit } }) {
    onSubmit(values);
  },
  enableReinitialize: true,
  displayName: "StudentForm" // helps with React DevTools
});

export default StudentFormWithFormik(StudentForm);
