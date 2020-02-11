import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set("openPackageSearch", false);
    this.set("openItemSearch", false);
    this.set("entity", null);
  },

  generateInventoryNumber() {
    return this.POST(`/inventory_numbers`);
  },

  printBarcode(pkgParams) {
    return this.POST(`/packages/print_barcode`, pkgParams);
  },

  removeInventoryNumber(code) {
    return this.PUT(`/inventory_numbers/remove_number`, code);
  },

  createPackage(pkgParams) {
    return this.POST(`/packages`, pkgParams);
  },

  updatePackage(pkgId, pkgParams) {
    return this.PUT(`/packages/${pkgId}`, pkgParams).then(data => {
      this.get("store").pushPayload(data);
    });
  },

  getCloudinaryImage(imageId) {
    return this.get("store")
      .peekAll("image")
      .filterBy("cloudinaryId", imageId)
      .get("firstObject");
  },

  createInventory(storageType) {
    Ember.run(() => {
      this.set("openPackageSearch", true);
      this.set("storageType", storageType);
    });
  },

  openItemsSearch(item) {
    Ember.run(() => {
      this.set("openItemSearch", true);
      this.set("entity", item);
    });
  },

  addRemoveItem(pkgId, params) {
    return this.PUT(`/packages/${pkgId}/add_remove_item`, params);
  },

  fetchContainedPackages(boxPalletId) {
    return this.GET(`/packages/${boxPalletId}/contained_packages`);
  },

  allChildPackageTypes(item) {
    let all_package_types = this.getAssociatedPkgTypes(
      item,
      "defaultChildPackages"
    ).concat(this.getAssociatedPkgTypes(item, "otherChildPackages"));
    return all_package_types.getEach("id");
  },

  getAssociatedPkgTypes(item, type) {
    let defaultChildPackageTypes = item.get("code").get(type);
    return this._getPackageTypes(defaultChildPackageTypes);
  },

  _getPackageTypes(types) {
    let packageTypeNames = (types || "").split(",");
    let packagesTypes = [];
    const allPackageTypes = this.get("store").peekAll("code");
    packageTypeNames.forEach(function(type) {
      allPackageTypes.filter(function(pkgType) {
        return pkgType.get("code") === type ? packagesTypes.push(pkgType) : "";
      });
    });
    return packagesTypes;
  }
});
