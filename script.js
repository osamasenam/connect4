// *** Main Features *** //
// 1. The board has 6 rows and 7 columns
// 2. Two players take turns selecting a column to drop their checker into
// 3. When a player wins, a message appears to announce the victory
// 4. After a player wins, it is be possible to reset the game and play again
// 5. The gameplay involves animation of checkers falling 

// *** Bonus Features *** //
// 1. After a player wins, visually indicate which four pieces on the board satisfied the victory condition
// 2.?? Allow players to drag their pieces across the screen and drop them into their desired column using their mouse
// 3. Allow players to play using only their keyboard
// 4. The user can enter number of rows & coloumns & connect4Win
// 5.?? Allow a single player to play against the computer

// *** Extra Features *** //
// 1. Each player can choose a color

// ?? console debugging : why removing class does not remove the color property? only in case it is defined on the go using .css() !!!//
// ?? however same flow works if this class is defined inside css file ??
// holes.eq(2).addClass("player1");
// $(".player1").css({"background-color": "black"});
// XwrongX holes.eq(2).removeClass("player1"); >>> keep the class on this element, so you can call it back & change the background color
// $(".player1").css({"background-color": ""});

// 2. Disable clicking during a transition 

var board = $('#board');
var holes;
var overlay = $(".overlay");
var restartButton;
var start = $("#start");


// intiallized variables
var moveTime = 100;
var winnerFlag = false;
var checkerIsMoving = false;
var currentPlayer = "player2";
var currentPlayerMove = "player2Move";


// set as default for mouse control
var selectorr = board; // board or document
var eventt = "click"; // "click" or "keyup"
var keyboardUse = false;

var check4;
var diagonalStep;
var check4Holes;
var check4HolesV = [];
var check4HolesH = [];
var check4HolesDu = [];
var check4HolesDd = [];
var v;
var h;
var dd;
var du;

// create the grid layout
var rowsNum;
var coloumnsNum;
var connect4Win;
var player1Color;
var player2Color;
var currentPlayerColor;

// grab the values entered & draw the layout
start.on("click", function() {
    rowsNum = parseInt($("#rowsNum").val());
    coloumnsNum = parseInt($("#coloumnsNum").val());
    connect4Win = parseInt($("#connect4Win").val());
    
    player1Color = $("#player1Color").val();
    player2Color = $("#player2Color").val();
    currentPlayerColor = player2Color;

    // determine the control method 
    if($("#mouse").prop("checked")) {
        selectorr = board; // board or document
        eventt = "click"; // "click" or "keyup"
        keyboardUse = false;
        
    } else if($("#keyboard").prop("checked")) {
        selectorr = document; // board or document
        eventt = "keyup"; // "click" or "keyup"
        keyboardUse = true;
    }
    // 

    // make sure the user inputs valid numbers
    if(rowsNum>0 && coloumnsNum>0 && connect4Win>0) {
        // remove the overlay 
        overlay.css({"transform": "translateX(100%)"});
        // clear it's html content
        overlay.html("");
        // Draw the wished layout
        board.css({"grid-template-columns": "repeat("+ coloumnsNum +", 100px)", "grid-template-rows": "repeat("+ rowsNum +", 100px)"});
        // ?To Do? slotCount to be removed
        var slotCount = 0;
        for(var i=0; i<coloumnsNum; i++) {
            for(var j=0; j<rowsNum; j++) {
                var htmlAdded = "<div class='slot'><div class='hole'></div></div>";
                // slotCount to show hole number
                // var htmlAdded = "<div class='slot'><div class='hole'>" + slotCount + "</div></div>";
                // drawing the layout slot by slot
                board.append(htmlAdded);
                slotCount++;
            }
        }
        // define the elements after the structure is complete, so all items can be found alive
        holes = $(".hole");
    } else {
        alert("Please input valid values");
    }

    
})

// ?need fix? dragging the checker
// var box1 = $("#box1");
// var box2 = $("#box2");

// box1.on("mousedown", function(evt) { 
//     var mouseX = evt.clientX;
//     var mouseY = evt.clientY;
//     // console.log("mouseX =",mouseX, "mouseY =", mouseY);
//     var boxLeft = mouseX - 40;
//     var boxTop = mouseY - 40;
//     box1.css({"left" : boxLeft + "px"});
//     box1.css({"top" : boxTop + "px"});
// })
// ?need fix? 

// playing with mouse/keyboard
// $(selectorr).on(eventt, function fn(e) {

// ?? needs optimization //
$(document).on("keyup", function(e) {
    if(eventt == "keyup") {
        mainFunc(e);
    }
});

