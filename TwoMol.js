
(function($){
  $.fn.setupTwoMolReaction = function() {
    /**
     * Assumes: It's being called on a single element, that is a reaction
     */
     
    var reaction = $(this);

    // Header
    $(".heading", this)
      .addClass("ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-top");
    // Close button
    $(".close", this)
      .button()
      .click(function(){
        // Stop the timer that's iterating the reaction
        if(twoMolIterating) {
          stopTwoMol = true;
        }
        // Remove the reaction from the page
        $(this).parents().filter(".two-mol-reaction").remove();
        // Enable the "new reaction" button
        //$("#start-two-mol #startTwoMolButton").button({ disabled : false });
      });
    // Content of the reaction
    $(".reaction-content", this)
      .addClass("ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-bottom");
    // All control buttons
    $(".button", this)
      .button({ disabled : true });
    // Start button
    $(".start", this)
      .click(function(){
        // Zero the displayed reaction number
        $(".displayedIteration", reaction).html('0');
        // Re-draw the reaction
        reaction.renderReaction();
      });
    // Back button
    $(".back", this)
      .click(function(){
        // Decrement the displayed iteration number
        $(".displayedIteration", reaction).html(parseInt($(".displayedIteration", reaction).html())-1);
        // Re-draw the reaction
        reaction.renderReaction();
      });
    // Play button
    $(".play", this)
      .click(function(){
        // If we're the play button, then play
        if("Play" == $(".ui-button-text", this).html()) {
          //console.log("play");
          playing = true;
          reaction.advanceReaction();
          $(".ui-button-text", this).html("Pause");
          reaction.enableButtons();
        }
        // If we're the pause button, then pause
        else {
          //console.log("pause");
          clearTimeout(playingTimer);
          playing = false;
          $(".ui-button-text", this).html("Play");
          reaction.enableButtons();
        }
      });
    // Next button
    $(".next", this)
      .click(function(){
        reaction.advanceReaction();
      });
    // End button
    $(".end", this)
      .click(function(){
        // Set the displayed iteration number to the last state we have data for
        $(".displayedIteration", reaction).html($(".currentIteration", $(".state-info", reaction).last()).html());
        // Re-draw the reaction
        reaction.renderReaction();
      });
      
    // Loading message
    $(".loading", this).html('<img src="ajax-loader.gif"></img>processing reaction...');
     
    // Test if these chemicals bind or not
    var state = $(".state-info", reaction).last(); // this will be state number -1, if this function is called at the correct time
    $.ajax({
      url: 'http://www.cs.york.ac.uk/nature/plazzmid/external/RUTSAC11/StringmolWeb/cgi-bin/StringmolWeb_C_Binding_Linux.cgi?'+
           'string1=('+$(".string1", state).html().replace(/&gt;/g, "1")+')&'+
           'string2=('+$(".string2", state).html().replace(/&gt;/g, "1")+')',

      success: function(response) {
        // Parse out the state of the bind
        var regex = /bindImpossible=([0-9]+)&bindLength=([0-9]+)&bindProb=([0-9]*[.][0-9]+)&start1=([0-9]+)&end1=([0-9]+)&start2=([0-9]+)&end2=([0-9]+)&string1=(.*?)&string2=(.*?)&instr1=([0-9]+)&instr2=([0-9]+)&flow1=([0-9]+)&flow2=([0-9]+)&read1=([0-9]+)&read2=([0-9]+)&write1=([0-9]+)&write2=([0-9]+)&instrToggle=([0-9]+)&flowToggle=([0-9]+)&readToggle=([0-9]+)&writeToggle=([0-9]+)/;
        var match = regex.exec(response);
        // "1" means "active", "2" means "passive", for everything here
        var bindImpossible = match[1],
            bindLength = match[2],
            bindProb = match[3],
            start1 = match[4],
            end1 = match[5],
            start2 = match[6],
            end2= match[7],
            string1 = match[8],
            string2 = match[9],
            instr1 = match[10],
            instr2 = match[11],
            flow1 = match[12],
            flow2 = match[13],
            read1 = match[14],
            read2 = match[15],
            write1 = match[16],
            write2 = match[17],
            instrToggle = match[18],
            flowToggle = match[19],
            readToggle = match[20],
            writeToggle = match[21];

        /*
        console.log('bind impossible: '+bindImpossible);
        console.log('bind length: '+bindLength);
        console.log('bind prob: '+bindProb);
        console.log('bind position on string 1: '+start1+' - '+end1);
        console.log('bind position on string 2: '+start2+' - '+end2);
        */
        
        // Write the bind information  // NB: If they don't bind, then <div class="reactionEnded"> in newStateInfo will be "1".
        state.before(
          '<div class="bind-prob">'  +bindProb+'</div>'+
          '<div class="bind-start1">'+start1+'</div>'+
          '<div class="bind-end1">'  +end1+  '</div>'+
          '<div class="bind-start2">'+start2+'</div>'+
          '<div class="bind-end2">'  +end2+  '</div>'
        );

        // Make the new reaction state
        var newStateInfo = $('<div class="state-info">'+
            '<div class="currentIteration">0</div>'+
            '<div class="stringActive">'+string1+'</div>'+
            '<div class="stringPassive">'+string2+'</div>'+
            '<div class="instr1">'+instr1+'</div>'+
            '<div class="instr2">'+instr2+'</div>'+
            '<div class="flow1">'+flow1+'</div>'+
            '<div class="flow2">'+flow2+'</div>'+
            '<div class="read1">'+read1+'</div>'+
            '<div class="read2">'+read2+'</div>'+
            '<div class="write1">'+write1+'</div>'+
            '<div class="write2">'+write2+'</div>'+
            '<div class="instrToggle">'+instrToggle+'</div>'+
            '<div class="flowToggle">'+flowToggle+'</div>'+
            '<div class="readToggle">'+readToggle+'</div>'+
            '<div class="writeToggle">'+writeToggle+'</div>'+
            '<div class="reactionEnded">'+bindImpossible+'</div>'+
            '<div class="newStrings"></div>'+
          '</div><!-- state-info -->')
        // Write this reaction state to the page
        newStateInfo.appendTo(".reaction-states", reaction);
        
        // Display this iteration
        $(".displayedIteration", reaction).html("0");
        reaction.renderReaction();

        // Start the loop to iterate the reaction (if the chemical bound)
        if("0" == bindImpossible) {
          getNextIteration(reaction);
        }
        else {
          // If reaction ended then remove loading message
          $(".loading", reaction).html(" ");
        }
          
      },
      cache: false,
    });
     
    return this;
   };

  $.fn.enableButtons = function() {
    /**
     *  Sets the enabled states of all the buttons to be correct for the currently displayed iteration number
     */
    // If play button is pressed, then this takes precedence
    if(playing) {
      // Disable everything but the "play" button
      $(".button", this).button({ disabled : true });
      $(".play", this).button({ disabled : false });
    }
    // Otherwise, work out which buttons to enable
    else {
      // Get the current iteration number
      var iterationNumber = parseInt($(".displayedIteration", this).html());
      // Get the number of the last iteration that we have data for
      var lastIterationNumber = parseInt($(".currentIteration", $(".state-info", this).last()).html());
      // To start with, disable all the buttons
      $(".button", this).button({ disabled : true });
      // If we're not at the start, then enable the "start" and "back" buttons
      if(iterationNumber > 0) {
        $(".start, .back", this).button({ disabled : false });
      }
      // If we're not at the end, then enable the "play", "next" and "end" buttons
      if(iterationNumber < lastIterationNumber) {
        $(".next, .end, .play", this).button({ disabled : false });
      }
    }
  };
  
  $.fn.advanceReaction = function() {
    // Increment the displayed iteration number
    $(".displayedIteration", reaction).html(parseInt($(".displayedIteration", this).html())+1);

    // If we've reached the end (of the reaction, or the buffer) then stop playing
    // TODO: Check for end of buffer
    var displayedIterationNo = parseInt($(".displayedIteration", reaction).html());
    var displayedState = $(".state-info", reaction).filter(function(){ return(displayedIterationNo == parseInt($(".currentIteration", this).html())); });
    if("1" == $(".reactionEnded", displayedState).html()) {
      playing = false;
      $(".play .ui-button-text", this).html("Play");
    }
    
    // Re-draw the reaction
    this.renderReaction();
    
    // If we are playing, then call self again
    if(playing) {
      var reaction = this;
      playingTimer = setTimeout(function(){ reaction.advanceReaction(); }, 200);
    }
    return this;
  };
 
  $.fn.renderReaction = function() {
  
    // Update the control button states
    reaction.enableButtons();
      
    // Get the data for the iteration we're currently looking at
    var displayedIterationNo = parseInt($(".displayedIteration", reaction).html());
    var displayedState = $(".state-info", reaction).filter(function(){ return(displayedIterationNo == parseInt($(".currentIteration", this).html())); });

    // Render iteration number
    $(".iteration-number", this).html(displayedIterationNo);
    
    // Render the binding information
    if((0 == displayedIterationNo) && ("1" == $(".reactionEnded", displayedState).html())) {
      // The chemicals did not bind
      $(".bindingInfo", this).html("These strings do not bind, so no reaction happens.");
      var ap = $(".active-string, .passive-string")
      ap.addClass("hidden");
      ap.prev().addClass("hidden");
    }
    else {
      // They did bind
      $(".bindingInfo", this).html("These strings bind, with probability "+$(".bind-prob", this).html());
      var ap = $(".active-string, .passive-string")
      ap.removeClass("hidden");
      ap.prev().removeClass("hidden");
    }
    
    // Render cleaved off strings
    var newStrings = $(".newString", displayedState);
    var newStringsChemBag = $(".created-strings", this);
    newStringsChemBag.html("");
    if(newStrings.length > 0) {
      newStrings.each(function() {
        var chemical = $('<chemical name="created chemical" number="1" string="'+$(this).html()+'"></chemical>');
        //chemical.setupChemicals();
        newStringsChemBag.append(chemical);
      });
      $("chemical", newStringsChemBag).makeChemical();
      $(".chemical", newStringsChemBag).setupChemicals();
    }
    
    
    // Render next instruction
    var string1 = $(".stringActive", displayedState).html().replace(/&gt;/g, ">"),
        string2 = $(".stringPassive", displayedState).html().replace(/&gt;/g, ">"),
        instrToggle = parseInt($(".instrToggle", displayedState).html()),
        flowToggle = parseInt($(".flowToggle", displayedState).html()),
        readToggle = parseInt($(".readToggle", displayedState).html()),
        writeToggle = parseInt($(".writeToggle", displayedState).html());
        
    var instr1 = parseInt($(".instr1", displayedState).html()),
        instr2 = parseInt($(".instr2", displayedState).html()),
        flow1 = parseInt($(".flow1", displayedState).html()),
        flow2 = parseInt($(".flow2", displayedState).html()),
        read1 = parseInt($(".read1", displayedState).html()),
        read2 = parseInt($(".read2", displayedState).html()),
        write1 = parseInt($(".write1", displayedState).html()),
        write2 = parseInt($(".write2", displayedState).html());
        
    // Select the active instruction pointer     // TODO: re-write this bit
    var instrPointer;
    var passiveInstrPointer;
    if(0 == instrToggle) { instrPointer = parseInt($(".instr1", displayedState).html());
                           passiveInstrPointer = parseInt($(".instr2", displayedState).html());
                         }
    else                 { instrPointer = parseInt($(".instr2", displayedState).html());
                           passiveInstrPointer = parseInt($(".instr1", displayedState).html());
                         }
    
    // Check for pointing off the end of the string
    var instrPointerString;
    if(0 == instrToggle) { instrPointerString = string1; }
    else                 { instrPointerString = string2; }
    
    var nextInstruction;
    // If the reaction has ended, then we don't have a next instruction
    if("1" == $(".reactionEnded", displayedState).html()) {
      nextInstruction = "none - the reaction has ended";
    }
    // If pointing off end of string, then next instruction is "ex-end"
    else if((instrPointer < 0) || (instrPointer > (instrPointerString.length - 1))) {
      nextInstruction = "ex-end";
    }
    // See which instruction character we're pointing at
    else {
      var nextSymbol = instrPointerString[instrPointer];
      switch(nextSymbol) {
        case '$':
          nextInstruction = "h-search";
          break;
        case '>':
          nextInstruction = "p-move";
          break;
        case '=':
          nextInstruction = "h-copy";
          break;
        case '^':
          nextInstruction = "p-toggle";
          break;
        case '?':
          nextInstruction = "if-label";
          break;
        case '%':
          nextInstruction = "cleave";
          break;
        case '}':
          nextInstruction = "ex-end";
          break;
        default:
          nextInstruction = "junk";
          break;
      }
    }
    $(".next-instruction", this).html(nextInstruction);
    
    // Render the two strings (with pointers)
    var string1InstrSymbol,
        string2InstrSymbol,
        string1FlowSymbol,
        string2FlowSymbol,
        string1ReadSymbol,
        string2ReadSymbol,
        string1WriteSymbol,
        string2WriteSymbol;
    if(0 == instrToggle) {
      string1InstrSymbol = 'i';
      string2InstrSymbol = 'I';
    }
    else {
      string1InstrSymbol = 'I';
      string2InstrSymbol = 'i';
    }
    if(0 == flowToggle) {
      string1FlowSymbol = 'f';
      string2FlowSymbol = 'F';
    }
    else {
      string1FlowSymbol = 'F';
      string2FlowSymbol = 'f';
    }
    if(0 == readToggle) {
      string1ReadSymbol = 'r';
      string2ReadSymbol = 'R';
    }
    else {
      string1ReadSymbol = 'R';
      string2ReadSymbol = 'r';
    }
    if(0 == writeToggle) {
      string1WriteSymbol = 'w';
      string2WriteSymbol = 'W';
    }
    else {
      string1WriteSymbol = 'W';
      string2WriteSymbol = 'w';
    }
    
    // Make the string canvases
    // NB: Have to set the width+height of a <canvas> in its initialisation HTML, otherwise its transform matrix will be wrong
    //var activeStringCanvas = $('<canvas width="'+this.innerWidth()+'" height="40"></canvas>');
    var boxMarginLeft = 5,
        boxMarginTop = 5,
        textOffsetTop = 1,
        textOffsetLeft = 3,
        boxWidth = 20,
        boxHeight = 20,
        pointerMarginLeft = 6,
        pointerMarginTop = 2;
    // Work out how big each canvas should be
    var canvasActiveWidth  = boxMarginLeft+boxWidth*(string1.length+5),
        canvasPassiveWidth = boxMarginLeft+boxWidth*(string2.length+5),
        canvasHeight = boxMarginTop+5*boxHeight+boxMarginTop;
        
    var activeStringCanvas = $('<canvas width="'+canvasActiveWidth+'" height="'+canvasHeight+'"></canvas>');
    var active_ctx = activeStringCanvas.get(0).getContext("2d");
    
    var passiveStringCanvas = $('<canvas width="'+canvasPassiveWidth+'" height="'+canvasHeight+'"></canvas>');
    var passive_ctx = passiveStringCanvas.get(0).getContext("2d");
    
    // Render the strings
    active_ctx.font         = '20px sans-serif';
    active_ctx.textBaseline = 'top';
	  var xPos = boxMarginLeft;
	  for(c in string1) {
	    active_ctx.fillStyle = "rgb(200,200,200)";
      active_ctx.fillRect(xPos, boxMarginTop, boxWidth, boxHeight);
      active_ctx.fillStyle = '#00f';
      active_ctx.fillText(string1[c], xPos+textOffsetLeft, boxMarginTop+textOffsetTop);
      xPos += boxWidth;
    }
    
    passive_ctx.font         = '20px sans-serif';
    passive_ctx.textBaseline = 'top';
	  var xPos = boxMarginLeft;
	  for(c in string2) {
	    passive_ctx.fillStyle = "rgb(200,200,200)";
      passive_ctx.fillRect(xPos, boxMarginTop, boxWidth, boxHeight);
      passive_ctx.fillStyle    = '#00f';
      passive_ctx.fillText(string2[c], xPos+textOffsetLeft, boxMarginTop+textOffsetTop);
      xPos += boxWidth;
    }
    
    // Render the instruction pointers
    active_ctx.fillStyle    = '#00f';
    active_ctx.fillText(string1InstrSymbol, boxMarginLeft+boxWidth*instr2+pointerMarginLeft, boxMarginTop+  boxHeight+pointerMarginTop);
    active_ctx.fillText(string1FlowSymbol,  boxMarginLeft+boxWidth*flow2+pointerMarginLeft,  boxMarginTop+2*boxHeight+pointerMarginTop);
    active_ctx.fillText(string1ReadSymbol,  boxMarginLeft+boxWidth*read2+pointerMarginLeft,  boxMarginTop+3*boxHeight+pointerMarginTop);
    active_ctx.fillText(string1WriteSymbol, boxMarginLeft+boxWidth*write2+pointerMarginLeft, boxMarginTop+4*boxHeight+pointerMarginTop);

    passive_ctx.fillStyle    = '#00f';
    passive_ctx.fillText(string2InstrSymbol, boxMarginLeft+boxWidth*instr1+pointerMarginLeft, boxMarginTop+  boxHeight+pointerMarginTop);
    passive_ctx.fillText(string2FlowSymbol,  boxMarginLeft+boxWidth*flow1+pointerMarginLeft,  boxMarginTop+2*boxHeight+pointerMarginTop);
    passive_ctx.fillText(string2ReadSymbol,  boxMarginLeft+boxWidth*read1+pointerMarginLeft,  boxMarginTop+3*boxHeight+pointerMarginTop);
    passive_ctx.fillText(string2WriteSymbol, boxMarginLeft+boxWidth*write1+pointerMarginLeft, boxMarginTop+4*boxHeight+pointerMarginTop);
    
    // Render the bind
    var states = $(".reaction-states", this);
    var bindStart1 = parseInt($(".bind-start1", states).html()),
        bindEnd1   = parseInt($(".bind-end1", states).html()),
        bindStart2 = parseInt($(".bind-start2", states).html()),
        bindEnd2   = parseInt($(".bind-end2", states).html());
        
    active_ctx.lineWidth = '3';
    active_ctx.strokeStyle = '#f00';
    active_ctx.strokeRect(boxMarginLeft+bindStart1*boxWidth, boxMarginTop,
                          (bindEnd1-bindStart1)*boxWidth, boxHeight);

    passive_ctx.lineWidth = '3';
    passive_ctx.strokeStyle = '#f00';
    passive_ctx.strokeRect(boxMarginLeft+bindStart2*boxWidth, boxMarginTop,
                           (bindEnd2-bindStart2)*boxWidth, boxHeight);

    // Inject the canvases into the HTML
    $(".active-string", this).html(activeStringCanvas);
    $(".passive-string", this).html(passiveStringCanvas);

    return this;
  };
})(jQuery);

