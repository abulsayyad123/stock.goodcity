import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  name: attr("string"),
  state: attr("string"),
  locationId: attr("number"),
  location: belongsTo("location", { async: false }),
  stocktakeRevisions: hasMany("stocktake_revisions", { async: false }),
  revisions: Ember.computed.alias("stocktakeRevisions"),
  createdBy: belongsTo("user", { async: true }),

  dirtyRevisions: Ember.computed.filterBy("revisions", "dirty", true),
  cleanRevisions: Ember.computed.filterBy("revisions", "dirty", false),
  revisionsWithWarnings: Ember.computed.filterBy("revisions", "warning"),
  gainRevisions: Ember.computed.filterBy("revisions", "isGain"),
  lossRevisions: Ember.computed.filterBy("revisions", "isLoss")
});
