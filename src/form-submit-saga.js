import {put, take, race, call} from 'redux-saga/effects';
import {FORM_SUBMIT} from './common';

export default (SubmissionError) => function* formSubmitSaga () {
  while (true) { // eslint-disable-line no-constant-condition
    const {
      meta: {
        successActionType,
        failureActionType,
        resolve,
        reject
      },
      payload
    } = yield take(FORM_SUBMIT);

    const [{success, failure}] = yield [
      race({
        success: take(successActionType),
        failure: take(failureActionType)
      }),
      put(payload),
    ];

    if (success) {
      yield call(resolve, success.payload);
    } else {
      yield call(reject, new SubmissionError(failure.payload));
    }
  }
};
