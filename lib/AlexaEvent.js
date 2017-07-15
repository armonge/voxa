'use strict';

const _ = require('lodash');

class AlexaEvent {
  constructor(event, lambdaContext) {
    _.merge(this, {
      session: {
        attributes: { },
      },
      request: { },
    }, event);

    if (_.isEmpty(_.get(this, 'session.attributes'))) {
      _.set(this, 'session.attributes', {});
    }

    this.lambdaContext = lambdaContext;
    this.intent = new Intent(this.request.intent);
  }

  get user() {
    return _.get(this, 'session.user') || _.get(this, 'context.System.user');
  }
}

class Intent {
  constructor(rawIntent) {
    _.merge(this, rawIntent);
  }

  get params() {
    return _(this.slots)
      .map((slot) => {
        if (!slot.resolutions) {
          return [slot.name, slot.value];
        }

        if (_.get(slot, 'resolutions.resolutionsPerAuthority.0.status.code') === 'ER_SUCCESS_NO_MATCH') {
          return [slot.name, slot.value];
        }

        return [slot.name, _.get(slot, 'resolutions.resolutionsPerAuthority.0.values.0.value.id')];
      })
      .fromPairs()
      .value();
  }
}

module.exports = AlexaEvent;
