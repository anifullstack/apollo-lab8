import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import Field from '../../../utils/FieldAdapter';
import { FormView, RenderField, FormButton } from '../../common/components/native';
import { required, validateForm } from '../../../../../common/validation';

const journalFormSchema = {
  activity: [required]
};

const validate = values => validateForm(values, journalFormSchema);

const StudentJournalForm = ({ values, handleSubmit, journal }) => {
  let operation = 'Add';
  if (journal.id !== null) {
    operation = 'Edit';
  }

  return (
    <FormView>
      <Field
        name="activityDate"
        component={RenderField}
        type="text"
        value={values.activityDate}
        placeholder="activityDate"
      />
      <Field name="subject" component={RenderField} type="text" value={values.subject} placeholder="subject" />
      <Field name="activity" component={RenderField} type="text" value={values.activity} placeholder="activity" />
      <Field name="content" component={RenderField} type="text" value={values.content} placeholder="Journal" />
      <FormButton onPress={handleSubmit}>{operation}</FormButton>
    </FormView>
  );
};

StudentJournalForm.propTypes = {
  handleSubmit: PropTypes.func,
  setFieldValue: PropTypes.func,
  setFieldTouched: PropTypes.func,
  journal: PropTypes.object,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  values: PropTypes.object
};

const StudentJournalFormWithFormik = withFormik({
  mapPropsToValues: props => ({
    subject: props.journal && props.journal.subject,
    activity: props.journal && props.journal.activity,
    activityDate: props.journal && props.journal.activityDate,
    content: props.journal && props.journal.content
  }),
  validate: values => validate(values),
  handleSubmit: async (values, { resetForm, props: { onSubmit } }) => {
    await onSubmit(values);
    resetForm({ subject: '', activity: '', activityDate: '', content: '' });
  },
  displayName: 'JournalForm', // helps with React DevTools
  enableReinitialize: true
});

export default StudentJournalFormWithFormik(StudentJournalForm);
