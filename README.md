# redux-form-submit-saga

Handles redux-form submissions using redux-saga

## Install

```
npm install -S redux-form-submit-saga
```

## Usage

### Integrate with Sagas

You can integrate this package with your other sagas as follows:

```js
import {createSagaMiddleware} from 'redux-saga';
import {addFormSubmitSagaTo} from 'redux-form-submit-saga';
import {allMySagas} from '...';

const sagaMiddleware = createSagaMiddleware();
// ... create store with middleware ...
const rootSaga = addFormSubmitSagaTo(allMySagas);
sagaMiddleware.run(rootSaga);
```

If you need to access the saga directly, it can be imported as `formSubmitSaga`.

### Integrate with Forms

For each form where you want to submit with something async (often), you can setup the submit function like this:

```js
import {reduxForm, Field} from 'redux-form';
import {onSubmitActions} from 'redux-form-submit-saga';

const MyForm = ({handleSubmit}) => (
  <form onSubmit={handleSubmit}>
    <Field component="input" type="text"/>
    <button type="submit">Submit</button> 
  </form>
);

export default reduxForm({
  form: 'myForm',
  onSubmit: onSubmitActions('MY_FORM')
})(MyForm);
```

This is assuming you are using `handleSubmit` within your form and not invoking it with an inline handler function.

There are multiple ways to configure `onSubmitActions`, the simplest being the one above.

```
onSubmitActions(root: string, transform?: Function)
```

You pass in a string, and the action types are derived from that with the suffixes: `_SUBMIT`, `_SUCCESS`, and `_FAILURE`. You can optionally provide a transform function which will be used to transform the form values before being added to the submit action.

```
onSubmitActions(submit: string | Function, success: string, failure: string)
```

Here you can pass each action type separately. The submit action (first parameter) can be an action creator function if desired.

### Handle Submissions using Sagas

Once set up you should be able to do the following:

```js
import * as api from '...';
import {call, put} from 'redux-saga/effects';
import {takeLatest} from 'redux-saga';

function* myFormSaga (action) {
  try {
    const response = yield call(api.submitMyForm, action.payload);
    yield put({type: 'MY_FORM_SUCCESS', payload: response.body});
  } catch (err) {
    yield put({type: 'MY_FORM_FAILURE', payload: {_error: err.message}});
  }
}

export function* watchMyForm () {
  yield* takeLatest('MY_FORM_SUBMIT', myFormSaga);
}
```

## Immutable.js support

If you are using Immutable.js with redux-form, you can import the above functions from `redux-form-submit-saga/immutable`.

If you want to use ES modules for tree-shaking or other purposes, you'll need to use `redux-form-submit-saga/es/immutable` directly.
