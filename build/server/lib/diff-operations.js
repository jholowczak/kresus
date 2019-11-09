"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _helpers = require("../helpers");

var _diffList = _interopRequireDefault(require("./diff-list"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isPerfectMatch(known, provided) {
  let oldRaw = known.raw.replace(/ /g, '').toLowerCase();
  let oldMoment = (0, _moment.default)(known.date);
  let newRaw = provided.raw.replace(/ /g, '').toLowerCase();
  let newMoment = (0, _moment.default)(provided.date);
  return Math.abs(known.amount - provided.amount) < 0.001 && oldRaw === newRaw && oldMoment.isSame(newMoment) && (known.type === _helpers.UNKNOWN_OPERATION_TYPE || provided.type === _helpers.UNKNOWN_OPERATION_TYPE || known.type === provided.type);
}

const HEURISTICS = {
  SAME_DATE: 5,
  SAME_AMOUNT: 5,
  SAME_TITLE: 5,
  SAME_TYPE: 1
};
const MAX_DATE_DIFFERENCE = 2;
const MIN_SIMILARITY = HEURISTICS.SAME_DATE + HEURISTICS.SAME_AMOUNT + 1;

function computePairScore(known, provided) {
  let knownMoment = (0, _moment.default)(known.date);
  let providedMoment = (0, _moment.default)(provided.date);
  let diffDate = Math.abs(knownMoment.diff(providedMoment, 'days'));
  let dateScore = 0;

  if (diffDate === 0) {
    dateScore = HEURISTICS.SAME_DATE;
  } else if (diffDate <= MAX_DATE_DIFFERENCE) {
    dateScore = HEURISTICS.SAME_DATE / (1 + diffDate);
  }

  let diffAmount = Math.abs(known.amount - provided.amount);
  let amountScore = diffAmount < 0.001 ? HEURISTICS.SAME_AMOUNT : 0;
  let typeScore = 0;

  if (provided.type === _helpers.UNKNOWN_OPERATION_TYPE) {
    typeScore = HEURISTICS.SAME_TYPE / 2;
  } else if (known.type === provided.type) {
    typeScore = HEURISTICS.SAME_TYPE;
  }

  let oldTitle = provided.raw.replace(/ /g, '').toLowerCase();
  let newTitle = known.raw.replace(/ /g, '').toLowerCase();
  let titleScore = oldTitle === newTitle ? HEURISTICS.SAME_TITLE : 0;
  return amountScore + dateScore + typeScore + titleScore;
}

const diffOperations = (0, _diffList.default)(isPerfectMatch, computePairScore, MIN_SIMILARITY);
var _default = diffOperations;
exports.default = _default;