$(board).on("click", function(e) {
    if(eventt == "click") {
        mainFunc(e);
    }
});
// ?? needs optimization //

function mainFunc(e) {

    // to prevent multiple checkers insertion at same time
    if(checkerIsMoving) {
        $(selectorr).off(eventt, mainFunc(e)); 
    }
    
    playerToggle(currentPlayer);


    // if using keyboard 
    if(keyboardUse) {
        clicked_coloumn_keyboard = getColoumnKeyboard(e.key);
        insertChecker(clicked_coloumn_keyboard);
    } else {
        // if using the mouse
        clicked_coloumn = getColoumn(e.target);
        insertChecker(clicked_coloumn);
    }
    

    // for testing //
    // holes.eq(getHole(e.target)).addClass(currentPlayer);

    // $(".player1").css({"background-color": player1Color});
    // $(".player2").css({"background-color": player2Color});

    // to make sure the win check happens after the checker transition is done 
    holes.on("transitionend", function() {
        // To force afterwin() to happen only 1 time
        if(!winnerFlag) {
        
            // win check vertical 
            v = winVertical();
            // win check horizontal
            h = winHorizontal();
            // win check diagonal
            dd = winDiagonalDownward();
            du = winDiagonalUpward();

            if(v || h || dd || du) {
                afterWin();
            }
        }
    })
    
    
}

// this happens after winning
function afterWin() {
    // get the connect4 win holes
    if(v) {
        check4Holes = check4HolesV;
    } else if (h) {
        check4Holes = check4HolesH;
    } else if (du) {
        check4Holes = check4HolesDu;
    } else if (dd) {
        check4Holes = check4HolesDd;
    }
    // highlight the connect4 holes
    for(i= 0; i< check4Holes.length; i++) {
        holes.eq(check4Holes[i]).addClass("check4Move");
    }

    //announce the winner & show restart button
    overlay.css({"transform": "translateX(0)"});
    var htmlAdded1 = "<p>"+ currentPlayer +" wins</p>";
    var htmlAdded2 = "<a href='#' id='restart'>Play Again?</a>";
    overlay.append(htmlAdded1);
    overlay.append(htmlAdded2);
    restartButton = $("#restart");
    //new game restart
    restartButton.on("click", function() {
        location.reload();
    })

}

// returns the exact clicked slot 
function getHole(elem) {
    // loop over each coloumn
    // i = slot number at each coloumn start (does not equal coloumn number!!!)
    for(var i=0; i<= rowsNum*coloumnsNum - rowsNum; i+=rowsNum) {
        // get the slots inside each single coloumn to compare against the clicked one
        for(var j=i; j < i + rowsNum; j++) {
            if(elem === holes[j]) {
                return j;
            }
        } 
    }
}

// returns the slot number at each coloumn start
function getColoumn(elem) {
    // loop over each coloumn
    // i = slot number at each coloumn start (does not equal coloumn number!!!)
    for(var i=0; i<= rowsNum*coloumnsNum - rowsNum; i+=rowsNum) {
        // get the slots inside each single coloumn to compare against the clicked one
        for(var j=i; j < i + rowsNum; j++) {
            if(elem === holes[j]) {
                return i;
            }
        } 
    }
}

function getColoumnKeyboard(key) {
    var arr = [];
    // store the column start values in array
    for(var i=0; i<= rowsNum*coloumnsNum - rowsNum; i+=rowsNum) {
        arr.push(i);
    }
    return arr[parseInt(key)];
}

function playerToggle(pl) {
    currentPlayer = (pl === "player1")? "player2" : "player1";
    currentPlayerMove = (pl === "player1")? "player2Move" : "player1Move";
    currentPlayerColor = (pl === "player1")? player2Color : player1Color;
}

// inserts checker at the first free hole in the selected coloumn
function insertChecker(col) {
    // loop over the coloumn slots from bottom upward
    for(var i=col + rowsNum -1; i >= col ; i--) {
        if(!(holes.eq(i).hasClass("player1") || holes.eq(i).hasClass("player2"))) {
            // do the checker animation
            checkerMove(col,i);
            
            // insert the checker in first empty hole then break
            
            return;   
        } 
    }
    alert("select other coloumn please");
    // toggle twice to keep same player until he playes on the right coloumn
    playerToggle(currentPlayer);
    // console.log("select other coloumn please");
}

