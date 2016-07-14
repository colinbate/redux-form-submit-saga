import {put, take, race, call, spawn} from 'redux-saga/effects';
import {SubmissionError} from 'redux-form';

const identity = f => f;
const FORM_SUBMIT = 'redux-form-submit-saga/FORM_SUBMIT';
export const SUFFIX = [
  'SUBMIT',
  'SUCCESS',
  'FAILURE'
];

function formSubmit (submitCreator, successActionType, failureActionType, values, resolve, reject) {
  return {
    type: FORM_SUBMIT,
    meta: {
      successActionType,
      failureActionType,
      resolve,
      reject
    },
    payload: submitCreator(values)
  };
}

const creatorFactory = (type, transform) => payload => ({
  type,
  payload: transform(payload)
});

function normalizeShortSig (root, transform = identity) {
  const types = SUFFIX.map(s => `${root}_${s}`);
  types[0] = creatorFactory(types[0], transform);
  return types;
}

function normalizeLongSig (submit, success, failure) {
  const submitCreator = typeof submit === 'string' ? creatorFactory(submit, identity) : submit;
  return [submitCreator, success, failure];
}

function normalizeActionArray (input) {
  if (!input.length) {
    throw new Error('You must provide action types to onSubmitActions');
  }
  if (typeof input[0] === 'object') {
    return normalizeLongSig(input[0].submit, input[0].success, input[0].failure);
  }
  if (input.length > 2) { // eslint-disable-line no-magic-numbers
    return normalizeLongSig(...input);
  }
  return normalizeShortSig(...input);
}

export function onSubmitActions (...actions) {
  const actionArray = normalizeActionArray(actions);
  return (values, dispatch) =>
    new Promise((resolve, reject) => {
      dispatch(formSubmit(...actionArray, values, resolve, reject));
    });
}

export function* formSubmitSaga () {
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
    yield put(payload);

    const {success, failure} = yield race({
      success: take(successActionType),
      failure: take(failureActionType)
    });

    if (success) {
      yield call(resolve, success.payload);
    } else {
      yield call(reject, new SubmissionError(failure.payload));
    }
  }
}

export function addFormSubmitSagaTo (root) {
  if (!root) {
    return formSubmitSaga;
  }
  return function* formSubmitSagaComposed () {
    yield [
      spawn(root),
      spawn(formSubmitSaga)
    ];
  };
}
