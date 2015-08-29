// window.onload = function () {

//     var dps = []; // dataPoints

//     var chart = new CanvasJS.Chart("chart",{
//         title :{
//             text: "Live Random Data"
//         },
//         data: [{
//             type: "line",
//             dataPoints: dps 
//         }]
//     });

//     var xVal = 0;
//     var yVal = 100;
//     var updateInterval = 20;
//     var dataLength = 500; // number of dataPoints visible at any point

//     var updateChart = function (count) {
//         count = count || 1;
//         // count is number of times loop runs to generate random dataPoints.

//         for (var j = 0; j < count; j++) {
//             yVal = yVal +  Math.round(5 + Math.random() *(-5-5));
//             dps.push({
//                 x: xVal,
//                 y: yVal
//             });
//             xVal++;
//         };
//         if (dps.length > dataLength)
//         {
//             dps.shift();
//         }

//         chart.render();

//     };

//     // generates first set of dataPoints
//     updateChart(dataLength); 

//     // update chart after specified time. 
//     setInterval(function(){updateChart()}, updateInterval); 

// }


$(function(){
    var socketio = window.socketio = io()

    ////////////////////////////////////////////////////////////////
    //Control Panel
    var PanelData = Backbone.Model.extend({
        defaults: {
            chartWidth: 300
            , defaultChartWidth: 300

            , updateInterval: 200
        }
    })
    var Panel = Backbone.View.extend({
        el: $('#toppanel')
        ,$panel: $('#toppanel > .panel')
        ,$menubar: $('#topmenubar > .menubar')
        ,$openClose: $("#toppanel   .menubar   .tab   .toggle   span")
        ,initialize: function(){
            this.model = new PanelData
            this.open_panel()
        }
        ,events: {
            'click .tab .open': 'expand'
            ,'click .tab .close': 'collapse'
            ,'click .tab .toggle span': 'toggle_tab'
        }
        ,render: function(){
            
        }
        ,toggle_tab: function(){
            this.$openClose.toggle()
        }
        ,collapse: function(){
            this.$panel.slideUp("slow")
        }
        ,expand: function(){
            this.$panel.slideDown("slow")
        }
        ,open_panel: function open_panel(){
            this.$panel.show();
            this.toggle_tab();
        }
    })
    var panel = new Panel


    ////////////////////////////////////////////////////////////////
    //Graph
    var PlotData = Backbone.Model.extend({
        defaults: function(){
            var data = []
            , defaultWidth = panel.model.attributes.defaultChartWidth
            return {
                data: data
                ,chartWidth: defaultWidth
                ,min: 0
                ,max: 0
            }
        }
        , initialize: function(){

        }
        , addData: function addData (id, time, reading){
            var split = reading.split('|')
            , gyro = split[0].split(' ')  .map(function(i){return parseInt(i)})
            , mag = split[1].split(' ')  .map(function(i){return parseInt(i)})
            , acc = split[2].split(' ')  .map(function(i){return parseInt(i)})
            , angle = split[3].slice(0,-1).split(' ') .map(function(i){return parseInt(i)})

            , thisone = {
                time: time
                ,gyro: gyro
                ,mag: mag
                ,acc: acc
                ,pitch: angle[0]
                ,roll: angle[1]
                ,yaw: angle[2]
            }

            this.attributes.data[id] = thisone
            
        }
    })

    var PlotView = Backbone.View.extend({
        initialize: function(){
            this.resetChart()
            
        }
        ,resetChart: function resetChart(){
            this.dps = []
            var d = Date.now()

            for (var x=0; x < this.model.attributes.chartWidth; x++)
                this.dps[x] = {x: d, y: 0}

            this.dps2 = []
            var d = Date.now()

            for (var x=0; x < this.model.attributes.chartWidth; x++)
                this.dps2[x] = {x: d, y: 0}

            this.dps3 = []
            var d = Date.now()

            for (var x=0; x < this.model.attributes.chartWidth; x++)
                this.dps3[x] = {x: d, y: 0}

            this.chart = new CanvasJS.Chart("chart",{
                title: {
                    text: "Team Impact"
                }
                ,creditText: ''
                ,data: [
                    {
                        type: "line"
                        ,dataPoints: this.dps
                    }
                    ,{
                        type: "line"
                        ,dataPoints: this.dps2
                    }
                    ,{
                        type: "line"
                        ,dataPoints: this.dps3
                    }
                ]
            })
        }
        ,update: function update() {
            var data = this.model.attributes.data
            ,width = this.model.attributes.chartWidth
            ,start = data.length - width
            
            for(var x=0; x < width; x++){
                var y = data[start+x]
                if(y == void 0) continue
                else y = y.acc[0]

                var y2 = data[start+x]
                if(y2 == void 0) continue
                else y2 = y2.acc[1]

                var y3 = data[start+x]
                if(y3 == void 0) continue
                else y3 = y3.acc[2]

                var t = data[start+x]
                if(t == void 0) continue
                else t = t.time

                this.dps[x] = {
                    x: t //start+x
                    , y: y
                }
                this.dps2[x] = {
                    x: t //start+x
                    , y: y2
                }
                this.dps3[x] = {
                    x: t //start+x
                    , y: y3
                }
            }
            
            this.chart.render()
        }
    })

    var MainView = Backbone.View.extend({
        el: $('body > main')
        ,initialize: function(){
            this.plotData = new PlotData
            this.plotView = new PlotView({
                model: this.plotData
            })
        }
    })

    var mainView = new MainView

    ////////////////////////////////////////////////////////////////
    //Main App

    var MainApp = Backbone.View.extend({
        el: $('body')
        ,$head: $('#data')
        ,data: {}
        ,initialize: function(){
            this.counter = 0

            this.panel = panel
            this.conf = panel.model.attributes
            this.mainView = mainView

            this.initialize_socket()
        }
        ,events: {

        }
        ,socket_events: {
            'connected': 'onConnected'
            ,'message': 'onMessage'
        }
        ,onMessage: function(id, time, reading){
            this.mainView.plotData.addData(id, time, reading)

            // var index = parseInt(time/ this.conf.updateInterval) % this.conf.chartWidth

            // callbacks.forEach(function(callback,i){
            //     callback( i, index, thisone)
            // })

            if( !(this.counter++ % 9) ) 
                this.$head.html(id +': '+ reading)
            //            if( !(this.counter % 9) ) 
            this.mainView.plotView.update()
        }
        ,onConnected: function(){
            ([]).concat(arguments).forEach(function(v,i){
                console.log(i+':',v)
            })
        }
    })

    var mainApp = window.mainApp = new MainApp

})


