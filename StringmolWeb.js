
(function($){
 $.fn.setupChemicals = function() {

    this
    .draggable({
      start: function(event, ui) {
        $(this).css({'z-index': 25});
        $(this).parent().css({'z-index': 20});  // NB: need to raise parent's z-index as well (parent is a chemBag)
        
        $(this).addClass('noclick'); // prevent click event firing on drag+drop
      },
      stop: function(event, ui) {
        $(this).css({'z-index': 15});
        $(this).parent().css({'z-index': 10});
        $(this).css({"top": 0, "left": 0}); // spring back to where we started from
      },
    });
    this.each(function(){
      $(".header", this).addClass("ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-top");
      $("span.col", this).css("float", "right");
      $("span.howMany", this)
        .addClass("ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-all");
        //.css("float", "right");
      $("span.delete", this)
        //.addClass("ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-all")
        .button()
        .click(function() {
          // Find the chem-bag we are in, and remember it (before removing 'self' from the DOM)
          var chemBag = $(this).parents().filter(".chem-bag")
          // Remove this chemical from its bag
          $(this).parents().filter(".chemical").remove();
          if((0 == $(".chemical", chemBag).size()) &&  // If the bag is empty then remove the bag as well
             (!chemBag.hasClass("persistent"))) {  // Don't remove presistent containers (e.g. 'initial chemicals for bucket' container)
            chemBag.remove();
            
            saveFavChemsCookie(); // Sometimes, this isn't in the fav-chems section, but oh well!
          }
        })
        //.css("float", "right");
      $("span.chemString", this)
        .addClass("ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-bottom")
        .each(function(){
          $(this).css("marginRight", $(this).prev().outerWidth(true)+"px");
        });
      // Click to change chemical and howMany
      $("span.howMany, span.chemString", this)
        .click(function(){
          // prevent click event firing on drag+drop
          var myChemical = $(this).parents().filter(".chemical");
          if(myChemical.hasClass('noclick')) {
            myChemical.removeClass('noclick');
          }
          else {

            // Turn this into an input box, if it's not already
            //if(0 == $("input", this).size()) {
            if(0 == $("textarea", this).size()) {
              var string = $(this).html();
              //var size = ''
              var rowCols = 'rows="3" cols="17"';
              if($(this).hasClass("howMany")) {
                //size = 'size="1"';
                rowCols = 'rows="1", cols="1"'
              }
              //var input = $("<input type='text' value='"+string+"' "+size+"></input>");
              var input = $('<textarea '+rowCols+'>'+string+"</textarea>");
              $(this).html(input);
              input.focus();

              // Resize the chemical box
              var chemicalBox = $("span.chemString", $(this).parent().parent());
              chemicalBox.css("marginRight", chemicalBox.prev().outerWidth(true)+"px");
            }
          
          }
        })
        .focusout(function(){
          // Remove the input box, if it exists
          if(1 == $("textarea", this).size()) {
            var string = $("textarea", this).val();
            // Validate string, if we're the chemical box
            if($(this).hasClass("chemString")) {
              string = validateStringmolString(string);
            }
            $(this).html(string)
            
            saveFavChemsCookie(); // Sometimes, this isn't in the fav-chems section, but oh well!
          }
          // Resize the chemical box
          var chemicalBox = $("span.chemString", $(this).parent().parent());
          chemicalBox.css("marginRight", chemicalBox.prev().outerWidth(true)+"px");
        });
      // Click to change chemical name
      $("span.name", this)
        .click(function(){
          // prevent click event firing on drag+drop
          var myChemical = $(this).parents().filter(".chemical");
          if(myChemical.hasClass('noclick')) {
            myChemical.removeClass('noclick');
          }
          else {
            // Turn this into an input box, if it's not already
            if(0 == $("textarea", this).size()) {
              var string = $(this).html();
              var input = $('<textarea rows="1" cols="19">'+string+"</textarea>");
              $(this).html(input);
              input.focus();
            }
          }
        })
        .focusout(function(){
          // Remove the input box, if it exists
          if(1 == $("textarea", this).size()) {
            var string = $("textarea", this).val();
            $(this).html(string)
            
            saveFavChemsCookie(); // Sometimes, this isn't in the fav-chems section, but oh well!
          }
        });
    });
    return this;
 };
 
 $.fn.setupChemBags = function() {

    return this
    .addClass("ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-all")
    .draggable({
      start: function(event, ui) {
        $(this).css({'z-index': 20});
      },
      stop: function(event, ui) {
        $(this).css({'z-index': 10});
        $(this).css({"top": 0, "left": 0}); // spring back to where we started from
      },
    });
 };
 
 $.fn.setupDroppableChemBags = function() {

    return this
    .setupChemBags()
    .droppable({
      accept: '.chemical',
      greedy: true,
      tolerance: 'pointer',
      activeClass: 'chem-drop-active',
      hoverClass: 'chem-drop-hover',
      drop: function(event, ui) {
        $(".dummy", this).remove(); // remove any "dummy" messages from the ChemBag
        
        // Don't drop in if chemical already exists in this chembag (need to search to check this!)
        // NOT DOING THIS ANY MORE!
        /*var chemicalString = $("span.chemString", ui.draggable).html();
        var inChemBag = false;
        $("li", this).each(function(){
          if(chemicalString == $("span.chemString", this).html()) {
            inChemBag = true;
          }
        });
        if(!inChemBag) {*/
        
          // If chembag is a single chemical bag, then replace rather than appending
          if($(this).hasClass("single")) {
            // single chem-bag (only one chemical allowed)
            var newChemical = $("<li class='chemical'>"+ui.draggable.html()+"</li>");
            $(".howMany", newChemical).html("1");
            $(this).html(newChemical);
          }
          else {
            // normal chem-bag (multiple chemicals allowed)
            $(this).append("<li class='chemical'>"+ui.draggable.html()+"</li>");
          }
          $(".chemical", this).setupChemicals();
          
        //}
        
        saveFavChemsCookie(); // Sometimes, this isn't in the fav-chems section, but oh well!
      },
    });
 };
 
 $.fn.makeChemical = function() {
   /*
    * Make <chemical> tags into the correct HTML for a chemical
    */
    return this.each(function(){
    
      var name = $(this).attr("name");
      if("" == name) { name = "chemical"; }
      
      $(this)
        .after('<li class="chemical">'+
                 '<div class="header">'+
                   '<span class="delete">x</span>'+
                   '<span class="name">'+name+'</span>'+
                 '</div>'+
                 '<div class="content">'+
                   '<span class="col">'+
                     '<span class="howMany">'+$(this).attr("number")+'</span>'+
                   '</span>'+
                   '<span class="chemString">'+$(this).attr("string")+'</span>'+
                 '</div>'+
               '</li>')
        .remove();
    });
 };
 
})(jQuery);

