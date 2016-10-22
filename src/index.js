import {SubmissionError} from 'redux-form';
import create from './create';
export {SUFFIX} from './common';

export const {onSubmitActions, formSubmitSaga, addFormSubmitSagaTo} = create(SubmissionError);