// for( var y = 0, l = callbacks.length; y<l; y++){
//     data4chart[y] = []
//     for( var x = 0; x<chartWidth; x++) data4chart[y][x]=[x,0]
// }


// , callbacks = [
//     function(me,index,thisone){data4chart[me][index] = [ index, thisone.pitch ] }
//     ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.roll ] }
//     // ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.yaw ] }
//     // ,
//     // function(me,index,thisone){data4chart[me][index] = [ index, thisone.gyro[0] ] }
//     // ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.gyro[1] ] }
//     // ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.gyro[2] ] }
//     // ,
//     // function(me,index,thisone){data4chart[me][index] = [ index, thisone.acc[0]/2 ] }
//     // ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.acc[1]/2 ] }
//     // ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.acc[2]/2 ] }
//     // ,
//     // function(me,index,thisone){data4chart[me][index] = [ index, thisone.acc[0] ] }
//     // ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.acc[1] ] }
//     // ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.acc[2] ] }
//     // ,
//     // function(me,index,thisone){data4chart[me][index] = [ index, thisone.mag[0] ] }
//     // ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.mag[1] ] }
//     // ,function(me,index,thisone){data4chart[me][index] = [ index, thisone.mag[2] ] }
// ]


// function getMinAndMax (){
//     var newmin = null
//     , newmax

//     for(var x = 0, l = data4chart.length; x<l; x++){
//         for(var y = 0; y<chartWidth; y++){
//             var thispoint = data4chart[x][y][1]
//             if( newmin === void 0 ){
//                 newmin = newmax = thispoint
//             } else {
//                 if(thispoint < newmin) newmin = parseInt(thispoint)
//                 if(thispoint > newmax) newmax = parseInt(thispoint)
//             }
//         }
//     }

//     return [newmin, newmax]
// }

// function update() {

//     plot.setData(data4chart)

//     if(0){ //only increase y axes
//         var newminmax = getMinAndMax()

//         if(minmax[0] > newminmax[0] || minmax[1] < newminmax[1]) {
//             minmax = newminmax
//             resetAxes()
//         }
//     } else { // increase and decrease y axes
//         var newminmax = getMinAndMax()
//         , o = plot.getOptions().yaxes[0]
//         if( o.min != newminmax[0] || o.max != newminmax[1]) {
//             minmax = newminmax
//             resetAxes()
//         }
//     }

//     plot.draw()

// }

// function resetAxes (){
//     var o = plot.getOptions().yaxes[0]
//     o.min = minmax[0]
//     o.max = minmax[1]
//     plot.setupGrid()
// }