/*
makeChemicalHTML = function(howMany, chemString) {
  return '<li class="chemical"><span class="howMany">'+howMany+'</span><span class="chemString">'+chemString+'</span></li>';
} */

$(document).ready(function() {

  // Set up tabs
  $("#tabs").tabs({
    //show: fixIframeWidths
  });
  
  // Make the columns, now and every time the window resizes
  makeColumns(); // for some reason, need to call this twice...
  makeColumns();
  $(window).resize(resizeColumns);
  
  // Make the favourite chemicals section resizable
  $("#fav-chems").resizable({
    handles: 'w',
    resize: function(event, ui) { resizeColumns(); }
  });
  

  // Populate favourite chemicals section with value of cookie (if cookie exists)
  var savedFavChems = $.cookie('fav_chems');
  //console.log(savedFavChems);
  if(null != savedFavChems) {
    $("#fav-chems .chem-bag").remove();
    
    savedFavChems = eval(savedFavChems); //TODO: WARNING! DANGER! eval() !!!
    s = '';
    var i;
    for(i=0; i<savedFavChems.length; i++) {
      var chemBag = savedFavChems[i];

      s += '<ul class="chem-bag">';
      var j;
      for(j=0; j<chemBag.length; j++) {
        var chemical = chemBag[j];
        s += '<chemical name="'+chemical[0]+'" number="'+chemical[2]+'" string="'+chemical[1]+'"></chemical>';
      }
      s += '</ul>';
    }
    $("#fav-chems ul").append(s);
  }

  
  // Make <chemical> tags into proper HTML
  $("chemical").makeChemical();
  
  // Useful chemicals section
  $("#info-tab .chem-bag").setupChemBags();
  $("#info-tab .chemical").setupChemicals();
  
  // Set up drag+drop
  $("#fav-chems .chem-bag").setupDroppableChemBags();
  $("#fav-chems .chemical").setupChemicals();

  
  $("#click-drag-tab .chem-bag").addClass("ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-all")
  $(".chemical-receiver").addClass("ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-all")
  $(".chemical-receiver").droppable({
    accept: '.chemical',
    tolerance: 'pointer',
    activeClass: 'chem-drop-active',
    hoverClass: 'chem-drop-hover',
    drop: function(event, ui) {
      $(this).html(ui.draggable.html());  // Add the dropped chemical to this chemical bag
      $("#mutate-button").button("enable"); // Turn on the mutate button
      //$(this).removeClass("chem-highlight");
      //ui.draggable.removeClass("chem-highlight");
    },
    /*over: function(event, ui) {
      $(this).addClass("chem-highlight");
      ui.draggable.addClass("chem-highlight");
    },
    out:  function(event, ui) {
      $(this).removeClass("chem-highlight");
      ui.draggable.removeClass("chem-highlight");
    },*/
  });
  
  // Make dropping chemicals into favourite chemicals section
  $("#fav-chems > ul").droppable({
    accept: '.chemical',
    tolerance: 'pointer',
    activeClass: 'chem-drop-active',
    hoverClass: 'chem-drop-hover',
    drop: function(event, ui) {
      $(this).prepend("<ul class='chem-bag'><li class='chemical'>"+ui.draggable.html()+"</li></ul>");
      $(".chem-bag", this).setupDroppableChemBags();
      $(".chemical", this).setupChemicals();
      
      saveFavChemsCookie(); // Sometimes, this isn't in the fav-chems section, but oh well!
    },
  });
  
  // Make the mutate chemical button
  $("#mutate-button")
    .button({ disabled: true })
    .click(function() {
      var alphabet = "$>^?=%}ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          original_chemical = $("#mutate-input").html().replace(/&gt;/g, ">"),
          num_output_chemicals = 4,
          mutation_rate = 0.1;
      // Remove previous output chemicals from the HTML
      $("#mutate-output").children().remove();
      // For each output chemical
      for(var outputNo=0; outputNo<num_output_chemicals; outputNo++) {
        var output_chemical = original_chemical;
        // For each character in the input chemical
        for(var i=0; i<original_chemical.length; i++) {
          // Randomise the character, with a set probability
          if(Math.random() < mutation_rate) {
            output_chemical = output_chemical.slice(0, i)+alphabet[randInt(0, alphabet.length-1)]+output_chemical.slice(i+1, output_chemical.length);
          }
        }
        // Add output chemical to the HTML
        $("#mutate-output").append("<ul class='chem-bag' style='width: 15em;'><li class='chemical'>"+output_chemical.replace(/</g, "&gt;")+"</li></ul>");
      }
      // Make the added chemicals proper
      $("#mutate-output .chem-bag").setupChemBags();
      $("#mutate-output .chemical").setupChemicals();
    });
    

    /*
     * TWO MOLECULE SIMULATOR
     */

    // Set up two-mol inputs
    $("#start-two-mol .chem-bag").setupDroppableChemBags();
    $("#start-two-mol .chemical").setupChemicals();
    
    // Make the start button
    $("#start-two-mol #startTwoMolButton")
      .button({ disabled : false })
      /*.width("8em")*/.height("5em")
      .click(function (){
        //$(this).button({ disabled : true });
        // If there's an existing reaction, then remove it
        var reaction = $("#two-mol-reactions .two-mol-reaction");
        if(reaction.length > 0) {
          $(".close", reaction).click();
        }
        // Make a new reaction
        var reaction = makeTwoMolReaction($("#chem1 .chemString").html(), $("#chem2 .chemString").html());
        $("#two-mol-reactions").prepend(reaction);
      });
    
    
    /*
     * BUCKET SIMULATOR
     */
    
    // Set up the "new bucket simulation" section
    //$("#bucket-tab h1").addClass("ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-top");
    //$("#start-bucket").addClass("ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-bottom");
    $("#start-bucket, #watch-bucket").addClass("ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-all");
    $("#watch-bucket").hide();
    
    // Make the start button
    $("#start-bucket #startButton")
      .button({ disabled: false })
      .width("8em").height("5em")
      .click(function (){
        // Remove old graph, if there is one
        $("#newBucketButton").click();
        
        // don't disable
        // Disable the "start" section
        //$(this).button({ disabled: true });
        //$("#cellRadius, #agentRadius, #initialEnergy, #mutation").attr('disabled', true);
        //$("#newBucketButton").button({ disabled: false }).show();
        $("#newBucketButton").button({ disabled: false });
      
        // Show the graph area and start the graph drawing
        $("#watch-bucket").show("slow", function(){
          // Get run number
          $.ajax({
            url: 'get-new-run-number.php',
            success: function(response) {
              var runNumber = response['runNumber'];
              // Start Stringmol running with this run number
              var queryString = 'run='+runNumber+'&'+
                                'agents='+parseChemicalsForCGI($('#initialChemicals'))+'&'+
                                'cellrad='+makeFloat($('#cellRadius').val())+'&'+
                                'agrad='+makeFloat($('#agentRadius').val())+'&'+
                                'initialEnergy='+makeInt($('#initialEnergy').val())+'&'+
                                'energyFlux='+makeInt($('#energyFlux').val())+'&'+
                                'domut='+$("input[@name='mutation']:checked").length;
              //alert(queryString);
              $.ajax({
                url: 'http://www.cs.york.ac.uk/nature/plazzmid/external/RUTSAC11/StringmolWeb/cgi-bin/StringmolWeb_C_Bucket_Linux.cgi?'+queryString,
                cache: false,
              });
              // Start graphing the results for this run number
              $("#runNumber").html(runNumber);
              makeGraph(runNumber);
            },
            cache: false,
          });
        });
      });
    
    // Make the initial chemical section for the bucket graph work
    //$('#bucket-tab').bind('tabsshow', function(event, ui) {
    //  alert("hi");
      $("#start-bucket #initialChemicals").setupDroppableChemBags();
      $("#start-bucket #initialChemicals .chemical").setupChemicals();
    //});
    
    // Make the "stop this bucket" button work
    $("#newBucketButton")
      .button({ disabled: true })
      /*.width("10em")*/.height("5em")
      //.hide()
      .click(function (){
        // Send "stop" signal to the Stringmol run
        $.ajax({
          url: 'stop-run.php?runNumber='+$("#runNumber").html(),
          cache: false,
        });
        // Stop drawing the graph
        clearTimeout(timer);
        // Hide the graph area
        //$("#watch-bucket").hide("slow");
        // Enable the "start" section
        //$("#startButton").button({ disabled: false });
        //$("#cellRadius, #agentRadius, #initialEnergy, #mutation").attr('disabled', false);
        //$(this).button({ disabled: true }).hide();
        $(this).button({ disabled: true });
      });
      
  
  
  // Make the bucket graph work
  // Make the button work
  $("#redrawButton").click(function(){
    clearTimeout(timer);
    makeGraph(makeInt($("#runNumber").html()));
  });

  // Validate input boxes
  $('#ignoreThreshold, #iterationsPerUpdate').change(function() {
    $(this).val(makeInt($(this).val()));
  });

  // Update timer frequency whenever text box value changes
  $('#timerDelay').change(function() {
    $(this).val(makeInt($(this).val()));
    timerDelay = $(this).val();
  });
  
  // Make the bucket graph resizable
  $("#watch-bucket").resizable({
    handles: 's',
    resize: function(event, ui) {
      //var height = $("#watch-bucket").height()-parseInt($(2.0).toPx());
      var height = $("#watch-bucket").height()-$("#graph-extras").height()-parseInt($(1.0).toPx());
      $("#chart-container-1").css("height", height+"px");
      chart.setSize($("#chart-container-1").width(), height);
    }
  });
  
});

