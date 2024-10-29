import { mapValues, toPairs } from "lodash";

/**
 * Takes an array of reducers, and returns a single reducer that applies all of
 * the reducers in the array in sequence. The result of each reducer is passed
 * as the state to the next reducer.
 *
 * @param  {Array<Function>} reducerArray - Array of reducer functions to apply
 *                                          in sequence.
 * @return {Function}                     - A single reducer that applies all of
 *                                          the reducers in the array in sequence.
 */
function reduceReducers(reducerArray) {
  return (previous, current) =>
    reducerArray.reduce((p, r) => r(p, current), previous);
}

/**
 * Takes a list of objects with reducer functions as values, and returns a single
 * object with the same keys, but with the reducer functions combined into a
 * single reducer using the reduceReducers function.
 *
 * @param {Object[]} reducers - the list of objects with reducer functions
 * @returns {Object} the combined reducer object
 */
export const listOfReducersToReducer = (reducers) => {
  // Maps each reducer object to an array of key-value pairs using toPairs,
  // then flattens the resulting arrays into a single array of key, reducer pairs.
  const flattened = reducers
    .map((reducerObj) => toPairs(reducerObj))
    .reduce((acc, array) => [...acc, ...array]);

  // Groups the flattened pairs by key, creating an object where each key
  // has an array of corresponding reducers.
  const grouped = flattened.reduce((acc, pair) => {
    const key = pair[0];
    const val = pair[1];
    let array = (acc[key] && [...acc[key]]) || [];
    acc[key] = [...array, val];
    return acc;
  }, {});
  // transform each array of reducers into a single reducer using the reduceReducers function.
  return mapValues(grouped, (val) => reduceReducers(val));
};
