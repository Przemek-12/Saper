window.addEventListener('load', ()=>{

    //visible change difficulty menu
    var visibleMenu=false;

    //number of all elements, used in mines function, game won
    var elementsCount=100;
    //two-dimensional list of all elements
    var allElementsList=[];
   
    //list of elements with mines
    var amountOfMines=10;
    var minesList=[];

    //map of elements around mines with amount of mines around them
    var elementsAroundMines = new Map();

    //list of elements that are already uncovered, used to disable event listener
    var uncoveredList=[];

    //list of elements marked with flags
    var flagList = [];

    //boolean for first click, after first click mines are put into grid
    var firstClick=false;
    //boolean that says if game is over on blocks events
    var gameOver=false;
    
    //variable used to set proper difficulty string when pressing tryAgainbtn
    var difficulty='easy';



    document.getElementById('ham').addEventListener('click',()=>{
        if(visibleMenu===false && gameOver===false){
            visibleMenu=true;
            document.getElementById('hamList').style.transform='translateY(+100%)';
        }
        else if(visibleMenu===true && gameOver===false){
            visibleMenu=false;
            document.getElementById('hamList').style.transform='translateY(0%)';
        }
    });


    document.getElementById('easy').addEventListener('click',()=>{
        if(gameOver===false){
        setDifficulty('easy');
        }
    });
    document.getElementById('normal').addEventListener('click',()=>{
        if(gameOver===false){
        setDifficulty('normal');
        }
    });
    document.getElementById('hard').addEventListener('click',()=>{
        if(gameOver===false){
        setDifficulty('hard');
        }
    });

    setDifficulty('easy');


    //set proper data for each difficulty
    function setDifficulty(dif){
        if(dif==='easy'){
            elementsAroundMines.clear();
            clear();
                amountOfMines=10;
                elementsCount=100;
                difficulty='easy';
                drawGame(100, '50vw', '80vh', '10%', '10%', 10, 10);
        }
        if(dif==='normal'){
            elementsAroundMines.clear();
            clear();
                amountOfMines=38;
                elementsCount=240;
                difficulty='normal';
                drawGame(240, '65vw', '80vh', '5%', '8.33333%', 12, 20);
        }
        if(dif==='hard'){
            elementsAroundMines.clear();
            clear();
                amountOfMines=90;
                elementsCount=500;
                difficulty='hard';
                drawGame(500, '80vw', '80vh', '4%', '5%', 20, 25);     
        }
    }


    //drawing grid, initializing game after clicks, underDivs listeners
    function drawGame(count, containerWidth, containerHeight, elementWidth, elementHeight, first, second){

            document.getElementById('container').style.width=containerWidth;
            document.getElementById('container').style.height=containerHeight;

            var counter=0;//elements in container

            //push all elements into two dimensional list
            for(var i=0;i<first;i++){
                //second dimension list
                var innerList=[];
                for(var k=0;k<second;k++){
                    innerList.push(counter);
                    counter++;
                }
                allElementsList.push(innerList);
                innerList=[];
            }


            //creating elements
            for(var t=0;t<count;t++){
                var underDiv = document.createElement('div');
                underDiv.style.width=elementWidth;
                underDiv.style.height=elementHeight;
                underDiv.id='underDiv'+t.toString();
                underDiv.className='underDiv';
                var parent = document.getElementById('container');
                parent.appendChild(underDiv);
            }


            //Eventlisteners to all elements after click
            document.querySelectorAll('.underDiv').forEach(item=>{
               
                $(item).on('mousedown', event=> { 
                    var itemId = parseInt(item.id.split('underDiv').pop());

                    if (event.button === 0 && !flagList.includes(itemId)) {
                        console.log("uncovered"+uncoveredList.length)
                        if(gameOver===false && !uncoveredList.includes(itemId)){
                            if(firstClick===false){
                                firstClick=true;
                                timer();
                                mines(itemId);                           
                                game(itemId);  
                            }
                            else if(minesList.includes(itemId)){
                                gameOver=true;
                                gameLost(itemId);
                            }
                            else if(uncoveredList.length===elementsCount-(amountOfMines+1)){
                                gameOver=true;
                                gameWon();
                            }
                            else{
                                game(itemId);
                            }
                        }
                    }
                    if (event.button === 1 && gameOver===false && !uncoveredList.includes(itemId)) {
                        if(!flagList.includes(itemId)){
                            item.style.backgroundColor='red';
                            flagList.push(itemId);   
                        }
                        else if(uncoveredList.length===elementsCount-(amountOfMines+1)){
                            gameOver=true;
                            gameWon();
                        }
                        else{
                            item.style.backgroundColor=null;
                            flagList.pop(itemId);
                        }
                        console.log(flagList);
                     }


                 });


            });

    }


    //putting mines into list
    function mines(itemId){  

        //mines into minesList
            while(minesList.length<amountOfMines){
                var random = Math.floor(Math.random()*elementsCount);
                if(!minesList.includes(random) && itemId!==random){
                    minesList.push(random);
                }
            }
        
        //put mines neighbours to elementsAroundMines
            for(var t=0;t<allElementsList.length;t++){
                for(var u=0;u<allElementsList[t].length;u++){
                    if(minesList.includes(allElementsList[t][u])){

                        minesStatements(t,u-1);
                        minesStatements(t,u+1);
                        minesStatements(t-1,u-1);
                        minesStatements(t-1,u);
                        minesStatements(t-1,u+1);
                        minesStatements(t+1,u-1);
                        minesStatements(t+1,u);
                        minesStatements(t+1,u+1);

                    }
                }
            }
               
            function minesStatements(t,u){
                if(allElementsList[t] && allElementsList[t][u]!==undefined){
                    compare(allElementsList[t][u]); 
                }
            }

            //function that checks if element around mine already exists in map and sets new value if it does
            function compare(key){
                if(elementsAroundMines.has(key)){
                    var i=elementsAroundMines.get(key);
                    console.log(i);
                    elementsAroundMines.set(key,i+1);
                }
                else{
                    elementsAroundMines.set(key,1);
                }
            }

            //console.log(minesList);
            //console.log(elementsAroundMines);
    }


    //when game is started
    function game(item){

        //list of elements that are noeighbours to clicked element, their naighbours also have to be checked
        //after click if element is empty it is added to neighbourList, then elements thar are neighbours are added 
        //if elements are empty, they are revealed
        var neighbourList=[];
        //elements from neighbourList are put into loop function and then added to checked elements
        var checkedElements=[];
        var listOfNeighboursThatAreAroundMines=[];
        
        //loop for first element
        loop(item);

        //function that checks neighbours of elements
        function loop(item2){

                        for(var t=0;t<allElementsList.length;t++){
                            for(var u=0;u<allElementsList[t].length;u++){

                                //when element that was clicked has a number
                                if(allElementsList[t][u]===item2 && elementsAroundMines.has(item2) && !flagList.includes(item2)){
                                    document.getElementById('underDiv'+(allElementsList[t][u]).toString()).innerHTML=elementsAroundMines.get(allElementsList[t][u]);
                                    listOfNeighboursThatAreAroundMines.push(item2);

                                    if(allElementsList[t] && allElementsList[t][u]!==undefined && !uncoveredList.includes(allElementsList[t][u]) && !minesList.includes(allElementsList[t][u])){
                                        uncoveredList.push(allElementsList[t][u]);
                                    }
                                }
                                //if element has no number
                                else if(allElementsList[t][u]===item2 && !flagList.includes(item2)){
                                    neighbourList.push(item2)

                                    gameStatements(t,u);
                                    gameStatements(t,u-1);
                                    gameStatements(t,u+1);
                                    gameStatements(t-1,u-1);
                                    gameStatements(t-1,u);
                                    gameStatements(t-1,u+1);
                                    gameStatements(t+1,u-1);
                                    gameStatements(t+1,u);
                                    gameStatements(t+1,u+1);

                                }
                                
                            }
                        }    
        }


        function gameStatements(t,u){

            if( allElementsList[t] && allElementsList[t][u]!==undefined && !neighbourList.includes(allElementsList[t][u]) 
                    && !minesList.includes(allElementsList[t][u]) && !elementsAroundMines.has(allElementsList[t][u]) && !flagList.includes(allElementsList[t][u])){

                neighbourList.push(allElementsList[t][u]);
            }

            if( allElementsList[t] && allElementsList[t][u]!==undefined && elementsAroundMines.has(allElementsList[t][u]) 
                    && !minesList.includes(allElementsList[t][u]) && !flagList.includes(allElementsList[t][u])){

                listOfNeighboursThatAreAroundMines.push(allElementsList[t][u]);
            }

            if( allElementsList[t] && allElementsList[t][u]!==undefined && elementsAroundMines.has(allElementsList[t][u]) 
                    && !minesList.includes(allElementsList[t][u]) && !flagList.includes(allElementsList[t][u])){

                document.getElementById('underDiv'+(allElementsList[t][u]).toString()).innerHTML=elementsAroundMines.get(allElementsList[t][u]);
            }

            if(allElementsList[t] && allElementsList[t][u]!==undefined && !uncoveredList.includes(allElementsList[t][u]) && !minesList.includes(allElementsList[t][u]) 
                    && !flagList.includes(allElementsList[t][u])){
                        
                uncoveredList.push(allElementsList[t][u]);
            }
        }
        

        var k=0;
        while(k<neighbourList.length){
            
            neighbourList.forEach((it)=>{  
                //console.log(checkedElements);
                //console.log(neighbourList);
                if(!checkedElements.includes(it)){
                    checkedElements.push(it);
                    loop(it);
                }
                
            });
            k++;
        }

        neighbourList.forEach((it)=>{  
            document.getElementById('underDiv'+it.toString()).style.backgroundColor='lightblue';
        });
        listOfNeighboursThatAreAroundMines.forEach((ite)=>{  
            document.getElementById('underDiv'+ite.toString()).style.backgroundColor='lightblue';
        });

        

        neighbourList=[];
        checkedElements=[];
        listOfNeighboursThatAreAroundMines=[];

    }


    //displaying game lost and reset of vars
    function gameLost(itemId){

        document.getElementById('underDiv'+itemId.toString()).style.backgroundColor='green';
        minesList.splice(minesList.indexOf(itemId),1);

        minesList.forEach(id=>{

            setTimeout(()=>{
                document.getElementById('underDiv'+id.toString()).style.backgroundColor='green';
            },(minesList.indexOf(id)+1)*500)
            
        });

        setTimeout(()=>{

            document.getElementById('lostGameDivContainer').style.display='flex';
            document.getElementById('tryAgainBtn').addEventListener('click', ()=>{
            setDifficulty(difficulty);
            document.getElementById('lostGameDivContainer').style.display='none';
            })

        },(minesList.length+2)*500);

    }


    //displaying game won and reset of vars
    function gameWon(){
        
        setTimeout(()=>{

            document.getElementById('wonGameDivContainer').style.display='flex';
            document.getElementById('playAgainBtn').addEventListener('click', ()=>{
            setDifficulty(difficulty);
            document.getElementById('wonGameDivContainer').style.display='none';
            })

        },500);

    }


    function timer(){
        var minutesDiv = document.getElementById('minutes');
        var secondsDiv = document.getElementById('seconds');
        var minutes=0;
        var seconds=0;

        displayTime();
        function displayTime(){

            if(gameOver===false && firstClick===true){

                if(seconds<10){
                    secondsDiv.innerHTML='0'+seconds;
                }
                else{
                    secondsDiv.innerHTML=seconds;
                }
                if(seconds===60){
                    secondsDiv.innerHTML='00';
                    seconds=0;
                    minutes++;
                    if(minutes<10){
                        minutesDiv.innerHTML='0'+minutes;
                    }
                    else{
                        minutesDiv.innerHTML=minutes
                    }
                }
               
                seconds++;
                setTimeout(()=>{          
                    displayTime();
                },1000);

            }

        }

    }


    //clearing data after switching difficulty, try again
    function clear(){
        allElementsList=[];
        minesList=[];
        uncoveredList=[];
        flagList=[];
        elementsAroundMines.clear();
        firstClick=false;
        gameOver=false;
        document.getElementById('minutes').innerHTML='00';
        document.getElementById('seconds').innerHTML='00';
        document.querySelectorAll('.underDiv').forEach(item=>{
            item.parentNode.removeChild(item);
        });
    }

});