function parseChemicalsForCGI(chemBag) {
  var chemicalString = "";
  $(".chemical", chemBag).each(function(){
    var howMany = $('span.howMany', this).html(),
        chemString = $('span.chemString', this).html();
    chemString = chemString.replace(/&gt;/g, "1"); // Replace all '>' in the chemical with '1', for transport in the query string
    chemicalString += '('+howMany+','+chemString+')';
  });
  return chemicalString;
}

function validateStringmolString(stringIn) {
  /**
   *  Returns: a copy of stringIn, with all non-Stringmol characters removed
   *  Assumes: '>' characters, rather than '&gt;'
   */
  stringOut = stringIn;
  stringOut = stringOut.toUpperCase();
  stringOut = stringOut.replace(/[^ABCDEFGHIJKLMNOPQRSTUVWXYZ^>?$%=}]/g, "");
  return stringOut
}

function makeColumns() {
  // Make menu and favourite chemicals into two columns
  var favChemsDefaultWidth = "20em",
      columnGap = parseInt($(1.0).toPx()); // Gap defined in em (need to define in the function to get the local "em" unit)

  $("#fav-chems")
    .width(favChemsDefaultWidth)
    .css({"position": "absolute",
          "left": $("#StringmolWeb").width()-$("#fav-chems").width()+"px",
          "top": "0px"});
  $("#tabs")
    .width($("#StringmolWeb").width()-$("#fav-chems").width()-columnGap+"px")
    .css({"position": "absolute",
          "left": 0+"px",
          "top": "0px"});
}

