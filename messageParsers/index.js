const ExampleMessageParser = require('./exampleMessageParser');
const DefaultMessageParser = require('./defaultMessageParser');

class MessageParserFactory {
  constructor(options) {
    this.parsers = [
      DefaultMessageParser,
      ExampleMessageParser
    ];
  }

  getParser(type) {
    return this.parsers.find((parser) => (parser.type() === type));
  }
}

module.exports = MessageParserFactory
