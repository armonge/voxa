'use strict';

const expect = require('chai').expect;
const CortanaEvent = require('../../lib/adapters/cortana/CortanaEvent');

describe('CortanaEvent', () => {
  it('should map a Microsoft.Launch intent to a voxa LaunchIntent', () => {
    const rawEvent = require('../requests/cortana/microsoft.launch.json');
    const event = new CortanaEvent(rawEvent);
    expect(event.request.type).to.equal('IntentRequest');
    expect(event.intent.name).to.equal('LaunchIntent');
  });

  it('should map an endOfConversation request to a voxa SessionEndedRequest', () => {
    const rawEvent = require('../requests/cortana/endOfRequest.json');
    const event = new CortanaEvent(rawEvent);
    expect(event.request.type).to.equal('SessionEndedRequest');
  });
});