function resizeColumns() {
  var columnGap = parseInt($(1.0).toPx()); // Gap defined in em (need to define in the function to get the local "em" unit)
  
  $("#fav-chems")
    .css({"left": $("#StringmolWeb").width()-$("#fav-chems").width()+"px"});
  $("#tabs")
    .width($("#StringmolWeb").width()-$("#fav-chems").width()-columnGap+"px");
    
  // If there's a bucket graph, then resize that
  if(undefined != chart) {
    var chartContainer = $("#chart-container-1");
    chart.setSize(chartContainer.width(), chartContainer.height());
  }
}

function favChemsToString() {
  var s = '[';
  $("#fav-chems .chem-bag").each(function(){
    s = s + '[';
    $(".chemical", this).each(function(){
      s = s + "['" +
                $(".name", this).html() + "', '" +
                $(".chemString", this).html() + "', " +
                $(".howMany", this).html() +
              "], ";
    });
    s = s + "],"
  });
  s = s + ']';
  return s;
}
function saveFavChemsCookie() {
  $.cookie('fav_chems', favChemsToString(), { expires: 7 });
}

/**
 * From: http://stackoverflow.com/questions/985272/jquery-selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
 * User: @Tim Down
 */
function selectElementText(el, win) {
    win = win || window;
    var doc = win.document, sel, range;
    if (win.getSelection && doc.createRange) {
        sel = win.getSelection();
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}


function randInt(a, b) {
  return Math.floor(Math.random() * (1 + b - a)) + a
}
