import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  model(params) {
    return (
      this.store.peekRecord("gc_organisation", params.organisation_id) ||
      this.store.findRecord("gc_organisation", params.organisation_id, {
        reload: true
      })
    );
  },

  async setupController(controller, model) {
    this._super(controller, model);
    this.setOrganisationUsers(model);
    this.setOrganisationTypes(model);
    this.setCountry(model);
  },

  async setCountry(model) {
    const country = model.get("country");
    this.controller.set("country", {
      id: country.get("id"),
      nameEn: country.get("nameEn")
    });

    this.controller.set("countryValue", { country_id: country.get("id") });
  },

  async setOrganisationUsers(model) {
    let gcOrganisationUsers = this.store
      .peekAll("organisationsUser")
      .filterBy("organisationId", parseInt(model.id));
    this.controller.set("gcOrganisationUsers", gcOrganisationUsers);
  },

  async setOrganisationTypes(model) {
    const data = await this.getOrganisationTypes();
    this.controller.set("organisationTypes", data);

    const selectedOrganisationType = this.store.peekRecord(
      "organisationType",
      model.get("organisationTypeId")
    );
    this.controller.set("selectedOrganisationType", selectedOrganisationType);
  },

  async getOrganisationTypes() {
    const organisationTypes = this.store.peekAll("organisationTypes");
    if (organisationTypes.content.length) {
      return organisationTypes;
    } else {
      return await this.store.findAll("organisationType", {
        reload: true
      });
    }
  }
});
