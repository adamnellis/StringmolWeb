
// global variables
/*var chart;              // The graph object
var timer;              // Timer object for making ajax calls after a delay
var timerDelay = 1000;  // How long to wait between graph updated and next ajax call
var graphData = [];     // The points on display right now
var prevGraphData = []; // Points from before the sliding window
var slidingWindowWidth = 100000;*/
		      
function makeGraph(runNumber)
/* Resets the graph and starts the drawing loop */
{
    clearTimeout(timer);

    chart = new Highcharts.Chart({
         chart: {
            renderTo: 'chart-container-1',
            defaultSeriesType: 'line',
            zoomType: 'x',
            events: {
                load: function() { startGraph(runNumber); }
            }
         },
         credits: {
            enabled: false
         },
         title: {
            text: ''
         },
         xAxis: {
            title: {
                text: 'time'
            }
         },
         yAxis: {
            title: {
               text: 'number of molecules'
            }
         },
         plotOptions: {
             series: {
                 marker: {
                     enabled: false
                  }
             }
         },
      });
}

function makeInt(i)
{
    var i1 = parseInt(i, 10);
    if(i1 >= 1)
    {
        return ''+i1;
    }
    else
    {
        return '1';
    }
}
function makeFloat(f)
{
    var f1 = parseFloat(f);
    if(f1 >= 0.0)
    {
        return ''+f1;
    }
    else
    {
        return '0.0';
    }
}


function startGraph(runNumber)
/* Starts a new PHP session, then starts the graph drawing */
{
    $.ajax({
        url: 'new-session.php',
        success: function(response)
        {
            requestData(runNumber);
        },
        cache: false,
    })
}

function requestData(runNumber)
/* Runs the graph-drawing loop
 * Assumes: it has sole access to the "timer" global variable (clear "timer" before calling this function)
 */
{
    var queryString = 'runNumber='+runNumber+'&'+
                      'iterationsPerUpdate='+makeInt($('#iterationsPerUpdate').val())+'&'+
                      'ignoreThreshold='+makeInt($('#ignoreThreshold').val());
    $.ajax({
        url: 'get-data.php?'+queryString,
        success: function(response) {
            var popData = response['data'],
                speciesNumbers = response['speciesNumbers'];

            // plot each species
            for(var speciesNo in popData)
            {
                var speciesData = popData[speciesNo];

                // Check if species line exists
                speciesSeries = chart.get('Species '+speciesNo);

                if(null == speciesSeries) // Line doesn't exist, so create it
                {
                    // Get the string that corresponds to this species
                    var queryString = 'runNumber='+runNumber+'&'+'speciesNumber='+speciesNo;
                    $.ajax({
                        url: 'get-species-string.php?'+queryString,
                        success: function(response) {
                          var speciesString = response['speciesString'];
                        
                          chart.addSeries({
                              name: 'Species '+speciesNo+': '+speciesString,
                              id: 'Species '+speciesNo,
                              data: speciesData,
                          },
                          false);
                          
                        },
                        async: false,
                        cache: false,
                    });
                }
                else // Line exists, so add points to it
                {
                    var i;
                    for(i=0; i<speciesData.length; i++)
                    {
                        speciesSeries.addPoint(speciesData[i], false, false);
                    }
                }
            }
            chart.redraw()

            // update graph again after a delay, if we have not finished getting data
            //   delay is to not kill people's processors
            //   when the get-data.php script takes longer to run (actually running Stringmol), this delay can be negligible
            if(!response['finished']) {
              timer = setTimeout(function(){ requestData(runNumber); }, timerDelay);
            }
            else {
              clearTimeout(timer);
            }
        },
        cache: false,
    });
}
