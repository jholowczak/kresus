// Generated by CoffeeScript 1.7.1
var bank, banks, operations, output, _i, _len;

banks = require('../banks-all.json');

output = {};

operations = require('../operations.json');

for (_i = 0, _len = banks.length; _i < _len; _i++) {
  bank = banks[_i];
  output[bank.uuid] = operations;
}

module.exports = output;
