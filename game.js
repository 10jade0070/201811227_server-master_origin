const uuidv4 = require ('uuid/v4');

module.exports = function(server) {
    
    // 방 정보
    var rooms = [];

    var io = require('socket.io')(server, {
        transports: ['websocket'],//웹소켓으로만 동작하도록 제어함.
    });

    io.on('connection', function(socket){// 클라이언트(socket)가 접속을 했을 때,
        console.log('Connected: ' + socket.id);//socket.id(자동으로 생성되는 임의식별자)


        //---방에 접속했을 때 구현---//
        //---방 참가
        if (rooms.length > 0) {  // 한사람이 접속했을 때,
            var rId = rooms.shift() // shift = 배열에서 첫 번째 요소를 제거하고 이를 반환
            socket.join(rId, function() { // () => 익명함수, function() 과 같음
                socket.emit('joinRoom', { room: rId });
                io.to(rId).emit('startGame'); //---게임시작 
            });
        //---방 생성    
        } else { 
            var roomName = uuidv4(); // 방이 없다면 룸네임을 만들고 조인한다.
            socket.join(roomName, function(){  

                socket.emit('createRoom', { room: roomName });
                rooms.push(roomName); // push = 배열에 값이 추가하고, 배열의 길이를 반환
            });
        }

        socket.on('disconnecting', function(reson){
            console.log('Disconnected: ' + socket.id);

            var socketRooms = Object.keys(socket.rooms).filter(item => item != socket.id);
           
            console.dir(socketRooms);
            //Object.keys : 콜렉션 키값만 가져옴 
            //socket.rooms : 소켓이 속해있는 방의 정보를 가져옴
            //filter(function(item) : 콜렉션 함수에 있는 키값을 하나씩 넣어줌
            
            // var socketRooms = Object.keys(socket.rooms).filter(function(item){
            //         if(item != socket.id) {  //들어온 값이 나와 다르다면 리턴을 해라
            //         return true;
            //         } else {
            //             return false;
            //         }                    
            // });
            // console.dir(socketRooms);
            

            
            //---방 나가기
            socketRooms.forEach(function(room){
                socket.broadcast.to(room).emit('exitRoom');
                // 방에 아무도 없으니 나가세요 라는 메세지 
                // socket.broadcast.emit //본인을 제외한 모든 대상

                // 혼자 만든 방의 유저가 disconnect 되면 해당 방 제거
                var idx = room.indexOf(room);// indexOf가 특정한 값을 못찾으면 -1 을 반환함
                if (idx != -1)
                {
                    rooms.splice(idx, 1); 
                    // 그 방에 인덱스 부터 1개 까지만 지워라 
                    // 누가 있는줄 알고 조인하는거 방지
                }
            });                        
        });
        //---doPlayer
        socket.on('doPlayer', function(playerInfo){

            var roomId = playerInfo.room;
            var cellIndex = playerInfo.position;

            socket.broadcast.to(roomId).emit('doOpponent', {position: cellIndex});
        });


        socket.on('message', function(msg) { //'message'로 클라이언트가 반응함. 
                        
            // console.dir(msg); //dir 해당 객체의 구조를 볼 수 있는 명령어
            socket.broadcast.emit('chat',msg);


        });
    }); 
};
        
/*#region 예제[1] */
        //클라에서 받음
        // socket.on('hi', function(){
        //         console.log('hi~');

                // 클라이언트에게 보냄~
                // socket.emit('hello'); // 각각
                // io.emit('hello'); // 전체
                // socket.broadcast.emit('hello'); // 자신을 제외한 나머지
                /*#endregion */
        