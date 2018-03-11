import React from "react";
import PropTypes from "prop-types";
import { withFormik } from "formik";
import Field from "../../../utils/FieldAdapter";
import {
  Form,
  RenderField,
  Row,
  Col,
  Label,
  Button
} from "../../common/components/web";
import { required, validateForm } from "../../../../../common/validation";

const journalFormSchema = {
  activity: [required]
};

const validate = values => validateForm(values, journalFormSchema);

const StudentJournalForm = ({ values, handleSubmit, journal }) => {
  return (
    <Form name="journal" onSubmit={handleSubmit}>
      <Row>
        <Col xs={2}>
          <Label>{journal.id === null ? "Add journal" : "Edit journal"}</Label>
        </Col>
        <Col xs={8}>
          <Field
            name="activityDate"
            component={RenderField}
            type="text"
            value={values.activityDate}
            placeholder="activityDate"
          />
          <Field
            name="subject"
            component={RenderField}
            type="text"
            value={values.subject}
            placeholder="subject"
          />
          <Field
            name="activity"
            component={RenderField}
            type="text"
            value={values.activity}
            placeholder="activity"
          />

          <Field
            name="content"
            component={RenderField}
            type="text"
            value={values.content}
            placeholder="Journal"
          />
        </Col>
        <Col xs={2}>
          <Button color="primary" type="submit" className="float-right">
            Save
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

StudentJournalForm.propTypes = {
  handleSubmit: PropTypes.func,
  journal: PropTypes.object,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  values: PropTypes.object,
  subject: PropTypes.string,
  activity: PropTypes.string,
  activityDate: PropTypes.string,
  content: PropTypes.string,
  changeContent: PropTypes.func
};

const StudentJournalFormWithFormik = withFormik({
  mapPropsToValues: props => ({
    subject: props.journal && props.journal.subject,
    activity: props.journal && props.journal.activity,
    activityDate: props.journal && props.journal.activityDate,
    content: props.journal && props.journal.content
  }),
  async handleSubmit(values, { resetForm, props: { onSubmit } }) {
    await onSubmit(values);
    resetForm({ content: "" });
  },
  validate: values => validate(values),
  displayName: "JournalForm", // helps with React DevTools,
  enableReinitialize: true
});

export default StudentJournalFormWithFormik(StudentJournalForm);
