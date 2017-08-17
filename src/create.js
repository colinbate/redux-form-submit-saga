import {all, spawn} from 'redux-saga/effects';
import {onSubmitActions} from './common';
import formSubmitSaga from './form-submit-saga';

const factory = SubmissionError => ({
  onSubmitActions,
  formSubmitSaga: formSubmitSaga(SubmissionError),

  addFormSubmitSagaTo (root) {
    if (!root) {
      return formSubmitSaga(SubmissionError);
    }
    return function* formSubmitSagaComposed () {
      if (all) {
        yield all([
          spawn(root),
          spawn(formSubmitSaga(SubmissionError))
        ]);
      } else {
        yield [
          spawn(root),
          spawn(formSubmitSaga(SubmissionError))
        ];
      }
    };
  }

});

export default factory;
