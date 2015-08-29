/*!
 * backbone.iobind - Backbone.sync replacement
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


/**
 * # Backbone.sync
 *
 * Replaces default Backbone.sync function with socket.io transport
 *
 * ### Assumptions
 *
 * Currently expects active socket to be located at `window.socket`,
 * `Backbone.socket` or the sync'ed model own socket.
 * See inline comments if you want to change it.
 * ### Server Side
 *
 *     socket.on('todos:create', function (data, fn) {
 *      ...
 *      fn(null, todo);
 *     });
 *     socket.on('todos:read', ... );
 *     socket.on('todos:update', ... );
 *     socket.on('todos:delete', ... );
 *
 * @name sync
 */


// var socketSync = function (method, model, options) {
//     var params = _.extend({}, options)

//     if (params.url) {
//         params.url = _.result(params, 'url');
//     } else {
//         params.url = _.result(model, 'url') || urlError();
//     }

//     var cmd = params.url.split('/')
//     , namespace = (cmd[0] !== '') ? cmd[0] : cmd[1]; // if leading slash, ignore

//     if ( !params.data && model ) {
//         params.data = params.attrs || model.toJSON(options) || {};
//     }

//     if (params.patch === true && params.data.id == null && model) {
//         params.data.id = model.id;
//     }

//     // If your socket.io connection exists on a different var, change here:
//     var io = window.socketio

//     //since Backbone version 1.0.0 all events are raised in methods 'fetch', 'save', 'remove' etc

//     var defer = $.Deferred();
//     io.emit(namespace + ':' + method, params.data, function (err, data) {
//         if (err) {
//             if(options.error) options.error(err);
//             defer.reject();
//         } else {
//             if(options.success) options.success(data);
//             defer.resolve();
//         }
//     });
//     var promise = defer.promise();
//     model.trigger('request', model, promise, options);
//     return promise;
// };

var ajaxSync = Backbone.sync;

var getSyncMethod = function(model) {
    if (_.result(model.ajaxSync)) {
        return ajaxSync
    }
    return socketSync
}

var socketSync = function(method, model, options) {
    
    console.log('From socketSync:', method)
    // console.log('model:',model)
    console.log('model JSON:',model.toJSON())
    // console.log('options:',options)



    var params = _.extend({}, options)

    if (params.url) {
        params.url = _.result(params, 'url');
    } else {
        params.url = _.result(model, 'url') || urlError();
    }

    var cmd = params.url.split('/')
    , namespace = (cmd[0] !== '') ? cmd[0] : cmd[1]; // if leading slash, ignore

    // console.log('params:',params, namespace)



    socketio.emit(namespace,method, model.toJSON(),function(err, data){
        if (err) {
            if(typeof options.error == 'function')
                console.log('Error', options.error.toString()) //options.error(err);
            //defer.reject();
        } else {
            if(typeof options.success == 'function')
                options.success(data);
            //defer.resolve();
        }
        
    })
}

Backbone.sync = function( method, model, options) {
    return getSyncMethod(model).apply(this, [method, model, options])
}

_.extend(Backbone.View.prototype, {
    initialize_socket: function() {
        if(this.socket_events && _.size(this.socket_events) > 0){
            this.delegateSocketEvents(this.socket_events)
        }
    }
    ,delegateSocketEvents: function(events){
        for(var key in events){
            var method = events[key]
            if (typeof method !== 'function'){
                method = this[events[key]]
            }
            if(typeof method !== 'function'){
                throw new Error('Method "'+events[key]+'" does not exist or isn\'t a function')
            }
            method = _.bind(method, this)
            window.socketio.on(key, method)
        }
    }
})

var urlError = function() {
    throw new Error('A "url" property or function must be specified');
};


















////////////////////////////////////////////////////////////////////////





// /*!
//  * backbone.iobind - Backbone.sync replacement
//  * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
//  * MIT Licensed
//  */

// var ajaxSync = Backbone.sync;

// /**
//  * # Backbone.sync
//  *
//  * Replaces default Backbone.sync function with socket.io transport
//  *
//  * ### Assumptions
//  *
//  * Currently expects active socket to be located at `window.socket`,
//  * `Backbone.socket` or the sync'ed model own socket.
//  * See inline comments if you want to change it.
//  * ### Server Side
//  *
//  *     socket.on('todos:create', function (data, fn) {
//  *      ...
//  *      fn(null, todo);
//  *     });
//  *     socket.on('todos:read', ... );
//  *     socket.on('todos:update', ... );
//  *     socket.on('todos:delete', ... );
//  *
//  * @name sync
//  */


// var socketSync = function (method, model, options) {
//     var params = _.extend({}, options)

//     if (params.url) {
//         params.url = _.result(params, 'url');
//     } else {
//         params.url = _.result(model, 'url') || urlError();
//     }

//     var cmd = params.url.split('/')
//     , namespace = (cmd[0] !== '') ? cmd[0] : cmd[1]; // if leading slash, ignore

//     if ( !params.data && model ) {
//         params.data = params.attrs || model.toJSON(options) || {};
//     }

//     if (params.patch === true && params.data.id == null && model) {
//         params.data.id = model.id;
//     }

//     // If your socket.io connection exists on a different var, change here:
//     var io = model.socket || Backbone.socket || window.socket

//     //since Backbone version 1.0.0 all events are raised in methods 'fetch', 'save', 'remove' etc

//     var defer = $.Deferred();
//     io.emit(namespace + ':' + method, params.data, function (err, data) {
//         if (err) {
//             if(options.error) options.error(err);
//             defer.reject();
//         } else {
//             if(options.success) options.success(data);
//             defer.resolve();
//         }
//     });
//     var promise = defer.promise();
//     model.trigger('request', model, promise, options);
//     return promise;
// };

// var getSyncMethod = function(model) {
//     if (_.result(model.ajaxSync)) {
//         return ajaxSync;
//     }

//     return socketSync;
// };
// Backbone.sync = function(method, model, options) {
//     console.log(method)
//     console.log(model)
//     console.log(options)
// }

// var Product = Backbone.Model.extend({

// })
// var ProductV = Backbone.Model.View.extend({
//     initialize: function() {

//     }
//     ,events: {
//         'click #add-product': function(){}
//     }
// })
// var Invertory = Backbone.Collection.extend({

// })
// var MyInventory = Backbone.View.extend({
//     initialize: function() {
//         this.initialize_socket()
//     }
//     , initialize_socket: function() {
//         if(this.socket_events && _.size(this.socket_events) > 0){
//             this.delegateSocketEvents(this.socket_events)
//         }
//     }
//     ,delegateSocketEvents: function(events){
//         for(var key in events){
//             var method = events[key]
//             if (typeof method !== 'function'){
//                 method = this[events[key]]
//             }
//             if(typeof method !== 'function'){
//                 throw new Error('Method "'+events[key]+'" does not exist or isn\'t a function')
//             }
//             method = _.bind(method, this)
//             window.socketio.on(key, method)
//         }
//     }
// })
// // Override 'Backbone.sync' to default to socketSync,
// // the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
// /*
//   Backbone.sync = function(method, model, options) {
//   return getSyncMethod(model).apply(this, [method, model, options]);
//   };
// */
// // Throw an error when a URL is needed, and none is supplied.
// // Copy from backbone.js#1558
// var urlError = function() {
//     throw new Error('A "url" property or function must be specified');
// };
