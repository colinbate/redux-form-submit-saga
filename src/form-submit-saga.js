import {all, put, take, race, call} from 'redux-saga/effects';
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

    let response;

    if (all) {
      response = yield all([
        race({
          success: take(successActionType),
          failure: take(failureActionType)
        }),
        put(payload),
      ]);
    } else {
      response = yield [
        race({
          success: take(successActionType),
          failure: take(failureActionType)
        }),
        put(payload),
      ];
    }
    const [{success, failure}] = response;

    if (success) {
      yield call(resolve, success.payload);
    } else {
      let reduxFormPayload = failure.payload;
      if (!failure.payload._error) {
        reduxFormPayload = {_error: failure.payload};
      }
      yield call(reject, new SubmissionError(reduxFormPayload));
    }
  }
};
