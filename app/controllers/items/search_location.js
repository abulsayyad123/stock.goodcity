import Ember from "ember";
import searchModule from "../search_module";
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default searchModule.extend({

  queryParams: ['isSet'],
  isSet: false,

  item: Ember.computed.alias("model.item"),
  searchModelName: "location",
  messageBox: Ember.inject.service(),

  sortProperties: ["createdAt:desc"],
  recentlyUsedLocations: Ember.computed.sort("model.locations", "sortProperties"),

  displayUserPrompt: false,
  showAllSetItems: false,
  selectedLocation: null,
  hideDetailsLink: true,

  actions: {
    displayMoveOverlay(location) {
      this.set("displayUserPrompt", true);
      this.set("selectedLocation", location);
    },

    moveItem() {
      var location = this.get("selectedLocation");
      var item = this.get("item");

      var showAllSetItems = this.get("showAllSetItems");
      this.set("showAllSetItems", false);

      var loadingView = getOwner(this).lookup('component:loading').append();
      var url;
      if(item.get("isSet")) {
        url = `/items/${item.get('setItem.id')}/move_stockit_item_set`;
      } else {
        url = `/items/${item.get('id')}/move_stockit_item`;
      }

      new AjaxPromise(url, "PUT", this.get('session.authToken'), { location_id: location.get("id") })
        .then(data => {
          this.get("store").pushPayload(data);
          if(showAllSetItems) {
            this.transitionToRoute("items", {queryParams: { itemSetId: item.get("itemId") } });
          } if(this.get('isSet')) {
            this.transitionToRoute("items.detail", item);
          } else {
            this.transitionToRoute("items");
          }
        })
        .catch((response) => {
          loadingView.destroy();
          var errorMessage = response.responseJSON.errors[0];
          if(errorMessage.toLowerCase().indexOf("error") >= 0) {
            this.get("messageBox").alert(errorMessage);
          }
        })
        .finally(() => {
          loadingView.destroy();
        });
    }
  },

});
