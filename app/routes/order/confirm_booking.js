import Ember from 'ember'; // jshint ignore:line
import orderUserOrganisation from './order_user_organisation';

export default orderUserOrganisation.extend({
  /* jshint ignore:start */
  async model() {
    let { order, organisation, user, organisationsUser } = await this._super(...arguments);
    return Ember.RSVP.hash({
      order,
      organisation,
      user,
      organisationsUser
    });
  },
  /* jshint ignore:end */

  setupController() {
    this._super(...arguments);
    this.controllerFor('application').set('showSidebar', false);
  },

  deactivate(){
    this.controllerFor('application').set('showSidebar', true);
  }
});