function getNextIteration(reaction) {

  // Get the data for the current iteration
  var currentState = $(".state-info", reaction).last();

  // Call the CGI script to get the next state of the reaction
  $.ajax({
    url: //'../cgi-bin/StringmolWeb_C_Linux.cgi?'+
         'http://www.cs.york.ac.uk/nature/plazzmid/external/RUTSAC11/StringmolWeb/cgi-bin/StringmolWeb_C_Linux.cgi?'+
         'string1=('+$(".stringActive", currentState).html().replace(/&gt;/g, "1")+')&'+
         'string2=('+$(".stringPassive", currentState).html().replace(/&gt;/g, "1")+')&'+
         'instr1=('+$(".instr1", currentState).html()+')&'+
         'instr2=('+$(".instr2", currentState).html()+')&'+
         'flow1=('+$(".flow1", currentState).html()+')&'+
         'flow2=('+$(".flow2", currentState).html()+')&'+
         'read1=('+$(".read1", currentState).html()+')&'+
         'read2=('+$(".read2", currentState).html()+')&'+
         'write1=('+$(".write1", currentState).html()+')&'+
         'write2=('+$(".write2", currentState).html()+')&'+
         'instrToggle=('+$(".instrToggle", currentState).html()+')&'+
         'flowToggle=('+$(".flowToggle", currentState).html()+')&'+
         'readToggle=('+$(".readToggle", currentState).html()+')&'+
         'writeToggle=('+$(".writeToggle", currentState).html()+')',
         
    success: function(response) {
      // Parse out the new state of the reaction
      var regex = /string1=\((.*?)\)&string2=\((.*?)\)&instr1=\((.*?)\)&instr2=\((.*?)\)&flow1=\((.*?)\)&flow2=\((.*?)\)&read1=\((.*?)\)&read2=\((.*?)\)&write1=\((.*?)\)&write2=\((.*?)\)&instrToggle=\((.*?)\)&flowToggle=\((.*?)\)&readToggle=\((.*?)\)&writeToggle=\((.*?)\)&string3=\((.*?)\)&reactionEnded=\((.*?)\).*/;
      var match = regex.exec(response);
      var stringActive = match[1],
          stringPassive = match[2],
          instr1 = match[3],
          instr2 = match[4],
          flow1 = match[5],
          flow2 = match[6],
          read1 = match[7],
          read2 = match[8],
          write1 = match[9],
          write2 = match[10],
          instrToggle = match[11],
          flowToggle = match[12],
          readToggle = match[13],
          writeToggle = match[14],
          string3 = match[15],
          reactionEnded = match[16];
      var currentIteration = parseInt($(".currentIteration", currentState).html())+1;
      
      // Make the new reaction state
      var newStateInfo = $('<div class="state-info">'+
          '<div class="currentIteration">'+currentIteration+'</div>'+
          '<div class="stringActive">'+stringActive+'</div>'+
          '<div class="stringPassive">'+stringPassive+'</div>'+
          '<div class="instr1">'+instr1+'</div>'+
          '<div class="instr2">'+instr2+'</div>'+
          '<div class="flow1">'+flow1+'</div>'+
          '<div class="flow2">'+flow2+'</div>'+
          '<div class="read1">'+read1+'</div>'+
          '<div class="read2">'+read2+'</div>'+
          '<div class="write1">'+write1+'</div>'+
          '<div class="write2">'+write2+'</div>'+
          '<div class="instrToggle">'+instrToggle+'</div>'+
          '<div class="flowToggle">'+flowToggle+'</div>'+
          '<div class="readToggle">'+readToggle+'</div>'+
          '<div class="writeToggle">'+writeToggle+'</div>'+
          '<div class="reactionEnded">'+reactionEnded+'</div>'+
          //'<div class="newStrings"></div>'+
        '</div><!-- state-info -->')
      // Add in the new strings (from previous steps, and from this step)
      newStateInfo.append($(".newStrings", currentState).clone());
      if("" != string3) {
        $(".newStrings", newStateInfo).append($('<div class="newString">'+string3+'</div>'));
      }
      // Write this reaction state to the page
      newStateInfo.appendTo(".reaction-states", reaction);
      
      // Update the control button states
      reaction.enableButtons();
      
      
      // Loop unless reaction has ended
      if((0 == parseInt(reactionEnded)) && (false == stopTwoMol)) {
        twoMolIterating = true;
        setTimeout(function(){ getNextIteration(reaction); }, 10);
      }
      else {
        twoMolIterating = false;
        stopTwoMol = false;
      }
      
      // If the reaction has ended, then remove the loading message
      if(1 == parseInt(reactionEnded)) {
        $(".loading", reaction).html(" ");
      }
    },
    cache: false,
  });

}

