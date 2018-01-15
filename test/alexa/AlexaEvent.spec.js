'use strict';

const expect = require('chai').expect;
const AlexaEvent = require('../../src/platforms/alexa/AlexaEvent').AlexaEvent;
const tools = require('../tools');

const rb = new tools.AlexaRequestBuilder();

describe('AlexaEvent', () => {
  it('should show an empty intent if not an intent request', () => {
    const alexaEvent = new AlexaEvent(rb.getSessionEndedRequest());
    expect(alexaEvent.intent.params).to.be.empty;
    expect(alexaEvent.intent.name).equal('');
  });

  it('should assign all event.request properties', () => {
    const alexaEvent = new AlexaEvent({ request: { someProperty: 'someValue', someOtherProperty: 'someOtherValue' } });
    expect(alexaEvent.request.someProperty).to.equal('someValue');
    expect(alexaEvent.request.someOtherProperty).to.equal('someOtherValue');
  });

  it('should format intent slots', () => {
    const alexaEvent = new AlexaEvent({ request: { intent: { name: 'SomeIntent', slots: [{ name: 'Dish', value: 'Fried Chicken' }] } } });
    expect(alexaEvent.intent.params).to.deep.equal({ Dish: 'Fried Chicken' });
  });

  it('should get token', () => {
    const alexaEvent = new AlexaEvent({ request: {token: 'some-token', intent: { name: 'SomeIntent', slots: [{ name: 'Dish', value: 'Fried Chicken' }] } } });
    expect(alexaEvent.token).to.equal('some-token');
  });

  it('should find users on the context', () => {
    const alexaEvent = new AlexaEvent({ context: { System: { user: { userId: 'Fried Chicken' } } }, request: { } });
    expect(alexaEvent.user.userId).to.equal('Fried Chicken');
  });

  it('should find users on the session', () => {
    // The Echo simulator from the test menu doesn't provide the context, so this is necessary
    const alexaEvent = new AlexaEvent({ session: { user: { userId: 'Fried Chicken' } }, request: { } });
    expect(alexaEvent.user.userId).to.equal('Fried Chicken');
  });

  it('should set session attributes to an object on receiving a null value', () => {
    const alexaEvent = new AlexaEvent({
      session: { attributes: null },
      request: { },
    });
    expect(alexaEvent.session.attributes).to.deep.equal({});
  });
});
