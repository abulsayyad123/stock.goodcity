import attr from 'ember-data/attr';
import Ember from 'ember';
import { hasMany } from 'ember-data/relationships';
import Addressable from './addressable';

export default Addressable.extend({
  firstName:   attr('string'),
  lastName:    attr('string'),
  mobile:      attr('string'),
  createdAt:   attr('date'),
  email:       attr('string'),
  organisations_users_ids: attr(),

  // permission:  belongsTo('permission', { async: false }),

  userRoles: hasMany('userRoles', { async: false }),
  roles: hasMany('roles', { async: false }),

  fullName: Ember.computed('firstName', 'lastName', function(){
    return (this.get('firstName') + " " + this.get('lastName'));
  }),

  organisations: hasMany('organisation', {async: false}),
  organisationsUsers: hasMany('organisationsUsers', {async: false}),

  // image:       belongsTo('image', { async: false }),
});