function makeTwoMolReaction(string1, string2) {
  reaction = $('<div class="two-mol-reaction">'+
                 '<div class="heading">Reaction <span class="close">x</span></div>'+
                 '<div class="reaction-content">'+
                     // Control buttons
                     '<span class="start button">Start</span>'+
                     '<span class="back button">Back</span>'+
                     '<span class="play button">Play</span>'+
                     '<span class="next button">Next</span>'+
                     '<span class="end button">End</span>'+
                     '<span class="loading"></span>'+
                   '<p class="bindingInfo"></p>'+
                   '<p>Iteration number: <span class="iteration-number"></span></p>'+
                   '<p>Next instruction: <span class="next-instruction"></span></p>'+
                   '<p>Active string: </p><div class="active-string canvas-string"></div>'+
                   '<p>Passive string: </p><div class="passive-string canvas-string"></div>'+
                   '<p>Created strings: <ul class="chem-bag persistent single created-strings"><chemical number="1" string=""></chemical></ul></p>'+
                   '<p>Initial reaction partners: <ul class="chem-bag persistent single">'+
                     '<chemical name="initial string 1" number="1" string="'+string1+'"></chemical>'+
                     '<chemical name="initial string 2" number="1" string="'+string2+'"></chemical>'+
                   '</ul></p>'+
                 '</div><!-- content -->'+
                 '<div class="reaction-states">'+
                   // The current iteration that we are displaying
                   '<div class="displayedIteration">-1</div>'+
                   // State after having just bound
                   '<div class="state-info">'+
                     '<div class="currentIteration">-1</div>'+
                     '<div class="string1">'+string1+'</div>'+
                     '<div class="string2">'+string2+'</div>'+
                   '</div><!-- state-info -->'+
                 '</div><!-- reaction-states -->'+
               '</div><!-- two-mol-reaction -->')
  $("chemical", reaction).makeChemical();
  $(".chem-bag", reaction).setupChemBags();
  $(".chemical", reaction).setupChemicals();
  reaction.setupTwoMolReaction();
  //reaction.renderReaction();
  return reaction;
}
