
"use strict";

/**
 * LICENCE: CC BY
 * SOURCE: https://creativecommons.org/licenses/by/4.0/legalcode
 * 
 * 

 */
  



/**
 *  redirectional event dispatcher
 * 
 * simple usage example
 * 
 * disatch:
 *  liveEvent.dispatch('eventName',data); or multiple seperated by commas 'eventName,eventName2'
    - if you call the same dispatch event more then once, it will overrite the last.

   watch:
   liveEvent.watch('eventName',(d)=>{ 
        //last new data on event
        console.log('eventName cb', d.resp)
    })
    - subsequent watch events of the same name are ignored.
    
    delete:
    liveEvent.delete(eventID);  
    - this will delete the event pair all together.
    - it can be multiple eventID's seperated by comma's: " eventID1,eventID2"

 */


var _ = require('lodash');
var color = require('bash-color');

class LiveEvent {
    constructor(opts) {

        this._promise = {};
        this._instance = {};
        this.watchInstance = {};
        this._eventQue = {};
        this.debug =null;
        this.presets(opts);

    }

    presets(opts) {
        if (_.isObject(opts)) {
            this.debug = opts.debug || null;
        }
        if (this.debug) {
            console.debug = function (val1, val2) {
                if (val1 && val2) {
                  console.log(color.yellow(`debug:: `), val1, val2)
                }
                else {
                    console.log(color.yellow(`debug:: `), val1)
                }
                return this;
            }

        }else{
            console.debug = function(){}
        }

    }

    get q() {
        return require('q');
    }
    get Event() {
        return function () {
            this.resp = null;
            this.historyData = [];
            this.index = 0;
            this.timestamp = null;
            this.eventName = null;
            this.__cb = null;
            this.checkHistory = () => {
                if (this.historyData.length > 0) {
                    this.historyData.map((item, inx) => {
                        if (!item) return;
                        setTimeout(() => {
                            this.__cb(item); // magic
                            this.index++;
                        }, 100)
                        return item
                    })
                    this.historyData = []; // clear the events bin
                    return true;
                } else return false;
            }

            this.cbNow = () => {
                this.timestamp = Date.now();
                const d = { eventName: this.eventName, resp: this.resp, timestamp: this.timestamp };
                if (!this.__cb) {
                    if (d.resp) this.historyData.push(d);
                }
                if (typeof this.__cb == 'function') {
                    if (this.checkHistory() === true) {
                        // callback done
                        return;
                    }
                    if (d.resp) {
                        this.__cb(d); // magic   
                        //  this.historyData = [];
                    }
                    this.index++;
                }

            }
            this.fireEvent = () => {
                this.cbNow();
            }
        }

    };

    delete(eventNames, cb) {
        if(!eventNames){
            console.debug(`eventName/watchInstance ${eventNames} not set!`)
        }
        var check = eventNames.replace(/\s/g, '');
        var have_multiple = check.split(",");
        var one_callback = 1;
        var inst = have_multiple.map((env, inx) => {
            if(!this.watchInstance[env]) {
                console.debug(`no live eventName's found to delete!`)
                return 
            }
            if (this._instance[env]) delete this._instance[env];
            if (this.watchInstance[env]) delete this.watchInstance[env];
            if (!this.watchInstance[env] && !this._instance[env] && one_callback === 1) {
                console.debug(`eventName/watchInstance ${env} deleted!`)
                if (typeof cb === 'function') {
                    setTimeout(() => {
                        cb(true)
                    }, 100)
                    one_callback++;
                }
            }
        })
    }

    lastPromise(_set = true, env, data) {
        if (_set && !env) {
            return Promise.reject('set is set but env is not');
        }

        var defer = this.q.defer();
        if (_set && env !== null) {
            console.debug('this._promise env set')
            this._promise[env] = defer;
            return this._promise[env];
        }

        if (!env || !data) {
            // console.debug('env or data not set');
            return Promise.reject('env or data not set');
        }

        if (this._promise[env]) {
            this._promise[env].resolve(data);
            return this._promise[env].promise;
        } else {
            return Promise.reject(`eventName: ${env} was misssed and not resolved!!`);
        }

    }

