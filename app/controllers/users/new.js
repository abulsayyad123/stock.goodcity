import config from '../../config/environment';
import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from 'stock/utils/ajax-promise';
import { translationMacro as t } from "ember-i18n";

export default Ember.Controller.extend({
  i18n: Ember.inject.service(),
  phoneNumberPlaceholder: t("organisation.user.phone_number"),
  fNamePlaceholder: t("organisation.user.john"),
  lNamePlaceholder: t("organisation.user.doe"),
  emailPlaceholder: t("organisation.user.email"),
  positionPlaceholder: t("organisation.user.position_in_organisation"),

  organisationId: Ember.computed.alias("model.id"),
  messageBox: Ember.inject.service(),

  actions: {
    saveUser() {
      var loadingView = getOwner(this).lookup('component:loading').append();
      var mobilePhone = config.APP.HK_COUNTRY_CODE + this.get('mobilePhone');
      var firstName = this.get('firstName');
      var lastName = this.get('lastName');
      var organisationId = this.get('organisationId');
      var position = this.get("position");
      var email = this.get("email");
      new AjaxPromise("/organisations_users", "POST", this.get('session.authToken'), { organisations_user: {
        organisation_id: organisationId, position: position, user_attributes: { first_name: firstName,
        last_name: lastName, mobile: mobilePhone, email: email }}}).then(data =>{
          loadingView.destroy();
          this.get("store").pushPayload(data);
          this.transitionToRoute("organisations.users", organisationId);
      });
    },

    cancelForm() {
      this.get("messageBox").custom(
        "You will lose all your data. Are you sure you want to cancel this item?",
        "Yes",
        () => {
          Ember.run.later(this, function() {
            this.transitionToRoute("/");
          },0);
        },
        "No");
    }
  }
});
