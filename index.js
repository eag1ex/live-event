
"use strict";
const LiveEvent = require('./live.event.min.v1.0.0.js');
//const LiveEvent = require('./live.event.v1.0.0.js');


/// examples
var liveEvent = new LiveEvent({debug:true});
liveEvent.dispatch('magicEvent',{data:'data from magicEvent',index:1});

liveEvent.watch('magicEvent',(d)=>{
    const data = d.resp;
    console.log('magicEvent cb',data);
})


liveEvent.dispatch('eventMissed',{data:'sdata from eventMissed',index:1});
liveEvent.delete('eventMissed');

liveEvent.watch('eventMissed',(d)=>{
    const data = d.resp;
    console.log('eventMissed cb',data);
})


liveEvent.watch('delayedEvent',(d)=>{
    const data = d.resp;
    console.log('delayedEvent cb',data);
})

setTimeout(()=>{
    liveEvent.dispatch('delayedEvent',{data:'data from delayedEvent',index:1});
    liveEvent.dispatch('delayedEvent',{data:'data from delayedEvent',index:5});
},5555)



