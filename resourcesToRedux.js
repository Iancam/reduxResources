import { camelCase, keyBy, keys, mapValues, snakeCase } from "lodash";

// These could be extended to handle lists and object literals
const baseReducers = {
  set:
    (defaultState) =>
    (state = defaultState, action) =>
      action.payload,
  update:
    (defaultState) =>
    (state = defaultState, action) => ({
      ...state,
      ...action.payload,
    }),
};

const action = (type) => (payload) => ({ type, payload });

/**
 *
 * generates Redux actions and reducers from a given state map object.
 * It takes an object with state names as keys and default values as values,
 * and returns an object with corresponding actions and reducers for each state.
 * The actions include set and update functions for each state, and the
 * reducers handle these actions to update the state accordingly.
 *
 * For example, from {cat: "meow"} you get actions:
 *  - setCat(),
 *  - updateCat()
 * and reducers for types "SET_CAT", and "UPDATE_CAT"
 *
 * For simplicity, this library expects that all states are objects.
 * To handle a list, index items on an ID field, or create an id from the list index.
 *
 *
 */
export function fromResources(stateMap) {
  const resourceNames = Object.keys(stateMap).filter(
    (k) => typeof stateMap[k] !== "function"
  );
  const prefixes = "update set".split(" ");

  const reducers = resourceNames.reduce((reducers, name) => {
    const defaultState = stateMap[name];
    const handlers = toHandlers(prefixes, name, defaultState);

    const reducer = (state = defaultState, action) => {
      return handlers[action.actiontype]
        ? handlers[action.actiontype](state, action)
        : state;
    };
    return {
      ...reducers,
      [name]: reducer,
    };
  }, {});

  const actionTypes = resourceNames
    .map((name) =>
      prefixes.map((prefix) => ({
        prefix,
        type: snakeCase(`${prefix}_${name}`),
      }))
    )
    .flat();

  const actions = actionTypes
    .map(({ type }) => ({
      fname: camelCase(type),
      action: action(type),
    }))
    .reduce((obj, curr) => ({ ...obj, [curr.fname]: curr.action }), {});

  return { actions, reducers };
}

/**
 * Generates Redux handlers for different prefixes based on the state name and
 * default state.
 */
function toHandlers(prefixes, name, defaultState) {
  return prefixes
    .map((prefix) => ({ prefix, type: snakeCase(`${prefix}_${name}`) }))
    .reduce(
      (all, curr) => ({
        ...all,
        [curr.type.toUpperCase()]: baseReducers[curr.prefix](defaultState),
      }),
      {}
    );
}