    updateQuedInstance(updateInstance, skipEvent) {
        var len = Object.keys(this._eventQue).length
        if (len) {
            for (var key in this._eventQue) {
                if (!this._eventQue.hasOwnProperty(key)) return;
                if (skipEvent !== key) continue;
                var que = this._eventQue[key]
                if (que) {
                    updateInstance.resp = que.resp;
                    updateInstance.__cb = que.cb;
                    updateInstance.eventName = que.eventName;
                    updateInstance.fireEvent(); /// this will update our call backs
                    console.debug(`que instance for ${key} updated`);
                }
            }
        }
        else return false

    }
    eventQue(event, cb, dataForQue = false, final_cb) {

        if (this._eventQue[event] && cb) {
            console.debug(`eventName ${event} already in que`);
            return;
        }

        // it means that we are on the watch now and expecting call back
        if (!dataForQue && !this._eventQue[event]) {
            this._eventQue[event] = {
                cb: cb,
                eventName: event
            }
            console.debug(`eventName ${event} Qued`);
        }
        // it means that we called dispatch with dataForQue
        if (dataForQue && this._eventQue[event] && !cb) {
            this._eventQue[event].resp = dataForQue;
            this._eventQue[event].resp.delayed = true;
            if (typeof final_cb === 'function') {
                setTimeout(function () {
                    final_cb(true);
                }, 166);
            }
        }

    }

    callEvent(eventName, cb, watch = false, dataForQue) {

        if (!_.isString(eventName)) {
            console.debug('eventName should be a string', eventName)
            return
        }
        var check = eventName.replace(/\s/g, '');
        var have_multiple = check.split(",");
        var _t = this;

        var inst = have_multiple.map((env, inx) => {

            if (!env) {
                console.debug('no match for ', eventName)
                return;
            }

            if (env) {
                if (env === ' ' || env === ',' || env.length < 3) {
                    return;
                }
            }


            if (watch && this.watchInstance[env]) {
                cb({ error: `eventName ${env} already registered` })
                return
            }

            if (watch && !this._instance[env] && typeof cb === 'function') {
                cb({ error: `eventName ${env} qued` });
                this.eventQue(env, cb, dataForQue || false);
                return false;
            }

            if (watch && this._instance[env]) {
                cb({ eventName: env })
            }

            if (!this._instance[env] && !watch) {

                var Live = _t.Event
                this._instance[env] = new Live();
                // console.debug(`eventName instance ${env} created`)
                if (dataForQue) {
                    this.eventQue(env, false, dataForQue, () => {
                        this.updateQuedInstance(this._instance[env], env);
                        this._instance[env].eventName = env;
                    });
                } else {
                    console.debug('counld not complete qued events due to dataForQue is null');
                }

                this._instance[env].eventName = env;
            }

            if (cb) {
                this._instance[env].__cb = cb;
                this._instance[env].fireEvent();
            }

            return this._instance[env];
        })

        return inst;
    }

    errorHandler(str, type = 'watch') {

        if (!str && type === 'dispatch') {
            console.debug('dispatch, need to provide eventName');
            return;
        }

        if (!str && type === 'watch') {
            console.debug('watch, need to provide eventName');
            return true;
        }

        if (type === 'dispatch' && str.indexOf(',') !== -1) {
            console.debug(`watch, eventName :'${str}' invalid setting`);
            return true;
        }

        if (!_.isString(str)) {
            console.debug(`watch, eventName :${str} should be a string`);
            return true;
        }

        if (str.indexOf(',') !== -1 && str.length === 1 && type === 'watch') {
            console.debug(`watch, eventName :'${str}' invalid setting`);
            return true;
        }

        if (str.indexOf(' ') !== -1 && str.length === 1) {
            console.debug(`watch, eventName :'${str}' cannot be an empty space`);
            return true;
        }

        return false;
    }

    watch(eventName, cb) {
        
        var err = this.errorHandler(eventName,'watch');
        if(err) return;

        setTimeout(() => {
            var evn;
            this.callEvent(eventName, (d) => {
                if (!d.eventName) {
                    return
                }
                if (d.eventName) {
                    this.watchInstance[d.eventName] = true;
                    evn = d.eventName;
                }

                if (d.error) {
                    //   console.debug(d.error)
                    return;
                }
                if (d.resp) {
                    return cb({ resp: d.resp, eventName: evn, timestamp: d.timestamp })
                }

            }, true)
        }, 200)

    }

    dispatch(eventName, data) {

        var err = this.errorHandler(eventName,'dispatch');
        if(err) return;
        

        if (typeof data === 'string') {
            data = { data: data }
        }

        var evnt = this.callEvent(eventName, false, false, data);

        if (!evnt.length) {
            console.debug('liveEvent evnt error');
            return;
        }

        var instances = evnt.map((item, inx) => {

            if (item) {
                item.resp = data;
                item.fireEvent();
                return item;
            }
        })

        return instances;
    }
}

module.exports = LiveEvent;