import React from "react";
import PropTypes from "prop-types";
import { withFormik } from "formik";
import moment from "moment";
import Field from "../../../utils/FieldAdapter";

import {
  Form,
  RenderField,
  RenderSelect,
  ReactSelect,
  Row,
  Col,
  Label,
  Button
} from "../../common/components/web";
import {
  required,
  validateForm,
  dateValidation
} from "../../../../../common/validation";

const journalFormSchema = {
  activity: [required],
  activityDate: [required, dateValidation]
};

const validate = values => validateForm(values, journalFormSchema);

const StudentJournalForm = ({
  values,
  handleSubmit,
  journal,
  subjects,
  activitys
}) => {
  console.log(`StudentFormWeb|values.activityDate|${values.activityDate}|`);
  var tempBirthDate;
  if (
    values.activityDate &&
    !isNaN(values.activityDate) &&
    values.activityDate.length >= 10 &&
    moment(parseInt(values.activityDate)).isValid()
  ) {
    values.activityDate = moment(parseInt(values.activityDate)).format(
      "MM/DD/YYYY"
    );
  } else if (!values.activityDate) {
    values.activityDate = moment().format("MM/DD/YYYY");
  }
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
            placeholder="Activity Date (MM/DD/YYYY)"
          />
          <Field
            component={ReactSelect}
            type="select"
            name="subject"
            value={values.subject}
            placeholder="subject"
          >
            <option value="placeholder">Select Subject </option>
            {subjects &&
              subjects.map(s => {
                return (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                );
              })}
          </Field>
          <Field
            name="activity"
            component={RenderField}
            type="select"
            value={values.activity}
            placeholder="activity"
          >
            <option value="placeholder">Select Activity </option>
            {activitys &&
              activitys.map(a => {
                return (
                  a.subject &&
                  a.subject === values.subject && (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  )
                );
              })}
          </Field>

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
  activityDate: PropTypes.number,
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
    values.activityDate = moment(values.activityDate, "MM/DD/YYYY").valueOf();
    console.log(
      "StudentJournalFormWeb",
      "StudentJournalFormWithFormik",
      "handleSubmit",
      "values.activityDate",
      values.activityDate
    );

    await onSubmit(values);
    resetForm({ content: "" });
  },
  validate: values => validate(values),
  displayName: "JournalForm", // helps with React DevTools,
  enableReinitialize: true
});

export default StudentJournalFormWithFormik(StudentJournalForm);
