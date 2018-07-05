import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import moment from 'moment';
import Field from '../../../utils/FieldAdapter';
import { Form, RenderField, Button } from '../../common/components/web';
import { required, validateForm, dateValidation } from '../../../../../common/validation';

const studentFormSchema = {
  firstName: [required],
  lastName: [required],
  birthDate: [required, dateValidation],
  content: [required]
};

const validate = values => validateForm(values, studentFormSchema);

const StudentForm = ({ values, handleSubmit, submitting }) => {
  console.log(`StudentFormWeb|values.birthDate|${values.birthDate}`);
  var tempBirthDate;
  if (
    values.birthDate &&
    !isNaN(values.birthDate) &&
    values.birthDate.length >= 10 &&
    moment(parseInt(values.birthDate)).isValid()
  ) {
    values.birthDate = moment(parseInt(values.birthDate)).format('MM/DD/YYYY');
  }

  return (
    <Form name="student" onSubmit={handleSubmit}>
      <Field name="firstName" component={RenderField} type="text" placeholder="First Name" value={values.firstName} />
      <Field name="lastName" component={RenderField} type="text" placeholder="Last Name" value={values.lastName} />
      <Field
        name="birthDate"
        component={RenderField}
        type="text"
        placeholder="Birth Date (MM/DD/YYYY)"
        value={values.birthDate}
      />
      <Field name="content" component={RenderField} type="text" placeholder="Comment" value={values.content} />
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
    values.birthDate = moment(values.birthDate, 'MM/DD/YYYY').valueOf();
    console.log('StudentFormWeb', 'StudentFormWithFormik', 'handleSubmit', 'values.birthDate', values.birthDate);
    onSubmit(values);
  },
  enableReinitialize: true,
  displayName: 'StudentForm' // helps with React DevTools
});

export default StudentFormWithFormik(StudentForm);
