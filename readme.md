#### - [ Developed by Eaglex ](http://eaglex.net)
##### - Name: Live Event

#### - Description
This neat script has been developed to help with inclosures and callbacks, to make it more neater in your code, easy to understand. The functionality is well you can digin to the code to workout what it does, simply said, it uses class instance for every watch/dispatch.

###### - More Technical Description:
Calling the script is easy and no matter if you call `watch` or `dispatch` first, the order does not matter, there is a QUE functionality which detects when the pairs are matched. You call each pair with its unique 'eventName' of type string, you may also use multiple events seperated by commas on your `liveEvent.dispatch('eventMagic,moreMagic'`..., you cannot use it on that watch, because it is designed to handle each event respons seperatly. Every event data is recycled/ after it has been called, so no worry with memory leaks.


###### - usage:
```
#!python

var LiveEvent  = require('./live.event');

var opts = {debug:true}; /// if you want to see console output of events dispatched in action;
const liveEvnt = new LiveEvent(opts);

liveEvnt.dispatch('eventMagic',{data:'some string value',index:0});     
liveEvnt.watch('eventMagic,(d)=>{
        const data = d.resp;
        console.log('eventMagic cb', data);
})


liveEvnt.dispatch('anotherEvent,andOneMore',{data:'some string value',index:0});  

liveEvnt.watch('anotherEvent,(d)=>{
        const data = d.resp;
        console.log('eventMagic cb', data);
})

liveEvnt.watch('andOneMore,(d)=>{
        const data = d.resp;
        console.log('eventMagic cb', data);
})


setTimeout(()=>{
    liveEvnt.dispatch('delayedEvent',{data:'some string value',index:0});    
},5555)

liveEvnt.watch('delayedEvent,(d)=>{
        const data = d.resp;
        console.log('eventMagic cb', data);
})

//// you can also delete the event with
liveEvnt.delete('eventMagic'); /// or 'eventMagic,moreMagic'



```
## 

###### - Usage and Support
* Current version is only available on node.js, not been tasted on browser client, its build on ES5
* More examples provided in the index.js file


#### - log
* 26/08/2018 > Live Event 1.0.0, First version launched.