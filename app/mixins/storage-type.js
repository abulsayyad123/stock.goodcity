import Ember from "ember";

export default Ember.Mixin.create({
  settings: Ember.inject.service(),
  storageTypes: Ember.computed(function() {
    return [
      {
        name: "Pallet",
        icon: "pallet",
        translation: "create_new_pallet",
        disable: this.get("settings.disableBoxPalletCreation")
      },
      {
        name: "Box",
        icon: "box-open",
        translation: "create_new_box",
        disable: this.get("settings.disableBoxPalletCreation")
      },
      {
        name: "Package",
        icon: "tag",
        translation: "create_new_item",
        disable: false
      }
    ];
  }),

  storageTypeIcon: Ember.computed("item", function() {
    switch (this.get("item.storageType.name")) {
      case "Box":
        return "box-open";
      case "Pallet":
        return "pallet";
      default:
        return "tag";
    }
  })
});
