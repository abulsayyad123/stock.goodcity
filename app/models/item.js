import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import Ember from "ember";
import cloudinaryUrl from './cloudinary_url';

export default cloudinaryUrl.extend({

  imageUrl: Ember.computed.alias("image.imageUrl"),

  thumbImageUrl: Ember.computed('favouriteImage.{angle,cloudinaryId}', function(){
    return this.get("favouriteImage.thumbImageUrl") || this.generateUrl(120, 120, true);
  }),


  orderPackagesMoreThenZeroQty: Ember.computed("ordersPackages.@each.quantity", function() {
    return this.get("ordersPackages").filterBy('quantity');
  }),

  onHandQty: Ember.computed("ordersPackages.@each.quantity", function() {
    var totalQty = 0;
    this.get('ordersPackages').filterBy('state', "designated").forEach(record => {
      totalQty += record.get('quantity');
    });
    return totalQty + this.get('quantity');
  }),

  designatedItemCount: Ember.computed("ordersPackages.@each.quantity", function() {
    return this.get("ordersPackages").filterBy('state', "designated").length;
  }),

  dispatchedItemCount: Ember.computed("ordersPackages.@each.quantity", function() {
    return this.get("ordersPackages").filterBy('state', "dispatched").length;
  }),

  cancelledItemCount: Ember.computed("ordersPackages.@each.quantity", function() {
    return this.get("ordersPackages").filterBy('state', "cancelled").length;
  }),

  favouriteImage: Ember.computed('images.@each.favourite', function(){
    return this.get("images").filterBy("favourite", true).get("firstObject");
  }),

  notes:             attr('string'),
  grade:             attr('string'),
  inventoryNumber:   attr('string'),
  caseNumber:        attr('string'),
  quantity:          attr('number'),
  received_quantity: attr('number'),

  length:            attr('number'),
  width:             attr('number'),
  height:            attr('number'),

  sentOn:            attr('date'),
  isSet:             attr('boolean'),
  hasBoxPallet:      attr('boolean'),
  itemId:            attr('number'),
  allowWebPublish:   attr('boolean'),

  designation: belongsTo('designation', { async: false }),
  location:    belongsTo('location', { async: false }),
  code:        belongsTo('code', { async: false }),
  donorCondition: belongsTo('donor_condition', { async: false }),
  setItem:        belongsTo('set_item', { async: false }),

  ordersPackages:    hasMany('ordersPackages', { async: false }),
  images:       hasMany('image', { async: true }),

  isDispatched: Ember.computed.bool('sentOn'),
  isDesignated: Ember.computed.bool('designation'),
  orderCode: Ember.computed.alias('designation.code'),
  updatedAt: attr("date"),

  availableQty: Ember.computed("quantity", function() {
    return this.get('quantity');
  }),

  imageUrlList: Ember.computed('images.[]', function() {
    var imageList = [];
    this.get("images").forEach((image) => imageList.pushObject(image.get("imageUrl")));
    return imageList.uniq();
  }),

  setImages: Ember.computed('setItem.@each.items.@each.imageUrlList.[]', function() {
    var setItemImages = [];
    this.get("setItem.items").forEach((item) => {
      setItemImages = setItemImages.concat(item.get("imageUrlList"));
    });
    return setItemImages.uniq();
  }),

  allowLabelPrint: Ember.computed("", function() {
    return !this.get("isDispatched") && !this.get("isSet");
  }),
});
