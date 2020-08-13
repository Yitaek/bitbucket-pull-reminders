const RobinMessageParser = require('./robinMessageParser');
const DefaultMessageParser = require('./defaultMessageParser');

class MessageParserFactory {
  constructor(options) {
    this.parsers = [
      DefaultMessageParser,
      RobinMessageParser
    ];
  }

  getParser(type) {
    return this.parsers.find((parser) => (parser.type() === type));
  }
}

module.exports = MessageParserFactory
