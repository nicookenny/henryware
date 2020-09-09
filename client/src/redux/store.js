import { createStore } from "redux";
import rootReducer from './reducers/reducer';


const store = createStore(
	rootReducer,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    //applyMiddleware(thunk)
	);