// checker animation to appear on each free hole inside the selected coloumn 
function checkerMove(colIndex,elemIndex) {
    checkerIsMoving = true;
    // holes.eq(colIndex).addClass(currentPlayerMove);
    holes.eq(colIndex).css({"background-color": currentPlayerColor});
    colIndex++;
    if (colIndex <= elemIndex) {
        setTimeout(function() {
            checkerMove(colIndex, elemIndex);
            // holes.eq(colIndex-1).removeClass(currentPlayerMove);
            holes.eq(colIndex-1).css({"background-color": ""});
        }, moveTime);
    } else {   
        holes.eq(elemIndex).css({"background-color": ""});
        holes.eq(elemIndex).addClass(currentPlayer);
        $(".player1").css({"background-color": player1Color});
        $(".player2").css({"background-color": player2Color});
        checkerIsMoving = false;
    }
}



function winVertical() {
     // loop over each coloumn
     check4 = 0;
    for(var i=0; i<= rowsNum*coloumnsNum - rowsNum; i+= rowsNum) {
        // check every slot inside this coloumn 
        for(var j=i; j < i + rowsNum; j++) {
            if(holes.eq(j).hasClass(currentPlayer)) {
                check4++;
                check4HolesV.push(j);
            } else {
                // reset counter for non-successive holes
                check4 = 0;
                check4HolesV = [];
            }
            if(check4 === connect4Win) {
                // ?To Do? stop game & announce the winner
                console.log(currentPlayer, "wins vertical");
                winnerFlag = true;
                
                return true;
           }
        } 
    }

}

function winHorizontal() {
    // loop over each row
    check4 = 0;
   for(var i=0; i< rowsNum; i++) {
       // check every slot inside this row 
       for(var j=i; j <= i + rowsNum*coloumnsNum - rowsNum; j+= rowsNum) {
        //    console.log(j);
           if(holes.eq(j).hasClass(currentPlayer)) {
               check4++;
               check4HolesH.push(j);
           } else {
               // reset counter for non-successive holes
               check4 = 0;
               check4HolesH = [];
           }
           if(check4 === connect4Win) {
                // ?To Do? stop game & announce the winner
                console.log(currentPlayer, "wins Horizontal");
                winnerFlag = true;
                return true;
           }
       } 
   }

}

function winDiagonalDownward() {
    // loop over each coloumn
    for(var i=0; i<= rowsNum*coloumnsNum - rowsNum; i+=rowsNum) {
        // get the slots inside each single coloumn 
        for(var j=i; j < i + rowsNum; j++) {
            check4 = 0;
            diagonalStep = rowsNum +1;
            // loop over all downward diagonal elements for this hole(item number j)
            for(var k= j; k< rowsNum*coloumnsNum; k+= diagonalStep) { 
                if(holes.eq(k).hasClass(currentPlayer)) {
                    check4++;
                    check4HolesDd.push(k);
                } else {
                    check4 = 0;
                    check4HolesDd = [];
                }
                if(check4 === connect4Win) {
                    // ?To Do? stop game & announce the winner
                    console.log(currentPlayer, "wins Diagonal Downward");
                    winnerFlag = true;
                    return true;
               }
                // break this loop once diagonal end is reached
                var colFlag = getColoumn(holes[k]);
                var colFlagNext = getColoumn(holes[k + diagonalStep]);
                // check if the next hole lies in a successive coloumn
                if(!(colFlagNext-colFlag === rowsNum)) {
                    break;
                } 
            }
        } 
    }

}


function winDiagonalUpward() {
    // loop over each coloumn
    for(var i=0; i<= rowsNum*coloumnsNum - rowsNum; i+=rowsNum) {
        // get the slots inside each single coloumn 
        for(var j=i; j < i + rowsNum; j++) {
            check4 = 0;
            diagonalStep = rowsNum - 1;
            // loop over all upward diagonal elements for this hole(item number j)
            for(var k= j; k< rowsNum*coloumnsNum; k+= diagonalStep) { 
                if(holes.eq(k).hasClass(currentPlayer)) {
                    check4++;
                    check4HolesDu.push(k);
                } else {
                    check4 = 0;
                    check4HolesDu = [];
                }
                if(check4 === connect4Win) {
                    // ?To Do? stop game & announce the winner
                    console.log(currentPlayer, "wins Diagonal Upward");
                    winnerFlag = true;
                    return true;
               }
                // break this loop once diagonal end is reached
                var colFlag = getColoumn(holes[k]);
                var colFlagNext = getColoumn(holes[k + diagonalStep]);
                // check if the next hole lies in a successive coloumn
                if(!(colFlagNext-colFlag === rowsNum)) {
                    break;
                } 
            }
        } 
    }

}